"use client";

import { useEffect, useState } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export default function NotificationsSection() {
  const [permission, setPermission] = useState<PermissionState>("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
  }

  const enabled = permission === "granted";
  const denied = permission === "denied";
  const unsupported = permission === "unsupported";

  return (
    <div className="bg-white rounded-2xl border border-sky-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-sky-900 mb-0.5">Notifications</h2>
          <p className="text-sky-400 text-xs max-w-xs">
            {unsupported
              ? "Notifications are not supported in this browser."
              : denied
              ? "Notifications are blocked. Enable them in your browser or device settings."
              : enabled
              ? "You'll receive alerts when AI content is detected."
              : "Get notified when AI content is detected around you."}
          </p>
        </div>

        {!unsupported && !denied && (
          <button
            onClick={enabled ? undefined : requestPermission}
            role="switch"
            aria-checked={enabled}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
              enabled ? "bg-sky-500 cursor-default" : "bg-sky-200"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        )}

        {(unsupported || denied) && (
          <span className="text-xs text-sky-300 flex-shrink-0">
            {denied ? "Blocked" : "N/A"}
          </span>
        )}
      </div>
    </div>
  );
}
