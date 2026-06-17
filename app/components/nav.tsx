import Link from 'next/link'

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-divider)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-5xl items-center px-5">
        <Link href="/" className="text-[17px] font-semibold tracking-tight">
          Ferie
        </Link>
      </div>
    </nav>
  )
}
