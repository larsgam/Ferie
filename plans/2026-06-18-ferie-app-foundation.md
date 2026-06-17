# Ferie App — Phase 0 + 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static Ferie site into a logged-in, data-driven web app where the family can browse the Vietnam trip (destinations, days, activities, map, info pages) and tick off a shared todo list.

**Architecture:** Next.js (App Router, TypeScript) deployed on Vercel, with Supabase (Postgres + magic-link Auth + Row Level Security) as the data layer. Content is migrated from the existing markdown research into Postgres by a seed script. Maps render client-side with react-leaflet. No long-running server; the future AI proxy (Phase 3) will be a Vercel serverless function.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `@supabase/ssr`, `@supabase/supabase-js`, Supabase CLI (local dev), react-leaflet + Leaflet, react-markdown, Vitest (unit), Playwright (E2E).

**Testing philosophy:** TDD for pure logic (markdown parser, data helpers) with Vitest. Critical user paths covered by Playwright E2E against a locally-seeded Supabase. UI pages are verified by E2E + a manual review checkpoint, not line-by-line unit tests. `tsc` + ESLint are the always-on guard.

**Working directory:** All app code lives under `app/` in the `Ferie` repo. Run all `npm`/`npx`/`supabase` commands from `app/` unless stated otherwise. Branch: `ferie-app-foundation` (already created).

---

## File Structure

```
app/
├── package.json, tsconfig.json, next.config.ts
├── tailwind.config.ts, postcss.config.mjs
├── vitest.config.ts, playwright.config.ts
├── middleware.ts                      # route gating + session refresh
├── .env.local                         # secrets (gitignored, never committed)
├── app/
│   ├── globals.css                    # Tailwind + Apple-style tokens
│   ├── layout.tsx                     # root layout + nav shell
│   ├── page.tsx                       # / — trip list
│   ├── login/page.tsx                 # magic-link login
│   ├── auth/callback/route.ts         # OTP code exchange
│   ├── trips/[tripId]/
│   │   ├── page.tsx                   # overview
│   │   ├── map/page.tsx
│   │   ├── days/page.tsx
│   │   ├── days/[dayId]/page.tsx
│   │   ├── destinations/[destId]/page.tsx
│   │   ├── info/[slug]/page.tsx
│   │   └── todo/page.tsx
│   └── activities/[activityId]/page.tsx
├── components/
│   ├── nav.tsx, card.tsx
│   ├── activity-card.tsx
│   ├── todo-list.tsx                  # client component
│   └── map-view.tsx                   # client component (react-leaflet, ssr:false)
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   ├── types.ts                       # DB row types
│   └── data.ts                        # typed data-access functions
├── supabase/
│   ├── config.toml                    # from `supabase init`
│   ├── migrations/
│   │   ├── 0001_schema.sql
│   │   └── 0002_rls.sql
│   └── seed/
│       ├── parse-research.ts          # markdown table → records
│       ├── parse-research.test.ts
│       └── seed.ts                    # inserts via service-role client
└── e2e/
    ├── auth.spec.ts
    ├── browse.spec.ts
    └── todo.spec.ts
```

---

# PHASE 0 — Foundation

## Task 1: Scaffold the Next.js app

**Files:**
- Create: `app/` (entire Next.js project via scaffolder)

- [ ] **Step 1: Scaffold**

Run from repo root (`/Users/larsgammelgaard/Projects/Ferie`):
```bash
npx create-next-app@latest app --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```
Accept defaults for any remaining prompts.

- [ ] **Step 2: Verify dev server boots**

```bash
cd app && npm run dev
```
Expected: server on http://localhost:3000, default Next.js page renders. Stop with Ctrl-C.

- [ ] **Step 3: Verify production build**

Run: `npm run build`
Expected: build completes with no type errors.

- [ ] **Step 4: Commit**

```bash
git add app
git commit -m "feat(app): scaffold Next.js + Tailwind + TypeScript project"
```

---

## Task 2: Add test tooling (Vitest + Playwright)

**Files:**
- Create: `app/vitest.config.ts`, `app/playwright.config.ts`
- Modify: `app/package.json` (scripts)

- [ ] **Step 1: Install**

```bash
npm i -D vitest @vitejs/plugin-react @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Vitest config**

Create `app/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['**/*.test.ts'] },
})
```

- [ ] **Step 3: Playwright config**

Create `app/playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

- [ ] **Step 4: Add scripts**

In `app/package.json` `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"e2e": "playwright test"
```

- [ ] **Step 5: Smoke-test the test runner**

Create `app/lib/sanity.test.ts`:
```ts
import { expect, test } from 'vitest'
test('runner works', () => { expect(1 + 1).toBe(2) })
```
Run: `npm test`
Expected: 1 passed. Then delete `app/lib/sanity.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add app/package.json app/package-lock.json app/vitest.config.ts app/playwright.config.ts
git commit -m "chore(app): add Vitest and Playwright"
```

