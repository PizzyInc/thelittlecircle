import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ plan: "free" });

  const { data } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ plan: data?.plan ?? "free" });
}
