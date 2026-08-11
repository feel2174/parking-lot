import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e3a8a",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            width: 140,
            height: 140,
            borderRadius: 24,
            background: "#facc15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 90,
            fontWeight: 800,
            color: "#1e3a8a",
          }}
        >
          P
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 100,
            width: 100,
            height: 100,
            borderRadius: "9999px",
            background: "#dbeafe",
          }}
        />
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: "white",
            display: "flex",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 38,
            fontWeight: 600,
            color: "#dbeafe",
            display: "flex",
          }}
        >
          공영·민영 주차장 · 거주자우선주차구역
        </div>
      </div>
    ),
    { ...size }
  );
}
