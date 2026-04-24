# Email Screener

AI-assisted inbox triage built as a split Rails API and Next.js frontend. The current production scope is Gmail-only sync, AI summaries and reply suggestions, task extraction and tracking, and simple inbox rules.

## Stack

- Backend: Rails 8 API, PostgreSQL, Solid Queue
- Frontend: Next.js App Router, React, Tailwind CSS
- Auth: Google OAuth with Rails session cookies
- AI: OpenAI by default, with Anthropic and Ollama provider hooks in the service layer

## Local Setup

### Prerequisites

- Ruby `3.2.0`
- Node `20+`
- PostgreSQL `14+`

### Install dependencies

```bash
git clone git@github.com:BandanaPandey/email-screener.git
cd email-screener

cd backend
cp .env.example .env
bundle install

cd ../frontend
cp .env.example .env.local
npm install
```

### Configure environment variables

Backend values live in [backend/.env.example](/Users/Bandana/work/email-screener/backend/.env.example).

Required backend values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FRONTEND_APP_URL`
- `FRONTEND_APP_ORIGINS`
- `AI_PROVIDER`
- `OPENAI_API_KEY` when `AI_PROVIDER=openai`

Frontend values live in [frontend/.env.example](/Users/Bandana/work/email-screener/frontend/.env.example).

Required frontend values:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_URL`

### Prepare databases

```bash
cd backend
bundle exec rails db:prepare
```

This prepares the primary Rails database plus the Solid Queue, cache, and cable databases.

### Run the app

Backend API:

```bash
cd backend
bundle exec rails server
```

Background jobs:

```bash
cd backend
bundle exec bin/jobs
```

Frontend:

```bash
cd frontend
npm run dev
```

Local URLs:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Verification And Test Commands

Backend bootstrap:

```bash
cd backend
bundle exec bin/setup --skip-server
```

Backend suite:

```bash
cd backend
bundle exec rails test
```

Frontend component and API tests:

```bash
cd frontend
npm run test:run
```

Frontend end-to-end tests:

```bash
cd frontend
npm run test:e2e
```

Frontend lint and build:

```bash
cd frontend
npm run lint
npm run build
```

## Implemented Product Endpoints

- `GET /health`
- `GET /session`
- `GET /emails`
- `POST /sync_emails`
- `GET /tasks`
- `PATCH /tasks/:id`
- `GET /rules`
- `POST /rules`
- `DELETE /rules/:id`
- `POST /ai/reply`
- `POST /ai/summarize`
- `POST /ai/extract_tasks`

## CI And Required Checks

GitHub Actions workflows now live in:

- [.github/workflows/backend.yml](/Users/Bandana/work/email-screener/.github/workflows/backend.yml)
- [.github/workflows/frontend.yml](/Users/Bandana/work/email-screener/.github/workflows/frontend.yml)

Expected required checks for branch protection:

- `Backend CI`
- `Frontend CI`

Recommended repository settings:

1. Require a pull request before merging to protected branches.
2. Require the `Backend CI` and `Frontend CI` checks to pass before merge.
3. Disable force-pushes to `main`.
4. Restrict direct pushes to `main` once rollout work is complete.

## Deployment Guide

The deployment target remains a split architecture:

- Next.js frontend deployed separately from the Rails API
- Rails API containerized and deployed with Kamal
- PostgreSQL for the primary, cache, queue, and cable databases
- Solid Queue worker process deployed alongside the Rails API

### Backend production environment

Production-sensitive backend variables:

- `BACKEND_APP_HOST`
- `BACKEND_APP_PROTOCOL`
- `BACKEND_ALLOWED_HOSTS`
- `FRONTEND_APP_URL`
- `FRONTEND_APP_ORIGINS`
- `SESSION_COOKIE_SAME_SITE`
- `SESSION_COOKIE_SECURE`
- `ASSUME_SSL`
- `FORCE_SSL`
- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BACKEND_DATABASE_PASSWORD`

Recommended production defaults for a split frontend/backend deployment:

- `SESSION_COOKIE_SAME_SITE=none`
- `SESSION_COOKIE_SECURE=true`
- `ASSUME_SSL=true`
- `FORCE_SSL=true`
- `FRONTEND_APP_URL=https://app.example.com`
- `FRONTEND_APP_ORIGINS=https://app.example.com`
- `BACKEND_APP_HOST=api.example.com`
- `BACKEND_ALLOWED_HOSTS=api.example.com`

### Kamal deployment

Backend deployment config lives in [backend/config/deploy.yml](/Users/Bandana/work/email-screener/backend/config/deploy.yml).

Before deploying:

1. Set the real registry values:
   - `KAMAL_IMAGE`
   - `KAMAL_REGISTRY_SERVER`
   - `KAMAL_REGISTRY_USERNAME`
   - `KAMAL_REGISTRY_PASSWORD`
2. Set the target hosts:
   - `KAMAL_WEB_HOST`
   - `KAMAL_JOB_HOST`
3. Set the production app URLs and cookie/SSL env vars listed above.
4. Provide secrets through `.kamal/secrets` or the deploy environment:
   - `RAILS_MASTER_KEY`
   - `BACKEND_DATABASE_PASSWORD`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` when used

Example deploy flow:

```bash
cd backend
bundle exec kamal setup
bundle exec kamal deploy
```

### Production config hardening already wired

The Rails production environment now supports env-driven:

- SSL enforcement
- proxy SSL assumption
- allowed hosts
- mailer host/protocol defaults
- split-origin session cookie settings

Key files:

- [backend/config/environments/production.rb](/Users/Bandana/work/email-screener/backend/config/environments/production.rb)
- [backend/config/initializers/cors.rb](/Users/Bandana/work/email-screener/backend/config/initializers/cors.rb)
- [backend/config/initializers/session_store.rb](/Users/Bandana/work/email-screener/backend/config/initializers/session_store.rb)

## Notes

- Gmail is the only supported email provider in the current implementation.
- Email sync and processing run through Solid Queue, so both the Rails API and job worker must be running.
- Playwright E2E uses mocked backend responses and does not depend on live Google OAuth or Gmail.
