"use client";

import { useEffect, useRef } from "react";

// AdSense 디스플레이 광고 슬롯. 로더 스크립트(adsbygoogle.js)는 layout <head>에서
// 전역으로 한 번만 로드되고, 이 컴포넌트는 각 위치에 <ins> 자리를 렌더한 뒤
// 마운트 시 push({})로 그 자리를 채운다. push는 슬롯당 1회만 실행해
// 개발 모드 StrictMode 이중 마운트/리렌더로 인한 "already have ads" 오류를 막는다.
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AD_CLIENT = "ca-pub-9196149361612087";

export default function AdSlot({
  slot,
  className = "",
}: {
  slot: string;
  className?: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 차단기 등으로 실패해도 페이지 동작에는 영향 없음
    }
  }, []);

  return (
    <div className={`my-6${className ? ` ${className}` : ""}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
