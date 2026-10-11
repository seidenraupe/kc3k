import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const repoRoot = resolve(import.meta.dirname);
const root = resolve(repoRoot, "src");
const newsDataPath = resolve(repoRoot, "public/data/news.json");

const pages = [
  "index",
  "team",
  "infos",
  "leitbild",
  "news",
  "galerie",
  "faq",
  "anmelden",
  "impressum",
  "datenschutz",
  "404",
];

function htmlPartials() {
  return {
    name: "html-partials",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const page = ctx.filename
          ? ctx.filename.replace(/\\/g, "/").split("/").pop().replace(".html", "")
          : "index";

        const replacePartial = (source, name) => {
          const file = resolve(root, "partials", `${name}.html`);
          if (!existsSync(file)) return source;
          let partial = readFileSync(file, "utf8");
          partial = partial.replaceAll(
            `data-nav="${page}"`,
            `data-nav="${page}" aria-current="page"`,
          );
          return source.replaceAll(`<!--partial:${name}-->`, partial);
        };

        let out = ["head-end", "header", "footer"].reduce(replacePartial, html);
        const canonicalUrl =
          page === "index"
            ? "https://kc3k.ch/"
            : page === "404"
              ? null
              : `https://kc3k.ch/${page}.html`;
        if (canonicalUrl) {
          out = out.replace(
            "</head>",
            `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`,
          );
        }
        return out;
      },
    },
  };
}

function buildVersion() {
  return {
    name: "build-version",
    closeBundle() {
      let sha = "unknown";
      try {
        sha = execSync("git rev-parse --short HEAD", { cwd: repoRoot }).toString().trim();
      } catch {
        // ignore
      }
      writeFileSync(resolve(repoRoot, "dist/version.txt"), `${sha}\n`);
    },
  };
}

export default defineConfig({
  root,
  // Relativ, damit GitHub Pages unter /kc3k/ und später kc3k.ch in der Wurzel funktionieren.
  base: "./",
  publicDir: resolve(repoRoot, "public"),
  resolve: {
    alias: {
      "@news-data": newsDataPath,
    },
  },
  plugins: [htmlPartials(), buildVersion()],
  server: {
    host: "127.0.0.1",
    port: 43147,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 43147,
    strictPort: true,
  },
  build: {
    outDir: resolve(repoRoot, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((name) => [
          name,
          resolve(root, name === "index" ? "index.html" : `${name}.html`),
        ]),
      ),
    },
  },
});
