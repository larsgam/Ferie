import { getDays, getDestinations } from '@/lib/data'
import { Card } from '@/components/card'

export default async function DaysPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const [days, dests] = await Promise.all([getDays(tripId), getDestinations(tripId)])
  const nameOf = (id: string | null) => dests.find(d => d.id === id)?.name ?? ''
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-6">Dage</h1>
      <div className="grid gap-3">
        {days.map(d => (
          <Card key={d.id} href={`/trips/${tripId}/days/${d.id}`}
            title={d.title ?? d.date ?? 'Dag'} subtitle={nameOf(d.destination_id)} />
        ))}
      </div>
    </main>
  )
}
