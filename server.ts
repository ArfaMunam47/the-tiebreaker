import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  createUser,
  findUserByEmail,
  findUserById,
  getOrCreateDemoUser,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  getDecisionsForUser,
  getDecisionById,
  saveDecisionForUser,
  deleteDecisionForUser,
} from "./server/db.js";
import { extractAlternativesFromQuestion } from "./server/optionExtractor.js";
import { generateClarifyingQuestions, analyzeDecisionWithProviders, generateContentWithRetryAndFallback } from "./server/aiProvider.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Express Request extension for authenticated user
export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; name: string };
}

// Authentication Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }

  const userPayload = verifySessionToken(token);
  if (!userPayload) {
    return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
  }

  req.user = userPayload;
  next();
}

// Optional Auth Middleware (attaches user if token present)
export function optionalAuthenticateToken(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (token) {
    const userPayload = verifySessionToken(token);
    if (userPayload) {
      req.user = userPayload;
    }
  }
  next();
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ==========================================
// AUTHENTICATION & MULTI-USER API ROUTES
// ==========================================

app.post("/api/auth/register", (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = createUser(email, password, name);
    const token = createSessionToken(user);

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to create account." });
  }
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createSessionToken(user);
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to sign in." });
  }
});

app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }
  return res.json({
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
  });
});

// Demo Auth Endpoint: Instant login for demo profiles and initial guest state
app.post("/api/auth/demo", (req: Request, res: Response) => {
  try {
    const { profile = "user_a" } = req.body || {};
    const user = getOrCreateDemoUser(profile);
    const token = createSessionToken(user);
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  } catch (err: any) {
    console.error("Demo auth error:", err);
    return res.status(500).json({ error: "Failed to initialize demo account." });
  }
});

// Switcher: List existing profiles for instant multi-user simulation
app.get("/api/auth/users", (_req: Request, res: Response) => {
  try {
    const dbPath = path.join(process.cwd(), "data", "database.json");
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const sanitized = (data.users || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      }));
      return res.json({ users: sanitized });
    }
    return res.json({ users: [] });
  } catch (e) {
    return res.json({ users: [] });
  }
});

// Quick Switcher: Impersonate user without retyping password in demo environment
app.post("/api/auth/switch-user", (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required." });
    const user = findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const token = createSessionToken(user);
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to switch user." });
  }
});

// ==========================================
// PERSISTENT DECISION LIBRARY API ROUTES
// ==========================================

app.get("/api/decisions", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const decisions = getDecisionsForUser(req.user!.id);
    return res.json({ decisions });
  } catch (err: any) {
    console.error("Error fetching decisions:", err);
    return res.status(500).json({ error: "Failed to load decisions library." });
  }
});

app.get("/api/decisions/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const decision = getDecisionById(req.params.id, req.user!.id);
    if (!decision) {
      return res.status(404).json({ error: "Decision not found." });
    }
    return res.json({ decision });
  } catch (err: any) {
    console.error("Error fetching single decision:", err);
    return res.status(500).json({ error: "Failed to load decision." });
  }
});

app.post("/api/decisions", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const analysis = req.body.analysis || req.body;
    if (!analysis || !analysis.id) {
      return res.status(400).json({ error: "Valid decision analysis object is required." });
    }

    const saved = saveDecisionForUser(req.user!.id, analysis);
    return res.json({ decision: saved });
  } catch (err: any) {
    console.error("Error saving decision:", err);
    return res.status(500).json({ error: "Failed to save decision." });
  }
});

app.delete("/api/decisions/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = deleteDecisionForUser(req.params.id, req.user!.id);
    if (!deleted) {
      return res.status(404).json({ error: "Decision not found or already removed." });
    }
    return res.json({ success: true, message: "Decision deleted successfully." });
  } catch (err: any) {
    if (err.message && err.message.includes("Unauthorized")) {
      return res.status(403).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to delete decision." });
  }
});

// ==========================================
// OPTION EXTRACTION API
// ==========================================

app.post("/api/options", (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required." });
    }
    const alternatives = extractAlternativesFromQuestion(question);
    return res.json({ options: alternatives });
  } catch (err) {
    console.error("Error extracting options:", err);
    return res.status(500).json({ error: "Failed to extract options." });
  }
});

// ==========================================
// INTERACTIVE CLARIFYING QUESTIONS ENDPOINT
// ==========================================

app.post("/api/clarify", async (req: Request, res: Response) => {
  try {
    const { prompt, options, category, reversibility, timeHorizon } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Please provide a valid decision dilemma." });
    }

    const clarification = await generateClarifyingQuestions(
      prompt.trim(),
      Array.isArray(options) ? options : [],
      category,
      reversibility,
      timeHorizon
    );

    return res.json(clarification);
  } catch (error: any) {
    console.error("Error in /api/clarify:", error);
    return res.status(500).json({ error: "Failed to generate clarifying questions." });
  }
});

// ==========================================
// INDEPENDENT AI DECISION ANALYSIS ENDPOINT
// ==========================================

app.post("/api/analyze", optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt, options, priorities, clarifyingAnswers, category, reversibility, timeHorizon, clarificationState } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Please enter a valid decision question." });
    }

    const analysis = await analyzeDecisionWithProviders({
      prompt: prompt.trim(),
      options: Array.isArray(options) ? options : [],
      priorities: Array.isArray(priorities) ? priorities : [],
      clarifyingAnswers: typeof clarifyingAnswers === "object" ? clarifyingAnswers : {},
      category,
      reversibility,
      timeHorizon,
      clarificationState,
    });

    // Auto-save to authenticated user's private database library
    if (req.user) {
      saveDecisionForUser(req.user.id, analysis);
    }

    return res.json(analysis);
  } catch (error: any) {
    console.error("Critical error in /api/analyze:", error);
    return res.status(500).json({ error: "Failed to complete decision analysis." });
  }
});

