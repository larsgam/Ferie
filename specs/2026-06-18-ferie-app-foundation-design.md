# Ferie travel-planning app — Phase 0 + 1 (Foundation + Read the Trip)

**Date:** 2026-06-18
**Status:** Design / awaiting approval
**Scope of this spec:** Phase 0 (Foundation) + Phase 1 (Read the Trip) only. Phases 2–4 are named but specified separately.

---

## 1. Context & goal

Today the Ferie project is a static site (MkDocs + hand-built Apple-style HTML) on GitHub Pages. All content — activities, restaurants, practical info — lives as read-only markdown tables, plus Leaflet maps and a Telegram bot.

The goal is to evolve this into a real, interactive, AI-assisted trip planner usable by the whole family during travel. The full product is large, so it is decomposed into phases. **This spec covers only the first two:**

- **Phase 0 — Foundation:** Next.js + Supabase project, magic-link login, database schema, deploy pipeline.
- **Phase 1 — Read the Trip:** Migrate existing content into structured data; render the trip (destinations → days → activities), the map, info pages, and an interactive todo list.

Together, Phase 0+1 produce a logged-in, data-driven app that **replaces the static site for browsing**, with no architectural shortcuts, on the target stack. Interactive selection (Phase 2), AI (Phase 3), and offline/PWA polish (Phase 4) build on top.

### Timeline note
The Vietnam trip departs ~2026-07-06 and runs until 2026-08-02. The target is Phase 0–2 usable by departure, with AI/polish landing during or after the trip. This spec (0+1) is the first step; Phase 2 follows immediately as its own spec. No feature is rushed or built incorrectly to hit the date — if Phase 2 slips, it slips into the trip window gracefully.

---

## 2. Scope

### In scope (Phase 0 + 1)
- Next.js (App Router, TypeScript) project scaffolded in the existing repo under `app/`.
- Supabase project: Postgres, Auth (magic link), Row Level Security.
- Magic-link login restricted to the family (invite-only allowlist).
- Database schema for the read side: `trips`, `participants`, `destinations`, `activities`, `days`, `info_pages`, `todos`.
- One-time content migration of the Vietnam research (markdown tables) into `activities` and related tables.
- Read-only browsing UI: trip overview, destinations, days, activity detail, info pages.
- Map view (Leaflet) rendered from coordinates in the data.
- Interactive todo list (the one write feature in this phase).
- Deployment to Vercel + Supabase, free tier.

### Out of scope (later phases)
- Phase 2: selecting activities onto a day (`day_activities`), reordering, status, family voting (`votes`), realtime sync.
- Phase 3: AI proxy, structured assist actions, chat (`ai_threads`, `ai_messages`).
- Phase 4: full PWA offline caching/service worker, route-on-map, mobile polish, push.
- Multi-trip management beyond simply listing trips.

---

## 3. Architecture

```
Family devices (6, mobile + laptop)
        │  use
        ▼
Travel app in the browser (Next.js, served by Vercel)
        │                         │
        │ data · login · sync     │ (AI requests — Phase 3 only)
        ▼                         ▼
Supabase                    Vercel serverless fn → Claude API
(Postgres · Auth · Realtime)     (added in Phase 3)

Maps render client-side via Leaflet + OpenStreetMap (free, no hosting).
Content is seeded into Supabase from Claude Code skills (local authoring).
```

- **Vercel** hosts the Next.js app (frontend + future serverless functions). Deploy = `git push`; free Hobby tier.
- **Supabase** hosts Postgres, Auth, and Realtime (Realtime used from Phase 2). Free tier.
- No long-running server is operated by us; no containers. The Phase 3 AI proxy will be a serverless function.
- The MkDocs static site stays live as an archive; the app becomes the primary product.

---

## 4. Tech stack

| Concern | Choice | Rationale |
|---|---|---|
| Frontend framework | Next.js (App Router) + TypeScript | React-based, server functions for the future AI proxy, deploys free on Vercel, reliable to build/maintain. |
| Styling | Tailwind CSS, reusing the existing Apple-style design tokens | Carry over the current look (colors, radius, SF font stack from `docs/home.html`); fast, consistent. |
| Data / auth / realtime | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | Batteries-included Postgres + magic-link auth + realtime + RLS; free at family scale. |
| Maps | `react-leaflet` + Leaflet + OpenStreetMap tiles | Free, already used in the static site; renders from coordinates in the data. |
| Markdown rendering | `react-markdown` (for `info_pages`) | Reference pages stay authored as markdown. |
| Hosting | Vercel (app) + Supabase (data) | Managed, free tier, no ops. |
| App UI language | Danish | The family is Danish. |
| Code & docs language | English | Per project conventions. |

