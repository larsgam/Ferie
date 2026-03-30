---
name: opdater-plan
description: "Synkroniser en ændring i rejseplanen på tværs af index.md og overview.html i et ferie-projekt. Brug denne skill når Lars tilføjer, ændrer eller fjerner en aktivitet, tidspunkt, booking eller note i planen — begge filer skal altid opdateres konsistent. Triggers: 'skriv på planen at...', 'opdater planen', 'tilføj X til dag Y', 'ret dag Z', 'vi har booket...', 'fjern X fra planen'."
---

# Opdater Plan

Rejseplanen eksisterer to steder og skal holdes synkrone:

- `docs/<tripcode>/index.md` — rejseplan-tabel (markdown)
- `docs/<tripcode>/overview.html` — HTML-version med samme indhold

## Workflow

1. **Læs begge filer** inden du ændrer noget
2. **Find den relevante dag** i index.md (tabel: `| Dag | Dato | Ugedag | Plan |`)
3. **Foretag ændringen** i index.md — bevar eksisterende links og formatering
4. **Find tilsvarende dag** i overview.html og foretag samme ændring
5. **Tjek** om seværdigheder.md eller restauranter.md også skal have "Planlagt: dato"

## Formateringsregler

- Aktiviteter linker til sektioner: `[Ronda](sevaerdigheder.md#ronda)`
- Bookede ting: `**[Navn](restauranter.md#...) kl. 19:30** (booket ✅)`
- Faste aftaler/bookinger i **fed**, forslag i *kursiv*
- Kun bekræftede ting i index.md — forslag i kursiv
