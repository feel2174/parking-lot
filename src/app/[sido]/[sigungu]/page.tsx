import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllRegionSummaries, getRegionData } from "@/lib/regions";
import { sidoAlias } from "@/lib/sidoAlias";
import ParkingTabs from "@/components/ParkingTabs";

export async function generateStaticParams() {
  return getAllRegionSummaries().map((r) => ({
    sido: r.sido,
    sigungu: r.sigungu,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}): Promise<Metadata> {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data) return { title: "지역 정보 없음" };

  const alias = sidoAlias(sido);
  const aliasSuffix = alias ? `(${alias})` : "";

  const title = `${sido}${aliasSuffix} ${sigungu} 공영주차장 · 거주자우선주차구역`;
  const description = `${sido}${aliasSuffix} ${sigungu}의 공영·민영 주차장 위치·요금, 거주자우선주차구역 신청 방법을 한눈에 확인하세요.`;
  const keywords = [
    `${sido} ${sigungu} 공영주차장`,
    `${sido} ${sigungu} 주차장`,
    `${sido} ${sigungu} 거주자우선주차`,
    ...(alias
      ? [
          `${alias} ${sigungu} 공영주차장`,
          `${alias} ${sigungu} 주차장`,
          `${alias} ${sigungu} 거주자우선주차`,
        ]
      : []),
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/${sido}/${sigungu}` },
    openGraph: { title, description, locale: "ko_KR", type: "website" },
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}) {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data) notFound();

  const alias = sidoAlias(sido);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-4 text-base font-medium text-slate-500">
        <a href="/" className="text-blue-dark hover:underline">
          우리동네 주차장 정보
        </a>{" "}
        / {sido} / {sigungu}
      </nav>

      <div className="rounded-2xl bg-blue px-6 py-6 text-white">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {sido} {sigungu}
        </h1>
        <p className="mt-1 text-lg text-blue-light">
          {alias ? `${alias} ${sigungu} ` : ""}공영·민영 주차장 · 거주자우선주차구역
        </p>
      </div>

      <section>
        <h2 className="mt-8 text-2xl font-bold text-blue-dark">🅿️ 주차장 정보</h2>
        <ParkingTabs parking={data.parking} residentParking={data.residentParking} />
      </section>
    </main>
  );
}
