"use client";

import { useEffect, useRef, useState } from "react";

export default function CircleNameOnboarding() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const faceRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("tlc_circle_name");
    if (!stored) setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    function onMouseMove(e: MouseEvent) {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      // Max pupil travel is 2.5px (eye white 13px, pupil 8px → 2.5px each side)
      const maxOffset = 2.5;
      const scale = maxOffset / Math.max(dist / 40, 1);
      setPupilOffset({ x: dx * scale / 40, y: dy * scale / 40 });
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [show]);

  function submit() {
    const trimmed = name.trim() || "Circle";
    localStorage.setItem("tlc_circle_name", trimmed);
    window.dispatchEvent(new CustomEvent("tlcCircleNameChange", { detail: trimmed }));
    setShow(false);
  }

  function skip() {
    localStorage.setItem("tlc_circle_name", "Circle");
    window.dispatchEvent(new CustomEvent("tlcCircleNameChange", { detail: "Circle" }));
    setShow(false);
  }

  if (!show) return null;

  const displayName = name.trim() || "Circle";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10002,
        background: "rgba(2, 14, 28, 0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 28,
          padding: "40px 32px 32px",
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        {/* Circle face with cursor-tracking eyes */}
        <div
          ref={faceRef}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
            boxShadow: "0 8px 32px rgba(255,180,150,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            animation: "circleIdleBreathe 3s ease-in-out infinite",
            gap: 3,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 13, height: 13, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{
                  width: 8,
                  height: 8,
                  background: "#2c2c2c",
                  borderRadius: "50%",
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: "transform 0.08s ease-out",
                }} />
              </div>
            ))}
          </div>
          {/* Smile */}
          <div style={{ width: 16, height: 8, border: "2.5px solid #2c2c2c", borderTop: "none", borderRadius: "0 0 16px 16px", marginTop: 3 }} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0c4a6e", marginBottom: 10 }}>
          Name your AI companion
        </h2>
        <p style={{ fontSize: 13, color: "#64b5d9", lineHeight: 1.6, marginBottom: 24 }}>
          Your circle will go by this name. Say{" "}
          <strong style={{ color: "#0369a1" }}>"hey {displayName}"</strong> on any page to
          trigger voice detection.
        </p>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type a name..."
          maxLength={20}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 14,
            border: "1.5px solid #bae6fd",
            background: "#f0f9ff",
            fontSize: 15,
            color: "#0c4a6e",
            outline: "none",
            marginBottom: 10,
            textAlign: "center",
            letterSpacing: 0.3,
          }}
        />

        {/* Suggestion chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
          {["Aria", "Max", "Scout", "Hira", "Leo"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setName(suggestion)}
              style={{
                padding: "5px 13px",
                borderRadius: 20,
                border: `1.5px solid ${name === suggestion ? "#0ea5e9" : "#bae6fd"}`,
                background: name === suggestion ? "#e0f2fe" : "#f8fdff",
                color: name === suggestion ? "#0284c7" : "#7ab8d4",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            marginBottom: 12,
            boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
          }}
        >
          Meet {displayName} →
        </button>

        <button
          onClick={skip}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "#94a3b8",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
