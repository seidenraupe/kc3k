import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

const pages = [
  "index.html",
  "team.html",
  "infos.html",
  "leitbild.html",
  "news.html",
  "galerie.html",
  "faq.html",
  "anmelden.html",
  "impressum.html",
  "datenschutz.html",
  "404.html",
];

test("Build erzeugt alle Vereinsseiten", () => {
  for (const page of pages) {
    assert.ok(existsSync(resolve(dist, page)), `fehlt: ${page}`);
  }
});

test("Google Analytics ist eingebunden", () => {
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  assert.match(html, /G-GZ3KFSEGLY/);
  assert.match(html, /googletagmanager\.com\/gtag\/js/);
});

test("Datenschutz beschreibt Google Analytics", () => {
  const html = readFileSync(resolve(dist, "datenschutz.html"), "utf8");
  assert.match(html, /Google Analytics/);
  assert.match(html, /G-GZ3KFSEGLY/);
  assert.doesNotMatch(html, /Keine Tracker/);
});

test("Startseite enthält Verein, Dojo und Call-to-Action", () => {
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  assert.match(html, /Karate-Club 3K/);
  assert.match(html, /Turnhalle Lind Nord/);
  assert.match(html, /St\.-Georgen-Strasse 69/);
  assert.match(html, /google\.ch\/maps\/place\/St\.-Georgen-Strasse\+69/);
  assert.match(html, /karte-st-georgen\.jpg/);
  assert.match(html, /jka-karate\.ch/);
  assert.match(html, /media\/partner\/jka-karate\.png/);
  assert.match(html, /Schnuppertraining/);
  assert.match(html, /stat-label-line[^>]*>Aktiv-/);
  assert.match(html, /stat-label-line[^>]*>Mitglieder/);
  assert.match(html, /stat-label-line[^>]*>Gönner/);
  assert.doesNotMatch(html, /Passiv/i);
  assert.match(html, /lang="de-CH"/);
});

test("Team listet Senseis und Vorstand", () => {
  const html = readFileSync(resolve(dist, "team.html"), "utf8");
  for (const name of [
    "Giuseppe Lucchena",
    "Giovanni Miraglia",
    "André Zuraikat",
    "Giovanni Ritacco",
    "Paco Benitez",
    "Rossella Vena",
    "Vorstand",
  ]) {
    assert.match(html, new RegExp(name));
  }
});

test("Leitbild verlinkt Dôjô-Kun und Statuten", () => {
  const html = readFileSync(resolve(dist, "leitbild.html"), "utf8");
  assert.match(html, /kc3k-dojo-kun\.pdf/);
  assert.match(html, /kc3k-ethik-charta\.pdf/);
  assert.match(html, /kc3k-statuten-2025-03-14\.pdf/);
  for (const file of [
    "documents/kc3k-dojo-kun.pdf",
    "documents/kc3k-ethik-charta.pdf",
    "documents/kc3k-statuten-2025-03-14.pdf",
  ]) {
    assert.ok(existsSync(resolve(dist, file)), `fehlt: ${file}`);
  }
});

test("Anmelden: Schnuppern und Gönner-Formular", () => {
  const html = readFileSync(resolve(dist, "anmelden.html"), "utf8");
  assert.match(html, /data-schnupper-form/);
  assert.match(html, /data-goenner-form/);
  assert.match(html, /id="goenner"/);
  assert.match(html, /Fr\. 100\.–/);
  assert.match(html, /freiwillige Spenden/);
});

test("FAQ verlinkt die SKR-Prüfungsordnung 2025", () => {
  const html = readFileSync(resolve(dist, "faq.html"), "utf8");
  assert.match(html, /skr-pruefungsordnung-2025\.pdf/);
  assert.ok(
    existsSync(resolve(dist, "documents/skr-pruefungsordnung-2025.pdf")),
    "SKR-PDF fehlt im Build",
  );
});

test("FAQ enthält IBAN und Gründungsdatum", () => {
  const html = readFileSync(resolve(dist, "faq.html"), "utf8");
  assert.match(html, /CH52 0070 0110 0005 4277 8/);
  assert.match(html, /15\. Januar 2002/);
});

