// Runs only on thelittlecircle.com — bidirectional sync between web app and chrome.storage.local

// Guard against "Extension context invalidated" when extension is reloaded during dev
function isAlive(): boolean {
  try { return !!chrome?.runtime?.id; } catch { return false; }
}
if (!isAlive()) {
  throw new Error("TLC bridge: extension context invalidated, stopping.");
}

// Signal to the web app that the extension is installed
document.documentElement.setAttribute("data-tlc-ext", "1");

const PROJECT_REF = "mhxfyhpxcjcemrrvwdgu";
const SUPABASE_AUTH_KEY = `sb-${PROJECT_REF}-auth-token`;

const TO_EXT: Record<string, string> = {
  tlc_circle_name: "tlc_name",
  tlc_circle_active: "tlc_active",
  tlc_plan: "tlc_plan",
  tlc_voice_enabled: "tlc_voice",
  tlc_device_id: "tlc_device_id",
};

const TO_WEB: Record<string, { lsKey: string; event?: string }> = {
  tlc_name: { lsKey: "tlc_circle_name", event: "tlcCircleNameChange" },
  tlc_active: { lsKey: "tlc_circle_active", event: "tlcCircleActiveChange" },
  tlc_voice: { lsKey: "tlc_voice_enabled", event: "tlcVoiceChange" },
  tlc_plan: { lsKey: "tlc_plan" },
};

function safeSet(data: Record<string, unknown>) {
  if (!isAlive()) return;
  try { chrome.storage.local.set(data); } catch {}
}

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem(SUPABASE_AUTH_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.access_token) return p.access_token;
    }
  } catch {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("sb-") && k.endsWith("-auth-token")) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const p = JSON.parse(raw);
          if (p?.access_token) return p.access_token;
        }
      }
    }
  } catch {}
  return null;
}

// ── Web app → extension ──────────────────────────────────────────────────────

function syncWebToExt() {
  const update: Record<string, unknown> = {};
  for (const [lsKey, csKey] of Object.entries(TO_EXT)) {
    const val = localStorage.getItem(lsKey);
    if (val !== null)
      update[csKey] = csKey === "tlc_active" || csKey === "tlc_voice" ? val === "true" : val;
  }
  const token = getAuthToken();
  if (token) update.tlc_token = token;
  if (Object.keys(update).length) safeSet(update);
}

syncWebToExt();
setTimeout(syncWebToExt, 1500);

const EVENT_MAP: Record<string, string> = {
  tlcCircleNameChange: "tlc_name",
  tlcCircleActiveChange: "tlc_active",
  tlcVoiceChange: "tlc_voice",
};
for (const [evtName, csKey] of Object.entries(EVENT_MAP)) {
  window.addEventListener(evtName, (e: Event) => {
    safeSet({ [csKey]: (e as CustomEvent).detail });
  });
}

window.addEventListener("storage", (e: StorageEvent) => {
  if (!e.key || e.newValue === null) return;
  if (e.key === SUPABASE_AUTH_KEY || (e.key.startsWith("sb-") && e.key.endsWith("-auth-token"))) {
    const token = getAuthToken();
    if (token) safeSet({ tlc_token: token });
    return;
  }
  const csKey = TO_EXT[e.key];
  if (!csKey) return;
  const val: unknown = csKey === "tlc_active" || csKey === "tlc_voice" ? e.newValue === "true" : e.newValue;
  safeSet({ [csKey]: val });
});

// ── Extension → web app ──────────────────────────────────────────────────────

try {
  chrome.storage.onChanged.addListener(
    (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area !== "local") return;
      for (const [csKey, { newValue }] of Object.entries(changes)) {
        const mapping = TO_WEB[csKey];
        if (!mapping) continue;
        const strVal = typeof newValue === "boolean" ? String(newValue) : String(newValue ?? "");
        localStorage.setItem(mapping.lsKey, strVal);
        if (mapping.event)
          window.dispatchEvent(new CustomEvent(mapping.event, { detail: newValue }));
      }
    }
  );
} catch {}
