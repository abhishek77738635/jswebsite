# Packaged bulk interview questions

- **`full-bulk-interview.json`** — 199 curated output-guess questions (`id` fields in JSON are informational only; the import assigns new sequential `id` values in Firestore).
- **Import (admin UI):** open **Admin** while signed in as the admin user and click **Import bulk pack** (calls `POST /api/seed/merge-packaged-bulk` with your Firebase ID token).
- **Import (API):** same endpoint; send `Authorization: Bearer <ID token>`. Optional body: `{ "skipDuplicateTitles": true, "upsertCategories": true }` (defaults both to `true`).
- **Custom JSON:** `POST /api/seed/merge-questions-array` with `{ "questions": [ { "title", "difficulty", "isPremium", "companies", "category", "code", "question", "answer", "explanation", "tags" }, ... ] }`.

Duplicate titles (case-insensitive, trimmed) are skipped so you can run the import more than once safely.

## What the optional body fields mean (`merge-packaged-bulk`)

| Field | Default | Effect |
|--------|---------|--------|
| **`skipDuplicateTitles`** | `true` | Skip a row when its trimmed lower-case **`title`** already exists in Firestore (or already accepted in this run). Keeps repeats out if you run import again. |
| **`upsertCategories`** | `true` | Ensures **`categories`** in Firestore has a document for each distinct **`category`** string on imported questions (creates **`name`** + short **`description`** if missing). |

**Values from JSON → Firestore:** Each object is normalized to `title`, `difficulty` (must be Beginner | Intermediate | Advanced | Expert — otherwise stored as Intermediate), `isPremium`, `companies` (array of strings), `category`, `code`, `question`, `answer`, `explanation`, `tags`. The **`id`** in **`full-bulk-interview.json` is discarded**; the API assigns **`id` = max existing id + 1** per row.
