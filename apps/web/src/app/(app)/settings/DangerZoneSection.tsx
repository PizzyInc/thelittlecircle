"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DangerZoneSection() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (confirmation !== "DELETE") return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }

      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear local storage
      ["tlc_plan", "tlc_circle_active", "tlc_voice_enabled", "tlc_stealth_enabled",
       "tlc_circle_name", "tlc_device_id", "tlc_over_limit"].forEach((k) => localStorage.removeItem(k));

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  function close() {
    if (loading) return;
    setOpen(false);
    setConfirmation("");
    setError(null);
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
          <p className="text-sky-400 text-xs mt-0.5">
            Permanent actions that cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-sky-900">Delete account</p>
            <p className="text-xs text-sky-400 mt-0.5">
              Deletes your account, all scan history, and all devices.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors flex-shrink-0 ml-4"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(14,30,54,0.5)", backdropFilter: "blur(6px)" }}
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>

            <h3 className="font-bold text-sky-950 mb-1.5">Delete your account?</h3>
            <p className="text-sky-500 text-sm leading-relaxed mb-5">
              This will permanently delete your account, all scan history, and remove all your devices. This cannot be undone.
            </p>

            <p className="text-xs font-semibold text-sky-700 mb-2">
              Type <span className="font-mono text-red-500">DELETE</span> to confirm
            </p>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-xl border border-sky-200 text-sm text-sky-900 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-red-300 mb-4 font-mono"
              autoComplete="off"
              autoCapitalize="characters"
            />

            {error && (
              <p className="text-xs text-red-500 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={close}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-sky-200 text-sky-600 text-sm font-medium hover:bg-sky-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmation !== "DELETE" || loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
