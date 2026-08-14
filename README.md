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

### Decision Analysis
- Multi-option evaluation with weighted decision matrices
- Decision metadata (category, reversibility, time horizon)
- AI-generated clarifying questions with suggested answers
- Evidence classification (FACT, ASSUMPTION, INTERPRETATION, UNKNOWN)
- Comprehensive pros/cons analysis with weighted factors

### Advanced Analytics
- SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
- Risk assessment with probability, impact, and mitigation strategies
- Scenario modeling (best case, expected case, worst case)
- Long-term impact assessment (financial, career, time, learning)
- Sensitivity analysis with weighted scoring

### Deep Thinking Tools
- Cognitive bias detection and assumption tracking
- AI-suggested alternatives (kept separate from user options)
- Think Deeper Chat for follow-up exploration
- Blindspot identification and research recommendations
- Questions to ask mentors and trusted advisors

### Decision Management
- Local storage with persistent history
- Journal entries and outcome tracking
- Export/Import JSON backup
- Status tracking (draft, clarifying, analyzed, decided)
- Sample decision library for learning

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
│                            │                            │
│                            ▼                            │
│                  ┌──────────────────┐                   │
│                  │  Google Gemini   │                   │
│                  │   AI (gemini-    │                   │
│                  │    3.6-flash)    │                   │
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
- **Google Gemini AI** - LLM for decision analysis (gemini-3.6-flash)
- **TypeScript** - Type-safe server code
- **Vite** - Development middleware integration

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

2. **Answer Clarifying Questions**
   - AI generates targeted questions to gather context
   - Provide answers to improve analysis quality
   - Set decision metadata (category, time horizon, reversibility)

3. **Review Comprehensive Analysis**
   - Executive summary and recommendation
   - Weighted decision matrix with scores
   - SWOT analysis for each option
   - Risk assessment with mitigation strategies
   - Scenario modeling (best/expected/worst case)
   - Long-term impact projections

4. **Explore Deeper Insights**
   - Use Think Deeper Chat for follow-up questions
   - Review identified cognitive biases
   - Examine assumptions and missing information
   - Get research recommendations

5. **Track and Iterate**
   - Save decisions to local history
   - Export/import decisions as JSON
   - Update outcomes and lessons learned
   - Review past decisions for patterns

### Sample Decisions

The application includes pre-built sample analyses to help you understand the platform:

- **Startup Offer vs. CS Degree** - Career path evaluation
- **Buy Home vs. Rent & Invest** - Financial decision analysis
- **More samples available in the app**

---

## API Documentation

### Endpoints

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
  "options": [...],
  "prosCons": [...],
  "comparison": [...],
  "swot": [...],
  "criteria": [...],
  "weightedScores": {...},
  "risks": [...],
  "scenarios": [...],
  "thinkDeeper": {...},
  "recommendation": {...},
  "createdAt": "2025-01-15T10:30:00.000Z",
  "status": "analyzed"
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

---

## Project Structure

```
the-tiebreaker/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── DecisionWorkspace.tsx
│   │   ├── ResultsDashboard.tsx
│   │   ├── DecisionHistory.tsx
│   │   ├── HowItWorksModal.tsx
│   │   └── Sidebar.tsx
│   ├── data/               # Sample data and constants
│   │   └── sampleDecisions.ts
│   ├── utils/              # Utility functions
│   │   └── storage.ts      # Local storage management
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── assets/                 # Static assets
├── server.ts               # Express backend server
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
- [ ] Answer clarifying questions
- [ ] Review analysis dashboard
- [ ] Test Think Deeper Chat
- [ ] Save and load decisions from history
- [ ] Export decisions to JSON
- [ ] Import decisions from JSON
- [ ] Test on mobile viewport
- [ ] Verify fallback analysis when API is unavailable

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

---
