import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #fde047 0%, #facc15 100%)",
          borderRadius: 11,
          fontSize: 32,
          fontWeight: 800,
          color: "#1e3a8a",
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
