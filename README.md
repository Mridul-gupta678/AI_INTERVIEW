# 🧠 InterviewAI — Production-Ready AI Mock Interview Platform

A full-stack, AI-powered mock interview platform built with Next.js 14, GPT-4o, Whisper, and PostgreSQL.

---

## 🚀 Features

| Feature | Details |
|---|---|
| **AI Interviewer** | GPT-4o powered, domain-specific, adaptive questioning |
| **Voice Mode** | Whisper STT + OpenAI TTS for real interviews |
| **Smart Evaluation** | Scores on 4 axes: Technical, Communication, Confidence, Clarity |
| **Resume-Based** | Upload PDF → AI extracts skills → personalized questions |
| **Coding Editor** | Monaco editor, C++/Java/Python, Piston API execution |
| **Real-time Feedback** | Per-answer feedback without interrupting flow |
| **Filler Word Detection** | Tracks "um", "uh", "like" etc. in real-time |
| **Dashboard** | Score history, domain radar, activity heatmap |
| **Company Mode** | Google, Amazon, Microsoft, Meta, Apple styles |
| **Dark/Light Mode** | Fully themed with CSS variables |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (landing)/       # Home page
│   ├── auth/            # Login & Register
│   ├── dashboard/       # Overview, History, Analytics, Settings
│   ├── interview/       # Setup → Active Interview → Results
│   └── api/             # All API routes
│       ├── auth/        # NextAuth + register
│       ├── interviews/  # CRUD + messages + evaluation
│       ├── evaluate/    # AI evaluation engine
│       ├── resume/      # PDF upload + AI parsing
│       ├── voice/       # Whisper STT + TTS
│       ├── code/        # Run (Piston) + Analyze (GPT)
│       ├── analytics/   # Dashboard data
│       └── profile/     # User profile
├── components/
│   ├── interview/       # ChatMessage, VoiceRecorder, RealtimeFeedback
│   ├── editor/          # Monaco CodeEditor
│   └── dashboard/       # Charts, widgets
├── services/
│   └── ai.service.ts    # All OpenAI calls (GPT, Whisper, TTS)
├── lib/
│   ├── prisma.ts        # DB client singleton
│   ├── redis.ts         # Cache helpers
│   └── auth.ts          # NextAuth config
└── types/               # Full TypeScript types
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/ai-interview-platform.git
cd ai-interview-platform
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Fill in:
```env
DATABASE_URL="postgresql://..."       # Neon DB recommended
NEXTAUTH_SECRET="random-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
REDIS_URL="redis://localhost:6379"    # Or Upstash URL
```

### 3. Database Setup
```bash
# Option A: Local with Docker
docker-compose up -d postgres redis

# Option B: Neon DB (recommended for production)
# Get URL from neon.tech, paste in .env.local

npx prisma db push
npx prisma generate
npm run db:seed   # seeds sample questions
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🐳 Docker (Full Stack)

```bash
docker-compose up --build
```

---

## ☁️ Deploy to Vercel

```bash
# 1. Push to GitHub
# 2. Connect repo to Vercel
# 3. Add env vars in Vercel dashboard
# 4. Deploy!

vercel --prod
```

**Required env vars on Vercel:**
- `DATABASE_URL` (Neon PostgreSQL)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your vercel domain)
- `OPENAI_API_KEY`
- `REDIS_URL` (Upstash Redis)

---

## 🧠 AI System Prompts

### Interviewer Prompt Strategy
The AI interviewer uses a structured system prompt that:
1. **Sets persona** — professional but encouraging
2. **Injects domain context** — DSA vs System Design vs HR have different focuses
3. **Adapts to difficulty** — Easy targets freshers, Hard targets senior engineers
4. **Uses resume data** — personalizes questions to candidate's actual projects
5. **Enforces format** — returns JSON `{ message, question, followUp, interviewComplete }`

### Evaluation Scoring (0–100)
| Dimension | Weight | What's Measured |
|---|---|---|
| Technical Accuracy | 40% | Correctness, depth, completeness |
| Communication | 25% | Clarity, structure, articulation |
| Problem Solving | 20% | Approach, creativity, edge cases |
| Confidence | 15% | Filler words, hesitation, certainty |

---

## 🎯 Domain Coverage

| Domain | Topics |
|---|---|
| **DSA** | Arrays, Trees, Graphs, DP, Complexity |
| **System Design** | Scalability, CAP, Distributed Systems |
| **OS** | Processes, Threads, Memory, Deadlocks |
| **DBMS** | SQL, Normalization, Transactions, Indexes |
| **CN** | TCP/IP, HTTP, DNS, Load Balancers |
| **HR/Behavioral** | STAR method, Leadership, Conflict |
| **Full Stack** | React, APIs, Auth, DBs |
| **ML** | Algorithms, Model Evaluation, Deep Learning |

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT sessions via NextAuth
- All routes protected by middleware
- Input validation with Zod
- API routes verify session ownership

---

## 📊 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom CSS vars |
| UI Components | Radix UI primitives |
| Animation | Framer Motion |
| Charts | Recharts |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Cache | Redis (Upstash) |
| AI | OpenAI GPT-4o + Whisper + TTS |
| Code Editor | Monaco Editor |
| Code Execution | Piston API (free) |
| Auth | NextAuth.js |
| Deployment | Vercel |

---

## 🔮 Roadmap / Bonus Features

- [ ] Peer-to-peer mock interviews (WebRTC)
- [ ] Interview replay with transcript sync
- [ ] Plagiarism/similarity detection across answers
- [ ] Email report after each interview
- [ ] Flashcard mode for quick concept review
- [ ] Mobile app (React Native)

---

## 📝 License
MIT — use freely, star the repo ⭐