---

## Task 3: Supabase CLI, local stack, and client helpers

**Files:**
- Create: `app/supabase/config.toml` (via `supabase init`), `app/lib/supabase/client.ts`, `app/lib/supabase/server.ts`, `app/.env.local`

- [ ] **Step 1: Install Supabase CLI and init**

```bash
brew install supabase/tap/supabase
cd app && supabase init
```
Expected: creates `app/supabase/config.toml`.

- [ ] **Step 2: Start local Supabase**

Run: `supabase start`
Expected: prints `API URL` (http://127.0.0.1:54321), `anon key`, and `service_role key`. Keep these.

- [ ] **Step 3: Create `.env.local`**

Create `app/.env.local` (already gitignored by create-next-app) using the values from Step 2:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>
```

- [ ] **Step 4: Install Supabase libs**

```bash
npm i @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 5: Browser client**

Create `app/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 6: Server client**

Create `app/lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch { /* called from a Server Component; ignore */ }
        },
      },
    },
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/supabase/config.toml app/lib/supabase app/package.json app/package-lock.json
git commit -m "feat(app): add Supabase local stack and client helpers"
```

---

## Task 4: Database schema

**Files:**
- Create: `app/supabase/migrations/0001_schema.sql`

- [ ] **Step 1: Write the schema migration**

Create `app/supabase/migrations/0001_schema.sql`:
```sql
create extension if not exists "pgcrypto";

create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  start_date date,
  end_date date,
  cover_url text,
  created_at timestamptz default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  email text not null,
  user_id uuid references auth.users(id),
  role text default 'member',
  unique (trip_id, email)
);

create table destinations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  lat double precision,
  lng double precision,
  arrival_date date,
  nights int,
  sort_order int default 0
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  category text not null default 'sight',
  description text,
  price_text text,
  duration_min int,
  opening_hours text,
  lat double precision,
  lng double precision,
  url text,
  tags text[] default '{}',
  source text
);

create table days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  date date,
  destination_id uuid references destinations(id) on delete set null,
  title text,
  sort_order int default 0
);

create table info_pages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  slug text not null,
  title text not null,
  body_md text not null,
  unique (trip_id, slug)
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  text text not null,
  done boolean default false,
  assignee text,
  sort_order int default 0
);
```

- [ ] **Step 2: Apply migration locally**

Run: `supabase db reset`
Expected: migration applies cleanly, no SQL errors.

- [ ] **Step 3: Verify tables exist**

Run:
```bash
supabase db reset && psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '"')" -c "\dt public.*"
```
Expected: lists all 7 tables (`activities`, `days`, `destinations`, `info_pages`, `participants`, `todos`, `trips`).

- [ ] **Step 4: Commit**

```bash
git add app/supabase/migrations/0001_schema.sql
git commit -m "feat(db): initial schema for trips, destinations, activities, days, info, todos"
```

---

## Task 5: Row Level Security + new-user linking trigger

**Files:**
- Create: `app/supabase/migrations/0002_rls.sql`

- [ ] **Step 1: Write RLS + trigger migration**

Create `app/supabase/migrations/0002_rls.sql`:
```sql
-- Helper: is the current user a participant of this trip?
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.participants
    where participants.trip_id = p_trip_id
      and participants.user_id = auth.uid()
  );
$$;

-- On new auth user, link to the matching participant row(s) by email.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  update public.participants
    set user_id = new.id
    where lower(email) = lower(new.email) and user_id is null;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table trips enable row level security;
alter table participants enable row level security;
alter table destinations enable row level security;
alter table activities enable row level security;
alter table days enable row level security;
alter table info_pages enable row level security;
alter table todos enable row level security;

-- Read policies (members only)
create policy trips_read on trips for select
  using (is_trip_member(id));
create policy participants_read on participants for select
  using (is_trip_member(trip_id));
create policy destinations_read on destinations for select
  using (is_trip_member(trip_id));
create policy activities_read on activities for select
  using (is_trip_member((select trip_id from destinations d where d.id = destination_id)));
create policy days_read on days for select
  using (is_trip_member(trip_id));
create policy info_read on info_pages for select
  using (is_trip_member(trip_id));
create policy todos_read on todos for select
  using (is_trip_member(trip_id));

-- Todos are writable by members (the one write feature in Phase 1)
create policy todos_update on todos for update
  using (is_trip_member(trip_id)) with check (is_trip_member(trip_id));
