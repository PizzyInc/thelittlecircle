import React, { useEffect, useRef, useState } from "react";

const SIZE = 56;
const MARGIN = 16;
const TAP_MAX_MS = 250;
const TAP_MAX_PX = 6;
const API_URL = "https://thelittlecircle.com/api/detect";

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

const STATE_STYLES = {
  idle: {
    bg: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
    shadow: "0 6px 28px rgba(255,180,150,0.55), inset 0 -3px 10px rgba(255,150,120,0.25), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleIdleBreathe 3s ease-in-out infinite",
    eyeW: 11, eyeH: 11, pupilW: 7,
  },
  analyzing: {
    bg: "linear-gradient(145deg, #e0eaff 0%, #c8d8ff 100%)",
    shadow: "0 6px 32px rgba(100,140,255,0.55), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleScanPulse 1.2s ease-in-out infinite",
    eyeW: 12, eyeH: 12, pupilW: 6,
  },
  ai: {
    bg: "linear-gradient(145deg, #ffe0c8 0%, #ffcca0 100%)",
    shadow: "0 6px 36px rgba(255,150,80,0.65), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleAIWiggle 0.4s ease-in-out infinite",
    eyeW: 14, eyeH: 14, pupilW: 8,
  },
  real: {
    bg: "linear-gradient(145deg, #d4f5e4 0%, #b0ecc8 100%)",
    shadow: "0 6px 30px rgba(80,200,140,0.55), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleRealBounce 0.6s ease-out",
    eyeW: 11, eyeH: 11, pupilW: 7,
  },
  fake: {
    bg: "linear-gradient(145deg, #fee2e2 0%, #fca5a5 100%)",
    shadow: "0 6px 36px rgba(220,38,38,0.55), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleAIWiggle 0.5s ease-in-out infinite",
    eyeW: 13, eyeH: 13, pupilW: 7,
  },
} as const;

type State = keyof typeof STATE_STYLES;
interface VerdictBubble {
  verdict: "ai" | "real" | "fake" | "info";
  confidence?: number;
  message?: string;
}

function getStorage<T>(key: string, fallback: T): Promise<T> {
  return new Promise((res) => {
    try {
      if (!chrome?.storage?.local) { res(fallback); return; }
      chrome.storage.local.get(key, (result) => res((result[key] as T) ?? fallback));
    } catch { res(fallback); }
  });
}

function setStorage(key: string, value: unknown) {
  try { chrome?.storage?.local?.set({ [key]: value }); } catch {}
}

async function extractContent(cx: number, cy: number): Promise<{
  type: "text" | "image";
  content: string;
  el: HTMLElement | null;
}> {
  // 1. Image at cursor position? Use elementsFromPoint to pierce through the shadow host.
  const allEls = document.elementsFromPoint(cx, cy);
  const hitEl = allEls.find((el) => el.id !== "tlc-shadow-host") ?? null;
  if (hitEl) {
    const imgEl =
      hitEl.tagName === "IMG"
        ? (hitEl as HTMLImageElement)
        : (hitEl.closest("img") as HTMLImageElement | null);
    if (imgEl?.src && /^https?:/.test(imgEl.src)) {
      try {
        const res = await fetch(imgEl.src, { signal: AbortSignal.timeout(6000) });
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return { type: "image", content: base64, el: imgEl };
      } catch { /* fall through to text */ }
    }
  }

  // 2. Pull main content text — prefer article/main over full body
  const container = (
    document.querySelector("article") ??
    document.querySelector('[role="main"]') ??
    document.querySelector("main") ??
    document.body
  ) as HTMLElement;

  const paras = Array.from(
    container.querySelectorAll("p, h1, h2, h3, li, blockquote, td")
  )
    .map((e) => (e as HTMLElement).innerText?.replace(/\s+/g, " ").trim())
    .filter((t): t is string => !!t && t.length > 40);

  let text = paras.join(" ");
  if (text.length < 100) {
    text = container.innerText.replace(/\s+/g, " ").trim();
  }

  return { type: "text", content: text.slice(0, 3000), el: container };
}

