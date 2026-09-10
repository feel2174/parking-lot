import type { RegionStats } from "@/lib/regionStats";
import AdSlot from "@/components/AdSlot";

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
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-blue-dark">
        {sigungu} 주차장 이용 안내 · 자주 묻는 질문
      </h2>
      <div className="mt-3 space-y-3">
        <details className="rounded-xl border-2 border-blue-light bg-white px-4 py-3">
          <summary className="cursor-pointer font-bold text-slate-800">
            주차장 위치와 요금은 어디서 확인하나요?
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            위 목록에서 동네를 펼치면 주차장별 도로명주소, 운영 요일, 기본·추가
            요금이 표시됩니다. 각 항목의 <b>&ldquo;네이버지도에서 보기&rdquo;</b>를
            누르면 실제 위치와 경로를 지도로 확인할 수 있습니다. 요금·운영시간은
            현장 사정에 따라 달라질 수 있으니 방문 전 관리기관에 다시 확인하는
            것을 권합니다.
          </p>
        </details>

        {hasResident && (
          <details className="rounded-xl border-2 border-blue-light bg-white px-4 py-3">
            <summary className="cursor-pointer font-bold text-slate-800">
              거주자우선주차구역은 어떻게 신청하나요?
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              거주자우선주차구역은 누구나 바로 이용하는 곳이 아니라, 해당 지역
              거주자가 신청해 배정받는 주차 구역입니다. {sigungu}의 각 구역 카드에
              정기 접수기간, 신청방법, 필요 서류, 관리기관 연락처가 정리되어
              있으니 신청 전 확인하세요. 접수 일정과 요금은 관할 자치단체 공지에
              따라 바뀔 수 있으므로 관리기관에 문의해 최신 정보를 확인하는 것이
              가장 정확합니다.
            </p>
          </details>
        )}

        <details className="rounded-xl border-2 border-blue-light bg-white px-4 py-3">
          <summary className="cursor-pointer font-bold text-slate-800">
            장애인 전용 주차구역이 있는 주차장만 보고 싶어요.
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            장애인 전용 주차구역을 갖춘 주차장에는 목록에서{" "}
            <b>&ldquo;장애인전용구역 있음&rdquo;</b> 표시가 붙습니다. 위 검색창에
            동 이름이나 주차장 이름을 입력해 원하는 위치를 빠르게 찾을 수 있습니다.
          </p>
        </details>

        <details className="rounded-xl border-2 border-blue-light bg-white px-4 py-3">
          <summary className="cursor-pointer font-bold text-slate-800">
            이 정보의 출처와 기준은 무엇인가요?
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            본 페이지는 공공데이터포털의 전국주차장정보표준데이터와
            전국거주자우선주차정보표준데이터를 지역별로 정리해 보여주는 참고용
            서비스입니다. 원본 데이터의 등록·수정 시점에 따라 실제 현황과 차이가
            있을 수 있으며, 정확한 요금과 신청 절차는 관할 지방자치단체 또는
            관리기관 공지를 통해 확인해 주세요.
          </p>
        </details>
      </div>
    </section>
  );
}
