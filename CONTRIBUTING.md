# Contributing to MeTILDA

MeTILDA is a web platform for the analysis, documentation and teaching of endangered Indigenous
languages, developed at the University of Washington Bothell under the direction of Prof. Min
Chen.

This document describes how to set up the project, how changes move from an assigned task to
production, and the standards every contribution must meet. All contributors are expected to
read it in full before submitting their first change.

---

## Contents

1. [Ground rules](#1-ground-rules)
2. [Development setup](#2-development-setup)
3. [Workflow](#3-workflow)
4. [Coding standards](#4-coding-standards)
5. [Testing](#5-testing)
6. [Prohibited practices](#6-prohibited-practices)
7. [Support](#7-support)

---

## 1. Ground rules

The following rules are mandatory and apply to every contribution.

### 1.1 Community data

MeTILDA works with language data that belongs to Indigenous communities and is governed by the
CARE and OCAP principles of Indigenous data sovereignty.

- Do not upload, commit, email or otherwise share community recordings, transcripts or
  annotations unless the project lead has confirmed that the specific use is authorized.
- Do not submit community data to any third-party or AI service.
- Use only non-community test data during development: synthetic audio or recordings of your own
  voice.

### 1.2 Secrets

- Do not commit credentials of any kind: passwords, API keys, database connection strings,
  service-account files or `.env` files. `.env` is excluded by `.gitignore` and must remain so.
  Secret scanning and push protection are enabled on this repository.
- Do not include secrets in issues, pull requests, messages or screenshots. Refer to
  configuration variables by name only.

### 1.3 Environments

- Contributors do not receive access to production or to the shared development database. All
  development is done against a local PostgreSQL database.
- Authentication, Firestore and file storage are provided by a Firebase project that is shared
  with the live platform. When running MeTILDA locally, use dedicated test accounts and test
  files only, do not message or share content with real users, and remove any test data you
  create.

### 1.4 Branches

| Branch | Purpose |
|---|---|
| `master` | Production. Every merge deploys automatically. Contributors never target this branch. |
| `development` | Integration branch. All pull requests target this branch. |

---

## 2. Development setup

Detailed instructions are provided in the *Installation Guide to MeTILDA* and, for Windows, the
*Windows Setup with WSL* guide. Both are available from the project lead.

### 2.1 Requirements

| Component | Version |
|---|---|
| Python | 3.12 (see `.python-version`) |
| Node.js | 24 (see the root `package.json`) |
| PostgreSQL | Any current release, with SSL enabled (the backend connects with `sslmode=require`) |
| Praat | Command-line program `praat_nogui` (Ubuntu: `sudo apt-get install praat`) |

### 2.2 Quick start

```bash
# Fork metilda-uw/metilda on GitHub, then clone your fork
git clone https://github.com/<your-github-username>/metilda.git
cd metilda
git remote add upstream https://github.com/metilda-uw/metilda.git

# Backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Local database
createdb metilda_local
psql -d metilda_local -f tests/test_controllers/metilda_schema.sql

# Environment variables (store them in a local .env file)
export FLASK_ENV=development
export DATABASE_URL=postgresql://<user>:<password>@localhost:5432/metilda_local

# Run the backend and the frontend in separate terminals
cd src && python -m metilda.local_server          # http://localhost:5000
cd frontend && npm install && npm start           # http://localhost:3000
```

> **Note:** The local schema file does not yet include the Feedback tables. The Feedback page is
> therefore unavailable on a newly created local database.

---

## 3. Workflow

```
Assigned task ─► feature branch from development ─► implementation and tests
   ─► pull request into development ─► review ─► demonstration ─► merge
   ─► release from development to master (project lead only)
```

1. **Task assignment.** Work items are tracked on Azure Boards and assigned by the project lead.
   Begin work only on items assigned to you. Proposals for new features must be approved before
   any implementation starts.
2. **Branching.** Create one branch per task from the latest `development`, named
   `<your-name>/<short-description>`:

   ```bash
   git fetch upstream
   git checkout -b <your-name>/<short-description> upstream/development
   ```

   Example: `jdoe/converter-mel-formula`. A branch must not contain more than one task.
3. **Implementation.** Follow the coding and testing standards in sections 4 and 5.
4. **Commits.** Write concise, descriptive commit messages that state what changed and why, for
   example `Converter: correct the Mel formula`. Stage files individually (`git add <file>`);
   do not use `git add .` or `git add -A`.
5. **Pull request.** Push the branch to your fork and open a pull request against
   `metilda-uw/metilda`, branch `development`. Open it as a draft until it is ready for review.
6. **Description.** Every pull request must reference its work item and state what changed, how
   it was tested (commands and results), and any pre-existing test failures. Include screenshots
   for user-interface changes.
7. **Review and demonstration.** The project lead reviews the pull request. The contributor then
   demonstrates the change at the weekly project meeting. Changes are merged only after approval.

Before requesting review, rebase onto the latest `development`:

```bash
git fetch upstream
git rebase upstream/development
```

---

## 4. Coding standards

### 4.1 General

- Read the relevant code before changing it, and follow its existing patterns.
- Do not introduce new npm or pip dependencies without prior agreement from the project lead.
- Changes must not break existing functionality. Verify every page affected by your change, not
  only the new feature.

### 4.2 Frontend (React 18, TypeScript)

- Write styles in `.scss` files. The neighbouring `.css` files are generated build artifacts,
  excluded from version control; changes to them have no effect.
- The Pitch Art is rendered with **react-konva**. Do not render it with HTML, CSS or SVG.
- Use the global button color `#00796b`, defined in `frontend/src/App.scss`.
- New user-interface elements must conform to **WCAG 2.1 Level AA** (labels, keyboard operation,
  contrast). Verify with Lighthouse.
- Requests to backend routes that require authentication must include the user's ID token:

  ```ts
  import { authHeaders } from "../Firebase/authHeaders";

  const headers = await authHeaders(this.props.firebase);
  ```

### 4.3 Backend (Python 3.12, Flask)

- Every new route that reads private data or modifies data must verify the caller, using the
  helpers in `src/metilda/controllers/login_checks.py`:

  | Helper | Permits |
  |---|---|
  | `@admin_required` | Signed-in users with a verified Admin role |
  | `@self_or_admin_required('user_id')` | The account owner, or an Admin |
  | `get_caller_email()` | Any signed-in user (returns `None` otherwise) |

  Add a test confirming that unauthenticated requests are refused (see
  `tests/test_controllers/test_login_checks.py`).
- `Postgres.execute_*_query` returns `None` when a statement fails. Check for `None` and return an
  appropriate error status, so that failures are not reported to the user as success.
- Pass values to SQL as query parameters (`%s`). Never build SQL by string concatenation.

---

## 5. Testing

Run the test suites before opening a pull request, and add tests for the behaviour you change. A
test should fail on the previous code and pass on yours.

```bash
# Backend
cd src && python -m pytest -vv ../tests

# Frontend (includes tslint and the SCSS build)
cd frontend && CI=true npm test
```

Some frontend test suites currently fail on `development`. Run the suites on `development` before
starting, record the existing failures, and confirm that your change introduces no new ones.

---

## 6. Prohibited practices

- Opening pull requests against `master`, or merging Dependabot pull requests.
- Force-pushing to shared branches, or deleting branches you did not create.
- Using production or the shared development environment for experiments, or creating test data
  that contains real personal information.
- Editing generated `.css` files.
- Including unrelated changes, such as reformatting entire files or broad renaming, in a feature
  pull request.

---

## 7. Support

Direct questions to the project lead through the team's communication channel, or raise them at
the weekly project meeting.

If you believe that a secret or community data has been exposed, stop work and notify the project
lead immediately. Do not attempt to remediate the exposure on your own.
