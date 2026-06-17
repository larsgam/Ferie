import { expect, test } from 'vitest'
import { parseActivityTables } from './parse-research'

const md = `
## Restauranter

| # | Navn | Type | Beskrivelse | Pris | Link |
|---|------|------|-------------|------|------|
| 1 | **Pho Thin** | Pho bo | Legendarisk pho-bod. | ~40.000 VND | [TripAdvisor](https://x.test/pho) |

## Aktiviteter og seværdigheder

| # | Aktivitet | Beskrivelse | Praktisk info | Link |
|---|-----------|-------------|---------------|------|
| 1 | **Old Quarter** | Historisk bydel. | Gratis. | [TA](https://x.test/oq) |
`

test('parses restaurant rows with name, description, price, url', () => {
  const rows = parseActivityTables(md)
  const pho = rows.find(r => r.name === 'Pho Thin')!
  expect(pho.name).toBe('Pho Thin')
  expect(pho.description).toContain('Legendarisk')
  expect(pho.price_text).toBe('~40.000 VND')
  expect(pho.url).toBe('https://x.test/pho')
})

test('parses activity rows from the Aktivitet-headed table', () => {
  const rows = parseActivityTables(md)
  const oq = rows.find(r => r.name === 'Old Quarter')!
  expect(oq.name).toBe('Old Quarter')
  expect(oq.description).toContain('Historisk')
  expect(oq.url).toBe('https://x.test/oq')
})

test('ignores non-table prose', () => {
  expect(parseActivityTables('just some text\n# heading')).toEqual([])
})