test("News-Daten sind vollständig und sortierbar", () => {
  const newsPath = resolve(dist, "data/news.json");
  assert.ok(existsSync(newsPath), "data/news.json fehlt im Build");
  const news = JSON.parse(readFileSync(newsPath, "utf8"));
  assert.ok(news.length >= 10);
  assert.ok(
    news.filter((item) => item.section === "journal").length >= 8,
    "KC3K-Journal: nur Einträge mit erreichbarem PDF",
  );
  for (const item of news) {
    assert.ok(item.title);
    assert.ok(item.date);
    assert.ok(item.sortDate);
    assert.ok(item.url);
    assert.ok(item.excerpt);
    assert.ok(["news", "journal"].includes(item.section));
  }
  assert.ok(news.some((item) => item.section === "journal"));
  assert.ok(news.some((item) => item.section === "news"));
  assert.ok(!news.some((item) => item.section === "turnier"));
  assert.ok(news.filter((item) => item.section === "journal").every((item) => !item.image));
});

test("News-Seite ohne Redaktions-Hinweis", () => {
  const html = readFileSync(resolve(dist, "news.html"), "utf8");
  assert.doesNotMatch(html, /src\/data\/news\.json/);
  assert.doesNotMatch(html, /Die Ausgaben liegen/);
  assert.doesNotMatch(html, /Turnier-Berichte/);
});

test("Upload-Bereich ist im Build", () => {
  assert.ok(existsSync(resolve(dist, "upload/index.php")));
  assert.ok(existsSync(resolve(dist, "upload/upload.css")));
});

test("Galerie verlinkt Mehr Fotos und Video", () => {
  const html = readFileSync(resolve(dist, "galerie.html"), "utf8");
  assert.match(html, /Mehr Fotos/);
  assert.match(html, />Video</);
  assert.match(html, /photos\.app\.goo\.gl/);
  assert.match(html, /dropbox\.com\/s\/cvhngxf9kzhfmqs\/Katas\.mp4/);
  assert.match(html, /Weihnachts-Fest/);
  assert.doesNotMatch(html, /Jahresfest/i);
  assert.match(html, /Dagmersellen/);
  assert.doesNotMatch(html, /Dagmarsellen/);
  assert.match(html, /1XTZn0BgEmDp8UVPUxcqYLbp0Cdn6kwwD/);
});

test("Vereinsfotos liegen im Build", () => {
  for (const file of [
    "media/team/giuseppe-lucchena.jpg",
    "media/home/seiza.jpg",
    "media/galerie/lager-2019.jpg",
    "media/faq/twint.png",
  ]) {
    assert.ok(existsSync(resolve(dist, file)), `fehlt: ${file}`);
  }
});

test("Gebaute Assets nutzen relative Pfade für GitHub Pages", () => {
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  assert.match(html, /href="\.\/assets\/[^"]+\.css"/);
  assert.match(html, /src="\.\/assets\/[^"]+\.js"/);
  assert.doesNotMatch(html, /href="\/assets\//);
  assert.doesNotMatch(html, /src="\/assets\/logo/);
});

test("Canonical und Sitemap nutzen kc3k.ch ohne www", () => {
  const index = readFileSync(resolve(dist, "index.html"), "utf8");
  assert.match(index, /<link rel="canonical" href="https:\/\/kc3k\.ch\/"/);
  const sitemap = readFileSync(resolve(dist, "sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/kc3k\.ch\//);
  assert.doesNotMatch(sitemap, /www\.kc3k\.ch/);
  const robots = readFileSync(resolve(dist, "robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/kc3k\.ch\/sitemap\.xml/);
});

test("404-Seite und htaccess-Weiterleitungen", () => {
  const notFound = readFileSync(resolve(dist, "404.html"), "utf8");
  assert.match(notFound, /<base href="\/"/);
  assert.match(notFound, /Seite nicht gefunden/);
  const htaccess = readFileSync(resolve(dist, ".htaccess"), "utf8");
  assert.match(htaccess, /blank-page/);
  assert.match(htaccess, /news-1/);
  assert.match(htaccess, /ErrorDocument 404 \/404\.html/);
});

test("Interne Navigation zeigt auf vorhandene Dateien", () => {
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  const hrefs = [...html.matchAll(/href="([^"]+\.html)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (href.startsWith("http")) continue;
    assert.ok(existsSync(resolve(dist, href)), `kaputter Link: ${href}`);
  }
});
