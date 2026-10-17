"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Pro",
    price: "$4.99/mo",
    sub: "or $39.99/yr",
    features: ["All your devices", "Unlimited checks", "Auto-detect", "Always-On mode"],
    href: "/checkout?plan=pro",
    highlight: true,
  },
  {
    name: "Family",
    price: "$9.99/mo",
    sub: "up to 6 accounts",
    features: ["Everything in Pro", "6 separate accounts", "One bill", "Shared family plan"],
    href: "/checkout?plan=family",
    highlight: false,
  },
];

export default function DeviceLimitModal() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const overLimit = localStorage.getItem("tlc_over_limit") === "true";
    setShow(overLimit && pathname !== "/settings");

    function onLimitChange(e: Event) {
      const over = (e as CustomEvent<boolean>).detail;
      setShow(over && pathname !== "/settings");
    }
    function onStorage(e: StorageEvent) {
      if (e.key === "tlc_over_limit") {
        setShow(e.newValue === "true" && pathname !== "/settings");
      }
    }
    window.addEventListener("tlcDeviceLimitChange", onLimitChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("tlcDeviceLimitChange", onLimitChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(2, 14, 28, 0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 28,
          padding: "36px 32px 32px",
          maxWidth: 460,
          width: "100%",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        {/* Circle face — concerned */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
            boxShadow: "0 6px 24px rgba(255,180,150,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            gap: 2,
          }}
        >
          {/* Eyes */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  background: "#fff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 7, height: 7, background: "#2c2c2c", borderRadius: "50%", marginTop: 1 }} />
              </div>
            ))}
          </div>
          {/* Concerned mouth — flat line */}
          <div style={{ width: 14, height: 2, background: "#c4907a", borderRadius: 4, marginTop: 3 }} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0c4a6e", textAlign: "center", marginBottom: 8 }}>
          Device limit reached
        </h2>
        <p style={{ fontSize: 13, color: "#64B5D9", textAlign: "center", marginBottom: 28, lineHeight: 1.5 }}>
          The free plan supports <strong style={{ color: "#0369a1" }}>1 device</strong>.
          Upgrade to use The Little Circle on all your devices.
        </p>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {PLANS.map((plan) => (
            <a
              key={plan.name}
              href={plan.href}
              style={{
                display: "block",
                padding: "20px 16px",
                borderRadius: 18,
                textDecoration: "none",
                background: plan.highlight ? "linear-gradient(145deg, #0ea5e9, #0284c7)" : "#f0f9ff",
                border: plan.highlight ? "none" : "1.5px solid #bae6fd",
                boxShadow: plan.highlight ? "0 8px 24px rgba(14,165,233,0.35)" : "none",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 700, color: plan.highlight ? "#fff" : "#0c4a6e", marginBottom: 2 }}>
                {plan.name}
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: plan.highlight ? "#fff" : "#0369a1", marginBottom: 2 }}>
                {plan.price}
              </p>
              <p style={{ fontSize: 11, color: plan.highlight ? "rgba(255,255,255,0.7)" : "#64B5D9", marginBottom: 14 }}>
                {plan.sub}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <Check size={12} style={{ color: plan.highlight ? "#bae6fd" : "#0ea5e9", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: plan.highlight ? "#e0f2fe" : "#0369a1", lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>
            </a>
          ))}
        </div>

        {/* Manage devices */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => {
              if (pathname !== "/settings") router.push("/settings");
            }}
            style={{ fontSize: 12, color: "#64B5D9", textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Or remove a device in Settings →
          </button>
        </div>
      </div>
    </div>
  );
}
