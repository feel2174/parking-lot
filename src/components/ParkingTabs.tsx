"use client";

import { useState } from "react";
import type { ParkingLot, ResidentParkingZone } from "@/lib/regions";
import AddressGroupedList from "@/components/AddressGroupedList";
import OperatingDayBadges from "@/components/OperatingDayBadges";

function formatFee(p: ParkingLot): string {
  if (p.요금정보 === "무료") return "무료";
  const parts: string[] = [];
  if (p.주차기본시간 && p.주차기본요금) {
    parts.push(`기본 ${p.주차기본시간}분 ${Number(p.주차기본요금).toLocaleString()}원`);
  }
  if (p.추가단위시간 && p.추가단위요금) {
    parts.push(`추가 ${p.추가단위시간}분당 ${Number(p.추가단위요금).toLocaleString()}원`);
  }
  if (parts.length === 0) {
    return p.요금정보 === "혼합" ? "혼합(무료+유료 구간 있음)" : p.요금정보 || "요금 정보 없음";
  }
  const prefix = p.요금정보 === "혼합" ? "혼합(무료 구간 있음) · " : "";
  return prefix + parts.join(", ");
}

function SplitLines({ text }: { text: string }) {
  if (!text) return null;
  const lines = text
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

function tabClass(active: boolean) {
  return active
    ? "cursor-pointer rounded-full bg-blue px-4 py-2 text-sm font-bold text-white"
    : "cursor-pointer rounded-full border-2 border-blue bg-white px-4 py-2 text-sm font-bold text-blue-dark hover:bg-blue-light";
}

export default function ParkingTabs({
  parking,
  residentParking,
}: {
  parking: ParkingLot[];
  residentParking: ResidentParkingZone[];
}) {
  const hasParking = parking.length > 0;
  const hasResident = residentParking.length > 0;
  const [tab, setTab] = useState<"parking" | "resident">(hasParking ? "parking" : "resident");

  if (!hasParking && !hasResident) {
    return (
      <p className="mt-4 rounded-xl bg-white p-4 text-lg text-slate-500">
        아직 등록된 주차 정보가 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-4">
      {hasParking && hasResident && (
        <div className="flex gap-2">
          <button className={tabClass(tab === "parking")} onClick={() => setTab("parking")}>
            공영·민영 주차장 ({parking.length})
          </button>
          <button className={tabClass(tab === "resident")} onClick={() => setTab("resident")}>
            거주자우선주차구역 ({residentParking.length})
          </button>
        </div>
      )}

      <div className="mt-4">
        {tab === "parking" && hasParking && (
          <AddressGroupedList
            items={parking}
            unit="곳"
            searchPlaceholder="동 이름이나 주차장 이름으로 찾기"
            emptyText="일치하는 주차장이 없어요."
            getAddress={(p) => p.소재지도로명주소 || p.소재지지번주소 || ""}
            getSearchText={(p) =>
              `${p.주차장명} ${p.소재지도로명주소 || p.소재지지번주소 || ""}`
            }
            renderItem={(p) => (
              <>
                <p className="break-words text-base font-bold text-slate-900">
                  {p.주차장명}{" "}
                  <span className="ml-1 rounded-full bg-blue-light px-2 py-0.5 text-xs font-bold text-blue-dark">
                    {p.주차장구분}
                  </span>
                  {p.장애인전용주차구역보유여부 === "Y" && (
                    <span className="ml-1 rounded-full bg-yellow px-2 py-0.5 text-xs font-bold text-yellow-dark">
                      장애인전용구역 있음
                    </span>
                  )}
                </p>
                <p className="mt-1 break-words text-sm text-slate-500">
                  {p.소재지도로명주소 || p.소재지지번주소}
                  {p.주차구획수 ? ` · ${p.주차구획수}면` : ""}
                </p>
                <p className="mt-2">
                  <OperatingDayBadges value={p.운영요일} />
                </p>
                <p className="mt-1 text-sm text-slate-500">{formatFee(p)}</p>
              </>
            )}
          />
        )}

        {tab === "resident" && hasResident && (
          <>
            <p className="mb-3 rounded-xl bg-yellow/20 px-4 py-3 text-sm text-yellow-dark">
              이 구역은 아무나 바로 이용하는 곳이 아니라, 거주자가 <b>신청해서 배정받는</b>{" "}
              주차 구역이에요. 신청 방법·서류는 항목별로 확인하세요.
            </p>
            <AddressGroupedList
              items={residentParking}
              unit="구역"
              searchPlaceholder="동 이름이나 구역 이름으로 찾기"
              emptyText="일치하는 거주자우선주차구역이 없어요."
              getAddress={(r) => r.소재지도로명주소 || r.소재지지번주소 || ""}
              getSearchText={(r) =>
                `${r.거주자우선주차구역명} ${r.소재지도로명주소 || r.소재지지번주소 || ""}`
              }
              renderItem={(r) => (
                <>
                  <p className="break-words text-base font-bold text-slate-900">
                    {r.거주자우선주차구역명}{" "}
                    {!!r.구획수 && r.구획수 > 1 && (
                      <span className="ml-1 rounded-full bg-blue-light px-2 py-0.5 text-xs font-bold text-blue-dark">
                        {r.구획수}구획
                      </span>
                    )}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {r.소재지도로명주소 || r.소재지지번주소}
                  </p>
                  {r.사용시간대정보 && (
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="font-bold text-slate-700">사용시간대: </span>
                      <SplitLines text={r.사용시간대정보} />
                    </p>
                  )}
                  {r.이용요금 && (
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="font-bold text-slate-700">이용요금: </span>
                      <SplitLines text={r.이용요금} />
                    </p>
                  )}
                  {(r.정기접수시작일자 || r.정기접수종료일자) && (
                    <p className="mt-1 text-sm text-slate-500">
                      <span className="font-bold text-slate-700">접수기간: </span>
                      {r.정기접수시작일자} ~ {r.정기접수종료일자}
                    </p>
                  )}
                  {r.신청방법 && (
                    <p className="mt-1 text-sm text-slate-500">
                      <span className="font-bold text-slate-700">신청방법: </span>
                      {r.신청방법.split("+").join(", ")}
                    </p>
                  )}
                  {r.신청서류 && (
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="font-bold text-slate-700">신청서류: </span>
                      <SplitLines text={r.신청서류} />
                    </p>
                  )}
                  {r.관리기관명 && (
                    <p className="mt-1 text-sm text-slate-500">
                      <span className="font-bold text-slate-700">문의: </span>
                      {r.관리기관명} {r.관리기관전화번호}
                    </p>
                  )}
                </>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
