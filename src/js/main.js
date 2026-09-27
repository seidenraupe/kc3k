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

const ANFRAGE_SEND_ERROR =
  'Der Versand hat leider nicht geklappt. Bitte schreib uns direkt an <a href="mailto:info@kc3k.ch">info@kc3k.ch</a> — deine Eingaben bleiben im Formular erhalten.';

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

function showAnfrageError(form, messageHtml) {
  const status = form.querySelector("[data-form-status]");
  if (!(status instanceof HTMLElement)) return;
  status.hidden = false;
  status.dataset.state = "error";
  status.innerHTML = messageHtml;
}

if (anfrageForm instanceof HTMLFormElement) {
  const status = anfrageForm.querySelector("[data-form-status]");
  const submitBtn = anfrageForm.querySelector("[data-anfrage-submit]");

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

  anfrageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitBtn instanceof HTMLButtonElement && submitBtn.disabled) return;

    const data = new FormData(anfrageForm);
    const clientError = validateAnfrageClient(anfrageForm, data);
    if (clientError) {
      showAnfrageError(anfrageForm, clientError);
      return;
    }

    if (status instanceof HTMLElement) {
      status.hidden = true;
      status.textContent = "";
    }
    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Wird gesendet …";
    }

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
      if (serverMsg) {
        showAnfrageError(anfrageForm, serverMsg);
        return;
      }
      showAnfrageError(anfrageForm, ANFRAGE_SEND_ERROR);
    } catch {
      showAnfrageError(anfrageForm, ANFRAGE_SEND_ERROR);
    } finally {
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Anfrage senden";
      }
    }
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
