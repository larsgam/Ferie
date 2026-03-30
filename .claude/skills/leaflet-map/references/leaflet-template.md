# Leaflet-kort HTML-skelet

Komplet template til `kort.html` i et ferie-projekt.

## Komplet HTML

```html
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Destination] [År] – Kort</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; flex-direction: column; height: 100vh; }

    #header {
      background: #1a1a2e; color: white; padding: 10px 16px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; gap: 10px; flex-wrap: wrap;
    }
    #header h1 { font-size: 15px; font-weight: 600; white-space: nowrap; }

    #filters { display: flex; gap: 5px; flex-wrap: wrap; }
    .filter-btn {
      border: none; border-radius: 20px; padding: 4px 10px;
      font-size: 12px; font-weight: 500; cursor: pointer; color: white; transition: opacity 0.2s;
    }
    .filter-btn.off { opacity: 0.3; }

    #map { flex: 1; }

    .leaflet-popup-content-wrapper { border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.18); max-width: 260px; }
    .leaflet-popup-content { margin: 12px 14px; }
    .popup-title { font-weight: 700; font-size: 14px; margin-bottom: 3px; }
    .popup-sub { font-size: 11px; color: #888; margin-bottom: 6px; }
    .popup-tag { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 10px; color: white; margin-bottom: 7px; }
    .popup-body { font-size: 12px; color: #333; line-height: 1.55; }
    .popup-detail { margin-top: 6px; font-size: 11px; color: #555; }
    .popup-detail span { font-weight: 600; color: #222; }
    .popup-link { display: inline-block; margin-top: 7px; font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 500; }
    .popup-link:hover { text-decoration: underline; }
  </style>
</head>
<body>

<div id="header">
  <h1>✈️ [Destination] · [Måneder] [År]</h1>
  <div id="filters">
    <button class="filter-btn" data-cat="hjem"       style="background:#2563eb">🏠 Bolig</button>
    <button class="filter-btn" data-cat="historisk"  style="background:#0f766e">🏛️ Historisk</button>
    <button class="filter-btn" data-cat="natur"      style="background:#16a34a">🌿 Natur</button>
    <button class="filter-btn" data-cat="strand"     style="background:#0891b2">🏖️ Strand</button>
    <button class="filter-btn" data-cat="dagstur"    style="background:#7c3aed">🚗 Dagstur</button>
    <button class="filter-btn" data-cat="restaurant" style="background:#dc2626">🍽️ Restaurant</button>
    <button class="filter-btn" data-cat="bib"        style="background:#9333ea">⭐ Bib Gourmand</button>
    <button class="filter-btn" data-cat="booket"     style="background:#059669">✅ Booket</button>
  </div>
</div>

<div id="map"></div>

<script>
const map = L.map('map').setView([LAT, LNG], ZOOM); // Juster center og zoom
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19
}).addTo(map);

const COLORS = {
  hjem:       '#2563eb',
  historisk:  '#0f766e',
  natur:      '#16a34a',
  strand:     '#0891b2',
  dagstur:    '#7c3aed',
  restaurant: '#dc2626',
  bib:        '#9333ea',
  booket:     '#059669'
};

const CAT_LABELS = {
  hjem:       'Bolig',
  historisk:  'Historisk',
  natur:      'Natur/Vandring',
  strand:     'Strand',
  dagstur:    'Dagstur',
  restaurant: 'Restaurant',
  bib:        'Bib Gourmand',
  booket:     'Booket ✅'
};

function makeIcon(emoji, cat) {
  const c = COLORS[cat];
  return L.divIcon({
    html: `<div style="background:${c};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><span style="transform:rotate(45deg);font-size:15px;line-height:1">${emoji}</span></div>`,
    className: '', iconSize: [34,34], iconAnchor: [17,34], popupAnchor: [0,-36]
  });
}

function mkPopup(cat, title, sub, body, details, link) {
  const color = COLORS[cat], label = CAT_LABELS[cat];
  const subHtml    = sub     ? `<div class="popup-sub">${sub}</div>` : '';
  const detailHtml = details ? `<div class="popup-detail">${details}</div>` : '';
  const linkHtml   = link    ? `<a class="popup-link" href="${link}" target="_blank">Mere info →</a>` : '';
  return `<div>
    <div class="popup-title">${title}</div>
    ${subHtml}
    <div class="popup-tag" style="background:${color}">${label}</div>
    <div class="popup-body">${body}</div>
    ${detailHtml}${linkHtml}
  </div>`;
}

const layers = {};
Object.keys(COLORS).forEach(k => layers[k] = []);

function addM(cat, emoji, lat, lng, title, sub, body, details, link) {
  const m = L.marker([lat, lng], { icon: makeIcon(emoji, cat) })
    .bindPopup(mkPopup(cat, title, sub, body, details, link));
  layers[cat].push(m);
  m.addTo(map);
}

// ── BOLIG ───────────────────────────────────────────────────────────────────
// addM('hjem','🏠', LAT, LNG, 'Lejehus', 'Adresse · Booking-ref', 'X nætter', null, null);

// ── HISTORISK ───────────────────────────────────────────────────────────────

// ── NATUR / VANDRING ────────────────────────────────────────────────────────

// ── STRAND ──────────────────────────────────────────────────────────────────

// ── DAGSTURE ────────────────────────────────────────────────────────────────

// ── RESTAURANTER ────────────────────────────────────────────────────────────

// ── BIB GOURMAND ────────────────────────────────────────────────────────────

// ── BOOKET ──────────────────────────────────────────────────────────────────


// ── FILTER-LOGIK (rør ikke) ─────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  const cat = btn.dataset.cat;
  btn.addEventListener('click', () => {
    const isOff = btn.classList.toggle('off');
    layers[cat].forEach(m => isOff ? map.removeLayer(m) : m.addTo(map));
  });
});
</script>
</body>
</html>
```

## Zoom-niveauer
- 8: region/land
- 9: provinsniveau (fx Costa del Sol)
- 11: by
- 13: bydel
- 15: gade-niveau
