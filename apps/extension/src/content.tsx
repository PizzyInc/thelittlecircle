import React from "react";
import { createRoot } from "react-dom/client";
import FloatingCircle from "./circle/FloatingCircle";
import { CIRCLE_STYLES } from "./styles";

// Remove any stale shadow host from a previous extension context, then re-inject fresh.
const _stale = document.getElementById("tlc-shadow-host");
if (_stale) _stale.remove();

{
  const host = document.createElement("div");
  host.id = "tlc-shadow-host";
  // Full-viewport coverage so Chrome includes the shadow tree in hit-testing.
  // pointer-events: none on the host lets page events through; the circle
  // inside re-enables them with pointer-events: auto.
  host.style.cssText = `
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
  `;
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = CIRCLE_STYLES;
  shadow.appendChild(styleEl);

  const container = document.createElement("div");
  container.style.cssText = "position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; pointer-events: none;";
  shadow.appendChild(container);

  createRoot(container).render(<FloatingCircle />);
}
