export type ParsedActivity = {
  name: string
  description: string | null
  price_text: string | null
  opening_hours: string | null
  url: string | null
}

function stripMd(cell: string): string {
  return cell
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

function firstUrl(cell: string): string | null {
  const m = cell.match(/\((https?:\/\/[^)]+)\)/)
  return m ? m[1] : null
}

function splitRow(line: string): string[] {
  return line.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
}

export function parseActivityTables(md: string): ParsedActivity[] {
  const lines = md.split('\n')
  const out: ParsedActivity[] = []
  let header: string[] | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|')) {
      header = null
      continue
    }
    const cells = splitRow(line)
    if (cells.every(c => /^:?-{2,}:?$/.test(c) || c === '')) continue
    if (!header) {
      const lower = cells.map(c => c.toLowerCase())
      if (lower.includes('navn') || lower.includes('aktivitet')) {
        header = lower
      } else {
        header = null
      }
      continue
    }
    const idx = (key: string) => header!.findIndex(h => h.includes(key))
    const nameIdx = idx('navn') >= 0 ? idx('navn') : idx('aktivitet')
    if (nameIdx < 0 || !cells[nameIdx]) continue
    const name = stripMd(cells[nameIdx])
    if (!name) continue
    const descIdx = idx('beskrivelse')
    const priceIdx = idx('pris')
    const hoursIdx = idx('praktisk')
    const linkIdx = idx('link')
    out.push({
      name,
      description: descIdx >= 0 ? stripMd(cells[descIdx]) || null : null,
      price_text: priceIdx >= 0 ? stripMd(cells[priceIdx]) || null : null,
      opening_hours: hoursIdx >= 0 ? stripMd(cells[hoursIdx]) || null : null,
      url: linkIdx >= 0 ? firstUrl(cells[linkIdx]) : null,
    })
  }
  return out
}
