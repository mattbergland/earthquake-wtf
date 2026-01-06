import EarthquakeStatus from "@/components/EarthquakeStatus";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center pb-20 md:pb-0">
      <EarthquakeStatus />
    </main>
  );
}
