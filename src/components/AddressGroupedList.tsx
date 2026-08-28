import { type ReactNode } from "react";
import { extractDong, naverMapUrl } from "@/lib/address";

// 서버 컴포넌트. 모든 항목을 최초 HTML에 실제 마크업으로 렌더한다(문서 2-1 해결:
// 핵심 리스트를 서버 렌더). 동네 접기는 <details>로 처리해 JS 없이도 콘텐츠가
// DOM에 그대로 존재 → 크롤러가 전부 읽는다. 검색은 ListFilter(클라이언트)가 이
// 서버 DOM 위에 얹혀 [data-search] 항목을 숨기고/펼치는 방식으로만 관여한다.
export default function AddressGroupedList<T>({
  items,
  getAddress,
  getSearchText,
  renderItem,
  unit,
  emptyText,
}: {
  items: T[];
  getAddress: (item: T) => string;
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  unit: string;
  emptyText: string;
}) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const dong = extractDong(getAddress(item));
    if (!map.has(dong)) map.set(dong, []);
    map.get(dong)!.push(item);
  }
  const grouped = [...map.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div data-list>
      <p className="mt-2 text-sm text-slate-500">
        {grouped.length}개 동네에 총 {items.length}
        {unit} · 동네를 눌러서 펼쳐보세요
      </p>

      <p
        data-empty
        hidden
        className="mt-3 rounded-xl bg-white p-4 text-base text-slate-500"
      >
        {emptyText}
      </p>

      <div className="mt-3 space-y-2">
        {grouped.map(([dong, list], gi) => (
          <details
            key={dong}
            data-group
            data-dong={dong.toLowerCase()}
            open={gi === 0}
            className="overflow-hidden rounded-xl border-2 border-blue bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-blue-light/40">
              <span className="min-w-0 break-words text-lg font-bold text-slate-900">
                {dong}
              </span>
              <span className="shrink-0 text-base text-slate-500">
                {list.length}
                {unit}
              </span>
            </summary>

            <ul className="divide-y-2 divide-blue-light border-t-2 border-blue-light">
              {list.map((item, i) => (
                <li key={i} data-search={getSearchText(item).toLowerCase()}>
                  <a
                    href={naverMapUrl(getAddress(item))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block cursor-pointer px-4 py-3 hover:bg-blue-light/40"
                  >
                    {renderItem(item)}
                    <p className="mt-1 text-sm font-bold text-blue-dark">
                      네이버지도에서 보기 ↗
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
