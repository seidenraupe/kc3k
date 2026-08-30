# Hosting auf kreativmedia.ch

giger-straehl.ch liegt bei KreativMedia und antwortet mit einer Plesk-Standardseite. Dasselbe Panel eignet sich für kc3k.ch: statische Dateien ins Document-Root, SSL per Let’s Encrypt.

## Empfohlene Einrichtung

1. In Plesk unter **Websites & Domains** die Domain `kc3k.ch` (oder zuerst `neu.kc3k.ch`) anlegen.
2. Document-Root: `httpdocs` (Standard).
3. PHP wird nicht gebraucht. Eine beliebige PHP-Version schadet nicht.
4. **SSL/TLS**: Let’s Encrypt für `kc3k.ch` und `www.kc3k.ch`, Weiterleitung auf HTTPS.
5. FTP- oder SSH-Zugang nur für das Deployment, nicht öffentlich dokumentieren.

Die Datei `public/.htaccess` kommt mit dem Build nach `dist/` und aktiviert HTTPS-Redirect, kurze URLs (`/team` → `team.html`), Kompression und Basis-Header.

## Zwei Wege zum Aufschalten

### A. GitHub Actions → FTPS (empfohlen)

Der Build läuft auf GitHub. Nur der Inhalt von `dist/` landet auf dem Server.

Plesk: FTP-Benutzer mit Zugriff auf `httpdocs` anlegen. In GitHub unter *Settings → Secrets and variables → Actions*:

| Secret | Beispiel |
| --- | --- |
| `FTP_HOST` | FTP-Host aus Plesk, oft `ftp.ihre-domain.ch` |
| `FTP_USER` | FTP-Benutzer |
| `FTP_PASSWORD` | Passwort |
| `FTP_REMOTE_DIR` | `/httpdocs/` oder `/httpdocs/kc3k/` |

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

### B. Plesk Git

Unter der Domain **Git** wählen, Remote-URL des GitHub-Repos eintragen, SSH-Key von Plesk bei GitHub hinterlegen.

Wichtig: Das Repository enthält Quellcode, nicht das fertige `dist/`. Deshalb entweder

- Actions bauen und in einen `gh-pages`-/`deploy`-Branch nur `dist/` legen, den Plesk zieht, oder
- auf dem Server per SSH `npm ci && npm run build` ausführen und `dist/` nach `httpdocs` kopieren, falls Node auf dem Tarif vorhanden ist.

Variante A ist für dieses Hosting robuster.

## Domain und DNS

Heute:

- **A/NS**: Wix (`185.230.63.x`, `ns14.wixdns.net`)
- **MX**: `mail.kc3k.ch` — nicht über Wix

Beim Schnitt:

1. Bei SWITCH/Registrar oder im aktuellen DNS die Nameserver **nicht** auf Wix lassen, wenn Mail separat läuft. Besser: DNS zu KreativMedia oder zum Registrar ziehen.
2. A- und AAAA-Records von `kc3k.ch` und `www` auf die Plesk-IP setzen.
3. **MX, SPF, DKIM, DMARC unverändert lassen**, solange Mail auf `mail.kc3k.ch` bleibt.
4. TTL vorher auf 300 senken, nach dem Umzug 24–48 Stunden beobachten.
5. Wix erst kündigen, wenn die neue Seite unter der Hauptdomain erreichbar ist.

## E-Mail

`info@kc3k.ch` bleibt die Vereinsadresse. Das Schnupperformular erzeugt eine `mailto:`-Nachricht dorthin. Ein serverseitiges Formular (PHP `mail()` oder ein kleiner Relay) kann später ergänzt werden, ohne die restliche Seite anzufassen.

## Staging

Solange `kc3k.ch` noch auf Wix zeigt:

- Subdomain `neu.kc3k.ch` auf dem kreativmedia-Account, oder
- ein Unterordner / eine Extra-Domain im bestehenden Paket.

Preview intern, Go-Live erst nach Vorstandsabnahme.
