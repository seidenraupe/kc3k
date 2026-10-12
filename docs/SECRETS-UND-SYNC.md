# Secrets, Keys und Sync — von null auf grün

Diese Anleitung richtet sich an **Cursor Desktop → GitHub → Kreativmedia (kc3k.ch)**.  
**GitHub `main` ist die Quelle für Live** — was dort steht, baut der Workflow **Deployment** und rollt per SSH aus.

Cursor Cloud ist **optional**. Wenn du nur am Desktop entwickelst, brauchst du **keine** Cloud-Agent-Secrets und **keinen** Sync-Workflow von Cursor Git.

---

## Zielbild (empfohlen)

```mermaid
flowchart LR
  Desktop["Cursor Desktop\n(lokales Git)"]
  GH["GitHub\nseidenraupe/kc3k\nmain"]
  KM["Kreativmedia\n/kc3k.ch"]
  Desktop -->|"git push\n(GitHub-Login)"| GH
  GH -->|"Actions: Deployment\n(SSH-Secrets)"| KM
```

| Prüfpunkt | URL / Befehl |
| --- | --- |
| GitHub-Commit | `curl -fsSL https://api.github.com/repos/seidenraupe/kc3k/commits/main \| grep sha` |
| Live-Commit | https://kc3k.ch/version.txt |
| Beide gleich? | Kurz-Hash (7 Zeichen) muss übereinstimmen |

---

## Teil A — Nur Desktop → GitHub → Live (Hauptweg)

### A.1 Wo welche Secrets liegen (Übersicht)

| Secret / Key | Plattform | Zweck | Pflicht? |
| --- | --- | --- | --- |
| **GitHub-Login** (SSH-Key oder PAT) | **Dein Mac** (Git / Cursor) | `git push` nach `github.com/seidenraupe/kc3k` | **Ja** |
| **`SSH_HOST`** | **GitHub** → Repo Secrets | Deploy-Zielserver | **Ja** |
| **`SSH_USER`** | GitHub Repo Secrets | Plesk-Systemuser | **Ja** |
| **`SSH_TARGET_DIR`** | GitHub Repo Secrets | Document-Root im Chroot | **Ja** |
| **`SSH_PRIVATE_KEY`** | GitHub Repo Secrets | Privater Deploy-Key | **Ja** |
| **`kc3k-deploy.pub`** | **Plesk** (SSH-Keys bei `giger`) | Öffentlicher Gegenpart | **Ja** |
| `GITHUB_PAT` | Cursor Cloud Environment | Nur Cloud-Agent push | **Nein** (Desktop-Weg) |
| `CURSOR_AGENT_GIT_URL` | GitHub Repo Secrets | Nur Action „Sync from Cursor Agent“ | **Nein** (Desktop-Weg) |

**Nicht verwechseln:**

- **`SSH_PRIVATE_KEY`** (GitHub) = Deploy **zum Hoster** — Datei **`kc3k-deploy`** ohne `.pub`.
- **GitHub PAT** (`ghp_…`) = Push **zu GitHub** — gehört **nicht** in `SSH_PRIVATE_KEY` und **nicht** nach Plesk.
- **`.pub` in Plesk** unter **SSH-Schlüssel**, **nicht** im Passwort-Feld des Systembenutzers.

---

### A.2 GitHub — Repository Secrets (Deploy)

**Ort:** https://github.com/seidenraupe/kc3k/settings/secrets/actions  

**New repository secret** für jeden Namen (exakt schreiben):

| Name | Wert |
| --- | --- |
| `SSH_HOST` | `80.74.151.81` |
| `SSH_USER` | `giger` |
| `SSH_TARGET_DIR` | `/kc3k.ch` |
| `SSH_PRIVATE_KEY` | Kompletter Inhalt von **`kc3k-deploy`** (Private Key), mehrzeilig von `-----BEGIN OPENSSH PRIVATE KEY-----` bis `-----END OPENSSH PRIVATE KEY-----` |

Port **2121** ist im Workflow fest codiert — kein Secret `SSH_PORT`.

**Private Key prüfen (Mac):**

