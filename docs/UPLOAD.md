# 3K-News Upload (`/upload/`)

Redaktionsbereich auf **https://kc3k.ch/upload/** — Passwort plus **2FA (TOTP)**. Nach dem Upload erscheinen Ausgaben auf [News](../src/news.html) sortiert nach **sortDate** absteigend.

## Voraussetzung auf Kreativmedia

**PHP** muss im Ordner `kc3k.ch/upload/` laufen (Plesk: PHP für diese Domain aktivieren). Der statische Deploy per GitHub Actions löscht hochgeladene Dateien **nicht** (Ausnahmen siehe Workflow).

## Zugänge (Initial)

| E-Mail | 2FA-Secret (Base32) |
| --- | --- |
| thomas.giger@cloud-7.net | `GC7K3M2X9Q4R8T6W` |
| nicole.straehl@cloud-7.net | `PL8N5V3H6J2K9M4X` |

**Erstes Passwort (beide Konten, bitte nach Go-Live ändern):** `kc3k-upload-setup-2026`

In der Authenticator-App Konto «KC3K Upload» anlegen (otpauth-Link erscheint auf der 2FA-Seite nach dem Passwort-Login).

## Konfiguration auf dem Server

- `upload/config.php` — Zugänge und TOTP-Secrets. Wird beim Deploy **nicht** überschrieben, sobald die Datei auf dem Server liegt.
- `data/news.json` — News-Liste für die öffentliche Seite (wird beim Deploy nicht überschrieben).
- `documents/news/` — hochgeladene PDFs (wird beim Deploy nicht gelöscht).

Passwort ändern: neuen bcrypt-Hash erzeugen (`password_hash` in PHP) und in `config.php` eintragen.

## Ablauf

1. `/upload/` → E-Mail + Passwort  
2. 6-stelliger Code aus der Authenticator-App  
3. Titel, Anzeige-Datum, Sortierdatum (ISO), Kurztext, PDF → **Veröffentlichen**

Die News-Seite lädt `./data/news.json` zur Laufzeit und sortiert clientseitig absteigend nach `sortDate`.
