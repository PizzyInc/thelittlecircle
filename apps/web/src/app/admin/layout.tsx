import Link from "next/link";
import { Users, BarChart2, List, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/detections", label: "Detections", icon: List },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-slate-900 flex items-center px-6 gap-4 flex-shrink-0">
        <Link href="/admin/users" className="flex items-center gap-2 mr-6">
          <span
            className="flex-shrink-0 rounded-full flex items-center justify-center gap-[4px]"
            style={{
              width: 24, height: 24,
              background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
              boxShadow: "0 2px 6px rgba(255,180,150,0.4)",
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
          </span>
          <span className="font-semibold text-white text-sm">Admin</span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
