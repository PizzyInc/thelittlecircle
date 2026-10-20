"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "tlc_install_banner_dismissed";

export default function MobileInstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [tapped, setTapped] = useState(false);

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

  const isIOS = platform === "ios";
  const accent = isIOS ? "#991b1b" : "#1e3a8a";
  const accentMid = isIOS ? "#b91c1c" : "#1d4ed8";
  const bg = isIOS
    ? "linear-gradient(135deg, #fff1f0, #ffe4e0)"
    : "linear-gradient(135deg, #eff6ff, #dbeafe)";
  const border = isIOS ? "#fecaca" : "#93c5fd";
  const dismissColor = isIOS ? "#fca5a5" : "#93c5fd";

  return (
    <div style={{ padding: "0 16px 12px" }}>
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "14px 16px", position: "relative" }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", color: dismissColor, padding: 4, display: "flex", alignItems: "center" }}
        >
          <X size={15} />
        </button>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: 20 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0, position: "relative",
            background: "linear-gradient(145deg, #ffe8dc, #ffd4c4)",
            boxShadow: "0 4px 12px rgba(255,180,150,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 3.5, height: 3.5, background: "#2c2c2c", borderRadius: "50%" }} />
                </div>
              ))}
            </div>
            {isIOS && (
              <div style={{ position: "absolute", bottom: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", border: "1.5px solid #fff" }}>✕</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {!tapped ? (
              <>
                <p style={{ fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
                  {isIOS ? "Live circle not available on iOS" : "Get the Android app"}
                </p>
                <p style={{ fontSize: 12, color: accentMid, lineHeight: 1.5, marginBottom: 8 }}>
                  {isIOS
                    ? "Apple doesn't allow apps to float over others. Use the iOS app to check content manually."
                    : "The Little Circle floats over every app on your phone. It tells you what's real in real time."}
                </p>
                <button
                  onClick={() => setTapped(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: isIOS ? "#1d1d1f" : "#2563eb",
                    color: "#fff", fontSize: 11, fontWeight: 600,
                    padding: "5px 12px", borderRadius: 20,
                    border: "none", cursor: "pointer",
                  }}
                >
                  {isIOS ? "Download iOS App" : "Download Android app →"}
                </button>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
                  {isIOS ? "iOS app is on its way" : "Android app is on its way"}
                </p>
                <p style={{ fontSize: 12, color: accentMid, lineHeight: 1.5, marginBottom: 6 }}>
                  {isIOS
                    ? "We're actively building it. You'll be notified as soon as it's live on the App Store."
                    : "We're actively building it. You'll be notified as soon as it's live on the Play Store."}
                </p>
                <p style={{ fontSize: 11, color: accentMid, lineHeight: 1.5, opacity: 0.75 }}>
                  In the meantime, use manual detection right here on mobile or grab the Chrome extension on desktop.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
