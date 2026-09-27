const root = document.querySelector("[data-news-root]");
const empty = document.querySelector("[data-news-empty]");

const SECTIONS = [
  { id: "news", title: "News" },
  { id: "journal", title: "KC3K-Journal" },
  { id: "turnier", title: "Turnier-Berichte" },
];

function driveFileId(url) {
  const match = String(url).match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

function newsImageSrc(item) {
  if (item.section === "journal") return null;
  if (item.image) return item.image;
  if (item.external) {
    const id = driveFileId(item.url);
    if (id) {
      return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
    }
  }
  return null;
}

function sortNews(items) {
  return [...items].sort((a, b) => {
    const da = a.sortDate || "";
    const db = b.sortDate || "";
    if (da !== db) return db.localeCompare(da);
    return (b.title || "").localeCompare(a.title || "", "de-CH");
  });
}

function createCard(item) {
  const article = document.createElement("article");
  article.className = "news-card";
  const imageSrc = newsImageSrc(item);
  if (imageSrc) {
    const figure = document.createElement("a");
    figure.className = "news-card-media";
    figure.href = item.url;
    if (item.external) {
      figure.target = "_blank";
      figure.rel = "noopener noreferrer";
    }
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = item.imageAlt || item.title || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => {
      figure.remove();
    });
    figure.append(img);
    article.append(figure);
  }
  const date = document.createElement("p");
  date.className = "meta";
  date.textContent = item.date;
  const title = document.createElement("h2");
  const link = document.createElement("a");
  link.href = item.url;
  if (item.external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  link.textContent = item.title;
  title.append(link);
  const excerpt = document.createElement("p");
  excerpt.textContent = item.excerpt;
  article.append(date, title, excerpt);
  return article;
}

function renderNews(items) {
  if (!root) return;
  root.replaceChildren();
  if (!Array.isArray(items) || items.length === 0) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  let any = false;
  for (const section of SECTIONS) {
    const sectionItems = sortNews(items.filter((item) => item.section === section.id));
    if (sectionItems.length === 0) continue;
    any = true;

    const block = document.createElement("section");
    block.className = "news-rubric";

    const head = document.createElement("div");
    head.className = "section-head";
    const heading = document.createElement("h2");
    heading.className = "section-title";
    heading.textContent = section.title;
    head.append(heading);
    block.append(head);

    const grid = document.createElement("div");
    grid.className = "news-grid";
    grid.append(...sectionItems.map((item) => createCard(item)));
    block.append(grid);
    root.append(block);
  }

  if (!any && empty) empty.hidden = false;
}

async function loadNews() {
  if (!root) return;
  try {
    const response = await fetch(`./data/news.json?v=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(String(response.status));
    const items = await response.json();
    renderNews(items);
  } catch {
    if (empty) {
      empty.hidden = false;
      empty.textContent =
        "News konnten gerade nicht geladen werden. Bitte später erneut versuchen.";
    }
  }
}

loadNews();
