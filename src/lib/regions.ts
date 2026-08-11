import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "by_region");

// local-data-pipeline이 만든 지역 파일에는 bag_stores/waste_info도 같이
// 들어있지만 이 사이트는 주차 관련 두 키만 읽는다.
export interface ParkingLot {
  주차장명: string;
  주차장구분: string;
  주차장유형: string;
  소재지도로명주소: string;
  소재지지번주소: string;
  주차구획수: string;
  운영요일: string;
  평일운영시작시각: string;
  평일운영종료시각: string;
  토요일운영시작시각: string;
  토요일운영종료시각: string;
  공휴일운영시작시각: string;
  공휴일운영종료시각: string;
  요금정보: string;
  주차기본시간: string;
  주차기본요금: string;
  추가단위시간: string;
  추가단위요금: string;
  결제방법: string;
  특기사항: string;
  관리기관명: string;
  전화번호: string;
  장애인전용주차구역보유여부: string;
}

export interface ResidentParkingZone {
  거주자우선주차구역명: string;
  소재지도로명주소: string;
  소재지지번주소: string;
  운영형태: string;
  사용시간대정보: string;
  사용기간: string;
  이용요금: string;
  이용요금할인정보: string;
  정기접수시작일자: string;
  정기접수종료일자: string;
  신청방법: string;
  신청서류: string;
  관리기관전화번호: string;
  관리기관명: string;
  /** dedupeResidentParking에서 계산해 채워 넣는 값. 원본 데이터엔 없음. */
  구획수?: number;
}

interface RegionFile {
  parking?: ParkingLot[];
  resident_parking?: ResidentParkingZone[];
}

export interface RegionSummary {
  sido: string;
  sigungu: string;
  parkingCount: number;
  residentParkingCount: number;
}

function parseKey(fileStem: string): { sido: string; sigungu: string } {
  const idx = fileStem.indexOf("_");
  if (idx === -1) return { sido: fileStem, sigungu: fileStem };
  return { sido: fileStem.slice(0, idx), sigungu: fileStem.slice(idx + 1) };
}

let cachedFiles: string[] | null = null;

function listRegionFiles(): string[] {
  if (!cachedFiles) {
    cachedFiles = fs.existsSync(DATA_DIR)
      ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))
      : [];
  }
  return cachedFiles;
}

// 거주자우선주차 원본은 "구역" 단위가 아니라 "구획"(개별 주차칸) 단위로 한
// 행씩 들어있다 — 같은 구역에 구획이 수백~수천 개면 그만큼 행이 반복된다.
// dongne-info에서 이걸 안 걸러서 특정 지역 페이지가 20MB 넘게 터진 적이
// 있어서, 처음부터 구역명+주소 기준으로 대표 1건만 남기고 구획 수를 센다.
function dedupeResidentParking(items: ResidentParkingZone[]): ResidentParkingZone[] {
  const groups = new Map<string, ResidentParkingZone[]>();
  for (const item of items) {
    const key = `${item.거주자우선주차구역명}|${item.소재지도로명주소 || item.소재지지번주소}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups.values()].map((group) => ({ ...group[0], 구획수: group.length }));
}

function readRegionFile(file: string): RegionFile {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw);
}

export function getAllRegionSummaries(): RegionSummary[] {
  return listRegionFiles()
    .map((file) => {
      const stem = file.replace(/\.json$/, "");
      const { sido, sigungu } = parseKey(stem);
      const parsed = readRegionFile(file);
      return {
        sido,
        sigungu,
        parkingCount: parsed.parking?.length ?? 0,
        residentParkingCount: parsed.resident_parking?.length ?? 0,
      };
    })
    .filter((r) => r.parkingCount > 0 || r.residentParkingCount > 0);
}

export function getRegionData(
  sido: string,
  sigungu: string
): { parking: ParkingLot[]; residentParking: ResidentParkingZone[] } | null {
  const file = path.join(DATA_DIR, `${sido}_${sigungu}.json`);
  if (!fs.existsSync(file)) return null;
  const parsed: RegionFile = JSON.parse(fs.readFileSync(file, "utf-8"));
  const residentParking = parsed.resident_parking
    ? dedupeResidentParking(parsed.resident_parking)
    : [];
  return { parking: parsed.parking ?? [], residentParking };
}
