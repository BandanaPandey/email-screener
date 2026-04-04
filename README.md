# Email Screener App

## Tech Stack
- Backend: Rails API
- Frontend: Next.js
- DB: PostgreSQL
- Jobs: Sidekiq + Redis

## Setup

### Backend
cd backend
bundle install
rails db:create db:migrate
rails s

### Frontend
cd frontend
npm install
npm run dev