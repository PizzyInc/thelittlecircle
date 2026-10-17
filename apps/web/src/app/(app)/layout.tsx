import Link from "next/link";
import { LayoutDashboard, Settings, LogOut, ScanSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeviceRegistrar from "./settings/DeviceRegistrar";
import FloatingCircle from "@/components/app/FloatingCircle";
import DeviceLimitModal from "@/components/app/DeviceLimitModal";
import CircleNameOnboarding from "@/components/app/CircleNameOnboarding";
import NavProgress from "@/components/app/NavProgress";
import CircleLogo from "@/components/CircleLogo";
import ExtensionBanner from "@/components/app/ExtensionBanner";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/detect", label: "Detect", icon: ScanSearch },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      <NavProgress />
      <DeviceRegistrar userId={user.id} />
      <FloatingCircle />
      <DeviceLimitModal />
      <CircleNameOnboarding />

      <header className="h-14 bg-white border-b border-sky-200 flex items-center px-4 sm:px-6 gap-2 sm:gap-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 mr-2 sm:mr-6 shrink-0">
          <CircleLogo size={24} />
          <span className="font-semibold text-sky-900 text-sm hidden sm:block">The Little Circle</span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm text-sky-600 hover:text-sky-900 hover:bg-sky-50 transition-colors"
            >
              <item.icon size={15} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-800 transition-colors shrink-0"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </header>

      <ExtensionBanner />

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto w-full pb-24">
        {children}
      </main>
    </div>
  );
}
