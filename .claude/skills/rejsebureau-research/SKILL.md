---
name: rejsebureau-research
description: "Sammenlign rejsebureauers anbefalede rejseplaner for en destination med Lars' egen plan. Find hvad bureauerne tager med som planen mangler, og hvad der kan springes over. Output er en research-side med gap-analyse og konkrete anbefalinger. Triggers: 'hvad siger rejsebureauerne om X', 'er der noget vi overser i vores plan', 'check om rejsebureauer har tips til Y', 'sammenlign vores plan med Z bureau'."
---

# Rejsebureau Research

Bruger rejsebureauernes ekspertise som kvalitetssikring af jeres egen rejseplan.

## Workflow

Hvis vi er i en aktiv ferie: læs tripens `index.md` — den har hvem der er med, datoer og hvad der allerede er planlagt.

### 1. Find relevante rejsebureauer
Søg efter bureauer der specialiserer sig i destinationen:
- Skandinaviske bureauer med lokal ekspertise (Bravo Tours, Spies, Star Tour, specialbureauer)
- Internationale (Lonely Planet itineraries, Rough Guides, Travel + Leisure)
- Lokale/specialiserede (fx spainbyhanne.dk for Spanien)

Foretruk bureauer med **detaljerede rejseplaner** frem for bare pakkerejser.

### 2. Saml rejseplaner (3-5 kilder)
For hver kilde, noter:
- Hvilke destinationer/aktiviteter anbefaler de?
- Hvilken rækkefølge/routing?
- Hvad fremhæver de som must-see?
- Praktiske tips (bedste tidspunkt, booking nødvendig, transport)

### 3. Læs Lars' nuværende plan
Læs `docs/<tripcode>/index.md` og `sevaerdigheder.md` for at forstå hvad der allerede er planlagt.

### 4. Gap-analyse — tre kategorier

**A. Hvad bureauerne tager med, men planen mangler**
— Overvej om det er relevant for familien (se profil)

**B. Hvad bureauerne anbefaler, og planen allerede har**
— Validering: I er på rette spor

**C. Hvad planen har, som bureauerne ikke nævner**
— Kan være en gem, eller noget der bør droppes

### 5. Output — research-side
Gem som `research/rejsebureau-research.html` i Apple-stil (se `references/apple-html.md`).

Struktur:
- Hero: "Rejsebureau Research · <Destination>"
- Insight-cards: de 4-6 vigtigste anbefalinger
- Sektion A/B/C med gap-analysen
- Konklusion: "Det anbefaler vi at tilføje til planen"

Link siden fra overview.html.

### 6. Foreslå planændringer
Præsentér konkret hvilke ændringer du anbefaler i rejseplanen — men lad Lars bestemme.

## Reference
- Apple HTML template: se `references/apple-html.md`
