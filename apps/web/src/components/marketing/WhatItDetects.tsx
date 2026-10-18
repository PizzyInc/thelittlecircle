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
    <section className="py-32 px-6 bg-sky-100/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sky-500 text-sm font-medium uppercase tracking-widest mb-4">
            Everything
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-sky-950 mb-4">
            Detects it all
          </h2>
          <p className="text-sky-600 text-lg max-w-md mx-auto">
            Not just images. Every way AI can deceive you, covered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modalities.map((item) => (
            <div
              key={item.title}
              className="group p-6 rounded-2xl border border-sky-200 bg-white/70 hover:border-sky-400 hover:bg-white transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center mb-4 group-hover:bg-sky-200 transition-colors">
                <item.icon className="w-5 h-5 text-sky-500" />
              </div>
              <h3 className="text-sky-900 font-semibold mb-1">{item.title}</h3>
              <p className="text-sky-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sky-400 text-sm mt-12">
          Detection powered by{" "}
          <a href="https://rantera.ai" target="_blank" rel="noopener noreferrer" className="text-sky-600 font-medium hover:text-sky-800 underline underline-offset-2 transition-colors">Rantera</a>
        </p>
      </div>
    </section>
  );
}
