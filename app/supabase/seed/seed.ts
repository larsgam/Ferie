import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseActivityTables, type ParsedActivity } from './parse-research'

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

// Files that use section format (### N. Name + bullet fields) instead of pipe tables
const SECTION_FORMAT_FILES = new Set([
  'research/phong-nha.md',
  'research/hoi-an-restauranter-aktiviteter.md',
  'research/pu-luong.md',
])

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

/**
 * Parses section-style markdown files where each activity is a numbered heading:
 *   ### N. Name — subtitle
 *   - **Beskrivelse:** text
 *   - **Pris:** text
 *   - **Praktisk:** text
 *   - **Link:** [label](url)
 */
function parseSectionActivities(md: string): ParsedActivity[] {
  const lines = md.split('\n')
  const out: ParsedActivity[] = []

  // Match ### N. Name or #### N. Name headings
  const headingRe = /^#{2,4}\s+\d+\.\s+(.+)$/
  const fieldRe = /^-\s+\*\*([^*]+)\*\*:?\s*(.*)$/
  const urlRe = /\((https?:\/\/[^)]+)\)/

  let current: Partial<ParsedActivity> | null = null
  let inSection = false
  // Track whether we're inside a non-activity top-level section (e.g. overnatning, transport)
  let skipH2Section = false

  const flush = () => {
    if (current?.name) {
      out.push({
        name: current.name,
        description: current.description ?? null,
        price_text: current.price_text ?? null,
        opening_hours: current.opening_hours ?? null,
        url: current.url ?? null,
      })
    }
    current = null
    inSection = false
  }

  for (const line of lines) {
    // Track ## level sections to know when we're in accommodation/logistics
    if (/^##\s/.test(line) && !/^#{3,}/.test(line)) {
      flush()
      const sectionTitle = line.replace(/^#+\s*/, '').toLowerCase()
      skipH2Section = /overnatning|transport|logistik|juli-vejr|forslag|mai chau|how to|kilder/.test(sectionTitle)
      continue
    }

    if (skipH2Section) continue

    const headingMatch = line.match(headingRe)
    if (headingMatch) {
      flush()
      // Strip markdown links and bold from heading name
      const rawName = headingMatch[1]
        .replace(/\*\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim()
      current = { name: rawName }
      inSection = true
      continue
    }

    if (!inSection || !current) continue

    const fieldMatch = line.match(fieldRe)
    if (fieldMatch) {
      const key = fieldMatch[1].toLowerCase().trim()
      const val = fieldMatch[2].replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
      if (key.startsWith('beskrivelse')) {
        current.description = val || null
      } else if (key.startsWith('pris')) {
        current.price_text = val || null
      } else if (key.startsWith('praktisk')) {
        current.opening_hours = val || null
      } else if (key === 'link') {
        const urlMatch = fieldMatch[2].match(urlRe)
        current.url = urlMatch ? urlMatch[1] : null
      }
    }
  }
  flush()

  return out
}

function parseActivities(md: string, file: string): ParsedActivity[] {
  if (SECTION_FORMAT_FILES.has(file)) {
    return parseSectionActivities(md)
  }
  return parseActivityTables(md)
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
    const acts = parseActivities(md, d.file)
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
