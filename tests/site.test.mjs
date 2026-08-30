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
];

test("Build erzeugt alle Vereinsseiten", () => {
  for (const page of pages) {
    assert.ok(existsSync(resolve(dist, page)), `fehlt: ${page}`);
  }
});

test("Startseite enthält Verein, Dojo und Call-to-Action", () => {
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  assert.match(html, /Karate-Club 3K/);
  assert.match(html, /Turnhalle Lind Nord/);
  assert.match(html, /Schnuppertraining/);
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

test("FAQ enthält IBAN und Gründungsdatum", () => {
  const html = readFileSync(resolve(dist, "faq.html"), "utf8");
  assert.match(html, /CH52 0070 0110 0005 4277 8/);
  assert.match(html, /15\. Januar 2002/);
});

test("News-Daten sind vollständig", () => {
  const news = JSON.parse(readFileSync(resolve(root, "src/data/news.json"), "utf8"));
  assert.ok(news.length >= 4);
  for (const item of news) {
    assert.ok(item.title);
    assert.ok(item.date);
    assert.ok(item.url);
    assert.ok(item.excerpt);
  }
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

test("Interne Navigation zeigt auf vorhandene Dateien", () => {
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  const hrefs = [...html.matchAll(/href="([^"]+\.html)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (href.startsWith("http")) continue;
    assert.ok(existsSync(resolve(dist, href)), `kaputter Link: ${href}`);
  }
});
