import Link from "next/link";

export const metadata = { title: "Privacy Policy – The Little Circle" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sky-50 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-xs text-sky-400 hover:text-sky-600 transition-colors">← Back to home</Link>
        <h1 className="text-3xl font-bold text-sky-950 mt-6 mb-2">Privacy Policy</h1>
        <p className="text-sky-500 text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-sky-800 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">What we collect</h2>
            <p>When you create an account we collect your email address and, if you sign in with Google, your name and profile picture. When you run a detection, we store the type of content checked, the verdict, the confidence score, and the first 200 characters of any text (never the full file for images, audio, or video).</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">How we use it</h2>
            <p>Your detection history is shown to you on the dashboard. We do not sell your data, share it with advertisers, or use it to train AI models. Aggregate, anonymised statistics may be used to improve the service.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Third-party services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Rantera</strong> - AI-powered content detection. Content you submit for analysis is processed by Rantera and is subject to their privacy policy.</li>
              <li><strong>Lemon Squeezy</strong> - payment processing. We never store your card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Cookies and local storage</h2>
            <p>We use browser local storage to remember your plan, circle preferences (name, skin, stealth mode, voice settings), and device registration. No third-party advertising cookies are used.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Your rights</h2>
            <p>You can delete your account and all associated data at any time from Settings → Danger zone. To request a copy of your data or ask any privacy question, email us at <a href="mailto:privacy@thelittlecircle.com" className="text-sky-600 hover:underline">privacy@thelittlecircle.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Changes</h2>
            <p>We may update this policy from time to time. If we make material changes we will notify you by email or via a notice in the app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
