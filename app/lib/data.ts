import { createClient } from '@/lib/supabase/server'
import type { Trip, Destination, Activity, Day, InfoPage, Todo } from '@/lib/types'

export async function getTrips(): Promise<Trip[]> {
  const sb = await createClient()
  const { data } = await sb.from('trips').select('*').order('start_date')
  return data ?? []
}
export async function getTrip(id: string): Promise<Trip | null> {
  const sb = await createClient()
  const { data } = await sb.from('trips').select('*').eq('id', id).maybeSingle()
  return data
}
export async function getDestinations(tripId: string): Promise<Destination[]> {
  const sb = await createClient()
  const { data } = await sb.from('destinations').select('*').eq('trip_id', tripId).order('sort_order')
  return data ?? []
}
export async function getDestination(id: string): Promise<Destination | null> {
  const sb = await createClient()
  const { data } = await sb.from('destinations').select('*').eq('id', id).maybeSingle()
  return data
}
export async function getActivities(destinationId: string): Promise<Activity[]> {
  const sb = await createClient()
  const { data } = await sb.from('activities').select('*').eq('destination_id', destinationId).order('name')
  return data ?? []
}
export async function getActivity(id: string): Promise<Activity | null> {
  const sb = await createClient()
  const { data } = await sb.from('activities').select('*').eq('id', id).maybeSingle()
  return data
}
export async function getActivitiesForTrip(tripId: string): Promise<Activity[]> {
  const sb = await createClient()
  const dests = await getDestinations(tripId)
  if (dests.length === 0) return []
  const { data } = await sb.from('activities').select('*').in('destination_id', dests.map(d => d.id))
  return data ?? []
}
export async function getDays(tripId: string): Promise<Day[]> {
  const sb = await createClient()
  const { data } = await sb.from('days').select('*').eq('trip_id', tripId).order('sort_order')
  return data ?? []
}
export async function getInfoPage(tripId: string, slug: string): Promise<InfoPage | null> {
  const sb = await createClient()
  const { data } = await sb.from('info_pages').select('*').eq('trip_id', tripId).eq('slug', slug).maybeSingle()
  return data
}
export async function getInfoPages(tripId: string): Promise<InfoPage[]> {
  const sb = await createClient()
  const { data } = await sb.from('info_pages').select('id,trip_id,slug,title').eq('trip_id', tripId)
  return (data as InfoPage[]) ?? []
}
export async function getTodos(tripId: string): Promise<Todo[]> {
  const sb = await createClient()
  const { data } = await sb.from('todos').select('*').eq('trip_id', tripId).order('sort_order')
  return data ?? []
}
