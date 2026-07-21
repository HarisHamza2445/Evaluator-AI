# Evaluator AI — AI Agent Comparison Dashboard

A premium, full-stack Next.js dashboard engineered for AI agent discovery, side-by-side performance comparison, real-time analytics telemetry, and cloud workflow integrations.

---

## 🔑 Demo Test Credentials

To evaluate the system, you can log in directly using these seeded credentials:

### 🛡️ Administrator Account (Unlocks full CRUD controls)
* **Email**: `harishamzaali@gmail.com`
* **Password**: `admin123`

### 👤 Standard User Account (Read-only comparisons)
* **Email**: `alex@evaluator.ai`
* **Password**: `user123`

---

## 🛠️ Main Features

* **Dynamic Weighting sliders**: Tune priority metrics (Accuracy, Speed, Memory, Cost) and re-sort agent rankings instantly.
* **Interactive Chat Sandbox**: Slide out evaluation drawers on any card to test LLM character messaging in real-time.
* **Comparison Matrix**: Inspect radar charts and row-by-row specifications. Export specs as raw JSON data or print clean PDF reports.
* **Telemetry Traffic Simulator**: Trigger simulated API requests directly into the SQLite database to watch telemetry graphs update dynamically.
* **Secured Session Auth**: Powered by NextAuth v4 credentials endpoints.

---

## 🚀 Local Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
The repository includes a seeded SQLite database. Sync the schema:
```bash
npx prisma db push
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your dashboard.
