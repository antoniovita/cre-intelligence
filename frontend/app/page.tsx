import TerritoryMap from "@/components/map/TerritoryMap";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="h-screen w-full">
        <TerritoryMap />
      </div>
    </div>
  );
}
