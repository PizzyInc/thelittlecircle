"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CircleToggleCard() {
  const [active, setActive] = useState(true);
  const [name, setName] = useState("Circle");
  const [voice, setVoice] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tlc_circle_active");
    if (stored !== null) setActive(stored !== "false");
    setName(localStorage.getItem("tlc_circle_name") || "Circle");
    setVoice(localStorage.getItem("tlc_voice_enabled") === "true");
    const plan = localStorage.getItem("tlc_plan") ?? "free";
    setIsPro(plan === "pro" || plan === "family");
    setMounted(true);

    function onCircleActive(e: Event) { setActive((e as CustomEvent<boolean>).detail); }
    function onNameChange(e: Event) { setName((e as CustomEvent<string>).detail); }
    function onVoiceChange(e: Event) { setVoice((e as CustomEvent<boolean>).detail); }

    window.addEventListener("tlcCircleActiveChange", onCircleActive);
    window.addEventListener("tlcCircleNameChange", onNameChange);
    window.addEventListener("tlcVoiceChange", onVoiceChange);
    return () => {
      window.removeEventListener("tlcCircleActiveChange", onCircleActive);
      window.removeEventListener("tlcCircleNameChange", onNameChange);
      window.removeEventListener("tlcVoiceChange", onVoiceChange);
    };
  }, []);

  async function toggle() {
    const next = !active;
    setActive(next);
    localStorage.setItem("tlc_circle_active", String(next));
    window.dispatchEvent(new CustomEvent("tlcCircleActiveChange", { detail: next }));

    const deviceId = localStorage.getItem("tlc_device_id");
    if (deviceId) {
      const supabase = createClient();
      await supabase.from("user_devices").update({ circle_active: next }).eq("id", deviceId);
    }
  }

  function toggleVoice() {
    if (!isPro) return;
    const next = !voice;
    setVoice(next);
    localStorage.setItem("tlc_voice_enabled", String(next));
    window.dispatchEvent(new CustomEvent("tlcVoiceChange", { detail: next }));
  }

  // Match server render to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div className="bg-white rounded-2xl border border-sky-200 mb-8 overflow-hidden">
      {/* Circle on/off row */}
      <div className="flex items-center gap-5 p-5">
        {/* Mini circle face */}
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex flex-col items-center justify-center"
          style={{
            background: active
              ? "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)"
              : "linear-gradient(145deg, #f0f4f8 0%, #e2e8f0 100%)",
            boxShadow: active
              ? "0 4px 20px rgba(255,180,150,0.5)"
              : "0 4px 12px rgba(0,0,0,0.06)",
            transition: "all 0.4s ease",
          }}
        >
          <div className="flex gap-[7px] items-center">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 9,
                  height: 9,
                  background: active ? "#fff" : "rgba(255,255,255,0.5)",
                  transition: "background 0.4s ease",
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: active ? "#2c2c2c" : "#aab",
                    transition: "background 0.4s ease",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sky-900">{name}</p>
          <p className="text-xs text-sky-400 mt-0.5">
            {active ? `Active on this device — tap ${name} to scan` : `${name} is off on this device`}
          </p>
        </div>

        <button
          onClick={toggle}
          role="switch"
          aria-checked={active}
          title={active ? "Turn circle off" : "Turn circle on"}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
            active ? "bg-sky-500" : "bg-sky-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-sky-100 mx-5" />

      {/* Voice commands row */}
      <div className="flex items-center gap-5 p-5">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{
            background: voice && isPro
              ? "linear-gradient(145deg, #ede9fe 0%, #ddd6fe 100%)"
              : "linear-gradient(145deg, #f0f4f8 0%, #e2e8f0 100%)",
            boxShadow: voice && isPro
              ? "0 4px 20px rgba(167,139,250,0.4)"
              : "0 4px 12px rgba(0,0,0,0.06)",
            transition: "all 0.4s ease",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
            style={{ width: 20, height: 20, color: voice && isPro ? "#7c3aed" : "#94a3b8", transition: "color 0.4s ease" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-sky-900">Voice commands</p>
            {!isPro && (
              <span className="text-[10px] bg-violet-100 text-violet-500 px-1.5 py-0.5 rounded-full font-semibold">Pro</span>
            )}
          </div>
          <p className="text-xs text-sky-400 mt-0.5">
            {isPro
              ? (voice ? `Say "hey ${name}" to check anything out loud` : `Off — say "hey ${name}" to activate`)
              : <a href="/#pricing" className="text-violet-400 hover:text-violet-600 transition-colors">Upgrade to Pro to enable</a>
            }
          </p>
        </div>

        <button
          onClick={toggleVoice}
          role="switch"
          aria-checked={voice}
          disabled={!isPro}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 ${
            !isPro ? "opacity-40 cursor-not-allowed" : ""
          } ${voice && isPro ? "bg-violet-500" : "bg-sky-200"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              voice && isPro ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
