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
              <p style={{ fontSize: 12, color: "#b91c1c", lineHeight: 1.6, marginBottom: 6 }}>
                Apple doesn't allow apps to float over others. The live circle works on{" "}
                <strong>Android</strong> and <strong>desktop Chrome</strong>.
              </p>
              <p style={{ fontSize: 12, color: "#7f1d1d", fontWeight: 600, marginBottom: 2 }}>
                You can still manually check:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                {["AI Text", "Audio", "Images", "Video"].map((item) => (
                  <span key={item} style={{
                    fontSize: 11, color: "#dc2626", fontWeight: 500,
                    background: "#fee2e2", padding: "2px 8px", borderRadius: 20,
                  }}>
                    {item}
                  </span>
                ))}
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
