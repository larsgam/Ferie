import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseActivityTables } from './parse-research'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

const RESEARCH = join(process.cwd(), '..', 'docs', '202607-vietnam')

const DESTINATIONS: { name: string; lat: number; lng: number; nights: number; file: string }[] = [
  { name: 'Hanoi', lat: 21.0285, lng: 105.8542, nights: 4, file: 'research/hanoi-restauranter-aktiviteter.md' },
  { name: 'Ninh Binh', lat: 20.2506, lng: 105.9745, nights: 2, file: 'research/ninh-binh.md' },
  { name: 'Phong Nha', lat: 17.5880, lng: 106.2840, nights: 2, file: 'research/phong-nha.md' },
  { name: 'Hue', lat: 16.4637, lng: 107.5909, nights: 2, file: 'research/hue-restauranter-aktiviteter.md' },
  { name: 'Hoi An', lat: 15.8801, lng: 108.3380, nights: 3, file: 'research/hoi-an-restauranter-aktiviteter.md' },
  { name: 'Da Nang', lat: 16.0544, lng: 108.2022, nights: 3, file: 'research/da-nang-restauranter-aktiviteter.md' },
  { name: 'Pu Luong', lat: 20.4500, lng: 105.1600, nights: 3, file: 'research/pu-luong.md' },
]

const INFO: { slug: string; title: string; file: string }[] = [
  { slug: 'vejr', title: 'Vejr og rejsetips', file: 'vejr-og-rejsetips.md' },
  { slug: 'rejsebureauer', title: 'Rejsebureauer — sammenligning', file: 'rejsebureauer-sammenligning.md' },
]

function read(rel: string): string {
  return readFileSync(join(RESEARCH, rel), 'utf8')
}
function categoryFor(md: string, name: string): string {
  const idx = md.indexOf(name)
  const before = md.slice(0, idx).toLowerCase()
  const lastRest = before.lastIndexOf('restaurant')
  const lastAct = before.lastIndexOf('aktivitet')
  return lastRest > lastAct ? 'restaurant' : 'sight'
}

async function main() {
  await sb.from('trips').delete().eq('slug', 'vietnam-2026')
  const { data: trip } = await sb.from('trips').insert({
    name: 'Vietnam 2026', slug: 'vietnam-2026',
    start_date: '2026-07-06', end_date: '2026-08-02',
  }).select().single()
  const tripId = trip!.id

  const participants = ['lars.gammelgaard@gmail.com']
  for (const email of participants) {
    await sb.from('participants').insert({ trip_id: tripId, name: email.split('@')[0], email })
  }

  let activityCount = 0
  let order = 0
  for (const d of DESTINATIONS) {
    const { data: dest } = await sb.from('destinations').insert({
      trip_id: tripId, name: d.name, lat: d.lat, lng: d.lng, nights: d.nights, sort_order: order++,
    }).select().single()
    const md = read(d.file)
    const acts = parseActivityTables(md)
    for (const a of acts) {
      const nameIdx = md.indexOf(a.name)
      const tags = /teenager/i.test(md.slice(Math.max(0, nameIdx - 400), nameIdx)) ? ['teen'] : []
      await sb.from('activities').insert({
        destination_id: dest!.id,
        name: a.name,
        category: categoryFor(md, a.name),
        description: a.description,
        price_text: a.price_text,
        opening_hours: a.opening_hours,
        url: a.url,
        tags,
        source: d.file,
      })
      activityCount++
    }
  }

  for (const info of INFO) {
    await sb.from('info_pages').insert({
      trip_id: tripId, slug: info.slug, title: info.title, body_md: read(info.file),
    })
  }

  const todoMd = read('todo.md')
  let torder = 0
  for (const line of todoMd.split('\n')) {
    const m = line.match(/^\s*[-*]\s+\[( |x)\]\s+(.*)$/)
    if (m) await sb.from('todos').insert({ trip_id: tripId, text: m[2], done: m[1] === 'x', sort_order: torder++ })
  }

  console.log(`Seeded trip ${tripId}: ${DESTINATIONS.length} destinations, ${activityCount} activities, ${INFO.length} info pages.`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
