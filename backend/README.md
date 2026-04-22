# Backend

The backend is a Rails 8 API app using PostgreSQL and Solid Queue.

Quick start:

```bash
cp .env.example .env
bundle install
bundle exec rails db:prepare
bundle exec rails server
```

Run background jobs in a separate shell:

```bash
bundle exec bin/jobs
```

See the root [README](/Users/Bandana/work/email-screener/README.md) for the full local setup flow and environment variable reference.
