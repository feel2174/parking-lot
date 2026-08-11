import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "전국 시군구별 공영·민영 주차장 위치와 요금, 거주자우선주차구역 신청 방법을 확인하세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef2f7",
    theme_color: "#1e3a8a",
    lang: "ko",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
