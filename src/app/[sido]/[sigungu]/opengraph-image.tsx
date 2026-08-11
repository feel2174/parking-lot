import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}) {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);

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
            width: 120,
            height: 120,
            borderRadius: 20,
            background: "#facc15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 78,
            fontWeight: 800,
            color: "#1e3a8a",
          }}
        >
          P
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#dbeafe",
            display: "flex",
          }}
        >
          {sido}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 92,
            fontWeight: 800,
            color: "white",
            display: "flex",
          }}
        >
          {sigungu}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
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
