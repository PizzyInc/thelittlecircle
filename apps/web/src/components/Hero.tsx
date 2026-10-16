import Link from "next/link";
import { Circle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 bg-grid overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Floating circle visual */}
      <div className="relative mb-12 animate-float">
        <div className="w-24 h-24 rounded-full bg-sky-500 glow-sky flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-sky-400/40 flex items-center justify-center">
            <Circle className="w-8 h-8 text-white fill-white/20" />
          </div>
        </div>
        {/* Ripple rings */}
        <div className="absolute inset-0 rounded-full border border-sky-400/30 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute -inset-4 rounded-full border border-sky-400/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
      </div>

      {/* Badge */}
      <div className="mb-6 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-medium tracking-wide">
        Your companion that tells you what&apos;s real
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-bold text-center text-white max-w-3xl leading-tight mb-6">
        Say hi to{" "}
        <span className="text-gradient">The Little Circle</span>.
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-white/50 text-center max-w-xl mb-10 leading-relaxed">
        A little floating circle on all your devices. It watches your back silently
        and speaks up when something&apos;s off. Tap anything to know if it&apos;s AI.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20" id="download">
        <Link
          href="#"
          className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-full text-base transition-all hover:scale-105 glow-sky-sm text-center"
        >
          Download for iOS
        </Link>
        <Link
          href="#"
          className="px-8 py-4 border border-white/20 hover:border-sky-500/50 text-white font-semibold rounded-full text-base transition-all hover:bg-white/5 text-center"
        >
          Download for Android
        </Link>
      </div>

      {/* Social proof */}
      <p className="text-sm text-white/30 text-center">
        Free to get started. No credit card required.
      </p>
    </section>
  );
}
