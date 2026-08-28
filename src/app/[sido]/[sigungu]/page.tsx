import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllRegionSummaries,
  getRegionData,
  type ParkingLot,
} from "@/lib/regions";
import { sidoAlias } from "@/lib/sidoAlias";
import { computeRegionStats } from "@/lib/regionStats";
import AddressGroupedList from "@/components/AddressGroupedList";
import ListFilter from "@/components/ListFilter";
import OperatingDayBadges from "@/components/OperatingDayBadges";
import { RegionSummary, RegionGuide } from "@/components/RegionEditorial";
import RelatedRegions from "@/components/RelatedRegions";

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

function formatFee(p: ParkingLot): string {
  if (p.요금정보 === "무료") return "무료";
  const parts: string[] = [];
  if (p.주차기본시간 && p.주차기본요금) {
    parts.push(`기본 ${p.주차기본시간}분 ${Number(p.주차기본요금).toLocaleString()}원`);
  }
  if (p.추가단위시간 && p.추가단위요금) {
    parts.push(`추가 ${p.추가단위시간}분당 ${Number(p.추가단위요금).toLocaleString()}원`);
  }
  if (parts.length === 0) {
    return p.요금정보 === "혼합" ? "혼합(무료+유료 구간 있음)" : p.요금정보 || "요금 정보 없음";
  }
  const prefix = p.요금정보 === "혼합" ? "혼합(무료 구간 있음) · " : "";
  return prefix + parts.join(", ");
}

function SplitLines({ text }: { text: string }) {
  if (!text) return null;
  const lines = text
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
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

  const { parking, residentParking } = data;
  const alias = sidoAlias(sido);
  const stats = computeRegionStats(parking, residentParking);
  const hasParking = parking.length > 0;
  const hasResident = residentParking.length > 0;
  const allRegions = getAllRegionSummaries();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-4 text-base font-medium text-slate-500">
        <Link href="/" className="text-blue-dark hover:underline">
          우리동네 주차장 정보
        </Link>{" "}
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

      <RegionSummary sido={sido} sigungu={sigungu} alias={alias} stats={stats} />

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-blue-dark">
          🅿️ 공영·민영 주차장 ({parking.length})
        </h2>
        {hasParking ? (
          <div className="mt-4">
            <ListFilter placeholder="동 이름이나 주차장 이름으로 찾기">
              <AddressGroupedList
                items={parking}
                unit="곳"
                emptyText="일치하는 주차장이 없어요."
                getAddress={(p) => p.소재지도로명주소 || p.소재지지번주소 || ""}
                getSearchText={(p) =>
                  `${p.주차장명} ${p.소재지도로명주소 || p.소재지지번주소 || ""}`
                }
                renderItem={(p) => (
                  <>
                    <p className="break-words text-base font-bold text-slate-900">
                      {p.주차장명}{" "}
                      <span className="ml-1 rounded-full bg-blue-light px-2 py-0.5 text-xs font-bold text-blue-dark">
                        {p.주차장구분}
                      </span>
                      {p.장애인전용주차구역보유여부 === "Y" && (
                        <span className="ml-1 rounded-full bg-yellow px-2 py-0.5 text-xs font-bold text-yellow-dark">
                          장애인전용구역 있음
                        </span>
                      )}
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {p.소재지도로명주소 || p.소재지지번주소}
                      {p.주차구획수 ? ` · ${p.주차구획수}면` : ""}
                    </p>
                    <p className="mt-2">
                      <OperatingDayBadges value={p.운영요일} />
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{formatFee(p)}</p>
                  </>
                )}
              />
            </ListFilter>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-white p-4 text-lg text-slate-500">
            등록된 공영·민영 주차장 정보가 없습니다.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-blue-dark">
          거주자우선주차구역 ({residentParking.length})
        </h2>
        {hasResident ? (
          <div className="mt-4">
            <p className="mb-3 rounded-xl bg-yellow/20 px-4 py-3 text-sm text-yellow-dark">
              이 구역은 아무나 바로 이용하는 곳이 아니라, 거주자가 <b>신청해서 배정받는</b>{" "}
              주차 구역이에요. 신청 방법·서류는 항목별로 확인하세요.
            </p>
            <ListFilter placeholder="동 이름이나 구역 이름으로 찾기">
              <AddressGroupedList
                items={residentParking}
                unit="구역"
                emptyText="일치하는 거주자우선주차구역이 없어요."
                getAddress={(r) => r.소재지도로명주소 || r.소재지지번주소 || ""}
                getSearchText={(r) =>
                  `${r.거주자우선주차구역명} ${r.소재지도로명주소 || r.소재지지번주소 || ""}`
                }
                renderItem={(r) => (
                  <>
                    <p className="break-words text-base font-bold text-slate-900">
                      {r.거주자우선주차구역명}{" "}
                      {!!r.구획수 && r.구획수 > 1 && (
                        <span className="ml-1 rounded-full bg-blue-light px-2 py-0.5 text-xs font-bold text-blue-dark">
                          {r.구획수}구획
                        </span>
                      )}
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {r.소재지도로명주소 || r.소재지지번주소}
                    </p>
                    {r.사용시간대정보 && (
                      <p className="mt-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-700">사용시간대: </span>
                        <SplitLines text={r.사용시간대정보} />
                      </p>
                    )}
                    {r.이용요금 && (
                      <p className="mt-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-700">이용요금: </span>
                        <SplitLines text={r.이용요금} />
                      </p>
                    )}
                    {(r.정기접수시작일자 || r.정기접수종료일자) && (
                      <p className="mt-1 text-sm text-slate-500">
                        <span className="font-bold text-slate-700">접수기간: </span>
                        {r.정기접수시작일자} ~ {r.정기접수종료일자}
                      </p>
                    )}
                    {r.신청방법 && (
                      <p className="mt-1 text-sm text-slate-500">
                        <span className="font-bold text-slate-700">신청방법: </span>
                        {r.신청방법.split("+").join(", ")}
                      </p>
                    )}
                    {r.신청서류 && (
                      <p className="mt-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-700">신청서류: </span>
                        <SplitLines text={r.신청서류} />
                      </p>
                    )}
                    {r.관리기관명 && (
                      <p className="mt-1 text-sm text-slate-500">
                        <span className="font-bold text-slate-700">문의: </span>
                        {r.관리기관명} {r.관리기관전화번호}
                      </p>
                    )}
                  </>
                )}
              />
            </ListFilter>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-white p-4 text-lg text-slate-500">
            등록된 거주자우선주차구역 정보가 없습니다.
          </p>
        )}
      </section>

      <RegionGuide sigungu={sigungu} hasResident={hasResident} />

      <RelatedRegions
        regions={allRegions}
        sido={sido}
        currentSigungu={sigungu}
      />
    </main>
  );
}
