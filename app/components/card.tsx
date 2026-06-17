import Link from 'next/link'

export function Card({ href, title, subtitle }: { href: string; title: string; subtitle?: string }) {
  return (
    <Link href={href} className="block rounded-2xl border border-[var(--color-divider)] p-5 transition hover:bg-[var(--color-section)]">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-[var(--color-secondary)] mt-1">{subtitle}</div>}
    </Link>
  )
}
