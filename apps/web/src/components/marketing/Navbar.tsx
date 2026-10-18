"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CircleLogo from "@/components/CircleLogo";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const initial = userEmail ? userEmail[0].toUpperCase() : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sky-50/80 backdrop-blur-md border-b border-sky-200/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <CircleLogo size={28} />
          <span className="font-semibold text-sky-900 text-lg tracking-tight">The Little Circle</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-sky-700 hover:text-sky-900 transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="text-sm text-sky-700 hover:text-sky-900 transition-colors">
            Pricing
          </Link>
          {initial ? (
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-sky-500 text-white text-sm font-bold flex items-center justify-center hover:bg-sky-600 transition-colors"
              aria-label="Go to dashboard"
            >
              {initial}
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-sky-700 hover:text-sky-900 transition-colors">
              Log in
            </Link>
          )}
          <Link
            href="#download"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Get the app
          </Link>
        </div>

        <button
          className="md:hidden text-sky-700 hover:text-sky-900"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-sky-200/60 bg-sky-50/95 px-6 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-sm text-sky-700" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="#pricing" className="text-sm text-sky-700" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          {initial ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-sky-700"
              onClick={() => setOpen(false)}
            >
              <span className="w-7 h-7 rounded-full bg-sky-500 text-white text-sm font-bold flex items-center justify-center">
                {initial}
              </span>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-sky-700" onClick={() => setOpen(false)}>
              Log in
            </Link>
          )}
          <Link
            href="#download"
            className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-full text-center"
            onClick={() => setOpen(false)}
          >
            Get the app
          </Link>
        </div>
      )}
    </nav>
  );
}
