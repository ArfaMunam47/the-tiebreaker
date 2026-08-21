<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-2C221E?style=for-the-badge&labelColor=F4F0E8" alt="Version" />
  <img src="https://img.shields.io/badge/React-19-2C221E?style=for-the-badge&logo=react&labelColor=F4F0E8" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-2C221E?style=for-the-badge&logo=typescript&labelColor=F4F0E8" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.21-2C221E?style=for-the-badge&logo=express&labelColor=F4F0E8" alt="Express" />
  <img src="https://img.shields.io/badge/Netlify-2C221E?style=for-the-badge&logo=netlify&labelColor=F4F0E8" alt="Netlify" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Gemini-2C221E?style=for-the-badge&logo=googlegemini&labelColor=F4F0E8" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Vite-6-2C221E?style=for-the-badge&logo=vite&labelColor=F4F0E8" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-2C221E?style=for-the-badge&logo=tailwindcss&labelColor=F4F0E8" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Skeuomorphic%20UI-2C221E?style=for-the-badge&labelColor=F4F0E8" alt="Skeuomorphic UI" />
</p>

<div align="center">

# ⚖️ The Tiebreaker

### Decision Intelligence, Crafted with Physical Presence

**The Tiebreaker** is a full-stack, AI-powered decision-intelligence platform that transforms dilemmas into rigorous, multi-dimensional analysis. Describe a predicament, answer a few sharp clarifying questions, and the system synthesizes your options across structured frameworks — pros/cons, SWOT, multi-criteria scoring, risk matrices, scenario modeling, long-term impact, sensitivity analysis, and a confidence-rated recommendation with reversal triggers.

Beneath it all lives a hand-crafted **skeuomorphic design system** — tactile raised cards, recessed input wells, enamel-switch buttons, and layered amber depth that make the interface feel like a physical decision instrument.

</div>

---

## 📋 Table of Contents

