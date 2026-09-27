# Migration von Wix nach HTML

## Was bereits übernommen ist

Aus der öffentlichen Wix-Seite (Stand August 2026):

- Mitgliederzahlen, Trainingszeiten, Dojo-Adresse
- Senseis mit Dan-Graden und Rollen
- Vorstand
- Leitbild, Beiträge, Familienrabatt
- FAQ inkl. IBAN und Gründungsgeschichte
- Die vier neuesten 3K-News mit Drive-Links
- Galerie-Alben als Titelliste
- Logo (Vereinsgrafik 2019)

## Was der Vorstand noch liefern sollte

- Aktuelle Vorstandsfotos (mit Einverständnis der Abgebildeten)
- Galeriebilder der letzten Lager und Turniere
- Offizielle Anmelde-PDFs für Aktivmitglieder und Gönner
- Statuten-PDF, falls öffentlich
- Bestätigung, dass die Drive-Links der 3K-News so bleiben dürfen

## URL-Mapping

| Wix | Neu |
| --- | --- |
| `/` | `/` |
| `/news-1` | `/infos.html` |
| `/team` | `/team.html` |
| `/leitbild` | `/leitbild.html` |
| `/news` | `/news.html` |
| `/galerie` | `/galerie.html` |
| `/blank-page` | `/faq.html` |
| `/post/…` | News-Karten bzw. PDF |

Die 301-Weiterleitungen, 404-Seite, Canonical-Tags und Sitemap stehen im Repo (`public/.htaccess`, `src/404.html`, `docs/SEO.md`). Kurzfassung:

| Wix | Neu |
| --- | --- |
| `/post/…` | `/news.html` |
| `/_files/…` | `/news.html` |

## Medien

Die öffentlichen Vereinsfotos liegen unter `public/media/`. Was gegenüber Wix noch fehlt (Alben-Inhalte, zwei Infos-Grafiken, drei Leitbild-Fotos), steht in [FOTOS.md](FOTOS.md).

Wix-Originale nicht nach der Kündigung weiter per Hotlink nutzen.

## Go-Live-Checkliste

- [ ] Preview auf Subdomain vom Vorstand abgenommen
- [ ] Let’s Encrypt für die Zieldomain aktiv
- [ ] Mail-Records (MX/SPF/DKIM) dokumentiert und unverändert
- [ ] TTL gesenkt
- [ ] A-Record auf Plesk-IP
- [ ] `www` und Apex getestet (HTTPS, Formular, News-Links)
- [ ] Alte Wix-URLs umgeleitet (Deploy + `docs/SEO.md` / Search Console)
- [ ] Suche «Karate Winterthur 3K» stichprobenartig geprüft
- [ ] Wix-Abo gekündigt, Rechnung als Beleg abgelegt
