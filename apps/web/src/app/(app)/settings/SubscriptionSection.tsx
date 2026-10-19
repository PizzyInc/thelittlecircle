"use client";

import { useEffect, useState } from "react";
import PricingModal from "@/components/app/PricingModal";

type Plan = "free" | "pro" | "family";

const PRO_FEATURES = [
  "Unlimited checks",
  "AI, Fake, or Real detection",
  "Custom circle skin",
  "Stealth mode",
  "Voice commands",
  "All devices",
];

export default function SubscriptionSection() {
  const [plan, setPlan] = useState<Plan>("free");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    // Sync plan from Supabase (source of truth after payment)
    fetch("/api/plan")
      .then((r) => r.json())
      .then(({ plan: p }) => {
        if (p === "pro" || p === "family") {
          setPlan(p);
          localStorage.setItem("tlc_plan", p);
        } else {
          // Fall back to localStorage if Supabase has no record yet
          const stored = localStorage.getItem("tlc_plan") ?? "free";
          if (stored === "pro" || stored === "family") setPlan(stored as Plan);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem("tlc_plan") ?? "free";
        if (stored === "pro" || stored === "family") setPlan(stored as Plan);
      });
  }, []);

  const isPro = plan !== "free";
  const label = plan === "family" ? "Family" : plan === "pro" ? "Pro" : "Free";

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/lemonsqueezy/portal");
      const { url } = await res.json();
      if (url) {
        window.open(url, "_blank");
      }
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-sky-200 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-sky-900">Subscription</h2>
          <p className="text-sky-400 text-xs mt-0.5">Plan, billing, usage</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isPro ? "bg-violet-100 text-violet-600" : "bg-sky-100 text-sky-500"
          }`}
        >
          {label}
        </span>
      </div>

      {isPro ? (
        <div className="space-y-2">
          <p className="text-xs text-sky-500">
            You&apos;re on the{" "}
            <span className="font-semibold text-sky-700">{label}</span> plan.
          </p>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors disabled:opacity-50"
          >
            {portalLoading ? "Opening…" : "Manage subscription →"}
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-sky-200 rounded-xl p-4">
          <p className="text-xs font-medium text-sky-800 mb-2">Unlock with Pro</p>
          <ul className="space-y-1.5 mb-4">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-sky-600">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowPricingModal(true)}
            className="inline-block text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-xl transition-colors"
          >
            See plans →
          </button>
        </div>
      )}

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
}
