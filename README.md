# KEPAS CV Builder

> Free CV / resume builder with a clean A4 layout, shareable links, and PDF export. Self-hostable, no sign-up. Built by [KEPAS Technologies](https://kepas.co.ke).

Live at **[kepas.co.ke/tools/cv-builder](https://kepas.co.ke/tools/cv-builder)**.

## What it does

- **Single-page editor** — fill in your details, see the CV update live.
- **Shareable links** — every CV gets a `share_code`; share it like a Google Doc.
- **PDF export** — print or save as PDF straight from the browser.
- **No sign-up, no tracking, no ads** — built for students and job-seekers.

## Stack

| Layer | Tech |
| --- | --- |
| Backend | Node.js · Express · Nunjucks templating |
| Storage | PostgreSQL · `cv_documents` table (JSONB payload + base64 photo) |
| Frontend | Vanilla HTML/CSS/JS (single file, no build step) |
| Deploy | Docker Compose (one-command setup) |

No frontend bundler, no SPA framework. The editor is a single
self-contained HTML page that talks to a tiny REST API.

## Quick start

```bash
git clone https://github.com/nellylemmy/kepas-cv-builder.git
cd kepas-cv-builder

cp .env.example .env
docker compose up
```

Browse to `http://localhost:4100/cv-builder`. Migrations run automatically on first boot.

## API

The Express server exposes four endpoints under `/api/cv`:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/cv` | Create a new CV. Returns `{ shareCode }`. |
| GET | `/api/cv/:shareCode` | Load a saved CV by share code. |
| PUT | `/api/cv/:shareCode` | Update an existing CV. |
| DELETE | `/api/cv/:shareCode` | Delete the CV. |

When deployed behind a reverse proxy at a sub-path (the KEPAS setup
serves it at `/tools/cv-builder/api/cv`), set `BASE_PATH` and `API_PATH`
in the environment so the rendered HTML emits the correct fetch URLs.

## Schema

```sql
CREATE TABLE cv_documents (
    id          SERIAL PRIMARY KEY,
    share_code  VARCHAR(12) UNIQUE NOT NULL,
    cv_data     JSONB NOT NULL DEFAULT '{}',
    photo_data  TEXT,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

That's it. One table.

## License

MIT — see [LICENSE](./LICENSE).

## Author

Built by **Nelson Lemein** at [KEPAS Technologies](https://kepas.co.ke), Nairobi, Kenya.
