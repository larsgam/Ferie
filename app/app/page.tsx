import { getTrips } from '@/lib/data'
import { Card } from '@/components/card'

export default async function Home() {
  const trips = await getTrips()
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-6">Ferier</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {trips.map(t => (
          <Card key={t.id} href={`/trips/${t.id}`} title={t.name}
            subtitle={t.start_date ? `${t.start_date} – ${t.end_date}` : undefined} />
        ))}
      </div>
    </main>
  )
}
