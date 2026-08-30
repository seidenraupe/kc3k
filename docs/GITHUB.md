# GitHub: Dokumentation, Tests, Deployment

## Rolle in dieser Phase

Der Vorstand entscheidet anhand dieses Repositories. Deshalb ist alles hier sichtbar:

- Quellcode und Dokumentation
- Workflow **Prüfen** (jeder Push / Pull Request)
- Workflow **Deployment** → GitHub Pages (Vorschau, nicht kc3k.ch)

Auf kreativmedia.ch wird in dieser Phase nichts konfiguriert.

## Was automatisch läuft

| Workflow | Wann | Was |
| --- | --- | --- |
| [Prüfen](../.github/workflows/ci.yml) | jeder Push / PR | Build, HTML-Validierung, Inhaltstests |
| [Deployment](../.github/workflows/deploy.yml) | Push auf `main` | dieselben Checks, danach GitHub Pages |

Lokal dieselben Checks:

```bash
npm run check
```

Die Tests stellen sicher, dass alle Seiten gebaut werden, Senseis und IBAN vorhanden sind, die News-Datei gültig ist und interne Links nicht ins Leere zeigen.

## GitHub Pages

Nach dem ersten grünen Deployment liegt die Vorschau unter der Pages-URL des Repos (Settings → Pages). Das ist die Adresse für den Vorstand — nicht die Vereinsdomain.

## Später: kreativmedia

Erst nach dem Vereinsentscheid. Dann FTPS-Secrets und Plesk, siehe [HOSTING.md](HOSTING.md).

## Alltagsarbeit

1. Lokal `npm run dev`.
2. Text oder News-Eintrag ändern.
3. `npm run check`.
4. Commit und Push auf `main`.
5. Actions und Pages prüfen.

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
