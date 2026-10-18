import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ─── Text detection via GPTZero ───────────────────────────────────────────────

async function detectText(text: string) {
  const apiKey = process.env.GPTZERO_API_KEY;

  if (!apiKey) {
    // Mock mode — random result for UI development
    const ai = Math.random() > 0.4;
    return { verdict: ai ? "ai" : "real", confidence: 60 + Math.floor(Math.random() * 35), provider: "mock" } as const;
  }

  const res = await fetch("https://api.gptzero.me/v2/predict/text", {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ document: text }),
  });

  if (!res.ok) throw new Error(`GPTZero error: ${res.status}`);

  const data = await res.json();
  const prob: number = data.documents?.[0]?.completely_generated_prob ?? 0;

  return {
    verdict: (prob >= 0.5 ? "ai" : "real") as "ai" | "real",
    confidence: Math.round(prob * 100),
    provider: "gptzero",
  } as const;
}

// ─── Audio detection (mock) ───────────────────────────────────────────────────

async function detectAudio(_base64: string) {
  // No real API yet — mock result for UI development
  const ai = Math.random() > 0.4;
  return { verdict: ai ? "ai" : "real", confidence: 60 + Math.floor(Math.random() * 35), provider: "mock" } as const;
}

// ─── Video detection (mock) ───────────────────────────────────────────────────

async function detectVideo(_base64: string) {
  // No real API yet — mock result for UI development
  const ai = Math.random() > 0.4;
  return { verdict: ai ? "ai" : "real", confidence: 60 + Math.floor(Math.random() * 35), provider: "mock" } as const;
}

// ─── Image detection via Hive AI ─────────────────────────────────────────────

async function detectImage(base64: string) {
  const apiKey = process.env.HIVE_AI_API_KEY;

  if (!apiKey) {
    const ai = Math.random() > 0.4;
    return { verdict: ai ? "ai" : "real", confidence: 60 + Math.floor(Math.random() * 35), provider: "mock" } as const;
  }

  // Strip data URL prefix if present
  const raw = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "image/jpeg" });

  const form = new FormData();
  form.append("media", blob, "image.jpg");

  const res = await fetch("https://api.thehive.ai/api/v2/task/sync", {
    method: "POST",
    headers: { Authorization: `Token ${apiKey}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Hive AI error: ${res.status}`);

  const data = await res.json();
  const classes: { class: string; score: number }[] =
    data.status?.[0]?.response?.output?.[0]?.classes ?? [];

  const aiScore = classes.find((c) => c.class === "ai_generated")?.score ?? 0;

  return {
    verdict: (aiScore >= 0.5 ? "ai" : "real") as "ai" | "real",
    confidence: Math.round(aiScore * 100),
    provider: "hive",
  } as const;
}

// ─── CORS — needed so the Chrome extension content script can call this ──────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  // Also accept Bearer token (browser extension sends this)
  if (!user) {
    const bearer = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (bearer) {
      const { data } = await supabase.auth.getUser(bearer);
      user = data.user;
    }
  }
  // Allow anonymous detection — just won't save to history

  const body = await request.json();
  const { type, content, filename } = body as {
    type: "text" | "image" | "audio" | "video";
    content: string;
    filename?: string;
  };

  if (!type || !content) {
    return NextResponse.json({ error: "Missing type or content" }, { status: 400 });
  }

  try {
    let result: Awaited<ReturnType<typeof detectText>>;
    if (type === "text") {
      result = await detectText(content);
    } else if (type === "image") {
      result = await detectImage(content);
    } else if (type === "audio") {
      result = await detectAudio(content);
    } else {
      result = await detectVideo(content);
    }

    // Save to DB in background — skipped for anonymous (extension without login)
    const inputPreview =
      type === "text" ? content.slice(0, 200) : (filename ?? type);
    if (user) supabase.from("detections").insert({
      user_id: user.id,
      type,
      input_preview: inputPreview,
      verdict: result.verdict,
      confidence: result.confidence,
      provider: result.provider,
    }).then(({ error }) => {
      if (error) console.warn("Detection save failed (run SQL migrations?):", error.message);
    });

    return NextResponse.json({ verdict: result.verdict, confidence: result.confidence }, { headers: CORS });
  } catch (err) {
    console.error("Detection error:", err);
    return NextResponse.json({ error: "Detection failed. Try again." }, { status: 500, headers: CORS });
  }
}
