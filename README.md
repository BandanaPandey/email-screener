# 🚀 AI Smart Inbox (Email Screener)

An intelligent **AI-powered inbox assistant** that helps you **prioritize, summarize, reply, and extract tasks** from emails automatically.

Built using **Ruby on Rails (backend)** + **Next.js (frontend)** with a focus on **productivity, automation, and clean UX**.

---

# ✨ Features

---

## 📥 Email Integration

* Connect with Gmail via OAuth
* Secure token storage with refresh handling
* Background email syncing using Sidekiq

---

## 🧠 AI-Powered Email Intelligence

* Automatic **email classification** (important, promotion, etc.)
* **Priority scoring** (core differentiation)
* AI-generated **summaries (TL;DR)**
* Extract actionable **tasks from emails**

---

## 🤖 AI Assistant Actions

* ✨ **Reply Suggestions**
* 🧠 **Summarize Email**
* 📌 **Extract Tasks**

---

## 🎯 Smart Reply Tones

Customize how AI responds:

* Casual
* Professional
* Short
* Detailed

---

## 📌 Task Management

* Tasks auto-created from emails
* Mark as completed/pending
* Priority tagging (high / medium / low)
* Due date tracking

---

## 📊 Smart Inbox UI

* Gmail-like layout (Sidebar + List + Detail)
* Highlight high-priority emails
* Task visibility inside emails
* Clean and responsive UI

---

## 🔔 Smart Notifications

* Alerts for high-priority emails
* Real-time feedback for important actions

---

## ⚙️ Rule Engine

Create custom automation rules:

```
If sender = boss → mark important  
If subject contains "invoice" → mark action required  
```

* Apply rules to new and existing emails
* Fully user-configurable

---

## ⚡ Scalable Backend

* Background jobs using Sidekiq
* Provider-agnostic architecture:

  * Email providers (Gmail, future-ready)
  * AI providers (Ollama, OpenAI, Anthropic)

---

# 🧱 Tech Stack

---

## Backend

* Ruby on Rails (API mode)
* Sidekiq (background jobs)
* PostgreSQL

---

## Frontend

* Next.js (App Router)
* React + Tailwind CSS

---

## AI Layer

* Provider-agnostic abstraction
* Supports:

  * Ollama (local models)
  * OpenAI (optional)
  * Extendable to Anthropic, etc.

---

## Authentication

* Google OAuth (OmniAuth)
* Session-based authentication

---

# 🧠 Architecture Overview

---

```
Frontend (Next.js)
        ↓
Rails API (Controllers)
        ↓
Services Layer
  - Email Sync
  - AI Classification
  - Task Extraction
  - Rule Engine
        ↓
AI Provider Layer (Pluggable)
        ↓
Database (PostgreSQL)
```

---

# 🚀 Getting Started

---

## 1️⃣ Clone the repo

```bash
git clone <your-repo-url>
cd ai-smart-inbox
```

---

## 2️⃣ Backend Setup (Rails)

```bash
cd backend
bundle install
rails db:create db:migrate
```

---

## 🔐 Setup Environment Variables

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
```

---

## ▶️ Start Rails server

```bash
rails s
```

Runs on:

```
http://localhost:3000
```

---

## ⚙️ Start Sidekiq

```bash
bundle exec sidekiq
```

---

## 3️⃣ Frontend Setup (Next.js)

```bash
cd frontend
npm install
```

---

## ▶️ Run frontend

```bash
npm run dev
```

Runs on:

```
http://localhost:3001
```

---

# 🔗 Key API Endpoints

---

## Email

```
GET /emails
POST /sync_emails
```

---

## AI Actions

```
POST /ai/reply
POST /ai/summarize
POST /ai/extract_tasks
```

---

## Tasks

```
PATCH /tasks/:id
GET /tasks
```

---

## Rules

```
GET /rules
POST /rules
POST /rules/apply
```

---

# 🎯 Core Differentiators

---

* 🧠 AI-first inbox (not just email client)
* ⚡ Priority scoring for decision making
* 📌 Task extraction from emails
* 🤖 Smart reply with tone control
* 🔄 Fully provider-agnostic architecture
* 🧩 Rule-based automation engine

---

# 🔥 Roadmap

---

* [ ] Send email via Gmail API
* [ ] Multi-reply preview (Superhuman-style)
* [ ] AI query understanding (natural language filters)
* [ ] Mobile app / browser extension
* [ ] Team collaboration features

---

# 🤝 Contributing

---

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

# 💡 Inspiration

---

Built to reduce **email overload** and turn inbox into a **productivity engine powered by AI**.
