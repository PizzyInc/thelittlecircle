import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-full bg-sky-500 flex-shrink-0" />
              <span className="font-semibold text-white">The Little Circle</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Your companion that tells you what&apos;s real. Always watching your back, quietly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-3">
                <li><Link href="#how-it-works" className="text-sm text-white/40 hover:text-white transition-colors">How it works</Link></li>
                <li><Link href="#pricing" className="text-sm text-white/40 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#download" className="text-sm text-white/40 hover:text-white transition-colors">Download</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-3">
                <li>
                  <a href="https://pizzyholdings.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white transition-colors">
                    Pizzy Holdings
                  </a>
                </li>
                <li><Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Support</p>
              <ul className="space-y-3">
                <li><Link href="/faq" className="text-sm text-white/40 hover:text-white transition-colors">FAQ</Link></li>
                <li><a href="mailto:hello@thelittlecircle.com" className="text-sm text-white/40 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} The Little Circle. A product of{" "}
            <a href="https://pizzyholdings.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              Pizzy Holdings
            </a>
            .
          </p>
          <p className="text-white/20 text-xs">
            AI detection powered by{" "}
            <span className="text-white/40">Rantera</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
