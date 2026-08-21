import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// 2x resolution (120:63 ratio) — vector-sourced, stays crisp when scaled up.
export const size = { width: 2400, height: 1260 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}) {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);

  const [extrabold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/pt-extrabold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/pt-medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 200px",
          background: "#0B1E4D",
          backgroundImage:
            "radial-gradient(circle at 80% 26%, rgba(59,130,246,0.50), transparent 52%), radial-gradient(circle at 12% 98%, rgba(250,204,21,0.18), transparent 46%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 150,
            right: 130,
            width: 620,
            height: 620,
            borderRadius: 620,
            background:
              "radial-gradient(circle at 38% 34%, rgba(147,197,253,0.50), rgba(30,58,138,0.05) 62%, transparent 72%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            width: 168,
            height: 168,
            borderRadius: 40,
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(150deg, #fde047 0%, #facc15 100%)",
            boxShadow: "0 44px 84px rgba(250,204,21,0.4), inset 0 3px 0 rgba(255,255,255,0.55)",
            marginBottom: 44,
            fontFamily: "Pretendard",
            fontWeight: 800,
            fontSize: 108,
            color: "#1E3A8A",
          }}
        >
          P
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontFamily: "Pretendard",
            fontWeight: 500,
            color: "#BFDBFE",
            marginBottom: 14,
          }}
        >
          {sido}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 168,
            fontFamily: "Pretendard",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: -5,
            lineHeight: 1.02,
            wordBreak: "keep-all",
          }}
        >
          {sigungu}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 34,
            fontSize: 54,
            fontFamily: "Pretendard",
            fontWeight: 500,
            color: "#A9BAD8",
            maxWidth: 1600,
            lineHeight: 1.35,
            wordBreak: "keep-all",
          }}
        >
          공영·민영 주차장 · 거주자우선주차구역
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: extrabold, weight: 800, style: "normal" },
        { name: "Pretendard", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}
