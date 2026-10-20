import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function setupLS() {
  // Trim to guard against accidental newlines or extra content in the env var
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.split("\n")[0].trim() ?? "";
  lemonSqueezySetup({ apiKey });
}

export const STORE_ID = "501579";

export const VARIANT_IDS = {
  pro_monthly:    "2267758",
  pro_yearly:     "2267760",
  family_monthly: "2267763",
  family_yearly:  "2267767",
} as const;

export type PlanVariant = keyof typeof VARIANT_IDS;

// Reverse map: variant ID → plan key (for webhooks)
export const VARIANT_TO_PLAN: Record<string, "pro" | "family"> = {
  "2267758": "pro",
  "1452890": "pro",
  "2267763": "family",
  "2267767": "family",
};
