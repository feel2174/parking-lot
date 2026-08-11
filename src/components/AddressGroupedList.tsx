"use client";

import { useMemo, useState, type ReactNode } from "react";

function extractDong(address: string): string {
  // 주소 끝 괄호 안에는 "(광명동)"처럼 깔끔한 경우도 있지만
  // "(견소동, 송정해변신도브래뉴아파트)"처럼 동 이름 뒤에 건물명이 붙는 경우도
  // 많다. 괄호 안 첫 콤마 앞 토큰에서 진짜 행정동 이름처럼 보이는 앞부분만
  // 뽑는다(너무 길게 매칭되면 "OO상가동"처럼 건물명을 동으로 오인하니 4자 제한).
  const bracketed = address.match(/\(([^)]+)\)\s*$/);
  if (bracketed) {
    const first = bracketed[1].split(",")[0].trim();
    const dongMatch = first.match(/^[가-힣0-9]{1,4}(동|읍|면|리|가)/);
    if (dongMatch) return dongMatch[0];
  }
  // 괄호가 없는 주소(주차장 데이터 대부분)는 "OO시 OO구 OO동 ..."에서
  // 시/군/구 다음에 오는 동/읍/면/리 토큰을 직접 찾는다.
  const inline = address.match(/(?:시|군|구)\s+([가-힣0-9]{1,4}(동|읍|면|리|가))/);
  if (inline) return inline[1];
  return "기타";
}

function naverMapUrl(address: string) {
  // 상호명까지 같이 넣으면 정부 데이터 표기와 네이버 POI 이름이 달라서
  // 검색이 아예 안 잡히는 경우가 많다. 주소만으로 검색한다.
  return `https://map.naver.com/p/search/${encodeURIComponent(address)}`;
}

export default function AddressGroupedList<T>({
  items,
  getAddress,
  getSearchText,
  renderItem,
  unit,
  searchPlaceholder,
  emptyText,
}: {
  items: T[];
  getAddress: (item: T) => string;
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  unit: string;
  searchPlaceholder: string;
  emptyText: string;
}) {
  const [query, setQuery] = useState("");
  const [openDong, setOpenDong] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const dong = extractDong(getAddress(item));
      if (!map.has(dong)) map.set(dong, []);
      map.get(dong)!.push(item);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const hasQuery = query.trim().length > 0;

  const filteredGrouped = useMemo(() => {
    const q = query.trim();
    if (!q) return grouped;
    return grouped
      .map(([dong, list]): [string, T[]] => [
        dong,
        list.filter((item) => getSearchText(item).includes(q) || dong.includes(q)),
      ])
      .filter(([, list]) => list.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grouped, query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-xl border-2 border-blue bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-dark"
      />

      <p className="mt-2 text-sm text-slate-500">
        {grouped.length}개 동네에 총 {items.length}
        {unit} · 동네를 눌러서 펼쳐보세요
      </p>

      <div className="mt-3 space-y-2">
        {filteredGrouped.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-base text-slate-500">{emptyText}</p>
        )}
        {filteredGrouped.map(([dong, list]) => {
          const isOpen = hasQuery || openDong === dong;
          return (
            <div
              key={dong}
              className="overflow-hidden rounded-xl border-2 border-blue bg-white"
            >
              <button
                onClick={() => setOpenDong(openDong === dong ? null : dong)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left hover:bg-blue-light/40"
              >
                <span className="min-w-0 break-words text-lg font-bold text-slate-900">
                  {dong}
                </span>
                <span className="shrink-0 text-base text-slate-500">
                  {list.length}
                  {unit} {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <ul className="divide-y-2 divide-blue-light border-t-2 border-blue-light">
                  {list.map((item, i) => (
                    <li key={i}>
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
