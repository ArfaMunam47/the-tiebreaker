# The Tiebreaker

**AI-powered decision intelligence platform that transforms complex choices into structured insights and personalized recommendations.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?logo=google)](https://ai.google.dev/)

---

## Overview

The Tiebreaker is a sophisticated decision intelligence platform that helps users make better choices through systematic, AI-driven analysis. It evaluates options, identifies biases, assesses risks, and reveals hidden assumptions—without making the decision for you.

**Core Principle:** "Don't decide for me. Help me decide better."

---

## Key Features

### Decision Analysis
- Multi-option evaluation with weighted decision matrices
- AI-generated clarifying questions with suggested answers
- Evidence classification (FACT, ASSUMPTION, INTERPRETATION, UNKNOWN)
- Comprehensive pros/cons analysis with weighted factors
- Clarification state tracking to monitor decision understanding

### Advanced Analytics
- SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
- Risk assessment with probability, impact, and mitigation strategies
- Scenario modeling (short-term and long-term projections)
- Case scenarios (best case, expected case, worst case)
- Long-term impact assessment (financial, career, time, learning, opportunity cost)
- Sensitivity analysis to identify crucial decision factors
- Weighted scoring with deterministic calculations

### Deep Thinking Tools
- Cognitive bias detection and assumption tracking
- AI-suggested alternatives (kept separate from user options)
- Think Deeper Chat for follow-up exploration
- Blindspot identification and research recommendations
- Questions to ask mentors and trusted advisors
- Confidence level evaluation based on information completeness

### Decision Management
- Multi-user authentication with persistent accounts
- Personal decision library with persistent storage
- Journal entries and outcome tracking
- Version history for decision iterations
- Export/Import JSON backup
- Status tracking (draft, clarifying, analyzed, decided)
- Decision pattern analysis across saved decisions
- Sample decision library for learning
- Demo mode for instant exploration

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Decision   │  │    Results   │  │   Decision   │  │
│  │  Workspace   │  │  Dashboard   │  │    History   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                            │
│                    ┌───────▼────────┐                   │
│                    │   Sidebar &   │                   │
│                    │ Navigation    │                   │
│                    └───────────────┘                   │
└─────────────────────────────────────────────────────────┘
                               │
                               │ HTTP/REST API
                               ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)              │
│  ┌────────────────┐  ┌──────────────────────────┐      │
│  │  /api/analyze  │  │  /api/think-deeper-chat  │      │
│  │  (AI Analysis) │  │  (Follow-up Exploration) │      │
│  └────────────────┘  └──────────────────────────┘      │
│  ┌────────────────┐  ┌──────────────────────────┐      │
│  │ /api/clarify   │  │    /api/options          │      │
│  │ (Questions)    │  │  (Option Extraction)     │      │
│  └────────────────┘  └──────────────────────────┘      │
│                            │                            │
│  ┌──────────────────────────────────────────┐          │
│  │  Authentication & Decision Library API   │          │
│  │  - /api/auth/register, login, demo       │          │
│  │  - /api/decisions (CRUD operations)      │          │
│  └──────────────────────────────────────────┘          │
│                            │                            │
│                            ▼                            │
│                  ┌──────────────────┐                   │
│                  │  Google Gemini   │                   │
│                  │   AI (gemini-    │                   │
│                  │    3.7-flash)    │                   │
│                  └──────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **React 19** - UI framework with concurrent features
- **TypeScript 5.8** - Type-safe development
- **Tailwind CSS 4.1** - Utility-first styling
- **Vite 6** - Fast build tool and dev server
- **Lucide React** - Icon library
- **Motion** - Animation library

