# SEO nach der Wix-Migration

Google und Bing zeigen oft noch alte Wix-URLs (`/news-1`, `/blank-page`, `/post/…`). Technisch ist das im Repo gelöst; in den Suchmaschinen braucht es zusätzlich ein paar Klicks in der Search Console.

## Was der Deploy bereits macht

| Massnahme | Wo |
| --- | --- |
| 301 von Wix-Pfaden auf neue Seiten | `public/.htaccess` |
| Trailing-Slash (`/faq/`) → ohne Slash, kein 500er | `.htaccess` |
| `www.kc3k.ch` → `https://kc3k.ch` | `.htaccess` |
| `/index.html` → `/` | `.htaccess` |
| Eigene **404** mit `<base href="/">` (Assets laden auch in Unterpfaden) | `src/404.html` |
| `<link rel="canonical">` auf jeder Seite | Build in `vite.config.js` |
| Sitemap & robots mit **https://kc3k.ch** (ohne www) | `public/sitemap.xml`, `robots.txt` |

### Wix-Umleitungen

| Alt (Wix) | Neu |
| --- | --- |
| `/news-1` | `/infos.html` |
| `/blank-page` | `/faq.html` |
| `/post/…` (36 News-Beiträge) | `/news.html` |
| `/_files/…` (alte Dokumente) | `/news.html` |

Slugs ohne Endung (`/team`, `/faq`, …) werden wie bisher auf `*.html` aufgelöst.

## Raschste Korrektur in Google (ca. 15 Minuten)

1. **Google Search Console** — Property `https://kc3k.ch` (Domain-Property oder URL-Prefix).
2. **Sitemap einreichen:** `https://kc3k.ch/sitemap.xml` (Index → Sitemaps).
3. **URL-Prüfung** für die wichtigsten Seiten (`/`, `/team.html`, `/faq.html`, `/infos.html`) → **Indexierung beantragen**.
4. **Alte Wix-URLs prüfen:** z. B. `https://kc3k.ch/news-1` und `https://kc3k.ch/blank-page` in der URL-Prüfung — Google soll **301** und die Ziel-URL sehen.
5. Optional **Entfernen** alter URLs, die weiterhin 404 liefern (nur wenn keine sinnvolle Weiterleitung möglich ist). Nach unseren 301-Regeln sollte das selten nötig sein.

## Bing Webmaster Tools

Sitemap ebenfalls unter `https://kc3k.ch/sitemap.xml` einreichen.

## Zeitrahmen

301-Weiterleitungen wirken oft innerhalb weniger Tage; vollständiges „Umsortieren“ der Snippets kann **2–6 Wochen** dauern. Wix-Property in der Search Console kann nach dem DNS-Schnitt entfernt oder ignoriert werden.

## Nach dem Deploy testen

```bash
curl -sI https://kc3k.ch/news-1 | head -5
curl -sI https://kc3k.ch/faq/ | head -5
curl -sI https://kc3k.ch/post/irgendwas | head -5
```

Erwartung: `301` mit `Location:` auf die neue Seite bzw. ohne trailing slash.
