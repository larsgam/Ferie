import MapClient from '@/components/map-client'
import { getDestinations, getActivitiesForTrip } from '@/lib/data'

export default async function MapPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const [dests, acts] = await Promise.all([getDestinations(tripId), getActivitiesForTrip(tripId)])
  const pins = [
    ...dests.filter(d => d.lat != null && d.lng != null).map(d => ({ id: d.id, name: d.name, lat: d.lat!, lng: d.lng!, kind: 'destination' as const })),
    ...acts.filter(a => a.lat != null && a.lng != null).map(a => ({ id: a.id, name: a.name, lat: a.lat!, lng: a.lng!, kind: 'activity' as const })),
  ]
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-4">Kort</h1>
      <MapClient pins={pins} />
    </main>
  )
}
