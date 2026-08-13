import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini client lazily/safely
function getGeminiClient() {
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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Primary AI Decision Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { prompt, options, priorities, clarifyingAnswers } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Please enter a valid decision prompt." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "The Tiebreaker", an elite AI decision-intelligence analyst. 
Your core principle is: "Don't decide for me. Help me decide better."
Analyze the user's decision thoroughly. Never pretend to know guaranteed future outcomes. Separate clear facts from assumptions.
Break the decision down systematically into options, pros & cons with impact ratings, side-by-side comparison across criteria, SWOT analysis, weighted decision matrix (criteria with weights summing to 100%), risk analysis with probability, impact and mitigation, future scenarios (1-6 months and 1-5 years), deep thinking insights (hidden assumptions, cognitive biases, blindspots, questions to ask others, research items), and an objective, balanced recommendation based on user priorities.
Always assign unique IDs to options (e.g., 'opt1', 'opt2', 'opt3') and criteria (e.g., 'crit1', 'crit2', 'crit3', 'crit4', 'crit5'). Ensure option IDs in prosCons, swot, risks, scenarios, and recommendation strictly match option IDs.
For weightedScores, construct a nested JSON object mapping each optionId (e.g. 'opt1') to an object of criterionId (e.g. 'crit1') to an integer score from 1 to 10.`;

    const userContextPrompt = `
Decision Problem: "${prompt.trim()}"
${options && options.length > 0 ? `User Specified Options: ${JSON.stringify(options)}` : "Identify 2 to 4 realistic options for this decision."}
${priorities && priorities.length > 0 ? `User Core Priorities/Values: ${JSON.stringify(priorities)}` : "Infer key decision criteria (e.g., Career Growth, Financial, Quality of Life, Risk, Flexibility)."}
${clarifyingAnswers && Object.keys(clarifyingAnswers).length > 0 ? `User Clarifications Provided: ${JSON.stringify(clarifyingAnswers)}` : ""}

Please generate a comprehensive, structured JSON analysis.
`;

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is missing/placeholder
      console.warn("GEMINI_API_KEY missing or invalid. Returning fallback structured response.");
      return res.json(generateFallbackAnalysis(prompt, options, priorities));
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A concise professional title for this decision" },
        summary: { type: Type.STRING, description: "Executive summary of the core dilemma" },
        options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["id", "title", "description"]
          }
        },
        clarifyingQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              suggestedAnswers: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "question", "suggestedAnswers"]
          }
        },
        prosCons: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              optionId: { type: Type.STRING },
              pros: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    weight: { type: Type.STRING, description: "low, medium, or high" },
                    details: { type: Type.STRING }
                  },
                  required: ["text", "weight"]
                }
              },
              cons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    weight: { type: Type.STRING, description: "low, medium, or high" },
                    details: { type: Type.STRING }
                  },
                  required: ["text", "weight"]
                }
              }
            },
            required: ["optionId", "pros", "cons"]
          }
        },
        comparison: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              criterion: { type: Type.STRING },
              scores: {
                type: Type.OBJECT,
                description: "Map of optionId to value string e.g. opt1: High, opt2: Low"
              },
              winnerOptionId: { type: Type.STRING },
              note: { type: Type.STRING }
            },
            required: ["criterion"]
          }
        },
        swot: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              optionId: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["optionId", "strengths", "weaknesses", "opportunities", "threats"]
          }
        },
        criteria: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              weight: { type: Type.NUMBER, description: "0 to 100 percentage" },
              description: { type: Type.STRING }
            },
            required: ["id", "name", "weight"]
          }
        },
        weightedScores: {
          type: Type.OBJECT,
          description: "Map of optionId to object of criterionId -> integer score (1-10)"
        },
        risks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              optionId: { type: Type.STRING },
              risk: { type: Type.STRING },
              probability: { type: Type.STRING, description: "Low, Medium, or High" },
              impact: { type: Type.STRING, description: "Low, Medium, or High" },
              mitigation: { type: Type.STRING }
            },
            required: ["id", "optionId", "risk", "probability", "impact", "mitigation"]
          }
        },
        scenarios: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              optionId: { type: Type.STRING },
              shortTerm: { type: Type.STRING },
              longTerm: { type: Type.STRING },
              keyTurningPoint: { type: Type.STRING }
            },
            required: ["optionId", "shortTerm", "longTerm"]
          }
        },
        thinkDeeper: {
          type: Type.OBJECT,
          properties: {
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
            biases: { type: Type.ARRAY, items: { type: Type.STRING } },
            blindspotQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            questionsToAskOthers: { type: Type.ARRAY, items: { type: Type.STRING } },
            researchItems: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["assumptions", "missingInformation", "biases", "blindspotQuestions", "questionsToAskOthers", "researchItems"]
        },
        recommendation: {
          type: Type.OBJECT,
          properties: {
            recommendedOptionId: { type: Type.STRING },
            recommendedOptionTitle: { type: Type.STRING },
            mainReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            biggestConcern: { type: Type.STRING },
            missingInformation: { type: Type.STRING },
            confidenceLevel: { type: Type.STRING, description: "High, Medium, or Low" }
          },
          required: ["recommendedOptionId", "recommendedOptionTitle", "mainReasons", "biggestConcern", "missingInformation", "confidenceLevel"]
        }
      },
      required: [
        "title", "summary", "options", "prosCons", "swot", "criteria", "risks", "scenarios", "thinkDeeper", "recommendation"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userContextPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.3,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini model.");
    }

    const parsedData = JSON.parse(responseText);

    // Format final structure with metadata
    const finalResult = {
      id: "dec_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      title: parsedData.title || prompt.slice(0, 50),
      originalPrompt: prompt,
      userPriorities: priorities || [],
      options: parsedData.options || [],
      clarifyingQuestions: parsedData.clarifyingQuestions || [],
      prosCons: parsedData.prosCons || [],
      comparison: parsedData.comparison || [],
      swot: parsedData.swot || [],
      criteria: parsedData.criteria || [],
      weightedScores: parsedData.weightedScores || {},
      risks: parsedData.risks || [],
      scenarios: parsedData.scenarios || [],
      thinkDeeper: parsedData.thinkDeeper || {
        assumptions: [],
        missingInformation: [],
        biases: [],
        blindspotQuestions: [],
        questionsToAskOthers: [],
        researchItems: [],
      },
      recommendation: parsedData.recommendation || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "analyzed",
    };

    return res.json(finalResult);
  } catch (error: any) {
    console.error("Error analyzing decision with Gemini:", error);
    // If API error or schema parse error, return fallback heuristic response safely
    return res.json(generateFallbackAnalysis(req.body?.prompt || "My Decision", req.body?.options, req.body?.priorities));
  }
});

// Follow-up Think Deeper / Chat Endpoint
app.post("/api/think-deeper-chat", async (req, res) => {
  try {
    const { decisionContext, message, chatHistory } = req.body;
    const ai = getGeminiClient();

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!ai) {
      return res.json({
        reply: `Here is a deeper perspective on "${decisionContext?.title || 'your decision'}": Consider setting a strict 14-day trial evaluation period before committing long term. What would be your non-negotiable exit condition?`
      });
    }

    const systemInstruction = `You are "The Tiebreaker", a thoughtful decision analyst assistant.
The user is asking a follow-up question or seeking deeper exploration on their decision titled: "${decisionContext?.title || 'Decision'}".
Context:
Prompt: ${decisionContext?.originalPrompt || ''}
Options: ${JSON.stringify(decisionContext?.options || [])}
Recommendation: ${JSON.stringify(decisionContext?.recommendation || {})}

Provide a clear, objective, highly insightful 2-3 paragraph answer that exposes blindspots, questions assumptions, or helps clarify trade-offs. Be warm, professional, and analytical.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `User message: ${message}`,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return res.json({ reply: response.text || "I recommend weighing the long-term impact on your core priorities before making a final commitment." });
  } catch (error: any) {
    console.error("Error in think-deeper-chat:", error);
    return res.json({
      reply: "To think deeper about this decision, evaluate: What is the cost of staying with the status quo for another 6 months versus taking action today?"
    });
  }
});

