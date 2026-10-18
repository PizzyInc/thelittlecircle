"use client";

import Link from "next/link";
import { useEffect, useState, CSSProperties } from "react";
import { X } from "lucide-react";

type CircleState = "idle" | "scanning" | "ai" | "real";

const stateCfg: Record<
  CircleState,
  {
    label: string;
    sub: string;
    labelColor: string;
    bg: string;
    shadow: string;
    faceAnim: string;
    pupilAnim?: string;
    eyeSize: number;
    pupilSize: number;
    showSmile?: boolean;
    showWorried?: boolean;
    ringColor: string;
    ringDuration: string;
  }
> = {
  idle: {
    label: "Just chillin'",
    sub: "Watching quietly in the background",
    labelColor: "#b07060",
    bg: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
    shadow:
      "0 8px 35px rgba(255,180,150,0.5), inset 0 -4px 12px rgba(255,150,120,0.25), inset 0 4px 12px rgba(255,255,255,0.8)",
    faceAnim: "circleIdleBreathe 3s ease-in-out infinite",
    eyeSize: 24,
    pupilSize: 14,
    ringColor: "rgba(255,212,196,0.6)",
    ringDuration: "2.5s",
  },
  scanning: {
    label: "Checking it out...",
    sub: "Analyzing content in real time",
    labelColor: "#4a6cf7",
    bg: "linear-gradient(145deg, #e0eaff 0%, #c8d8ff 100%)",
    shadow:
      "0 8px 45px rgba(100,140,255,0.5), 0 0 70px rgba(100,140,255,0.25), inset 0 -4px 12px rgba(80,120,220,0.25), inset 0 4px 12px rgba(255,255,255,0.8)",
    faceAnim: "circleScanPulse 1.5s ease-in-out infinite",
    pupilAnim: "circlePupilLook 1.2s ease-in-out infinite",
    eyeSize: 26,
    pupilSize: 12,
    ringColor: "rgba(200,216,255,0.8)",
    ringDuration: "1.5s",
  },
  ai: {
    label: "AI detected!",
    sub: "Heads up. This content looks synthetic.",
    labelColor: "#ea7c2b",
    bg: "linear-gradient(145deg, #ffe0c8 0%, #ffcca0 100%)",
    shadow:
      "0 8px 40px rgba(255,150,80,0.6), 0 0 70px rgba(255,150,80,0.35), inset 0 -4px 12px rgba(255,130,60,0.3), inset 0 4px 12px rgba(255,255,255,0.8)",
    faceAnim: "circleAIWiggle 0.4s ease-in-out infinite",
    eyeSize: 30,
    pupilSize: 16,
    showWorried: true,
    ringColor: "rgba(255,179,128,0.8)",
    ringDuration: "0.8s",
  },
  real: {
    label: "All good! It's real",
    sub: "Verified as human-made content",
    labelColor: "#22a55e",
    bg: "linear-gradient(145deg, #d4f5e4 0%, #b0ecc8 100%)",
    shadow:
      "0 8px 35px rgba(80,200,140,0.5), 0 0 60px rgba(80,200,140,0.25), inset 0 -4px 12px rgba(60,180,120,0.25), inset 0 4px 12px rgba(255,255,255,0.8)",
    faceAnim: "circleRealBounce 0.7s ease-out forwards",
    eyeSize: 24,
    pupilSize: 14,
    showSmile: true,
    ringColor: "rgba(144,224,176,0.8)",
    ringDuration: "1.5s",
  },
};

