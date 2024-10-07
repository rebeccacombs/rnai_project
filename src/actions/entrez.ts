//i want to generate new esearches for the data i am interested in 
"use server";
import prisma from "@/lib/db";
import axios from 'axios';
import xml2js from 'xml2js';


const api_key = process.env.NCBI_API_KEY;
const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"


export default async function getIDsAndData(): Promise<void> {
  const authors = ['']
  const topics = ['RNAi', "siRNA", "ASO", "mRNA"]
  const dateRange = '("2020/01/01"[Date - Create] : "2024/09/18"[Date - Create])'
  const numPapers = 15
  const query = buildQuery(authors, topics, dateRange);

  try {
    const idList = await fetchIDs(query, numPapers);

    if (idList && idList.length > 0) {
      const data = await fetchData(idList);
      const processedData = await processData(data);

      for (const paper of processedData) {
        await saveToDatabase(paper);
      }
    }
  } catch (error) {
    console.error("Error during fetch process: ", error);
  }
}

export async function fetchIDs(query: string, num: number): Promise<string[]> { //esearches
  try {
    const response = await axios.get(`${BASE_URL}esearch.fcgi?db=pubmed&term=${query}&retmax=${num}&retmode=json&api_key=${api_key}`);
    const idList = response.data.esearchresult.idlist
    return idList
  } catch (error) {
    console.error("Error searching IDs: ", error);
    return []
  }
}

export async function fetchData(id_list: any) { //efetches
  try {
    const response = await axios.get(`${BASE_URL}efetch.fcgi?db=pubmed&id=${id_list}&retmode=xml&api_key=${api_key}`)
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, explicitCharkey: true });
    const ret = await parser.parseStringPromise(response.data);
    return ret;
  } catch (error) {
    console.error("Error fetching ID data: ", error);
  }
}
//new comment just for testing 
export async function processData(data: any) {
  const pData = data.PubmedArticleSet.PubmedArticle.map((article: any) => ({
    PMID: dataTools.getPMID(article.MedlineCitation.PMID._),
    title: article.MedlineCitation.Article.ArticleTitle._,
    slug: dataTools.getSlug(article.MedlineCitation.Article.ArticleTitle._),
    abstract: article.MedlineCitation.Article.Abstract.AbstractText._ || dataTools.getAbstractText(article.MedlineCitation.Article.Abstract.AbstractText),
    authors: dataTools.getAuthors(article.MedlineCitation.Article.AuthorList.Author),
    journal: article.MedlineCitation.Article.Journal.Title._,
    pubdate: new Date(dataTools.getDate(article.MedlineCitation.Article.Journal.JournalIssue.PubDate)),
    keywords: dataTools.getKeywords(article.MedlineCitation),
    url: `https://www.ncbi.nlm.nih.gov/pubmed/${article.MedlineCitation.PMID._}`,
    affiliations: dataTools.getAffiliations(article.MedlineCitation.Article.AuthorList.Author)
  }));

  //console.log(pData)
  return pData
}

async function saveToDatabase(article: any): Promise<void> {
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


const dataTools = {
  getPMID(entry: any): number { // entry = data.PubmedArticleSet.PubmedArticle[IDX].MedlineCitation.PMID._
    return Number(entry)
  },
  getSlug(title: any): string { //entry = data.PubmedArticleSet.PubmedArticle[IDX].MedlineCitation.Article.ArticleTitle._
    let slug = title.toLowerCase();
    slug = slug.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    return slug;
  },
  getAbstractText(entry: any): string { //entry = data.PubmedArticleSet.PubmedArticle[IDX].MedlineCitation.Article.Abstract.AbtractText
    const text = entry.map((text: { _: string }) => {
      const piece = text._ || '';
      return `${piece}`.trim();
    })
    return text.join(" ")
  },
  getAuthors(entry: any): string[] { //entry = data.PubmedArticleSet.PubmedArticle[IDX].MedlineCitation.Article.AuthorList.Author
    const authors = entry.map((author: { LastName: { _: string; }; ForeName: { _: string; }; }) => {
      const lastName = author.LastName._ || '';
      const foreName = author.ForeName._ || '';
      return `${lastName} ${foreName}`.trim();
    })
    return authors
  },
  getDate(entry: any): string { //entry = data.PubmedArticleSet.PubmedArticle[IDX].MedlineCitation.Article.Journal.JournalIssue.PubDate
    if (entry.Year && entry.Year._) {
      const year = entry.Year._
      const month = (entry.Month && entry.Month._) || 'Jan';
      const day = (entry.Day && entry.Day._) || '01';
      return `${year}-${month}-${day}`.trim();
    } else {
      return "0000-Jan-01"
    }
  },
  getKeywords(entry: any): string[] { //entry = data.PubmedArticleSet.PubmedArticle[IDX].MedlineCitation.KeywordList.Keyword
    if (entry.KeywordList) {
      const keywords = entry.KeywordList.Keyword.map((keyword: { _: string }) => {
        const k = keyword._ || '';
        return `${k}`.trim();
      })
      return keywords
    }
    return []
  },
  getAffiliations(entry: any): string[] { // entry = data.PubmedArticleSet.PubmedArticle[IDX].MedlineCitation.Article.AuthorList.Author
    const affiliations = new Set<string>();
    for (const author of entry) {
      if (author?.AffiliationInfo && author.AffiliationInfo.Affiliation) {
        const affiliation = author.AffiliationInfo.Affiliation?._.trim();
        if (affiliation) {
          affiliations.add(affiliation);
        }
      }
    }
    const uniqueAffiliationsArray = Array.from(affiliations);
    return uniqueAffiliationsArray;
  }
}


function buildQuery(authors: string[], topics: string[], dateRange: string): string {
  let queries: string[] = [];

  if (authors && authors.length > 0) {
    const authorQueries = authors.map(author => `${author}[Author]`);
    queries.push('(' + authorQueries.join(' OR ') + ')');
  }

  if (topics && topics.length > 0) {
    const topicQueries = topics.map(topic => `${topic}[Title/Abstract]`);
    queries.push('(' + topicQueries.join(' OR ') + ')');
  }
  return queries.join(' AND ') + ' AND ' + dateRange;
}


//i think i need another file for scheduling of this, also want to customize / "randomize" 
// what is fetched and when 