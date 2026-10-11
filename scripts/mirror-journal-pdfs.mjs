#!/usr/bin/env node
/**
 * Spiegelt Journal-PDFs lokal unter public/documents/news/ und setzt news.json auf ./documents/news/…
 * Drive-Links werden einmalig heruntergeladen (solange Google sie noch ausliefert).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = resolve(root, "public/data/news.json");
const pdfDir = resolve(root, "public/documents/news");

function driveFileId(url) {
  const match = String(url).match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

function pdfFilename(item) {
  const slug = item.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-${item.sortDate}.pdf`;
}

async function downloadPdf(fileId, dest) {
  const url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024 || !buf.subarray(0, 5).toString("ascii").startsWith("%PDF-")) {
    throw new Error(`Kein gültiges PDF (${buf.length} Bytes)`);
  }
  writeFileSync(dest, buf);
  return buf.length;
}

mkdirSync(pdfDir, { recursive: true });
const items = JSON.parse(readFileSync(jsonPath, "utf8"));
const failures = [];

for (const item of items) {
  if (item.section !== "journal") continue;

  const filename = pdfFilename(item);
  const dest = resolve(pdfDir, filename);
  const localUrl = `./documents/news/${filename}`;

  if (!existsSync(dest)) {
    const fileId = driveFileId(item.url);
    if (!fileId) {
      failures.push(`${item.title}: kein lokales PDF und kein Drive-Link`);
      continue;
    }
    process.stdout.write(`Lade ${item.title} … `);
    try {
      const bytes = await downloadPdf(fileId, dest);
      console.log(`${(bytes / 1024).toFixed(0)} KiB`);
    } catch (err) {
      console.log(`FEHLER: ${err.message}`);
      failures.push(`${item.title}: ${err.message}`);
      continue;
    }
  }

  item.url = localUrl;
  item.external = false;
}

const kept = items.filter((item) => {
  if (item.section !== "journal") return true;
  const filename = pdfFilename(item);
  if (!existsSync(resolve(pdfDir, filename))) {
    failures.push(`${item.title}: PDF fehlt nach Sync — Eintrag entfernt`);
    return false;
  }
  return true;
});

writeFileSync(jsonPath, `${JSON.stringify(kept, null, 2)}\n`);

if (failures.length) {
  console.error("\nHinweise:");
  for (const line of failures) console.error(`  - ${line}`);
}

const journalCount = kept.filter((i) => i.section === "journal").length;
console.log(`Fertig: ${journalCount} Journal-Ausgaben mit lokalem PDF.`);

if (failures.some((f) => f.includes("entfernt"))) {
  process.exitCode = 0;
}
