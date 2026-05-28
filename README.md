<div align="center">

# 🧠 InterviewAI

### Production-Ready AI Mock Interview Platform

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-6366f1?style=for-the-badge)](https://ai-interview-platform-rosy.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-96.6%25-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**Ace your next interview with GPT-4o, real-time voice interaction, adaptive questioning, and multi-dimensional AI feedback — all in one platform.**

[**→ Try it Live**](https://ai-interview-platform-rosy.vercel.app/) &nbsp;·&nbsp; [Report Bug](https://github.com/Mridul-gupta678/AI_INTERVIEW/issues) &nbsp;·&nbsp; [Request Feature](https://github.com/Mridul-gupta678/AI_INTERVIEW/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Docker Deployment](#-docker-deployment)
- [Deploy to Vercel](#️-deploy-to-vercel)
- [AI System Design](#-ai-system-design)
- [Domain Coverage](#-domain-coverage)
- [Security](#-security)
- [Admin Panel](#-admin-panel)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌟 Overview

**InterviewAI** is a full-stack, production-grade mock interview platform that simulates real interview environments using cutting-edge AI. Whether you're preparing for a FAANG company interview, brushing up on system design, or practising behavioural questions, InterviewAI delivers a personalised, adaptive experience — complete with voice interaction, a live coding editor, and detailed performance analytics.

> Built with **Next.js 14 App Router**, **OpenAI GPT-4o + Whisper**, **PostgreSQL (Neon)**, **Redis (Upstash)**, and deployed on **Vercel**.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🤖 **AI Interviewer** | GPT-4o powered, domain-specific, adaptive questioning that adjusts to your level |
| 🎙️ **Voice Mode** | Whisper STT + OpenAI TTS for a realistic, fully voice-driven interview experience |
| 📊 **Smart Evaluation** | Scored across 4 axes — Technical Accuracy, Communication, Problem Solving & Confidence |
| 📄 **Resume-Based Questions** | Upload your PDF → AI extracts your skills → generates personalised questions |
| 💻 **Live Coding Editor** | Monaco Editor with C++, Java & Python support; code executed via the free Piston API |
| ⚡ **Real-time Feedback** | Per-answer feedback streamed without interrupting interview flow |
| 🗣️ **Filler Word Detection** | Tracks "um", "uh", "like" etc. in real-time for communication coaching |
| 📈 **Analytics Dashboard** | Score history, domain radar charts, and activity heatmaps |
| 🏢 **Company Mode** | Simulates interview styles of Google, Amazon, Microsoft, Meta & Apple |
| 🌙 **Dark / Light Mode** | Fully themed UI with CSS variables supporting both modes |
| 🔐 **Secure Admin Panel** | Dual-layer, password-protected admin area with bcrypt hashing and 24-hour sessions |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (96.6%) |
| **Styling** | Tailwind CSS + custom CSS variables |
| **UI Components** | Radix UI primitives |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **State Management** | Zustand |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL via Neon |
| **Cache / Sessions** | Redis via Upstash · ioredis |
| **AI** | OpenAI GPT-4o · Whisper STT · TTS |
| **Face Detection** | TensorFlow.js + MediaPipe Face Mesh |
| **Code Editor** | Monaco Editor |
| **Code Execution** | Piston API (free, sandboxed) |
| **Authentication** | NextAuth.js v4 + bcryptjs |
| **Email** | Resend |
| **Real-time** | Socket.IO |
| **PDF Parsing** | pdf-parse |
| **Deployment** | Vercel + Docker |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (landing)/           # Public home / marketing page
│   ├── auth/                # Login & Register pages
│   ├── dashboard/           # Overview · History · Analytics · Settings
│   ├── interview/           # Setup → Active Interview → Results flow
│   ├── admin/               # Protected admin panel
│   └── api/                 # All API routes (Next.js Route Handlers)
│       ├── auth/            # NextAuth config + user registration
│       ├── interviews/      # CRUD · messages · evaluation
│       ├── evaluate/        # AI evaluation engine
│       ├── resume/          # PDF upload + AI skill extraction
│       ├── voice/           # Whisper STT + OpenAI TTS
│       ├── code/            # Execute (Piston) + Analyse (GPT-4o)
│       ├── analytics/       # Dashboard aggregation queries
│       ├── admin/           # Admin auth (verify-password · logout)
│       └── profile/         # User profile management
├── components/
│   ├── interview/           # ChatMessage · VoiceRecorder · RealtimeFeedback
│   ├── editor/              # Monaco CodeEditor wrapper
│   └── dashboard/           # Chart widgets · score cards
├── services/
│   └── ai.service.ts        # Centralised OpenAI calls (GPT · Whisper · TTS)
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── redis.ts             # Redis cache helpers
│   └── auth.ts              # NextAuth configuration
├── scripts/
│   └── generate-admin-password.ts   # Admin password hash generator
└── types/                   # Full TypeScript type definitions
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js `≥ 20`
- npm or yarn.
- PostgreSQL database (local via Docker or [Neon](https://neon.tech))
- Redis instance (local via Docker or [Upstash](https://upstash.com))
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/Mridul-gupta678/AI_INTERVIEW.git
cd AI_INTERVIEW
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Then fill in your values — see Environment Variables below
```

### 3. Set Up the Database

```bash
npx prisma db push       # Push schema to your database
npx prisma generate      # Generate Prisma client
npm run db:seed          # Seed with sample interview questions
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# ─── Database (Neon PostgreSQL recommended) ───────────────────────────────────
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/interviewai?sslmode=require"

# ─── NextAuth ─────────────────────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# ─── OpenAI ───────────────────────────────────────────────────────────────────
OPENAI_API_KEY="sk-..."

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL="redis://localhost:6379"
# For Upstash: REDIS_URL="rediss://default:xxx@xxx.upstash.io:6380"

# ─── File Storage (optional — Cloudinary) ─────────────────────────────────────
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ─── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ─── Admin Panel ──────────────────────────────────────────────────────────────
ADMIN_PASSWORD_HASH=""   # Generated via: npx ts-node scripts/generate-admin-password.ts
```

---

## 🗄️ Database Setup

**Option A — Local with Docker (recommended for development):**

```bash
docker-compose up -d postgres redis
```

**Option B — Neon DB (recommended for production):**

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string into `DATABASE_URL` in your `.env.local`

Then run migrations and seed data:

```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

Inspect your data with Prisma Studio:

```bash
npm run db:studio
```

---

## 🐳 Docker Deployment

Run the full stack (app + PostgreSQL + Redis) with a single command:

```bash
docker-compose up --build
```

This spins up three containers:

| Container | Service | Port |
|---|---|---|
| `interviewai_app` | Next.js application | `3000` |
| `interviewai_db` | PostgreSQL 16 | `5432` |
| `interviewai_redis` | Redis 7 | `6379` |

The Dockerfile uses a **multi-stage build** (deps → builder → runner) with a non-root `nextjs` system user for production security.

---

## ☁️ Deploy to Vercel

```bash
# 1. Push to GitHub
# 2. Connect the repo in the Vercel dashboard
# 3. Add environment variables in Vercel settings
# 4. Deploy!
vercel --prod
```

**Required Vercel environment variables:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel domain (e.g. `https://your-app.vercel.app`) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `REDIS_URL` | Upstash Redis connection string |

---

## 🧠 AI System Design

### Interviewer Prompt Strategy

The AI interviewer uses a structured system prompt that:

1. **Sets the persona** — professional, encouraging, and domain-aware
2. **Injects domain context** — DSA, System Design, and HR sessions have distinct focus areas and depth expectations
3. **Adapts to difficulty** — Easy mode targets freshers; Hard mode targets senior engineers
4. **Uses resume data** — Personalises questions to the candidate's actual projects and listed skills
5. **Enforces structured output** — Returns JSON: `{ message, question, followUp, interviewComplete }`

### Evaluation Scoring (0 – 100)

After each interview, the AI evaluates the full conversation across four weighted dimensions:

| Dimension | Weight | What's Measured |
|---|---|---|
| **Technical Accuracy** | 40% | Correctness, depth, and completeness of answers |
| **Communication** | 25% | Clarity, structure, and articulation |
| **Problem Solving** | 20% | Approach, creativity, and edge case handling |
| **Confidence** | 15% | Filler word frequency, hesitation patterns, certainty of delivery |

---

## 🎯 Domain Coverage

| Domain | Topics Covered |
|---|---|
| **DSA** | Arrays, Trees, Graphs, Dynamic Programming, Complexity Analysis |
| **System Design** | Scalability, CAP Theorem, Distributed Systems, Caching Strategies |
| **Operating Systems** | Processes, Threads, Memory Management, Deadlocks |
| **DBMS** | SQL, Normalisation, Transactions, Indexing |
| **Computer Networks** | TCP/IP, HTTP/HTTPS, DNS, Load Balancing |
| **HR / Behavioural** | STAR method, Leadership, Conflict Resolution |
| **Full Stack** | React, REST APIs, Authentication, Databases |
| **Machine Learning** | Algorithms, Model Evaluation, Deep Learning Fundamentals |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT sessions** managed by NextAuth.js
- All routes protected by Next.js **middleware**
- Request body validation with **Zod**
- API routes verify **session ownership** before returning data
- Admin panel secured with a **separate bcrypt-hashed password** stored in environment variables
- Admin cookies are **HttpOnly** (XSS-resistant) with a 24-hour expiry

---

## 🛡️ Admin Panel

The admin panel uses dual-layer authentication — users must have an `ADMIN` role on their account **and** enter the correct admin password each session.

### Setup

```bash
# Generate a bcrypt hash for your chosen admin password
npx ts-node scripts/generate-admin-password.ts

# Or with a custom password
ADMIN_PASSWORD="your-secure-password" npx ts-node scripts/generate-admin-password.ts
```

Add the generated hash to `.env.local`:

```env
ADMIN_PASSWORD_HASH=<paste-generated-hash-here>
```

### Admin Routes

| Route | Description |
|---|---|
| `/admin` | Main admin dashboard (requires both auth layers) |
| `/admin-login` | Admin password entry page |
| `/api/admin/verify-password` | `POST` — verifies the admin password |
| `/api/admin/logout` | `POST` — ends the admin session |

Sessions expire after **24 hours**. See [`ADMIN_AUTH_SETUP.md`](ADMIN_AUTH_SETUP.md) for full configuration options.

---

## 🔮 Roadmap

- [ ] Peer-to-peer mock interviews via WebRTC
- [ ] Full interview replay with transcript sync
- [ ] Plagiarism / similarity detection across answers
- [ ] Email performance report after each interview
- [ ] Flashcard mode for quick concept review
- [ ] Mobile app (React Native)

---

## 📝 License

This project is licensed under the **MIT License** — free to use, fork, and build upon.  
If you find it useful, please give it a ⭐ — it helps a lot!

---

<div align="center">

Made with ❤️ by [Mridul Gupta](https://github.com/Mridul-gupta678)

**[🚀 Live Demo](https://ai-interview-platform-rosy.vercel.app/)** &nbsp;·&nbsp; **[⭐ Star on GitHub](https://github.com/Mridul-gupta678/AI_INTERVIEW)**

</div>
