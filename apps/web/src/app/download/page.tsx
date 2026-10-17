import Link from "next/link";
import CircleLogo from "@/components/CircleLogo";

export const metadata = { title: "Install the Extension — The Little Circle" };

const STEPS = [
  {
    n: 1,
    title: "Download the extension",
    body: "Click the button above to download the ZIP file.",
  },
  {
    n: 2,
    title: "Extract the ZIP",
    body: 'Right-click the downloaded file and choose "Extract All…" (Windows) or double-click it (Mac). You\'ll get a folder called "dist".',
  },
  {
    n: 3,
    title: "Open Chrome Extensions",
    body: (
      <>
        In Chrome, go to{" "}
        <code
          style={{
            background: "#e0f2fe",
            padding: "1px 6px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          chrome://extensions
        </code>{" "}
        in the address bar.
      </>
    ),
  },
  {
    n: 4,
    title: "Enable Developer Mode",
    body: 'Toggle on "Developer mode" in the top-right corner of that page.',
  },
  {
    n: 5,
    title: 'Click "Load unpacked"',
    body: 'A folder picker opens. Select the "dist" folder you just extracted.',
  },
  {
    n: 6,
    title: "Done!",
    body: "The Little Circle icon appears in your Chrome toolbar. Click it to manage your circle, or tap the floating circle on any page to scan.",
  },
];

export default function DownloadPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px 80px",
      }}
    >
      {/* Nav */}
      <div style={{ width: "100%", maxWidth: 640, marginBottom: 48 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <CircleLogo size={28} />
          <span
            style={{ fontWeight: 700, fontSize: 15, color: "#0c4a6e" }}
          >
            The Little Circle
          </span>
        </Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 480 }}>
        {/* Big circle face */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #ffe8dc, #ffd4c4)",
            boxShadow: "0 8px 32px rgba(255,180,150,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            gap: 3,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  background: "#fff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 9,
                    height: 9,
                    background: "#2c2c2c",
                    borderRadius: "50%",
                  }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              width: 18,
              height: 9,
              border: "2.5px solid #2c2c2c",
              borderTop: "none",
              borderRadius: "0 0 18px 18px",
              marginTop: 2,
            }}
          />
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0c4a6e",
            marginBottom: 12,
          }}
        >
          Install The Little Circle
        </h1>
        <p style={{ fontSize: 14, color: "#0369a1", lineHeight: 1.6 }}>
          Your AI-detection companion — floating on every page in Chrome.
          We&apos;re submitting to the Chrome Web Store soon.
          Until then, install it in under a minute with the steps below.
        </p>
      </div>

      {/* Download button */}
      <a
        href="/the-little-circle-extension.zip"
        download="the-little-circle-extension.zip"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 32px",
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          color: "#fff",
          borderRadius: 28,
          fontSize: 15,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 8px 24px rgba(14,165,233,0.4)",
          marginBottom: 56,
          transition: "transform 0.15s ease",
        }}
      >
        ⬇ Download Extension ZIP
      </a>

      {/* Steps */}
      <div style={{ width: "100%", maxWidth: 560 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0369a1",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Installation steps
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {STEPS.map((step) => (
            <div
              key={step.n}
              style={{
                display: "flex",
                gap: 16,
                padding: "18px 20px",
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(14,165,233,0.08)",
                border: "1px solid #e0f2fe",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background:
                    step.n === 6
                      ? "linear-gradient(135deg, #d4f5e4, #b0ecc8)"
                      : "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                  color: step.n === 6 ? "#059669" : "#0369a1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {step.n === 6 ? "✓" : step.n}
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#0c4a6e",
                    marginBottom: 4,
                  }}
                >
                  {step.title}
                </p>
                <p style={{ fontSize: 13, color: "#0369a1", lineHeight: 1.5 }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p
        style={{
          marginTop: 40,
          fontSize: 12,
          color: "#7dd3fc",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        Already installed?{" "}
        <Link
          href="/dashboard"
          style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}
        >
          Go to your dashboard →
        </Link>
      </p>
    </div>
  );
}
