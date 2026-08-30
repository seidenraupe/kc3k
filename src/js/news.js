import items from "../data/news.json";

const list = document.querySelector("[data-news-list]");
const empty = document.querySelector("[data-news-empty]");

if (list) {
  if (!Array.isArray(items) || items.length === 0) {
    if (empty) empty.hidden = false;
  } else {
    list.replaceChildren(
      ...items.map((item) => {
        const article = document.createElement("article");
        article.className = "news-card";
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
}
