import { getActivity } from '@/lib/data'
import { notFound } from 'next/navigation'

export default async function ActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = await params
  const a = await getActivity(activityId)
  if (!a) notFound()
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 space-y-3">
      <h1 className="text-3xl font-bold">{a.name}</h1>
      <div className="text-sm text-[var(--color-secondary)] capitalize">{a.category}</div>
      {a.description && <p className="leading-relaxed">{a.description}</p>}
      {a.price_text && <p><strong>Pris:</strong> {a.price_text}</p>}
      {a.opening_hours && <p><strong>Praktisk:</strong> {a.opening_hours}</p>}
      {a.url && <p><a className="text-[var(--color-accent)]" href={a.url} target="_blank" rel="noreferrer">Mere info ↗</a></p>}
    </main>
  )
}
