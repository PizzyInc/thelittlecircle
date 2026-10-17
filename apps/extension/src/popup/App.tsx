import React, { useEffect, useState } from "react";
import { setCircleActive } from "../supabase";

export default function App() {
  const [active, setActive] = useState(true);
  const [name, setName] = useState("Circle");
  const [nameDraft, setNameDraft] = useState("Circle");
  const [nameSaved, setNameSaved] = useState(false);
  const [plan, setPlan] = useState("free");
  const [token, setToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ["tlc_active", "tlc_name", "tlc_plan", "tlc_token", "tlc_device_id"],
      (r) => {
        setActive(r.tlc_active !== false);
        setName(r.tlc_name || "Circle");
        setNameDraft(r.tlc_name || "Circle");
        setPlan(r.tlc_plan || "free");
        setToken(r.tlc_token || null);
        setDeviceId(r.tlc_device_id || null);
      }
    );
  }, []);

  async function toggleActive() {
    const next = !active;
    setActive(next);
    chrome.storage.local.set({ tlc_active: next });

    if (token && deviceId) {
      setSyncing(true);
      try {
        await setCircleActive(token, deviceId, next);
      } finally {
        setSyncing(false);
      }
    }
  }

  function saveName() {
    const trimmed = nameDraft.trim() || "Circle";
    setName(trimmed);
    setNameDraft(trimmed);
    chrome.storage.local.set({ tlc_name: trimmed });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1800);
  }

  const isPro = plan === "pro" || plan === "family";
  const isLoggedIn = !!token;

  return (
    <div style={{ padding: 20, minWidth: 280 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: active ? "linear-gradient(145deg, #ffe8dc, #ffd4c4)" : "linear-gradient(145deg, #f0f4f8, #e2e8f0)",
          boxShadow: active ? "0 4px 16px rgba(255,180,150,0.5)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0,
          transition: "all 0.3s ease",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#fff" : "rgba(255,255,255,0.5)" }} />
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#fff" : "rgba(255,255,255,0.5)" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#0c4a6e" }}>The Little Circle</p>
          <p style={{ fontSize: 11, color: "#64b5d9", marginTop: 1 }}>
            {!isLoggedIn
              ? "Sign in at thelittlecircle.com"
              : active
              ? `${name} is watching`
              : "Circle is off"}
          </p>
        </div>
      </div>

      {/* Not logged in notice */}
      {!isLoggedIn && (
        <div style={{ padding: "10px 12px", borderRadius: 12, background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "#92400e" }}>
            Visit{" "}
            <a href="https://thelittlecircle.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "#ea580c", fontWeight: 600 }}>
              thelittlecircle.com
            </a>{" "}
            and log in to sync your settings.
          </p>
        </div>
      )}

      {/* Circle toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "12px 14px", background: "#fff", borderRadius: 14, border: "1px solid #bae6fd" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0c4a6e" }}>Circle active</p>
          <p style={{ fontSize: 11, color: "#64b5d9", marginTop: 2 }}>
            {syncing ? "Syncing..." : "Tap to scan on any page"}
          </p>
        </div>
        <button
          onClick={toggleActive}
          style={{
            position: "relative", width: 44, height: 24, borderRadius: 12,
            background: active ? "#0ea5e9" : "#bae6fd",
            border: "none", cursor: "pointer",
            transition: "background 0.2s ease",
          }}
        >
          <span style={{
            position: "absolute", top: 2, left: 2,
            width: 20, height: 20, borderRadius: "50%",
            background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            transform: active ? "translateX(20px)" : "translateX(0)",
            transition: "transform 0.2s ease",
            display: "block",
          }} />
        </button>
      </div>

      {/* Circle name */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#0369a1", marginBottom: 8 }}>Circle name</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value.slice(0, 20))}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            placeholder="Circle"
            maxLength={20}
            style={{
              flex: 1, padding: "8px 10px", borderRadius: 10,
              border: "1px solid #bae6fd", background: "#f0f9ff",
              fontSize: 13, color: "#0c4a6e", outline: "none",
            }}
          />
          <button
            onClick={saveName}
            style={{
              padding: "8px 12px", borderRadius: 10,
              background: nameSaved ? "#d1fae5" : "#e0f2fe",
              color: nameSaved ? "#059669" : "#0369a1",
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            {nameSaved ? "✓" : "Save"}
          </button>
        </div>
      </div>

      {/* Voice badge */}
      {!isPro && (
        <div style={{ padding: "10px 12px", borderRadius: 12, background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)", border: "1px solid #bae6fd", marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0369a1" }}>Voice — Pro feature</p>
          <p style={{ fontSize: 11, color: "#64b5d9", marginTop: 3 }}>Say "{name}'s name" to scan hands-free.</p>
          <a href="https://thelittlecircle.com/#pricing" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", marginTop: 6, fontSize: 11, color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
            Upgrade to Pro →
          </a>
        </div>
      )}

      <div style={{ borderTop: "1px solid #e0f2fe", paddingTop: 12, textAlign: "center" }}>
        <a href="https://thelittlecircle.com/dashboard" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#64b5d9", textDecoration: "none" }}>
          Open dashboard →
        </a>
      </div>
    </div>
  );
}
