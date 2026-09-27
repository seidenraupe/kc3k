import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = resolve(import.meta.dirname, "src");

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

export default defineConfig({
  root,
  // Relativ, damit GitHub Pages unter /kc3k/ und später kc3k.ch in der Wurzel funktionieren.
  base: "./",
  publicDir: resolve(import.meta.dirname, "public"),
  plugins: [htmlPartials()],
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
    outDir: resolve(import.meta.dirname, "dist"),
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
