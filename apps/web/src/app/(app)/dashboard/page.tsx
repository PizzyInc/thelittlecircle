"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileText, Image as ImageIcon, Mic, Video, X } from "lucide-react";
import CircleToggleCard from "@/components/app/CircleToggleCard";

const PAGE_SIZE = 10;

type Detection = {
  id: string;
  type: string;
  input_preview: string | null;
  verdict: string;
  confidence: number;
  created_at: string;
};

type DayData = {
  date: string;
  day: string;
  ai: number;
  real: number;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function todayLocalYMD(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function toLocalYMD(isoStr: string): string {
  const d = new Date(isoStr);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function getLast7Days(): { date: string; day: string }[] {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    result.push({
      date: [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-"),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return result;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [upgraded, setUpgraded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayLocalYMD());
  const [view, setView] = useState<"list" | "chart">("list");

  // Stats
  const [checksToday, setChecksToday] = useState(0);
  const [aiTotal, setAiTotal] = useState(0);
  const [realTotal, setRealTotal] = useState(0);

  // List
  const [detections, setDetections] = useState<Detection[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Chart
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Show upgrade banner and sync plan from Supabase
  useEffect(() => {
    if (searchParams.get("upgraded") === "1") {
      setUpgraded(true);
      fetch("/api/plan")
        .then((r) => r.json())
        .then(({ plan }) => {
          if (plan === "pro" || plan === "family") {
            localStorage.setItem("tlc_plan", plan);
          }
        })
        .catch(() => {});
      router.replace("/dashboard", { scroll: false });
    }

    // After signup from landing page with a plan selected — trigger checkout
    const checkoutVariant = searchParams.get("checkout");
    if (checkoutVariant) {
      router.replace("/dashboard", { scroll: false });
      fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: checkoutVariant }),
      })
        .then((r) => r.json())
        .then(({ url }) => { if (url) window.location.href = url; })
        .catch(() => {});
    }
  }, [searchParams, router]);

  // Resolve current user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  // Load stats (always today / all-time — independent of date filter)
  useEffect(() => {
    if (!userId) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    Promise.all([
      supabase
        .from("detections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("detections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("verdict", "ai"),
      supabase
        .from("detections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("verdict", "real"),
    ]).then(([{ count: ct }, { count: at }, { count: rt }]) => {
      setChecksToday(ct ?? 0);
      setAiTotal(at ?? 0);
      setRealTotal(rt ?? 0);
    });
  }, [userId, supabase]);

  // Load first page of detections whenever user or date filter changes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setDetections([]);
    setHasMore(false);
    setListLoading(true);

    (async () => {
      let q = supabase
        .from("detections")
        .select("id, type, input_preview, verdict, confidence, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (selectedDate !== null) {
        const dayStart = new Date(selectedDate + "T00:00:00");
        const dayEnd = new Date(selectedDate + "T00:00:00");
        dayEnd.setDate(dayEnd.getDate() + 1);
        q = q.gte("created_at", dayStart.toISOString()).lt("created_at", dayEnd.toISOString());
      }

      const { data } = await q;
      if (!cancelled) {
        setListLoading(false);
        if (data) {
          setDetections(data);
          setHasMore(data.length === PAGE_SIZE);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [userId, selectedDate, supabase]);

  // Load chart data when switching to chart view
  useEffect(() => {
    if (!userId || view !== "chart") return;
    let cancelled = false;
    setChartLoading(true);

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6);

    supabase
      .from("detections")
      .select("verdict, created_at")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString())
      .then(({ data }) => {
        if (cancelled) return;
        setChartLoading(false);
        const days = getLast7Days();
        const grouped: Record<string, { ai: number; real: number }> = {};
        days.forEach((d) => { grouped[d.date] = { ai: 0, real: 0 }; });
        (data ?? []).forEach((det) => {
          const date = toLocalYMD(det.created_at);
          if (grouped[date]) {
            if (det.verdict === "ai") grouped[date].ai++;
            else grouped[date].real++;
          }
        });
        setChartData(days.map((d) => ({ ...d, ai: grouped[d.date].ai, real: grouped[d.date].real })));
      });

    return () => { cancelled = true; };
  }, [userId, view, supabase]);

  // Append next page
  const handleLoadMore = async () => {
    if (!userId || listLoading) return;
    setListLoading(true);
    const from = detections.length;

    let q = supabase
      .from("detections")
      .select("id, type, input_preview, verdict, confidence, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (selectedDate !== null) {
      const dayStart = new Date(selectedDate + "T00:00:00");
      const dayEnd = new Date(selectedDate + "T00:00:00");
      dayEnd.setDate(dayEnd.getDate() + 1);
      q = q.gte("created_at", dayStart.toISOString()).lt("created_at", dayEnd.toISOString());
    }

    const { data } = await q;
    setListLoading(false);
    if (data) {
      setDetections((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
  };

  // Chart geometry
  const BAR_H = 80;
  const BAR_W = 20;
  const GROUP_W = 48;
  const CHART_W = GROUP_W * 7;
  const maxBar = Math.max(...chartData.map((d) => d.ai + d.real), 1);

  const stats = [
    { label: "Checks today", value: String(checksToday), sub: "via web or app" },
    { label: "AI detected", value: String(aiTotal), sub: "all time" },
    { label: "Real content", value: String(realTotal), sub: "all time" },
  ];

  return (
    <div>
      {upgraded && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-xl">🎉</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800">Welcome to Pro!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Your circle can now detect AI, Fake, and Real content. Tap it on any page to try.
            </p>
          </div>
          <button
            onClick={() => setUpgraded(false)}
            className="flex-shrink-0 text-emerald-400 hover:text-emerald-600 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

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

      {/* Detections panel */}
      <div className="bg-white rounded-2xl border border-sky-200 p-6">

        {/* Header: title + view toggle + date filter */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-sky-900 flex-1 min-w-0">Recent detections</h2>

          {/* View toggle */}
          <div className="flex rounded-lg border border-sky-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 transition-colors ${
                view === "list" ? "bg-sky-100 text-sky-700" : "text-sky-400 hover:bg-sky-50"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("chart")}
              className={`px-3 py-1.5 transition-colors ${
                view === "chart" ? "bg-sky-100 text-sky-700" : "text-sky-400 hover:bg-sky-50"
              }`}
            >
              Chart
            </button>
          </div>

          {/* Date filter — list view only */}
          {view === "list" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate ?? ""}
                onChange={(e) => setSelectedDate(e.target.value || null)}
                className="text-xs border border-sky-200 rounded-lg px-2 py-1.5 text-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-300"
              />
              <button
                onClick={() => setSelectedDate(null)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  selectedDate === null
                    ? "bg-sky-100 border-sky-300 text-sky-700 font-medium"
                    : "border-sky-200 text-sky-400 hover:bg-sky-50"
                }`}
              >
                All time
              </button>
            </div>
          )}
        </div>

        {/* ── Chart view ─────────────────────────────────────────────── */}
        {view === "chart" && (
          <div>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-xs text-sky-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#fb923c" }} />
                AI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#4ade80" }} />
                Real
              </span>
            </div>

            {chartLoading ? (
              <div className="h-32 flex items-center justify-center text-sky-300 text-sm">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <svg
                  width={CHART_W}
                  height={BAR_H + 28}
                  viewBox={`0 0 ${CHART_W} ${BAR_H + 28}`}
                  style={{ minWidth: CHART_W, display: "block" }}
                >
                  {chartData.map((d, i) => {
                    const total = d.ai + d.real;
                    const totalH = total > 0 ? Math.max(4, Math.round((total / maxBar) * BAR_H)) : 0;
                    const aiH = total > 0 ? Math.round((d.ai / total) * totalH) : 0;
                    const realH = totalH - aiH;
                    const x = i * GROUP_W + (GROUP_W - BAR_W) / 2;

                    return (
                      <g key={d.date}>
                        {/* AI portion — top of stack, orange */}
                        {aiH > 0 && (
                          <rect
                            x={x}
                            y={BAR_H - totalH}
                            width={BAR_W}
                            height={aiH}
                            fill="#fb923c"
                          />
                        )}
                        {/* Real portion — bottom of stack, green */}
                        {realH > 0 && (
                          <rect
                            x={x}
                            y={BAR_H - totalH + aiH}
                            width={BAR_W}
                            height={realH}
                            fill="#4ade80"
                          />
                        )}
                        {/* Empty day marker */}
                        {totalH === 0 && (
                          <rect x={x} y={BAR_H - 3} width={BAR_W} height={3} fill="#e0f2fe" />
                        )}
                        {/* Day label */}
                        <text
                          x={x + BAR_W / 2}
                          y={BAR_H + 17}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize={10}
                          fontFamily="inherit"
                        >
                          {d.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        )}

        {/* ── List view ──────────────────────────────────────────────── */}
        {view === "list" && (
          <>
            {listLoading && detections.length === 0 ? (
              <div className="py-16 text-center text-sky-300 text-sm">Loading…</div>
            ) : detections.length === 0 ? (
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
                <p className="text-sky-500 text-sm font-medium">
                  No detections {selectedDate ? "on this day" : "yet"}
                </p>
                <p className="text-sky-400 text-xs mt-1">
                  Tap the circle in the bottom-right to check something.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {detections.map((d) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      image: <ImageIcon size={14} className="text-purple-400" />,
                      audio: <Mic size={14} className="text-pink-400" />,
                      video: <Video size={14} className="text-indigo-400" />,
                    };
                    const bgMap: Record<string, string> = {
                      image: "bg-purple-50",
                      audio: "bg-pink-50",
                      video: "bg-indigo-50",
                    };
                    const fallbackPreview =
                      d.type === "image" ? "Image"
                      : d.type === "audio" ? "Audio"
                      : d.type === "video" ? "Video"
                      : "Text";

                    return (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-sky-100 hover:bg-sky-50/50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bgMap[d.type] ?? "bg-sky-50"}`}>
                          {iconMap[d.type] ?? <FileText size={14} className="text-sky-400" />}
                        </div>

                        <p className="flex-1 text-xs text-sky-700 truncate min-w-0">
                          {d.input_preview ?? fallbackPreview}
                        </p>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                            d.verdict === "ai"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {d.verdict === "ai" ? "AI" : "Real"} {d.confidence}%
                        </span>

                        <span className="text-[11px] text-sky-400 flex-shrink-0 hidden sm:block">
                          {timeAgo(d.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={listLoading}
                      className="px-6 py-2 text-sm font-medium text-sky-600 border border-sky-200 rounded-xl hover:bg-sky-50 transition-colors disabled:opacity-50"
                    >
                      {listLoading ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
