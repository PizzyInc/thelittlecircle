"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ScanSearch, Settings, LogOut } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/detect", label: "Detect", icon: ScanSearch },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sky-200 flex items-stretch md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              active ? "text-sky-600" : "text-sky-400 hover:text-sky-600"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        );
      })}

      <form action="/auth/signout" method="POST" className="flex-1 flex">
        <button
          type="submit"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-sky-400 hover:text-sky-600 transition-colors"
        >
          <LogOut size={20} strokeWidth={1.8} />
          Sign out
        </button>
      </form>
    </nav>
  );
}
