"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface AccountSectionProps {
  email: string | undefined;
  name: string | undefined;
  googleConnected: boolean;
  googleEmail: string | undefined;
}

export default function AccountSection({ email, name, googleConnected, googleEmail }: AccountSectionProps) {
  const [linking, setLinking] = useState(false);

  async function handleConnectGoogle() {
    setLinking(true);
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=/settings` },
    });
    if (error) {
      alert(error.message);
      setLinking(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-sky-200 p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-sky-900">Account</h2>
        <p className="text-sky-400 text-xs mt-0.5">Your profile and connected sign-in methods</p>
      </div>

      {/* Profile info */}
      {(name || email) && (
        <div className="border-t border-sky-100 pt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sky-600 font-semibold text-sm">
              {(name ?? email ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            {name && <p className="text-sm font-medium text-sky-900 truncate">{name}</p>}
            {email && <p className="text-xs text-sky-500 truncate">{email}</p>}
          </div>
        </div>
      )}

      {/* Connected accounts */}
      <div className="border-t border-sky-100 pt-4 space-y-3">
        <p className="text-xs font-medium text-sky-700">Sign-in methods</p>

        {googleConnected ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sky-50 border border-sky-100">
            <GoogleIcon />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sky-900">Google</p>
              {googleEmail && (
                <p className="text-xs text-sky-500 truncate">{googleEmail}</p>
              )}
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex-shrink-0">
              Connected
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-dashed border-sky-200">
            <div className="flex items-center gap-3">
              <GoogleIcon />
              <div>
                <p className="text-xs font-medium text-sky-900">Google</p>
                <p className="text-xs text-sky-400">Sign in with Google next time</p>
              </div>
            </div>
            <button
              onClick={handleConnectGoogle}
              disabled={linking}
              className="text-xs font-medium text-sky-600 hover:text-sky-800 disabled:opacity-50 flex-shrink-0 transition-colors"
            >
              {linking ? "Redirecting…" : "Connect"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