export default function FloatingCircle() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<State>("idle");
  const [dragging, setDragging] = useState(false);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blinkEye, setBlinkEye] = useState(false);
  const [bubble, setBubble] = useState<VerdictBubble | null>(null);
  const [active, setActive] = useState(true);
  const [circleName, setCircleName] = useState("Circle");
  const [isPro, setIsPro] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [plan, setPlan] = useState("free");

  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });
  const pointerDownTime = useRef(0);
  const hasMoved = useRef(false);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightedEl = useRef<Element | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const scanningRef = useRef(false); // mutex — prevents duplicate scans

  // Load settings from chrome.storage
  useEffect(() => {
    Promise.all([
      getStorage<{ x: number; y: number } | null>("tlc_pos", null),
      getStorage<boolean>("tlc_active", true),
      getStorage<string>("tlc_name", "Circle"),
      getStorage<string>("tlc_plan", "free"),
      getStorage<string | null>("tlc_token", null),
    ]).then(([savedPos, savedActive, savedName, savedPlan, token]) => {
      setPos(savedPos ?? { x: window.innerWidth - SIZE - 24, y: window.innerHeight - SIZE - 80 });
      setActive(savedActive);
      setCircleName(savedName);
      setPlan(savedPlan);
      setIsPro(savedPlan === "pro" || savedPlan === "family");
      setAuthToken(token);
    });

    // Listen for storage changes (from popup or bridge)
    const onChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.tlc_active) setActive(changes.tlc_active.newValue);
      if (changes.tlc_name) setCircleName(changes.tlc_name.newValue);
      if (changes.tlc_plan) {
        const p = changes.tlc_plan.newValue as string;
        setPlan(p);
        setIsPro(p === "pro" || p === "family");
      }
      if (changes.tlc_token) setAuthToken(changes.tlc_token.newValue);
    };
    try { chrome?.storage?.onChanged?.addListener(onChange); } catch {}
    return () => { try { chrome?.storage?.onChanged?.removeListener(onChange); } catch {} };
  }, []);

  useEffect(() => {
    if (pos) setStorage("tlc_pos", pos);
  }, [pos]);

  // Mouse tracking
  useEffect(() => {
    if (state === "analyzing" || state === "ai") return;
    function onMouseMove(e: MouseEvent) {
      if (!circleRef.current || dragging) return;
      const rect = circleRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(3, Math.hypot(e.clientX - cx, e.clientY - cy) / 40);
      setPupil({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [state, dragging]);

  // Idle blink
  useEffect(() => {
    if (state !== "idle") return;
    const id = setInterval(() => {
      setBlinkEye(true);
      setTimeout(() => setBlinkEye(false), 160);
    }, 3800 + Math.random() * 1200);
    return () => clearInterval(id);
  }, [state]);

  // Scroll tracking
  useEffect(() => {
    if (state === "analyzing" || state === "ai") return;
    let last = window.scrollY;
    let timer: ReturnType<typeof setTimeout>;
    function onScroll() {
      const cur = window.scrollY;
      setPupil({ x: 0, y: cur > last ? 2 : -2 });
      last = cur;
      clearTimeout(timer);
      timer = setTimeout(() => setPupil({ x: 0, y: 0 }), 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [state]);

  // Voice — Pro only
  useEffect(() => {
    if (!active || !isPro) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    let recognition: any;
    let restartTimer: ReturnType<typeof setTimeout>;

    function start() {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onstart = () => setVoiceListening(true);
      recognition.onend = () => { setVoiceListening(false); restartTimer = setTimeout(start, 1200); };
      recognition.onerror = () => { setVoiceListening(false); restartTimer = setTimeout(start, 3000); };
      recognition.onresult = (e: any) => {
        const last = e.results[e.results.length - 1];
        if (!last.isFinal) return;
        const transcript: string = last[0].transcript.toLowerCase().trim();
        if (transcript.includes(circleName.toLowerCase())) {
          recognition.stop();
          handleDetect(true);
        }
      };
      try { recognition.start(); } catch {}
    }

    start();
    return () => { clearTimeout(restartTimer); try { recognition?.abort(); } catch {} setVoiceListening(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isPro, circleName]);

  function speak(verdict: "ai" | "real" | "fake", confidence: number) {
    if (!("speechSynthesis" in window)) return;
    const variants =
      verdict === "ai"
        ? [`AI. ${confidence}% confidence.`, `AI generated. ${confidence}% certain.`]
        : verdict === "fake"
        ? [`Fake. ${confidence}% confidence.`, `Fake content. ${confidence}% certain.`]
        : [`Real. ${confidence}% confidence.`, `That's real. ${confidence}% certain.`];
    const u = new SpeechSynthesisUtterance(variants[Math.floor(Math.random() * variants.length)]);
    u.rate = 0.97; u.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function removeHighlight() {
    if (highlightedEl.current) {
      (highlightedEl.current as HTMLElement).style.outline = "";
      (highlightedEl.current as HTMLElement).style.outlineOffset = "";
      highlightedEl.current = null;
    }
  }

  async function handleDetect(fromVoice = false) {
    if (scanningRef.current || !pos) return;
    scanningRef.current = true;

    // Safety net: if anything hangs, always reset after 20s
    const safetyTimer = setTimeout(() => {
      scanningRef.current = false;
      setState("idle");
      setBubble({ verdict: "info", message: "Timed out — try again" });
      setTimeout(() => setBubble(null), 4000);
    }, 20000);

    const cx = pos.x + SIZE / 2;
    const cy = pos.y + SIZE / 2;

    setState("analyzing");

    const { type, content, el } = await extractContent(cx, cy);

    if (type === "text" && content.length < 250) {
      clearTimeout(safetyTimer);
      setState("idle");
      scanningRef.current = false;
      setBubble({ verdict: "info", message: "Not enough text to scan" });
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setBubble(null), 3000);
      return;
    }

    if (el) {
      el.style.outline = "2px solid rgba(100, 140, 255, 0.55)";
      el.style.outlineOffset = "6px";
      highlightedEl.current = el;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ type, content, plan }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      removeHighlight();
      let data: Record<string, unknown>;
      try { data = await res.json(); } catch { throw new Error("server error"); }
      if (!res.ok) throw new Error((data.error as string) ?? `server error ${res.status}`);

      clearTimeout(safetyTimer);
      const verdict = data.verdict as "ai" | "real" | "fake";
      setState(verdict);
      setBubble({ verdict, confidence: data.confidence });
      if (fromVoice) speak(verdict, data.confidence);

      if (stateTimer.current) clearTimeout(stateTimer.current);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      stateTimer.current = setTimeout(() => { setState("idle"); scanningRef.current = false; }, 8000);
      bubbleTimer.current = setTimeout(() => setBubble(null), 5000);
    } catch (err) {
      clearTimeout(safetyTimer);
      clearTimeout(timeoutId);
      removeHighlight();
      setState("idle");
      scanningRef.current = false;
      const isAbort = err instanceof Error && err.name === "AbortError";
      if (!isAbort) console.warn("[TLC] detection error:", err);
      setBubble({ verdict: "info", message: isAbort ? "Timed out — try again" : "Couldn't connect — try again" });
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setBubble(null), 4000);
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!pos) return;
    hasMoved.current = false;
    pointerDownTime.current = Date.now();
    dragStart.current = { mx: e.clientX, my: e.clientY, bx: pos.x, by: pos.y };
    setDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !pos) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > TAP_MAX_PX || Math.abs(dy) > TAP_MAX_PX) hasMoved.current = true;
    setPos({
      x: clamp(dragStart.current.bx + dx, MARGIN, window.innerWidth - SIZE - MARGIN),
      y: clamp(dragStart.current.by + dy, MARGIN, window.innerHeight - SIZE - MARGIN),
    });
    setPupil({ x: clamp(dx / 30, -2.5, 2.5), y: clamp(dy / 30, -2.5, 2.5) });
    e.stopPropagation();
  }

  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    const elapsed = Date.now() - pointerDownTime.current;
    e.stopPropagation();
    if (!hasMoved.current && elapsed < TAP_MAX_MS) {
      if (state === "ai" || state === "real" || state === "fake") {
        setState("idle");
        scanningRef.current = false;
        setBubble(null);
        removeHighlight();
      } else {
        handleDetect(false);
      }
    }
  }

  if (!pos || !active) return null;

  const s = STATE_STYLES[state];
  const isAnalyzing = state === "analyzing";
  const showMouth = state === "ai" || state === "real" || state === "fake";
  const eyeScaleY = blinkEye && state === "idle" ? 0.1 : 1;
  const bubbleAbove = pos.y > window.innerHeight * 0.45;
  const bubbleAlignRight = pos.x + SIZE / 2 > window.innerWidth * 0.5;

  return (
    <div
      ref={circleRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        zIndex: 2147483647,
        cursor: dragging ? "grabbing" : "pointer",
        userSelect: "none",
        touchAction: "none",
        pointerEvents: "auto",
      }}
    >
      {bubble && (
        <div style={{
          position: "absolute",
          [bubbleAbove ? "bottom" : "top"]: SIZE + 10,
          [bubbleAlignRight ? "right" : "left"]: 0,
          animation: "verdictBubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
          zIndex: 2147483647,
          pointerEvents: "none",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 13px",
            borderRadius: 20,
            background: bubble.verdict === "ai"
              ? "rgba(255,100,30,0.92)"
              : bubble.verdict === "real"
              ? "rgba(40,180,100,0.92)"
              : bubble.verdict === "fake"
              ? "rgba(220,38,38,0.92)"
              : "rgba(80,80,100,0.88)",
            backdropFilter: "blur(8px)",
            boxShadow: bubble.verdict === "ai"
              ? "0 4px 20px rgba(255,100,30,0.4)"
              : bubble.verdict === "real"
              ? "0 4px 20px rgba(40,180,100,0.4)"
              : bubble.verdict === "fake"
              ? "0 4px 20px rgba(220,38,38,0.4)"
              : "0 4px 16px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 14 }}>
              {bubble.verdict === "ai" ? "🤖" : bubble.verdict === "real" ? "✅" : bubble.verdict === "fake" ? "⚠️" : "🔍"}
            </span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
              {bubble.verdict === "info"
                ? bubble.message
                : bubble.verdict === "ai"
                ? "AI"
                : bubble.verdict === "fake"
                ? "Fake"
                : "Real"}
            </span>
            {bubble.verdict !== "info" && bubble.confidence !== undefined && (
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "1px 6px" }}>
                {bubble.confidence}%
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: s.bg, boxShadow: s.shadow,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: s.anim,
        transition: "background 0.4s ease, box-shadow 0.4s ease",
        position: "relative",
      }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          {[0, 1].map((i) => (
            <div key={i} style={{
              width: s.eyeW, height: s.eyeH, background: "#fff", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scaleY(${isAnalyzing ? 1 : eyeScaleY})`,
              transition: "transform 0.08s ease", overflow: "hidden",
            }}>
              <div style={{
                width: s.pupilW, height: s.pupilW, background: "#2c2c2c", borderRadius: "50%",
                position: "relative",
                transform: isAnalyzing ? undefined : `translate(${pupil.x}px, ${pupil.y}px)`,
                animation: isAnalyzing ? "circlePupilLook 1.2s ease-in-out infinite" : undefined,
                transition: isAnalyzing ? undefined : "transform 0.1s ease",
                flexShrink: 0,
              }}>
                <span style={{
                  position: "absolute",
                  width: Math.round(s.pupilW * 0.38), height: Math.round(s.pupilW * 0.38),
                  background: "rgba(255,255,255,0.85)", borderRadius: "50%",
                  top: "18%", left: "18%",
                }} />
              </div>
            </div>
          ))}
        </div>

        {showMouth && (
          <div style={{ marginTop: 4 }}>
            {state === "real"
              ? <div style={{ width: 14, height: 7, border: "2.5px solid #2c2c2c", borderTop: "none", borderRadius: "0 0 14px 14px" }} />
              : state === "fake"
              ? <div style={{ width: 10, height: 5, border: "2.5px solid #2c2c2c", borderBottom: "none", borderRadius: "14px 14px 0 0" }} />
              : <div style={{ width: 7, height: 5, background: "#2c2c2c", borderRadius: "50%" }} />
            }
          </div>
        )}

        {voiceListening && state === "idle" && (
          <span style={{
            position: "absolute", bottom: 7, right: 7,
            width: 6, height: 6, borderRadius: "50%",
            background: "#38bdf8", boxShadow: "0 0 6px rgba(56,189,248,0.8)",
            animation: "circleIdleBreathe 1.2s ease-in-out infinite",
          }} />
        )}
      </div>
    </div>
  );
}
