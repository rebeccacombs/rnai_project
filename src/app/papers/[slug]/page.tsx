import prisma from "@/lib/db"
import Link from "next/link"

export default async function PaperPage({ params, }: {params: {
    slug: string; 
}}) {
    const paper = await prisma.paper.findUnique({
        where: {
            slug: params.slug, 
        }
    })
    
    return (
        <main className="flex flex-col items-center gap-y-8 pt-24 pb-5 text-center mx-auto px-4">
            <Link className="pl-20 self-start text-blue-600 hover:underline" href={"/papers/"}> ← Back</Link>
            <h1 className="text-4xl font-bold">{paper?.title}</h1>
            <h2 className="text-2xl">{paper?.pub_date.toLocaleDateString('en-CA').toString()}</h2>
            
            <section className="mt-1">
                <h2 className="text-xl font-semibold">Authors:</h2>
                <ol className="list-decimal list-inside space-y-2">
                    {paper?.authors && paper.authors.map((author, index) => (
                        <li key={index}>{author}</li>
                    ))}
                </ol>
            </section>

            <section className="mt-1">
                <h2 className="text-xl font-semibold">Keywords:</h2>
                <ul className="list-disc list-inside space-y-2">
                    {paper?.keywords && paper.keywords.map((keyword, index) => (
                        <li key={index}>{keyword}</li>
                    ))}
                </ul>
            </section>

            <section className="mt-1">
                <h2 className="text-xl font-semibold">Affiliations:</h2>
                <ul className="list-disc list-inside space-y-2">
                    {paper?.affiliations && paper.affiliations.map((affiliation, index) => (
                        <li key={index}>{affiliation}</li>
                    ))}
                </ul>
            </section>
            
            <section className="mt-1">
                <h2 className="text-xl font-semibold">Abstract:</h2>
                <p className="">{paper?.abstract}</p>
            </section>
            
            <p className="mt-4">
                <a className="text-blue-500 font-semibold hover:underline text-xl" href={paper?.url}>
                    Pubmed Link
                </a>
            </p>
        </main>
    )
}