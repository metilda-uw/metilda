# Contributing to MeTILDA

Thank you for helping build MeTILDA, a web platform for pitch analysis, documentation and
teaching of endangered Indigenous languages (Blackfoot and Aaniiih), led by Prof. Min Chen at the
University of Washington Bothell with partners at the University of Montana.

This guide explains how to set up the project, how work flows from an idea to production, and
the rules that protect the communities whose languages MeTILDA serves. Please read all of it
before your first change.

---

## 1. Ground rules

These rules are not optional.

**Community data (CARE / OCAP principles)**

- Never upload, commit, email or share community recordings, transcripts or annotations
  (Blackfoot or Aaniiih) unless the project lead has told you that this specific use is cleared.
- Never send community data to any third-party or AI service.
- Use test data only (your own voice, synthetic tones, or the sample files in
  `src/metilda/sounds/`) when you work on your computer or on the dev website.

**Secrets**

- Never commit passwords, keys, `.env` files, database addresses or service-account files.
  `.env` is already in `.gitignore`; keep it that way. GitHub secret scanning and push
  protection are switched on for this repository.
- Never paste a secret into an issue, pull request, chat or screenshot. Share variable *names*,
  never values.

**Environments**

- You do not need, and will not receive, access to production or to the dev website's database.
  Work against your own local PostgreSQL database.
- MeTILDA's logins, Firestore and file storage live in **one Firebase project that the live site
  also uses**. When you run MeTILDA locally you sign in to that project, so: use test accounts
  and test files only, never message or share with real users, and delete what you create.

**Branches**

- `master` is production (it deploys metilda.net automatically). Never target it.
- `development` is the integration branch. Every pull request goes into `development`.

---

## 2. Setting up

Follow the **Installation Guide to MeTILDA** (and, on Windows, the **Windows Setup with WSL**
guide); ask the project lead for both. In short:

| Tool | Version |
|---|---|
| Python | 3.12 (see `.python-version`) |
| Node.js | 24 (see the root `package.json`) |
| PostgreSQL | any recent version, **with SSL turned on** (the backend connects with `sslmode=require`) |
| Praat | the command-line program `praat_nogui` (Ubuntu: `sudo apt-get install praat`) |

```bash
# 1. Fork metilda-uw/metilda on GitHub, then clone YOUR fork
git clone https://github.com/<your-github-name>/metilda.git
cd metilda
git remote add upstream https://github.com/metilda-uw/metilda.git

# 2. Backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
createdb metilda_local
psql -d metilda_local -f tests/test_controllers/metilda_schema.sql

# 3. Environment (keep these in a .env file; it is git-ignored)
export FLASK_ENV=development
export DATABASE_URL=postgresql://<user>:<password>@localhost:5432/metilda_local

# 4. Run: backend in one terminal, frontend in another
cd src && python -m metilda.local_server          # http://localhost:5000
cd frontend && npm install && npm start           # http://localhost:3000
```

The local schema file does not yet contain the Feedback tables, so the Feedback page will not
work on a fresh local database.

---

## 3. How work flows

```
Azure Boards item ──> branch from development ──> code + tests ──> pull request into development
        ──> review by the project lead ──> demo at the weekly meeting ──> merge
        ──> later: release from development to master (project lead only)
```

1. **Get a task.** Tasks are assigned on the project's Azure Boards by the project lead after they
   are agreed with Prof. Chen. Do not start work, including your own feature ideas, until the
   task is assigned to you. Feature ideas from the University of Montana team are approved by
   that team first.
2. **One task per branch.** Start every task from the latest `development`:

   ```bash
   git fetch upstream
   git checkout -b <your-name>/<short-task-name> upstream/development
   ```

   Example: `sharu/converter-mel-fix`. Never mix two tasks in one branch.
3. **Write the code and the tests** (sections 4 and 5).
4. **Commit** with a clear message that says what changed and why, for example
   `Converter: use natural log in the Mel formula`. Stage specific files (`git add <file>`),
   never `git add .`.
5. **Push to your fork** and open a **pull request into `metilda-uw/metilda`, branch
   `development`**. Open it as a *draft* until it is ready.
6. **Describe the pull request:** the Azure item, what changed, how you tested it (commands and
   results), and screenshots for anything visible. Mention any test that failed before your
   change too.
7. **Review and demo.** The project lead reviews it. You demonstrate the change at the weekly
   meeting (dev website = before, your computer = after). It is merged after Prof. Chen's
   approval.

Keep your branch up to date with `git fetch upstream && git rebase upstream/development` before
asking for review.

---

## 4. Code conventions

**General**

- Read the surrounding code first and reuse its patterns.
- Do not add new dependencies (npm or pip) without agreeing it with the project lead first.
- Never break existing features. Check the pages your change touches, not only the new feature.

**Frontend** (React 18 + TypeScript)

- Styles live in **`.scss`** files. The `.css` files next to them are generated and git-ignored;
  editing them has no effect.
- The Pitch Art is drawn with **react-konva**; do not draw it with HTML, CSS or SVG.
- Buttons use the global button color `#00796b` (defined in `frontend/src/App.scss`).
- New user interface must meet **WCAG 2.1 AA** (labels, keyboard use, contrast). Check with
  Lighthouse.
- When a page calls a backend route that requires a login, send the user's token:

  ```ts
  import { authHeaders } from "../Firebase/authHeaders";
  const headers = await authHeaders(this.props.firebase);
  ```

**Backend** (Python 3.12 + Flask)

- Any new route that reads private data or changes data must check who is calling. Use the
  helpers in `src/metilda/controllers/login_checks.py`:
  `@admin_required`, `@self_or_admin_required('user_id')`, or `get_caller_email()` for
  "any signed-in user". Add a test that a call without a login is refused (see
  `tests/test_controllers/test_login_checks.py`).
- `Postgres.execute_*_query` returns `None` when a statement fails. Check for `None` and answer
  an error status; otherwise a failure looks like success to the user.
- Use query parameters (`%s`), never string concatenation, for values in SQL.

---

## 5. Tests

Run the tests before you open a pull request, and add tests for what you change. A good test
fails on the old code and passes on yours.

```bash
# Backend
cd src && python -m pytest -vv ../tests

# Frontend (also runs tslint and builds the SCSS)
cd frontend && CI=true npm test
```

Some frontend test suites already fail on `development`. Run the tests on `development` first,
note the failing suites, and make sure your change adds no new failures.

---

## 6. Things to avoid

- Pull requests into `master`, and merging Dependabot pull requests.
- Force-pushing to shared branches, and deleting branches you did not create.
- Using production or the dev website for experiments, or creating test data with real names.
- Editing generated `.css` files.
- Large unrelated changes (formatting a whole file, renaming many things) inside a feature
  pull request.

---

## 7. Getting help

Ask the project lead (currently the graduate research assistant who maintains MeTILDA) through
the team's usual channel, or raise it at the weekly meeting. If you think you have exposed a
secret or community data, stop and tell the project lead immediately; do not try to clean it up
alone.
