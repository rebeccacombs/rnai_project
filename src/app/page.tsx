import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-y-5 pt-24 text-center">
      <h1 className="text-3xl font-semibold">Welcome to the RNAi database</h1>
      <Link href="/papers" className="underline">View papers</Link>
      <Link href="/visualizations" className="underline">View visualizations</Link>
    </main>
  );
}
