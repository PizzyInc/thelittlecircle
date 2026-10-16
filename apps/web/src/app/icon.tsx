import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
      >
        {/* Left eye */}
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2c2c2c" }} />
        </div>
        {/* Right eye */}
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2c2c2c" }} />
        </div>
      </div>
    ),
    size
  );
}
