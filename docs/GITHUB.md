# GitHub: Dokumentation, Tests, Deployment

## Repository

Privates GitHub-Repository, z. B. `kc3k/website` oder unter dem Webmaster-Konto. `main` ist der produktive Zweig.

Empfohlene Branch-Regel:

- Änderungen über Pull Requests
- Workflow **Prüfen** muss grün sein
- Deployment nur von `main`

## Was automatisch läuft

| Workflow | Wann | Was |
| --- | --- | --- |
| [Prüfen](../.github/workflows/ci.yml) | jeder Push / PR | `npm ci`, Build, html-validate, Inhaltstests |
| [Deployment](../.github/workflows/deploy.yml) | Push auf `main` | dieselben Checks, danach FTPS nach Plesk |

Lokal dieselben Checks:

```bash
npm run check
```

Die Tests stellen sicher, dass alle Seiten gebaut werden, Senseis und IBAN vorhanden sind, die News-Datei gültig ist und interne Links nicht ins Leere zeigen.

## Secrets

Unter *Settings → Secrets and variables → Actions* bzw. Environment `produktion`:

- `FTP_HOST`
- `FTP_USER`
- `FTP_PASSWORD`
- `FTP_REMOTE_DIR` (z. B. `/httpdocs/`)

Ohne diese Secrets bleibt das Deployment bei «übersprungen». Der Build wird trotzdem geprüft.

## Alltagsarbeit

1. Lokal `npm run dev`, Seite im Browser prüfen.
2. Text oder News-Eintrag ändern.
3. `npm run check`.
4. Commit, Push, bei Bedarf Pull Request.
5. Nach Merge auf `main` lädt Actions die Dateien nach kreativmedia.

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

PDFs können später nach `public/news/` ziehen, dann zeigt `url` auf `/news/3k-news-93.pdf`.

## Issues und Wiki

GitHub Issues eignen sich für Vorstandswünsche («Foto Vorstand 2026», «Lager-Ausschreibung»). Dieses `docs/`-Verzeichnis bleibt die verbindliche Betriebsanleitung — unabhängig vom Wix-Editor.
