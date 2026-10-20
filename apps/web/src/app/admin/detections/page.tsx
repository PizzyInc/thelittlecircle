import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE = 50;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function verdictBadge(verdict: string) {
  const map: Record<string, string> = {
    ai: "bg-orange-100 text-orange-700",
    real: "bg-emerald-100 text-emerald-700",
    fake: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[verdict] ?? "bg-slate-100 text-slate-500"}`}>
      {verdict}
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function AdminDetectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ verdict?: string; type?: string; user?: string; page?: string }>;
}) {
  const { verdict: vFilter, type: tFilter, user: uFilter, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const admin = adminClient();

  // Resolve email filter → user_id
  let filteredUserId: string | null = null;
  if (uFilter) {
    const { data: found } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const match = (found?.users ?? []).find((u) =>
      u.email?.toLowerCase().includes(uFilter.toLowerCase())
    );
    filteredUserId = match?.id ?? "no-match";
  }

  let query = admin
    .from("detections")
    .select("id, user_id, type, input_preview, verdict, confidence, provider, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (vFilter && vFilter !== "all") query = query.eq("verdict", vFilter);
  if (tFilter && tFilter !== "all") query = query.eq("type", tFilter);
  if (filteredUserId) query = query.eq("user_id", filteredUserId);

  const { data: detections, count } = await query;

  // Fetch emails for unique user IDs in this page
  const userIds = [...new Set((detections ?? []).map((d) => d.user_id).filter(Boolean))];
  const emailMap: Record<string, string> = {};
  await Promise.all(
    userIds.map(async (uid) => {
      const { data } = await admin.auth.admin.getUserById(uid!);
      if (data?.user?.email) emailMap[uid!] = data.user.email;
    })
  );

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (vFilter && vFilter !== "all") params.set("verdict", vFilter);
    if (tFilter && tFilter !== "all") params.set("type", tFilter);
    if (uFilter) params.set("user", uFilter);
    params.set("page", String(p));
    return `/admin/detections?${params.toString()}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Detections</h1>
          <p className="text-slate-500 text-sm mt-0.5">{(count ?? 0).toLocaleString()} total</p>
        </div>
        <form className="flex items-center gap-2 flex-wrap">
          <input
            name="user"
            defaultValue={uFilter}
            type="search"
            placeholder="Filter by email..."
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48"
          />
          <select name="verdict" defaultValue={vFilter ?? "all"} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="all">All verdicts</option>
            <option value="ai">AI</option>
            <option value="real">Real</option>
            <option value="fake">Fake</option>
          </select>
          <select name="type" defaultValue={tFilter ?? "all"} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="all">All types</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
          <button type="submit" className="px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Verdict</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider max-w-xs">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(detections ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">No detections found.</td>
              </tr>
            ) : (
              (detections ?? []).map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">{fmt(d.created_at)}</td>
                  <td className="px-6 py-3.5 text-slate-700 max-w-[180px] truncate">{d.user_id ? (emailMap[d.user_id] ?? d.user_id.slice(0, 8) + "…") : "anon"}</td>
                  <td className="px-6 py-3.5 text-slate-600 capitalize">{d.type}</td>
                  <td className="px-6 py-3.5">{verdictBadge(d.verdict)}</td>
                  <td className="px-6 py-3.5 text-slate-600">{d.confidence}%</td>
                  <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate text-xs">{d.input_preview ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={buildUrl(page - 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
                Previous
              </a>
            )}
            {page < totalPages && (
              <a href={buildUrl(page + 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