// ==========================================
// FOLLOW-UP THINK DEEPER / CHAT ENDPOINT
// ==========================================

app.post("/api/think-deeper-chat", async (req: Request, res: Response) => {
  const { decisionContext, message, history } = req.body || {};
  try {
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();
    const cleanMsg = message.trim();
    const recommendedTitle =
      decisionContext?.recommendation?.recommendedOptionTitle ||
      decisionContext?.options?.[0]?.title ||
      "the top-scoring option";
    const altTitle =
      decisionContext?.options?.find(
        (o: any) =>
          o.title !== recommendedTitle &&
          o.id !== decisionContext?.recommendation?.recommendedOptionId
      )?.title || "the alternative option";

    // Domain and prompt context
    const domain = decisionContext?.recommendation?.domain || "general";
    const originalPrompt = decisionContext?.originalPrompt || decisionContext?.title || "";

    const systemInstruction = `You are "The Tiebreaker", an authoritative, expert decision intelligence engine.
The user is having a conversation regarding their decision titled: "${decisionContext?.title || "Decision"}".
Context:
- Original Dilemma: "${originalPrompt}"
- Category: ${decisionContext?.category || "General"}
- Domain: ${domain}
- Evaluated Options: ${JSON.stringify(decisionContext?.options || [])}
- User Priorities: ${JSON.stringify(decisionContext?.userPriorities || [])}
- Multi-Criteria Recommendation: ${JSON.stringify(decisionContext?.recommendation || {})}
- Conversation History: ${JSON.stringify(history || [])}

CRITICAL DIRECTIVES:
1. DOMAIN AWARENESS:
   - For TECHNICAL decisions (PostgreSQL vs MongoDB, React vs Vue): Answer strictly based on data integrity, ACID consistency, developer velocity, ecosystem tooling, and query models. Never mention career/salary.
   - For LIFESTYLE / DAILY LIFE (e.g. resting when tired, cooking vs ordering): Answer strictly based on physical recovery, energy, social connection, and personal well-being.
   - For CAREER: Focus on compounding growth, compensation, learning ceiling, and autonomy.
2. CONTEXT ADAPTATION:
   - If the user provides new information (e.g. "What if I only have 3 months?" or "Actually, I know JavaScript"), adapt your analysis immediately to factor in that constraint.
   - If the user asks "Why did you choose the first option?" or "What about the second option?", explain the exact trade-offs, criteria scores, and conditions where each option excels.
3. ABSOLUTE PROHIBITION OF FIRST-PERSON PRONOUNS:
   - You are STRICTLY FORBIDDEN from using "I", "my", "me", "we", or "our".
   - Always phrase advice in direct, objective second-person guidance ("You should choose...", "Your primary advantage is...", "This option delivers...").
4. Provide a direct, structured, 1-2 paragraph response with concrete reasoning.`;

    if (ai) {
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: `User message: "${cleanMsg}"`,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        return res.json({ reply: response.text.trim() });
      }
    }

    // Deterministic fallback response when AI is offline or unavailable
    const lower = cleanMsg.toLowerCase();
    let fallbackReply = `You should choose ${recommendedTitle} because it delivers the highest overall score against your primary decision criteria.`;

    if (lower.includes('why') && (lower.includes('first') || lower.includes('choose') || lower.includes('recommend'))) {
      const mainReasons = decisionContext?.recommendation?.mainReasons || [];
      const reasonText = mainReasons.length > 0 ? mainReasons.join(' ') : `it maximizes long-term upside while minimizing downside risk.`;
      fallbackReply = `You should prioritize ${recommendedTitle} because ${reasonText} Relative to ${altTitle}, this choice offers superior alignment with your top-weighted priorities and minimizes post-decision regret.`;
    } else if (lower.includes('second') || (lower.includes('what about') && altTitle && lower.includes(altTitle.toLowerCase()))) {
      fallbackReply = `${altTitle} remains a viable secondary path if your immediate constraints shift. It is best suited when your primary goal is rapid, low-friction execution rather than the deeper compounding benefits provided by ${recommendedTitle}.`;
    } else if (lower.includes('month') || lower.includes('timeline') || lower.includes('time') || lower.includes('urgent')) {
      fallbackReply = `If your timeline is constrained to a shorter window, you should focus on the fastest high-impact milestones of ${recommendedTitle}. If immediate delivery within that timeframe is non-negotiable, evaluate whether ${altTitle} offers a simpler stepping stone.`;
    } else if (lower.includes('javascript') || lower.includes('python') || lower.includes('experience') || lower.includes('already know')) {
      fallbackReply = `Having prior experience significantly reduces the onboarding curve. This makes ${recommendedTitle} even more advantageous by accelerating your execution speed and eliminating initial learning friction.`;
    } else if (lower.includes('tired') || lower.includes('rest') || lower.includes('sleep')) {
      fallbackReply = `You should take time to rest and recharge. Pushing through acute fatigue yields diminishing returns, impairs decision quality, and increases burnout risk. Stepping away restores your physical and mental baseline.`;
    }

    return res.json({ reply: fallbackReply });
  } catch (err) {
    console.error("Error in /api/think-deeper-chat:", err);
    return res.json({
      reply: `You should proceed with the recommended path because it provides the strongest practical balance for your specific situation.`,
    });
  }
});

// ==========================================
// VITE & SERVER BOOTSTRAP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tie Breaker server running on http://localhost:${PORT}`);
  });
}

startServer();
