"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Step = "idle" | "confirm" | "deleting" | "done" | "error" | "not-logged-in";

export default function DeleteAccountPage() {
  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
      } else {
        setStep("not-logged-in");
      }
    });
  }, []);

  async function handleDelete() {
    setStep("deleting");
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete account.");
      }
      await supabase.auth.signOut();
      setStep("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
      setStep("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 40, maxWidth: 480, width: "100%", boxShadow: "0 4px 24px rgba(8,47,73,0.08)", border: "1px solid #e0f2fe" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#ffd4c4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            ⭕
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#082f49" }}>The Little Circle</span>
        </div>

        {step === "idle" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#082f49", marginBottom: 8 }}>Delete your account</h1>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 8, lineHeight: 1.6 }}>
              You are signed in as <strong style={{ color: "#082f49" }}>{email}</strong>.
            </p>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
              Deleting your account will permanently remove all your data — detections, settings, and subscription — and cannot be undone.
            </p>
            <button
              onClick={() => setStep("confirm")}
              style={{ width: "100%", backgroundColor: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#dc2626", cursor: "pointer", marginBottom: 12 }}
            >
              Continue to delete account
            </button>
            <Link href="/" style={{ display: "block", textAlign: "center", fontSize: 14, color: "#38bdf8", textDecoration: "none" }}>
              Cancel, take me back
            </Link>
          </>
        )}

        {step === "confirm" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>Are you sure?</h1>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
              This will permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.
            </p>
            <button
              onClick={handleDelete}
              style={{ width: "100%", backgroundColor: "#dc2626", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", marginBottom: 12 }}
            >
              Yes, permanently delete my account
            </button>
            <button
              onClick={() => setStep("idle")}
              style={{ width: "100%", backgroundColor: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 600, color: "#0369a1", cursor: "pointer" }}
            >
              Cancel
            </button>
          </>
        )}

        {step === "deleting" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#082f49" }}>Deleting your account…</p>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>This will only take a moment.</p>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#082f49", marginBottom: 8 }}>Account deleted</h1>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
              Your account and all associated data have been permanently deleted. Sorry to see you go.
            </p>
          </div>
        )}

        {step === "error" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 16, textAlign: "center" }}>⚠️</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#082f49", marginBottom: 8, textAlign: "center" }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, textAlign: "center" }}>{errorMsg}</p>
            <p style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
              Email us at{" "}
              <a href="mailto:privacy@thelittlecircle.com" style={{ color: "#0ea5e9" }}>privacy@thelittlecircle.com</a>
              {" "}and we'll delete your account manually within 30 days.
            </p>
          </>
        )}

        {step === "not-logged-in" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#082f49", marginBottom: 8 }}>Delete your account</h1>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
              To delete your account you need to be signed in. You can sign in and delete from Settings, or email us to request manual deletion.
            </p>
            <a
              href="/login"
              style={{ display: "block", width: "100%", backgroundColor: "#0ea5e9", borderRadius: 12, padding: "13px 0", fontSize: 15, fontWeight: 700, color: "#fff", textAlign: "center", textDecoration: "none", marginBottom: 12, boxSizing: "border-box" }}
            >
              Sign in to delete account
            </a>
            <a
              href="mailto:privacy@thelittlecircle.com?subject=Account deletion request"
              style={{ display: "block", width: "100%", backgroundColor: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 600, color: "#0369a1", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}
            >
              Request deletion by email
            </a>
          </>
        )}
      </div>
    </div>
  );
}
