# Apple-stil HTML Template

Bruges til alle research-sider i ferie-projektet. Kopiér CSS og struktur herfra.

## CSS (indsæt i `<style>`)

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --color-bg: #ffffff;
  --color-section: #f5f5f7;
  --color-text: #1d1d1f;
  --color-secondary: #6e6e73;
  --color-accent: #0071e3;
  --color-divider: #d2d2d7;
  --font: -apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  --radius: 18px;
  --max-w: 860px;
}

body { font-family: var(--font); background: var(--color-bg); color: var(--color-text); -webkit-font-smoothing: antialiased; }

nav {
  background: rgba(255,255,255,0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--color-divider);
  position: sticky; top: 0; z-index: 100;
}
.nav-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 22px; height: 48px; display: flex; align-items: center; justify-content: space-between; }
.nav-title { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
.nav-back { font-size: 13px; color: var(--color-accent); text-decoration: none; }
.nav-back:hover { text-decoration: underline; }

.hero { background: #1d1d1f; padding: 64px 22px 56px; text-align: center; }
.hero-eyebrow { font-size: 13px; font-weight: 600; color: #6e6e73; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
.hero h1 { font-size: clamp(32px, 5vw, 48px); font-weight: 700; letter-spacing: -0.03em; color: white; margin-bottom: 14px; }
.hero-sub { font-size: 17px; color: #a1a1a6; max-width: 520px; margin: 0 auto; line-height: 1.5; }

.section { padding: 52px 22px; }
.section-inner { max-width: var(--max-w); margin: 0 auto; }
.section-label { font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-secondary); margin-bottom: 6px; }
.section-title { font-size: clamp(24px, 3vw, 32px); font-weight: 700; letter-spacing: -0.025em; margin-bottom: 28px; }

/* Cards i grid */
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
.card {
  background: var(--color-section);
  border-radius: var(--radius);
  padding: 20px 22px;
  border: 1px solid var(--color-divider);
}
.card-icon { font-size: 28px; margin-bottom: 10px; }
.card-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.card-body { font-size: 14px; color: var(--color-secondary); line-height: 1.6; }

/* Verdict / fremhævet boks */
.verdict {
  background: linear-gradient(135deg, #e8f4fd 0%, #d0e8f9 100%);
  border: 1px solid #b3d4f0;
  border-radius: var(--radius);
  padding: 28px 32px;
  margin-bottom: 32px;
}
.verdict-label { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-accent); margin-bottom: 8px; }
.verdict h3 { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
.verdict p, .verdict li { font-size: 15px; color: #374151; line-height: 1.7; }

a { color: var(--color-accent); text-decoration: none; }
a:hover { text-decoration: underline; }

footer { background: var(--color-section); border-top: 1px solid var(--color-divider); padding: 32px 22px; text-align: center; }
footer p { font-size: 13px; color: var(--color-secondary); }
```

## HTML-skelet

```html
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Sidetitel] – [Destination] [År]</title>
  <style>
    /* CSS fra ovenfor */
  </style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <span class="nav-title">[Emoji] [Sidetitel]</span>
    <a href="../overview.html" class="nav-back">← [Destination]</a>
  </div>
</nav>

<section class="hero">
  <p class="hero-eyebrow">Research · [Destination] [År]</p>
  <h1>[Titel]</h1>
  <p class="hero-sub">[Kort beskrivelse af siden]</p>
</section>

<!-- VIGTIGSTE FACTS -->
<section class="section">
  <div class="section-inner">
    <p class="section-label">Vigtigst at vide</p>
    <h2 class="section-title">Nøgleindsigter</h2>
    <div class="card-grid">
      <div class="card">
        <div class="card-icon">🍷</div>
        <div class="card-title">Titel</div>
        <p class="card-body">Tekst</p>
      </div>
      <!-- Gentag for 4-6 cards -->
    </div>
  </div>
</section>

<!-- SEKTION MED ALT CONTENT -->
<section class="section" style="background:var(--color-section)">
  <div class="section-inner">
    <p class="section-label">Label</p>
    <h2 class="section-title">Overskrift</h2>
    <!-- Verdict, cards, tabeller osv. -->
  </div>
</section>

<footer>
  <p>[Destination] · Familieferie · [Måned] [År]</p>
  <p style="margin-top:6px"><a href="../overview.html">← [Destination] oversigt</a></p>
</footer>

</body>
</html>
```

## Varierende sektionsbaggrunde
Skift mellem `background: var(--color-bg)` (hvid) og `background: var(--color-section)` (lysegrå) for at skille sektioner.

## Link-card til overview.html
Når siden er oprettet, tilføj dette i overview.html's nav-grid:
```html
<a href="research/[emne].html" class="nav-card">
  <div class="nav-card-icon">[Emoji]</div>
  <div class="nav-card-content">
    <div class="nav-card-title">[Titel]</div>
    <div class="nav-card-desc">[1-linje beskrivelse]</div>
  </div>
</a>
```
