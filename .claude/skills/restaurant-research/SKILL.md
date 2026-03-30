---
name: restaurant-research
description: "Research og formatér restauranter til et ferie-projekt. Dækker både lokale restauranter (tapas, cafeer, strand) og Michelin Bib Gourmand inden for X km. Output er struktureret restauranter.md og/eller HTML-side linket fra overview. Triggers: 'find restauranter i X', 'hvad er der godt at spise i Y', 'lav en bib gourmand søgning', 'tilføj restauranter til ferien', 'find fine dining nær Z'."
---

# Restaurant Research

Researcher og strukturerer restaurantviden til ferien. Kombinerer lokal research og Michelin Bib Gourmand i ét workflow.

## Workflow

Hvis vi er i en aktiv ferie: læs tripens `index.md` — den har hvem der er med, datoer og hvad der allerede er planlagt.

### 1. Afklar scope
- Hvilken destination/område?
- Lokal research, Bib Gourmand, eller begge?
- Skal output være markdown (restauranter.md) eller HTML-side?
- Radius for Bib Gourmand (default: 50 km fra base)

### 2. Research

**Lokale restauranter — søg efter:**
- Bedst ratede på Google Maps / TripAdvisor for området
- Lokale specialiteter og hvilke steder der serverer dem bedst
- Mix af prisniveauer (tapas/street food, middag, special occasion)
- Familievenlige muligheder (se profil for børnenes aldre)
- Strandrestauranter / chiringuitos hvis relevant

**Bib Gourmand — sådan finder du dem:**
- Søg Michelin Guide for landet + region
- Filtrer på Bib Gourmand (ikke Stjerne — det er for dyrt/formelt)
- Tjek distance fra base med Google Maps
- Bekræft åbningstider og om de tager reservationer

### 3. Output — restauranter.md

Strukturér som:
```markdown
## Lokalt – <by/område>
| Navn | Type | Beskrivelse | Pris | Link |
|------|------|-------------|------|------|
| ... | Tapas | ... | €€ | [Link](url) |

**Must try:** <lokale specialiteter>

## Michelin Bib Gourmand (inden for <X> km)
| Restaurant | By | Km fra base | Køkken | Bib-begrundelse | Res. nødvendig |
|------------|-----|-------------|--------|-----------------|----------------|
```

**Prisniveauer:** € = under 15 EUR/pers · €€ = 15-35 · €€€ = 35+

### 4. Hvis HTML ønskes
Brug `references/apple-html.md` som template. Inkludér:
- Verdict-card med anbefaling øverst
- Restaurant-cards med pros/cons og booking-info
- Link fra overview.html

### 5. Opdater kort
Spørg om markørerne skal på kortet (brug `leaflet-map` skill, kategori `restaurant` eller `bib`).

## Reference
- Apple HTML template: se `references/apple-html.md`
