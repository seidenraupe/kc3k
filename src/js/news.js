const list = document.querySelector("[data-news-list]");
const empty = document.querySelector("[data-news-empty]");

function driveFileId(url) {
  const match = String(url).match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

function newsImageSrc(item) {
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

function renderNews(items) {
  if (!list) return;
  if (!Array.isArray(items) || items.length === 0) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  list.replaceChildren(
    ...sortNews(items).map((item) => {
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
    }),
  );
}

async function loadNews() {
  if (!list) return;
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
