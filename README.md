# Karate-Club 3K Winterthur

Statische HTML-Website für [kc3k.ch](https://www.kc3k.ch). Ablösung der Wix-Seite: dieselben Vereinsinhalte, ohne monatliches Baukasten-Abo.

Hosting ist für **kreativmedia.ch** (Plesk, wie giger-straehl.ch) vorgesehen. Dokumentation, Tests und Deployment laufen über **GitHub**.

## Lokal starten

```bash
npm install
npm run dev
```

Der Dev-Server läuft auf [http://127.0.0.1:43147](http://127.0.0.1:43147).

```bash
npm run check    # Build, HTML-Validierung, Inhaltstests
npm run build    # statische Dateien nach dist/
npm run preview  # Produktionsbuild lokal ansehen
```

## Seiten

| Seite | Inhalt |
| --- | --- |
| `index.html` | Start, Dojo, Trainingszeiten |
| `infos.html` | Training, Lager, Prüfungen, Sponsoren |
| `team.html` | Senseis und Vorstand |
| `leitbild.html` | Philosophie, Beiträge, Familie |
| `news.html` | 3K-News aus `src/data/news.json` |
| `galerie.html` | Alben-Übersicht (Fotos nach Migration) |
| `faq.html` | Beitrag, IBAN, Geschichte |
| `anmelden.html` | Schnupperanfrage per E-Mail |
| `impressum.html` / `datenschutz.html` | Rechtliches |

## Inhalte ändern

- Texte stehen in den HTML-Dateien unter `src/`.
- Eine neue Vereinszeitung: Eintrag in `src/data/news.json` ergänzen.
- Kopf- und Fusszeile: `src/partials/`.
- Erscheinungsbild: `src/css/styles.css`.

## Dokumentation

- [Konzept](docs/KONZEPT.md) — Warum HTML, Architektur, Kosten
- [Hosting](docs/HOSTING.md) — kreativmedia / Plesk, Domain, Mail
- [GitHub](docs/GITHUB.md) — Tests, Secrets, Deployment
- [Migration](docs/MIGRATION.md) — Schnitt von Wix nach kc3k.ch

## Lizenz

Vereinsinhalte gehören dem Karate-Club 3K Winterthur. Das technische Gerüst darf der Verein frei weiterverwenden.
