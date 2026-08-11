# parking-lot

`local-data-pipeline`에서 수집한 전국 주차장/거주자우선주차구역 데이터로 만든
독립 사이트. 원래 `dongne-info`(쓰레기·종량제봉투 정보)에 섹션으로 얹었다가,
주제를 명확히 분리하고 시각적 아이덴티티도 완전히 다르게 가져가기 위해 별도
사이트로 분리함.

- **dongne-info**: 초록/노랑, 재활용·친환경 톤
- **parking-lot**: 네이비블루/화이트 + 옐로우 포인트, 실제 주차 표지판 배색

## 데이터
파이프라인은 손대지 않고 그대로 재사용 — `../local-data-pipeline`의
`parking`/`resident_parking` 키만 동기화해서 씀.

```bash
npm run sync-data   # ../local-data-pipeline/data/by_region 복사
npm run build
```

**거주자우선주차 중복 제거 필수**: 원본은 "구역" 단위가 아니라 "구획"(개별
주차칸) 단위 — 한 구역에 구획이 수천 개면 그만큼 행이 반복된다(울산 중구 한
곳만 2,268구역이지만 dedupe 전엔 훨씬 많음). `src/lib/regions.ts`의
`dedupeResidentParking`이 구역명+주소 기준으로 대표 1건만 남기고 구획 수를
집계한다 — 이거 빠뜨리면 dongne-info에서 겪었던 것처럼 특정 지역 페이지가
Vercel ISR 19.07MB 제한을 넘겨버린다.

## 구조
```
parking-lot/
  src/app/page.tsx                  # 홈 (지도 + 검색)
  src/app/[sido]/[sigungu]/page.tsx # 지역 상세 (탭: 주차장/거주자우선주차)
  src/components/KoreaMap.tsx       # 대한민국 지도 (블루 톤)
  src/components/ParkingTabs.tsx    # 탭 전환 + 두 데이터셋 표시
  src/components/AddressGroupedList.tsx # 동별 그룹핑+검색+아코디언 (범용)
  src/components/OperatingDayBadges.tsx # 평일/토요일/공휴일 배지
  src/lib/regions.ts                # 데이터 읽기 + 거주자우선주차 중복제거
```

## TODO (배포 전/후 확인)
- Google/네이버/다음 서치어드바이저 소유 확인 코드 — 이 도메인 기준으로 새로
  발급받아서 `src/app/layout.tsx`의 `metadata.verification`에 채울 것
  (dongne-info 코드 재사용 불가 — 도메인별로 다름)
- 배포 도메인은 `parking-for-all.vercel.app` (레포/프로젝트명 `parking-lot`은
  이미 다른 사용자가 선점하고 있어서 vercel.app 서브도메인만 다르게 잡음).
  나중에 도메인을 또 바꾸면 `src/lib/site.ts`, `src/app/robots.txt`의 URL도
  같이 바꿀 것 (`src/app/sitemap.ts`는 site.ts를 import하므로 자동 반영됨)
- 이 프로젝트는 Vercel의 기본 SSO 배포 보호가 켜져 있어서, 프로젝트 이름과
  정확히 일치하지 않는 `*.vercel.app` 별칭(=지금 쓰는 도메인 포함)은 기본적으로
  로그인 없이 접근이 막혀 있었음 — `vercel project protection disable
  parking-lot --sso`로 꺼서 공개 접근 가능하게 함
