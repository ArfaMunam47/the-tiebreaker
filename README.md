<div align="center">
  <img width="1200" height="475" alt="The Tiebreaker Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# The Tiebreaker

**An AI-powered decision intelligence platform that transforms complex choices into structured insights, trade-off analyses, and personalized recommendations.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?logo=google)](https://ai.google.dev/)

---

## Overview

The Tiebreaker is a sophisticated decision analysis application that helps users make better decisions through systematic, AI-driven analysis. Rather than making decisions for you, it provides comprehensive frameworks to evaluate options, identify biases, assess risks, and reveal hidden assumptions.

### Core Philosophy

> **"Don't decide for me. Help me decide better."**

The application guides users through a structured decision-making process that combines:
- **Weighted decision matrices** with customizable criteria
- **Pros & cons analysis** with impact ratings
- **SWOT analysis** for each option
- **Risk modeling** with probability, impact, and mitigation strategies
- **Scenario planning** for short and long-term outcomes
- **Cognitive bias detection** and blindspot identification
- **Personalized recommendations** aligned with your priorities

---

## Features

### 🎯 Comprehensive Decision Analysis
- **Multi-option evaluation**: Analyze 2-4 options simultaneously
- **Customizable criteria**: Set your own priorities with weighted importance
- **Clarifying questions**: AI-generated questions to refine your decision context
- **Structured output**: Consistent, actionable analysis format

### 📊 Advanced Analytics
- **Weighted scoring matrix**: Quantitative comparison across multiple criteria
- **Risk assessment**: Probability and impact ratings with mitigation strategies
- **Scenario modeling**: Short-term (1-6 months) and long-term (1-5 years) projections
- **SWOT analysis**: Strengths, weaknesses, opportunities, and threats for each option

### 🧠 Deep Thinking Tools
- **Bias detection**: Identifies cognitive biases affecting your decision
- **Assumption mapping**: Surface hidden assumptions in your reasoning
- **Blindspot questions**: Critical questions you haven't considered
- **Research guidance**: Specific items to investigate further
- **Mentor questions**: What to ask trusted advisors

### 💾 Decision Management
- **Local storage**: Save and revisit past decisions
- **Export/Import**: JSON backup of your decision history
- **Status tracking**: Mark decisions as draft, analyzed, or decided
- **Custom notes**: Add personal reflections to any analysis

### 🎨 Premium User Experience
- **Dark theme**: Elegant, distraction-free interface
- **Responsive design**: Works seamlessly on desktop and mobile
- **Sample decisions**: Pre-built examples to explore the methodology
- **Smooth animations**: Polished interactions with motion library
- **Real-time analysis**: Instant AI-powered insights

---

## Tech Stack

### Frontend
- **React 19** - UI framework with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite 6** - Fast build tool and dev server
- **Lucide React** - Beautiful icon library
- **Motion** - Animation library for smooth transitions

### Backend
- **Express.js** - REST API server
- **Google Gemini AI** - Advanced language model for analysis
- **TypeScript** - Server-side type safety
- **Vite Middleware** - Development proxy

### Key Libraries
- `@google/genai` - Gemini AI integration
- `lucide-react` - Icon system
- `motion` - Animation framework
- `dotenv` - Environment configuration

---

## Project Structure

```
the-tiebreaker/
├── src/
│   ├── components/          # React UI components
│   │   ├── Header.tsx       # Navigation and actions
│   │   ├── Hero.tsx         # Landing page with value proposition
│   │   ├── DecisionWorkspace.tsx  # Input form for decisions
│   │   ├── ResultsDashboard.tsx   # Analysis results display
│   │   ├── DecisionHistory.tsx    # Past decisions drawer
│   │   ├── HowItWorksModal.tsx    # Methodology explanation
│   │   └── Footer.tsx       # Page footer
│   ├── data/
│   │   └── sampleDecisions.ts  # Example decision analyses
│   ├── utils/
│   │   └── storage.ts       # Local storage utilities
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── server.ts                # Express backend with Gemini AI
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── index.html               # HTML entry point
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/the-tiebreaker.git
   cd the-tiebreaker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run lint

# Clean build artifacts
npm run clean
```

---

## Usage

### Analyzing a Decision

1. **Start on the homepage** - Review the methodology or jump straight to analysis
2. **Enter your decision** - Describe the choice you're facing
3. **Specify options** - List the paths you're considering (optional)
4. **Set priorities** - Define what matters most to you (optional)
5. **Answer clarifying questions** - Provide context for better analysis
6. **Review results** - Explore the comprehensive analysis dashboard
7. **Take action** - Use insights to make your decision

### Exploring Sample Decisions

Click on example decisions from the homepage to see pre-built analyses:
- **Startup Offer vs. CS Degree** - Career and education trade-offs
- **Buy Home vs. Rent & Invest** - Financial planning decisions

### Managing Your Decisions

- **History drawer**: Access all past analyses via the header
- **Export**: Download your decision history as JSON
- **Import**: Restore decisions from a backup file
- **Status tracking**: Mark decisions as draft, analyzed, or decided

---

## How It Works

### The Analysis Pipeline

1. **Input Processing**: User provides decision context, options, and priorities
2. **AI Analysis**: Gemini model generates structured analysis following a comprehensive schema
3. **Fallback System**: If AI is unavailable, a robust heuristic analysis is provided
4. **Local Storage**: Analysis is saved for future reference
5. **Interactive Dashboard**: Rich visualization of all analysis components

### Analysis Components

Each decision analysis includes:

- **Executive Summary**: High-level overview of the dilemma
- **Options**: Detailed descriptions of each alternative
- **Pros & Cons**: Weighted advantages and disadvantages
- **Comparison Matrix**: Side-by-side evaluation across criteria
- **SWOT Analysis**: Strategic assessment for each option
- **Weighted Scores**: Quantitative scoring (1-10) across criteria
- **Risk Register**: Identified risks with probability, impact, and mitigation
- **Scenarios**: Short and long-term outcome projections
- **Think Deeper**: Cognitive insights including biases and blindspots
- **Recommendation**: Data-driven suggestion with confidence level

---

## API Endpoints

### `POST /api/analyze`
Primary endpoint for decision analysis.

**Request Body:**
```json
{
  "prompt": "Should I accept a job offer or stay at my current role?",
  "options": ["Accept new job", "Stay current", "Negotiate counteroffer"],
  "priorities": ["Career growth", "Salary", "Work-life balance"],
  "clarifyingAnswers": {
    "q1": "Immediate income is crucial"
  }
}
```

**Response:** Complete `DecisionAnalysis` object with all analysis components.

### `POST /api/think-deeper-chat`
Follow-up questions for deeper exploration.

**Request Body:**
```json
{
  "decisionContext": { /* DecisionAnalysis object */ },
  "message": "What biases might be affecting this decision?",
  "chatHistory": []
}
```

**Response:**
```json
{
  "reply": "Detailed analytical response..."
}
```

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-13T00:00:00.000Z"
}
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis | Yes |
| `NODE_ENV` | Environment mode (`development` or `production`) | No |
| `PORT` | Server port (default: 3000) | No |

