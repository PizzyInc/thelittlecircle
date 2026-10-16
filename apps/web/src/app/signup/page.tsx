"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CircleLogo from "@/components/CircleLogo";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" aria-label="Back to home">
            <span className="mb-4 hover:opacity-90 transition-opacity">
              <CircleLogo size={48} />
            </span>
          </Link>
          <h1 className="text-xl font-bold text-sky-950">Create your account</h1>
          <p className="text-sky-500 text-sm mt-1">Start knowing what&apos;s real</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-sky-200 p-8 shadow-sm shadow-sky-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
            <div>
              <label className="block text-xs font-medium text-sky-700 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 rounded-xl border border-sky-200 text-sm text-sky-900 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-sky-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sky-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-sky-200 text-sm text-sky-900 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-sky-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sky-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full px-4 py-3 rounded-xl border border-sky-200 text-sm text-sky-900 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-sky-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sky-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-sky-400">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 border border-sky-200 hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60 text-sky-700 font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <p className="text-center text-xs text-sky-400 mt-6">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-sky-600 hover:text-sky-800">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-sky-600 hover:text-sky-800">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-xs text-sky-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-600 hover:text-sky-800 font-medium">
            Log in
          </Link>
        </p>
        <p className="text-center text-xs text-sky-400 mt-2">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
