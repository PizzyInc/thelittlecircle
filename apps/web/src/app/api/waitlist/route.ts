import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { email, platform } = await request.json();
  if (!email || !platform) {
    return NextResponse.json({ error: "Missing email or platform" }, { status: 400 });
  }

  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (svcKey) {
    const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, svcKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await admin.from("waitlist").insert({ email, platform });
  }

  return NextResponse.json({ ok: true });
}
