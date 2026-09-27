import { cpSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/fonts");

const files = [
  ["@fontsource/outfit/files/outfit-latin-500-normal.woff2", "outfit-latin-500-normal.woff2"],
  ["@fontsource/outfit/files/outfit-latin-600-normal.woff2", "outfit-latin-600-normal.woff2"],
  ["@fontsource/outfit/files/outfit-latin-700-normal.woff2", "outfit-latin-700-normal.woff2"],
  ["@fontsource/outfit/files/outfit-latin-800-normal.woff2", "outfit-latin-800-normal.woff2"],
  [
    "@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2",
    "source-sans-3-latin-400-normal.woff2",
  ],
  [
    "@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff2",
    "source-sans-3-latin-400-italic.woff2",
  ],
  [
    "@fontsource/source-sans-3/files/source-sans-3-latin-600-normal.woff2",
    "source-sans-3-latin-600-normal.woff2",
  ],
  [
    "@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff2",
    "source-sans-3-latin-700-normal.woff2",
  ],
];

mkdirSync(outDir, { recursive: true });

for (const [fromRel, name] of files) {
  cpSync(resolve(root, "node_modules", fromRel), resolve(outDir, name));
}
