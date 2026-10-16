import { createClient } from "@/lib/supabase/server";
import { FileText, Image as ImageIcon } from "lucide-react";
import CircleToggleCard from "@/components/app/CircleToggleCard";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count: checksToday }, { count: aiTotal }, { data: recent }] = await Promise.all([
    supabase
      .from("detections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", todayStart.toISOString()),

    supabase
      .from("detections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("verdict", "ai"),

    supabase
      .from("detections")
      .select("id, type, input_preview, verdict, confidence, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const stats = [
    { label: "Checks today", value: String(checksToday ?? 0), sub: "via web or app" },
    { label: "AI detected", value: String(aiTotal ?? 0), sub: "all time" },
    { label: "Real content", value: String(Math.max(0, ((checksToday ?? 0) - (aiTotal ?? 0)))), sub: "all time" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sky-950">Dashboard</h1>
        <p className="text-sky-500 text-sm mt-1">
          Your detection activity. Tap the circle in the corner to check anything.
        </p>
      </div>

      <CircleToggleCard />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-sky-200 p-6">
            <p className="text-sky-400 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-sky-950 mb-1">{stat.value}</p>
            <p className="text-sky-400 text-xs">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent detections */}
      <div className="bg-white rounded-2xl border border-sky-200 p-6">
        <h2 className="text-sm font-semibold text-sky-900 mb-4">Recent detections</h2>

        {!recent || recent.length === 0 ? (
          <div className="py-16 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center gap-[6px] mx-auto mb-4"
              style={{
                background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
                boxShadow: "0 4px 16px rgba(255,180,150,0.5)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
            </div>
            <p className="text-sky-500 text-sm font-medium">No detections yet</p>
            <p className="text-sky-400 text-xs mt-1">Tap the circle in the bottom-right to check something.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl border border-sky-100 hover:bg-sky-50/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  d.type === "image" ? "bg-purple-50" : "bg-sky-50"
                }`}>
                  {d.type === "image"
                    ? <ImageIcon size={14} className="text-purple-400" />
                    : <FileText size={14} className="text-sky-400" />
                  }
                </div>

                <p className="flex-1 text-xs text-sky-700 truncate min-w-0">
                  {d.input_preview ?? (d.type === "image" ? "Image" : "Text")}
                </p>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  d.verdict === "ai"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {d.verdict === "ai" ? "AI" : "Real"} {d.confidence}%
                </span>

                <span className="text-[11px] text-sky-400 flex-shrink-0 hidden sm:block">
                  {timeAgo(d.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
