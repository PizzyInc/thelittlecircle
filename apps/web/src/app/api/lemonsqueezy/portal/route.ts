import { listSubscriptions } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { setupLS } from "@/lib/lemonsqueezy";

setupLS();

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Find the active subscription for this user
  const { data, error } = await listSubscriptions({
    filter: { userEmail: user.email ?? "" },
  });

  if (error || !data?.data?.length) {
    return NextResponse.json({ url: null });
  }

  // Return the customer portal URL for the first active subscription
  const sub = data.data[0];
  const portalUrl = sub.attributes.urls?.customer_portal ?? null;

  return NextResponse.json({ url: portalUrl });
}
