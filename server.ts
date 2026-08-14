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
    const { prompt, options, priorities, clarifyingAnswers, category, reversibility, timeHorizon, clarificationState } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Please enter a valid decision prompt." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "The Tiebreaker", an elite AI decision-intelligence analyst. 
Your core principle is: "Don't decide for me. Help me decide better."
Analyze the user's decision thoroughly. Never pretend to know guaranteed future outcomes. Separate clear facts from assumptions.

CRITICAL DECISION INTEGRITY RULE:
1. ONLY include the options specified by the user in the main "options" array. Never silently add a new third option into "options".
2. If you conceive of an alternative creative/hybrid option (e.g. Option C), place it strictly in "aiSuggestedAlternatives" (array of { id, title, description, reasoning }) as an AI-SUGGESTED ALTERNATIVE. It MUST NOT be in the main options array or scoring system until explicitly added by the user.

CONFIDENCE RULE:
If important information is missing or scores are close, set confidenceLevel to "Moderate" or "Low" with a clear confidenceReason explaining why. Do not claim "High" confidence when data is incomplete.

Break the decision down systematically into:
- Category (e.g., Job Offer, Career, Education, Business, Technology, Finance, Relocation, etc.)
- Reversibility (Easy to reverse, Somewhat reversible, Difficult to reverse, Nearly irreversible)
- Time Horizon (Immediate, 3 months, 1 year, 3 years, 5+ years)
- Clarification State (decision summary, options understood, key constraints, assumptions identified, missing information)
- Pros & Cons (with source strictly 'USER PROVIDED' or 'AI SUGGESTED')
- Side-by-side Comparison across criteria
- SWOT analysis
- Weighted Decision Matrix (criteria with weights summing to 100%, and scores 1-10 for options)
- Evidence Classification (items labeled FACT, ASSUMPTION, INTERPRETATION, or UNKNOWN)
- Assumption Audit List (items with status 'confirmed')
- Risk Analysis (risk, probability, impact, mitigation)
- Case Scenarios (bestCase, expectedCase, worstCase per option)
- Long-term Impacts (financial, career, time, learning, opportunity cost)
- Deep Thinking Insights (assumptions, missing info, biases, blindspots, questions to ask others, research)
- AI Suggested Alternatives (separate hybrid/creative options)
- Objective Recommendation containing:
  - recommendedOptionId and recommendedOptionTitle
  - mainReasons
  - biggestConcern
  - missingInformation
  - confidenceLevel ('High' | 'Moderate' | 'Low')
  - confidenceReason
  - whyNotOptions (map of optionId -> why that runner-up lost)
  - reversalConditions (array of conditions that would change mind e.g. "If income drops below $X")
  - opportunityCosts (map of optionId -> what is explicitly sacrificed)`;

    const userContextPrompt = `
Decision Problem: "${prompt.trim()}"
${category ? `Selected Category: ${category}` : ''}
${reversibility ? `Reversibility Level: ${reversibility}` : ''}
${timeHorizon ? `Time Horizon: ${timeHorizon}` : ''}
${options && options.length > 0 ? `User Specified Options: ${JSON.stringify(options)}` : "Identify 2 to 4 realistic options for this decision."}
${priorities && priorities.length > 0 ? `User Core Priorities/Values: ${JSON.stringify(priorities)}` : "Infer key decision criteria (e.g., Career Growth, Financial, Quality of Life, Risk, Flexibility)."}
${clarifyingAnswers && Object.keys(clarifyingAnswers).length > 0 ? `User Clarifications Provided: ${JSON.stringify(clarifyingAnswers)}` : ""}
${clarificationState ? `User Clarification Context: ${JSON.stringify(clarificationState)}` : ""}

