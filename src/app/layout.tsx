import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = `${SITE_NAME} | 공영·민영 주차장 · 거주자우선주차구역`;
const DESCRIPTION =
  "전국 시군구별 공영·민영 주차장 위치와 요금, 거주자우선주차구역 신청 방법을 한눈에 확인하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  verification: {
    google: "ylRZwQXQH9ZVegPDqDJGKHanYBIwb2fDMD_NWF917FI",
    other: {
      "naver-site-verification": "ed9ea373d1b8daa72bfcf9f77fea0cae38f840bd",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: "ko-KR",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9196149361612087"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
        <footer className="mt-auto border-t-4 border-blue bg-white px-4 py-6 text-center text-sm text-slate-500">
          <p className="max-w-2xl mx-auto">
            <span className="font-bold text-slate-700">면책조항:</span> 본 사이트가 제공하는
            주차장·거주자우선주차구역 정보는 공공데이터포털이 제공하는 공공데이터를 가공하여
            보여주는 참고용 정보이며, 실제 정보와 다를 수 있습니다. 정확한 요금·신청 절차는
            관할 지방자치단체 또는 관리기관 공지사항을 통해 다시 확인해 주세요. 본 사이트는
            정보의 정확성, 최신성에 대해 어떠한 법적 책임도 지지 않습니다.
          </p>
          <p className="mt-3">
            데이터 출처: 전국주차장정보표준데이터, 전국거주자우선주차정보표준데이터
            (공공데이터포털) · 지도: @svg-maps/south-korea (CC BY 4.0)
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
