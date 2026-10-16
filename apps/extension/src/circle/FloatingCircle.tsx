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
} as const;

type State = keyof typeof STATE_STYLES;
interface VerdictBubble { verdict: "ai" | "real"; confidence: number }

function getStorage<T>(key: string, fallback: T): Promise<T> {
  return new Promise((res) => {
    chrome.storage.local.get(key, (result) => res((result[key] as T) ?? fallback));
  });
}

function setStorage(key: string, value: unknown) {
  chrome.storage.local.set({ [key]: value });
}

function findScanTarget(cx: number, cy: number): { el: Element | null; text: string } {
  const SEL = "p, h1, h2, h3, li, blockquote, article, td, [data-content]";
  const offsets = [[0, -90], [0, 90], [-90, 0], [90, 0], [0, -160], [0, 160]];
  for (const [dx, dy] of offsets) {
    const hit = document.elementFromPoint(cx + dx, cy + dy);
    if (!hit) continue;
    const el = (hit.closest(SEL) ?? hit) as HTMLElement;
    const text = (el as HTMLElement).innerText?.replace(/\s+/g, " ").trim() ?? "";
    if (text.length >= 50) return { el, text };
  }
  const center = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
  const main = (center?.closest("main") ?? document.querySelector("main") ?? document.body) as HTMLElement;
  return { el: main, text: main.innerText.replace(/\s+/g, " ").trim() };
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

  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });
  const pointerDownTime = useRef(0);
  const hasMoved = useRef(false);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightedEl = useRef<Element | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  // Load settings from chrome.storage
  useEffect(() => {
    Promise.all([
      getStorage<{ x: number; y: number } | null>("tlc_pos", null),
      getStorage<boolean>("tlc_active", true),
      getStorage<string>("tlc_name", "Circle"),
      getStorage<string>("tlc_plan", "free"),
      getStorage<string | null>("tlc_token", null),
    ]).then(([savedPos, savedActive, savedName, plan, token]) => {
      setPos(savedPos ?? { x: window.innerWidth - SIZE - 24, y: window.innerHeight - SIZE - 80 });
      setActive(savedActive);
      setCircleName(savedName);
      setIsPro(plan === "pro" || plan === "family");
      setAuthToken(token);
    });

    // Listen for storage changes (from popup)
    const onChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.tlc_active) setActive(changes.tlc_active.newValue);
      if (changes.tlc_name) setCircleName(changes.tlc_name.newValue);
      if (changes.tlc_plan) setIsPro(["pro", "family"].includes(changes.tlc_plan.newValue));
      if (changes.tlc_token) setAuthToken(changes.tlc_token.newValue);
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
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

  function speak(verdict: "ai" | "real", confidence: number) {
    if (!("speechSynthesis" in window)) return;
    const variants = verdict === "ai"
      ? [`Looks AI-generated — ${confidence}% sure.`, `I'm detecting AI here. About ${confidence}% confident.`]
      : [`This looks real. ${confidence}% confident.`, `Seems genuine to me — around ${confidence}%.`];
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
    if (state === "analyzing" || !pos) return;
    const cx = pos.x + SIZE / 2;
    const cy = pos.y + SIZE / 2;
    const { el, text } = findScanTarget(cx, cy);
    if (text.length < 50) return;

    if (el) {
      (el as HTMLElement).style.outline = "2px solid rgba(100, 140, 255, 0.55)";
      (el as HTMLElement).style.outlineOffset = "6px";
      highlightedEl.current = el;
    }

    setState("analyzing");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "text", content: text.slice(0, 3000) }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      removeHighlight();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");

      const verdict = data.verdict as "ai" | "real";
      setState(verdict);
      setBubble({ verdict, confidence: data.confidence });
      if (fromVoice) speak(verdict, data.confidence);

      if (stateTimer.current) clearTimeout(stateTimer.current);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      stateTimer.current = setTimeout(() => setState("idle"), 8000);
      bubbleTimer.current = setTimeout(() => setBubble(null), 5000);
    } catch (err) {
      clearTimeout(timeoutId);
      removeHighlight();
      setState("idle");
      if (!(err instanceof Error && err.name === "AbortError")) console.warn("[TLC] detection error:", err);
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
      if (state === "ai" || state === "real") {
        setState("idle"); setBubble(null); removeHighlight();
      } else {
        handleDetect(false);
      }
    }
  }

  if (!pos || !active) return null;

  const s = STATE_STYLES[state];
  const isAnalyzing = state === "analyzing";
  const showMouth = state === "ai" || state === "real";
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
            background: bubble.verdict === "ai" ? "rgba(255,100,30,0.92)" : "rgba(40,180,100,0.92)",
            backdropFilter: "blur(8px)",
            boxShadow: bubble.verdict === "ai" ? "0 4px 20px rgba(255,100,30,0.4)" : "0 4px 20px rgba(40,180,100,0.4)",
            whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 14 }}>{bubble.verdict === "ai" ? "🤖" : "✅"}</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
              {bubble.verdict === "ai" ? "AI Generated" : "Looks Real"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "1px 6px" }}>
              {bubble.confidence}%
            </span>
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
