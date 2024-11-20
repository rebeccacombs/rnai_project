// PapersPage.tsx
import prisma from "@/lib/db"
import Link from "next/link"
import PapersList from "@/components/PapersList"
import { Suspense } from "react"
import { unstable_cache } from 'next/cache'
import { Paper } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, SlidersHorizontal } from "lucide-react"

// Define the type for what we're selecting from the database
type PaperSelect = Pick<Paper, 'id' | 'title' | 'PMID' | 'slug' | 'abstract' | 'authors' | 'journal' | 'pub_date' | 'keywords' | 'url' | 'affiliations'>

type SortOption = 'pub_date_desc' | 'pub_date_asc' | 'title_asc' | 'title_desc'

// Enhanced cache function with search and filters
const getCachedPapers = unstable_cache(
  async (
    page = 1, 
    limit = 10, 
    search?: string, 
    sortBy?: SortOption,
    journal?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const skip = (page - 1) * limit

    // Build the where clause based on filters
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { authors: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: [search] } }
      ]
    }

    if (journal && journal !== 'all') {
      where.journal = journal
    }

    if (startDate || endDate) {
      where.pub_date = {}
      if (startDate) where.pub_date.gte = new Date(startDate)
      if (endDate) where.pub_date.lte = new Date(endDate)
    }

    // Define sort order
    const orderBy: any = {}
    switch (sortBy) {
      case 'pub_date_desc':
        orderBy.pub_date = 'desc'
        break
      case 'pub_date_asc':
        orderBy.pub_date = 'asc'
        break
      case 'title_asc':
        orderBy.title = 'asc'
        break
      case 'title_desc':
        orderBy.title = 'desc'
        break
      default:
        orderBy.pub_date = 'desc'
    }
    
    const [papers, total] = await Promise.all([
      prisma.paper.findMany({
        take: limit,
        skip: skip,
        where,
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
        },
        orderBy
      }),
      prisma.paper.count({ where })
    ])

    // Get unique journals for filter dropdown
    const journals = await prisma.paper.findMany({
      select: { journal: true },
      distinct: ['journal'],
      orderBy: { journal: 'asc' }
    })

    return {
      papers: papers as PaperSelect[],
      total,
      pages: Math.ceil(total / limit),
      journals: journals.map(j => j.journal)
    }
  },
  ['papers-list'],
  {
    revalidate: 3600
  }
)

function LoadingPapers() {
  return (
    <div className="w-full animate-pulse">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="mb-4 h-24 bg-gray-200 rounded"></div>
      ))}
    </div>
  )
}

// Search and Filter Controls Component
function SearchControls({
  journals,
  searchParams,
}: {
  journals: string[]
  searchParams: URLSearchParams
}) {
  const currentSort = searchParams.get('sort') || 'pub_date_desc'
  const currentJournal = searchParams.get('journal') || ''
  const currentSearch = searchParams.get('search') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  return (
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search papers..."
                name="search"
                defaultValue={currentSearch}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select name="sort" defaultValue={currentSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pub_date_desc">Newest First</SelectItem>
                <SelectItem value="pub_date_asc">Oldest First</SelectItem>
                <SelectItem value="title_asc">Title A-Z</SelectItem>
                <SelectItem value="title_desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            <Select name="journal" defaultValue={currentJournal || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Journal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Journals</SelectItem>
                {journals.map((journal) => (
                  <SelectItem key={journal} value={journal}>
                    {journal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              name="startDate"
              placeholder="Start Date"
              defaultValue={startDate}
            />
            <Input
              type="date"
              name="endDate"
              placeholder="End Date"
              defaultValue={endDate}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function PapersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const currentPage = Number(searchParams.page) || 1
  const search = searchParams.search || undefined
  const sort = searchParams.sort as SortOption | undefined
  const journal = searchParams.journal || undefined
  const startDate = searchParams.startDate || undefined
  const endDate = searchParams.endDate || undefined

  const { papers, total, pages, journals } = await getCachedPapers(
    currentPage,
    10,
    search,
    sort,
    journal,
    startDate,
    endDate
  )

  // Convert searchParams to URLSearchParams for the SearchControls component
  const searchParamsObj = new URLSearchParams(searchParams as Record<string, string>)

  return (
    <main className="flex flex-col items-start gap-y-5 pt-24 text-left px-4 md:px-20 max-w-7xl mx-auto w-full">
      <Link 
        className="self-start hover:underline flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors" 
        href={"/"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Link>

      <form className="w-full">
        <SearchControls 
          journals={journals}
          searchParams={searchParamsObj}
        />
      </form>
      
      <Suspense fallback={<LoadingPapers />}>
        <PapersList 
          papers={papers} 
          count={total}
          currentPage={currentPage}
          totalPages={pages}
          searchParams={searchParams}
        />
      </Suspense>
    </main>
  )
}