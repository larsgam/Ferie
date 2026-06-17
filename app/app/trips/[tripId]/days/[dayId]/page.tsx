import { createClient } from '@/lib/supabase/server'
import { getActivities, getDestination } from '@/lib/data'
import { ActivityCard } from '@/components/activity-card'
import { notFound } from 'next/navigation'
import type { Day } from '@/lib/types'

export default async function DayPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params
  const sb = await createClient()
  const { data: day } = await sb.from('days').select('*').eq('id', dayId).maybeSingle<Day>()
  if (!day) notFound()
  const dest = day.destination_id ? await getDestination(day.destination_id) : null
  const activities = dest ? await getActivities(dest.id) : []
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 space-y-4">
      <h1 className="text-3xl font-bold">{day.title ?? day.date}</h1>
      {dest && <p className="text-[var(--color-secondary)]">{dest.name}</p>}
      <p className="text-sm text-[var(--color-secondary)]">Vælg aktiviteter kommer i næste fase. Her kan I se, hvad der er muligt på stedet:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {activities.map(a => <ActivityCard key={a.id} a={a} />)}
      </div>
    </main>
  )
}
