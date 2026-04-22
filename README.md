# Email Screener

AI-assisted inbox triage built with a Rails API backend and a Next.js frontend. The current v1 scope is Gmail sync, AI-generated summaries/replies/tasks, task tracking, and simple inbox rules.

## Stack

- Backend: Ruby on Rails 8, PostgreSQL, Solid Queue
- Frontend: Next.js App Router, React, Tailwind CSS
- Auth: Google OAuth with session cookies
- AI providers: OpenAI by default, with Anthropic/Ollama hooks in the service layer

## Local setup

### Prerequisites

- Ruby 3.2.x
- Node 20+
- PostgreSQL 14+

### 1. Clone and install dependencies

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

### 2. Configure environment variables

Backend values live in [backend/.env.example](/Users/Bandana/work/email-screener/backend/.env.example).

Required backend variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FRONTEND_APP_URL`
- `FRONTEND_APP_ORIGINS`
- `AI_PROVIDER`
- `OPENAI_API_KEY` when `AI_PROVIDER=openai`

Frontend values live in [frontend/.env.example](/Users/Bandana/work/email-screener/frontend/.env.example).

Required frontend variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_URL`

### 3. Prepare the databases

```bash
cd backend
bundle exec rails db:prepare
```

This prepares the primary Rails database plus the Solid Queue, cache, and cable databases used by Rails 8.

### 4. Run the app

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

## Local verification

Backend bootstrap:

```bash
cd backend
bundle exec bin/setup --skip-server
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Implemented endpoints

- `GET /health`
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

## Notes

- Gmail is the only supported email provider in the current implementation.
- Email sync and processing now run through Solid Queue, so the API server and job worker must both be running for async processing to complete.
- The setup and deployment documentation will be expanded further as the production-hardening phases continue.
