import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Little Circle — Your companion that tells you what's real";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "0 80px",
          gap: 80,
        }}
      >
        {/* Circle logo */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
            boxShadow: "0 24px 80px rgba(255,160,120,0.45), 0 0 0 12px rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            flexShrink: 0,
          }}
        >
          {/* Left eye */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1c1c1e" }} />
          </div>
          {/* Right eye */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1c1c1e" }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#0c4a6e",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            The Little Circle
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#0369a1",
              lineHeight: 1.4,
              maxWidth: 560,
            }}
          >
            Your companion that tells you what's real.
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 20,
              color: "#0284c7",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 100,
              padding: "8px 20px",
              display: "inline-flex",
              width: "fit-content",
            }}
          >
            thelittlecircle.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
