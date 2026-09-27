# KC3K-News von Wix übernommen

Die Liste in `public/data/news.json` wurde aus den öffentlichen Wix-Beiträgen (`/post/…`) über die [Wayback Machine](https://web.archive.org/) rekonstruiert — PDF-Links zeigen auf **Google Drive** wie auf der alten Seite.

## Umfang

- **Nr. 74–92** (einzelne Ausgaben, Nr. 86 unter Slug `3k-news-nr-85-1`)
- **Nr. 69–72** (Sammel-PDF)
- **Nr. 73** und ältere Ausgaben (2019/2020, Archiv-Link)

Einzelne Nummern unter 69 waren auf der archivierten Wix-Seite nicht mehr als eigene Beiträge auffindbar.

## Aktualisieren

```bash
node scripts/scrape-wix-news.mjs
```

Neue Ausgaben ab Nr. 93 idealerweise über **https://kc3k.ch/upload/** (Redaktion) — der Deploy überschreibt `data/news.json` auf dem Server standardmässig **nicht**. Nach einer kompletten Neu-Migration einmalig per SSH/rsync `dist/data/news.json` auf Kreativmedia kopieren.
