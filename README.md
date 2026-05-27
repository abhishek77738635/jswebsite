# JS Interview Prep

React app + Express API for JavaScript interview questions (Firebase, Cashfree).

```
client/      React UI
server/      Express API
.env         All secrets and config (gitignored — copy from .env.example)
```

## Personal GitHub (this folder only)

Open **`js-website`** as the workspace root in Cursor (File → Open Folder). Git will only track this project, not your whole Desktop.

**One-time setup:**

```bash
./scripts/setup-personal-github.sh
```

That script sets your **name/email only for this repo** and adds `origin` to your personal GitHub repo.

**Every time you change code:**

```bash
git add -A
git status    # .env and serviceAccountKey.json must NOT appear
git commit -m "Describe your change"
git push
```

Or use Cursor’s **Source Control** panel (branch icon) when this folder is open.

Create the empty repo first: [github.com/new](https://github.com/new) → name e.g. `js-website` → no README/license.

---

## Upload to GitHub (drag and drop)

GitHub cannot accept `node_modules` or secrets. Keep uploads small (~1–2 MB of source).

**Never upload** (already in `.gitignore`):

- `node_modules/` in any folder
- `.env`
- `server/serviceAccountKey.json`
- `client/build/`

**Steps**

1. Create a repo at [github.com/new](https://github.com/new).
2. Either drag the project folder (without the items above), or run:
   ```bash
   chmod +x scripts/prepare-github-upload.sh
   ./scripts/prepare-github-upload.sh
   ```
   Upload `js-website-upload.zip` from your Desktop.
3. Copy the env template locally only:
   ```bash
   cp .env.example .env
   ```

> Using `git push` is safer than drag-and-drop because `.gitignore` is applied automatically.

## Deploy on Vercel (recommended)

One Vercel project serves the React build and `/api/*` routes from the same domain.

1. Import your GitHub repo on [vercel.com](https://vercel.com).
2. Leave **Root Directory** empty (repo root). `vercel.json` sets build and API routes.
3. Add **Environment variables** in the Vercel dashboard (same names as in `.env.example`):

   | Variable | Example |
   |----------|---------|
   | `REACT_APP_API_URL` | `/api` |
   | `REACT_APP_FIREBASE_*` | From Firebase console |
   | `REACT_APP_CASHFREE_ENV` | `sandbox` or `production` |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service account JSON (one line) |
   | `CASHFREE_CLIENT_ID` | From Cashfree dashboard |
   | `CASHFREE_CLIENT_SECRET` | From Cashfree dashboard |
   | `CASHFREE_ENVIRONMENT` | `sandbox` |

4. Deploy. Your site will be `https://your-project.vercel.app` and the API at `https://your-project.vercel.app/api/...`.

**Optional:** Host only the API on [Render](https://render.com) using `render.yaml` (set `REACT_APP_API_URL` to that URL in Vercel).

## Local development

```bash
npm install          # one shared node_modules at repo root

cp .env.example .env
# Fill .env and add server/serviceAccountKey.json
```

Terminal 1 — API (reads root `.env`):

```bash
npm run dev:server
```

Terminal 2 — React (reads root `.env` via `dotenv-cli`):

```bash
npm run dev:client
```

- App: http://localhost:3000  
- API: http://localhost:5000  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies (single root `node_modules`) |
| `npm run dev:client` | React dev server |
| `npm run dev:server` | API with nodemon |
| `npm run build:client` | Production React build |
