import type { RegionStats } from "@/lib/regionStats";
import AdSlot from "@/components/AdSlot";
import { buildRegionFaqs } from "@/lib/regionFaqs";

// 원본 공공데이터에는 없는 편집적 부가가치(문서 1-3 원칙): 지역별로 계산된 요약
// 문장 + 이용 안내/FAQ. 서버 컴포넌트라 최초 HTML에 고유 텍스트로 들어가고,
// 지역마다 통계값이 달라 "동일 템플릿 대량복제"가 아니라 지역 고유 콘텐츠가 된다.
export function RegionSummary({
  sido,
  sigungu,
  alias,
  stats,
}: {
  sido: string;
  sigungu: string;
  alias: string | null;
  stats: RegionStats;
}) {
  const label = `${alias ? `${alias} ` : ""}${sigungu}`;
  const sentences: string[] = [];

  if (stats.parkingCount > 0) {
    sentences.push(
      `${sido} ${sigungu}에는 공영·민영 주차장 ${stats.parkingCount}곳이 등록되어 있습니다` +
        (stats.residentCount > 0
          ? `, 거주자우선주차구역은 ${stats.residentCount}곳입니다.`
          : ".")
    );
    if (stats.dongCount > 0) {
      const top = stats.topDongs
        .map((d) => `${d.dong}(${d.count}곳)`)
        .join(", ");
      sentences.push(
        `주차장은 ${stats.dongCount}개 동네에 걸쳐 있으며` +
          (top ? `, 특히 ${top}에 많이 분포합니다.` : ".")
      );
    }
    const feeParts: string[] = [];
    if (stats.freeCount > 0) feeParts.push(`무료 ${stats.freeCount}곳`);
    if (stats.paidCount > 0) feeParts.push(`유료 ${stats.paidCount}곳`);
    if (feeParts.length > 0) {
      sentences.push(`요금 기준으로는 ${feeParts.join(", ")}이 있습니다.`);
    }
    if (stats.publicCount > 0) {
      sentences.push(`이 가운데 공영주차장은 ${stats.publicCount}곳입니다.`);
    }
    if (stats.accessibleCount > 0) {
      sentences.push(
        `장애인 전용 주차구역을 갖춘 곳은 ${stats.accessibleCount}곳입니다.`
      );
    }
    if (stats.totalSpaces > 0) {
      sentences.push(
        `등록된 주차 구획은 모두 합쳐 약 ${stats.totalSpaces.toLocaleString()}면 규모입니다.`
      );
    }
  } else if (stats.residentCount > 0) {
    sentences.push(
      `${sido} ${sigungu}에는 거주자우선주차구역 ${stats.residentCount}곳이 등록되어 있습니다.`
    );
  }

  if (sentences.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-blue-dark">
        {label} 주차 현황 한눈에 보기
      </h2>
      <AdSlot slot="1687931549" />
      <p className="mt-3 leading-relaxed text-slate-700">{sentences.join(" ")}</p>
    </section>
  );
}

export function RegionGuide({
  sigungu,
  hasResident,
}: {
  sigungu: string;
  hasResident: boolean;
}) {
  const faqs = buildRegionFaqs({ sigungu, hasResident });
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-blue-dark">
        {sigungu} 주차장 이용 안내 · 자주 묻는 질문
      </h2>
      <div className="mt-3 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="rounded-xl border-2 border-blue-light bg-white px-4 py-3"
          >
            <summary className="cursor-pointer font-bold text-slate-800">
              {faq.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
