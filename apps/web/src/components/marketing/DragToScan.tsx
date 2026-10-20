"use client";

import { useEffect, useState } from "react";

const CYCLE: [string, number][] = [
  ["idle",      2200],
  ["moving",     850],
  ["analyzing", 1100],
  ["verdict",   2800],
];

export default function DragToScan() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setIdx((i) => (i + 1) % CYCLE.length),
      CYCLE[idx][1]
    );
    return () => clearTimeout(t);
  }, [idx]);

  const phase = CYCLE[idx][0];
  const onImage = phase === "analyzing" || phase === "verdict";

  // Container: 420 × 300. Chrome bar: 40px. Content padding: 16px.
  // Image card: left=16, top=56 (40+16), size 130×200
  // Image center: x=81, y=156
  // Circle (48px): on image → (57, 132), idle → (364, 244)
  const cx = onImage ? 57 : 364;
  const cy = onImage ? 132 : 244;

  return (
    <section className="py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <p className="text-sky-500 text-sm font-medium uppercase tracking-widest mb-4">
              On desktop
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-sky-950 mb-6 leading-tight">
              Drag. Drop.<br />Verdict in seconds.
            </h2>
            <p className="text-sky-600 text-lg leading-relaxed mb-10">
              See something that looks off? Drag your circle onto any image or
              video on the page and release. It analyses it instantly. No menus,
              no uploading, no copy-paste.
            </p>
            <div className="space-y-5">
              {[
                { n: "01", text: "Drag the circle onto any image or video" },
                { n: "02", text: "Release — it immediately starts analysing" },
                { n: "03", text: "AI, Fake, or Real. Verdict in under 2 seconds." },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-start gap-4">
                  <span className="text-xl font-bold text-sky-200 tabular-nums leading-snug flex-shrink-0 w-8">
                    {n}
                  </span>
                  <p className="text-sky-700 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Animated demo */}
          <div className="flex justify-center">
            <div className="relative" style={{ width: 420, height: 300 }}>

              {/* Browser mockup */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden border border-sky-200 bg-white shadow-2xl shadow-sky-100">
                {/* Chrome bar */}
                <div
                  className="flex items-center gap-1.5 px-4 bg-sky-50 border-b border-sky-100"
                  style={{ height: 40 }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                  <div
                    className="flex-1 mx-3 bg-white border border-sky-100 rounded-md flex items-center px-2"
                    style={{ height: 22 }}
                  >
                    <span className="text-sky-300 text-xs">pizzyholdings.com</span>
                  </div>
                </div>

                {/* Page content */}
                <div className="p-4 flex gap-4">
                  {/* Portrait image */}
                  <div
                    className="relative flex-shrink-0 rounded-xl overflow-hidden"
                    style={{
                      width: 130,
                      height: 200,
                      background:
                        "linear-gradient(160deg, #e8d5f5 0%, #c9b3e8 40%, #9980d4 80%, #7c65c0 100%)",
                    }}
                  >
                    {/* Stylised face silhouette */}
                    <div
                      style={{
                        position: "absolute",
                        top: 28,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: "rgba(255,224,196,0.8)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 90,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 66,
                        height: 90,
                        borderRadius: "40% 40% 0 0",
                        background: "rgba(255,224,196,0.65)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 80,
                        background: "linear-gradient(to top, rgba(80,50,150,0.65), transparent)",
                      }}
                    />
                    {/* Scan ring overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 12,
                        border: onImage
                          ? phase === "verdict"
                            ? "2px solid rgba(255,100,30,0.7)"
                            : "2px solid rgba(100,140,255,0.75)"
                          : "2px solid transparent",
                        background: onImage
                          ? phase === "verdict"
                            ? "rgba(255,100,30,0.05)"
                            : "rgba(100,140,255,0.07)"
                          : "transparent",
                        transition: "border-color 0.3s ease, background 0.3s ease",
                      }}
                    />
                  </div>

                  {/* Text skeleton */}
                  <div className="flex-1 pt-1 space-y-2">
                    <div className="h-3 bg-sky-100 rounded-full" style={{ width: "88%" }} />
                    <div className="h-2.5 bg-sky-50 rounded-full w-full" />
                    <div className="h-2.5 bg-sky-50 rounded-full" style={{ width: "78%" }} />
                    <div className="h-2.5 bg-sky-50 rounded-full" style={{ width: "95%" }} />
                    <div className="h-2.5 bg-sky-50 rounded-full" style={{ width: "62%" }} />
                    <div className="mt-3 h-2.5 bg-sky-50 rounded-full" style={{ width: "85%" }} />
                    <div className="h-2.5 bg-sky-50 rounded-full" style={{ width: "50%" }} />
                  </div>
                </div>
              </div>

              {/* Drag hint label */}
              {phase === "idle" && (
                <div
                  style={{
                    position: "absolute",
                    left: 168,
                    top: 256,
                    fontSize: 11,
                    color: "#94c4da",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  drag to image
                </div>
              )}

              {/* The Circle */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background:
                    phase === "analyzing"
                      ? "linear-gradient(145deg, #e0eaff 0%, #c8d8ff 100%)"
                      : phase === "verdict"
                      ? "linear-gradient(145deg, #ffe0c8 0%, #ffcca0 100%)"
                      : "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
                  boxShadow:
                    phase === "analyzing"
                      ? "0 4px 24px rgba(100,140,255,0.65), 0 0 40px rgba(100,140,255,0.2)"
                      : phase === "verdict"
                      ? "0 4px 24px rgba(255,150,80,0.7)"
                      : "0 4px 18px rgba(255,180,150,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translate(${cx}px, ${cy}px)`,
                  transition:
                    phase === "moving" || onImage
                      ? "transform 0.85s cubic-bezier(0.34, 1.15, 0.64, 1), background 0.35s ease, box-shadow 0.4s ease"
                      : "background 0.4s ease, box-shadow 0.4s ease",
                  zIndex: 10,
                  animation:
                    phase === "analyzing"
                      ? "circleScanPulse 1.2s ease-in-out infinite"
                      : phase === "idle"
                      ? "circleIdleBreathe 3s ease-in-out infinite"
                      : undefined,
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        background: "#fff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{ width: 4.5, height: 4.5, background: "#2c2c2c", borderRadius: "50%" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Verdict bubble */}
              {phase === "verdict" && (
                <div
                  style={{
                    position: "absolute",
                    left: 30,
                    top: 84,
                    animation: "verdictBubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 12px",
                      borderRadius: 20,
                      background: "rgba(255,100,30,0.93)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 4px 18px rgba(255,100,30,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>🤖</span>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      AI Generated
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        fontSize: 11,
                        fontWeight: 500,
                        background: "rgba(0,0,0,0.18)",
                        borderRadius: 10,
                        padding: "1px 6px",
                      }}
                    >
                      94%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
