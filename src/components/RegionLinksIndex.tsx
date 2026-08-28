import type { RegionSummary } from "@/lib/regions";
import { sidoAlias } from "@/lib/sidoAlias";

// 홈에서 전체 시군구로 가는 서버 렌더 링크 인덱스. 기존 KoreaMap은 클라이언트
// 컴포넌트라 시군구 링크가 클릭 후에만 생성돼 최초 HTML에 지역 링크가 하나도
// 없었다(문서 2-2 링크 디스커버리 실패). 이 인덱스는 모든 지역 <a>를 서버에서
// 렌더해 크롤러가 sitemap 없이도 전 지역을 발견하게 한다. <details>로 접어
// 시각적 부담은 줄이되 링크 자체는 접힘 여부와 무관하게 DOM에 존재한다.
export default function RegionLinksIndex({
  regions,
}: {
  regions: RegionSummary[];
}) {
  const bySido = new Map<string, RegionSummary[]>();
  for (const r of regions) {
    if (!bySido.has(r.sido)) bySido.set(r.sido, []);
    bySido.get(r.sido)!.push(r);
  }

  const sidos = [...bySido.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "ko")
  );

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-blue-dark">전체 지역 바로가기</h2>
      <p className="mt-2 text-base text-slate-500">
        지도를 누르기 어렵다면 아래에서 지역을 직접 선택하세요.
      </p>

      <div className="mt-4 space-y-2">
        {sidos.map(([sido, list], i) => {
          const alias = sidoAlias(sido);
          const sorted = [...list].sort((a, b) =>
            a.sigungu.localeCompare(b.sigungu, "ko")
          );
          return (
            <details
              key={sido}
              open={i === 0}
              className="rounded-xl border-2 border-blue bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-blue-light/40">
                <span className="text-lg font-bold text-slate-900">
                  {sido}
                  {alias ? (
                    <span className="ml-1 text-sm font-normal text-slate-500">
                      ({alias})
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-base text-slate-500">
                  {sorted.length}개 지역
                </span>
              </summary>
              <ul className="grid grid-cols-2 gap-2 border-t-2 border-blue-light p-3 sm:grid-cols-3">
                {sorted.map((r) => (
                  <li key={r.sigungu}>
                    <a
                      href={`/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`}
                      className="block rounded-lg bg-blue-light px-3 py-2 text-center text-base font-semibold text-blue-dark hover:bg-yellow"
                    >
                      {r.sigungu}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