```bash
ssh-keygen -lf kc3k-deploy
ssh-keygen -lf kc3k-deploy.pub
# Fingerabdruck muss bei beiden gleich sein
```

**SSH zum Server prüfen (vor dem nächsten Deploy):**

```bash
ssh -i kc3k-deploy -p 2121 giger@80.74.151.81 "test -d /kc3k.ch && echo ok"
```

Erwartung: `ok`. Bei `Permission denied (publickey)` → `.pub` in Plesk fehlt oder Keypaar passt nicht.

Weitere Details: [HOSTING.md](HOSTING.md), manuelles Deploy: [PLESK-MANUAL-DEPLOY.md](PLESK-MANUAL-DEPLOY.md).

---

### A.3 Plesk / Kreativmedia — SSH-Key (öffentlich)

1. Domain **kc3k.ch**, Systembenutzer **`giger`** (nicht nur FTP-Konto `kc3k`).
2. **SSH-Zugang** aktiv (Chroot-Shell `/bin/bash (chrooted)` ist ok).
3. **SSH-Zugang / Authorized keys** (nicht „Passwort“): eine Zeile aus **`kc3k-deploy.pub`** (`ssh-ed25519 AAAA…`).
4. Private Datei **`kc3k-deploy`** nur auf deinem Rechner und in GitHub Secret **`SSH_PRIVATE_KEY`** — nie auf den Server legen.

---

### A.4 Cursor Desktop — Push nach GitHub

**Ein Remote, ein Ziel:**

```bash
cd /pfad/zum/kc3k
git remote -v
# origin sollte zeigen: git@github.com:seidenraupe/kc3k.git
# oder https://github.com/seidenraupe/kc3k.git
git branch
# main
```

**Option 1 — SSH (empfohlen):**

1. SSH-Key bei GitHub: **Settings → SSH and GPG keys** (persönlicher Key, **nicht** `kc3k-deploy`).
2. Remote: `git@github.com:seidenraupe/kc3k.git`
3. Test: `ssh -T git@github.com`

**Option 2 — HTTPS + PAT:**

1. GitHub → **Settings → Developer settings → Personal access tokens**
2. Scopes: **`repo`** (für Push), bei Workflow-Änderungen zusätzlich **`workflow`**
3. Push: `git push origin main`

**Stand von Desktop nach GitHub nachziehen (normaler Arbeitsablauf):**

```bash
git status
git add -A
git commit -m "Deine Änderung"
git push origin main
```

Push auf **`main`** startet automatisch **Actions → Deployment** (Build, GitHub Pages, Job **kreativmedia**).

**Erfolg:**

- Actions: Job **kreativmedia** grün
- https://kc3k.ch/version.txt = erster Teil von `git rev-parse HEAD` auf GitHub `main`

---

### A.5 Schiefstand bereinigen (Desktop als Master)

Wenn Cursor Cloud, GitHub und Live unterschiedliche Commits zeigen:

1. **Entscheidung:** Gültiger Stand = das, was du lokal auf dem Mac hast (nach Commit).
2. Lokal:

   ```bash
   git fetch origin
   git log -1 --oneline origin/main
   git log -1 --oneline HEAD
   ```

3. Wenn lokal **vorne** ist: `git push origin main` (ggf. vorher `git pull --rebase origin main`).
4. Wenn **GitHub** fälschlich vorne ist und du lokal zurück willst: nur mit Absicht  
   `git fetch origin && git reset --hard origin/main` (überschreibt lokale Änderungen).
5. Live folgt automatisch nach grünem **Deployment** — kein separates Secret für kc3k.ch.

**Cursor Cloud nicht mitschleppen:** Cloud-Repo (`tmp-…` / Agent-Git) muss **nicht** identisch sein, solange du nur Desktop → GitHub pushst.

---

## Teil B — Optional: Cursor Cloud / zweites Git

Nur nötig, wenn du **Cloud Agents** nutzt und Code dort entsteht, **bevor** er auf GitHub landet.

