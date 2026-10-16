const steps = [
  {
    number: "01",
    title: "Install on any device",
    description: "iOS, Android, or install the browser extension to get The Little Circle running on every website you visit.",
  },
  {
    number: "02",
    title: "Name your companion",
    description: "Give it a name the moment you sign in. It responds to that name. Change it anytime in settings.",
  },
  {
    number: "03",
    title: "Tap it or talk to it",
    description: "Tap the circle to scan what is on screen. Or just say its name out loud and ask. It listens and responds.",
  },
  {
    number: "04",
    title: "Know the truth instantly",
    description: "AI or Real, with a confidence score. It tells you visually and speaks the result back to you. Under 2 seconds.",
  },
];

const modes = [
  {
    name: "Stealth",
    default: true,
    pro: false,
    tagline: "Watches silently. Speaks up only when needed.",
    description:
      "The circle stays completely hidden while you browse normally. The moment it detects AI content, it appears to alert you. Less clutter, no paranoia. It only speaks up when something is actually off.",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
  },
  {
    name: "Always-On",
    default: false,
    pro: false,
    tagline: "Always visible. Always ready. You are in control.",
    description:
      "The circle floats on your screen at all times. Tap it anytime to instantly check whatever you are looking at. It pulses and glows the moment it detects AI content. Perfect for power users who want proactive control.",
    color: "orange",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: "Voice",
    default: false,
    pro: true,
    tagline: "Say the name. Get the answer. Hands-free.",
    description:
      "Name your companion and turn on Voice Commands. Just say its name and ask your question out loud. It listens, detects, and speaks the result back to you. Works on any page, any app.",
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sky-500 text-sm font-medium uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-sky-950">
            Stop getting fooled.
            <br />
            <span className="text-sky-400">Start knowing.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {steps.map((step) => (
            <div key={step.number} className="group">
              <div className="mb-4 text-4xl font-bold text-gradient opacity-70 group-hover:opacity-100 transition-opacity">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">{step.title}</h3>
              <p className="text-sky-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <p className="text-center text-sky-500 text-sm font-medium uppercase tracking-widest mb-8">
            Choose your mode
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modes.map((mode) => (
              <div
                key={mode.name}
                className={`relative p-8 rounded-2xl border transition-all ${
                  mode.default
                    ? "border-sky-300 bg-sky-50/80"
                    : mode.pro
                    ? "border-violet-200 bg-violet-50/40"
                    : "border-sky-200 bg-white/60"
                }`}
              >
                {mode.default && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-semibold">
                    Default
                  </div>
                )}
                {mode.pro && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-semibold">
                    Pro
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      mode.default
                        ? "bg-sky-100 text-sky-600"
                        : mode.pro
                        ? "bg-violet-100 text-violet-600"
                        : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    {mode.icon}
                  </div>
                  <h3 className="text-sky-950 font-bold text-lg">{mode.name}</h3>
                </div>
                <p
                  className={`text-sm font-medium mb-3 ${
                    mode.default
                      ? "text-sky-600"
                      : mode.pro
                      ? "text-violet-600"
                      : "text-amber-600"
                  }`}
                >
                  {mode.tagline}
                </p>
                <p className="text-sky-500 text-sm leading-relaxed">{mode.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-2xl border border-sky-200 bg-white/60 overflow-hidden p-8 md:p-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative flex flex-col items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-12 w-full">
              <div className="bg-white rounded-2xl shadow-lg shadow-sky-100 px-6 py-5 flex flex-col gap-3 min-w-[220px]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">!</span>
                  <span className="font-semibold text-gray-900 text-sm">AI Generated</span>
                  <span className="ml-auto text-xs text-gray-400 font-medium">97%</span>
                </div>
                <div className="h-px bg-gray-100" />
                <p className="text-xs text-gray-400 leading-relaxed">Image · High confidence</p>
                <button className="text-xs text-sky-500 font-medium text-left hover:text-sky-700 transition-colors">
                  Dismiss
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg shadow-sky-100 px-6 py-5 flex flex-col gap-3 min-w-[200px]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">&#10003;</span>
                  <span className="font-semibold text-gray-900 text-sm">Looks Real</span>
                  <span className="ml-auto text-xs text-gray-400 font-medium">94%</span>
                </div>
                <div className="h-px bg-gray-100" />
                <p className="text-xs text-gray-400 leading-relaxed">Text · High confidence</p>
                <button className="text-xs text-sky-500 font-medium text-left hover:text-sky-700 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>

            <p className="text-sky-400 text-xs">Verdict in under 2 seconds</p>
          </div>
        </div>
      </div>
    </section>
  );
}
