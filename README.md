<div align="center">
  <img width="1200" height="475" alt="The Tiebreaker Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# The Tiebreaker

**AI-powered decision intelligence platform that transforms complex choices into structured insights and personalized recommendations.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?logo=google)](https://ai.google.dev/)

---

## Overview

The Tiebreaker helps users make better decisions through systematic, AI-driven analysis. It evaluates options, identifies biases, assesses risks, and reveals hidden assumptions—without making the decision for you.

**Core Principle:** "Don't decide for me. Help me decide better."

---

## Features

**Decision Analysis**
- Multi-option evaluation with weighted decision matrices
- Decision metadata (category, reversibility, time horizon)
- AI-generated clarifying questions
- Evidence classification (FACT, ASSUMPTION, INTERPRETATION, UNKNOWN)

**Advanced Analytics**
- SWOT analysis, risk assessment, scenario modeling
- Long-term impact assessment (financial, career, time, learning)
- Sensitivity analysis

**Deep Thinking Tools**
- Cognitive bias detection and assumption tracking
- AI-suggested alternatives (kept separate from user options)
- Think Deeper Chat for follow-up exploration

**Decision Management**
- Local storage with history, journal entries, and outcome tracking
- Export/Import JSON backup
- Status tracking (draft, clarifying, analyzed, decided)

---

## Tech Stack

**Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite 6, Lucide React, Motion

**Backend:** Express.js, Google Gemini AI (gemini-3.6-flash), TypeScript

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
git clone https://github.com/ArfaMunam47/the-tiebreaker.git
cd the-tiebreaker
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
npm run dev
```

Open `http://localhost:3000`

### Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
```

---

## Usage

1. Enter your decision and optional context (options, priorities, category)
2. Answer AI-generated clarifying questions
3. Review comprehensive analysis dashboard
4. Track outcomes and lessons learned

**Sample Decisions:** Startup Offer vs. CS Degree, Buy Home vs. Rent & Invest

---

## API Endpoints

- `POST /api/analyze` - Decision analysis
- `POST /api/think-deeper-chat` - Follow-up exploration
- `GET /api/health` - Health check

---

## Key Design Principles

**Decision Integrity:** AI never silently adds options. Creative alternatives are flagged as AI-suggested.

**Evidence-Based Analysis:** Claims classified as fact, assumption, interpretation, or unknown.

**Actionable Insights:** Recommendations include reversal conditions and opportunity costs.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit and push changes
4. Open a Pull Request

---

## License

MIT License

---

## Support

- **Issues:** [GitHub Issues](https://github.com/ArfaMunam47/the-tiebreaker/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ArfaMunam47/the-tiebreaker/discussions)
- **Email:** support@thetiebreaker.app

---

<div align="center">
  <p>Built with ❤️ using React, TypeScript, and Google Gemini AI</p>
  <p>
    <a href="https://github.com/ArfaMunam47/the-tiebreaker">Star on GitHub</a> •
    <a href="https://github.com/ArfaMunam47/the-tiebreaker/issues">Report Bug</a> •
    <a href="https://github.com/ArfaMunam47/the-tiebreaker/issues">Request Feature</a>
  </p>
</div>