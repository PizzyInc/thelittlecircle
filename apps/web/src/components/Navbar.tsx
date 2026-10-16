"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-sky-500 glow-sky-sm flex-shrink-0" />
          <span className="font-semibold text-white text-lg tracking-tight">The Little Circle</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link
            href="#download"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-full transition-colors"
          >
            Get the app
          </Link>
        </div>

        <button
          className="md:hidden text-white/60 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-black/95 px-6 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-sm text-white/70" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="#pricing" className="text-sm text-white/70" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          <Link href="/dashboard" className="text-sm text-white/70" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
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
