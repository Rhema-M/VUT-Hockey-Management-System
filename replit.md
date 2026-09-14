# VUT Hockey

Portable university hockey club website and management system using Vanilla HTML/CSS/JavaScript, Python Flask, and MySQL.

## Run & Operate

- `cd vut-hockey/backend && python app.py` — run the Flask app on port 5000
- `cd vut-hockey/backend && python -m compileall -q .` — check Python syntax
- `for f in vut-hockey/js/*.js; do node --check "$f"; done` — check browser JavaScript syntax
- Configure `vut-hockey/backend/.env` from `vut-hockey/backend/.env.example` before using data endpoints

## Stack

- Frontend: semantic HTML, CSS, and modern browser JavaScript
- Backend: Flask REST API with CORS, JWT, Werkzeug password hashing, and validation
- Database: MySQL through `mysql-connector-python`
- Uploads: validated JPG, JPEG, PNG, and WebP files under `vut-hockey/backend/uploads/`

## Where things live

- `vut-hockey/*.html` — public pages
- `vut-hockey/admin/*.html` — protected admin pages
- `vut-hockey/css/` — public and admin styles
- `vut-hockey/js/` — centralized API client and page modules
- `vut-hockey/backend/app.py` — Flask routes and resource CRUD
- `vut-hockey/backend/database.py` — environment-based MySQL access
- `vut-hockey/backend/middleware/auth.py` — JWT creation and admin protection
- `vut-hockey/backend/utils/validators.py` — request and upload validation
- `vut-hockey/database/schema.sql` — MySQL schema
- `vut-hockey/database/seed.sql` — administrator, teams, and settings setup

## Architecture decisions

- MySQL remains the required datastore; the app does not substitute Replit Postgres or browser storage.
- Public content is API-driven and uses explicit empty/error states when no confirmed data exists.
- Admin sessions use bearer JWTs in `sessionStorage`; passwords are stored only as Werkzeug hashes.
- Uploads are stored as generated filenames on disk and only their paths are stored in MySQL.

## Product

VUT Hockey can publish confirmed club teams, players, fixtures, results, news, gallery content, contact messages, and basic website settings through a protected admin area.

## Gotchas

- The MySQL database must be configured before `/api` data endpoints can return records.
- Replace the placeholder password hash in `database/seed.sql` before running the seed script.
- Never commit `.env`, uploaded private files, or real credentials.

## Pointers

- The portable developer setup is documented in `vut-hockey/README.md`.
