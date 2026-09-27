#!/usr/bin/env node
/**
 * Migriert KC3K-News von der Wix-Seite (Wayback) nach public/data/news.json.
 */
import { writeFileSync } from "node:fs";

/** @type {[string, string][]} slug, wayback timestamp */
const snapshots = [
  ["3k-news-vom-september-2019", "20200806124929"],
  ["3k-news-januar-2020", "20200920210700"],
  ["newsletter", "20200920213609"],
  ["die-neusten-3k-news", "20200806124249"],
  ["3k-news-nr-73", "20210128155554"],
  ["3k-news-nr-74", "20210413184725"],
  ["3k-news-nr-74-1", "20210515091006"],
  ["3k-news-nr-75", "20211027003929"],
  ["3k-news-nr-76", "20220526090012"],
  ["3k-news-nr-77", "20220628115226"],
  ["3k-news-nr-78", "20230209125942"],
  ["3k-news-nr-79", "20230209112815"],
  ["3k-news-nr-80", "20230330095540"],
  ["3k-news-nr-81", "20231203194643"],
  ["3k-news-nr-82", "20240229184550"],
  ["3-k-news-nr-83", "20240229192727"],
  ["3k-news-nr-84", "20240419082703"],
  ["3k-news-nr-85", "20241112232303"],
  ["3k-news-nr-85-1", "20250117112104"],
  ["3k-news-nr-87", "20250209012829"],
  ["3k-news-nr-88", "20250505161155"],
  ["3k-news-nr-89", "20251011154556"],
  ["3k-news-nr-90", "20251215090629"],
  ["3k-news-nr-91", "20260314045759"],
  ["3k-news-nr-92", "20260520224313"],
  ["gratulation-zum-4-dan", "20230609064747"],
  ["karate-lager-2023", "20230930170327"],
];

const monthsDe = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function formatDateCh(iso) {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}. ${monthsDe[Number(m) - 1]} ${y}`;
}

function parsePost(html) {
  const title =
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ||
    html.match(/"headline":"([^"]+)"/)?.[1] ||
    "";

  const published =
    html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})/)?.[1] ||
    html.match(/article:published_time" content="(\d{4}-\d{2}-\d{2})/)?.[1] ||
    "";

  const excerpt =
    html.match(/property="og:description" content="([^"]+)"/)?.[1] ||
    html.match(/"description":"([^"]+)"/)?.[1] ||
    "Vereinszeitung als PDF auf Google Drive.";

  const driveMatch = html.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const openMatch = html.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  const fileId = driveMatch?.[1] || openMatch?.[1];
  const url = fileId ? `https://drive.google.com/file/d/${fileId}/view` : null;

  return { title, sortDate: published, excerpt, url };
}