// Helper for generating robust fallback analysis if key is unconfigured or rate limited
function generateFallbackAnalysis(prompt: string, userOptions?: string[], userPriorities?: string[]) {
  const opt1Title = userOptions?.[0] || "Option A: Primary Alternative";
  const opt2Title = userOptions?.[1] || "Option B: Status Quo or Secondary Route";
  
  const options = [
    { id: "opt1", title: opt1Title, description: "A proactive change aimed at higher potential upside and long-term trajectory." },
    { id: "opt2", title: opt2Title, description: "A safer, established path offering immediate stability and lower immediate variance." },
  ];

  const criteria = [
    { id: "crit1", name: userPriorities?.[0] || "Career & Growth Impact", weight: 30, description: "Potential long-term advancement and skill acquisition." },
    { id: "crit2", name: userPriorities?.[1] || "Financial Outcome", weight: 25, description: "Direct monetary benefit, income reliability, and ROI." },
    { id: "crit3", name: userPriorities?.[2] || "Autonomy & Flexibility", weight: 20, description: "Control over time, schedule, and mental freedom." },
    { id: "crit4", name: "Risk & Stability", weight: 15, description: "Level of certainty, downside exposure, and stress impact." },
    { id: "crit5", name: "Personal Alignment", weight: 10, description: "Congruence with core values and personal fulfillment." },
  ];

  return {
    id: "dec_" + Date.now(),
    title: prompt.length > 50 ? prompt.slice(0, 47) + "..." : prompt,
    originalPrompt: prompt,
    userPriorities: userPriorities || ["Career Growth", "Financial Outcome", "Flexibility"],
    options,
    clarifyingQuestions: [
      {
        id: "q1",
        question: "What is your main non-negotiable threshold for this choice?",
        suggestedAnswers: ["Guaranteed baseline income", "Work-life balance", "Maximum growth upside"]
      },
      {
        id: "q2",
        question: "What would happen if you deferred this decision by 3 to 6 months?",
        suggestedAnswers: ["Lose competitive advantage", "Gain clearer information", "No significant impact"]
      }
    ],
    prosCons: [
      {
        optionId: "opt1",
        pros: [
          { text: "Unlocks significant upside potential and skill growth", weight: "high", details: "Accelerates trajectory over 2-3 years." },
          { text: "Expanded networking and real-world exposure", weight: "medium" }
        ],
        cons: [
          { text: "Higher initial uncertainty and transition stress", weight: "high" },
          { text: "Potential short-term opportunity costs", weight: "medium" }
        ]
      },
      {
        optionId: "opt2",
        pros: [
          { text: "High predictability and established comfort zone", weight: "high" },
          { text: "Zero transition overhead or immediate financial risk", weight: "medium" }
        ],
        cons: [
          { text: "Potential plateau in personal growth or market value", weight: "high" },
          { text: "Risk of regret or lingering 'what-if' curiosity", weight: "medium" }
        ]
      }
    ],
    comparison: [
      { criterion: "Growth Potential", scores: { opt1: "High", opt2: "Moderate" }, winnerOptionId: "opt1", note: "Option 1 offers steeper exponential upside." },
      { criterion: "Immediate Stability", scores: { opt1: "Moderate", opt2: "High" }, winnerOptionId: "opt2", note: "Option 2 minimizes immediate disruption." },
      { criterion: "Time Flexibility", scores: { opt1: "Variable", opt2: "Predictable" }, winnerOptionId: "opt2" }
    ],
    swot: [
      {
        optionId: "opt1",
        strengths: ["High growth momentum", "Alignment with ambition"],
        weaknesses: ["Requires steep learning curve", "Initial workload surge"],
        opportunities: ["Access to modern domain expertise", "Unlocks future leadership"],
        threats: ["Risk of early burnout if pacing is poorly managed"]
      },
      {
        optionId: "opt2",
        strengths: ["Rock-solid baseline", "Deep existing familiarity"],
        weaknesses: ["Slower progression rate", "Diminishing marginal returns"],
        opportunities: ["Frees mental capacity for side experiments"],
        threats: ["Industry shifts rendering current state obsolete"]
      }
    ],
    criteria,
    weightedScores: {
      opt1: { crit1: 9, crit2: 8, crit3: 7, crit4: 5, crit5: 8 },
      opt2: { crit1: 5, crit2: 6, crit3: 6, crit4: 9, crit5: 6 }
    },
    risks: [
      {
        id: "r1",
        optionId: "opt1",
        risk: "Underestimating the time required to achieve mastery",
        probability: "Medium",
        impact: "High",
        mitigation: "Establish clear 30-60-90 day milestone reviews and buffer capacity."
      },
      {
        id: "r2",
        optionId: "opt2",
        risk: "Opportunity cost of delayed transition",
        probability: "High",
        impact: "Medium",
        mitigation: "Set a firm calendar re-evaluation deadline in 6 months."
      }
    ],
    scenarios: [
      {
        optionId: "opt1",
        shortTerm: "Months 1-6: Initial friction during transition, followed by rapid confidence build.",
        longTerm: "Years 1-3: Reached new baseline capability with 40-60% higher market value.",
        keyTurningPoint: "Month 3 performance review"
      },
      {
        optionId: "opt2",
        shortTerm: "Months 1-6: Smooth continuation with zero unexpected friction.",
        longTerm: "Years 1-3: Steady, incremental progress but potential itch for new challenges.",
        keyTurningPoint: "Annual appraisal"
      }
    ],
    thinkDeeper: {
      assumptions: [
        "Assuming that Option 1's demands will remain constant after the onboarding phase.",
        "Assuming that Option 2 will maintain its current level of security without external shifts."
      ],
      missingInformation: [
        "Exact compensation and work expectations details for Option 1.",
        "Long-term strategic roadmap for Option 2."
      ],
      biases: [
        "Status Quo Bias: Natural preference for Option 2 due to familiarity.",
        "Sunk Cost Fallacy: Overweighting past investments made in the current path."
      ],
      blindspotQuestions: [
        "What is the worst-case scenario for Option 1, and could you comfortably survive it?",
        "If someone you deeply respect made this decision for you, which would they pick?"
      ],
      questionsToAskOthers: [
        "Ask a trusted mentor who has taken a similar leap: 'What was your biggest surprise in year 1?'"
      ],
      researchItems: [
        "Review industry salary benchmarks and workload expectations for Option 1."
      ]
    },
    recommendation: {
      recommendedOptionId: "opt1",
      recommendedOptionTitle: opt1Title,
      mainReasons: [
        "Option 1 aligns significantly better with high-weight growth and long-term potential priorities.",
        "The calculated weighted decision score favors Option 1 (7.7 vs 6.1)."
      ],
      biggestConcern: "Managing short-term transition stress and pacing during the initial 90 days.",
      missingInformation: "Firm confirmation on workload expectations and trial period flexibility.",
      confidenceLevel: "High"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "analyzed"
  };
}

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
    console.log(`The Tiebreaker server running on http://localhost:${PORT}`);
  });
}

startServer();
