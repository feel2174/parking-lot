import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e3a8a",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "#facc15",
            display: "flex",
          }}
        >
          P
        </div>
      </div>
    ),
    { ...size }
  );
}