function issueNumber(title) {
  const m = title.match(/Nr\.?\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function isKc3kNews(title, slug) {
  if (/3k[\s-]?news/i.test(title) || /3k-news|3-k-news|newsletter|die-neusten-3k-news/i.test(slug)) {
    return true;
  }
  return false;
}

async function fetchSnapshot(slug, ts) {
  const wayback = `https://web.archive.org/web/${ts}/https://www.kc3k.ch/post/${slug}`;
  const res = await fetch(wayback, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const parsed = [];
for (const [slug, ts] of snapshots) {
  const html = await fetchSnapshot(slug, ts);
  parsed.push({ slug, ...parsePost(html) });
  await new Promise((r) => setTimeout(r, 300));
}

const byIssue = new Map();
const extras = [];

for (const item of parsed) {
  if (!isKc3kNews(item.title, item.slug)) {
    if (item.slug === "gratulation-zum-4-dan" || item.slug === "karate-lager-2023") {
      extras.push(item);
    }
    continue;
  }
  if (!item.url) continue;
  const num = issueNumber(item.title);
  if (num != null) {
    const prev = byIssue.get(num);
    if (!prev || (prev.slug.endsWith("-1") && !item.slug.endsWith("-1"))) {
      byIssue.set(num, item);
    }
  } else {
    extras.push(item);
  }
}

const numbered = [...byIssue.entries()]
  .sort((a, b) => b[0] - a[0])
  .map(([, item]) => item);

const all = [...numbered, ...extras];

const knownCopy = {
  "3K-News Nr. 92": {
    date: "29. April 2026",
    sortDate: "2026-04-29",
    excerpt:
      "Die aktuelle Vereinszeitung mit Terminen, Berichten und allem, was im Club gerade läuft.",
  },
  "3K-News Nr.91": {
    date: "6. Februar 2026",
    sortDate: "2026-02-06",
    excerpt: "Rückblick und Ausblick aus dem Dojo — zum Lesen und Weitergeben.",
  },
  "3K-News Nr. 90": {
    date: "28. November 2025",
    sortDate: "2025-11-28",
    excerpt: "Herbstausgabe der 3K-News mit Vereinsinfos und kommenden Anlässen.",
  },
  "3K-News Nr. 89": {
    date: "1. Oktober 2025",
    sortDate: "2025-10-01",
    excerpt: "Die September-/Oktober-Ausgabe der Vereinszeitung.",
    image: "./media/news/lager-2023.jpg",
  },
};

function normalizeTitle(title) {
  return title.replace(/\s+/g, " ").trim();
}

const newsItems = all.map((item) => {
  const title = normalizeTitle(item.title);
  const copy = knownCopy[title] || knownCopy[title.replace("Nr.", "Nr. ")] || {};
  const sortDate = copy.sortDate || item.sortDate;
  if (!sortDate || !item.url) return null;
  const entry = {
    title,
    date: copy.date || formatDateCh(sortDate),
    sortDate,
    excerpt: copy.excerpt || item.excerpt.slice(0, 240),
    url: item.url,
    external: item.url.includes("drive.google.com"),
    section: "journal",
  };
  if (copy.image) entry.image = copy.image;
  if (item.slug === "gratulation-zum-4-dan") {
    entry.url = "team.html";
    entry.external = false;
    entry.image = "./media/news/4-dan.jpg";
    entry.excerpt =
      "Senseis Giovanni Miraglia und André Zuraikat haben die Prüfung zum 4. Dan JKA bestanden. Die Prüfung nahm Shihan Ogura persönlich ab.";
    entry.sortDate = "2023-04-13";
    entry.date = "13. April 2023";
    entry.title = "Gratulation zum 4. Dan";
  }
  if (item.slug === "karate-lager-2023") {
    entry.image = "./media/news/lager-2023.jpg";
    entry.title = "Karate-Lager 2023";
    entry.sortDate = "2023-06-21";
    entry.date = "21. Juni 2023";
    entry.excerpt = "Für weitere Fotos Gruppenbild anklicken!";
    if (!item.url) return null;
  }
  return entry;
}).filter(Boolean);

// Deduplicate by Drive URL
const seenUrl = new Set();
const deduped = newsItems.filter((item) => {
  if (seenUrl.has(item.url)) return false;
  seenUrl.add(item.url);
  return true;
});

function polishTitle(title) {
  if (/69\s*[-–]\s*72/i.test(title)) return "3K-News Nr. 69–72";
  const num = issueNumber(title);
  if (num != null && /news/i.test(title)) {
    return `3K-News Nr. ${num}`;
  }
  if (/januar 2020/i.test(title)) return "3K-News Januar 2020";
  if (/februar 2020/i.test(title)) return "3K-News Februar 2020";
  if (/september 2019/i.test(title)) return "3K-News September 2019";
  if (/die neusten/i.test(title)) return "3K-News (Archiv)";
  return title;
}

for (const item of deduped) {
  item.title = polishTitle(item.title);
}

deduped.sort((a, b) => b.sortDate.localeCompare(a.sortDate));

const outPath = new URL("../public/data/news.json", import.meta.url);
writeFileSync(outPath, `${JSON.stringify(deduped, null, 2)}\n`);
console.log(`→ ${deduped.length} News-Einträge`);
console.log(
  "Ausgaben:",
  deduped
    .filter((n) => /3K-News/i.test(n.title))
    .map((n) => n.title)
    .join(", "),
);
