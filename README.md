<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-2C221E?style=for-the-badge&labelColor=F4F0E8" alt="Version 1.0.0" />
  <img src="https://img.shields.io/badge/React-19-2C221E?style=for-the-badge&logo=react&labelColor=F4F0E8" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-2C221E?style=for-the-badge&logo=typescript&labelColor=F4F0E8" alt="TypeScript 5.8" />
  <img src="https://img.shields.io/badge/Express-4-2C221E?style=for-the-badge&logo=express&labelColor=F4F0E8" alt="Express" />
  <img src="https://img.shields.io/badge/Vite-2C221E?style=for-the-badge&logo=vite&labelColor=F4F0E8" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-2C221E?style=for-the-badge&logo=tailwindcss&labelColor=F4F0E8" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-2C221E?style=for-the-badge&logo=googlegemini&labelColor=F4F0E8" alt="Google Gemini" />
</p>

<div align="center">

# ⚖️ The Tiebreaker

### AI-Powered Decision Intelligence

**The Tiebreaker** is a full-stack AI decision-making application that helps users think through difficult choices using structured analysis.

Describe a decision, compare your options, define what matters to you, and let Tiebreaker analyze the trade-offs before giving you a clear recommendation.

</div>

---

## ✨ What Is Tiebreaker?

Making a decision is often harder than it looks.

Tiebreaker turns an unclear dilemma into a structured decision-making process.

Instead of simply asking an AI:

> "Which option should I choose?"

Tiebreaker can break the decision down into multiple dimensions, including:

* Pros and cons
* Important criteria
* Weighted scoring
* Risk analysis
* Short-term and long-term impact
* Best, expected, and worst-case scenarios
* Trade-offs
* Confidence level
* Reversal conditions
* Sensitivity analysis

The goal is not to make decisions for you.

**The goal is to help you understand your options and make a better-informed decision.**

---

## 🎯 Core Features

### 🧠 AI Decision Analysis

Uses Google Gemini to analyze decisions and generate structured recommendations.

If Gemini is unavailable, Tiebreaker can fall back to a local rule-based analysis engine so the core workflow can still be explored.

### 💬 Clarifying Questions

Before analyzing a complex decision, Tiebreaker can ask targeted questions to better understand the user's priorities and situation.

### 📊 Decision Matrix

Compare options using weighted criteria and see how each option performs against the factors that matter most.

### ⚖️ Recommendations

Get a recommendation with:

* Reasoning
* Trade-offs
* Confidence
* Alternative considerations
* Conditions that could change the recommendation

### 🔍 Think Deeper

Continue the conversation after an analysis and ask follow-up questions while keeping the current decision in context.

### 🔄 Reframing

Explore the decision from another perspective and identify factors that may have been overlooked.

### ⚠️ Risk Analysis

Identify potential risks for each option and consider their probability, impact, and possible mitigation.

### 📈 Sensitivity Analysis

Change the importance of different criteria and see how those changes affect the final recommendation.

### 📚 Decision Library

Save and manage previous decisions for later review.

Depending on the current implementation, users can:

* Search decisions
* Add tags
* Favorite decisions
* Duplicate decisions
* Re-run analysis
* Review previous decisions

### 📝 Decision Journal

Record thoughts and reflections before and after making a decision and compare predicted outcomes with actual results.

### 📄 PDF Export

Export completed decision reports as readable PDF documents.

### 💾 Data Export

Export decision data in JSON format for backup or restoration.

---

# 🎨 Design

Tiebreaker uses a **modern neo-skeuomorphic design system**.

The interface combines a warm editorial visual style with tactile UI elements.

### Design characteristics

* Raised surfaces
* Recessed input fields
* Tactile buttons
* Layered shadows
* Subtle depth
* Warm cream backgrounds
* Amber accents
* Dark espresso typography

### Color palette

| Color      | Hex       | Usage           |
| ---------- | --------- | --------------- |
| Parchment  | `#F4F0E8` | Main background |
| Caramel    | `#B88E3D` | Primary accent  |
| Espresso   | `#241C18` | Primary text    |
| Dark Brown | `#2C221E` | UI surfaces     |

Typography combines **Newsreader** for prominent display text with **Plus Jakarta Sans** for interface elements.

---

# 🛠️ Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Recharts

## Backend

* Node.js
* Express
* TypeScript
* `tsx`

## AI

* Google Gemini API
* `@google/generative-ai`
* Local fallback analysis engine

## Data

* JSON-based persistence
* `server/data/db.json`

## Deployment

* Netlify

---

# 🏗️ Architecture

Tiebreaker uses a React frontend connected to an Express backend.

