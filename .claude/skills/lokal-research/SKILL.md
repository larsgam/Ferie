---
name: lokal-research
description: "Opret en thematisk research-side til et ferie-projekt som en Apple-stil HTML-side linket fra overview. Bruges til emner som vin og drikkevarer, lokale råvarer og madlavning, aktiviteter, transport, vejr, rejsebureauguider osv. Triggers: 'lav en research om X', 'skriv noget om Y i området', 'lav en side om Z', 'hvad skal vi vide om X'."
---

# Lokal Research

Opretter en ny thematisk research-side som HTML og linker den fra overview.html.

## Workflow

Hvis vi er i en aktiv ferie: læs tripens `index.md` — den har hvem der er med, datoer og hvad der allerede er planlagt.

### 1. Afklar emnet
- Hvad handler siden om? (vin, mad, aktivitet, transport, kultur, ...)
- Skal der researches online, eller er materialet allerede tilgængeligt?
- Hvad er den vigtigste indsigt Lars vil have? (Hvad skal vi smage/opleve/vide?)

### 2. Research
Søg bredt og opsummer i disse kategorier afhængigt af emnet:
- **Must try / must do** — det vigtigste øverst
- **Baggrund** — kultur, historie, kontekst
- **Praktisk** — priser, åbningstider, booking, transport
- **Tips** — hvad tourister typisk overser

### 3. Opret HTML-siden
- Filnavn: `research/<emne-kebab-case>.html` i den relevante trip-folder
- Brug Apple-stil template fra `references/apple-html.md`
- Struktur: nav → hero (mørk baggrund) → insight-cards (vigtigste facts) → sektioner → footer
- Hero eyebrow: "Research · <Destination> <År>"
- Nav back-link til `../overview.html`

### 4. Link fra overview.html
Læs overview.html og tilføj et nyt link-card i navigationsektionen:
```html
<a href="research/<emne>.html" class="nav-card">
  <div class="nav-card-icon"><emne-emoji></div>
  <div class="nav-card-content">
    <div class="nav-card-title"><Titel></div>
    <div class="nav-card-desc"><Kort beskrivelse></div>
  </div>
</a>
```

### 5. Gem som .md også (valgfrit)
Hvis Lars ønsker det, gem en markdown-version i `research/<emne>.md` som kilde til HTML-siden.

## Reference
- Apple HTML template: se `references/apple-html.md`
