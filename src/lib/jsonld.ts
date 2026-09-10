import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { ParkingLot, ResidentParkingZone } from "@/lib/regions";
import { buildRegionFaqs } from "@/lib/regionFaqs";

// schema.org 구조화 데이터 빌더. 순수 함수로 그래프(@graph) 객체를 만들고,
// 렌더는 <JsonLd> 컴포넌트가 담당한다. Google/네이버가 @id로 노드를 병합하므로
// 레이아웃(Organization/WebSite)과 페이지 노드를 @id로 상호 참조한다.

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const SITE_DESCRIPTION =
  "전국 시군구별 공영·민영 주차장 위치와 요금, 거주자우선주차구역 신청 방법을 한눈에 확인하세요.";

type JsonLdNode = Record<string, unknown>;

/** 값이 undefined인 키를 제거해 빈/불확실한 필드가 출력되지 않게 한다. */
function prune<T extends Record<string, unknown>>(obj: T): T {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) delete obj[key];
  }
  return obj;
}

function regionUrl(sido: string, sigungu: string): string {
  return `${SITE_URL}/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`;
}

function postalAddress(
  address: string,
  sido: string,
  sigungu: string
): JsonLdNode {
  return prune({
    "@type": "PostalAddress",
    streetAddress: address || undefined,
    addressLocality: sigungu,
    addressRegion: sido,
    addressCountry: "KR",
  });
}

function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/apple-icon`,
    },
  };
}

function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko-KR",
    publisher: { "@id": ORG_ID },
  };
}

/** 레이아웃(전역): 발행처 Organization + WebSite. */
export function siteGraph(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode()],
  };
}

/** 홈: CollectionPage + 전 지역 링크 ItemList(크롤 발견 경로 보강). */
export function homeGraph(
  regions: { sido: string; sigungu: string }[]
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        inLanguage: "ko-KR",
        about: {
          "@type": "Thing",
          name: "전국 공영·민영 주차장 및 거주자우선주차구역",
        },
        mainEntity: { "@id": `${SITE_URL}/#region-list` },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#region-list`,
        name: "지역별 주차장 정보",
        numberOfItems: regions.length,
        itemListElement: regions.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${r.sido} ${r.sigungu}`,
          url: regionUrl(r.sido, r.sigungu),
        })),
      },
    ],
  };
}

/** 지역 상세: CollectionPage + Breadcrumb + FAQPage + 주차장/거주자구역 ItemList + Dataset. */
export function regionGraph(params: {
  sido: string;
  sigungu: string;
  alias: string | null;
  parking: ParkingLot[];
  residentParking: ResidentParkingZone[];
}): JsonLdNode {
  const { sido, sigungu, alias, parking, residentParking } = params;
  const url = regionUrl(sido, sigungu);
  const label = `${alias ? `${alias} ` : ""}${sigungu}`;
  const hasResident = residentParking.length > 0;
  const faqs = buildRegionFaqs({ sigungu, hasResident });

  const nodes: JsonLdNode[] = [];

  nodes.push({
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: `${sido}${alias ? `(${alias})` : ""} ${sigungu} 공영·민영 주차장 · 거주자우선주차구역`,
    description: `${sido} ${sigungu}의 공영·민영 주차장 위치·요금과 거주자우선주차구역 신청 방법을 정리했습니다.`,
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "ko-KR",
    about: { "@type": "Thing", name: `${label} 주차장` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    isBasedOn: { "@id": `${url}#dataset` },
  });

  // 방문 경로: 홈 → 시도(별도 페이지 없음, 이름만) → 시군구. 화면 breadcrumb과 동일.
  nodes.push({
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: sido },
      { "@type": "ListItem", position: 3, name: sigungu, item: url },
    ],
  });

  if (faqs.length > 0) {
    nodes.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
  }

  if (parking.length > 0) {
    nodes.push({
      "@type": "ItemList",
      "@id": `${url}#parking-list`,
      name: `${label} 공영·민영 주차장`,
      numberOfItems: parking.length,
      itemListElement: parking.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: prune({
          "@type": "ParkingFacility",
          name: p.주차장명,
          address: postalAddress(
            p.소재지도로명주소 || p.소재지지번주소,
            sido,
            sigungu
          ),
          telephone: p.전화번호 || undefined,
          isAccessibleForFree:
            p.요금정보 === "무료"
              ? true
              : p.요금정보 === "유료"
                ? false
                : undefined,
        }),
      })),
    });
  }

  if (residentParking.length > 0) {
    nodes.push({
      "@type": "ItemList",
      "@id": `${url}#resident-list`,
      name: `${label} 거주자우선주차구역`,
      numberOfItems: residentParking.length,
      itemListElement: residentParking.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: prune({
          "@type": "Place",
          name: r.거주자우선주차구역명,
          address: postalAddress(
            r.소재지도로명주소 || r.소재지지번주소,
            sido,
            sigungu
          ),
        }),
      })),
    });
  }

  // 데이터 출처 명시 → 생성형 검색(AI Overviews 등)의 인용·신뢰 근거.
  nodes.push({
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: `${sido} ${sigungu} 주차장·거주자우선주차구역 데이터`,
    description: `${sido} ${sigungu}의 공영·민영 주차장과 거주자우선주차구역 공공데이터를 지역별로 정리한 데이터셋입니다.`,
    inLanguage: "ko-KR",
    isAccessibleForFree: true,
    creator: {
      "@type": "GovernmentOrganization",
      name: "공공데이터포털 (data.go.kr)",
    },
    spatialCoverage: { "@type": "Place", name: `${sido} ${sigungu}` },
    isPartOf: { "@id": WEBSITE_ID },
  });

  return { "@context": "https://schema.org", "@graph": nodes };
}