```

- [ ] **Step 2: Apply**

Run: `supabase db reset`
Expected: applies cleanly.

- [ ] **Step 3: Verify RLS blocks anonymous reads**

Seeding happens via the service-role key (which bypasses RLS), so verify that the *anon* role sees nothing without membership. After Task 10 seeds data, this is re-checked by the `auth.spec.ts` E2E (a logged-out visitor is redirected; a logged-in member sees data). For now, confirm the migration applied:
```bash
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '"')" -c "select tablename, rowsecurity from pg_tables where schemaname='public';"
```
Expected: `rowsecurity = t` for all 7 tables.

- [ ] **Step 4: Commit**

```bash
git add app/supabase/migrations/0002_rls.sql
git commit -m "feat(db): RLS policies + new-user participant linking trigger"
```

---

## Task 6: Magic-link auth (login, callback, route gating)

**Files:**
- Create: `app/lib/supabase/middleware.ts`, `app/middleware.ts`, `app/app/login/page.tsx`, `app/app/auth/callback/route.ts`

- [ ] **Step 1: Session-refresh + gating helper**

Create `app/lib/supabase/middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isPublic = path.startsWith('/login') || path.startsWith('/auth')
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return response
}
```

- [ ] **Step 2: Wire middleware**

Create `app/middleware.ts`:
```ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 3: Login page**

Create `app/app/login/page.tsx`:
```tsx
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
            className="w-full rounded-xl border px-4 py-3"
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
```

- [ ] **Step 4: Auth callback**

Create `app/app/auth/callback/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

Note: participant linking happens automatically via the `handle_new_user` trigger from Task 5 — no client-side update needed.

- [ ] **Step 5: Verify locally**

Run `npm run dev`. Visit http://localhost:3000 → expect redirect to `/login`. Local Supabase captures emails at the Inbucket URL printed by `supabase start` (http://127.0.0.1:54324). (Full login flow is asserted by E2E in Task 17 once data is seeded.)

- [ ] **Step 6: Commit**

```bash
git add app/middleware.ts app/lib/supabase/middleware.ts app/app/login app/app/auth
git commit -m "feat(auth): magic-link login, callback, and route gating"
```

---

## Task 7: Design-system shell (tokens, layout, nav)

**Files:**
- Modify: `app/app/globals.css`, `app/app/layout.tsx`
- Create: `app/components/nav.tsx`

- [ ] **Step 1: Add Apple-style tokens**

In `app/app/globals.css`, after the Tailwind directives, add:
```css
:root {
  --color-bg: #ffffff;
  --color-section: #f5f5f7;
  --color-text: #1d1d1f;
  --color-secondary: #6e6e73;
  --color-accent: #0071e3;
  --color-divider: #d2d2d7;
}
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Nav component**

Create `app/components/nav.tsx`:
```tsx
import Link from 'next/link'

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-divider)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-5xl items-center px-5">
        <Link href="/" className="text-[17px] font-semibold tracking-tight">Ferie</Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Root layout**

Replace `app/app/layout.tsx` body content:
```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/nav'

export const metadata: Metadata = { title: 'Ferie', description: 'Rejseplanlægning' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build passes.

- [ ] **Step 5: Commit**

```bash
git add app/app/globals.css app/app/layout.tsx app/components/nav.tsx
git commit -m "feat(ui): Apple-style tokens, root layout, nav shell"
```

---

# PHASE 1 — Read the Trip

## Task 8: DB types + data-access layer

**Files:**
- Create: `app/lib/types.ts`, `app/lib/data.ts`

- [ ] **Step 1: Row types**

Create `app/lib/types.ts`:
```ts
export type Trip = { id: string; name: string; slug: string; start_date: string | null; end_date: string | null; cover_url: string | null }
export type Destination = { id: string; trip_id: string; name: string; lat: number | null; lng: number | null; arrival_date: string | null; nights: number | null; sort_order: number }
export type Activity = { id: string; destination_id: string; name: string; category: string; description: string | null; price_text: string | null; duration_min: number | null; opening_hours: string | null; lat: number | null; lng: number | null; url: string | null; tags: string[]; source: string | null }
export type Day = { id: string; trip_id: string; date: string | null; destination_id: string | null; title: string | null; sort_order: number }
export type InfoPage = { id: string; trip_id: string; slug: string; title: string; body_md: string }
export type Todo = { id: string; trip_id: string; text: string; done: boolean; assignee: string | null; sort_order: number }
```

- [ ] **Step 2: Data-access functions (server)**

Create `app/lib/data.ts`:
```ts
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
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/lib/types.ts app/lib/data.ts
git commit -m "feat(data): row types and server data-access layer"
```

---

## Task 9: Markdown research parser (TDD)

**Files:**
- Create: `app/supabase/seed/parse-research.ts`, `app/supabase/seed/parse-research.test.ts`

The research files use pipe tables. The activity parser extracts rows from any markdown table whose header contains a `Navn`/`Aktivitet` column, mapping columns to fields and stripping `**bold**` and `[text](url)` markdown.

- [ ] **Step 1: Write the failing test**

Create `app/supabase/seed/parse-research.test.ts`:
```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- parse-research`
Expected: FAIL — `parseActivityTables` not defined.

- [ ] **Step 3: Implement the parser**

Create `app/supabase/seed/parse-research.ts`:
```ts
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
    if (!line.startsWith('|')) { header = null; continue }
    const cells = splitRow(line)
    // separator row like |---|---|
    if (cells.every(c => /^:?-{2,}:?$/.test(c) || c === '')) continue
    if (!header) {
      const lower = cells.map(c => c.toLowerCase())
      if (lower.includes('navn') || lower.includes('aktivitet')) header = lower
      else header = null
      continue
    }
    // data row
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- parse-research`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add app/supabase/seed/parse-research.ts app/supabase/seed/parse-research.test.ts
git commit -m "feat(seed): markdown research table parser with tests"
```

---

## Task 10: Seed script + run + verify

**Files:**
- Create: `app/supabase/seed/seed.ts`
- Modify: `app/package.json` (add `seed` script)

Destination coordinates are taken from `docs/202607-vietnam/kort.html` (e.g. Hue `[16.4637, 107.5909]`). Activity coordinates are left null in this phase (no map pin) and flagged in the report. Categories: a table under a "Restauranter" heading → `restaurant`; otherwise `sight`. The `teen` tag is set when the source section heading contains "teenager".

- [ ] **Step 1: Install ts runner**

```bash
npm i -D tsx
```

- [ ] **Step 2: Write the seed script**

Create `app/supabase/seed/seed.ts`:
```ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseActivityTables } from './parse-research'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const RESEARCH = join(process.cwd(), '..', 'docs', '202607-vietnam')

