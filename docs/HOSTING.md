# Hosting auf kreativmedia.ch

Die gebaute Website liegt im Document-Root der Domain `kc3k.ch`. Ein Push auf `main` baut `dist/` und kopiert diesen Ordner per SSH dorthin, analog zur HVW-Website bei Hostpoint.

## Empfohlene Einrichtung

1. Domain `kc3k.ch` in Plesk, Document-Root ist der Ordner `kc3k.ch` im Abo (nicht das `httpdocs` einer anderen Domain).
2. PHP wird nicht gebraucht.
3. **SSL/TLS**: Let’s Encrypt für `kc3k.ch` und `www.kc3k.ch`.
4. SSH-Zugriff für den Systembenutzer, siehe unten. Das reine FTP-Konto reicht für Actions nicht.

Die Datei `public/.htaccess` kommt mit dem Build nach `dist/` und aktiviert HTTPS-Redirect, kurze URLs (`/team` → `team.html`), Kompression und Basis-Header.

## Deploy per SSH

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

GitHub Actions baut die Seite und synchronisiert nur `dist/` auf den Server. Das Zip musst du dafür nicht mehr von Hand hochladen. GitHub Pages läuft parallel als Vorschau weiter.

Secrets gehören ins Repository **kc3k**, unter *Settings → Secrets and variables → Actions*. Dieselben Namen wie bei der HVW-Website, andere Werte:

| Secret | Wert für kc3k |
| --- | --- |
| `SSH_HOST` | `80.74.151.81` |
| `SSH_USER` | `giger` |
| `SSH_TARGET_DIR` | `/kc3k.ch` |
| `SSH_PRIVATE_KEY` | Privater Schlüssel `kc3k-deploy`, Fingerabdruck `SHA256:xhyVWVuLaCxWSfEEVOEt05P9npzIOVneOw8JshCzf08` |

Der Port ist im Workflow fest **2121**. Ein Secret `SSH_PORT` wird nicht gelesen. Port 22 ist auf diesem Server geschlossen. Die Shell von `giger` ist eine Plesk-Chroot: `/var/www/vhosts/...` ist dort nicht sichtbar, der Document-Root heißt `/kc3k.ch`.

`SSH_TARGET_DIR` darf nicht `/` und nicht das `httpdocs` einer anderen Domain sein. Der Sync löscht im Zielordner Dateien, die nicht mehr im Build sind. Die Datei `kc3k-kreativmedia.zip` bleibt liegen.

### SSH in Plesk einschalten

Auf `80.74.151.81` ist SSH über Port **2121** erreichbar (OpenSSH). Port 22 ist geschlossen. Bevor der erste Action-Lauf durchkommt:

1. Lokal einen Schlüssel erzeugen: `ssh-keygen -t ed25519 -f kc3k-deploy -C "github-actions-kc3k"`.
2. In Plesk beim Benutzer `giger` den SSH-Zugriff eingeschaltet lassen. Die Chroot-Shell bleibt, der Website-Ordner heißt dort `/kc3k.ch`.
3. Den Inhalt von `kc3k-deploy.pub` als SSH-Schlüssel dieses Benutzers hinterlegen.
4. Den Inhalt von `kc3k-deploy` (ohne `.pub`) als Secret `SSH_PRIVATE_KEY` speichern. Die private Datei nicht ins Repository legen.

Zusätzliche FTP-Konten wie `kc3k` haben keine Shell. Dafür bleibt der Systembenutzer des Abos.

## Domain und DNS

Die Website-Adresse muss auf `80.74.151.81` zeigen. MX und der A-Record von `mail.kc3k.ch` bleiben auf dem Mailserver. Nameserver, die eine Zone nicht ausliefern, lässt du von Kreativmedia aktivieren oder stellst sie auf den Dienst zurück, in dem die A-Records gepflegt werden.

## E-Mail

`info@kc3k.ch` bleibt die Vereinsadresse. Das Schnupperformular erzeugt eine `mailto:`-Nachricht dorthin. Ein serverseitiges Formular (PHP `mail()` oder ein kleiner Relay) kann später ergänzt werden, ohne die restliche Seite anzufassen.

Preview intern über GitHub Pages, öffentlich über `kc3k.ch`, sobald die Nameserver die Zone ausliefern.
