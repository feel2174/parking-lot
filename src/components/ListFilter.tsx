"use client";

import { useRef, useState, type ReactNode } from "react";

// 서버가 이미 전부 렌더한 목록(children) 위에 얹히는 "인터랙션만" 담당하는 얇은
// 클라이언트 레이어(문서 5장 원칙). 데이터를 fetch/렌더하지 않고, 서버 DOM의
// [data-search] 항목을 hidden 토글로 필터링만 한다. JS가 꺼져 있어도 목록은
// 그대로 보이고 크롤러도 전부 읽는다.
export default function ListFilter({
  placeholder,
  children,
}: {
  placeholder: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  function applyFilter(raw: string) {
    setQuery(raw);
    const q = raw.trim().toLowerCase();
    const root = rootRef.current;
    if (!root) return;

    let anyVisible = false;
    const groups = root.querySelectorAll<HTMLDetailsElement>("[data-group]");
    groups.forEach((group) => {
      const dong = group.getAttribute("data-dong") ?? "";
      const dongHit = q !== "" && dong.includes(q);
      let matches = 0;
      group.querySelectorAll<HTMLElement>("[data-search]").forEach((li) => {
        const hay = li.getAttribute("data-search") ?? "";
        const show = q === "" || dongHit || hay.includes(q);
        li.hidden = !show;
        if (show) matches += 1;
      });
      group.hidden = matches === 0;
      if (matches > 0) anyVisible = true;
      // 검색 중에는 매칭된 그룹을 펼쳐 보여준다. 검색어를 지우면 첫 그룹만 열린
      // 초기 상태로 되돌린다.
      if (q === "") group.open = group === groups[0];
      else group.open = matches > 0;
    });

    const empty = root.querySelector<HTMLElement>("[data-empty]");
    if (empty) empty.hidden = q === "" || anyVisible;
  }

  return (
    <div ref={rootRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => applyFilter(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-blue bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-dark"
      />
      {children}
    </div>
  );
}
