import { getAllRegionSummaries } from "@/lib/regions";
import KoreaMap from "@/components/KoreaMap";
import RegionLinksIndex from "@/components/RegionLinksIndex";
import AdSlot from "@/components/AdSlot";

export default function Home() {
  const regions = getAllRegionSummaries();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl bg-blue px-6 py-8 text-center text-white">
        <h1 className="text-3xl font-extrabold sm:text-4xl">우리동네 주차장 정보</h1>
        <p className="mt-3 text-lg text-blue-light sm:text-xl">
          공영·민영 주차장, 거주자우선주차구역을 지도에서 찾아보세요
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-center text-2xl font-bold text-blue-dark">
          지역을 눌러보세요
        </h2>
        <AdSlot slot="1687931549" />
        <div className="mt-4">
          <KoreaMap regions={regions} />
        </div>
      </div>

      <RegionLinksIndex regions={regions} />
    </main>
  );
}