### Backend
- **Express.js 4.21** - REST API server
- **Google Gemini AI** - LLM for decision analysis (gemini-3.7-flash)
- **TypeScript** - Type-safe server code
- **Vite** - Development middleware integration
- **SQLite** - Local database for user decisions

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ArfaMunam47/the-tiebreaker.git
cd the-tiebreaker
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create a .env file in the root directory
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run TypeScript type checking
npm run clean    # Clean build directory
```

---

## Usage

### Basic Workflow

1. **Enter Your Decision**
   - Describe the decision you're facing
   - Add the options you're considering
   - Specify your priorities and values
   - Set decision metadata (category, time horizon, reversibility)

2. **Answer Clarifying Questions**
   - AI generates targeted questions to gather context
   - Provide answers to improve analysis quality
   - Review clarification state to ensure understanding

3. **Review Comprehensive Analysis**
   - Executive summary and recommendation
   - Weighted decision matrix with scores
   - SWOT analysis for each option
   - Risk assessment with mitigation strategies
   - Scenario modeling (best/expected/worst case)
   - Long-term impact projections
   - Sensitivity analysis to identify key factors
   - Evidence classification and assumption tracking

4. **Explore Deeper Insights**
   - Use Think Deeper Chat for follow-up questions
   - Review identified cognitive biases
   - Examine assumptions and missing information
   - Get research recommendations
   - Review AI-suggested alternatives

5. **Track and Iterate**
   - Save decisions to your personal library
   - Add journal entries and track outcomes
   - Export/import decisions as JSON
   - Update outcomes and lessons learned
   - Review decision patterns across your history
   - Version control for decision iterations

### Sample Decisions

The application includes pre-built sample analyses to help you understand the platform:

- **Remote Startup Offer vs. University Degree** - Career path evaluation with 3 options
- **Buy Home vs. Rent & Invest** - Financial decision analysis with long-term impact modeling
- **More samples available in the app**

---

## API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### `POST /api/auth/login`
Authenticate user and receive session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### `POST /api/auth/demo`
Instant demo login for exploration.

**Request Body:**
```json
{
  "profile": "user_a"
}
```

#### `GET /api/auth/users`
List all demo users for quick switching.

### Decision Management Endpoints

#### `GET /api/decisions`
Get all decisions for authenticated user.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/decisions/:id`
Get specific decision by ID.

#### `POST /api/decisions`
Save a new decision analysis.

**Request Body:**
```json
{
  "analysis": {
    "id": "dec_1234567890_abc123",
    "title": "Career Path Decision",
    "summary": "Executive summary...",
    "options": [...],
    "recommendation": {...}
  }
}
```

#### `DELETE /api/decisions/:id`
Delete a decision by ID.

### Analysis Endpoints

#### `POST /api/analyze`
Performs comprehensive AI-powered decision analysis.

**Request Body:**
```json
{
  "prompt": "Should I accept a startup offer or pursue a CS degree?",
  "options": ["Join Startup", "CS Degree", "Freelance"],
  "priorities": ["Career Growth", "Financial Stability", "Learning"],
  "clarifyingAnswers": {},
  "category": "Career",
  "reversibility": "Somewhat reversible",
  "timeHorizon": "2 years",
  "clarificationState": {}
}
```

**Response:**
```json
{
  "id": "dec_1234567890_abc123",
  "title": "Career Path Decision",
  "summary": "Executive summary...",
  "originalPrompt": "Should I accept...",
  "category": "Career",
  "reversibility": "Somewhat reversible",
  "timeHorizon": "1 year",
  "userPriorities": ["Career Growth", "Financial Stability"],
  "options": [...],
  "clarificationState": {...},
  "clarifyingQuestions": [...],
  "prosCons": [...],
  "comparison": [...],
  "swot": [...],
  "criteria": [...],
  "weightedScores": {...},
  "evidenceItems": [...],
  "assumptionsList": [...],
  "aiSuggestedAlternatives": [...],
  "risks": [...],
  "scenarios": [...],
  "caseScenarios": [...],
  "longTermImpacts": [...],
  "thinkDeeper": {...},
  "sensitivityAnalysis": [...],
  "recommendation": {...},
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "status": "analyzed"
}
```

#### `POST /api/clarify`
Generate clarifying questions for a decision.

**Request Body:**
```json
{
  "prompt": "Should I accept a startup offer?",
  "options": ["Join Startup", "CS Degree"],
  "category": "Career",
  "reversibility": "Somewhat reversible",
  "timeHorizon": "2 years"
}
```

#### `POST /api/options`
Extract options from a decision question.

**Request Body:**
```json
{
  "question": "Should I work at a startup or big tech?"
}
```

**Response:**
```json
{
  "options": ["Work at Startup", "Work at Big Tech Company"]
}
```

#### `POST /api/think-deeper-chat`
Engages in follow-up exploration of a decision.

**Request Body:**
```json
{
  "decisionContext": {...},
  "message": "What are the hidden risks I'm missing?",
  "chatHistory": []
}
```

**Response:**
```json
{
  "reply": "Based on your decision context, consider..."
}
```

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Key Design Principles

### Decision Integrity
- **User options are sacred**: AI never silently adds options to your main list
- **AI suggestions are separate**: Creative alternatives are flagged as AI-suggested
- **Transparent confidence**: AI reports confidence levels and explains uncertainty
- **No hidden agendas**: The AI assists, never decides for you

### Evidence-Based Analysis
- **Clear classification**: Every claim is labeled as fact, assumption, interpretation, or unknown
- **Assumption tracking**: Monitor and confirm/reject assumptions over time
- **Source attribution**: Track whether insights come from user or AI
- **Bias detection**: Identify cognitive biases that may affect judgment

