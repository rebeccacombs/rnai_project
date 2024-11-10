"use server";
import prisma from "@/lib/db";

export async function getKeywords() {
  const papers = await prisma.paper.findMany({
    select: { keywords: true },
  });
  
  // Flatten all keywords and count occurrences
  const keywordCounts: { [key: string]: number } = {};
  papers.forEach((paper) => {
    paper.keywords.forEach((keyword: string) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });

  return Object.entries(keywordCounts).map(([keyword, count]) => ({ keyword, count }));
}