- [🚀 Quick Start](#quick-start)
- [✨ Features](#features)
- [🧠 How It Works](#how-it-works)
- [🏛️ Design System](#design-system)
- [🖥️ Tech Stack](#tech-stack)
- [📂 Project Structure](#project-structure)
- [🔌 API Reference](#api-reference)
- [🧪 Scripts](#scripts)
- [☁️ Deployment](#deployment)
- [🔐 Environment Variables](#environment-variables)
- [🤝 Contributing](#contributing)
- [📄 License](#license)

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | **18+** (developed with Node 22) |
| Package Manager | npm, yarn, or bun |
| Gemini API Key | Optional — see [Demo Mode](#demo-mode) below |

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/ArfaMunam47/the-tiebreaker.git
cd the-tiebreaker

# Install dependencies (use your preferred package manager)
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root (or copy `.env.example` if present):

```dotenv
# Root /.env
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 **No API key? No problem.** If `GEMINI_API_KEY` is missing (or still set to the placeholder), the app automatically falls back to a **deterministic offline engine** that produces rich, realistic analysis — every workflow remains fully explorable.

### 3. Run the Development Server

```bash
npm run dev
```

This starts both servers on port **3000**:

| Service | URL |
|---|---|
| Full-stack app (Express + Vite middleware) | [http://localhost:3000](http://localhost:3000) |

---

## ✨ Features

### 🧠 AI-Powered Analysis (Gemini)

- **Multi-model failover pipeline** — attempts `gemini-flash-latest` → `gemini-3.1-flash-lite` → `gemini-3.7-flash` with sub-4-second timeouts for a fast, resilient response.
- **Domain-aware intelligence** — automatic detection of your decision domain (technical, career, lifestyle, relationships, health, shopping, education, general) that shapes the reasoning throughout.
- **Deterministic offline engine** — a rule-based heuristic fallback that runs natively in the browser/API and keeps the full workflow functional without a key or network.

### 📋 Structured Analysis Frameworks

| Framework | What It Reveals |
|---|---|
| **Pros & Cons** | Weighted (low / medium / high) arguments per option |
| **Comparison Matrix** | Criterion-by-criterion showdown with winners & notes |
| **SWOT** | Strengths, weaknesses, opportunities, threats per option |
| **Multi-Criteria Decision Matrix** | Weighted scoring across your own priorities with per-option scores and ranked outcome |
| **Risk Register** | Probability × impact catalogue with mitigation strategies |
| **Scenario Modeling** | Short-term vs long-term projections, best / expected / worst case, long-term impact across finance, career, time, and learning |
| **Sensitivity Analysis** | Slider-based re-weighting that reveals how fragile the winning result is |
| **Decision Journal & Outcomes** | Final reflection, post-decision calibration ("successful / mixed / unsuccessful"), predicted-vs-actual |
| **Version History** | Snapshot and compare previous criteria & scores for the same decision |

### 💬 Interactive Intelligence Flow

- **Adaptive clarifying questions** — 2–4 domain-detected questions (technical, career, lifestyle, relationships, health, shopping, education, financial) that surface constraints *before* you commit.
- **Option extraction** — natural-language parsing of alternatives straight from your prompt.
- **Prompt enhancement** — AI-polished reframing of your question with category / reversibility / time-horizon metadata.
- **Think Deeper / Follow-up Q&A** — a context-aware assistant with chat history, re-scoped to your decision at hand.
- **Reversal thinking** — explicit "when should you reconsider?" conditions and opportunity-cost living.

### 🔐 Persistent, Private Decision Library

- Email/password authentication with persistent sessions (Node crypto + signed tokens)
- One-click **Demo profiling** with instant guest access and multi-user simulation
- Per-user, isolated storage of every analysis
- Tagging, favorites, search, duplicate & re-analyze
- **JSON export/import** for backup and sharing
- **PDF report export** (jsPDF)

---

## 🧠 How It Works

```
You describe a dilemma
        │
        ▼
┌─────────────────────┐
│ /api/options        │  Extract candidate options from natural language
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ /api/clarify        │  Domain detection + 2–4 sharp clarifying questions
└─────────────────────┘
        │  (answers collected)
        ▼
┌─────────────────────┐
│ /api/analyze        │  Gemini multi-model pipeline (with deterministic fallback)
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Results Dashboard   │  Overview · Pros/Cons · Compare · SWOT · Matrix · Risks · Scenarios · Think Deeper
└─────────────────────┘
        │
        ▼
  Save to your private decision library
```

---

## 🏛️ Premium Design

The Tiebreaker doesn't just think better — it *feels* better. The entire UI is built on a **modern skeuomorphic design language** that gives every element physical presence:

| Design Token | Purpose | Signature Detail |
|---|---|---|
| `skeuo-card` / `skeuo-card-interactive` | Raised surfaces (cards, decks, containers) | Layered top-light + soft ambient shadows, subtle lift on hover, physical press on click |
| `skeuo-well` / `skeuo-input` | Recessed inset surfaces (inputs, search, trays) | Directional inner shadows that mimic a depression in the material |
| `skeuo-btn-primary` / `skeuo-btn-amber` | Tactile, pressable buttons | Beveled edges with a heavier bottom border, "pressed" inset state on click |
| `skeuo-pill` / `skeuo-pill-active` | Enamel badges & indicator plates | Hard-edge gloss, engraved active state |
| `skeuo-segmented-well` | Physical hardware control trench | Inset well holding raised segmented controls |
| `skeuo-modal-shell` | Heavy glass/leather modal container | Deep multi-layer shadow system with a crisp top highlight |
| `skeuo-bubble-ai` / `skeuo-bubble-user` | Physical chat bubbles | Raised (AI) vs. recessed dark (user) material language |

The visual language is anchored in a warm **amber-on-cream palette** — parchment backgrounds (`#F4F0E8`), burnt caramel accents (`#B88E3D`), and deep espresso ink (`#241C18`) — paired with editorially spaced *Newsreader* serif display type and *Plus Jakarta Sans* for UI.

---

## 🖥 Tech Stack

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
  </tr>
  <tr>
    <td>Frontend Framework</td>
    <td>React 19 + TypeScript 5.8 + Vite 6</td>
  </tr>
  <tr>
    <td>Styling</td>
    <td>Tailwind CSS 4 + hand-crafted skeuomorphic design tokens</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>Express 4.21 (Node.js)</td>
  </tr>
  <tr>
    <td>AI Provider</td>
    <td>Google Gemini API (`@google/genai`) with multi-model failover</td>
  </tr>
  <tr>
    <td>Persistence</td>
    <td>JSON file store (disk ↔ server) with Netlify Blobs support</td>
  </tr>
  <tr>
    <td>Serverless</td>
    <td>Netlify Functions (serverless-http)</td>
  </tr>
  <tr>
    <td>PDF / Charts / Motion</td>
    <td>jsPDF, lucide-react icons, motion (Framer Motion)</td>
  </tr>
</table>

---

## 📂 Project Structure

```
the-tiebreaker/
├── assets/                    # Static assets & images
├── data/
│   └── database.json          # Local JSON persistence (users, sessions, decisions)
├── netlify/
│   ├── functions/
│   │   └── api.ts             # Serverless wrapper for the Express app
│   └── (netlify.toml at root) # Build + functions + redirects configuration
├── server/
│   ├── aiProvider.ts          # Gemini orchestration, domain detection, schema extraction, deterministic fallback
│   ├── app.ts                 # Express app, auth middleware, REST routes
│   ├── db.ts                  # User + decision storage, password hashing, session tokens, Blobs sync
│   └── optionExtractor.ts     # Natural-language option parser
├── server.ts                  # Dev/prod entrypoint (Express + Vite on port 3000)
├── src/
│   ├── App.tsx                # Shell, auth session, analysis orchestration
│   ├── index.css              # Tailwind + skeuomorphic design system tokens
│   ├── main.tsx               # React entry
│   ├── types.ts               # Decision-domain TypeScript contracts
│   ├── components/
│   │   ├── Header.tsx, Sidebar.tsx, Footer.tsx, Hero.tsx
│   │   ├── DecisionWorkspace.tsx      # Decision input wizard
│   │   ├── ResultsDashboard.tsx       # Analysis dashboard (9 tabs)
│   │   ├── DecisionHistory*.tsx       # Decision library
│   │   ├── AuthModal.tsx, UserProfileModal.tsx, SettingsModal.tsx
│   │   ├── HowItWorksModal.tsx, AboutTiebreakerView.tsx
│   │   └── ExportReportModal.tsx
│   ├── data/
│   │   ├── decisionTemplates.ts       # Reusable decision templates
│   │   └── sampleDecisions.ts         # Sample decision datasets
│   └── utils/
│       ├── api.ts                # API client
│       ├── decisionEngine.ts     # Local scoring engine
│       ├── optionExtractor.ts    # Client-side option extraction helpers
│       ├── pdfGenerator.ts       # PDF export (jsPDF)
│       └── storage.ts            # Save/local storage + decision helpers
├── index.html
├── netlify.toml               # Build, function, and redirect config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | — | Health check with server timestamp |
| `POST` | `/api/auth/register` | — | Create an account (name · email · password) |
| `POST` | `/api/auth/login` | — | Sign in and receive a bearer session token |
| `GET` | `/api/auth/me` | ✅ | Fetch the current user profile |
| `PATCH` | `/api/auth/profile` | ✅ | Update profile (name, bio, avatar, email) |
| `PUT` | `/api/auth/profile` | ✅ | Update profile (alias) |
| `POST` | `/api/auth/demo` | — | Instant demo-profile login / guest state |
| `GET` | `/api/auth/users` | — | List demo profiles for quick switching |
| `POST` | `/api/auth/switch-user` | — | Impersonate a profile (demo environment) |
| `GET` | `/api/decisions` | ✅ | List the current user's saved decisions |
| `GET` | `/api/decisions/:id` | ✅ | Fetch a single decision (owner-scoped) |
| `POST` | `/api/decisions` | ✅ | Save a decision analysis |
| `DELETE` | `/api/decisions/:id` | ✅ | Delete a decision (owner-scoped) |
| `POST` | `/api/enhance-prompt` | — | AI prompt enhancement (category, reversibility, horizon) |
| `POST` | `/api/options` | — | Extract options from a natural-language question |
| `POST` | `/api/clarify` | — | Generate clarifying questions (domain-aware) |
| `POST` | `/api/analyze` | Optional | Full multi-framework AI decision analysis |
| `POST` | `/api/think-deeper-chat` | — | Context-aware follow-up Q&A about a decision |

> **Auth:** Protected endpoints expect an `Authorization: Bearer <token>` header, returned by `/api/auth/login` or `/api/auth/register`.

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the full-stack dev server (Express + Vite on port 3000) |
| `npm run build` | Type-check, build the client (Vite), and bundle the server (esbuild) into `dist/` |
| `npm start` | Run the production build from `dist/` |
| `npm run clean` | Remove the `dist/` directory |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |

---

## 🏁 Deployment

### Netlify (Serverless)

1. **Create a site** in Netlify connected to your repository.
2. Netlify will detect `netlify.toml` with:
   - `build` → `npm run build`
   - `publish` → `dist`
   - `functions.directory` → `netlify/functions`
3. **Set the environment variable** `GEMINI_API_KEY` in Site Settings → Environment Variables.
4. All `/api/*` requests are proxied to the serverless Express function (`/.netlify/functions/api`).
5. SPA fallback routes to `index.html`.

### Docker

The project does not bake a bundled Dockerfile, but you can deploy the Node.js app in any container environment by running `npm start` after `npm run build`, exposing port **3000**.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No* | Google AI Studio API key. If missing/placeholder, the app runs in deterministic **Demo Mode**. |

> \* Without a key, all features remain accessible through the built-in offline engine. Set the key parts for full AI-powered analysis from the `Gemini flash` family with automatic failover.

**Optional advanced settings (configured via platform envs):**
- `NODE_ENV` — `production` for production builds.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes with descriptive messages.
4. Push and open a pull request from the branch.

Please make sure `npm run lint` (`tsc --noEmit`) passes before opening a PR.

---

## 📄 License

`the-tiebreaker` is a private project. All rights reserved.