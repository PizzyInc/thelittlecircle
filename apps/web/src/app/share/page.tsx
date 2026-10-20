import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ShareDetector from "./ShareDetector";

export const metadata = { title: "Scanning… | The Little Circle" };

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string; url?: string; title?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { text, url, title } = await searchParams;
  return <ShareDetector text={text} url={url} title={title} />;
}
