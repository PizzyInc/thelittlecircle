import React from "react";
import { createRoot } from "react-dom/client";
import FloatingCircle from "./circle/FloatingCircle";
import { CIRCLE_STYLES } from "./styles";

// Avoid double-injection
if (!document.getElementById("tlc-shadow-host")) {
  const host = document.createElement("div");
  host.id = "tlc-shadow-host";
  host.style.cssText = `
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 0 !important;
    height: 0 !important;
    overflow: visible !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
  `;
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Inject animation styles into the shadow root
  const styleEl = document.createElement("style");
  styleEl.textContent = CIRCLE_STYLES;
  shadow.appendChild(styleEl);

  // Container inside shadow DOM that allows pointer events on the circle
  const container = document.createElement("div");
  container.style.cssText = "position: fixed; left: 0; top: 0; width: 0; height: 0; overflow: visible; pointer-events: none;";
  shadow.appendChild(container);

  createRoot(container).render(<FloatingCircle />);
}
