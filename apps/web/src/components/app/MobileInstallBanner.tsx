"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "tlc_install_banner_dismissed";

export default function MobileInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    if (!isMobile) return;

    // Already running as installed PWA
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    if (localStorage.getItem(DISMISS_KEY) === "true") return;

    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
    setShow(true);
  }, []);

  if (!show) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setShow(false);
  }

  return (
    <div style={{ padding: "0 16px 12px" }}>
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        border: "1px solid #86efac",
        borderRadius: 16,
        padding: "14px 16px",
        position: "relative",
      }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            position: "absolute", top: 10, right: 10,
            background: "none", border: "none", cursor: "pointer",
            color: "#4ade80", padding: 4,
            display: "flex", alignItems: "center",
          }}
        >
          <X size={15} />
        </button>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: 20 }}>
          {/* Mini circle face */}
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(145deg, #ffe8dc, #ffd4c4)",
            boxShadow: "0 4px 12px rgba(255,180,150,0.4)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
          }}>
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{
                  width: 7, height: 7, background: "#fff", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 4.5, height: 4.5, background: "#2c2c2c", borderRadius: "50%" }} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#14532d", marginBottom: 5 }}>
              {isIOS ? "Use me from any app on iOS" : "Scan from any app on Android"}
            </p>
            {isIOS ? (
              <p style={{ fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
                Tap <strong>Share ↑</strong> in Safari →{" "}
                <strong>Add to Home Screen</strong>. Then copy text from any app, open
                The Little Circle from your home screen, and tap the circle to scan.
              </p>
            ) : (
              <p style={{ fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
                Tap <strong>⋮</strong> in Chrome →{" "}
                <strong>Add to Home Screen</strong>. After that, tap{" "}
                <strong>Share</strong> in any app and choose{" "}
                <strong>The Little Circle</strong> to scan content instantly — no
                copy-paste needed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
