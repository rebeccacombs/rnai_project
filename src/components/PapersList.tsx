'use client'
// PapersList.tsx
import { Paper } from "@prisma/client"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { memo } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type PaperSelect = Pick<Paper, 'id' | 'title' | 'PMID' | 'slug' | 'abstract' | 'authors' | 'journal' | 'pub_date' | 'keywords' | 'url' | 'affiliations'>

interface PapersListProps {
  papers: PaperSelect[]
  count: number
  currentPage: number
  totalPages: number
  searchParams: { [key: string]: string | undefined }
}

// Helper function to format dates
const formatDate = (dateString: Date | string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const HighlightText = ({ text, searchTerm }: { text: string, searchTerm?: string }) => {
  if (!searchTerm) return <>{text}</>

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === searchTerm?.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </>
  )
}

const PaperItem = memo(({ 
  paper, 
  searchTerm 
}: { 
  paper: PaperSelect
  searchTerm?: string 
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold mb-2">
        <HighlightText text={paper.title} searchTerm={searchTerm} />
      </h2>
      <p className="text-gray-600 mb-2">
        <HighlightText text={typeof paper.authors === 'string' ? paper.authors : paper.authors.join(', ')} searchTerm={searchTerm} />
      </p >
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span>{paper.journal}</span>
        <span>{formatDate(paper.pub_date)}</span>
        <span>PMID: {paper.PMID}</span>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        <HighlightText text={paper.abstract} searchTerm={searchTerm} />
      </p >
      {paper.keywords && paper.keywords.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {paper.keywords.map((keyword, index) => (
            <Badge 
              key={index} 
              variant={keyword.toLowerCase().includes(searchTerm?.toLowerCase() || '') ? "default" : "secondary"}
              className="text-xs"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      )}
      <Link
        href={`/papers/${paper.slug}`}
        className="inline-flex items-center mt-4 text-blue-500 hover:text-blue-600 text-sm group"
      >
        View Paper 
        <svg 
          className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </CardContent>
  </Card>
))
PaperItem.displayName = 'PaperItem'

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading 
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}) {
  const displayedPages = 5
  let startPage = Math.max(1, currentPage - Math.floor(displayedPages / 2))
  let endPage = Math.min(totalPages, startPage + displayedPages - 1)

  if (endPage - startPage + 1 < displayedPages) {
    startPage = Math.max(1, endPage - displayedPages + 1)
  }

  const baseButtonClass = `
    px-4 py-2 rounded-md transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
  `

  return (
    <div className="flex gap-2 items-center justify-center mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className={`${baseButtonClass} bg-gray-100 disabled:opacity-50 hover:bg-gray-200`}
      >
        Previous
      </button>
      
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={isLoading}
            className={`${baseButtonClass} bg-gray-100 hover:bg-gray-200`}
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {[...Array(endPage - startPage + 1)].map((_, i) => {
        const page = startPage + i
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className={`${baseButtonClass} ${
              currentPage === page 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {page}
          </button>
        )
      })}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={isLoading}
            className={`${baseButtonClass} bg-gray-100 hover:bg-gray-200`}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className={`${baseButtonClass} bg-gray-100 disabled:opacity-50 hover:bg-gray-200`}
      >
        Next
      </button>
    </div>
  )
}

export default function PapersList({ 
  papers, 
  count, 
  currentPage, 
  totalPages,
  searchParams 
}: PapersListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsObj = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParamsObj)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const searchTerm = searchParams.search

  const getFilterSummary = () => {
    const filters = []
    if (searchParams.journal) filters.push(`Journal: ${searchParams.journal}`)
    if (searchParams.startDate) filters.push(`From: ${formatDate(searchParams.startDate)}`)
    if (searchParams.endDate) filters.push(`To: ${formatDate(searchParams.endDate)}`)
    if (searchParams.sort) {
      const sortMap: { [key: string]: string } = {
        'pub_date_desc': 'Newest First',
        'pub_date_asc': 'Oldest First',
        'title_asc': 'Title A-Z',
        'title_desc': 'Title Z-A'
      }
      filters.push(`Sort: ${sortMap[searchParams.sort] || searchParams.sort}`)
    }
    return filters
  }

  const activeFilters = getFilterSummary()

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Research Papers</h1>
          <span className="text-gray-600">{count} papers found</span>
        </div>

        {(searchTerm || activeFilters.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center text-sm">
            {searchTerm && (
              <Badge variant="default">
                Search: {searchTerm}
              </Badge>
            )}
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary">
                {filter}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {papers.map((paper) => (
          <PaperItem 
            key={paper.id} 
            paper={paper} 
            searchTerm={searchTerm}
          />
        ))}
        
        {papers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              No papers found matching your criteria
            </CardContent>
          </Card>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}