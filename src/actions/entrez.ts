"use server";
import prisma from "@/lib/db";

import getIDsAndData, { buildQuery } from 'pubmed-fetch'

const api_key = process.env.NCBI_API_KEY;
const authors = ['']
const topics = ['RNAi', "siRNA", "ASO", "mRNA"]
const dateRange = '("2024/09/19"[Date - Create] : "2024/10/15"[Date - Create])'
const numPapers = 15

const query = buildQuery(authors, topics, dateRange);


export default async function getAndSaveData(): Promise<void> {
  try {
    const processedData = await getIDsAndData(query, numPapers, api_key, true);
    for (const paper of processedData) {
      await saveToDatabase(paper);
    }
  }
  catch (error) {
    console.error("Error: ", error)
  }
}


async function saveToDatabase(article: { PMID: number; title: string; slug: string; abstract: string; authors: string[]; journal: string; pubdate: Date; keywords: string[]; url: string; affiliations: string[]; }): Promise<void> {
  try {
    const existingArticle = await prisma.paper.findUnique({
      where: {
        PMID: article.PMID,
      },
    });

    if (!existingArticle) {
      await prisma.paper.create({
        data: {
          PMID: article.PMID,
          title: article.title,
          slug: article.slug,
          abstract: article.abstract,
          authors: {
            set: article.authors
          },
          journal: article.journal,
          pub_date: article.pubdate,
          keywords: {
            set: article.keywords
          },
          url: article.url,
          affiliations: {
            set: article.affiliations
          }
        }
      });
      console.log(`Article with PMID ${article.PMID} inserted into database.`);
    }
    else {
      console.log(`Article with PMID ${article.PMID} already in database.`);
    }
  } catch (error) {
    console.error("Error inserting article into database: ", error);
  }
}