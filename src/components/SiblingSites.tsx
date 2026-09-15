// zucca100 "우리동네" 묶음의 형제 사이트로 가는 교차 링크.
// 세 사이트(dongne-info·ewaste-info·parking-for-all)는 지역 키(시도/시군구)가 같아서
// 같은 지역 페이지로 바로 연결한다. 서버 렌더 <a>라 최초 HTML에 포함된다.
export const SIBLINGS = [
  {
    name: "우리동네 생활정보",
    url: "https://dongne-info.zucca100.com",
    topic: "재활용 쓰레기 버리는 날·종량제봉투 파는 곳",
  },
  {
    name: "우리동네 폐가전 수거함",
    url: "https://ewaste-info.zucca100.com",
    topic: "폐가전·폐휴대폰 수거함 위치",
  },
];

export default function SiblingSites({ sido, sigungu }: { sido: string; sigungu: string }) {
  const path = `/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-blue-dark break-keep">
        {sido} {sigungu} 생활정보 더보기
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {SIBLINGS.map((s) => (
          <li key={s.url}>
            <a
              href={`${s.url}${path}`}
              className="block rounded-xl border-2 border-blue-light bg-white p-4 transition-colors hover:border-blue"
            >
              <span className="block text-base font-bold text-slate-900 break-keep">
                {sigungu} {s.topic}
              </span>
              <span className="mt-1 block text-sm text-slate-500">{s.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
