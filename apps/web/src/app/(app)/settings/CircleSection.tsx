"use client";

import { useEffect, useRef, useState } from "react";
import PricingModal from "@/components/app/PricingModal";
import { SKIN_LIST, type SkinId } from "@/lib/circleSkins";

export default function CircleSection() {
  const [name, setName] = useState("Circle");
  const [nameSaved, setNameSaved] = useState(false);
  const [stealth, setStealth] = useState(false);
  const [voice, setVoice] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [skin, setSkin] = useState<SkinId>("peach");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(localStorage.getItem("tlc_circle_name") || "Circle");
    setStealth(localStorage.getItem("tlc_stealth") === "true");
    setVoice(localStorage.getItem("tlc_voice_enabled") === "true");
    setSkin((localStorage.getItem("tlc_circle_skin") as SkinId) || "peach");

    fetch("/api/plan")
      .then((r) => r.json())
      .then(({ plan: p }) => {
        if (p === "pro" || p === "family") {
          localStorage.setItem("tlc_plan", p);
          setIsPro(true);
        } else {
          localStorage.removeItem("tlc_plan");
          setIsPro(false);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem("tlc_plan") ?? "free";
        setIsPro(stored === "pro" || stored === "family");
      });
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
    if (!isPro) return;
    const next = !stealth;
    setStealth(next);
    localStorage.setItem("tlc_stealth", String(next));
    window.dispatchEvent(new CustomEvent("tlcStealthChange", { detail: next }));
  }

  function selectSkin(id: SkinId) {
    if (!isPro) return;
    setSkin(id);
    localStorage.setItem("tlc_circle_skin", id);
    window.dispatchEvent(new CustomEvent("tlcSkinChange", { detail: id }));
  }

  function toggleVoice() {
    if (!isPro) return;
    const next = !voice;
    setVoice(next);
    localStorage.setItem("tlc_voice_enabled", String(next));
    window.dispatchEvent(new CustomEvent("tlcVoiceChange", { detail: next }));
  }

  return (
    <>
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

        {/* Circle skin */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium text-sky-800">Circle skin</p>
            {!isPro && (
              <span className="text-[10px] bg-sky-100 text-sky-500 px-1.5 py-0.5 rounded-full font-medium">Pro</span>
            )}
          </div>
          <p className="text-sky-400 text-xs mb-3">Change how your circle looks.</p>

          {isPro ? (
            <div className="flex gap-3 flex-wrap">
              {SKIN_LIST.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSkin(s.id)}
                  title={s.name}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: s.bg,
                      boxShadow: skin === s.id
                        ? `0 0 0 3px #0ea5e9, ${s.shadow}`
                        : s.shadow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "box-shadow 0.2s ease",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      {[0, 1].map((i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: s.eyeWhite, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: s.pupil }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${skin === s.id ? "text-sky-600" : "text-sky-400 group-hover:text-sky-600"}`}>
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {SKIN_LIST.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1.5 opacity-40">
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[0, 1].map((i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: s.eyeWhite, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: s.pupil }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-sky-400">{s.name}</span>
                </div>
              ))}
              <div className="flex items-center mt-1">
                <button onClick={() => setShowPricingModal(true)} className="text-xs text-sky-500 font-medium hover:text-sky-700 transition-colors">
                  Upgrade to Pro to customize →
                </button>
              </div>
            </div>
          )}
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
              <button onClick={() => setShowPricingModal(true)} className="text-xs text-sky-500 font-medium mt-1 hover:text-sky-700 transition-colors">
                Upgrade to Pro →
              </button>
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
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-medium text-sky-800">Stealth mode</p>
              {!isPro && (
                <span className="text-[10px] bg-sky-100 text-sky-500 px-1.5 py-0.5 rounded-full font-medium">Pro</span>
              )}
            </div>
            <p className="text-sky-400 text-xs max-w-xs">
              When on, the circle hides itself and only appears when AI content is detected.
              When off (default), the circle is always visible.
            </p>
            {!isPro && (
              <button onClick={() => setShowPricingModal(true)} className="text-xs text-sky-500 font-medium mt-1 hover:text-sky-700 transition-colors">
                Upgrade to Pro →
              </button>
            )}
          </div>
          <button
            onClick={toggleStealth}
            role="switch"
            aria-checked={stealth}
            disabled={!isPro}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
              !isPro ? "opacity-40 cursor-not-allowed" : ""
            } ${stealth && isPro ? "bg-sky-500" : "bg-sky-200"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                stealth && isPro ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>

    <PricingModal
      open={showPricingModal}
      onClose={() => setShowPricingModal(false)}
    />
    </>
  );
}
