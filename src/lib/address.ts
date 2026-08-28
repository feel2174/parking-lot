// 주소 문자열에서 행정동(동/읍/면/리/가) 이름을 뽑는다. 목록을 동네 단위로
// 묶는 데 쓰이고, 지역 요약 통계에서도 같은 기준을 써야 하므로 공용 모듈로 분리.
export function extractDong(address: string): string {
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

export function naverMapUrl(address: string): string {
  // 상호명까지 같이 넣으면 정부 데이터 표기와 네이버 POI 이름이 달라서
  // 검색이 아예 안 잡히는 경우가 많다. 주소만으로 검색한다.
  return `https://map.naver.com/p/search/${encodeURIComponent(address)}`;
}
