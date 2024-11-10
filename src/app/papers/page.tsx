// PapersPage.tsx
import prisma from "@/lib/db"
import Link from "next/link"
import PapersList from "@/components/PapersList"

export default async function PapersPage() {
    const papers = await prisma.paper.findMany()
    const papersCount = await prisma.paper.count()

    return (
        <main className="flex flex-col items-start gap-y-5 pt-24 text-left pl-20">
            <Link className="self-start hover:underline" href={"/"}> ← Back</Link>

            {/* Pass papers and papersCount to the Client Component */}
            <PapersList papers={papers} count={papersCount} />
        </main>
    )
}
