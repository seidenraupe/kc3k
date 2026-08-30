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
- Offizielle Anmelde-PDFs für Aktiv- und Passivmitglieder
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

Nach dem DNS-Schnitt in `.htaccess` ergänzen:

```
Redirect 301 /blank-page /faq.html
Redirect 301 /news-1 /infos.html
```

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
- [ ] Alte Wix-URLs umgeleitet
- [ ] Suche «Karate Winterthur 3K» stichprobenartig geprüft
- [ ] Wix-Abo gekündigt, Rechnung als Beleg abgelegt
