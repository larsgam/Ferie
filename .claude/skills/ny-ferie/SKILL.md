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
├── overview.html
├── kort.html         (tom til at starte med — brug leaflet-map skill)
├── documents/
└── research/
```

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
Apple-stil HTML med nav, hero, link-cards til alle faste sider. Se `references/apple-html.md` for CSS og struktur.

### 7. Tilføj til forsiden
Tilføj en ny række i `docs/index.md` rejsetabellen.

### 8. Spørg om Bib Gourmand
Spørg Lars om han vil have en Bib Gourmand-søgning med det samme (brug `restaurant-research` skill).

## Reference
- Apple HTML template: se `references/apple-html.md`
