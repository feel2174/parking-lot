"use client";

import { useEffect, useRef, useState } from "react";
// @svg-maps/south-korea 타입 선언이 미배포 패키지에 의존해 any로 풀려서
// unknown으로 받아 최소 타입으로 캐스팅한다.
import southKoreaRaw from "@svg-maps/south-korea";
import type { RegionSummary } from "@/lib/regions";
import RegionSearch from "@/components/RegionSearch";

interface SvgMapLocation {
  id: string;
  name: string;
  path: string;
}

interface SvgMap {
  viewBox: string;
  locations: SvgMapLocation[];
}

const southKorea = southKoreaRaw as unknown as SvgMap;

// @svg-maps/south-korea 영문 id -> 실제 데이터의 한글 시도명
const ID_TO_SIDO: Record<string, string> = {
  busan: "부산광역시",
  daegu: "대구광역시",
  daejeon: "대전광역시",
  gangwon: "강원특별자치도",
  gwangju: "광주광역시",
  gyeonggi: "경기도",
  incheon: "인천광역시",
  jeju: "제주특별자치도",
  "north-chungcheong": "충청북도",
  "north-gyeongsang": "경상북도",
  "north-jeolla": "전북특별자치도",
  sejong: "세종특별자치시",
  seoul: "서울특별시",
  "south-chungcheong": "충청남도",
  "south-gyeongsang": "경상남도",
  "south-jeolla": "전라남도",
  ulsan: "울산광역시",
};

export default function KoreaMap({ regions }: { regions: RegionSummary[] }) {
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [hoveredSido, setHoveredSido] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const bySido = new Map<string, RegionSummary[]>();
  for (const r of regions) {
    if (!bySido.has(r.sido)) bySido.set(r.sido, []);
    bySido.get(r.sido)!.push(r);
  }

  useEffect(() => {
    if (selectedSido && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedSido]);

  const selectedRegions = selectedSido ? (bySido.get(selectedSido) ?? []) : [];

  return (
    <div>
      {/* 지도 위 고정 공간 — hover된 지역명을 여기 표시 (커서 따라다니는
          툴팁 없이도 어느 지역인지 알 수 있게). 항상 같은 높이라 레이아웃
          시프트 없음 */}
      <div className="flex h-10 items-center justify-center rounded-lg bg-white text-lg font-bold text-blue-dark">
        {hoveredSido ?? "지역에 마우스를 올려보세요"}
      </div>

      <svg
        viewBox={southKorea.viewBox}
        role="img"
        aria-label="대한민국 지도"
        className="mx-auto mt-2 w-full max-w-md"
      >
        {southKorea.locations.map((loc) => {
          const sido = ID_TO_SIDO[loc.id];
          const available = bySido.has(sido);
          const isSelected = selectedSido === sido;

          return (
            <path
              key={loc.id}
              d={loc.path}
              onClick={() => available && setSelectedSido(isSelected ? null : sido)}
              onMouseEnter={() => setHoveredSido(sido ?? loc.name)}
              onMouseLeave={() => setHoveredSido(null)}
              className={[
                "stroke-white transition-colors",
                !available
                  ? "fill-slate-200 cursor-not-allowed"
                  : isSelected
                    ? "fill-blue cursor-pointer"
                    : "fill-yellow hover:fill-yellow-dark cursor-pointer",
              ].join(" ")}
              strokeWidth={2}
            >
              <title>{sido ?? loc.name}</title>
            </path>
          );
        })}
      </svg>

      <p className="mt-4 text-center text-base text-slate-500">
        회색 지역은 아직 데이터가 준비되지 않았어요. 파란/노랑 지역을 눌러보세요.
      </p>

      <div className="mt-6">
        <RegionSearch regions={regions} />
      </div>

      {selectedSido && (
        <div
          ref={panelRef}
          className="mt-6 scroll-mt-6 rounded-2xl border-4 border-blue bg-white p-5"
        >
          <h2 className="text-xl font-bold text-blue-dark mb-3">
            {selectedSido} 시군구 ({selectedRegions.length}개)
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {selectedRegions
              .sort((a, b) => a.sigungu.localeCompare(b.sigungu, "ko"))
              .map((r) => (
                <li key={r.sigungu}>
                  <a
                    href={`/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`}
                    className="block cursor-pointer rounded-lg bg-blue-light px-3 py-2 text-center text-base font-semibold text-blue-dark hover:bg-yellow"
                  >
                    {r.sigungu}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
