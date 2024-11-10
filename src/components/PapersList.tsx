// PapersList.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Paper {
    id: string
    slug: string
    title: string
}

interface PapersListProps {
    papers: Paper[]
    count: number
}

export default function PapersList({ papers, count }: PapersListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Include the original index for each paper
    const papersWithIndex = papers.map((paper, index) => ({ ...paper, originalIndex: index + 1 }))

    // Filter the papers while retaining their original index
    const filteredPapers = papersWithIndex.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const itemsPerPage = 50
    const totalPages = Math.ceil(filteredPapers.length / itemsPerPage)

    // Get the papers for the current page
    const displayedPapers = filteredPapers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Function to handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [currentPage])

    return (
        <div className="w-full pr-20">
            {/* Flex container for title and search bar */}
            <div className="flex items-center justify-between mb-5 w-full">
                <h1 className="text-3xl font-semibold">All Papers ({count})</h1>
                <div className="pr-20">
                    <input
                        type="text"
                        placeholder="Search papers"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1) // Reset to first page on new search
                        }}
                        className="p-2 border border-gray-500 rounded bg-white bg-opacity-70 focus:bg-opacity-90 transition-opacity"
                    />
                </div>
            </div>

            <ul className="border-t border-b border-black py-5 leading-8 w-full">
                {displayedPapers.length > 0 ? (
                    displayedPapers.map((paper) => (
                        <span key={paper.id} className="flex align-top justify-start px-5">
                            <span className="mr-2 w-6">{paper.originalIndex}.</span>
                            <Link 
                                href={`/papers/${paper.slug}`} 
                                className="text-blue-700 hover:underline transition-colors"
                            >
                                {paper.title}
                            </Link>
                        </span>
                    ))
                ) : (
                    <li className="px-5 text-gray-500">No papers found</li>
                )}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-4 items-center mt-3 pb-5 w-full">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 border border-gray-500 rounded py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ←
                </button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded border border-gray-500 ${index + 1 === currentPage ? "bg-gray-500 text-white" : "bg-gray-200"}`}
                    >
                        {index + 1}
                    </button>
                ))}
                </div>

                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 border border-gray-500 rounded py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    →
                </button>
            </div>
        </div>
    )
}
