# KC3K-News von Wix übernommen

Die Liste in `public/data/news.json` wurde aus den öffentlichen Wix-Beiträgen (`/post/…`) über die [Wayback Machine](https://web.archive.org/) rekonstruiert. **Journal-PDFs liegen auf dem Webserver** unter `documents/news/` (nicht mehr auf Google Drive).

## Umfang

- **Nr. 74–92** (einzelne Ausgaben, Nr. 86 unter Slug `3k-news-nr-85-1`)
- **Nr. 69–72** (Sammel-PDF)
- **Nr. 73** und ältere Ausgaben (2019/2020, Archiv-Link)

Einzelne Nummern unter 69 waren auf der archivierten Wix-Seite nicht mehr als eigene Beiträge auffindbar.

## Aktualisieren

```bash
node scripts/scrape-wix-news.mjs
```

Neue Ausgaben über **https://kc3k.ch/upload/** (Redaktion) oder PDF in `public/documents/news/` ablegen und Eintrag in `news.json` ergänzen. Deploy überträgt `data/news.json` und alle PDFs aus dem Repository.

Ausgaben **älter als Nr. 85** waren auf Google Drive nicht mehr erreichbar und sind aus der öffentlichen Liste entfernt, bis die Redaktion die PDFs erneut hochlädt (`npm run mirror-journal` spiegelt optional noch erreichbare Drive-Links).
