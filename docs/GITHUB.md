# GitHub: Dokumentation, Tests, Deployment

## Rolle

Sichtbar im Repository:

- Quellcode und Dokumentation
- Workflow **Prüfen** (jeder Push / Pull Request)
- Workflow **Deployment**: GitHub Pages als Vorschau, und per SSH der Ordner `dist/` nach Kreativmedia

## Was automatisch läuft

| Workflow | Wann | Was |
| --- | --- | --- |
| [Prüfen](../.github/workflows/ci.yml) | jeder Push / PR | Build, HTML-Validierung, Inhaltstests |
| [Deployment](../.github/workflows/deploy.yml) | Push auf `main` | dieselben Checks, GitHub Pages, SSH-Deploy nach Kreativmedia |

Lokal dieselben Checks:

```bash
npm run check
```

Die Tests stellen sicher, dass alle Seiten gebaut werden, Senseis und IBAN vorhanden sind, die News-Datei gültig ist und interne Links nicht ins Leere zeigen.

## GitHub Pages

Nach dem ersten grünen Deployment liegt die Vorschau unter der Pages-URL des Repos (Settings → Pages). Das ist die Adresse für den Vorstand — nicht die Vereinsdomain.

## Kreativmedia

Der Deploy nutzt dieselben Secret-Namen wie die HVW-Website bei Hostpoint. Angelegt werden sie im Repository **kc3k** unter *Settings → Secrets and variables → Actions*, nicht im HVW-Repository. Werte und der nötige SSH-Zugang in Plesk stehen in [HOSTING.md](HOSTING.md).

## Alltagsarbeit

1. Lokal `npm run dev`.
2. Text oder News-Eintrag ändern.
3. `npm run check`.
4. Commit und Push auf `main`.
5. Commit und Push auf `main`. Actions legt die Seite auf GitHub Pages und nach Kreativmedia.

## News ergänzen

`src/data/news.json`:

```json
{
  "title": "3K-News Nr. 93",
  "date": "15. September 2026",
  "excerpt": "Kurzer Teaser.",
  "url": "https://drive.google.com/file/d/…/view",
  "external": true
}
```