### Vite Configuration

The project uses Vite with React plugin and Tailwind CSS integration. See `vite.config.ts` for details.

---

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

The build process:
1. Compiles React app with Vite to `dist/`
2. Bundles server with esbuild to `dist/server.cjs`
3. Serves static files in production mode

### Deployment Platforms

The application can be deployed to:
- **Vercel** / **Netlify** (frontend only, with separate API)
- **Railway** / **Render** (full-stack)
- **AWS EC2** / **Google Cloud Run** (containerized)
- **Docker** (container deployment)

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling (no inline styles)
- Maintain component modularity
- Add types for all new data structures
- Test with sample decisions before submitting

---

## Roadmap

### Upcoming Features

- [ ] **Multi-language support** - Internationalization (i18n)
- [ ] **Decision templates** - Pre-built frameworks for common decisions
- [ ] **Collaborative analysis** - Share decisions with advisors
- [ ] **Advanced visualizations** - Charts and graphs for comparisons
- [ ] **Decision journaling** - Track outcomes vs. predictions
- [ ] **Integration APIs** - Connect with calendar, finance, and productivity tools
- [ ] **Mobile apps** - Native iOS and Android applications
- [ ] **AI model selection** - Choose between different AI models

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Google AI Studio** - For the Gemini AI API and initial project scaffolding
- **React Team** - For the amazing React 19 framework
- **Tailwind Labs** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library

---

## Support

If you have questions, feedback, or need help:

- **Email**: arfamunam01@gmail.com

---

