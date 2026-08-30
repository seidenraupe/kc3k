const nav = document.querySelector(".main-nav");
const toggle = document.querySelector(".nav-toggle");

if (nav && toggle) {
  const label = toggle.querySelector(".visually-hidden");

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    if (label) label.textContent = open ? "Menü schliessen" : "Menü öffnen";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const form = document.querySelector("[data-schnupper-form]");
const status = document.querySelector("[data-form-status]");

if (form instanceof HTMLFormElement && status) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const preferred = String(data.get("preferred") || "").trim();

    if (!name || !email) {
      status.hidden = false;
      status.dataset.state = "error";
      status.textContent = "Bitte Name und E-Mail angeben.";
      return;
    }

    const body = [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : null,
      preferred ? `Bevorzugter Trainingstag: ${preferred}` : null,
      "",
      message || "Ich möchte unverbindlich ein Schnuppertraining besuchen.",
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:info@kc3k.ch?subject=${encodeURIComponent("Schnuppertraining KC3K")}&body=${encodeURIComponent(body)}`;
    status.hidden = false;
    status.dataset.state = "ok";
    status.innerHTML =
      "Danke. Dein E-Mail-Programm öffnet sich mit der Anfrage an <a href=\"mailto:info@kc3k.ch\">info@kc3k.ch</a>. Falls nichts passiert, schreib uns direkt.";
    window.location.href = mailto;
    form.reset();
  });
}

const copyIban = document.querySelector("[data-copy-iban]");
if (copyIban) {
  copyIban.addEventListener("click", async () => {
    const iban = copyIban.getAttribute("data-copy-iban") || "";
    try {
      await navigator.clipboard.writeText(iban);
      copyIban.textContent = "IBAN kopiert";
      window.setTimeout(() => {
        copyIban.textContent = "IBAN kopieren";
      }, 2000);
    } catch {
      copyIban.textContent = iban;
    }
  });
}
