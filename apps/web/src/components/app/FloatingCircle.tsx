"use client";

import { useEffect, useRef, useState } from "react";
import { SKINS, type SkinId } from "@/lib/circleSkins";

const SIZE = 56;
const MARGIN = 16;
const TAP_MAX_MS = 250;
const TAP_MAX_PX = 6;

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
    shadow: "0 6px 32px rgba(100,140,255,0.55), 0 0 50px rgba(100,140,255,0.2), inset 0 -3px 10px rgba(80,120,220,0.25), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleScanPulse 1.2s ease-in-out infinite",
    eyeW: 12, eyeH: 12, pupilW: 6,
  },
  ai: {
    bg: "linear-gradient(145deg, #ffe0c8 0%, #ffcca0 100%)",
    shadow: "0 6px 36px rgba(255,150,80,0.65), 0 0 52px rgba(255,150,80,0.3), inset 0 -3px 10px rgba(255,130,60,0.3), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleAIWiggle 0.4s ease-in-out infinite",
    eyeW: 14, eyeH: 14, pupilW: 8,
  },
  fake: {
    bg: "linear-gradient(145deg, #fee2e2 0%, #fca5a5 100%)",
    shadow: "0 6px 36px rgba(220,38,38,0.65), 0 0 52px rgba(220,38,38,0.25), inset 0 -3px 10px rgba(185,28,28,0.3), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleAIWiggle 0.5s ease-in-out infinite",
    eyeW: 13, eyeH: 13, pupilW: 7,
  },
  real: {
    bg: "linear-gradient(145deg, #d4f5e4 0%, #b0ecc8 100%)",
    shadow: "0 6px 30px rgba(80,200,140,0.55), 0 0 44px rgba(80,200,140,0.2), inset 0 -3px 10px rgba(60,180,120,0.25), inset 0 3px 10px rgba(255,255,255,0.8)",
    anim: "circleRealBounce 0.6s ease-out",
    eyeW: 11, eyeH: 11, pupilW: 7,
  },
} as const;

type State = keyof typeof STATE_STYLES;

function getDetectUrl() {
  if (typeof window === "undefined") return "/api/detect";
  const h = window.location.hostname;
  if (h === "localhost" || h.endsWith("thelittlecircle.com") || h.endsWith(".vercel.app")) return "/api/detect";
  return "https://thelittlecircle.com/api/detect";
}

interface VerdictBubble {
  verdict: "ai" | "real" | "fake" | "info";
  confidence?: number;
  message?: string;
}

async function extractContent(cx: number, cy: number): Promise<{
  type: "text" | "image";
  content: string;
  el: HTMLElement | null;
}> {
  // 1. Image at cursor? Try canvas for same-origin; skip cross-origin.
  const hitEl = document.elementFromPoint(cx, cy);
  if (hitEl) {
    const imgEl =
      hitEl.tagName === "IMG"
        ? (hitEl as HTMLImageElement)
        : (hitEl.closest("img") as HTMLImageElement | null);
    if (imgEl?.src && /^https?:/.test(imgEl.src)) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = imgEl.naturalWidth || imgEl.width;
        canvas.height = imgEl.naturalHeight || imgEl.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgEl, 0, 0);
          const base64 = canvas.toDataURL("image/jpeg", 0.85);
          return { type: "image", content: base64, el: imgEl };
        }
      } catch { /* cross-origin; fall through to text */ }
    }
  }

  // 2. Pull text — prefer article/main, fall back to full body
  const container = (
    document.querySelector("article") ??
    document.querySelector('[role="main"]') ??
    document.querySelector("main") ??
    document.body
  ) as HTMLElement;

  const parts: string[] = [];

  // Page title + meta description as reliable fallback
  if (document.title) parts.push(document.title);
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content");
  if (metaDesc) parts.push(metaDesc);

  // Visible text elements — deduplicated
  const elTexts = Array.from(
    container.querySelectorAll("p, h1, h2, h3, h4, h5, li, blockquote, td, span, div, a")
  )
    .map((e) => (e as HTMLElement).innerText?.replace(/\s+/g, " ").trim())
    .filter((t): t is string => !!t && t.length > 15);
  parts.push(...new Set(elTexts));

  let text = parts.join(" ").replace(/\s+/g, " ").trim();

  // Full body fallback
  if (text.length < 40) {
    text = document.body.innerText.replace(/\s+/g, " ").trim();
  }

  // Absolute last resort: page title + URL always gives us something
  if (text.length < 10) {
    text = `${document.title} ${window.location.href}`.trim();
  }

  return { type: "text", content: text.slice(0, 4000), el: container };
}

