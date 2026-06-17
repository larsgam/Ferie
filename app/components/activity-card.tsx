import Link from 'next/link'
import type { Activity } from '@/lib/types'

export function ActivityCard({ a }: { a: Activity }) {
  return (
    <Link href={`/activities/${a.id}`} className="block rounded-xl border border-[var(--color-divider)] p-4 hover:bg-[var(--color-section)]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{a.name}</span>
        <span className="text-xs rounded-full bg-[var(--color-section)] px-2 py-0.5 text-[var(--color-secondary)]">{a.category}</span>
      </div>
      {a.description && <p className="text-sm text-[var(--color-secondary)] mt-1 line-clamp-2">{a.description}</p>}
      {a.price_text && <p className="text-sm mt-1">{a.price_text}</p>}
    </Link>
  )
}