---

## 5. Repository & project layout

**Recommendation:** add the app as a subdirectory `app/` in the existing `Ferie` repo, keeping the static archive, the app, and the content-authoring skills in one place. Vercel's "Root Directory" is set to `app/`. The MkDocs deploy workflow only touches `docs/`, so there is no conflict.

```
Ferie/
├── docs/              # existing static site (archive) — published by MkDocs
├── specs/             # design specs (this file) — NOT published
├── app/               # NEW: Next.js app — deployed by Vercel
│   ├── app/           # App Router routes
│   ├── components/
│   ├── lib/           # supabase client, data access
│   ├── supabase/      # SQL migrations, seed scripts
│   └── ...
└── mkdocs.yml
```

Alternative considered: a separate repo for the app. Rejected for now to keep authoring + app + archive together; the decision is reversible (moving a subdirectory to its own repo later is cheap).

---

## 6. Data model (Phase 0 + 1)

Postgres tables created in this phase. Later-phase tables (`day_activities`, `votes`, `ai_threads`, `ai_messages`) are designed-for but created with their phases.

| Table | Key columns | Notes |
|---|---|---|
| `trips` | `id`, `name`, `slug`, `start_date`, `end_date`, `cover_url` | One row per trip (Vietnam first). |
| `participants` | `id`, `trip_id`, `name`, `email`, `user_id` (nullable), `role` | Seeded with the 6 family emails; `user_id` links to the Supabase auth user on first login. Drives the allowlist. |
| `destinations` | `id`, `trip_id`, `name`, `lat`, `lng`, `arrival_date`, `nights`, `sort_order` | The route stops. |
| `activities` | `id`, `destination_id`, `name`, `category`, `description`, `price_text`, `duration_min`, `opening_hours`, `lat`, `lng`, `url`, `tags` (text[]), `source` | **The migrated research.** Restaurants and sights share this table, separated by `category` (`restaurant`, `cafe`, `sight`, `tour`, `shopping`, …). `tags` e.g. `teen`, `indoor`, `food`. |
| `days` | `id`, `trip_id`, `date`, `destination_id`, `title`, `sort_order` | The itinerary days; each day happens at a destination. |
| `info_pages` | `id`, `trip_id`, `slug`, `title`, `body_md` | Reference content (weather, tips, agency comparison) as markdown. |
| `todos` | `id`, `trip_id`, `text`, `done`, `assignee`, `sort_order` | Interactive checklist (the one write feature in Phase 1). |

Relationships: `trips` 1—* `destinations` / `participants` / `days` / `info_pages` / `todos`; `destinations` 1—* `activities`; `days` *—1 `destinations`.

---

## 7. Authentication & access control

- **Magic-link email login** via Supabase Auth — no passwords. A family member enters their email; if it is on the allowlist they receive a one-tap login link.
- **Allowlist** = the emails in `participants`. On first successful login, the auth `user_id` is linked to the matching participant row. Non-allowlisted emails get a polite "no access" message (no information leak about whether the email exists).
- **Row Level Security** on every table: a user may read/write rows only for trips where they are a participant. Policies written and tested as part of Phase 0.
- The `service_role` key is used only server-side (seed/migration scripts), never shipped to the browser.

---

## 8. Content migration (markdown → structured data)

A one-time, repeatable seed script (run locally with the `service_role` key) populates Supabase from the existing Vietnam content.

- **Activities:** parse the regular research tables (`| # | Navn | Type | Beskrivelse | Pris | Link |` and the activity variant with practical info) into `activities` rows. `category` and `tags` are derived from the section headings (e.g. a "Restauranter" section → `category=restaurant`; a "Teenagervenlige aktiviteter" section → tag `teen`).
- **Coordinates:** reuse the approximate coordinates already present in `docs/202607-vietnam/kort.html` where available; otherwise geocode/AI-fill and flag the row for manual review. Missing coordinates are allowed (the row simply has no map pin).
- **Destinations & days:** seed from the master plan (`plan-1.1` / current master) — the route stops, arrival dates, nights, and the day list.
- **Info pages:** import `vejr-og-rejsetips`, `rejsebureauer-sammenligning`, and similar as `info_pages` (markdown body).
- **Todos:** seed from `todo.md`.
- **Quality check:** the script reports counts (e.g. "142 activities across 9 destinations") and lists rows missing coordinates/tags so gaps are visible and fixable.