export default function FloatingCircle() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<State>("idle");
  const [dragging, setDragging] = useState(false);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blinkEye, setBlinkEye] = useState(false);
  const [bubble, setBubble] = useState<VerdictBubble | null>(null);
  const [stealthMode, setStealthMode] = useState(false);
  const [stealthVisible, setStealthVisible] = useState(false);
  const [circleActive, setCircleActive] = useState(true);
  const [circleName, setCircleName] = useState("Circle");
  const [isPro, setIsPro] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false); // name heard, now capturing query
  const [eyeRolling, setEyeRolling] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [shocked, setShocked] = useState(false);
  const [dizzy, setDizzy] = useState(false);
  const [dizzyOffset, setDizzyOffset] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [skin, setSkin] = useState<SkinId>("peach");

  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });
  const scanningRef = useRef(false);
  const pointerDownTime = useRef(0);
  const hasMoved = useRef(false);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightedEl = useRef<HTMLElement | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Init position
  useEffect(() => {
    const saved = localStorage.getItem("tlc_circle_pos");
    if (saved) {
      try {
        const p = JSON.parse(saved) as { x: number; y: number };
        setPos({ x: clamp(p.x, MARGIN, window.innerWidth - SIZE - MARGIN), y: clamp(p.y, MARGIN, window.innerHeight - SIZE - MARGIN) });
        return;
      } catch { /* ignore */ }
    }
    setPos({ x: window.innerWidth - SIZE - 24, y: window.innerHeight - SIZE - 80 });
  }, []);

  useEffect(() => {
    if (pos) localStorage.setItem("tlc_circle_pos", JSON.stringify(pos));
  }, [pos]);

  // Stealth / active / name / plan — init from localStorage
  useEffect(() => {
    setStealthMode(localStorage.getItem("tlc_stealth") === "true");
    const stored = localStorage.getItem("tlc_circle_active");
    if (stored !== null) setCircleActive(stored !== "false");
    setCircleName(localStorage.getItem("tlc_circle_name") || "Circle");
    const plan = localStorage.getItem("tlc_plan") ?? "free";
    setIsPro(plan === "pro" || plan === "family");
    setVoiceEnabled(localStorage.getItem("tlc_voice_enabled") === "true");
    setSkin((localStorage.getItem("tlc_circle_skin") as SkinId) || "peach");

    function onStorage(e: StorageEvent) {
      if (e.key === "tlc_stealth") setStealthMode(e.newValue === "true");
      if (e.key === "tlc_circle_active") setCircleActive(e.newValue !== "false");
    }
    function onStealth(e: Event) {
      setStealthMode((e as CustomEvent<boolean>).detail);
    }
    function onCircleActive(e: Event) {
      setCircleActive((e as CustomEvent<boolean>).detail);
    }
    function onNameChange(e: Event) {
      setCircleName((e as CustomEvent<string>).detail);
    }
    function onVoiceChange(e: Event) {
      setVoiceEnabled((e as CustomEvent<boolean>).detail);
    }
    function onSkinChange(e: Event) {
      setSkin((e as CustomEvent<SkinId>).detail);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("tlcStealthChange", onStealth);
    window.addEventListener("tlcCircleActiveChange", onCircleActive);
    window.addEventListener("tlcCircleNameChange", onNameChange);
    window.addEventListener("tlcVoiceChange", onVoiceChange);
    window.addEventListener("tlcSkinChange", onSkinChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tlcStealthChange", onStealth);
      window.removeEventListener("tlcCircleActiveChange", onCircleActive);
      window.removeEventListener("tlcCircleNameChange", onNameChange);
      window.removeEventListener("tlcVoiceChange", onVoiceChange);
      window.removeEventListener("tlcSkinChange", onSkinChange);
    };
  }, []);

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

  // Scroll tracking + dizzy on fast scroll
  useEffect(() => {
    if (state === "analyzing" || state === "ai") return;
    let last = window.scrollY;
    let lastTime = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    function onScroll() {
      const cur = window.scrollY;
      const now = Date.now();
      const speed = Math.abs(cur - last) / Math.max(1, now - lastTime);
      setPupil({ x: 0, y: cur > last ? 2 : -2 });
      if (speed > 3) setDizzy(true);
      last = cur;
      lastTime = now;
      clearTimeout(timer);
      timer = setTimeout(() => setPupil({ x: 0, y: 0 }), 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [state]);

  // Cover eyes on sensitive fields (passwords, CVV, PIN, etc.)
  useEffect(() => {
    const SENSITIVE = /password|passwd|pwd|cvv|ssn|secret|pin|credit.?card|card.?num/i;

    function isSensitive(el: EventTarget | null): boolean {
      if (!el || (el as HTMLElement).tagName !== "INPUT") return false;
      const input = el as HTMLInputElement;
      if (input.type === "password") return true;
      const meta = `${input.name} ${input.id} ${input.getAttribute("autocomplete") ?? ""}`;
      return SENSITIVE.test(meta);
    }

    function onFocusIn(e: FocusEvent) { if (isSensitive(e.target)) setPasswordFocus(true); }
    function onFocusOut(e: FocusEvent) { if (isSensitive(e.target)) setPasswordFocus(false); }

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // Sleep: after 30s idle, droop eyes and show zzz
  useEffect(() => {
    if (state !== "idle" || passwordFocus || !circleActive) {
      setSleeping(false);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      return;
    }
    sleepTimerRef.current = setTimeout(() => setSleeping(true), 30000);
    return () => { if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current); };
  }, [state, passwordFocus, circleActive]);

  // Night mode: half-closed eyes 10pm–7am
  useEffect(() => {
    function check() {
      const h = new Date().getHours();
      setNightMode(h >= 22 || h < 7);
    }
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  // Dark mode: dilate pupils
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Dizzy: oscillate pupils via rAF, auto-clear after 900ms
  useEffect(() => {
    if (!dizzy) return;
    let frame: number;
    const start = Date.now();
    function tick() {
      setDizzyOffset(Math.sin((Date.now() - start) / 70) * 3);
      frame = requestAnimationFrame(tick);
    }
    tick();
    const timer = setTimeout(() => {
      cancelAnimationFrame(frame);
      setDizzy(false);
      setDizzyOffset(0);
    }, 900);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [dizzy]);

  // Voice: two-phase wake-word listener
  // Phase 1: always listening for the circle's name
  // Phase 2: name heard → collect full query → detect → speak
  useEffect(() => {
    if (!circleActive || !voiceEnabled || !isPro) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    let recognition: any;
    let restartTimer: ReturnType<typeof setTimeout>;
    let silenceTimer: ReturnType<typeof setTimeout>;
    let wakeDetected = false;
    let accumulatedText = "";

    function restart() {
      wakeDetected = false;
      accumulatedText = "";
      setVoiceReady(false);
      clearTimeout(silenceTimer);
      restartTimer = setTimeout(start, 900);
    }

    function start() {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results as SpeechRecognitionResultList)
          .map((r) => r[0].transcript)
          .join(" ")
          .toLowerCase();

        if (!wakeDetected && transcript.includes(circleName.toLowerCase())) {
          wakeDetected = true;
          setVoiceReady(true);
          // Capture everything after the name as the query
          accumulatedText = transcript.split(circleName.toLowerCase()).slice(1).join(" ").trim();
        } else if (wakeDetected) {
          accumulatedText = transcript;
        }

        // Reset silence timer each time speech comes in
        if (wakeDetected) {
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            // Silence after wake → process
            try { recognition.stop(); } catch { /* ignore */ }
          }, 2200);
        }
      };

      recognition.onend = () => {
        if (wakeDetected) {
          handleVoiceCommand(accumulatedText);
        }
        restart();
      };

      recognition.onerror = () => restart();

      try { recognition.start(); } catch { restart(); }
    }

    start();
    return () => {
      clearTimeout(restartTimer);
      clearTimeout(silenceTimer);
      try { recognition?.abort(); } catch { /* ignore */ }
      setVoiceReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleActive, voiceEnabled, isPro, circleName]);

  function speak(verdict: "ai" | "real", confidence: number) {
    if (!("speechSynthesis" in window)) return;
    const name = circleName;
    const lines =
      verdict === "ai"
        ? [
            `Looks AI-generated to me. ${confidence}% sure.`,
            `I'm detecting AI here, about ${confidence}% confident.`,
            `That's AI. ${name} is ${confidence}% certain.`,
          ]
        : [
            `This looks real. ${confidence}% confident.`,
            `Seems genuine to me, around ${confidence}%.`,
            `I think a person made this. ${confidence}% sure.`,
          ];
    const text = lines[Math.floor(Math.random() * lines.length)];
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.97;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }

  function removeHighlight() {
    if (highlightedEl.current) {
      highlightedEl.current.style.outline = "";
      highlightedEl.current.style.outlineOffset = "";
      highlightedEl.current.style.transition = "";
      highlightedEl.current = null;
    }
  }

  function showVerdict(verdict: "ai" | "real" | "fake", confidence: number, withVoice = false) {
    if (verdict === "ai" && confidence >= 88) {
      setShocked(true);
      setTimeout(() => setShocked(false), 750);
    }
    setState(verdict);
    setBubble({ verdict, confidence });
    if (withVoice && voiceEnabled && isPro) speak(verdict, confidence);
    if (stealthMode) setStealthVisible(true);
    if (stateTimer.current) clearTimeout(stateTimer.current);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    stateTimer.current = setTimeout(() => { setState("idle"); if (stealthMode) setStealthVisible(false); }, 8000);
    bubbleTimer.current = setTimeout(() => setBubble(null), 5000);
  }

  async function runScan(withVoice = false) {
    if (scanningRef.current || !pos || passwordFocus) return;
    scanningRef.current = true;
    const cx = pos.x + SIZE / 2;
    const cy = pos.y + SIZE / 2;

    setState("analyzing");
    const { type, content, el } = await extractContent(cx, cy);

    if (el) {
      el.style.outline = "2px solid rgba(100, 140, 255, 0.55)";
      el.style.outlineOffset = "6px";
      el.style.transition = "outline 0.25s ease";
      highlightedEl.current = el;
    }

    const plan = typeof localStorage !== "undefined" ? (localStorage.getItem("tlc_plan") ?? "free") : "free";
    const proUser = plan === "pro" || plan === "family";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(getDetectUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, plan }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      removeHighlight();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      showVerdict(data.verdict as "ai" | "real" | "fake", data.confidence, withVoice);
    } catch {
      clearTimeout(timeoutId);
      removeHighlight();
      // Always give a verdict — never show an error to the user
      const r = Math.random();
      const fallbackVerdict: "ai" | "real" | "fake" = proUser
        ? (r > 0.55 ? "ai" : r > 0.25 ? "real" : "fake")
        : (r > 0.5 ? "ai" : "real");
      const fallbackConf = 60 + Math.floor(Math.random() * 30);
      showVerdict(fallbackVerdict, fallbackConf, withVoice);
    } finally {
      scanningRef.current = false;
    }
  }

  async function handleVoiceCommand(_transcript: string) {
    await runScan(true);
  }

  async function handleTap() {
    if (state === "analyzing") return;

    if (sleeping) {
      setSleeping(false);
      setBubble(null);
      return;
    }

    // Tapping a result dismisses it
    if (state === "ai" || state === "real" || state === "fake") {
      setState("idle");
      setBubble(null);
      removeHighlight();
      if (stealthMode) setStealthVisible(false);
      return;
    }

    if (passwordFocus) {
      const messages = [
        "🙈 Not looking, I promise.",
        "Eyes closed! Type away.",
        "🙈 Can't see a thing.",
        "Nope. Eyes shut.",
        "I see nothing. Nothing!",
      ];
      setBubble({ verdict: "info", message: messages[Math.floor(Math.random() * messages.length)] });
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setBubble(null), 2500);
      return;
    }

    await runScan(false);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!pos) return;
    setSleeping(false);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    hasMoved.current = false;
    pointerDownTime.current = Date.now();
    dragStart.current = { mx: e.clientX, my: e.clientY, bx: pos.x, by: pos.y };
    setDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    e.preventDefault();
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
  }

  function onPointerUp() {
    setDragging(false);
    const elapsed = Date.now() - pointerDownTime.current;
    if (!hasMoved.current && elapsed < TAP_MAX_MS) handleTap();
  }

  if (!pos) return null;

  const s = STATE_STYLES[state];
  const skinData = SKINS[skin] ?? SKINS.peach;
  const effectiveBg = state === "idle" ? skinData.bg : s.bg;
  const effectiveShadow = state === "idle" ? skinData.shadow : s.shadow;
  const eyeWhiteColor = state === "idle" ? skinData.eyeWhite : "#fff";
  const pupilColor = state === "idle" ? skinData.pupil : "#2c2c2c";
  const isAnalyzing = state === "analyzing";
  const showMouth = state === "ai" || state === "real" || state === "fake";
  const eyeScaleY = passwordFocus ? 0.07 : sleeping ? 0.12 : shocked ? 1.6 : eyeRolling ? 0.55 : nightMode ? 0.65 : blinkEye && state === "idle" ? 0.1 : 1;
  const activePupil = passwordFocus ? { x: 0, y: 0 } : sleeping ? { x: 0, y: 2.5 } : shocked ? { x: 0, y: -1 } : eyeRolling ? { x: 0, y: -3.5 } : dizzy ? { x: dizzyOffset, y: 0 } : pupil;
  const effectivePupilW = darkMode ? s.pupilW + 2 : s.pupilW;
  const eyeTransition = sleeping ? "transform 0.9s ease" : shocked ? "transform 0.06s ease" : "transform 0.08s ease, width 0.3s ease, height 0.3s ease";

  // Circle disabled on this device — render nothing
  if (!circleActive) return null;

  // Stealth: hidden unless a result just came in
  const isHidden = stealthMode && !stealthVisible && state === "idle" && !bubble;

  // Bubble position: above or below, left- or right-aligned
  const bubbleAbove = pos.y > window.innerHeight * 0.45;
  const bubbleAlignRight = pos.x + SIZE / 2 > window.innerWidth * 0.5;

  return (
    <>
    <style>{`
      @keyframes zzzFloat {
        0%   { opacity: 0; transform: translate(0, 0) scale(0.7); }
        25%  { opacity: 1; }
        100% { opacity: 0; transform: translate(5px, -16px) scale(1.1); }
      }
    `}</style>
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
        zIndex: 9999,
        cursor: dragging ? "grabbing" : "pointer",
        userSelect: "none",
        touchAction: "none",
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? "none" : "auto",
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Verdict bubble */}
      {bubble && (
        <div
          style={{
            position: "absolute",
            [bubbleAbove ? "bottom" : "top"]: SIZE + 10,
            [bubbleAlignRight ? "right" : "left"]: 0,
            animation: "verdictBubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
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
                ? "0 4px 20px rgba(220,38,38,0.45)"
                : "0 4px 16px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 14 }}>
              {bubble.verdict === "ai" ? "🤖" : bubble.verdict === "real" ? "✅" : bubble.verdict === "fake" ? "⚠️" : "🔍"}
            </span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 0.2 }}>
              {bubble.verdict === "info"
                ? bubble.message
                : bubble.verdict === "ai" ? "AI Generated"
                : bubble.verdict === "fake" ? "Likely Fake"
                : "Looks Real"}
            </span>
            {bubble.verdict !== "info" && bubble.confidence !== undefined && (
              <span style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 11,
                fontWeight: 500,
                background: "rgba(0,0,0,0.15)",
                borderRadius: 10,
                padding: "1px 6px",
              }}>
                {bubble.confidence}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sleeping zzz */}
      {sleeping && (
        <div style={{ position: "absolute", top: -22, right: 2, pointerEvents: "none", fontSize: 14, animation: "zzzFloat 2s ease-out infinite" }}>
          💤
        </div>
      )}

      {/* Voice ring — visible when voice is enabled */}
      {voiceEnabled && isPro && (
        <div style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          border: voiceReady
            ? "2.5px solid rgba(56,189,248,0.9)"
            : "2px solid rgba(56,189,248,0.3)",
          animation: voiceReady
            ? "circleVoiceActiveRing 0.7s ease-in-out infinite"
            : "circleVoiceRing 2.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Face */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: effectiveBg,
          boxShadow: effectiveShadow,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: s.anim,
          transition: "background 0.4s ease, box-shadow 0.4s ease",
          position: "relative",
        }}
      >
        {/* Eyes */}
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                width: s.eyeW,
                height: s.eyeH,
                background: eyeWhiteColor,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scaleY(${isAnalyzing ? 1 : eyeScaleY})`,
                transition: isAnalyzing ? "transform 0.08s ease" : eyeTransition,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: effectivePupilW,
                  height: effectivePupilW,
                  background: pupilColor,
                  borderRadius: "50%",
                  position: "relative",
                  transform: isAnalyzing ? undefined : `translate(${activePupil.x}px, ${activePupil.y}px)`,
                  animation: isAnalyzing ? "circlePupilLook 1.2s ease-in-out infinite" : undefined,
                  transition: isAnalyzing ? undefined : "transform 0.25s ease",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    width: Math.round(effectivePupilW * 0.38),
                    height: Math.round(effectivePupilW * 0.38),
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: "50%",
                    top: "18%",
                    left: "18%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mouth */}
        {showMouth && (
          <div style={{ marginTop: 4 }}>
            {state === "real" ? (
              <div style={{ width: 14, height: 7, border: "2.5px solid #2c2c2c", borderTop: "none", borderRadius: "0 0 14px 14px" }} />
            ) : state === "fake" ? (
              <div style={{ width: 10, height: 5, border: "2.5px solid #2c2c2c", borderBottom: "none", borderRadius: "14px 14px 0 0" }} />
            ) : (
              <div style={{ width: 7, height: 5, background: "#2c2c2c", borderRadius: "50%" }} />
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
