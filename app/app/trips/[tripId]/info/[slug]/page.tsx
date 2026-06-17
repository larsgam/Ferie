import { getInfoPage } from '@/lib/data'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function InfoPage({ params }: { params: Promise<{ tripId: string; slug: string }> }) {
  const { tripId, slug } = await params
  const page = await getInfoPage(tripId, slug)
  if (!page) notFound()
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div className="md-body space-y-3">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body_md}</ReactMarkdown>
      </div>
    </main>
  )
}
