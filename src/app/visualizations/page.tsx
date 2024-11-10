"use client";

import { useEffect, useState } from "react";
import { BarChart } from "@/components/BarChart";
import { getKeywords } from "@/actions/query";

const KeywordsBarChart = () => {
  const [data, setData] = useState<{ keyword: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const fetchedData = await getKeywords();
      
      // Sort keywords by count in descending order and take the top 100
      const topKeywords = fetchedData
        .sort((a, b) => b.count - a.count)
        .slice(0, 100);

      setData(topKeywords);
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <main className="flex flex-col items-center gap-y-5 pt-24 text-center">
      <h1 className="text-3xl font-semibold"> Top 100 Keywords Bar Chart</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <BarChart data={data}/>
      )}
    </main>
  );
};

export default KeywordsBarChart;
