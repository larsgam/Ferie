'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError('Kunne ikke sende login-link. Tjek emailen og prøv igen.')
    else setSent(true)
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-2xl font-semibold mb-6">Log ind</h1>
      {sent ? (
        <p>Tjek din indbakke — vi har sendt et login-link til {email}.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.dk"
            className="w-full rounded-xl border border-[var(--color-divider)] px-4 py-3"
          />
          <button className="w-full rounded-xl bg-[var(--color-accent)] text-white py-3">
            Send login-link
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </main>
  )
}
