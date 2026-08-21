# ⚖️ The Tiebreaker

**Decision Intelligence, Crafted with Physical Presence**

The Tiebreaker is a full-stack, AI-powered decision-intelligence platform that transforms dilemmas into rigorous, multi-dimensional analysis. Describe a predicament, answer a few sharp clarifying questions, and the system synthesizes your options across structured frameworks — pros and cons, SWOT, multi-criteria scoring, risk matrices, scenario modeling, long-term impact, sensitivity analysis, and a confidence-rated recommendation with reversal triggers.

Beneath it all is a hand-crafted **skeuomorphic design system** — tactile raised cards, recessed input wells, enamel-switch buttons, and layered amber depth that make the interface feel like a physical decision instrument.

## Contents

- Quick Start
- Demo Mode
- Features
- How It Works
- Design System
- Tech Stack
- Project Structure
- API Reference
- Scripts
- Deployment
- Environment Variables
- Contributing
- License

---

## Quick Start

### Prerequisites

- **Node.js 18+** (developed with Node 22)
- **npm**, **yarn**, or **bun**
- **Gemini API key** — optional, see [Demo Mode](#demo-mode)

### Install

```bash
git clone https://github.com/ArfaMunam47/the-tiebreaker.git
cd the-tiebreaker
npm install
```

### Configure Environment

Create a `.env` file in the project root:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run

```bash
npm run dev
```

---


## Features

### AI-Powered Analysis (Gemini)

- **Multi-model failover pipeline** — attempts `gemini-flash-latest` → `gemini-3.1-flash-lite` → `gemini-3.7-flash` with sub-4-second timeouts for a fast, resilient response.
- **Domain-aware intelligence** — automatic detection of your decision domain (technical, career, lifestyle, relationships, health, shopping, education, general) that shapes the reasoning throughout.
- **Deterministic offline engine** — keeps the full workflow functional without a key or network.

### Structured Analysis Frameworks

| Framework | Purpose |
|---|---|
| Pros & Cons | Weighted (low / medium / high) arguments per option |
| Comparison Matrix | Criterion-by-criterion showdown with winners and notes |
| SWOT | Strengths, weaknesses, opportunities, threats per option |
| Multi-Criteria Decision Matrix | Weighted scoring across your own priorities with ranked outcome |
| Risk Register | Probability × impact catalogue with mitigation strategies |
| Scenario Modeling | Short-term vs long-term projections; best / expected / worst case |
| Long-Term Impact | Financial, career, time, and learning consequences per option |
| Sensitivity Analysis | Slider-based re-weighting that reveals how fragile the winning result is |
| Decision Journal | Final reflection, post-decision calibration, predicted-vs-actual |
| Version History | Snapshot and compare previous criteria and scores |

### Interactive Intelligence Flow

- **Adaptive clarifying questions** — 2–4 domain-detected questions that surface constraints before you commit.
- **Option extraction** — natural-language parsing of alternatives straight from your prompt.
- **Think Deeper / Follow-up Q&A** — a context-aware assistant with chat history, re-scoped to your decision.
- **Reversal thinking** — explicit "when should you reconsider?" conditions and opportunity-cost analysis.

### Persistent, Private Decision Library

- Email/password authentication with persistent sessions
- One-click demo profiles with instant guest access
- Per-user isolated storage of every analysis
- Tagging, favorites, search, duplicate, and re-analyze
- JSON export/import for backup and sharing
- PDF report export (jsPDF)

---

## How It Works

The core flow is simple and repeatable:

```
Describe your dilemma
        │
        ▼
Extract candidate options
        │
        ▼
Answer clarifying questions
        │
        ▼
Run AI analysis (Gemini or offline engine)
        │
        ▼
Review the Results Dashboard
        │
        ▼
Save to your private decision library
```

The Results Dashboard organizes the analysis into clear sections — Overview, Pros/Cons, Compare, SWOT, Decision Matrix, Risks, Scenarios, Future Impact, and Think Deeper.

---

## Design System

The interface is built on a modern **skeuomorphic design language** that gives every element physical presence:

| Design Token | Purpose | Signature Detail |
|---|---|---|
| `skeuo-card` / `skeuo-card-interactive` | Raised surfaces (cards, containers) | Layered top-light + ambient shadows; lift on hover, press on click |
| `skeuo-well` / `skeuo-input` | Recessed inset surfaces (inputs, trays) | Directional inner shadows mimicking a depression in material |
| `skeuo-btn-primary` / `skeuo-btn-amber` | Pressable buttons | Beveled edges, heavier bottom border, "pressed" inset state |
| `skeuo-pill` / `skeuo-pill-active` | Enamel badges and indicator plates | Hard-edge gloss, engraved active state |
| `skeuo-segmented-well` | Hardware-style control trench | Inset well holding raised segmented controls |
| `skeuo-modal-shell` | Modal container | Deep multi-layer shadow system with crisp top highlight |
| `skeuo-bubble-ai` / `skeuo-bubble-user` | Chat bubbles | Raised (AI) vs recessed dark (user) material language |

The visual language is anchored in a warm **amber-on-cream palette** — parchment backgrounds (`#F4F0E8`), burnt caramel accents (`#B88E3D`), and deep espresso ink (`#241C18`) — paired with *Newsreader* serif display type and *Plus Jakarta Sans* for interface text.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript 5.8 · Vite 6 |
| Styling | Tailwind CSS 4 + skeuomorphic design tokens |
| Backend | Express 4.21 (Node.js) |
| AI | Google Gemini API (`@google/genai`) with multi-model failover |
| Persistence | JSON file store (disk ↔ server) with Netlify Blobs support |
| Serverless | Netlify Functions (serverless-http) |
| Utilities | jsPDF (PDF export), lucide-react (icons), motion (animation) |

---

## Project Structure

```
the-tiebreaker/
├── assets/                    # Static assets and images
├── data/
│   └── database.json          # Local JSON persistence
├── netlify/
│   └── functions/
│       └── api.ts             # Serverless wrapper for the Express app
├── server/
│   ├── aiProvider.ts          # Gemini orchestration, domain detection, fallback engine
│   ├── app.ts                 # Express app, auth middleware, REST routes
│   ├── db.ts                  # Storage, password hashing, session tokens
│   └── optionExtractor.ts     # Natural-language option parser
├── server.ts                  # Dev/prod entrypoint (Express + Vite on port 3000)
├── src/
│   ├── App.tsx                # App shell, auth session, analysis orchestration
│   ├── index.css              # Tailwind + skeuomorphic design tokens
│   ├── main.tsx               # React entry
│   ├── types.ts               # TypeScript contracts
│   ├── components/            # UI components (workspace, dashboard, library, auth, modals)
│   ├── data/                  # Decision templates and sample datasets
│   └── utils/                 # API client, scoring engine, PDF generator, storage
├── index.html
├── netlify.toml               # Build, function, and redirect config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | — | Health check with server timestamp |
| `POST` | `/api/auth/register` | — | Create an account (name · email · password) |
| `POST` | `/api/auth/login` | — | Sign in and receive a session token |
| `GET` | `/api/auth/me` | ✅ | Fetch the current user profile |
| `PATCH` | `/api/auth/profile` | ✅ | Update profile (name, bio, avatar, email) |
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

Protected endpoints expect an `Authorization: Bearer <token>` header, returned by `/api/auth/login` or `/api/auth/register`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the full-stack dev server (Express + Vite on port 3000) |
| `npm run build` | Type-check, build the client (Vite), bundle the server (esbuild) into `dist/` |
| `npm start` | Run the production build from `dist/` |
| `npm run clean` | Remove the `dist/` directory |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |

---

## Deployment

### Netlify (Serverless)

1. Create a site in Netlify and connect your repository.
2. `netlify.toml` is auto-detected with:
   - build: `npm run build`
   - publish: `dist`
   - functions: `netlify/functions`
3. Set the `GEMINI_API_KEY` environment variable in Site Settings.
4. All `/api/*` requests are proxied to the serverless Express function.
5. SPA fallback routes to `index.html`.

### Traditional Hosting

After `npm run build`, run `npm start` and expose port **3000**. The server serves both the static client and the API.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No* | Google AI Studio API key. If missing/placeholder, the app runs in deterministic Demo Mode. |

> \* Without a key, all features remain accessible through the built-in offline engine.

Optional: `NODE_ENV=production` for production builds.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Commit descriptive changes and push.
4. Open a pull request.

Please make sure `npm run lint` (`tsc --noEmit`) passes before opening a PR.

---

## License

`the-tiebreaker` is a private project. All rights reserved.
