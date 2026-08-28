import type { ParkingLot, ResidentParkingZone } from "@/lib/regions";
import { extractDong } from "@/lib/address";

// 지역 페이지에 원본 데이터에는 없는 "편집적 부가가치"(문서 1-3 원칙)를 얹기
// 위한 계산값. 순수 함수라 서버 컴포넌트에서 그대로 호출해 최초 HTML에 문장으로
// 렌더한다. 각 지역마다 값이 달라지므로 템플릿 대량복제가 아니라 지역별 고유
// 요약이 된다.
export interface RegionStats {
  parkingCount: number;
  residentCount: number;
  freeCount: number;
  paidCount: number;
  accessibleCount: number;
  publicCount: number;
  totalSpaces: number;
  dongCount: number;
  topDongs: { dong: string; count: number }[];
}

function getAddress(p: ParkingLot): string {
  return p.소재지도로명주소 || p.소재지지번주소 || "";
}

export function computeRegionStats(
  parking: ParkingLot[],
  resident: ResidentParkingZone[]
): RegionStats {
  const dongMap = new Map<string, number>();
  let free = 0;
  let paid = 0;
  let accessible = 0;
  let publicLots = 0;
  let totalSpaces = 0;

  for (const p of parking) {
    const dong = extractDong(getAddress(p));
    dongMap.set(dong, (dongMap.get(dong) ?? 0) + 1);

    if (p.요금정보 === "무료") free += 1;
    else if (p.요금정보 === "유료") paid += 1;

    if (p.장애인전용주차구역보유여부 === "Y") accessible += 1;
    if (p.주차장구분 === "공영") publicLots += 1;

    const spaces = Number(p.주차구획수);
    if (Number.isFinite(spaces) && spaces > 0) totalSpaces += spaces;
  }

  const topDongs = [...dongMap.entries()]
    .filter(([dong]) => dong !== "기타")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([dong, count]) => ({ dong, count }));

  return {
    parkingCount: parking.length,
    residentCount: resident.length,
    freeCount: free,
    paidCount: paid,
    accessibleCount: accessible,
    publicCount: publicLots,
    totalSpaces,
    dongCount: dongMap.size,
    topDongs,
  };
}
