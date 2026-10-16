"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "For anyone who wants to start knowing",
    features: [
      "10 checks per day",
      "All modalities (images, video, text, audio, calls)",
      "1 device",
      "Tap-to-check",
      "Stealth mode (circle pops up when AI detected)",
    ],
    cta: "Get started free",
    ctaHref: "#download",
    highlight: false,
  },
  {
    name: "Pro",
    price: { monthly: 4.99, yearly: 39.99 },
    description: "For people who want unlimited protection",
    features: [
      "Unlimited checks",
      "All modalities",
      "All your devices",
      "Auto-detect",
      "Always-On mode (circle always visible)",
      "Priority detection",
    ],
    cta: "Get Pro",
    ctaHref: "/checkout?plan=pro",
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
    ctaHref: "/checkout?plan=family",
    highlight: false,
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sky-400 text-sm font-medium uppercase tracking-widest mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple. No surprises.
          </h2>
          <p className="text-white/40 text-lg">
            Free to start. Upgrade when you need more.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBilling("monthly")}
            className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-white" : "text-white/40"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing === "yearly" ? "bg-sky-500" : "bg-white/20"}`}
            aria-label="Toggle billing period"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${billing === "yearly" ? "translate-x-6" : ""}`}
            />
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`text-sm font-medium transition-colors ${billing === "yearly" ? "text-white" : "text-white/40"}`}
          >
            Yearly{" "}
            <span className="text-sky-400 text-xs ml-1">Save 33%</span>
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
                    ? "border-sky-500/60 bg-sky-500/10 glow-sky-sm"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-semibold">
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">{priceLabel}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                      <Check className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaHref}
                  className={`block w-full py-3 rounded-full text-sm font-semibold text-center transition-all ${
                    plan.highlight
                      ? "bg-sky-500 hover:bg-sky-400 text-white"
                      : "border border-white/20 hover:border-sky-500/50 text-white hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
