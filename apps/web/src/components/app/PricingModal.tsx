"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "For anyone who wants to start knowing",
    features: [
      "10 checks per day",
      "Text and images",
      "AI or Real detection",
      "1 device",
      "Tap-to-check",
    ],
    cta: "Get started free",
    planKey: "free" as const,
    highlight: false,
  },
  {
    name: "Pro",
    price: { monthly: 4.99, yearly: 39.99 },
    description: "For people who want the full picture",
    features: [
      "Unlimited checks",
      "AI, Fake, or Real detection",
      "All content types",
      "All your devices",
      "Custom circle skin",
      "Stealth mode",
      "Voice commands",
    ],
    cta: "Subscribe",
    planKey: "pro" as const,
    highlight: true,
  },
  {
    name: "Family",
    price: { monthly: 9.99, yearly: 79.99 },
    description: "Pro for everyone in your household",
    features: [
      "Everything in Pro",
      "Up to 6 accounts",
      "One bill",
      "Separate profiles per member",
    ],
    cta: "Subscribe",
    planKey: "family" as const,
    highlight: false,
  },
];

export default function PricingModal({ open, onClose }: PricingModalProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<"pro" | "family" | null>(null);

  if (!open) return null;

  async function handleCta(planKey: "free" | "pro" | "family") {
    if (planKey === "free") {
      onClose();
      return;
    }
    setLoading(planKey);
    try {
      const variant = `${planKey}_${billing}` as const;
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed");
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(14,30,54,0.5)", backdropFilter: "blur(6px)" }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 hover:bg-sky-200 text-sky-700 transition-colors z-10"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="p-6 pb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-sky-500 text-xs font-medium uppercase tracking-widest mb-2">
              Pricing
            </p>
            <h2 className="text-2xl font-bold text-sky-950 mb-1">
              Simple. No surprises.
            </h2>
            <p className="text-sky-600 text-sm">
              Free to start. Upgrade when you need more.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBilling("monthly")}
              className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-sky-900" : "text-sky-400"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
              className={`relative w-11 h-6 rounded-full transition-colors ${billing === "yearly" ? "bg-sky-500" : "bg-sky-200"}`}
              aria-label="Toggle billing period"
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${billing === "yearly" ? "translate-x-5" : ""}`}
              />
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`text-sm font-medium transition-colors ${billing === "yearly" ? "text-sky-900" : "text-sky-400"}`}
            >
              Yearly{" "}
              <span className="text-sky-500 text-xs ml-1">Save 33%</span>
            </button>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const price =
                billing === "yearly" && plan.price.yearly !== null
                  ? plan.price.yearly
                  : plan.price.monthly;

              const priceLabel =
                price === 0
                  ? "Free"
                  : billing === "yearly" && plan.price.yearly !== null
                  ? `$${price}/yr`
                  : `$${price}/mo`;

              const isLoading = loading === plan.planKey;

              return (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-2xl border transition-all ${
                    plan.highlight
                      ? "border-sky-400 bg-sky-500 shadow-lg shadow-sky-200"
                      : "border-sky-200 bg-sky-50/50"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-900 text-white text-xs font-semibold whitespace-nowrap">
                      Most popular
                    </div>
                  )}

                  <div className="mb-4">
                    <h3
                      className={`text-lg font-bold mb-0.5 ${plan.highlight ? "text-white" : "text-sky-950"}`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-xs ${plan.highlight ? "text-sky-100" : "text-sky-500"}`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span
                      className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-sky-950"}`}
                    >
                      {priceLabel}
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs">
                        <Check
                          className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-sky-100" : "text-sky-500"}`}
                        />
                        <span className={plan.highlight ? "text-sky-50" : "text-sky-700"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCta(plan.planKey)}
                    disabled={isLoading}
                    className={`block w-full py-2.5 rounded-full text-sm font-semibold text-center transition-all disabled:opacity-70 ${
                      plan.highlight
                        ? "bg-white hover:bg-sky-50 text-sky-600"
                        : "border-2 border-sky-400 hover:bg-sky-500 hover:text-white text-sky-600"
                    }`}
                  >
                    {isLoading ? "Setting up payment…" : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
