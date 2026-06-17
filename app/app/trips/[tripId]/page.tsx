import { getTrip, getDestinations, getInfoPages } from '@/lib/data'
import { Card } from '@/components/card'
import { notFound } from 'next/navigation'

export default async function TripOverview({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const trip = await getTrip(tripId)
  if (!trip) notFound()
  const [destinations, info] = await Promise.all([getDestinations(tripId), getInfoPages(tripId)])

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <p className="text-[var(--color-secondary)]">{trip.start_date} – {trip.end_date}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card href={`/trips/${tripId}/map`} title="Kort" subtitle="Alle steder" />
        <Card href={`/trips/${tripId}/days`} title="Dage" subtitle="Dag-for-dag" />
        <Card href={`/trips/${tripId}/todo`} title="Todo" subtitle="Tjekliste" />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Steder</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {destinations.map(d => (
            <Card key={d.id} href={`/trips/${tripId}/destinations/${d.id}`} title={d.name}
              subtitle={d.nights ? `${d.nights} nætter` : undefined} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {info.map(p => (
            <Card key={p.id} href={`/trips/${tripId}/info/${p.slug}`} title={p.title} />
          ))}
        </div>
      </section>
    </main>
  )
}