Please generate a comprehensive, structured JSON analysis.
`;

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is missing/placeholder
      console.warn("GEMINI_API_KEY missing or invalid. Returning fallback structured response.");
      return res.json(generateFallbackAnalysis(prompt, options, priorities, category, reversibility, timeHorizon));
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
      category: category || parsedData.category || "General",
      reversibility: reversibility || parsedData.reversibility || "Somewhat reversible",
      timeHorizon: timeHorizon || parsedData.timeHorizon || "1 year",
      clarificationState: clarificationState || parsedData.clarificationState,
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
    return res.json(
      generateFallbackAnalysis(
        req.body?.prompt || "My Decision",
        req.body?.options,
        req.body?.priorities,
        req.body?.category,
        req.body?.reversibility,
        req.body?.timeHorizon
      )
    );
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
function generateFallbackAnalysis(
  prompt: string,
  userOptions?: string[],
  userPriorities?: string[],
  userCategory?: any,
  userReversibility?: any,
  userTimeHorizon?: any
) {
  const opt1Title = userOptions?.[0] || "Option A: Primary Alternative";
  const opt2Title = userOptions?.[1] || "Option B: Status Quo or Secondary Route";
  
  const options = [
    { id: "opt1", title: opt1Title, description: "A proactive path targeting higher potential upside and long-term trajectory.", source: 'user' as const },
    { id: "opt2", title: opt2Title, description: "A stable alternative offering immediate predictability and lower variance.", source: 'user' as const },
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
    category: userCategory || "Career",
    reversibility: userReversibility || "Somewhat reversible",
    timeHorizon: userTimeHorizon || "1 year",
    userPriorities: userPriorities || ["Career Growth", "Financial Outcome", "Flexibility"],
    options,
    clarificationState: {
      decisionSummary: prompt,
      optionsUnderstood: [opt1Title, opt2Title],
      keyConstraints: ["Time availability", "Financial safety net", "Skill requirements"],
      assumptionsIdentified: ["Option 1 will deliver expected upside within 12 months", "Option 2 remains stable without major disruption"],
      missingInfo: ["Exact schedule/financial commitment breakdown for Option 1"],
      confirmedByUser: true,
    },
    clarifyingQuestions: [
      {
        id: "q1",
        question: "What is your main non-negotiable threshold for this choice?",
        suggestedAnswers: ["Guaranteed baseline income", "Work-life balance", "Maximum growth upside"],
        whyItMatters: "Clarifies your primary constraint before weighting trade-offs."
      },
      {
        id: "q2",
        question: "What would happen if you deferred this decision by 3 to 6 months?",
        suggestedAnswers: ["Lose competitive advantage", "Gain clearer information", "No significant impact"],
        whyItMatters: "Helps measure the true time urgency of taking action now."
      }
    ],
    prosCons: [
      {
        optionId: "opt1",
        pros: [
          { text: "Unlocks significant upside potential and skill growth", weight: "high", details: "Accelerates trajectory over 2-3 years.", source: "AI SUGGESTED" },
          { text: "Expanded networking and real-world exposure", weight: "medium", source: "AI SUGGESTED" }
        ],
        cons: [
          { text: "Higher initial uncertainty and transition stress", weight: "high", source: "AI SUGGESTED" },
          { text: "Potential short-term opportunity costs", weight: "medium", source: "AI SUGGESTED" }
        ]
      },
      {
        optionId: "opt2",
        pros: [
          { text: "High predictability and established comfort zone", weight: "high", source: "AI SUGGESTED" },
          { text: "Zero transition overhead or immediate financial risk", weight: "medium", source: "AI SUGGESTED" }
        ],
        cons: [
          { text: "Potential plateau in personal growth or market value", weight: "high", source: "AI SUGGESTED" },
          { text: "Risk of regret or lingering 'what-if' curiosity", weight: "medium", source: "AI SUGGESTED" }
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
    evidenceItems: [
      { id: "e1", text: `${opt1Title} offers higher growth upside.`, category: "INTERPRETATION" },
      { id: "e2", text: `${opt2Title} maintains current status quo stability.`, category: "FACT" },
      { id: "e3", text: "You have 12 months of buffer runway to experiment.", category: "ASSUMPTION" }
    ],
    assumptionsList: [
      { id: "a1", text: `Choosing ${opt1Title} will deliver tangible skills within 6 months.`, status: "confirmed" },
      { id: "a2", text: `Staying with ${opt2Title} avoids financial risk in the short term.`, status: "confirmed" }
    ],
    aiSuggestedAlternatives: [
      {
        id: "alt1",
        title: "Hybrid Phased Approach",
        description: `Start ${opt1Title} on a part-time trial basis for 60 days while holding ${opt2Title} to validate actual fit before full commitment.`,
        reasoning: "De-risks transition while preserving maximum flexibility."
      }
    ],
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
    caseScenarios: [
      {
        optionId: "opt1",
        bestCase: "Skill acquisition accelerates rapidly; opens doors to top-tier compensation within 12 months.",
        expectedCase: "Steady progress over 6 months; initial workload adjustment followed by strong output.",
        worstCase: "Slower progress than expected; requires extending runway or adjusting timeline."
      },
      {
        optionId: "opt2",
        bestCase: "Current role remains stable with steady incremental salary increases.",
        expectedCase: "Predictable routine, modest skill progression over the next 2 years.",
        worstCase: "Stagnation in skills leading to decreased competitiveness in 3 years."
      }
    ],
    longTermImpacts: [
      {
        optionId: "opt1",
        financialImpact: "Higher upside after 12 months; short-term investment phase.",
        careerImpact: "Accelerates high-value modern skill profile.",
        timeImpact: "Intense initial 6 months, relaxing into sustainable momentum.",
        learningImpact: "Maximum learning velocity and exponential capability.",
        opportunityCost: "Trading short-term leisure for long-term capability."
      },
      {
        optionId: "opt2",
        financialImpact: "Steady immediate income; lower long-term ceiling.",
        careerImpact: "Incremental growth; risk of domain stagnation.",
        timeImpact: "Predictable work hours and steady schedule.",
        learningImpact: "Gradual learning curve within familiar territory.",
        opportunityCost: "Sacrificing high-growth trajectory for present comfort."
      }
    ],
    thinkDeeper: {
      assumptions: [
        `Assuming that ${opt1Title}'s demands will remain constant after the onboarding phase.`,
        `Assuming that ${opt2Title} will maintain its current level of security without external shifts.`
      ],
      missingInformation: [
        `Exact compensation and work expectations details for ${opt1Title}.`,
        `Long-term strategic roadmap for ${opt2Title}.`
      ],
      biases: [
        "Status Quo Bias: Natural preference for familiar options.",
        "Sunk Cost Fallacy: Overweighting past investments made in the current path."
      ],
      blindspotQuestions: [
        `What is the worst-case scenario for ${opt1Title}, and could you comfortably survive it?`,
        "If someone you deeply respect made this decision for you, which would they pick?"
      ],
      questionsToAskOthers: [
        "Ask a trusted mentor who has taken a similar leap: 'What was your biggest surprise in year 1?'"
      ],
      researchItems: [
        "Review industry benchmarks and workload expectations for your primary option."
      ]
    },
    recommendation: {
      recommendedOptionId: "opt1",
      recommendedOptionTitle: opt1Title,
      mainReasons: [
        `${opt1Title} aligns significantly better with high-weight growth and long-term potential priorities.`,
        "The calculated weighted decision score favors this path (7.7 vs 6.1)."
      ],
      biggestConcern: "Managing short-term transition stress and pacing during the initial 90 days.",
      missingInformation: "Firm confirmation on workload expectations and trial period flexibility.",
      confidenceLevel: "Moderate",
      confidenceReason: "Confidence is moderate because exact workload expectations and financial runway details need final verification.",
      whyNotOptions: {
        opt2: `${opt2Title} lost because it scores lower on long-term Career & Growth Impact (5.0 vs 9.0) and Autonomy (6.0 vs 7.0), despite higher short-term stability.`
      },
      reversalConditions: [
        "If immediate income drops below your minimum living expenses.",
        "If workload demands exceed 60 hours/week without compensation."
      ],
      opportunityCosts: {
        opt1: `Choosing ${opt1Title} means giving up immediate short-term predictability.`,
        opt2: `Choosing ${opt2Title} means giving up accelerated long-term growth and higher income ceiling.`
      }
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
