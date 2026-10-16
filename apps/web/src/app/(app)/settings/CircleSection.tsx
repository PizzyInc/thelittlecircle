"use client";

import { useEffect, useRef, useState } from "react";

export default function CircleSection() {
  const [name, setName] = useState("Circle");
  const [nameSaved, setNameSaved] = useState(false);
  const [stealth, setStealth] = useState(false);
  const [voice, setVoice] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(localStorage.getItem("tlc_circle_name") || "Circle");
    setStealth(localStorage.getItem("tlc_stealth") === "true");
    setVoice(localStorage.getItem("tlc_voice_enabled") === "true");
    const plan = localStorage.getItem("tlc_plan") ?? "free";
    setIsPro(plan === "pro" || plan === "family");
  }, []);

  function saveName() {
    const trimmed = name.trim() || "Circle";
    setName(trimmed);
    localStorage.setItem("tlc_circle_name", trimmed);
    window.dispatchEvent(new CustomEvent("tlcCircleNameChange", { detail: trimmed }));
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1800);
  }

  function toggleStealth() {
    const next = !stealth;
    setStealth(next);
    localStorage.setItem("tlc_stealth", String(next));
    window.dispatchEvent(new CustomEvent("tlcStealthChange", { detail: next }));
  }

  function toggleVoice() {
    if (!isPro) return;
    const next = !voice;
    setVoice(next);
    localStorage.setItem("tlc_voice_enabled", String(next));
    window.dispatchEvent(new CustomEvent("tlcVoiceChange", { detail: next }));
  }

  return (
    <div className="bg-white rounded-2xl border border-sky-200 p-6">
      <h2 className="text-sm font-semibold text-sky-900 mb-1">Circle behavior</h2>
      <p className="text-sky-400 text-xs mb-5">Control how your circle appears and responds.</p>

      <div className="space-y-6">
        {/* Circle name */}
        <div>
          <p className="text-sm font-medium text-sky-800 mb-0.5">Circle name</p>
          <p className="text-sky-400 text-xs mb-3">
            Give your circle a name. Say <span className="text-sky-600 font-medium">"hey [name]"</span> to trigger voice detection.
          </p>
          <div className="flex items-center gap-3">
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              onBlur={saveName}
              placeholder="Circle"
              maxLength={20}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
            <button
              onClick={saveName}
              className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${
                nameSaved
                  ? "bg-green-100 text-green-600"
                  : "bg-sky-100 text-sky-600 hover:bg-sky-500 hover:text-white"
              }`}
            >
              {nameSaved ? "Saved ✓" : "Save"}
            </button>
          </div>
        </div>

        <div className="border-t border-sky-100" />

        {/* Voice commands */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-sky-800">Voice commands</p>
              {!isPro && (
                <span className="text-[10px] bg-sky-100 text-sky-500 px-1.5 py-0.5 rounded-full font-medium">Pro</span>
              )}
            </div>
            <p className="text-sky-400 text-xs max-w-xs">
              When on, say <span className="text-sky-600 font-medium">"hey {name}"</span> and then your question.
              {name !== "Circle" ? ` ${name} will listen and respond.` : " Your companion will listen and respond."}
            </p>
            {!isPro && (
              <a href="/#pricing" className="text-xs text-sky-500 font-medium mt-1 inline-block hover:text-sky-700 transition-colors">
                Upgrade to Pro →
              </a>
            )}
          </div>
          <button
            onClick={toggleVoice}
            role="switch"
            aria-checked={voice}
            disabled={!isPro}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
              !isPro ? "opacity-40 cursor-not-allowed" : ""
            } ${voice && isPro ? "bg-sky-500" : "bg-sky-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              voice && isPro ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>

        <div className="border-t border-sky-100" />

        {/* Stealth mode */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sky-800">Stealth mode</p>
            <p className="text-sky-400 text-xs mt-0.5 max-w-xs">
              When on, the circle hides itself and only appears when AI content is detected.
              When off (default), the circle is always visible.
            </p>
          </div>
          <button
            onClick={toggleStealth}
            role="switch"
            aria-checked={stealth}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
              stealth ? "bg-sky-500" : "bg-sky-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                stealth ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
