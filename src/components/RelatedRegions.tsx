import type { RegionSummary } from "@/lib/regions";

// 같은 시도 안의 다른 시군구로 가는 내부 링크. 서버 렌더라 최초 HTML에 실제
// <a>로 포함돼, 크롤러가 지역 페이지 사이를 걸어다닐 수 있는 발견 경로를
// 만든다(문서 2-2 링크 디스커버리 보완).
export default function RelatedRegions({
  regions,
  sido,
  currentSigungu,
}: {
  regions: RegionSummary[];
  sido: string;
  currentSigungu: string;
}) {
  const siblings = regions
    .filter((r) => r.sido === sido && r.sigungu !== currentSigungu)
    .sort((a, b) => a.sigungu.localeCompare(b.sigungu, "ko"));

  if (siblings.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-blue-dark">
        {sido}의 다른 지역 주차장
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {siblings.map((r) => (
          <li key={r.sigungu}>
            <a
              href={`/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`}
              className="block rounded-lg bg-blue-light px-3 py-2 text-sm font-semibold text-blue-dark hover:bg-yellow"
            >
              {r.sigungu}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
