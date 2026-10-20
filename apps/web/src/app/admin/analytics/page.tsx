import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mb-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const admin = adminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { data: allDetections },
    { data: recentDetections },
    { data: profiles },
  ] = await Promise.all([
    admin.from("user_profiles").select("*", { count: "exact", head: true }),
    admin.from("detections").select("verdict, type, user_id, confidence"),
    admin.from("detections")
      .select("created_at, verdict")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    admin.from("user_profiles").select("plan"),
  ]);

  const detections = allDetections ?? [];
  const total = detections.length;

  const byVerdict = { ai: 0, real: 0, fake: 0 };
  const byType: Record<string, number> = {};
  const userCheckCount: Record<string, number> = {};

  for (const d of detections) {
    if (d.verdict in byVerdict) byVerdict[d.verdict as keyof typeof byVerdict]++;
    byType[d.type] = (byType[d.type] ?? 0) + 1;
    if (d.user_id) userCheckCount[d.user_id] = (userCheckCount[d.user_id] ?? 0) + 1;
  }

  const pct = (n: number) => total > 0 ? `${Math.round((n / total) * 100)}%` : "—";

  const planCounts = { free: 0, pro: 0, family: 0 };
  for (const p of profiles ?? []) {
    const pl = p.plan as keyof typeof planCounts;
    if (pl in planCounts) planCounts[pl]++;
  }

  // 30-day chart
  const days: { date: string; label: string; ai: number; real: number; fake: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), ai: 0, real: 0, fake: 0 });
  }
  for (const d of recentDetections ?? []) {
    const dateStr = d.created_at.slice(0, 10);
    const day = days.find((x) => x.date === dateStr);
    if (day) day[d.verdict as "ai" | "real" | "fake"]++;
  }
  const maxBar = Math.max(...days.map((d) => d.ai + d.real + d.fake), 1);

  // Top 5 users by detection count
  const topUsers = Object.entries(userCheckCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Fetch emails for top users
  const topUserEmails: Record<string, string> = {};
  await Promise.all(
    topUsers.map(async ([uid]) => {
      const { data } = await admin.auth.admin.getUserById(uid);
      if (data?.user?.email) topUserEmails[uid] = data.user.email;
    })
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform-wide detection activity.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Users" value={(totalUsers ?? 0).toLocaleString()} />
        <StatTile label="Total Checks" value={total.toLocaleString()} />
        <StatTile label="AI Detected" value={byVerdict.ai.toLocaleString()} sub={pct(byVerdict.ai)} />
        <StatTile label="Real" value={byVerdict.real.toLocaleString()} sub={pct(byVerdict.real)} />
        <StatTile label="Fake" value={byVerdict.fake.toLocaleString()} sub={pct(byVerdict.fake)} />
        <StatTile label="Pro Users" value={planCounts.pro.toLocaleString()} />
        <StatTile label="Family Users" value={planCounts.family.toLocaleString()} />
        <StatTile label="Free Users" value={planCounts.free.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 30-day bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-semibold text-slate-700 mb-4">Detections — last 30 days</p>
          <div className="flex items-end gap-1 h-36">
            {days.map((d) => {
              const h = ((d.ai + d.real + d.fake) / maxBar) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div
                    className="w-full rounded-sm bg-sky-400 group-hover:bg-sky-500 transition-colors"
                    style={{ height: `${h}%`, minHeight: h > 0 ? 2 : 0 }}
                  />
                  {/* tooltip */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                    {d.label}: {d.ai + d.real + d.fake}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>{days[0].label}</span>
            <span>{days[days.length - 1].label}</span>
          </div>
        </div>

        {/* Breakdown by type */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-semibold text-slate-700 mb-4">By content type</p>
          <div className="space-y-3">
            {["text", "image", "audio", "video"].map((t) => {
              const n = byType[t] ?? 0;
              const w = total > 0 ? (n / total) * 100 : 0;
              return (
                <div key={t}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="capitalize">{t}</span>
                    <span>{n.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${w}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top users */}
      {topUsers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-semibold text-slate-700 mb-4">Top users by checks</p>
          <div className="space-y-2">
            {topUsers.map(([uid, count], i) => (
              <div key={uid} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <span className="text-sm text-slate-700 flex-1 truncate">{topUserEmails[uid] ?? uid}</span>
                <span className="text-sm font-semibold text-slate-900">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