const CYCLE: Array<[CircleState, number]> = [
  ["idle", 2800],
  ["scanning", 2000],
  ["real", 2800],
  ["idle", 2200],
  ["scanning", 2000],
  ["ai", 2800],
];

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const [showModal, setShowModal] = useState<"android" | "ios" | null>(null);

  const state = CYCLE[idx][0];
  const cfg = stateCfg[state];

  useEffect(() => {
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % CYCLE.length);
    }, CYCLE[idx][1]);
    return () => clearTimeout(t);
  }, [idx]);

  useEffect(() => {
    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const reflectionSize = Math.round(cfg.pupilSize * 0.38);

  const faceStyle: CSSProperties = {
    width: 140,
    height: 140,
    borderRadius: "50%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: cfg.bg,
    boxShadow: cfg.shadow,
    animation: cfg.faceAnim,
    transition: "background 0.5s ease, box-shadow 0.5s ease",
    willChange: "transform",
  };

  const pupilStyle: CSSProperties = cfg.pupilAnim
    ? { animation: cfg.pupilAnim }
    : {};

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 bg-grid overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/15 blur-3xl pointer-events-none" />

        {/* Circle */}
        <div className="relative mb-4" style={{ width: 140, height: 140 }}>
          <div style={faceStyle}>
            <div
              className="flex items-center flex-shrink-0"
              style={{
                gap: 22,
                marginTop: cfg.showSmile || cfg.showWorried ? -8 : 0,
              }}
            >
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-full bg-white flex items-center justify-center flex-shrink-0"
                  style={{
                    width: cfg.eyeSize,
                    height: cfg.eyeSize,
                    animation:
                      state === "idle"
                        ? "circleBlink 4s ease-in-out infinite"
                        : undefined,
                  }}
                >
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: cfg.pupilSize,
                      height: cfg.pupilSize,
                      background: "#2c2c2c",
                      position: "relative",
                      ...pupilStyle,
                    }}
                  >
                    <div
                      className="absolute rounded-full bg-white"
                      style={{
                        width: reflectionSize,
                        height: reflectionSize,
                        top: "14%",
                        left: "14%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {cfg.showSmile && (
              <div
                style={{
                  position: "absolute",
                  width: 24,
                  height: 12,
                  borderBottom: "3.5px solid #2c2c2c",
                  borderLeft: "3.5px solid #2c2c2c",
                  borderRight: "3.5px solid #2c2c2c",
                  borderRadius: "0 0 24px 24px",
                  bottom: 30,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
            {cfg.showWorried && (
              <div
                style={{
                  position: "absolute",
                  width: 14,
                  height: 9,
                  background: "#2c2c2c",
                  borderRadius: "50%",
                  bottom: 32,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
          </div>

          <div
            key={state}
            className="absolute inset-0 rounded-full border animate-ping"
            style={{
              borderColor: cfg.ringColor,
              animationDuration: cfg.ringDuration,
            }}
          />
        </div>

        {/* State label */}
        <div className="mb-8 text-center h-9 flex flex-col items-center justify-center">
          <p
            className="text-sm font-semibold mb-0.5 transition-all duration-300"
            style={{ color: cfg.labelColor }}
          >
            {cfg.label}
          </p>
          <p className="text-xs text-sky-400">{cfg.sub}</p>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-center text-sky-950 max-w-3xl leading-tight mb-5">
          Say hi to{" "}
          <span className="text-gradient">The Little<br className="sm:hidden" /> Circle</span>.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-sky-600 text-center max-w-sm sm:max-w-xl mb-3 leading-relaxed">
          A little floating circle on every device and website you visit. Name
          it, talk to it, and know the truth in seconds.
        </p>
        <p className="text-sky-500 font-medium text-center mb-10 text-sm sm:text-base">
          Tap or say its name. Know the truth.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-xs sm:max-w-none sm:w-auto" id="download">
          <button
            onClick={() => setShowModal("android")}
            className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full text-sm sm:text-base transition-all hover:scale-105 glow-sky-sm text-center w-full sm:w-auto"
          >
            Get Android App
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-4 border-2 border-sky-400 hover:border-sky-600 text-sky-700 hover:text-sky-900 font-semibold rounded-full text-sm sm:text-base transition-all hover:bg-sky-100 text-center w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round" />
            </svg>
            Use in Browser
          </Link>
        </div>

        <p className="text-sm text-sky-400 text-center mb-1">
          Free to get started. No credit card required.
        </p>
        <p className="text-xs text-sky-400 text-center mb-1">
          Chrome extension available now · Android app coming soon
        </p>
        <button
          onClick={() => setShowModal("ios")}
          className="text-xs text-sky-300 hover:text-sky-500 underline underline-offset-2 transition-colors"
        >
          On iOS? See what&apos;s available →
        </button>
      </section>

      {/* Android modal */}
      {showModal === "android" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(14, 30, 54, 0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-sky-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto mb-6 rounded-full flex flex-col items-center justify-center"
              style={{
                width: 80, height: 80,
                background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
                boxShadow: "0 6px 24px rgba(255,180,150,0.4)",
              }}
            >
              <div className="flex items-center gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-full bg-white flex items-center justify-center" style={{ width: 14, height: 14 }}>
                    <div className="rounded-full" style={{ width: 8, height: 8, background: "#2c2c2c" }} />
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-lg font-bold text-sky-950 mb-2">Android app coming soon</h2>
            <p className="text-sky-500 text-sm leading-relaxed mb-2">
              The Android app will float the circle over every app on your phone — social media, messages, news, anything.
            </p>
            <p className="text-sky-400 text-sm leading-relaxed mb-6">
              For now, use the browser or Chrome extension while the app is in development.
            </p>

            <Link
              href="/dashboard"
              className="block w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors mb-3"
              onClick={() => setShowModal(null)}
            >
              Use in browser now
            </Link>
            <button
              onClick={() => setShowModal(null)}
              className="w-full py-2.5 text-sky-400 hover:text-sky-600 text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* iOS modal */}
      {showModal === "ios" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(14, 30, 54, 0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-red-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Circle with X badge */}
            <div className="relative mx-auto mb-6" style={{ width: 80, height: 80 }}>
              <div
                className="rounded-full flex flex-col items-center justify-center w-full h-full"
                style={{
                  background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
                  boxShadow: "0 6px 24px rgba(255,180,150,0.4)",
                }}
              >
                <div className="flex items-center gap-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="rounded-full bg-white flex items-center justify-center" style={{ width: 14, height: 14 }}>
                      <div className="rounded-full" style={{ width: 8, height: 8, background: "#2c2c2c" }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                ✕
              </div>
            </div>

            <h2 className="text-lg font-bold text-sky-950 mb-2">Live circle not available on iOS</h2>
            <p className="text-sky-500 text-sm leading-relaxed mb-4">
              Apple doesn&apos;t allow apps to float over others or read screen content from other apps. The live circle works on <strong>Android</strong> and <strong>desktop Chrome</strong>.
            </p>

            <div className="bg-sky-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sky-700 text-xs font-semibold mb-2">What you can do on iOS:</p>
              <div className="flex flex-wrap gap-2">
                {["AI Text", "Audio", "Images", "Video"].map((item) => (
                  <span key={item} className="text-xs text-sky-600 bg-white border border-sky-200 px-3 py-1 rounded-full font-medium">
                    ✓ {item}
                  </span>
                ))}
              </div>
              <p className="text-sky-400 text-xs mt-2">Paste or upload content to check it manually.</p>
            </div>

            <Link
              href="/dashboard"
              className="block w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm transition-colors mb-3"
              onClick={() => setShowModal(null)}
            >
              Use manual detection
            </Link>
            <button
              onClick={() => setShowModal(null)}
              className="w-full py-2.5 text-sky-400 hover:text-sky-600 text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
