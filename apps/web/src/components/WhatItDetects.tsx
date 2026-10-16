import { Image, Video, FileText, Mic, Video as VideoCall, Phone } from "lucide-react";

const modalities = [
  {
    icon: Image,
    title: "Images",
    description: "AI-generated photos, artwork, deepfake portraits",
  },
  {
    icon: Video,
    title: "Videos",
    description: "Synthetic video, face swaps, AI-generated clips",
  },
  {
    icon: FileText,
    title: "Text",
    description: "ChatGPT-written content, bot messages, AI copy",
  },
  {
    icon: Mic,
    title: "Audio",
    description: "Cloned voices, synthetic speech, AI narration",
  },
  {
    icon: VideoCall,
    title: "Live video calls",
    description: "Is the person on this call real? Know in real time.",
  },
  {
    icon: Phone,
    title: "Phone calls",
    description: "AI voice impersonation, synthetic callers",
  },
];

export default function WhatItDetects() {
  return (
    <section className="py-32 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sky-400 text-sm font-medium uppercase tracking-widest mb-4">
            Everything
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Detects it all
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto">
            Not just images. Every way AI can deceive you, covered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modalities.map((item) => (
            <div
              key={item.title}
              className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center mb-4 group-hover:bg-sky-500/25 transition-colors">
                <item.icon className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-sm mt-12">
          Detection powered by{" "}
          <span className="text-white/40 font-medium">Rantera AI</span>
        </p>
      </div>
    </section>
  );
}
