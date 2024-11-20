// app/papers/[slug]/page.tsx
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { Paper } from "@prisma/client"
import { unstable_cache } from 'next/cache'

// Define the type for what we're selecting from the database
type PaperSelect = Pick<Paper, 'id' | 'title' | 'PMID' | 'slug' | 'abstract' | 'authors' | 'journal' | 'pub_date' | 'keywords' | 'url' | 'affiliations'>

// Cache the paper fetch with improved configuration
const getCachedPaper = unstable_cache(
  async (slug: string) => {
    const paper = await prisma.paper.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        PMID: true,
        slug: true,
        abstract: true,
        authors: true,
        journal: true,
        pub_date: true,
        keywords: true,
        url: true,
        affiliations: true
      }
    })
    return paper as PaperSelect | null
  },
  ['paper-detail'],
  {
    revalidate: 3600, // 1 hour
    tags: ['papers'] // Add cache tags for better invalidation control
  }
)

// Split components for better code organization and performance
const PaperMeta = ({ paper }: { paper: PaperSelect }) => (
  <div className="flex flex-col gap-4 text-sm md:text-base">
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600">
      <span className="font-medium">{paper.journal}</span>
      <span className="hidden md:block">•</span>
      <time dateTime={new Date(paper.pub_date).toISOString()}>
        {new Date(paper.pub_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
    </div>
  </div>
)

const Keywords = ({ keywords }: { keywords: string[] }) => (
  keywords.length > 0 ? (
    <div className="space-y-2">
      <h2 className="font-semibold text-gray-900">Keywords</h2>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  ) : null
)

// Generate metadata with error boundary
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const paper = await getCachedPaper(params.slug)
    
    if (!paper) {
      return {
        title: 'Paper Not Found'
      }
    }

    return {
      title: paper.title,
      description: paper.abstract?.slice(0, 160) + '...',
      alternates: {
        canonical: `/papers/${paper.slug}`
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Scientific Papers'
    }
  }
}

export default async function PaperPage({
  params
}: {
  params: { slug: string }
}) {
  const paper = await getCachedPaper(params.slug)

  if (!paper) {
    notFound()
  }

  const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${paper.PMID}/`

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-col items-start gap-y-6 pt-24 px-4 md:px-20 max-w-7xl mx-auto w-full pb-20">
        <Link 
          href="/papers" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          prefetch={true}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Papers
        </Link>

        <article className="w-full bg-white rounded-lg shadow-sm p-6 md:p-10 space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {paper.title}
          </h1>

          <PaperMeta paper={paper} />

          {paper.authors && (
            <div className="space-y-2">
              <h2 className="font-semibold text-gray-900">Authors</h2>
              <p className="text-gray-600">{paper.authors}</p >
            </div>
          )}

          {paper.affiliations && (
            <div className="space-y-2">
              <h2 className="font-semibold text-gray-900">Affiliations</h2>
              <p className="text-gray-600">{paper.affiliations}</p >
            </div>
          )}

          <Keywords keywords={paper.keywords || []} />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Abstract</h2>
            <p className="text-gray-700 leading-relaxed">
              {paper.abstract}
            </p >
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {paper.url && (
              <a
                href= "_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Full Paper
              </a >
            )}
            <a
              href={pubmedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View on PubMed
            </a >
          </div>
        </article>
      </div>
    </main>
  )
}