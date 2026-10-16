export type Modality = "image" | "video" | "text" | "audio" | "live_video" | "live_audio";

export type DetectionVerdict = "AI" | "NOT_AI" | "INCONCLUSIVE";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface DetectionResult {
  verdict: DetectionVerdict;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-1
  modality: Modality;
  explanation?: string;
  detectedAt: string; // ISO timestamp
  poweredBy: "Rantera";
}

export interface DetectionRequest {
  modality: Modality;
  content: string; // URL or base64
  userId: string;
}

export type PlanTier = "free" | "pro" | "family";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: PlanTier;
  checksUsedToday: number;
  checksLimitPerDay: number; // 10 for free, -1 for unlimited
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  platform: "ios" | "android" | "web" | "macos" | "windows";
  isActive: boolean;
  circleMode: "stealth" | "always_on";
  lastSeenAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
}

export interface FamilyMember {
  id: string;
  familyOwnerId: string;
  userId: string;
  joinedAt: string;
}

export const PLAN_LIMITS: Record<PlanTier, { checksPerDay: number; maxDevices: number; autoDetect: boolean }> = {
  free: { checksPerDay: 10, maxDevices: 1, autoDetect: false },
  pro: { checksPerDay: -1, maxDevices: -1, autoDetect: true },
  family: { checksPerDay: -1, maxDevices: -1, autoDetect: true },
};

export const PLAN_PRICES = {
  pro: { monthly: 4.99, yearly: 39.99 },
  family: { monthly: 9.99, yearly: null },
};
