---
name: ny-ferie
description: "Opret en ny ferie i dette projekt. Scaffolder den komplette mappestruktur, alle standardfiler og overview.html, og tilføjer ferien til forsiden. Brug denne skill når Lars vil starte planlægning af en ny rejse. Triggers: 'opret ny ferie', 'lav en ny rejse', 'start planlægning af X', 'tilføj Y til ferier'."
---

# Ny Ferie

Opretter en komplet ferie-folder med alle standardfiler og linker den fra forsiden.

## Konventioner

- **Mappenavn:** `YYYYMM-destination` (startmåned, destination i lowercase kebab-case)
  - Eksempel: `202607-vietnam`, `202603-andalusien`
- **Placering:** `docs/<YYYYMM-destination>/`

## Workflow

### 1. Saml info
Spørg Lars hvis du mangler:
- Destination og startdato (for mappenavn)
- Rejsedeltagere (navne + aldre ved afrejse)
- Fly/transport hvis known
- Bolig hvis known

### 2. Opret mappestruktur
```
docs/<tripcode>/
├── index.md
├── todo.md
├── restauranter.md
├── sevaerdigheder.md
├── overview.html     (trip-hub — Apple-stil)
├── planer.html       (versionsoversigt over rejseplaner — se afsnit "Versionsstyring")
├── plan-1.0.html     (første plan — master ved oprettelse)
├── kort.html         (tom til at starte med — brug leaflet-map skill)
├── documents/
└── research/
```

> **HTML er standard.** Alle rejser er HTML-sider (ikke kun markdown). Hver rejse skal have et link fra forsiden `docs/home.html` (se trin 7).

### 3. index.md — kun bekræftet info
```markdown
# <Destination> - <måned> <år>

## Rejsedeltagere
| Navn | Alder (ved afrejse) | Note |
|------|---------------------|------|
| Lars | XX | |
...

## Rejseplan
| Dag | Dato | Ugedag | Plan |
|-----|------|--------|------|
| 1 | DD. mmm | Ugedag | Afrejse |
...

## Praktisk info
- **Fly udrejse:** ...
- **Bolig:** ...
- **Transport:** ...

## Indhold
- [🗺️ Interaktivt kort](kort.html)
- [Restauranter](restauranter.md)
- [Seværdigheder og aktiviteter](sevaerdigheder.md)
```

### 4. todo.md
Opret med standard-sektioner: Bookning, Praktisk, Research, Inden afrejse.

### 5. restauranter.md og sevaerdigheder.md
Tomme filer med overskrift og placeholder-tabel.

### 6. overview.html
Apple-stil HTML med nav, hero, link-cards til alle faste sider. Se `references/apple-html.md` for CSS og struktur. Skal indeholde et link-card til `planer.html` (versionsoversigt) under en "Planer"-sektion.

### 7. Versionsstyring af rejseplaner
Hver rejse har **visuel versionsstyring** af planer. Mønstret er fast (kopiér fra Vietnam: `docs/202607-vietnam/planer.html` + `plan-*.html`):

- **`planer.html`** — oversigtssiden, linket fra `overview.html`. Indeholder:
  - Et **master-kort** øverst med den gældende plans navn, version, dato og rute-resumé + knap til planen
  - Et **skema** (tabel): kolonner = Version · Navn & beskrivelse · Dato · Status · Åbn-link
  - En forklaring af versionsnumre nederst
- **Én HTML-side pr. plan**: `plan-<major>.<minor>.html` (fx `plan-1.0.html`, `plan-1.1.html`, `plan-2.0.html`)
  - Hver plan-side har en **version-bar** lige under hero: versionsnummer (blå), navn, dato, status-tag (`★ Master` grøn / `Arkiveret` grå) og "Alle versioner →"-link
- **Versionsnummerering:** hovednummer = rute-koncept (1.x = ét koncept, 2.x = et andet). Under-nummer = revision inden for samme koncept (1.0 → 1.1). **Kun én plan er master ad gangen.**
- Ved oprettelse: lav `plan-1.0.html` som master. Når planen revideres væsentligt, lav en ny `plan-X.Y.html`, markér den som master i både `planer.html` og plan-siden, og sæt den gamle til "Arkiveret".

### 8. Tilføj til forsiden (home.html)
Forsiden er `docs/home.html` (live: https://larsgam.github.io/Ferie/home.html). Tilføj et nyt `trip-card` (kopiér mønstret fra et eksisterende kort) der linker til `<tripcode>/overview.html`, og opdatér stat-tællerne (antal rejser, dage, lande). Tilføj også en række i `docs/index.md` (MkDocs-tabellen).

### 9. Spørg om Bib Gourmand
Spørg Lars om han vil have en Bib Gourmand-søgning med det samme (brug `restaurant-research` skill).

## Reference
- Apple HTML template: se `references/apple-html.md`
