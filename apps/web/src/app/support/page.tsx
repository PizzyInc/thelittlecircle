import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — The Little Circle",
  description: "Get help with The Little Circle — AI detection for images, text, and more.",
};

const faqs = [
  {
    q: "How do I install the Chrome extension?",
    a: "Visit thelittlecircle.com/download and click \"Get the Chrome Extension\". Once installed, the circle will appear on every website you visit.",
  },
  {
    q: "The circle isn't showing on a page — what do I do?",
    a: "Some pages (browser settings pages, the Chrome Web Store itself, and our own site) block extensions by design. Try it on a news site, social media, or any regular webpage. If it's still missing, try disabling and re-enabling the extension from chrome://extensions.",
  },
  {
    q: "I tapped the circle and nothing happened.",
    a: "The circle needs enough content to analyze. On pages with very little text and no images, it will show \"Not enough text to scan\". Try tapping when there's an article or image on screen. If it still doesn't respond, reload the page.",
  },
  {
    q: "How accurate is the detection?",
    a: "Accuracy varies by content type. Text and image detection are most reliable. The confidence percentage shown tells you how certain the result is. No AI detector is 100% accurate — use it as a signal, not a final verdict.",
  },
  {
    q: "What's the difference between Free and Pro?",
    a: "Free accounts detect AI-generated content (AI vs Real). Pro and Family accounts also detect fake/misleading human-made content, and get voice activation — just say your circle's name to trigger a scan.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to thelittlecircle.com/settings and click \"Manage Subscription\". You can cancel anytime and keep access until the end of your billing period.",
  },
  {
    q: "My question isn't answered here.",
    a: "Email us at support@thelittlecircle.com and we'll get back to you within 1 business day.",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sky-600 hover:text-sky-800 text-sm transition-colors">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Support</h1>
          <p className="text-slate-500 text-lg">We're here to help. Find answers below or email us directly.</p>
          <a
            href="mailto:support@thelittlecircle.com"
            className="inline-block mt-4 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors"
          >
            Email support@thelittlecircle.com
          </a>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-2">{item.q}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-12">
          The Little Circle · <Link href="/privacy" className="hover:text-slate-600">Privacy</Link> · <Link href="/terms" className="hover:text-slate-600">Terms</Link>
        </p>
      </div>
    </main>
  );
}
