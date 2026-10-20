import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function planBadge(plan: string) {
  const styles: Record<string, string> = {
    pro: "bg-sky-100 text-sky-700",
    family: "bg-purple-100 text-purple-700",
    free: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[plan] ?? styles.free}`}>
      {plan}
    </span>
  );
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>;
}) {
  const { q, plan: planFilter } = await searchParams;
  const admin = adminClient();

  const [{ data: authData }, { data: profiles }, { data: detectionCounts }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("user_profiles").select("user_id, plan"),
    admin.from("detections").select("user_id").not("user_id", "is", null),
  ]);

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.user_id, p.plan as string])
  );

  const countMap: Record<string, number> = {};
  for (const d of detectionCounts ?? []) {
    if (d.user_id) countMap[d.user_id] = (countMap[d.user_id] ?? 0) + 1;
  }

  let users = (authData?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    plan: profileMap[u.id] ?? "free",
    checks: countMap[u.id] ?? 0,
    joined: u.created_at,
    lastSeen: u.last_sign_in_at ?? null,
  }));

  if (q) users = users.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()));
  if (planFilter && planFilter !== "all") users = users.filter((u) => u.plan === planFilter);

  users.sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <form className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Search by email..."
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-56"
          />
          <select
            name="plan"
            defaultValue={planFilter ?? "all"}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="family">Family</option>
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
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Checks</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{u.email}</td>
                  <td className="px-6 py-3.5">{planBadge(u.plan)}</td>
                  <td className="px-6 py-3.5 text-slate-600">{u.checks.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-slate-500">{fmt(u.joined)}</td>
                  <td className="px-6 py-3.5 text-slate-500">{fmt(u.lastSeen)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