| Secret | Wo | Zweck |
| --- | --- | --- |
| `GITHUB_PAT` | **Cursor** → Cloud Agents → **Environment** → Runtime secrets | Agent soll `git push` nach GitHub (Skript `scripts/push-github-main.sh`) |
| `CURSOR_AGENT_GIT_URL` | **GitHub** Repo Secrets | Action **Sync from Cursor Agent** holt Cursor-Git |

**Häufige Fehler:**

- `GITHUB_PAT` nur unter GitHub Repository Secrets → **Cloud-Agent sieht es nicht**.
- Environment nur für **`kc3k-web`**, Agent checkout **`tmp-…`** → Secret wird **nicht** injiziert → Repos im Environment anpassen.
- Secret mitten in alter Agent-Sitzung gesetzt → **neuer Cloud-Agent-Lauf** nötig.
- **`CURSOR_AGENT_GIT_URL`**: Cursor-Git-URL mit Token, z. B.  
  `https://x-access-token:<TOKEN>@origin.cursor.com/git/thomas-giger/tmp-db38e0d395290f50.git`  
  Token: siehe [Git HTTPS authentication](https://cursor.com/docs/api/origin/reference/git-https-authentication) / `origin auth login` — **kein** GitHub-`ghp_…`.

Test Cloud PAT (neue VM): `./scripts/test-github-pat.sh`  
Test Cursor-URL (Mac): `git ls-remote "<CURSOR_AGENT_GIT_URL>" HEAD`

Mehr: [GITHUB-SYNC.md](GITHUB-SYNC.md).

---

## Teil C — Checkliste „alles grün“

### C.1 Einmalig

- [ ] Keypaar **`kc3k-deploy`** + **`kc3k-deploy.pub`** (ein Paar)
- [ ] **`.pub`** in Plesk bei **`giger`**, Private in GitHub **`SSH_PRIVATE_KEY`**
- [ ] Lokal: `ssh -i kc3k-deploy -p 2121 giger@80.74.151.81 "test -d /kc3k.ch && echo ok"`
- [ ] GitHub vier SSH-Secrets gesetzt
- [ ] Desktop: Push zu `seidenraupe/kc3k` funktioniert (`git push origin main`)

### C.2 Nach jedem Release

- [ ] `git push origin main`
- [ ] GitHub **Deployment** grün (**kreativmedia**)
- [ ] `version.txt` auf https://kc3k.ch = GitHub-`main`
- [ ] Stichprobe: Journal-PDF, keine Drive-Links in https://kc3k.ch/data/news.json

### C.3 Was du ignorieren kannst (Desktop-only)

- [ ] `CURSOR_AGENT_GIT_URL` leer lassen → Action „Sync from Cursor Agent“ nicht nutzen
- [ ] `GITHUB_PAT` im Cloud Environment leer lassen
- [ ] Kein Push in Agent-Git (`tmp-…`), wenn du nur GitHub als Hub nutzt

---

## Teil D — Fehler → Ursache

| Symptom | Wahrscheinliche Ursache |
| --- | --- |
| **kreativmedia** „Schlüssel ungültig“ | `SSH_PRIVATE_KEY` kaputt oder `.pub` statt Private |
| **kreativmedia** Exit **255** | `.pub` fehlt in Plesk / falscher User / Keypaar passt nicht |
| Workflow grün, Live alt | GitHub `main` alt — Push fehlt oder anderer Branch |
| **Sync from Cursor Agent** „Secret fehlt“ | `CURSOR_AGENT_GIT_URL` auf GitHub nicht gesetzt |
| Cloud: `GITHUB_PAT` nicht gesetzt | Falsches Environment, falsches Repo, oder alte Agent-VM |
| `.pub` im Plesk-Passwortfeld | SSH-Key unter **SSH-Zugang** eintragen, Passwort zurücksetzen |

---

## Kurzfassung

1. **Entwickeln:** Cursor Desktop, Remote **`github.com/seidenraupe/kc3k`**, Branch **`main`**.
2. **Veröffentlichen:** `git push origin main`.
3. **Live:** GitHub Actions + **vier SSH-Secrets** + **`.pub` in Plesk**.
4. **Cloud-Secrets** nur, wenn du bewusst Cloud → GitHub syncen willst — sonst weglassen, dann gibt es keinen „dritten“ Schiefstand.
