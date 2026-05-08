# InterEQ

> Intelligent MFA Automation Platform — Demo Site

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://gokulraj-v12.github.io/InterEQ/)

## Overview

InterEQ is a demo platform showcasing an agent that automates Multi-Factor Authentication (MFA) flows end-to-end. Given credentials, the agent navigates the login flow, detects the MFA challenge, resolves it, and completes authentication — hands-free.

## Project Structure

```
InterEQ/
├── docs/                  ← GitHub Pages frontend
│   ├── index.html         ← Landing page
│   ├── login.html         ← Login page
│   ├── mfa.html           ← MFA verification page
│   ├── dashboard.html     ← Post-auth dashboard
│   ├── css/styles.css     ← Shared design system
│   └── js/main.js         ← Shared utilities
│
├── backend/               ← Flask API backend
│   ├── app.py             ← Main Flask app (login, MFA, agent endpoints)
│   └── requirements.txt
│
├── agent/                 ← MFA automation agent
│   └── mfa_agent.py       ← Agent skeleton (Playwright integration TBD)
│
└── .github/workflows/     ← GitHub Actions (future CI/CD)
```

## Live Site

🌐 [https://gokulraj-v12.github.io/InterEQ/](https://gokulraj-v12.github.io/InterEQ/)

## Demo Flow

1. **Landing page** → click *Start Demo*
2. **Login** → enter any credentials → redirects to MFA page
3. **MFA** → enter a 6-digit OTP (or use `000000` for test) → redirects to Dashboard
4. **Dashboard** → click *Run Agent Demo* to watch the automation simulation

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API runs at `http://localhost:5000`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/health` | Health check |
| POST   | `/api/login` | Submit credentials, trigger MFA |
| POST   | `/api/mfa/verify` | Verify OTP code |
| POST   | `/api/agent/trigger` | Trigger full agent automation |
| POST   | `/api/logout` | End session |

## Collaboration

This repo is public. To contribute:
1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Push and open a Pull Request

## License

MIT
