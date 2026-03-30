---
name: leaflet-map
description: "Opret eller opdater et interaktivt Leaflet-kort (kort.html) til et ferie-projekt med emoji-markører, farvekodede kategorier og popup-info. Brug denne skill når der skal tilføjes nye steder på kortet, en restaurant er booket og skal skifte farve, eller kortet skal oprettes fra bunden. Triggers: 'tilføj X på kortet', 'opdater kortet med Y', 'marker Z som booket på kortet', 'lav et kort til ferien'."
---

# Leaflet Map

Opretter og opdaterer `kort.html` med interaktivt Leaflet-kort.

## Kategorier og farver (standard)

| Kategori | Farve | Emoji-forslag |
|----------|-------|---------------|
| `hjem` | #2563eb (blå) | 🏠 |
| `historisk` | #0f766e (teal) | 🏛️ 🕌 🏰 |
| `natur` | #16a34a (grøn) | 🌿 🥾 🏔️ |
| `strand` | #0891b2 (lyseblå) | 🏖️ 🚣 |
| `dagstur` | #7c3aed (lilla) | 🚗 |
| `restaurant` | #dc2626 (rød) | 🍽️ |
| `bib` | #9333ea (lilla) | ⭐ |
| `booket` | #059669 (grøn) | ✅ |

Tilføj nye kategorier ved at udvide `COLORS` og `CAT_LABELS` objekterne og tilføje en ny `filter-btn`.

Hvis vi er i en aktiv ferie: læs tripens `index.md` for kontekst — bolig, datoer og hvad der allerede er planlagt.

## addM() syntaks

```javascript
addM(kategori, emoji, lat, lng, titel, undertitel, brødtekst, detaljer, link);
```

- `detaljer`: HTML-streng med `<span>Label:</span> Værdi` format, eller `null`
- `link`: URL til "Mere info →", eller `null`

## Workflow — ny markør

1. Læs `kort.html` og find den relevante kommentarsektion (fx `// ── RESTAURANTER`)
2. Find koordinater med Google Maps (højreklik → koordinater)
3. Tilføj `addM(...)` kaldet under den rigtige sektion
4. Gentag for alle nye steder

## Workflow — "booket"-opdatering

Når en restaurant/aktivitet er booket, skift kategori fra `restaurant`/`bib` til `booket`:
```javascript
// Før:
addM('restaurant','🍽️', 36.82, -4.01, 'El Chiringuito', ...)
// Efter:
addM('booket','✅', 36.82, -4.01, 'El Chiringuito', ...)
```

## Workflow — nyt kort fra bunden

Læs `references/leaflet-template.md` for komplet HTML-skelet.

## Reference
- Komplet HTML-skelet: se `references/leaflet-template.md`
