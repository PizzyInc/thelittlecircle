"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface PricingProps {
  onPlanSelect?: (plan: string) => void;
}

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "For anyone who wants to start knowing",
    features: [
      "10 checks per day",
      "Text, images, audio, video",
      "1 device",
      "Tap-to-check",
    ],
    cta: "Get started free",
    planKey: "free",
    highlight: false,
  },
  {
    name: "Pro",
    price: { monthly: 4.99, yearly: 39.99 },
    description: "For people who want unlimited protection",
    features: [
      "Unlimited checks",
      "All content types",
      "All your devices",
      "Stealth mode",
      "Always-On mode",
      "Priority detection",
    ],
    cta: "Get Pro",
    planKey: "pro",
    highlight: true,
  },
  {
    name: "Family",
    price: { monthly: 9.99, yearly: null },
    description: "Pro for everyone in your household",
    features: [
      "Everything in Pro",
      "Up to 6 accounts",
      "One bill",
      "Separate profiles per member",
    ],
    cta: "Get Family",
    planKey: "family",
    highlight: false,
  },
];

export default function Pricing({ onPlanSelect }: PricingProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [toast, setToast] = useState<string | null>(null);

  function handleCta(plan: (typeof plans)[0]) {
    if (plan.planKey === "free") {
      document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (onPlanSelect) {
      onPlanSelect(plan.planKey);
    } else {
      setToast("Coming soon. Payment will be available shortly!");
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sky-500 text-sm font-medium uppercase tracking-widest mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-sky-950 mb-4">
            Simple. No surprises.
          </h2>
          <p className="text-sky-600 text-lg">
            Free to start. Upgrade when you need more.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBilling("monthly")}
            className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-sky-900" : "text-sky-400"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing === "yearly" ? "bg-sky-500" : "bg-sky-200"}`}
            aria-label="Toggle billing period"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${billing === "yearly" ? "translate-x-6" : ""}`}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            return (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.highlight
                    ? "border-sky-400 bg-sky-500 shadow-lg shadow-sky-200"
                    : "border-sky-200 bg-white/70"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-900 text-white text-xs font-semibold">
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-sky-950"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${plan.highlight ? "text-sky-100" : "text-sky-500"}`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <span
                    className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-sky-950"}`}
                  >
                    {priceLabel}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-sky-100" : "text-sky-500"}`}
                      />
                      <span className={plan.highlight ? "text-sky-50" : "text-sky-700"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCta(plan)}
                  className={`block w-full py-3 rounded-full text-sm font-semibold text-center transition-all ${
                    plan.highlight
                      ? "bg-white hover:bg-sky-50 text-sky-600"
                      : "border-2 border-sky-400 hover:bg-sky-500 hover:text-white text-sky-600"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-sky-900 text-white px-6 py-3 rounded-full text-sm shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </section>
  );
}
