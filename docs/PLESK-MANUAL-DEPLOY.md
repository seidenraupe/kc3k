# Manuell deployen (Plesk Dateimanager)

Wenn GitHub Actions **grün** ist, aber im Ordner **kc3k.ch** in Plesk **keine neuen Dateien** erscheinen (Timestamps bleiben z. B. vom 27. September), kommt der SSH-Sync sehr wahrscheinlich **nicht im Document-Root** an — oder `main` auf GitHub ist veraltet.

## Schnellcheck im Dateimanager

Nach einem erfolgreichen Deploy sollten u. a. existieren:

| Datei / Ordner | Erwartung |
| --- | --- |
| `version.txt` | eine Zeile mit Git-Commit (z. B. `3408fad`) |
| `deploy-stamp.txt` | Commit, Run-ID, Zeitstempel UTC |
| `documents/news/` | **9 PDFs** (Nr. 85–93) |
| `news.html` | verweist auf `assets/news-….js` (nicht dauerhaft `news-CHcbKTKs.js`) |

Fehlen diese Einträge, ist der letzte SSH-Deploy **nicht** im angezeigten Ordner gelandet.

## Plesk: Document Root prüfen

**Domains → kc3k.ch → Hosting-Einstellungen → Document Root** muss der Ordner **`kc3k.ch`** sein (derselbe, den du im Dateimanager öffnest) — **nicht** `httpdocs` oder `httpsdocs` (Geschwisterordner in der Seitenleiste).

Das Secret `SSH_TARGET_DIR` in GitHub muss **`/kc3k.ch`** sein (Chroot-Pfad für Benutzer `giger`, Port **2121**).

## Manuell hochladen (ZIP)

1. GitHub **seidenraupe/kc3k**: `main` mit dem neuesten Stand synchronisieren ([GITHUB-SYNC.md](GITHUB-SYNC.md)).
2. **Actions → Deployment** → letzter Lauf → Artifacts **`kc3k-dist-zip`** herunterladen.
3. ZIP entpacken (lokal). **Inhalt** von `dist/` (nicht den Ordner `dist` selbst) in Plesk nach **kc3k.ch** hochladen — bestehende Dateien überschreiben.
4. `upload/config.php` auf dem Server **nicht** löschen, falls schon konfiguriert.
5. Prüfen: https://kc3k.ch/version.txt und https://kc3k.ch/documents/news/3k-news-nr-93-2026-09-29.pdf

Alternativ lokal: `npm run build`, dann Inhalt von `dist/` per FTP/Dateimanager hochladen.

## SSH-Deploy (wenn Schlüssel vorhanden)

```bash
npm run build
./scripts/deploy-kreativmedia.sh
```

Danach im Dateimanager **`deploy-stamp.txt`** und frische **Geändert**-Daten sehen.
