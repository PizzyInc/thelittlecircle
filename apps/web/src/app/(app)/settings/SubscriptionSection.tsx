"use client";

import { useEffect, useState } from "react";
import PricingModal from "@/components/app/PricingModal";

type Plan = "free" | "pro" | "family";

const PRO_FEATURES = [
  "Unlimited checks",
  "Stealth mode",
  "Always-On mode",
  "All devices",
];

export default function SubscriptionSection() {
  const [plan, setPlan] = useState<Plan>("free");
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tlc_plan") ?? "free";
    if (stored === "pro" || stored === "family") setPlan(stored as Plan);
  }, []);

  const isPro = plan !== "free";
  const label = plan === "family" ? "Family" : plan === "pro" ? "Pro" : "Free";

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
        <p className="text-xs text-sky-500">
          You&apos;re on the{" "}
          <span className="font-semibold text-sky-700">{label}</span> plan.{" "}
          <a href="/#pricing" className="underline hover:text-sky-700 transition-colors">
            Manage
          </a>
        </p>
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
        onSubscribe={(p) => {
          localStorage.setItem("tlc_plan", p);
          setPlan(p);
          setShowPricingModal(false);
        }}
      />
    </div>
  );
}