### Actionable Insights
- **Reversal conditions**: Explicit triggers that would change the recommendation
- **Opportunity costs**: Clear statement of what each option sacrifices
- **Why-not explanations**: Understand why runner-up options lost
- **Mitigation strategies**: Practical steps to reduce identified risks
- **Sensitivity analysis**: Identify which criteria most influence the decision

---

## Project Structure

```
the-tiebreaker/
├── src/
│   ├── components/          # React components
│   │   ├── AuthModal.tsx           # User authentication modal
│   │   ├── DecisionWorkspace.tsx   # Main decision input interface
│   │   ├── ResultsDashboard.tsx    # Analysis results display
│   │   ├── DecisionHistory.tsx     # Saved decisions library
│   │   ├── ExportReportModal.tsx   # Export functionality
│   │   ├── Header.tsx              # Application header
│   │   ├── Hero.tsx                # Landing page hero
│   │   ├── HowItWorksModal.tsx     # Tutorial modal
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── Footer.tsx              # Application footer
│   ├── data/               # Sample data and constants
│   │   ├── sampleDecisions.ts      # Pre-built decision examples
│   │   └── decisionTemplates.ts    # Decision templates
│   ├── utils/              # Utility functions
│   │   ├── api.ts                  # API client functions
│   │   ├── decisionEngine.ts       # Scoring, sensitivity, confidence
│   │   ├── optionExtractor.ts      # Option extraction logic
│   │   └── storage.ts              # Local storage management
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── server/                 # Backend server modules
│   ├── aiProvider.ts       # Google Gemini AI integration
│   ├── db.ts               # SQLite database operations
│   └── optionExtractor.ts  # Option extraction service
├── assets/                 # Static assets
├── data/                   # Data storage
│   └── database.json       # SQLite database file
├── server.ts               # Express backend server entry
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── index.html              # HTML entry point
├── metadata.json           # App metadata
└── README.md              # This file
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices and type safety
- Use Tailwind CSS for styling (avoid inline styles)
- Write clear, self-documenting code with comments where necessary
- Test your changes thoroughly before submitting
- Update documentation for new features

---

## Testing

### Manual Testing Checklist

- [ ] Create a new decision with custom options
- [ ] Set decision metadata (category, reversibility, time horizon)
- [ ] Answer clarifying questions
- [ ] Review analysis dashboard with all tabs
- [ ] Test Think Deeper Chat
- [ ] Review evidence classification and assumptions
- [ ] Check AI-suggested alternatives
- [ ] Save and load decisions from history
- [ ] Add journal entries and track outcomes
- [ ] Export decisions to JSON
- [ ] Import decisions from JSON
- [ ] Test sensitivity analysis
- [ ] Test on mobile viewport
- [ ] Verify fallback analysis when API is unavailable
- [ ] Test user registration and login
- [ ] Test demo mode instant login
- [ ] Test decision persistence across sessions

---

## Troubleshooting

### Common Issues

**Issue**: "GEMINI_API_KEY missing or invalid" warning
- **Solution**: Ensure your `.env` file contains a valid `GEMINI_API_KEY`
- Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

**Issue**: Port 3000 already in use
- **Solution**: Stop the conflicting process or modify the `PORT` in `server.ts`

**Issue**: Analysis returns fallback response
- **Solution**: Check your API key validity and internet connection
- Review server logs for detailed error messages

**Issue**: Decisions not persisting
- **Solution**: Ensure you're logged in (decisions are user-specific)
- Check that the `data/database.json` file is writable

---

## Roadmap

- [ ] Multi-language support
- [ ] Collaborative decision-making features
- [ ] Advanced visualization charts
- [ ] Decision templates library
- [ ] Integration with calendar and task managers
- [ ] Mobile native apps (iOS/Android)
- [ ] Team decision workflows
- [ ] Historical outcome tracking and learning
- [ ] Decision pattern insights and recommendations
- [ ] Offline mode with local AI models
- [ ] Decision sharing and collaboration

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

If you have questions, feedback, or need help:

- **Issues**: [GitHub Issues](https://github.com/ArfaMunam47/the-tiebreaker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ArfaMunam47/the-tiebreaker/discussions)
- **Email**: arfamunam01@gmail.com

---

## Related Projects

- [Google AI Studio](https://ai.google.dev/) - Build AI-powered applications
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs) - Official API docs
- [React Documentation](https://react.dev/) - Learn React
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Express.js](https://expressjs.com/) - Node.js web framework

---

## Acknowledgments

- Built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)