// Destination name → [lat, lng] from kort.html, and the research file basename.
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
  // crude: if the name appears under a "Restauranter" section, mark restaurant
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

  const participants = ['lars.gammelgaard@gmail.com'] // extend with the family emails
  for (const email of participants) {
    await sb.from('participants').insert({ trip_id: tripId, name: email.split('@')[0], email })
  }

  let activityCount = 0
  let missingCoords = 0
  let order = 0
  for (const d of DESTINATIONS) {
    const { data: dest } = await sb.from('destinations').insert({
      trip_id: tripId, name: d.name, lat: d.lat, lng: d.lng, nights: d.nights, sort_order: order++,
    }).select().single()
    const md = read(d.file)
    const acts = parseActivityTables(md)
    for (const a of acts) {
      const tags = /teenager/i.test(md.slice(Math.max(0, md.indexOf(a.name) - 400), md.indexOf(a.name))) ? ['teen'] : []
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
      missingCoords++ // activity coords are null in this phase
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

  console.log(`Seeded trip ${tripId}: ${DESTINATIONS.length} destinations, ${activityCount} activities (${missingCoords} without coordinates — fill later), ${INFO.length} info pages.`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 3: Add the seed script to package.json**

In `app/package.json` `"scripts"`, add:
```json
"seed": "tsx --env-file=.env.local supabase/seed/seed.ts"
```

- [ ] **Step 4: Run the seed against local Supabase**

```bash
supabase db reset && npm run seed
```
Expected: prints a summary line, e.g. `Seeded trip <uuid>: 7 destinations, NN activities (NN without coordinates — fill later), 2 info pages.`

- [ ] **Step 5: Spot-check fidelity**

```bash
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '"')" \
  -c "select name, category, price_text from activities where name ilike 'Pho Thin%';"
```
Expected: a row for `Pho Thin`, category `restaurant`, a price. If columns are empty, fix the parser/seed and re-run.

- [ ] **Step 6: Commit**

```bash
git add app/supabase/seed/seed.ts app/package.json app/package-lock.json
git commit -m "feat(seed): seed Vietnam trip, destinations, activities, info, todos"
```

---

## Task 11: Trip list + trip overview

**Files:**
- Create: `app/components/card.tsx`
- Modify: `app/app/page.tsx`
- Create: `app/app/trips/[tripId]/page.tsx`

- [ ] **Step 1: Card component**

Create `app/components/card.tsx`:
```tsx
import Link from 'next/link'

export function Card({ href, title, subtitle }: { href: string; title: string; subtitle?: string }) {
  return (
    <Link href={href} className="block rounded-2xl border border-[var(--color-divider)] p-5 transition hover:bg-[var(--color-section)]">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-[var(--color-secondary)] mt-1">{subtitle}</div>}
    </Link>
  )
}
```

- [ ] **Step 2: Trip list**

Replace `app/app/page.tsx`:
```tsx
import { getTrips } from '@/lib/data'
import { Card } from '@/components/card'

export default async function Home() {
  const trips = await getTrips()
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-6">Ferier</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {trips.map(t => (
          <Card key={t.id} href={`/trips/${t.id}`} title={t.name}
            subtitle={t.start_date ? `${t.start_date} – ${t.end_date}` : undefined} />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Trip overview**

Create `app/app/trips/[tripId]/page.tsx`:
```tsx
import { getTrip, getDestinations, getInfoPages } from '@/lib/data'
import { Card } from '@/components/card'
import { notFound } from 'next/navigation'

export default async function TripOverview({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const trip = await getTrip(tripId)
  if (!trip) notFound()
  const [destinations, info] = await Promise.all([getDestinations(tripId), getInfoPages(tripId)])

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <p className="text-[var(--color-secondary)]">{trip.start_date} – {trip.end_date}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card href={`/trips/${tripId}/map`} title="Kort" subtitle="Alle steder" />
        <Card href={`/trips/${tripId}/days`} title="Dage" subtitle="Dag-for-dag" />
        <Card href={`/trips/${tripId}/todo`} title="Todo" subtitle="Tjekliste" />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Steder</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {destinations.map(d => (
            <Card key={d.id} href={`/trips/${tripId}/destinations/${d.id}`} title={d.name}
              subtitle={d.nights ? `${d.nights} nætter` : undefined} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {info.map(p => (
            <Card key={p.id} href={`/trips/${tripId}/info/${p.slug}`} title={p.title} />
          ))}
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Verify**

Run `npm run dev`, log in (Inbucket), open `/`. Expected: Vietnam card → overview shows destinations + info + map/days/todo cards.

- [ ] **Step 5: Commit**

```bash
git add app/components/card.tsx app/app/page.tsx app/app/trips
git commit -m "feat(ui): trip list and trip overview"
```

---

## Task 12: Destination page + activity detail

**Files:**
- Create: `app/components/activity-card.tsx`, `app/app/trips/[tripId]/destinations/[destId]/page.tsx`, `app/app/activities/[activityId]/page.tsx`

- [ ] **Step 1: Activity card**

Create `app/components/activity-card.tsx`:
```tsx
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
```

- [ ] **Step 2: Destination page (with category filter)**

Create `app/app/trips/[tripId]/destinations/[destId]/page.tsx`:
```tsx
import { getDestination, getActivities } from '@/lib/data'
import { ActivityCard } from '@/components/activity-card'
import { notFound } from 'next/navigation'

export default async function DestinationPage({ params }: { params: Promise<{ destId: string }> }) {
  const { destId } = await params
  const dest = await getDestination(destId)
  if (!dest) notFound()
  const activities = await getActivities(destId)
  const categories = [...new Set(activities.map(a => a.category))]

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 space-y-6">
      <h1 className="text-3xl font-bold">{dest.name}</h1>
      {categories.map(cat => (
        <section key={cat}>
          <h2 className="text-xl font-semibold mb-3 capitalize">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activities.filter(a => a.category === cat).map(a => <ActivityCard key={a.id} a={a} />)}
          </div>
        </section>
      ))}
    </main>
  )
}
```

- [ ] **Step 3: Activity detail**

Create `app/app/activities/[activityId]/page.tsx`:
```tsx
import { getActivity } from '@/lib/data'
import { notFound } from 'next/navigation'

export default async function ActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = await params
  const a = await getActivity(activityId)
  if (!a) notFound()
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 space-y-3">
      <h1 className="text-3xl font-bold">{a.name}</h1>
      <div className="text-sm text-[var(--color-secondary)] capitalize">{a.category}</div>
      {a.description && <p className="leading-relaxed">{a.description}</p>}
      {a.price_text && <p><strong>Pris:</strong> {a.price_text}</p>}
      {a.opening_hours && <p><strong>Praktisk:</strong> {a.opening_hours}</p>}
      {a.url && <p><a className="text-[var(--color-accent)]" href={a.url} target="_blank" rel="noreferrer">Mere info ↗</a></p>}
    </main>
  )
}
```

- [ ] **Step 4: Verify**

Open a destination → activities grouped by category; click one → detail page with price/hours/link.

- [ ] **Step 5: Commit**

```bash
git add app/components/activity-card.tsx app/app/trips app/app/activities
git commit -m "feat(ui): destination page and activity detail"
```

---

## Task 13: Days itinerary + day detail

**Files:**
- Create: `app/app/trips/[tripId]/days/page.tsx`, `app/app/trips/[tripId]/days/[dayId]/page.tsx`

- [ ] **Step 1: Days list**

Create `app/app/trips/[tripId]/days/page.tsx`:
```tsx
import { getDays, getDestinations } from '@/lib/data'
import { Card } from '@/components/card'

export default async function DaysPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const [days, dests] = await Promise.all([getDays(tripId), getDestinations(tripId)])
  const nameOf = (id: string | null) => dests.find(d => d.id === id)?.name ?? ''
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-6">Dage</h1>
      <div className="grid gap-3">
        {days.map(d => (
          <Card key={d.id} href={`/trips/${tripId}/days/${d.id}`}
            title={d.title ?? d.date ?? 'Dag'} subtitle={nameOf(d.destination_id)} />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Day detail (browse activities available at that destination)**

Create `app/app/trips/[tripId]/days/[dayId]/page.tsx`:
```tsx
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
```

- [ ] **Step 3: Verify**

`/trips/<id>/days` lists days; a day shows its destination's activities. (Days exist only if the seed created them — if the seed did not populate `days`, this list is empty, which is acceptable for this phase; days are fully populated when the master plan is parsed in Phase 2.)

- [ ] **Step 4: Commit**

```bash
git add app/app/trips
git commit -m "feat(ui): days itinerary and day detail"
```

---

## Task 14: Info pages (markdown render)

**Files:**
- Create: `app/app/trips/[tripId]/info/[slug]/page.tsx`
- Modify: `app/package.json` (react-markdown)

- [ ] **Step 1: Install**

```bash
npm i react-markdown remark-gfm
```

- [ ] **Step 2: Info page**

Create `app/app/trips/[tripId]/info/[slug]/page.tsx`:
```tsx
import { getInfoPage } from '@/lib/data'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function InfoPage({ params }: { params: Promise<{ tripId: string; slug: string }> }) {
  const { tripId, slug } = await params
  const page = await getInfoPage(tripId, slug)
  if (!page) notFound()
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div className="md-body space-y-3">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body_md}</ReactMarkdown>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Markdown styling**

Append to `app/app/globals.css` (avoids depending on the Tailwind typography plugin):
```css
.md-body h2 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; }
.md-body h3 { font-size: 1.05rem; font-weight: 600; margin-top: 1rem; }
.md-body table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
.md-body th, .md-body td { border: 1px solid var(--color-divider); padding: 6px 8px; text-align: left; }
.md-body a { color: var(--color-accent); }
.md-body ul { list-style: disc; padding-left: 1.25rem; }
```

- [ ] **Step 4: Verify**

Open `/trips/<id>/info/vejr`. Expected: rendered markdown with styled headings and tables.

- [ ] **Step 5: Commit**

```bash
git add app/app/trips app/app/globals.css app/package.json app/package-lock.json
git commit -m "feat(ui): markdown info pages"
```

---

## Task 15: Interactive todos

**Files:**
- Create: `app/components/todo-list.tsx`, `app/app/trips/[tripId]/todo/page.tsx`

- [ ] **Step 1: Todo list (client, optimistic toggle)**

Create `app/components/todo-list.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Todo } from '@/lib/types'

export function TodoList({ initial }: { initial: Todo[] }) {
  const [todos, setTodos] = useState(initial)
  const supabase = createClient()

  async function toggle(t: Todo) {
    const next = !t.done
    setTodos(ts => ts.map(x => x.id === t.id ? { ...x, done: next } : x))
    const { error } = await supabase.from('todos').update({ done: next }).eq('id', t.id)
    if (error) setTodos(ts => ts.map(x => x.id === t.id ? { ...x, done: t.done } : x)) // revert
  }

  return (
    <ul className="space-y-2">
      {todos.map(t => (
        <li key={t.id} className="flex items-center gap-3">
          <input type="checkbox" checked={t.done} onChange={() => toggle(t)} className="h-5 w-5" />
          <span className={t.done ? 'line-through text-[var(--color-secondary)]' : ''}>{t.text}</span>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Todo page**

Create `app/app/trips/[tripId]/todo/page.tsx`:
```tsx
import { getTodos } from '@/lib/data'
import { TodoList } from '@/components/todo-list'

export default async function TodoPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const todos = await getTodos(tripId)
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-6">Todo</h1>
      <TodoList initial={todos} />
    </main>
  )
}
```

- [ ] **Step 3: Verify persistence**

Open `/trips/<id>/todo`, tick an item, reload. Expected: the tick persists (RLS `todos_update` allows it for the logged-in member).

- [ ] **Step 4: Commit**

```bash
git add app/components/todo-list.tsx app/app/trips
git commit -m "feat(todo): interactive shared todo list"
```

---

## Task 16: Map view (react-leaflet)

**Files:**
- Create: `app/components/map-view.tsx`, `app/app/trips/[tripId]/map/page.tsx`
- Modify: `app/package.json` (leaflet)

react-leaflet touches `window`, so the map is a client component loaded with `dynamic(..., { ssr: false })`.

- [ ] **Step 1: Install**

```bash
npm i leaflet react-leaflet
npm i -D @types/leaflet
```

- [ ] **Step 2: Map component**

Create `app/components/map-view.tsx`:
```tsx
'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

export type Pin = { id: string; name: string; lat: number; lng: number; kind: 'destination' | 'activity' }

export default function MapView({ pins }: { pins: Pin[] }) {
  const center: [number, number] = pins[0] ? [pins[0].lat, pins[0].lng] : [16.0, 107.5]
  return (
    <MapContainer center={center} zoom={6} style={{ height: '70vh', width: '100%' }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pins.map(p => (
        <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={p.kind === 'destination' ? 8 : 5}
          pathOptions={{ color: p.kind === 'destination' ? '#0071e3' : '#34c759' }}>
          <Popup>{p.name}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
```

- [ ] **Step 3: Client wrapper (dynamic import, no SSR)**

`next/dynamic` with `ssr: false` is only allowed inside a Client Component, so wrap it. Create `app/components/map-client.tsx`:
```tsx
'use client'
import dynamic from 'next/dynamic'
import type { Pin } from '@/components/map-view'

const MapView = dynamic(() => import('@/components/map-view'), { ssr: false })

export default function MapClient({ pins }: { pins: Pin[] }) {
  return <MapView pins={pins} />
}
```

- [ ] **Step 4: Map page (server)**

Create `app/app/trips/[tripId]/map/page.tsx`:
```tsx
import MapClient from '@/components/map-client'
import { getDestinations, getActivitiesForTrip } from '@/lib/data'

export default async function MapPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const [dests, acts] = await Promise.all([getDestinations(tripId), getActivitiesForTrip(tripId)])
  const pins = [
    ...dests.filter(d => d.lat != null && d.lng != null).map(d => ({ id: d.id, name: d.name, lat: d.lat!, lng: d.lng!, kind: 'destination' as const })),
    ...acts.filter(a => a.lat != null && a.lng != null).map(a => ({ id: a.id, name: a.name, lat: a.lat!, lng: a.lng!, kind: 'activity' as const })),
  ]
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-4">Kort</h1>
      <MapClient pins={pins} />
    </main>
  )
}
```

- [ ] **Step 5: Verify**

Open `/trips/<id>/map`. Expected: map with destination pins (activities appear once their coords are filled in a later pass). No `window is not defined` error.

- [ ] **Step 6: Commit**

```bash
git add app/components/map-view.tsx app/components/map-client.tsx app/app/trips app/package.json app/package-lock.json
git commit -m "feat(map): Leaflet trip map from coordinates"
```

---

## Task 17: E2E smoke tests

**Files:**
- Create: `app/e2e/auth.spec.ts`, `app/e2e/browse.spec.ts`, `app/e2e/todo.spec.ts`

These run against local dev with a seeded local Supabase. Magic-link login is completed by reading the link from Inbucket's API (http://127.0.0.1:54324).

- [ ] **Step 1: Auth gate test**

Create `app/e2e/auth.spec.ts`:
```ts
import { expect, test } from '@playwright/test'

test('logged-out visitor is redirected to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Log ind' })).toBeVisible()
})
```

- [ ] **Step 2: Login helper + browse test**

Create `app/e2e/browse.spec.ts`:
```ts
import { expect, test } from '@playwright/test'

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByPlaceholder('din@email.dk').fill(email)
  await page.getByRole('button', { name: 'Send login-link' }).click()
  // Fetch the magic link from Inbucket
  const res = await page.request.get('http://127.0.0.1:54324/api/v1/mailbox/' + email.split('@')[0])
  const messages = await res.json()
  const id = messages[messages.length - 1].id
  const msg = await (await page.request.get(`http://127.0.0.1:54324/api/v1/mailbox/${email.split('@')[0]}/${id}`)).json()
  const link = (msg.body.html as string).match(/href="([^"]*auth\/callback[^"]*)"/)![1]
  await page.goto(link)
}

test('member can browse the trip', async ({ page }) => {
  await login(page, 'lars.gammelgaard@gmail.com')
  await expect(page.getByText('Vietnam 2026')).toBeVisible()
  await page.getByText('Vietnam 2026').click()
  await expect(page.getByRole('heading', { name: 'Steder' })).toBeVisible()
  await page.getByText('Hanoi').first().click()
  await expect(page.getByRole('heading', { name: 'Hanoi' })).toBeVisible()
})
```

- [ ] **Step 3: Todo persistence test**

Create `app/e2e/todo.spec.ts`:
```ts
import { expect, test } from '@playwright/test'
import { login } from './_helpers' // see note below

test('todo toggle persists across reload', async ({ page }) => {
  await login(page, 'lars.gammelgaard@gmail.com')
  await page.goto('/')
  await page.getByText('Vietnam 2026').click()
  await page.getByText('Todo').click()
  const box = page.getByRole('checkbox').first()
  const before = await box.isChecked()
  await box.click()
  await page.reload()
  await expect(page.getByRole('checkbox').first()).toBeChecked({ checked: !before })
})
```

Extract the `login` helper into `app/e2e/_helpers.ts` and import it from both specs (DRY):
```ts
import type { Page } from '@playwright/test'
export async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.getByPlaceholder('din@email.dk').fill(email)
  await page.getByRole('button', { name: 'Send login-link' }).click()
  const box = email.split('@')[0]
  const list = await (await page.request.get(`http://127.0.0.1:54324/api/v1/mailbox/${box}`)).json()
  const id = list[list.length - 1].id
  const msg = await (await page.request.get(`http://127.0.0.1:54324/api/v1/mailbox/${box}/${id}`)).json()
  const link = (msg.body.html as string).match(/href="([^"]*auth\/callback[^"]*)"/)![1]
  await page.goto(link)
}
```
Then change `browse.spec.ts` to `import { login } from './_helpers'` and delete its local copy.

- [ ] **Step 4: Run E2E**

```bash
supabase db reset && npm run seed && npm run e2e
```
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add app/e2e
git commit -m "test(e2e): auth gate, browse, and todo persistence"
```

---

## Task 18: Basic PWA manifest (installability)

**Files:**
- Create: `app/app/manifest.ts`, `app/public/icon-192.png`, `app/public/icon-512.png`

Full offline caching is Phase 4; this only makes the app installable to the home screen.

- [ ] **Step 1: Manifest**

Create `app/app/manifest.ts`:
```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ferie', short_name: 'Ferie', start_url: '/', display: 'standalone',
    background_color: '#ffffff', theme_color: '#0071e3',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

- [ ] **Step 2: Add placeholder icons**

Add two square PNG icons (192px and 512px) to `app/public/`. A solid-color icon is fine for now; replace with artwork later.

- [ ] **Step 3: Verify**

Run `npm run build`. Expected: build passes; `/manifest.webmanifest` is generated. In Chrome devtools → Application → Manifest, the app is installable.

- [ ] **Step 4: Commit**

```bash
git add app/app/manifest.ts app/public/icon-192.png app/public/icon-512.png
git commit -m "feat(pwa): web app manifest for installability"
```

---

## Task 19: Deploy (Supabase cloud + Vercel)

**Files:** none (configuration)

- [ ] **Step 1: Create the cloud Supabase project**

In the Supabase dashboard, create a project. Note the project ref, URL, anon key, service_role key.

- [ ] **Step 2: Push migrations to cloud**

```bash
supabase link --project-ref <ref>
supabase db push
```
Expected: `0001_schema.sql` and `0002_rls.sql` applied to the cloud DB.

- [ ] **Step 3: Seed cloud (one-off)**

Temporarily point `.env.local` at the cloud URL + service_role key and run `npm run seed`, then restore local values. (Alternatively, run the seed with inline env vars.)

- [ ] **Step 4: Create the Vercel project**

In Vercel, import the GitHub repo, set **Root Directory = `app`**. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (cloud values). Do **not** add the service_role key to Vercel (not needed at runtime in this phase).

- [ ] **Step 5: Configure Supabase auth redirect**

In Supabase dashboard → Authentication → URL Configuration, add the Vercel production URL and `https://<vercel-domain>/auth/callback` to the allowed redirect URLs.

- [ ] **Step 6: Deploy + verify live**

Push the branch and open a PR (or merge to `main`) to trigger a Vercel deploy. Visit the deployed URL, log in with a family email, and confirm: redirect-to-login when logged out, trip browsable when logged in, todo toggle persists.

- [ ] **Step 7: Commit any config files**

If `vercel.json` or similar config was added, commit it:
```bash
git add app/vercel.json
git commit -m "chore(deploy): Vercel configuration"
```

---

## Self-Review notes

- **Spec coverage:** auth+allowlist (Tasks 5–6), schema (Task 4), RLS (Task 5), migration (Tasks 9–10), all routes from spec §9 (Tasks 11–15), map (Task 16), info pages (Task 14), interactive todos (Task 15), PWA manifest/§11 (Task 18), error handling — `notFound()` on missing rows and login-gate redirect (Tasks 6, 11–16), testing §13 (Tasks 2, 9, 17), deployment §14 (Task 19). Success criteria §17 are asserted by the E2E in Task 17 + the live verification in Task 19.
- **Known phase-boundary gap:** the seed (Task 10) populates `destinations`, `activities`, `info_pages`, `todos`, and the `trips` row, but **not `days`** — day-by-day data comes from parsing the master plan, which is Phase 2 work. Task 13's day pages therefore render an empty list until then; this is intentional and noted in Task 13 Step 3.
- **Activity coordinates** are null in this phase (flagged by the seed report); the map shows destination pins now and activity pins after a later coordinate-enrichment pass.
- **Type consistency:** the `Activity`/`Destination`/etc. types in `lib/types.ts` are used unchanged across `lib/data.ts`, the page components, and `map-view.tsx`'s `Pin` shape (derived, not duplicated).
