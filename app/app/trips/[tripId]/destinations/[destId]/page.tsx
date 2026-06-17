import { getDestination, getActivities } from '@/lib/data'
import { ActivityCard } from '@/components/activity-card'
import { notFound } from 'next/navigation'

export default async function DestinationPage({ params }: { params: Promise<{ destId: string }> }) {
  const { destId } = await params
  const dest = await getDestination(destId)
  if (!dest) notFound()
  const activities = await getActivities(destId)
  const categories = [...new Set(activities.map(a => a.category))]

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 space-y-6">
      <h1 className="text-3xl font-bold">{dest.name}</h1>
      {categories.map(cat => (
        <section key={cat}>
          <h2 className="text-xl font-semibold mb-3 capitalize">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activities.filter(a => a.category === cat).map(a => <ActivityCard key={a.id} a={a} />)}
          </div>
        </section>
      ))}
    </main>
  )
}
