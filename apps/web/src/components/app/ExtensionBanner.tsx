"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "tlc_ext_banner_dismissed";
const EXT_URL = process.env.NEXT_PUBLIC_EXTENSION_URL ?? "";

export default function ExtensionBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only relevant in Chrome/Chromium on desktop — not mobile (can't install extensions there)
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) return;
    const isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (!isChrome) return;

    if (localStorage.getItem(DISMISS_KEY) === "true") return;

    // Give the bridge script ~1s to set the flag before deciding
    const timer = setTimeout(() => {
      const installed = document.documentElement.hasAttribute("data-tlc-ext");
      if (!installed) setShow(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
        borderBottom: "1px solid #bae6fd",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Mini circle face */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(145deg, #ffe8dc, #ffd4c4)",
          boxShadow: "0 4px 12px rgba(255,180,150,0.45)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
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
              <div style={{ width: 4, height: 4, background: "#2c2c2c", borderRadius: "50%" }} />
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#0369a1", flex: 1, margin: 0 }}>
        <strong>Get The Little Circle on every tab.</strong> Install the Chrome extension to see it floating as you browse.
      </p>

      <a
        href={EXT_URL || "/download"}
        target={EXT_URL ? "_blank" : undefined}
        rel={EXT_URL ? "noopener noreferrer" : undefined}
        style={{
          display: "inline-block",
          padding: "6px 14px",
          background: "#0ea5e9",
          color: "#fff",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Install extension →
      </a>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64b5d9",
          padding: 4,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