**Forward path (noted, not built here):** the authoring skills (`restaurant-research`, `bydagsplan`, `lokal-research`, `ny-ferie`) are later updated to also emit structured data the seed script imports — preserving the current Claude Code research workflow. That update is tracked with Phase 1's migration work but is additive.

---

## 9. Application pages / routes (App Router)

| Route | Purpose | Mirrors |
|---|---|---|
| `/login` | Magic-link login | — |
| `/` | List of trips (initially one); cards | `home.html` |
| `/trips/[tripId]` | Trip overview: hero, destinations, links to map/days/info/todo | `overview.html` |
| `/trips/[tripId]/map` | Leaflet map of destinations + activities | `kort.html` |
| `/trips/[tripId]/days` | Itinerary: list of days | plan pages |
| `/trips/[tripId]/days/[dayId]` | A day: destination, date, and activities available there (browse only in P1) | — |
| `/trips/[tripId]/destinations/[destId]` | A place with its activities, filterable by category/tag | research pages |
| `/activities/[activityId]` | Activity detail: description, price, hours, link, map pin | research table rows |
| `/trips/[tripId]/info/[slug]` | Reference page rendered from markdown | `vejr-…`, `rejsebureauer-…` |
| `/trips/[tripId]/todo` | Interactive checklist | `todo.html` |

All pages are gated by auth; unauthenticated users are redirected to `/login`.

---

## 10. Maps

- `react-leaflet` with OpenStreetMap tiles.
- The trip map plots all `destinations` (route stops) and `activities` with coordinates, color-coded by `category` and with popups (name, price, link) — mirroring the current `kort.html` behavior.
- Activity detail pages embed a small single-pin map.
- Rows without coordinates are simply omitted from the map (no crash).

---

## 11. PWA note

Basic installability (web app manifest + icons) is cheap and may be added at the end of Phase 1 so the app can be added to the home screen during the trip. **Full offline caching (service worker) is deliberately Phase 4** — Phase 1 stays "online-mostly": content is served fresh, and the app degrades to a clear "offline" banner without a connection.

---

## 12. Error handling

- **Auth:** expired/invalid magic link → friendly message + resend option. Non-allowlisted email → polite no-access message.
- **Network/offline:** clear "offline" banner; reads show last-loaded content where the browser cached it; the todo toggle shows an error toast if the write fails (robust offline queueing is Phase 4).
- **Partial data:** pages tolerate null fields — missing coordinates → no pin; missing price/hours → field hidden. Never crash on an incomplete `activities` row.
- **Not found:** unknown trip/day/activity → 404 page.

---

## 13. Testing & verification

- TypeScript + ESLint as the baseline guard.
- Data-access logic kept in small, testable units in `lib/`.
- End-to-end smoke tests (Playwright via the webapp-testing skill) for the critical paths: login, trip overview loads, a day lists its activities, the map renders pins, a todo toggle persists across reload.
- Migration verification: the seed script's count/gap report is reviewed; spot-check several migrated activities against the source markdown for fidelity.
- Manual review checkpoints with Lars after each shippable slice (scaffold+auth, then read UI, then map+todo).

---

## 14. Deployment & environments

- **Vercel** project, Root Directory `app/`, auto-deploy on push to `main`; preview deploys per pull request.
- **Supabase**: one project to start. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client), `SUPABASE_SERVICE_ROLE_KEY` (server/seed only). `ANTHROPIC_API_KEY` is **not** needed until Phase 3.
- The existing MkDocs GitHub Actions workflow is unaffected (it only builds `docs/`).

---

## 15. Non-goals (this phase)

Selecting activities onto days, voting, realtime sync, any AI feature, full offline support, push notifications, and multi-trip admin UX. These are explicitly deferred to their phases.

---

## 16. Risks & open decisions

- **Content migration quality** (coordinates, tags) is the largest manual effort. Mitigated by reusing `kort.html` coordinates, AI-assisted enrichment, and a flag-and-review report.
- **Review bandwidth vs. timeline:** the Vietnam target depends on short, frequent review rounds. If unavailable, Phase 2 slides into the trip window without compromising quality.
- **Repo layout** (subdirectory vs. separate repo): recommended subdirectory; flagged for confirmation; reversible.
- **iOS PWA limitations** (weaker push, some APIs) — irrelevant for a planner; noted for Phase 4.

---

## 17. Success criteria (Phase 0 + 1)

1. The 6 family members can log in via magic link; non-members cannot.
2. The Vietnam trip is fully browsable in the app: destinations, days, activities (with prices/hours/links), info pages, and a map with pins.
3. The todo list is interactive and changes persist.
4. The app is deployed live on Vercel with data in Supabase.
5. No information regressions: what the app shows matches the current static site's content.
