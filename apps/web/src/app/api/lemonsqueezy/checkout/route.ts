import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { setupLS, STORE_ID, VARIANT_IDS, type PlanVariant } from "@/lib/lemonsqueezy";

export async function POST(request: NextRequest) {
  // Set up inside handler so the API key env var is always available
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    console.error("LEMONSQUEEZY_API_KEY is not set");
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }
  setupLS();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { variant } = body as { variant: PlanVariant };

  if (!VARIANT_IDS[variant]) {
    return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thelittlecircle.com";

  const { data, error } = await createCheckout(STORE_ID, VARIANT_IDS[variant], {
    checkoutOptions: {
      embed: false,
      media: false,
    },
    checkoutData: {
      email: user.email ?? undefined,
      custom: { user_id: user.id },
    },
    productOptions: {
      enabledVariants: [Number(VARIANT_IDS[variant])],
      redirectUrl: `${appUrl}/dashboard?upgraded=1`,
      receiptButtonText: "Go to dashboard",
      receiptThankYouNote: "Welcome to Pro! Your circle is now upgraded.",
    },
  });

  if (error || !data) {
    console.error("LS checkout error:", JSON.stringify(error));
    return NextResponse.json(
      { error: "Failed to create checkout", detail: (error as any)?.message ?? String(error) },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.data.attributes.url });
}
