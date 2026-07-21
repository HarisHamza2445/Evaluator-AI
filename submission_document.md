# Project Submission Document
### Evaluator AI — AI Agent Comparison Dashboard

---

## Candidate Information

| | |
|---|---|
| **Full Name** | Haris Hamza Ali |
| **Applied Position** | Full Stack Developer |
| **Email Address** | harishamzaali@gmail.com |
| **Contact Number** | 9657570017 |

---

## Demo Test Credentials

| Account Role | Email Address | Password |
|---|---|---|
| **Administrator** (Full dynamic CRUD controls) | `harishamzaali@gmail.com` | `admin123` |
| **Standard User** (Read-only session tools) | `alex@evaluator.ai` | `user123` |

---

## Project Information

### Project Title
**Evaluator AI — AI Agent Comparison Dashboard**

---

### Problem Statement

Anyone who's worked with AI tools lately knows how overwhelming it's gotten. There are dozens of agents and models out there — GPT-4o, Claude, Llama, Gemini — and each one claims to be the best at something. But when you actually need to pick one for a real use case, there's no good place to compare them side by side in a structured, visual way.

Most developers end up jumping between docs, Reddit threads, and random benchmark sites just to make a decision. That felt like a problem worth solving. Evaluator AI is my attempt at building a proper home for AI agent discovery, comparison, and performance monitoring — all under one roof.

---

### Solution Approach

I built Evaluator AI as a full-stack dashboard with four main sections, each solving a specific part of the problem:

**Marketplace** is where you browse available agents. You can filter by domain (Data & Analysis, Development, Content Creation, etc.), adjust scoring weights, click are-to-chat to test reasoning in a sandbox, and add agents to a comparison queue right from the card.

**Comparison Matrix** is the core feature. Pick any two or three agents and you get a radar chart showing how they stack up across dimensions like logic, creativity, memory, and latency — plus a detailed row-by-row spec table below it and clean PDF/JSON export actions.

**Performance Analytics** gives you a real-time view of how deployed agents are actually performing. KPI cards for total requests, average latency, tokens per second, and success rate. A latency trend line chart, a database-backed traffic simulator, and a live request log table with status indicators.

**Integrations** handles the operational side — connecting cloud providers (AWS, GCP, Azure), managing API keys with masked secrets, and configuring outbound webhooks with uptime tracking.

The whole thing is authenticated, so every user has their own saved comparisons and the admin can manage the agent catalog through a built-in CRUD interface.

---

### Technology Stack Used

| Layer | What I Used |
|-------|-------------|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS with a custom design token system |
| **Authentication** | NextAuth.js v4 — credentials-based, JWT sessions, bcrypt hashing |
| **ORM** | Prisma |
| **Database** | SQLite (local dev) — designed to swap to PostgreSQL |
| **Charts** | Recharts |
| **Icons** | Google Material Symbols |
| **Fonts** | Plus Jakarta Sans + Inter via Google Fonts |
| **Deployment** | Vercel |

---

### Key Features

- **Secure Auth Flow** — Users register and log in with email and password. Passwords are hashed with bcrypt, sessions are JWT-based, and all dashboard routes are protected via Next.js middleware. No one gets in without an account.
- **Agent Marketplace** — A browsable catalog with category filters, rating, performance scores, and pricing details. Highlights the top performer with an expanded card layout.
- **Dynamic Scoring Weight sliders** — Custom weights for Reasoning Quality, Speed, Memory, and Cost allows users to customize benchmarks and see updated grid rankings on-screen.
- **Interactive Playground Drawer** — Testing prompts directly inside an overlay drawer simulating response outputs for selected agents.
- **Comparison Exporters** — Toggle exports to download formatted JSON specs or print clean comparative PDF dossiers.
- **Performance Traffic Simulator** — Write simulated request operations directly to the DB at the click of a button, letting graphs populate in real-time.
- **Full Agent CRUD** — Admins can add, edit, or delete agents through a modal form.
- **Integrations Panel** — Cloud provider status cards (online/offline), API key rows with hover-to-copy masked secrets, and webhooks uptime tables.

---

## Links

| | |
|---|---|
| **GitHub Repository** | [github.com/HarisHamza2445/Evaluator-AI](https://github.com/HarisHamza2445/Evaluator-AI) |
| **Live Demo** | [evaluator-ai-dashboard.vercel.app](https://evaluator-ai-dashboard.vercel.app) |
| **Demo Video** | [Watch on Google Drive](https://drive.google.com/your-video-link) |

---

## Screenshots

### Login Page
![Login Page Layout](/C:/Users/haris/.gemini/antigravity/brain/ad267b99-90ee-458e-b929-438bf50c7a0c/login_page_1784619418036.png)

---

### Marketplace — Agent Grid & Filters
![Marketplace Grid Views](/C:/Users/haris/.gemini/antigravity/brain/ad267b99-90ee-458e-b929-438bf50c7a0c/marketplace_page_1784619584843.png)

---

### Verification Walkthrough Recording
![System Run Recording](/C:/Users/haris/.gemini/antigravity/brain/ad267b99-90ee-458e-b929-438bf50c7a0c/agentos_app_verification_1784618242675.webp)

---

## Challenges & Learnings

### NextAuth v5 Beta to stable v4 Downgrade & Alignment

When I initially updated Next.js to the new App Router structure in Next.js 16, using NextAuth v5 (Auth.js beta) was throwing persistent Server 500 errors during route handshakes and route middleware intercepting. 

To solve this compatibility blocker, I migrated back to NextAuth's stable v4 core. I refactored API endpoint definitions to use `getServerSession(authOptions)` and created a custom route proxy middleware utilizing `withAuth` to enforce strict session authorization. This resolved all auth issues.

---

### Next.js static prerender bailouts (useSearchParams)

During production builds, Next.js was crashing due to dynamic client parameters: calling `useSearchParams()` inside `MarketplaceClient` without a `<Suspense>` boundary. Next.js static renderer treats this as a dynamic route and fails to static-build correctly.

I resolved this by decoupling the page into a clean Server-wrapper component housing a `<Suspense>` guard, which nests the `MarketplaceClient` rendering logic.

---

### Implementing Database-Backed Live Telemetry Simulation

I wanted to demonstrate data updates dynamically inside Recharts graph panels without requiring external telemetry nodes. 

I solved this by building a dedicated POST route inside `/api/analytics` that randomly maps metrics to active agents. When a client triggers "Simulate Traffic," it posts records directly to the SQLite Prisma storage, prompting immediate layout refills.

---

*Submitted by Haris Hamza Ali — July 2026*
