import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { VARIANT_TO_PLAN } from "@/lib/lemonsqueezy";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName: string = event.meta?.event_name ?? "";
  const userId: string | undefined = event.meta?.custom_data?.user_id;
  const variantId = String(event.data?.attributes?.variant_id ?? "");
  const plan = VARIANT_TO_PLAN[variantId];

  if (!userId) return NextResponse.json({ ok: true }); // nothing to update

  const admin = getAdminClient();

  if (
    eventName === "subscription_created" ||
    eventName === "subscription_updated" ||
    eventName === "order_created"
  ) {
    if (plan) {
      await admin
        .from("user_profiles")
        .upsert({ user_id: userId, plan, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    }
  }

  if (
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired" ||
    eventName === "subscription_paused"
  ) {
    await admin
      .from("user_profiles")
      .upsert({ user_id: userId, plan: "free", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  }

  return NextResponse.json({ ok: true });
}
