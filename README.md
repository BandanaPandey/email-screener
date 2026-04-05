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


### Devlopment Plan
🧠 1. Core Idea (Refined)

Your app = “Smart Email Screener”
→ Automatically analyzes, categorizes, ranks, and summarizes emails so users only see what matters.

Think:

Priority Inbox on steroids
AI assistant for email decision-making
🚀 2. Features (Structured Roadmap)

🔹 Phase 1: MVP (Must-Have)

Focus on delivering value quickly.

📥 Email Integration
Connect inbox via:
Gmail API (primary target)
Outlook (later)
OAuth authentication
🧠 AI Email Classification
Categories:
Important
Action Required
Promotions
Spam
Social
Custom labels (user-defined rules)
⭐ Priority Scoring
Rank emails based on:
Sender importance
Keywords
Past behavior (learning system)
📄 Email Summarization
Show:
TL;DR summary
Key action points
🔔 Smart Notifications
Notify only for:
High priority emails
Ignore noise
🗂️ Dashboard View
Sections:
“Must Read”
“Later”
“Ignore”

🔹 Phase 2: Differentiators (Make it stand out)
🤖 AI Assistant Actions
“Reply suggestion”
“Summarize thread”
“Extract tasks”
📌 Task Extraction
Convert emails → To-do items
Integrate with tools (Notion, Todoist)
📊 Insights Dashboard
Time spent on emails
Sender analytics
Productivity score
🧩 Rule Engine
If sender = X → mark important
If contains “invoice” → action required
🔎 Smart Search
Semantic search (not keyword-based)

🔹 Phase 3: Advanced (Scale-worthy)
🧬 Personalization Engine
Learns user behavior over time
🧵 Thread Intelligence
Understands entire conversation context
🛡️ Security Layer
Encryption
No email storage (or secure storage)
🧑‍🤝‍🧑 Team Inbox Mode
Shared inbox for teams
Assign emails to teammates
🏗️ 3. Tech Stack (Recommended)


Week 1
Setup Rails API
Gmail OAuth integration
Fetch emails

Week 2
Store emails
Basic UI (Next.js)
Show inbox

Week 3
AI classification
Priority scoring

Week 4
Summarization
Dashboard sections

Week 5
Notifications
Rule engine (basic)

Week 6
Polish UI
Deploy + testing
