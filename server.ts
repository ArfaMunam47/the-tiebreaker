import express, { Request, Response, NextFunction } from "express";
import path from "path";
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
import { generateClarifyingQuestions, analyzeDecisionWithProviders } from "./server/aiProvider.js";

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
    const fs = require("fs");
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
  const { decisionContext, message } = req.body || {};
  try {
    const ai = getGeminiClient();

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!ai) {
      return res.json({
        reply: `Here is a deeper perspective on "${decisionContext?.title || "your decision"}": Consider setting a strict 14-day evaluation trial before committing long term. What would be your non-negotiable exit condition?`,
      });
    }

    const systemInstruction = `You are "The Tiebreaker", an authoritative, expert decision intelligence engine.
The user is asking a follow-up question on their decision titled: "${decisionContext?.title || "Decision"}".
Context:
Prompt: ${decisionContext?.originalPrompt || ""}
Options: ${JSON.stringify(decisionContext?.options || [])}
Priorities: ${JSON.stringify(decisionContext?.userPriorities || [])}
Recommendation: ${JSON.stringify(decisionContext?.recommendation || {})}

CRITICAL DIRECTIVES:
1. PRESCRIPTIVE GUIDANCE: When answering, you MUST ALWAYS provide clear, decisive guidance using: "You should choose [Option] because..." or "Based on your stated priorities, you should select [Option]...".
2. ABSOLUTE PROHIBITION OF FIRST-PERSON PRONOUNS: You are STRICTLY FORBIDDEN from using "I", "my", "me", "we", or "our" anywhere in your response. (NEVER say "I recommend", "I think", "I suggest", "I advise", "I believe", etc.). Speak strictly with direct, objective second-person guidance: "You should choose...", "Your best path is...", "This option delivers...".
3. NO SPECULATIVE PREDICTIONS: Base all analysis strictly on the user's provided options, trade-offs, constraints, and priorities.

Provide a direct, concise, and actionable response in 1-2 paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `User question: ${message}`,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const recommendedTitle = decisionContext?.recommendation?.recommendedOptionTitle || decisionContext?.options?.[0]?.title || "the top-scoring option";

    return res.json({
      reply:
        response.text ||
        `You should choose ${recommendedTitle} because it delivers the highest alignment with your stated priorities and minimizes downside trade-offs.`,
    });
  } catch (error: any) {
    console.error("Error in think-deeper-chat:", error);
    const recommendedTitle = decisionContext?.recommendation?.recommendedOptionTitle || "the top-scoring option";
    return res.json({
      reply:
        `You should choose ${recommendedTitle} because it maximizes your strategic priorities while preserving critical reversibility.`,
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
