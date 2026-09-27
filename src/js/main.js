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

const anfrageForm = document.querySelector("[data-anfrage-form]");

function anfrageType(form) {
  const selected = form.querySelector('input[name="type"]:checked');
  return selected instanceof HTMLInputElement ? selected.value : "schnupper";
}

function setAnfrageMode(form) {
  const schnupperBlock = form.querySelector("[data-anfrage-schnupper]");
  const message = form.querySelector("[data-anfrage-message]");
  const isSchnupper = anfrageType(form) === "schnupper";

  if (schnupperBlock instanceof HTMLElement) {
    schnupperBlock.hidden = !isSchnupper;
  }
  for (const el of form.querySelectorAll("[data-anfrage-schnupper] [name]")) {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) continue;
    if (isSchnupper) {
      if (el.name === "participant" || el.name === "age") el.setAttribute("required", "");
    } else {
      el.removeAttribute("required");
    }
  }
  if (message instanceof HTMLTextAreaElement) {
    message.placeholder = isSchnupper
      ? "Vorerfahrung, Fragen zum ersten Training"
      : "Adresse für Rechnung, Fragen oder Hinweis zu einer freiwilligen Spende";
  }
}

function buildAnfrageMail(data) {
  const type = String(data.get("type") || "schnupper");
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (type === "goenner") {
    return {
      subject: "Gönner-Mitgliedschaft KC3K",
      body: [
        "Anfrage: Gönner-Mitgliedschaft (Fr. 100.– / Jahr)",
        "",
        `Name: ${name}`,
        `E-Mail: ${email}`,
        phone ? `Telefon: ${phone}` : null,
        "",
        message || "Ich möchte Gönner beim Karate-Club 3K werden.",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

  const participant = String(data.get("participant") || "").trim();
  const age = String(data.get("age") || "").trim();
  const preferred = String(data.get("preferred") || "").trim();

  return {
    subject: "Schnuppertraining KC3K",
    body: [
      "Anfrage: Schnuppertraining",
      "",
      `Name (Kontakt): ${name}`,
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : null,
      participant ? `Für wen: ${participant}` : null,
      age ? `Alter: ${age} Jahre` : null,
      preferred ? `Bevorzugter Trainingstag: ${preferred}` : null,
      "",
      message || "Ich möchte unverbindlich ein Schnuppertraining besuchen.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function validateAnfrageClient(form, data) {
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  if (!name || !email) {
    return "Bitte Name und E-Mail angeben.";
  }
  if (anfrageType(form) === "schnupper") {
    const participant = String(data.get("participant") || "").trim();
    const ageRaw = String(data.get("age") || "").trim();
    if (!participant) return "Bitte angeben, für wen das Schnuppertraining ist.";
    if (!ageRaw) return "Bitte das Alter in Jahren angeben.";
    const age = Number(ageRaw);
    if (!Number.isFinite(age) || age < 6) {
      return "Das Mindestalter für das Training beträgt 6 Jahre.";
    }
  }
  return null;
}

function showMailtoFallback(form, { subject, body }) {
  const status = form.querySelector("[data-form-status]");
  const mailtoPanel = form.querySelector("[data-form-mailto]");
  const copyField = form.querySelector("[data-form-copy]");
  const mailtoLink = form.querySelector("[data-form-mailto-link]");
  const mailto = `mailto:info@kc3k.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (status instanceof HTMLElement) {
    status.hidden = false;
    status.dataset.state = "ok";
    status.innerHTML =
      "Versand über die Website war nicht möglich. Nutze dein Mailprogramm oder kopiere den Text unten.";
  }
  if (copyField instanceof HTMLTextAreaElement) {
    copyField.value = body;
  }
  if (mailtoLink instanceof HTMLAnchorElement) {
    mailtoLink.href = mailto;
  }
  if (mailtoPanel instanceof HTMLElement) {
    mailtoPanel.hidden = false;
  }
  window.location.href = mailto;
}

if (anfrageForm instanceof HTMLFormElement) {
  const status = anfrageForm.querySelector("[data-form-status]");
  const mailtoPanel = anfrageForm.querySelector("[data-form-mailto]");
  const copyBtn = anfrageForm.querySelector("[data-form-copy-btn]");
  const copyField = anfrageForm.querySelector("[data-form-copy]");

  anfrageForm.querySelectorAll('input[name="type"]').forEach((input) => {
    input.addEventListener("change", () => setAnfrageMode(anfrageForm));
  });
  setAnfrageMode(anfrageForm);

  if (location.hash === "#goenner") {
    const goenner = anfrageForm.querySelector('input[name="type"][value="goenner"]');
    if (goenner instanceof HTMLInputElement) {
      goenner.checked = true;
      setAnfrageMode(anfrageForm);
    }
  }

  copyBtn?.addEventListener("click", async () => {
    if (!(copyField instanceof HTMLTextAreaElement)) return;
    try {
      await navigator.clipboard.writeText(copyField.value);
      if (copyBtn instanceof HTMLButtonElement) copyBtn.textContent = "Kopiert";
      window.setTimeout(() => {
        if (copyBtn instanceof HTMLButtonElement) copyBtn.textContent = "Text kopieren";
      }, 2000);
    } catch {
      copyField.focus();
      copyField.select();
    }
  });

  anfrageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(anfrageForm);
    const clientError = validateAnfrageClient(anfrageForm, data);
    if (clientError && status instanceof HTMLElement) {
      status.hidden = false;
      status.dataset.state = "error";
      status.textContent = clientError;
      if (mailtoPanel instanceof HTMLElement) mailtoPanel.hidden = true;
      return;
    }

    if (status instanceof HTMLElement) {
      status.hidden = true;
      status.textContent = "";
    }
    if (mailtoPanel instanceof HTMLElement) mailtoPanel.hidden = true;

    try {
      const response = await fetch("./anfrage/send.php", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload && payload.ok) {
        if (status instanceof HTMLElement) {
          status.hidden = false;
          status.dataset.state = "ok";
          status.innerHTML =
            "Danke — deine Anfrage ist bei uns eingegangen. Wir melden uns an <a href=\"mailto:info@kc3k.ch\">info@kc3k.ch</a>.";
        }
        anfrageForm.reset();
        const schnupper = anfrageForm.querySelector('input[name="type"][value="schnupper"]');
        if (schnupper instanceof HTMLInputElement) schnupper.checked = true;
        setAnfrageMode(anfrageForm);
        return;
      }
      const serverMsg =
        payload && typeof payload.error === "string" ? payload.error : null;
      if (serverMsg && status instanceof HTMLElement) {
        status.hidden = false;
        status.dataset.state = "error";
        status.textContent = serverMsg;
        return;
      }
    } catch {
      /* Mailto-Fallback */
    }

    const mail = buildAnfrageMail(data);
    showMailtoFallback(anfrageForm, mail);
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
