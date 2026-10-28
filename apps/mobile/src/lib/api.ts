import { supabase } from "./supabase";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://www.thelittlecircle.com";

export type Verdict = "ai" | "real" | "fake";

export interface DetectResult {
  verdict: Verdict;
  confidence: number;
}

export async function detect(
  type: "text" | "image" | "audio" | "video",
  content: string,
  filename?: string,
): Promise<DetectResult> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API}/api/detect`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type, content, filename }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Detection failed");
  }

  return res.json() as Promise<DetectResult>;
}