```text
┌─────────────────────────────┐
│        React Frontend       │
│                             │
│  Decision Wizard            │
│  Clarification              │
│  Analysis Dashboard         │
│  Decision Library           │
│  Chat / Think Deeper        │
└──────────────┬──────────────┘
               │
               │ HTTP API
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│                             │
│  Authentication             │
│  Decision APIs              │
│  AI APIs                    │
│  Data Persistence            │
└──────────────┬──────────────┘
               │
        ┌──────┴───────┐
        ▼              ▼
   Google Gemini    Local AI
                     Fallback
```

---

# 📁 Project Structure

```text
the-tiebreaker/
│
├── assets/
│   └── # Static assets
│
├── data/
│   ├── db.json
│   └── sample-data.json
│
├── server/
│   ├── index.ts
│   ├── db.ts
│   └── ai.ts
│
├── src/
│   ├── components/
│   │   ├── AnalysisDashboard.tsx
│   │   ├── ClarificationPage.tsx
│   │   ├── DecisionWizard.tsx
│   │   ├── WorkspaceShell.tsx
│   │   └── ...
│   │
│   ├── data/
│   ├── App.tsx
│   └── ...
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> The structure above represents the main application areas. Additional components and files may exist inside `src/`.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js 18 or newer
* npm
* A Google Gemini API key for AI-powered analysis

The project was developed using Node.js 22.

---

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd the-tiebreaker
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit your API key to GitHub.

Make sure `.env` is included in `.gitignore`.

---

## 4. Start the development server

```bash
npm run dev
```

This starts the Express backend and Vite development server together.

Open the local URL shown by Vite in your browser.

---

# 📜 Available Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start frontend and backend in development mode |
| `npm run build`   | Type-check and build the production frontend   |
| `npm run preview` | Preview the production frontend                |
| `npm start`       | Start the compiled backend                     |

---

# 🔌 API

The application exposes REST endpoints for authentication, decisions, AI analysis, friends, and related features.

## Health

```http
GET /api/health
```

Checks whether the backend is running.

---

## Authentication

```http
POST /api/login
```

Handles user authentication/registration according to the current authentication implementation.

---

## Decisions

```http
POST /api/decisions
```

Create/save a decision.

```http
GET /api/decisions?userId=<id>
```

Retrieve a user's decisions.

```http
PUT /api/decisions/:id
```

Update a decision.

```http
DELETE /api/decisions/:id
```

Delete a decision.

---

## AI

```http
POST /api/ai/clarify
```

Generate clarifying questions.

```http
POST /api/ai/analyze
```

Run the main decision analysis.

```http
POST /api/ai/enhance
```

Improve and clarify a user's decision prompt.

```http
POST /api/ai/reframe
```

Generate alternative perspectives on a decision.

```http
POST /api/ai/write
```

Generate AI-assisted reflection/journal content.

---

## Social / Friends

```http
POST /api/friends
```

Add a friend.

```http
GET /api/friends/:userId
```

Retrieve a user's friends.

```http
POST /api/friends/requests
```

Send a friend request.

```http
POST /api/friends/accept
```

Accept a friend request.

```http
POST /api/friends/notify
```

Send a decision notification.

---

## Insights

```http
GET /api/insights/crowd
```

Retrieve crowd decision insights.

---

# 🤖 AI Fallback

Tiebreaker is designed to remain usable even when the Gemini API is unavailable.

The application can fall back to a local rule-based analysis engine for the core decision workflow.

This provides a graceful experience during:

* Missing API keys
* API failures
* Temporary service issues
* Development without Gemini access

The Gemini-powered path provides more advanced contextual analysis.

---

# 🔐 Data & Privacy

Tiebreaker currently uses JSON-based persistence for application data.

Primary data storage:

```text
server/data/db.json
```

Do not commit sensitive production credentials or API keys to the repository.

For production deployments, review the current persistence and authentication architecture before using the application with sensitive personal data.

---

# 🌐 Deployment

The frontend can be deployed using Netlify.

Before deployment:

1. Build the application.

```bash
npm run build
```

2. Configure the required environment variables.

3. Configure the backend/API deployment appropriately.

4. Verify that the frontend can reach the production API.

5. Test authentication and AI functionality in production.

> **Important:** Because the project contains an Express backend, deploying the frontend alone is not sufficient unless the backend API is also available through the deployment architecture.

---

# 🧪 Current Status

**Version:** `1.0.0`

The application currently includes:

* AI-powered decision analysis
* Clarifying questions
* Decision scoring
* Risk analysis
* Scenario analysis
* Follow-up AI conversations
* Decision persistence
* PDF export
* JSON export/import
* Authentication
* Responsive UI
* Neo-skeuomorphic design

---

# 🗺️ Future Improvements

Potential areas for future development include:

* More advanced authentication
* Production-grade database storage
* Improved AI model routing
* More decision frameworks
* Advanced analytics
* Better collaboration features
* Expanded decision history
* Improved mobile experience
* More export formats

---

# 📄 License

This project is currently a **private project**.

All rights reserved.

---

<div align="center">

### ⚖️ The Tiebreaker

**Think clearly. Compare deeply. Decide confidently.**

</div>
