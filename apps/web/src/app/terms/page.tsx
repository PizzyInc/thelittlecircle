import Link from "next/link";

export const metadata = { title: "Terms of Service – The Little Circle" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-sky-50 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-xs text-sky-400 hover:text-sky-600 transition-colors">← Back to home</Link>
        <h1 className="text-3xl font-bold text-sky-950 mt-6 mb-2">Terms of Service</h1>
        <p className="text-sky-500 text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-sky-800 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Using The Little Circle</h2>
            <p>By creating an account you agree to these terms. You must be at least 13 years old to use this service. You are responsible for maintaining the security of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">What we provide</h2>
            <p>The Little Circle is an AI and fake content detection tool. Detection results are probabilistic estimates — they are not guaranteed to be correct. Do not rely solely on our results for decisions with serious consequences. We make no warranties about the accuracy of verdicts.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Acceptable use</h2>
            <p>You may not use The Little Circle to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Submit content that is illegal, abusive, or that violates others' rights.</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the detection API.</li>
              <li>Create multiple accounts to circumvent plan limits.</li>
              <li>Resell or redistribute the service without our written permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Subscriptions and billing</h2>
            <p>Paid plans are billed through Lemon Squeezy. You can cancel at any time from Settings → Manage subscription. Cancellations take effect at the end of the current billing period — you keep Pro access until then. We do not offer refunds for partial periods.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Intellectual property</h2>
            <p>The Little Circle and its branding are our property. You retain ownership of any content you submit for detection — we do not claim any rights over it.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Limitation of liability</h2>
            <p>To the fullest extent permitted by law, The Little Circle is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the 12 months before the claim.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Changes and termination</h2>
            <p>We may update these terms or discontinue the service with reasonable notice. If you violate these terms we may suspend or close your account.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-sky-900 mb-2">Contact</h2>
            <p>Questions? Email <a href="mailto:hello@thelittlecircle.com" className="text-sky-600 hover:underline">hello@thelittlecircle.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
