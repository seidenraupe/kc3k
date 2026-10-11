# GitHub-Repository `seidenraupe/kc3k` synchronisieren

Der Deployment-Workflow auf GitHub baut **nur den Stand von `main` auf github.com/seidenraupe/kc3k**.

Wenn der Cloud-Agent (Cursor) weiter ist als GitHub, ist der Workflow trotzdem **grün** — es wird dann ein **älterer Commit** ausgerollt (z. B. `80e2f47`). Symptome auf kc3k.ch:

- News-Seite lädt noch `news-CHcbKTKs.js` (altes Bundle mit Laufzeit-`news.json`)
- Nr. 92+ verlinken auf Google Drive
- PDF unter `/documents/news/3k-news-nr-93-…` liefert **404**

## Einmalig: Agent-Stand nach GitHub holen

Im lokalen Klon von **https://github.com/seidenraupe/kc3k**:

```bash
git remote add cursor-agent https://origin.cursor.com/git/thomas-giger/tmp-db38e0d395290f50.git
git fetch cursor-agent main
git merge cursor-agent/main   # oder: git reset --hard cursor-agent/main
git push origin main
```

**Stand zum Sync (Agent → GitHub):** Commits `7585b9b` (SSH-Secret-Hinweis), `47c6886` / `958ce83` (Cloud Environment `start`), `45c7c76` (Doku), ggf. neuer auf Agent-`main`.

### Variante A — lokal (empfohlen)

Im Klon von **https://github.com/seidenraupe/kc3k**:

```bash
git remote add cursor-agent https://origin.cursor.com/git/thomas-giger/tmp-db38e0d395290f50.git
git fetch cursor-agent main
git merge --ff-only cursor-agent/main
git push origin main
```

(Für `fetch` ggf. Cursor-Git-Zugangsdaten verwenden.)

### Variante B — GitHub Action (nach einmaligem Einspielen dieser Workflow-Datei)

1. Secret **`CURSOR_AGENT_GIT_URL`**: Cursor-Git-URL inkl. Token (Lesezugriff auf das Agent-Repo).
2. **Actions → Sync from Cursor Agent → Run workflow**
3. Anschließend läuft bei Push auf `main` automatisch **Deployment**.

Danach in GitHub **Actions → Deployment → Run workflow** (Branch `main`), falls kein Push-Deploy ausgelöst wurde.

## Erfolg prüfen

- https://kc3k.ch/version.txt — muss zum Commit des Laufs passen (z. B. `cc37a02`)
- https://kc3k.ch/data/news.json — **keine** `drive.google.com`-URLs
- https://kc3k.ch/documents/news/3k-news-nr-93-2026-09-29.pdf — **HTTP 200**
- https://kc3k.ch/news.html — Klick auf Nr. 92 öffnet die PDF auf kc3k.ch

Der Job **kreativmedia** prüft per SSH, ob `deploy-stamp.txt`, `version.txt` und mindestens 9 PDFs **auf dem Server** liegen, und vergleicht das `news.html`-Bundle mit dem Build. Schlägt das fehl, landet nichts im Plesk-Ordner — siehe [PLESK-MANUAL-DEPLOY.md](PLESK-MANUAL-DEPLOY.md).

Wenn der Workflow bei dir **grün** bleibt, obwohl Plesk unverändert ist: du deployest vermutlich noch einen **alten Commit** (ohne diese Checks) — `main` muss zuerst synchronisiert werden.
