"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "tlc_install_banner_dismissed";

export default function MobileInstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if (!isIOS && !isAndroid) return;

    if (localStorage.getItem(DISMISS_KEY) === "true") return;

    setPlatform(isIOS ? "ios" : "android");
    setShow(true);
  }, []);

  if (!show) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setShow(false);
  }

  if (platform === "ios") {
    return (
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{
          background: "linear-gradient(135deg, #fff1f0, #ffe4e0)",
          border: "1px solid #fecaca",
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
              color: "#fca5a5", padding: 4,
              display: "flex", alignItems: "center",
            }}
          >
            <X size={15} />
          </button>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: 20 }}>
            {/* Circle face with an X over it */}
            <div style={{
              width: 38, height: 38, borderRadius: "50%", flexShrink: 0, position: "relative",
              background: "linear-gradient(145deg, #ffe8dc, #ffd4c4)",
              boxShadow: "0 4px 12px rgba(255,180,150,0.3)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, background: "#fff", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 3.5, height: 3.5, background: "#2c2c2c", borderRadius: "50%" }} />
                  </div>
                ))}
              </div>
              {/* Red X badge */}
              <div style={{
                position: "absolute", bottom: -3, right: -3,
                width: 14, height: 14, borderRadius: "50%",
                background: "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff",
                border: "1.5px solid #fff",
              }}>✕</div>
            </div>

            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 4 }}>
                Live circle not available on iOS
              </p>
              <p style={{ fontSize: 12, color: "#b91c1c", lineHeight: 1.5, marginBottom: 8 }}>
                Apple doesn't allow apps to float over others. Use the iOS app to check content manually.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "#1d1d1f",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 12px",
                    borderRadius: 20,
                    textDecoration: "none",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 11, height: 11 }}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Download iOS App
                </a>
                <span style={{ fontSize: 11, color: "#b91c1c", alignSelf: "center" }}>
                  or check manually: AI Text, Images, Audio, Video
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android — prompt to download the native app
  return (
    <div style={{ padding: "0 16px 12px" }}>
      <div style={{
        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        border: "1px solid #93c5fd",
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
            color: "#93c5fd", padding: 4,
            display: "flex", alignItems: "center",
          }}
        >
          <X size={15} />
        </button>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: 20 }}>
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

          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#1e3a8a", marginBottom: 4 }}>
              Get the Android app
            </p>
            <p style={{ fontSize: 12, color: "#1d4ed8", lineHeight: 1.6, marginBottom: 8 }}>
              The Little Circle floats over every app on your phone: social media, messages, anything. It tells you what&apos;s real in real time.
            </p>
            <a
              href="/download"
              style={{
                display: "inline-block",
                background: "#2563eb",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              Download Android app →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
