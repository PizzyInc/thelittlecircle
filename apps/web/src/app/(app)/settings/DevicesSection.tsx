"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Smartphone, Globe, Trash2, Tv, Monitor, Tablet } from "lucide-react";

type Device = {
  id: string;
  name: string;
  type: string;
  circle_active: boolean;
  last_active: string;
};

const DEVICE_ICONS: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  phone: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  tv: Tv,
  browser: Globe,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DevicesSection() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentId(localStorage.getItem("tlc_device_id"));
    const supabase = createClient();
    supabase
      .from("user_devices")
      .select("*")
      .order("last_active", { ascending: false })
      .then(({ data }) => {
        setDevices(data ?? []);
        setLoading(false);
      });
  }, []);

  async function toggleCircle(id: string, current: boolean) {
    const supabase = createClient();
    const next = !current;
    await supabase.from("user_devices").update({ circle_active: next }).eq("id", id);
    setDevices((prev) => prev.map((d) => d.id === id ? { ...d, circle_active: next } : d));

    if (id === currentId) {
      localStorage.setItem("tlc_circle_active", String(next));
      window.dispatchEvent(new CustomEvent("tlcCircleActiveChange", { detail: next }));
    }
  }

  async function confirmRemove() {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    const supabase = createClient();
    await supabase.from("user_devices").delete().eq("id", id);
    const next = devices.filter((d) => d.id !== id);
    setDevices(next);
    if (id === currentId) localStorage.removeItem("tlc_device_id");

    if (next.length <= 1) {
      localStorage.setItem("tlc_over_limit", "false");
      window.dispatchEvent(new CustomEvent("tlcDeviceLimitChange", { detail: false }));
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-sky-200 p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-sky-900">Devices</h2>
          <p className="text-sky-400 text-xs mt-0.5">
            Where you&apos;re signed in. Toggle the circle on any device.
          </p>
        </div>

        {loading ? (
          <div className="py-6 text-center text-sky-300 text-xs">Loading…</div>
        ) : devices.length === 0 ? (
          <div className="py-6 text-center text-sky-300 text-xs">No devices yet</div>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => {
              const isCurrent = device.id === currentId;
              const Icon = DEVICE_ICONS[device.type] ?? Globe;

              return (
                <div
                  key={device.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl border border-sky-100 bg-sky-50/40"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-sky-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-sky-900 truncate">{device.name}</p>
                      {isCurrent && (
                        <span className="text-[10px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-sky-400 mt-0.5">
                      Active {timeAgo(device.last_active)}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleCircle(device.id, device.circle_active)}
                    role="switch"
                    aria-checked={device.circle_active}
                    title={device.circle_active ? "Circle is on. Tap to turn off." : "Circle is off. Tap to turn on."}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
                      device.circle_active ? "bg-sky-500" : "bg-sky-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        device.circle_active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => setConfirmId(device.id)}
                    className="ml-1 text-sky-300 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Remove device"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm remove modal */}
      {confirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(14,30,54,0.45)", backdropFilter: "blur(6px)" }}
          onClick={() => setConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl shadow-sky-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h3 className="font-bold text-sky-950 mb-1.5">Remove this device?</h3>
            <p className="text-sky-500 text-sm leading-relaxed mb-5">
              It will be signed out and removed from your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-sky-200 text-sky-600 text-sm font-medium hover:bg-sky-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
