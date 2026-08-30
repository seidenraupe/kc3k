# Konzept: HTML-Website für den Karate-Club 3K

## Ausgangslage

Die Vereinswebsite [www.kc3k.ch](https://www.kc3k.ch) läuft auf Wix. Die Nameserver zeigen auf `ns14.wixdns.net` / `ns15.wixdns.net`. Mail bleibt bereits ausserhalb von Wix (`mail.kc3k.ch`).

Wix erhöht das günstige Abo erneut — auf über 180 EUR pro Jahr. Für eine überschaubare Vereinsseite mit festen Seiten, PDFs und einem Kontaktformular ist das nicht mehr vertretbar.

Dieses Repository ist die Ablösung: eine **html-basierte, statische Website**. Sie bildet die bestehenden Inhalte ab, läuft auf dem bestehenden Hosting bei **kreativmedia.ch** (Plesk, gleiches Umfeld wie giger-straehl.ch) und wird über **GitHub** dokumentiert, geprüft und ausgerollt.

## Ziel

1. Dieselben Informationen wie heute: Verein, Training, Team, Leitbild, News, Galerie, FAQ, Schnupperanfrage.
2. Kein Baukasten-Abo, keine Wix-Abhängigkeit, keine Tracking-Pflicht.
3. Wartung durch den Webmaster: Texte in HTML oder einer JSON-Datei, Push nach GitHub, automatischer Test, Upload nach Plesk.
4. Domain `kc3k.ch` bleibt. E-Mail `info@kc3k.ch` und `mail.kc3k.ch` bleiben unangetastet.

## Warum HTML und nicht WordPress

| Variante | Aufwand | Kosten | Risiko |
| --- | --- | --- | --- |
| Wix weiterführen | tief | > 180 EUR / Jahr | Vendor-Lock-in, Preissteigerung |
| WordPress auf kreativmedia | mittel | Hosting bereits da | Updates, Plugins, Spam |
| **Statisches HTML** | einmalig Aufbau, danach klein | Hosting bereits da | praktisch keines |

Der Club braucht kein CMS mit Datenbank. News erscheinen als PDF-Link, der Vorstand ändert sich selten, Trainingszeiten stehen fest. Statische Dateien sind schnell, günstig und auf jedem Plesk-Paket lauffähig.

## Informationsarchitektur

```
Start
  Infos          Training, Lager, Prüfungen, Statuten, Sponsoren
  Team           Senseis, Vorstand
  Leitbild       Shin–Gi–Tai, Beiträge, Familie
  News           3K-News (JSON → Karten)
  Galerie        Alben (Fotos nach Medienumzug)
  FAQ            IBAN, Geschichte, Formulare
  Anmelden       Schnuppertraining (mailto)
  Impressum / Datenschutz
```

Die heutigen Wix-Slugs (`/blank-page`, `/news-1`) werden durch sprechende Dateinamen ersetzt. Nach dem Domain-Umzug können Apache-Rewrites alte URLs umleiten.

## Technik

- **HTML5**, semantisch, Sprache `de-CH`
- **Ein CSS** (`src/css/styles.css`), mobile Navigation, ohne Komponentenbibliothek
- **Wenig JavaScript**: Menü, Jahreszahl, Schnupperformular, News-Liste
- **Vite** nur als Werkzeug: lokaler Server, Build nach `dist/`
- **Kein Backend**, keine Datenbank, keine Cookies
- Schnupperanfrage öffnet das lokale Mailprogramm an `info@kc3k.ch`

Auf kreativmedia reicht Apache mit `httpdocs`. Node wird nur auf dem Rechner des Webmasters und in GitHub Actions gebraucht — nicht auf dem Webspace.

## Design

Angelehnt an das Vereinslogo (Karate-Club 3K Winterthur, Kihon–Kata–Kumite):

- Bordeaux / Tiefrot als Akzent
- Warmes Papier statt kaltem Grau
- Oswald für Titel, Source Sans 3 für Fliesstext
- Kanji 空手道 als dezentes Hero-Motiv
- Desktop-Navigation und Off-Canvas-Menü auf dem Handy

Clubfotos bleiben bis zur Medienmigration auf Wix. Die Galerie listet die bestehenden Alben bereits.

## Betrieb

```
Webmaster ändert Datei
        ↓
   git push (GitHub)
        ↓
  Actions: Build + Tests
        ↓
  FTPS nach Plesk /httpdocs
        ↓
     www.kc3k.ch
```

Alternativ kann Plesk das GitHub-Repository selbst ziehen. Dann muss der Build entweder in Actions geschehen (empfohlen) oder per Post-Deploy-Skript auf dem Server.

## Kostenvergleich

Annahme: Domain `kc3k.ch` ist vorhanden, Mail läuft, kreativmedia-Hosting existiert bereits (giger-straehl.ch bzw. Reseller-/Webhosting-Paket).

| Posten | Wix | Diese Lösung |
| --- | --- | --- |
| Website-Abo | > 180 EUR / Jahr | 0 |
| Hosting | in Wix enthalten | 0 zusätzlich, wenn ein Domain-Account frei ist |
| Domain | oft extra | bleibt |
| Mail | oft extra / hybrid | unverändert `mail.kc3k.ch` |
| GitHub | — | 0 (private Repos für Vereine üblich) |
| SSL | Wix | Let’s Encrypt in Plesk, kostenlos |

Wenn das bestehende Paket **keine** weitere Website mehr erlaubt, reicht das kleinste kreativmedia-Webhosting (aktuell rund CHF 10–16 / Monat im ersten bzw. Folgejahr) — immer noch klar unter dem Wix-Abo, plus volle Kontrolle über Mail und Dateien.

## Was bewusst weggelassen ist

- Mitgliederbereich / Login
- Online-Shop für Gis
- Newsletter-Versand (bleibt bei den 3K-News-PDFs)
- Cookie-Banner (es gibt nichts zu tracken)

Diese Dinge können später ergänzt werden, ohne die HTML-Basis zu verlassen.

## Nächste Schritte

1. Repository auf GitHub anlegen (privat) und dieses Projekt pushen.
2. In Plesk eine Website / Subdomain für den Test anlegen, z. B. `neu.kc3k.ch` oder eine Subdomain auf dem bestehenden Account.
3. GitHub-Secrets für FTPS setzen und einmal erfolgreich deployen.
4. Vorstand die Preview zeigen, Texte und Fotos nachziehen.
5. DNS von Wix auf kreativmedia umstellen, Mail-Records nicht anfassen.
6. Wix-Abo kündigen, sobald `www.kc3k.ch` stabil auf dem neuen Host antwortet.
