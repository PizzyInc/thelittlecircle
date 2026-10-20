"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CircleLogo from "@/components/CircleLogo";

const SIZE = 100;
type Stage = "analyzing" | "ai" | "real" | "error" | "empty";

const STAGES: Record<
  Stage,
  { bg: string; shadow: string; anim: string; eyeW: number; eyeH: number; pupilW: number; mouth: boolean }
> = {
  analyzing: {
    bg: "linear-gradient(145deg, #e0eaff 0%, #c8d8ff 100%)",
    shadow: "0 8px 40px rgba(100,140,255,0.55)",
    anim: "circleScanPulse 1.2s ease-in-out infinite",
    eyeW: 16, eyeH: 16, pupilW: 10, mouth: false,
  },
  ai: {
    bg: "linear-gradient(145deg, #ffe0c8 0%, #ffcca0 100%)",
    shadow: "0 8px 40px rgba(255,150,80,0.65)",
    anim: "circleAIWiggle 0.4s ease-in-out infinite",
    eyeW: 18, eyeH: 18, pupilW: 12, mouth: true,
  },
  real: {
    bg: "linear-gradient(145deg, #d4f5e4 0%, #b0ecc8 100%)",
    shadow: "0 8px 40px rgba(80,200,140,0.55)",
    anim: "circleRealBounce 0.6s ease-out forwards",
    eyeW: 15, eyeH: 15, pupilW: 9, mouth: true,
  },
  error: {
    bg: "linear-gradient(145deg, #f0f4ff, #e8eeff)",
    shadow: "0 4px 20px rgba(0,0,0,0.08)",
    anim: "none",
    eyeW: 14, eyeH: 14, pupilW: 8, mouth: false,
  },
  empty: {
    bg: "linear-gradient(145deg, #f0f4ff, #e8eeff)",
    shadow: "0 4px 20px rgba(0,0,0,0.08)",
    anim: "none",
    eyeW: 14, eyeH: 14, pupilW: 8, mouth: false,
  },
};

interface Props { text?: string; url?: string; title?: string }

export default function ShareDetector({ text, url, title }: Props) {
  const [stage, setStage] = useState<Stage>("analyzing");
  const [confidence, setConfidence] = useState(0);
  const [scanningPupil, setScanningPupil] = useState(true);

  const sharedContent = [text, title, url].filter(Boolean).join(" ").trim();

  useEffect(() => {
    if (!sharedContent || sharedContent.length < 10) {
      setStage("empty");
      return;
    }

    fetch("/api/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", content: sharedContent.slice(0, 3000) }),
    })
      .then((r) => r.json())
      .then((data) => {
        setStage(data.verdict as "ai" | "real");
        setConfidence(data.confidence ?? 0);
        setScanningPupil(false);
      })
      .catch(() => {
        setStage("error");
        setScanningPupil(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = STAGES[stage];
  const isDone = stage === "ai" || stage === "real";

  return (
    <div style={{
      minHeight: "100svh",
      background: "linear-gradient(160deg, #f0f9ff, #e0f2fe)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "28px 20px 48px",
    }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 400, marginBottom: 56 }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <CircleLogo size={24} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0c4a6e" }}>The Little Circle</span>
        </Link>
      </div>

      {/* Circle face */}
      <div style={{
        width: SIZE, height: SIZE, borderRadius: "50%",
        background: s.bg, boxShadow: s.shadow,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: s.anim,
        transition: "background 0.5s ease, box-shadow 0.5s ease",
        marginBottom: 32,
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{
              width: s.eyeW, height: s.eyeH,
              background: "#fff", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              <div style={{
                width: s.pupilW, height: s.pupilW,
                background: "#2c2c2c", borderRadius: "50%",
                position: "relative",
                animation: scanningPupil ? "circlePupilLook 1.2s ease-in-out infinite" : undefined,
                flexShrink: 0,
              }}>
                <span style={{
                  position: "absolute",
                  width: Math.round(s.pupilW * 0.38),
                  height: Math.round(s.pupilW * 0.38),
                  background: "rgba(255,255,255,0.85)", borderRadius: "50%",
                  top: "18%", left: "18%",
                }} />
              </div>
            </div>
          ))}
        </div>
        {s.mouth && (
          <div style={{ marginTop: 7 }}>
            {stage === "real"
              ? <div style={{ width: 22, height: 11, border: "2.5px solid #2c2c2c", borderTop: "none", borderRadius: "0 0 22px 22px" }} />
              : <div style={{ width: 11, height: 8, background: "#2c2c2c", borderRadius: "50%" }} />
            }
          </div>
        )}
      </div>

      {/* Status text */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        {stage === "analyzing" && (
          <p style={{ fontSize: 20, fontWeight: 700, color: "#4060cc" }}>Analyzing…</p>
        )}
        {isDone && (
          <>
            <p style={{
              fontSize: 28, fontWeight: 800,
              color: stage === "ai" ? "#c05010" : "#147048",
              marginBottom: 10,
            }}>
              {stage === "ai" ? "🤖 AI" : "✅ Real"}
            </p>
            <span style={{
              display: "inline-block",
              padding: "5px 16px", borderRadius: 20, fontSize: 14, fontWeight: 600,
              background: stage === "ai" ? "rgba(255,100,30,0.12)" : "rgba(40,180,100,0.12)",
              color: stage === "ai" ? "#c05010" : "#147048",
            }}>
              {confidence}% confident
            </span>
          </>
        )}
        {stage === "error" && (
          <p style={{ fontSize: 18, fontWeight: 600, color: "#64748b" }}>Couldn't scan this</p>
        )}
        {stage === "empty" && (
          <p style={{ fontSize: 18, fontWeight: 600, color: "#64748b" }}>Nothing to scan</p>
        )}
      </div>

      {/* Content preview */}
      {sharedContent.length > 0 && (
        <p style={{
          fontSize: 13, color: "#94a3b8", textAlign: "center",
          maxWidth: 320, lineHeight: 1.6, marginTop: 16, marginBottom: 40,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}>
          "{sharedContent}"
        </p>
      )}

      {/* CTA */}
      <div style={{ width: "100%", maxWidth: 320, marginTop: "auto" }}>
        <Link href="/dashboard" style={{
          display: "block", textAlign: "center",
          padding: "15px", borderRadius: 16,
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
          boxShadow: "0 6px 20px rgba(14,165,233,0.35)",
        }}>
          Check something else
        </Link>
      </div>
    </div>
  );
}
