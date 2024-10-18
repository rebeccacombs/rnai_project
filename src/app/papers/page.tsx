//import getAndSaveData from "@/actions/entrez"
import prisma from "@/lib/db"
import Link from "next/link"

export default async function PapersPage() {
    const papers = await prisma.paper.findMany()

    const papersCount = await prisma.paper.count()

    //getAndSaveData()
    return (
        <main className="flex flex-col items-start gap-y-5 pt-24 text-left pl-20">
            <Link className="self-start text-gray-100 hover:underline" href={"/"}> ← Back</Link>
            <h1 className="text-3xl font-semibold"> All Papers ({papersCount})</h1>
            <ul className="border-t border-b py-5 leading-8 w-full"> {/* Set width to full */}
                {papers.map((paper, index) => (
                    <li key={paper.id} className="flex items-center justify-start px-5"> {/* Justify content to start */}
                        <span className="mr-2 text-gray-500">{index + 1}.</span> {/* Numbering the papers */}
                        <Link 
                            href={`/papers/${paper.slug}`} 
                            className="text-blue-500 hover:underline transition-colors" // Highlight/underline on hover
                        >
                            {paper.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    )
}