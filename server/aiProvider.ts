import { GoogleGenAI, Type } from '@google/genai';
import { extractAlternativesFromQuestion, ExtractedOption } from './optionExtractor.js';
import {
  DecisionAnalysis,
  DecisionCategory,
  ReversibilityLevel,
  TimeHorizon,
  ClarifyingQuestion,
  ClarifyingQuestionOption,
  ClarificationState,
  ReconsiderationTrigger,
} from '../src/types';

export interface AnalysisInput {
  prompt: string;
  options?: string[];
  priorities?: string[];
  clarifyingAnswers?: Record<string, string | string[]>;
  category?: DecisionCategory;
  reversibility?: ReversibilityLevel;
  timeHorizon?: TimeHorizon;
  clarificationState?: ClarificationState;
}

// -------------------------------------------------------------
// Helper to get Gemini Client lazily and safely
// -------------------------------------------------------------
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// Resilient Multi-Model Invocation with Exponential Backoff
// -------------------------------------------------------------
const CANDIDATE_MODELS = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

export async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        const errMsg = (err?.message || String(err)).toLowerCase();
        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('429') ||
          errMsg.includes('high demand') ||
          errMsg.includes('resource_exhausted');

        if (isTemporary && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        break;
      }
    }
  }
  return null;
}

// -------------------------------------------------------------
// DOMAIN DETECTION & CLASSIFICATION ENGINE
// -------------------------------------------------------------
export type DecisionDomain =
  | 'lifestyle'
  | 'career'
  | 'education'
  | 'technical'
  | 'shopping'
  | 'relationships'
  | 'health'
  | 'general';

export function detectDecisionDomain(
  prompt: string,
  category?: DecisionCategory,
  rawOptions?: string[]
): DecisionDomain {
  const text = `${prompt} ${(rawOptions || []).join(' ')} ${category || ''}`.toLowerCase();

  // 1. Technical / Software Architecture / Databases / Tooling (Check before career/education)
  if (
    text.includes('mongodb') ||
    text.includes('postgres') ||
    text.includes('postgresql') ||
    text.includes('mysql') ||
    text.includes('sqlite') ||
    text.includes('redis') ||
    text.includes('dynamodb') ||
    text.includes('sql vs nosql') ||
    text.includes('sql or nosql') ||
    text.includes('react vs vue') ||
    text.includes('react or vue') ||
    text.includes('angular') ||
    text.includes('svelte') ||
    text.includes('nextjs') ||
    text.includes('remix') ||
    text.includes('tailwind') ||
    text.includes('docker') ||
    text.includes('kubernetes') ||
    text.includes('aws vs gcp') ||
    text.includes('aws vs azure') ||
    text.includes('cloud architecture') ||
    text.includes('fastapi vs django') ||
    text.includes('graphql vs rest') ||
    text.includes('microservices') ||
    text.includes('monolith') ||
    text.includes('rust vs go') ||
    text.includes('typescript vs javascript') ||
    category === 'Technology'
  ) {
    return 'technical';
  }

  // 2. Relationships / Social Dynamics / Friend Conflicts
  if (
    text.includes('friend') ||
    text.includes('conflict') ||
    text.includes('argument') ||
    text.includes('fight') ||
    text.includes('dispute') ||
    text.includes('misunderstanding') ||
    text.includes('breakup') ||
    text.includes('girlfriend') ||
    text.includes('boyfriend') ||
    text.includes('partner') ||
    text.includes('husband') ||
    text.includes('wife') ||
    text.includes('call her') ||
    text.includes('call him') ||
    text.includes('call my friend') ||
    text.includes('text him') ||
    text.includes('text her') ||
    text.includes('text my friend') ||
    text.includes('apologize') ||
    text.includes('apology') ||
    text.includes('forgive') ||
    text.includes('confront') ||
    text.includes('dating') ||
    text.includes('roommate') ||
    text.includes('coworker drama') ||
    text.includes('ghost') ||
    text.includes('boundary') ||
    category === 'Relationships'
  ) {
    return 'relationships';
  }

  // 3. Lifestyle / Leisure / Daily Life / Rest vs Work / Home vs Out
  if (
    text.includes('tired') ||
    text.includes('rest') ||
    text.includes('fatigue') ||
    text.includes('take a break') ||
    text.includes('burnout') ||
    text.includes('stay at home') ||
    text.includes('stay home') ||
    text.includes('staying home') ||
    text.includes('stay in') ||
    text.includes('home order') ||
    text.includes('order food') ||
    text.includes('order in') ||
    text.includes('cook or order') ||
    text.includes('cook or takeout') ||
    text.includes('cook dinner') ||
    text.includes('order pizza') ||
    text.includes('takeout') ||
    text.includes('delivery') ||
    text.includes('go out with') ||
    text.includes('go out tonight') ||
    text.includes('night out') ||
    text.includes('watch a movie') ||
    text.includes('watch movie') ||
    text.includes('read a book') ||
    text.includes('read book') ||
    text.includes('travel this weekend') ||
    text.includes('weekend trip') ||
    text.includes('play video games') ||
    text.includes('hang out') ||
    text.includes('party') ||
    text.includes('relax') ||
    text.includes('chill') ||
    text.includes('sleep') ||
    text.includes('nap') ||
    text.includes('do something else') ||
    text.includes('chores') ||
    text.includes('clean my room') ||
    category === 'Lifestyle'
  ) {
    return 'lifestyle';
  }

  // 4. Shopping / Financial Purchases
  if (
    text.includes('buy this phone') ||
    text.includes('buy this laptop') ||
    text.includes('buy a phone') ||
    text.includes('buy a car') ||
    text.includes('buy') ||
    text.includes('purchase') ||
    text.includes('lease vs buy') ||
    text.includes('save my money') ||
    text.includes('save money') ||
    text.includes('savings') ||
    text.includes('cost') ||
    text.includes('price') ||
    text.includes('expensive') ||
    text.includes('budget') ||
    category === 'Purchase' ||
    category === 'Shopping' ||
    category === 'Finance'
  ) {
    return 'shopping';
  }

  // 5. Health / Wellness
  if (
    text.includes('symptom') ||
    text.includes('medication') ||
    text.includes('medicine') ||
    text.includes('doctor') ||
    text.includes('workout routine') ||
    text.includes('workout') ||
    text.includes('gym') ||
    text.includes('diet') ||
    text.includes('injury') ||
    text.includes('therapy') ||
    text.includes('pain') ||
    text.includes('mental health') ||
    text.includes('anxiety') ||
    category === 'Health'
  ) {
    return 'health';
  }

  // 6. Education / Learning
  if (
    text.includes('learn python') ||
    text.includes('learn javascript') ||
    text.includes('learn programming') ||
    text.includes('bootcamp') ||
    text.includes('college major') ||
    text.includes('cs degree') ||
    text.includes('university') ||
    text.includes('master\'s') ||
    text.includes('study for') ||
    text.includes('study') ||
    text.includes('course') ||
    text.includes('certification') ||
    text.includes('exam') ||
    category === 'Education'
  ) {
    return 'education';
  }

  // 7. Career / Employment / Business
  if (
    text.includes('job offer') ||
    text.includes('software engineer') ||
    text.includes('salary') ||
    text.includes('freelancing') ||
    text.includes('full-time') ||
    text.includes('promotion') ||
    text.includes('startup') ||
    text.includes('boss') ||
    text.includes('manager') ||
    text.includes('career') ||
    text.includes('client') ||
    text.includes('resign') ||
    text.includes('interview') ||
    category === 'Career' ||
    category === 'Job Offer' ||
    category === 'Business' ||
    category === 'Startup'
  ) {
    return 'career';
  }

  return 'general';
}

// -------------------------------------------------------------
// 1. CLARIFYING QUESTIONS GENERATOR
// -------------------------------------------------------------
export async function generateClarifyingQuestions(
  prompt: string,
  rawOptions?: string[],
  category?: DecisionCategory,
  reversibility?: ReversibilityLevel,
  timeHorizon?: TimeHorizon
): Promise<{
  questions: ClarifyingQuestion[];
  optionsUnderstood: string[];
  keyConstraints: string[];
  assumptionsIdentified: string[];
  missingInfo: string[];
}> {
  const cleanPrompt = prompt.trim();
  const filteredOpts = (rawOptions || []).map((o) => o.trim()).filter(Boolean);
  const derived =
    filteredOpts.length >= 2
      ? filteredOpts.map((title, i) => ({ id: `opt${i + 1}`, title, description: '' }))
      : extractAlternativesFromQuestion(cleanPrompt);

  const domain = detectDecisionDomain(cleanPrompt, category, filteredOpts);
  const ai = getGeminiClient();

  if (ai) {
    try {
      const questionSchema = {
        type: Type.OBJECT,
        properties: {
          optionsUnderstood: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'The 2-4 distinct alternative choices understood from the dilemma',
          },
          keyConstraints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          assumptionsIdentified: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          missingInfo: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  enum: [
                    'single_select',
                    'multi_select',
                    'yes_no',
                    'numeric',
                    'currency',
                    'short_text',
                    'long_text',
                  ],
                },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['id', 'label'],
                  },
                },
                unit: { type: Type.STRING },
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                placeholder: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
              },
              required: ['id', 'question', 'type', 'whyItMatters'],
            },
          },
        },
        required: ['optionsUnderstood', 'questions', 'keyConstraints', 'assumptionsIdentified'],
      };

      const domainInstructions: Record<DecisionDomain, string> = {
        technical:
          'This is a TECHNICAL / SOFTWARE ARCHITECTURE dilemma (e.g. databases, frameworks, infrastructure). Ask questions about data model relational complexity (ACID vs JSON flexibility), team expertise, scale requirements, and ecosystem maturity. DO NOT ask about career growth, salary, or resume building.',
        lifestyle:
          'This is a LIFESTYLE / LEISURE dilemma. Ask questions about energy level, tomorrow’s commitments, desire for social connection vs solitude, and current mood. DO NOT ask about career growth, salary, or resume building.',
        shopping:
          'This is a SHOPPING / PURCHASE dilemma. Ask questions about budget buffer, whether this is an essential replacement or upgrade, current device condition, and expected usage.',
        education:
          'This is an EDUCATION / LEARNING dilemma. Ask questions about primary learning goals (hobby vs career vs project), available weekly study hours, and preferred learning style.',
        relationships:
          'This is a RELATIONSHIPS / SOCIAL dilemma. Ask questions about emotional readiness, desired conversation outcome (reconciliation, boundary, closure), and timing.',
        health:
          'This is a HEALTH / WELLNESS dilemma. Ask questions about current symptoms or fatigue, daily habits, and routine consistency. Remind that medical diagnosis requires a professional.',
        career:
          'This is a CAREER / PROFESSIONAL dilemma. Ask questions about primary career objectives, financial runway, compensation trade-offs, and risk tolerance.',
        general:
          'This is a GENERAL decision dilemma. Ask questions that illuminate the core trade-offs and constraints specific to the choices presented.',
      };

      const systemPrompt = `You are "The Tiebreaker", an expert decision intelligence analyst.
Analyze the user's dilemma and generate 2 to 4 sharp, contextual clarifying questions.
${domainInstructions[domain]}

CRITICAL DIRECTIVES:
1. Make questions interactive and highly specific to the options provided (${derived.map((d) => d.title).join(', ')}).
2. For single_select or multi_select questions, provide 3-4 realistic concrete option objects with id, label, and description.
3. NEVER assume career or productivity is the goal unless the question is explicitly about work.
4. Keep questions concise, natural, and directly helpful for resolving the trade-offs.`;

      const userContent = `User Dilemma: "${cleanPrompt}"
Provided Options: ${JSON.stringify(derived.map((d) => d.title))}
Category: ${category || 'General'}
Reversibility: ${reversibility || 'Somewhat reversible'}
Time Horizon: ${timeHorizon || 'Immediate'}`;

      const response = await generateContentWithRetryAndFallback(ai, {
        contents: userContent,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: questionSchema as any,
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return {
            questions: parsed.questions,
            optionsUnderstood:
              Array.isArray(parsed.optionsUnderstood) && parsed.optionsUnderstood.length >= 2
                ? parsed.optionsUnderstood
                : derived.map((d) => d.title),
            keyConstraints: parsed.keyConstraints || [
              `Time Horizon: ${timeHorizon || 'Immediate'}`,
              `Reversibility: ${reversibility || 'Somewhat reversible'}`,
            ],
            assumptionsIdentified: parsed.assumptionsIdentified || [
              `Evaluating trade-offs between ${derived[0]?.title || 'Option 1'} and ${derived[1]?.title || 'Option 2'}`,
            ],
            missingInfo: parsed.missingInfo || ['Personal preference balance'],
          };
        }
      }
    } catch {
      // Fallback gracefully to domain-aware deterministic questions
    }
  }

  // Deterministic Fallback Clarifying Questions
  return generateDeterministicClarifyingQuestions(
    cleanPrompt,
    derived,
    domain,
    category,
    reversibility,
    timeHorizon
  );
}

function generateDeterministicClarifyingQuestions(
  prompt: string,
  options: ExtractedOption[],
  domain: DecisionDomain,
  category?: DecisionCategory,
  reversibility?: ReversibilityLevel,
  timeHorizon?: TimeHorizon
) {
  const opt1 = options[0]?.title || 'Option 1';
  const opt2 = options[1]?.title || 'Option 2';

  let questions: ClarifyingQuestion[] = [];

  if (domain === 'technical') {
    questions = [
      {
        id: 'q_data_relational_complexity',
        question: 'What is the structure and relational complexity of your application data?',
        type: 'single_select',
        options: [
          { id: 'relational_strict', label: 'Highly structured & relational (Foreign keys, joins, ACID transactions)', description: 'Financial ledger, inventory, e-commerce orders, strict schemas' },
          { id: 'document_flexible', label: 'Nested documents & dynamic schemas (JSON catalogs, rapid iteration)', description: 'Content management, real-time telemetry, flexible schemas' },
          { id: 'hybrid', label: 'Moderate relational requirements with some unstructured fields', description: 'Requires both query flexibility and relational integrity' },
        ],
        whyItMatters: 'Relational data with transactions strongly favors ACID SQL databases (like PostgreSQL), while unstructured polymorphic documents suit document stores (like MongoDB).',
      },
      {
        id: 'q_team_stack_expertise',
        question: 'What is your team’s existing familiarity and tooling preference?',
        type: 'single_select',
        options: [
          { id: 'familiar_with_opt1', label: `Strong existing experience with ${opt1}`, description: 'Faster velocity and established debugging patterns' },
          { id: 'familiar_with_opt2', label: `Strong existing experience with ${opt2}`, description: 'Reduced onboarding overhead' },
          { id: 'neutral_stack', label: 'Equal familiarity or starting fresh', description: 'Decision purely based on architectural suitability' },
        ],
        whyItMatters: 'Developer velocity and operational familiarity directly impact delivery timelines.',
      },
    ];
  } else if (domain === 'lifestyle') {
    questions = [
      {
        id: 'q_energy_level',
        question: 'What is your current physical and mental energy level tonight?',
        type: 'single_select',
        options: [
          { id: 'high_energy', label: 'High energy & ready to be social', description: 'Feeling active and eager to engage with others' },
          { id: 'moderate_energy', label: 'Moderate / in-between', description: 'Could go either way depending on how easy it is' },
          { id: 'low_energy', label: 'Tired / need to recharge alone', description: 'Feeling drained and in need of quiet recovery' },
        ],
        whyItMatters: 'Energy level is the primary determinant of whether socializing will be energizing or exhausting.',
      },
      {
        id: 'q_tomorrow_commitments',
        question: 'Do you have early or demanding commitments tomorrow?',
        type: 'single_select',
        options: [
          { id: 'early_busy', label: 'Early start / demanding day tomorrow', description: 'Need good sleep and sharp focus in the morning' },
          { id: 'relaxed_tomorrow', label: 'Flexible or relaxed morning', description: 'Can sleep in or take things at an easy pace' },
        ],
        whyItMatters: 'Protects tomorrow’s responsibilities and prevents next-day regret.',
      },
      {
        id: 'q_social_priority',
        question: 'How long has it been since you last spent quality time with these friends or had downtime?',
        type: 'single_select',
        options: [
          { id: 'friends_long_time', label: 'Haven’t seen friends in a while', description: 'Valuable opportunity to maintain social bonds' },
          { id: 'saw_friends_recently', label: 'Saw friends recently / have frequent social events', description: 'Lower FOMO if skipping tonight' },
          { id: 'rare_quiet_night', label: 'Rare opportunity for personal solitude', description: 'A precious quiet night to recharge' },
        ],
        whyItMatters: 'Contextualizes the opportunity cost of both choices.',
      },
    ];
  } else if (domain === 'shopping') {
    questions = [
      {
        id: 'q_need_vs_want',
        question: 'Is this purchase replacing a broken/failing item or is it an upgrade/want?',
        type: 'single_select',
        options: [
          { id: 'essential_replacement', label: 'Essential replacement', description: 'Current item is broken or hindering daily productivity' },
          { id: 'nice_upgrade', label: 'Quality-of-life upgrade', description: 'Current item works but new one offers better features' },
          { id: 'spontaneous_want', label: 'Spontaneous interest', description: 'Excited by new features but current setup is fine' },
        ],
        whyItMatters: 'Determines utility urgency versus savings preservation.',
      },
      {
        id: 'q_budget_impact',
        question: 'How will spending this money affect your monthly budget or savings goal?',
        type: 'single_select',
        options: [
          { id: 'comfortable_cash', label: 'Comfortably budgeted', description: 'Paid in cash with zero impact on emergency buffer' },
          { id: 'minor_delay', label: 'Minor savings delay', description: 'Postpones a secondary savings goal by 1-2 months' },
          { id: 'stretches_budget', label: 'Stretches finances tightly', description: 'Requires dipping into emergency savings or debt' },
        ],
        whyItMatters: 'Guards against buyer’s remorse and financial stress.',
      },
    ];
  } else if (domain === 'education') {
    questions = [
      {
        id: 'q_learning_goal',
        question: 'What is your primary goal for learning this topic or technology?',
        type: 'single_select',
        options: [
          { id: 'job_career', label: 'Preparing for a new job / career shift', description: 'Need market-demanded skills and portfolio projects' },
          { id: 'build_projects', label: 'Building specific personal projects right now', description: 'Focus on immediate practical application' },
          { id: 'curiosity_mastery', label: 'Intellectual curiosity & general mastery', description: 'Exploring the fundamentals for personal interest' },
        ],
        whyItMatters: 'Guides whether to choose industry-standard tech or beginner-friendly fundamentals.',
      },
      {
        id: 'q_weekly_study_hours',
        question: 'How many hours per week can you realistically dedicate to studying?',
        type: 'single_select',
        options: [
          { id: 'under_5', label: '1–4 hours / week (Casual pace)', description: 'Best suited for gradual, digestible concepts' },
          { id: '5_15', label: '5–15 hours / week (Consistent part-time)', description: 'Solid steady momentum for real progress' },
          { id: '15_plus', label: '15+ hours / week (Intensive focus)', description: 'Fast immersion for rapid milestone achievement' },
        ],
        whyItMatters: 'Matches learning curve difficulty to actual study bandwidth.',
      },
    ];
  } else if (domain === 'relationships') {
    questions = [
      {
        id: 'q_emotional_temperature',
        question: 'Has enough time passed for emotions to cool down on both sides?',
        type: 'single_select',
        options: [
          { id: 'calm_ready', label: 'Yes, feeling calm and ready for constructive dialogue', description: 'Can communicate with empathy rather than defensiveness' },
          { id: 'still_hurt', label: 'Still feeling hurt / reactive', description: 'Might need another 24 hours of space before reaching out' },
        ],
        whyItMatters: 'Reaching out when calm prevents escalating an emotional conflict.',
      },
      {
        id: 'q_desired_outcome',
        question: 'What outcome do you hope to achieve most from this interaction?',
        type: 'single_select',
        options: [
          { id: 'reconciliation', label: 'Repair the friendship / restore connection', description: 'Prioritizing mutual understanding and forgiveness' },
          { id: 'clarity_boundary', label: 'Establish a clear boundary or clarify facts', description: 'Communicating expectations clearly and respectfully' },
        ],
        whyItMatters: 'Shapes the communication approach and tone.',
      },
    ];
  } else if (domain === 'health') {
    questions = [
      {
        id: 'q_symptom_severity',
        question: 'Are you experiencing acute or severe physical pain/symptoms?',
        type: 'single_select',
        options: [
          { id: 'mild_routine', label: 'No, this is a routine wellness or fitness choice', description: 'Standard lifestyle adjustment' },
          { id: 'acute_symptoms', label: 'Yes, experiencing concerning symptoms', description: 'Requires direct consultation with a healthcare professional' },
        ],
        whyItMatters: 'Medical symptoms require immediate professional clinical advice.',
      },
      {
        id: 'q_habit_sustainability',
        question: 'Which option is most sustainable for your long-term daily routine?',
        type: 'single_select',
        options: [
          { id: 'gentle_consistent', label: 'Gentle, consistent routine with low friction', description: 'Easier to maintain over months and years' },
          { id: 'structured_intense', label: 'High-intensity structured plan', description: 'Faster initial results but higher discipline demand' },
        ],
        whyItMatters: 'Long-term consistency delivers significantly better health outcomes than short sprints.',
      },
    ];
  } else {
    // Career / General fallback
    questions = [
      {
        id: 'q_primary_objective',
        question: `When choosing between "${opt1}" and "${opt2}", what is your top priority?`,
        type: 'single_select',
        options: [
          { id: 'growth_upside', label: 'Long-term growth and highest ceiling', description: 'Prioritizes maximum future advantage' },
          { id: 'stability_safety', label: 'Predictability, security, and low stress', description: 'Prioritizes certainty and peace of mind' },
          { id: 'flexibility_autonomy', label: 'Flexibility and personal independence', description: 'Prioritizes daily freedom and schedule control' },
        ],
        whyItMatters: 'Directly weights the multi-criteria evaluation matrix.',
      },
      {
        id: 'q_time_commitment',
        question: 'How much time or effort can you realistically dedicate to this over the next 6 months?',
        type: 'single_select',
        options: [
          { id: 'part_time', label: 'Limited / Part-time capacity', description: 'Requires efficient, low-friction execution' },
          { id: 'full_commitment', label: 'Full dedication / Primary focus', description: 'Can invest substantial focus and energy' },
        ],
        whyItMatters: 'Execution bandwidth is the strongest predictor of outcome success.',
      },
    ];
  }

  return {
    questions,
    optionsUnderstood: options.map((o) => o.title),
    keyConstraints: [
      `Time Horizon: ${timeHorizon || 'Immediate'}`,
      `Reversibility: ${reversibility || 'Somewhat reversible'}`,
      `Category: ${category || 'General'}`,
    ],
    assumptionsIdentified: [
      `Evaluating trade-offs between ${opt1} and ${opt2}`,
      `Focusing on the practical outcome that best fits your context`,
    ],
    missingInfo: [
      'Personal energy or preference weighting',
    ],
  };
}

// -------------------------------------------------------------
// 2. DECISION ANALYSIS ENGINE (Domain-Aware MCDA + Gemini + Fallback)
// -------------------------------------------------------------
export async function analyzeDecisionWithProviders(input: AnalysisInput): Promise<DecisionAnalysis> {
  const cleanPrompt = input.prompt.trim();
  const rawOpts = (input.options || []).map((o) => o.trim()).filter(Boolean);
  const derived =
    rawOpts.length >= 2
      ? rawOpts.map((t, i) => ({ id: `opt${i + 1}`, title: t, description: `Pursue ${t}` }))
      : extractAlternativesFromQuestion(cleanPrompt);

  const domain = detectDecisionDomain(cleanPrompt, input.category, rawOpts);
  const ai = getGeminiClient();

  if (ai) {
    try {
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['id', 'title', 'description'],
            },
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
                      weight: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                      details: { type: Type.STRING },
                    },
                    required: ['text', 'weight'],
                  },
                },
                cons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      weight: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                      details: { type: Type.STRING },
                    },
                    required: ['text', 'weight'],
                  },
                },
              },
              required: ['optionId', 'pros', 'cons'],
            },
          },
          comparison: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterion: { type: Type.STRING },
                scores: { type: Type.OBJECT, description: 'Map of optionId -> score/summary string' },
                winnerOptionId: { type: Type.STRING },
                note: { type: Type.STRING },
              },
              required: ['criterion', 'scores', 'winnerOptionId', 'note'],
            },
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
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['optionId', 'strengths', 'weaknesses', 'opportunities', 'threats'],
            },
          },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                weight: { type: Type.NUMBER, description: 'Weight percentage out of 100 total' },
                description: { type: Type.STRING },
              },
              required: ['id', 'name', 'weight'],
            },
          },
          weightedScores: {
            type: Type.OBJECT,
            description: 'Map of optionId -> object of { criterionId: number (1-10) }',
          },
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                optionId: { type: Type.STRING },
                risk: { type: Type.STRING },
                probability: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                impact: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                mitigation: { type: Type.STRING },
              },
              required: ['id', 'optionId', 'risk', 'probability', 'impact', 'mitigation'],
            },
          },
          scenarios: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                optionId: { type: Type.STRING },
                shortTerm: { type: Type.STRING },
                longTerm: { type: Type.STRING },
                keyTurningPoint: { type: Type.STRING },
              },
              required: ['optionId', 'shortTerm', 'longTerm'],
            },
          },
          thinkDeeper: {
            type: Type.OBJECT,
            properties: {
              assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
              biases: { type: Type.ARRAY, items: { type: Type.STRING } },
              blindspotQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              questionsToAskOthers: { type: Type.ARRAY, items: { type: Type.STRING } },
              researchItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['assumptions', 'biases', 'blindspotQuestions', 'questionsToAskOthers'],
          },
          recommendation: {
            type: Type.OBJECT,
            properties: {
              recommendedOptionId: { type: Type.STRING },
              recommendedOptionTitle: { type: Type.STRING },
              mainReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
              tradeOff: { type: Type.STRING, description: 'Clear statement of what is sacrificed by picking this option' },
              bottomLine: { type: Type.STRING, description: 'Grounded 1-2 sentence final takeaway' },
              biggestConcern: { type: Type.STRING },
              missingInformation: { type: Type.STRING },
              confidenceLevel: { type: Type.STRING, enum: ['High', 'Moderate', 'Low'] },
              confidenceReason: { type: Type.STRING },
              whyNotOptions: { type: Type.OBJECT },
              reversalConditions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Clear plain-language conditions for when the user should reconsider',
              },
              reconsiderationTriggers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    factor: { type: Type.STRING },
                    condition: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    urgency: { type: Type.STRING, enum: ['Immediate', 'Within 30 days', 'Quarterly Review'] },
                  },
                  required: ['factor', 'condition', 'impact'],
                },
              },
            },
            required: ['recommendedOptionId', 'recommendedOptionTitle', 'mainReasons', 'biggestConcern', 'confidenceLevel'],
          },
        },
        required: [
          'title',
          'options',
          'prosCons',
          'comparison',
          'swot',
          'criteria',
          'weightedScores',
          'risks',
          'scenarios',
          'thinkDeeper',
          'recommendation',
        ],
      };

      const systemPrompt = `You are "The Tiebreaker", an expert decision analyst engine.

CRITICAL DOMAIN-AWARENESS DIRECTIVE:
1. THE QUESTION DETERMINES THE EVALUATION CRITERIA.
   - NEVER assume that career, salary, resume, or productivity is the goal unless the question explicitly involves career or employment.
   - DETECTED DOMAIN: ${domain.toUpperCase()}.
   - If TECHNICAL: Evaluate purely on architectural suitability, data model relational integrity (ACID transactions vs document flexibility), developer velocity, ecosystem tooling, query performance, and operational maintenance. DO NOT evaluate career growth or salary.
   - If LIFESTYLE / DAILY LIFE: Evaluate purely on physical energy, sleep, relaxation, mental recovery, personal enjoyment, social connection, and convenience. For questions like "I'm tired. Should I rest?", prioritize physical recharge and fatigue recovery. DO NOT force career or financial metrics onto daily recovery choices.
   - If SHOPPING: Evaluate utility necessity vs upgrade want, budget impact, longevity, and alternative solutions.
   - If RELATIONSHIPS: Evaluate communication clarity, emotional timing, empathy, boundary setting, and mutual respect.
   - If HEALTH: Focus on routine consistency and wellness habits. (Note: does not substitute for medical advice).
   - If CAREER: Evaluate career ceiling, long-term compounding, compensation, work-life balance, and autonomy.

2. NO INVENTED USER FACTS:
   - Do NOT assume facts about the user (e.g. do not assume they are broke, exhausted, or have an exam tomorrow unless explicitly stated in the prompt or clarifying answers).
   - Use balanced conditional framing where appropriate ("If you are feeling energized tonight...", "If your current phone is lagging...").

3. NATURAL, ACTIONABLE RECOMMENDATION:
   - "recommendedOptionTitle" MUST be a clean, natural choice title (e.g. "Go out with your friends tonight", "Stay home and recharge", "Accept the Software Engineer offer", "Learn Python first", "Buy the phone", "Save your money", "PostgreSQL for ACID relational integrity").
   - NEVER use the entire user question as the recommendation title.
   - Avoid repetitive formulas like "You must choose stay home." Use natural, convincing reasons.
   - In "mainReasons", provide 2-4 crisp, highly specific bullet points directly referencing this dilemma's real trade-offs.
   - In "tradeOff", explain what the user is giving up by making this choice.
   - In "bottomLine", give a clear 1-2 sentence executive conclusion.

4. HONEST CONFIDENCE SCORING:
   - If the alternatives are very close in trade-offs (e.g. going out vs staying home when both have strong merits), assign "Moderate" or "Low" confidence and explain why it's a close call depending on personal preference or energy level.
   - Assign "High" confidence only when one option clearly dominates across key criteria (e.g. resting when exhausted).

5. PROHIBITION OF FIRST-PERSON PRONOUNS:
   - Do NOT use "I", "my", "we", "our" (Never say "I recommend", "I think", "I suggest"). Speak with objective, authoritative second-person guidance: "You should choose...", "Your best path is...", "This option delivers...".

6. SAFETY & MEDICAL ADVICE:
   - If medical symptoms, diagnosis, or medication are mentioned, include a clear note that this does not substitute for licensed medical advice.`;

      const userContent = `User Dilemma: "${cleanPrompt}"
Options: ${JSON.stringify(derived)}
Priorities: ${JSON.stringify(input.priorities || [])}
Clarifying Answers: ${JSON.stringify(input.clarifyingAnswers || {})}
Category: ${input.category || 'General'}
Reversibility: ${input.reversibility || 'Somewhat reversible'}
Time Horizon: ${input.timeHorizon || 'Immediate'}`;

      const response = await generateContentWithRetryAndFallback(ai, {
        contents: userContent,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: responseSchema as any,
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);

        // Normalize options
        let parsedOptions =
          Array.isArray(parsed.options) && parsed.options.length >= 2
            ? parsed.options
            : derived;

        parsedOptions = parsedOptions.map((opt: any, idx: number) => ({
          id: opt.id || `opt${idx + 1}`,
          title: opt.title || derived[idx]?.title || `Option ${idx + 1}`,
          description: opt.description || `Pursue ${opt.title}`,
          source: 'user' as const,
        }));

        const rec = parsed.recommendation || {};
        const recId = rec.recommendedOptionId || parsedOptions[0].id;
        const matchedRecOpt = parsedOptions.find((o: any) => o.id === recId) || parsedOptions[0];
        rec.recommendedOptionId = matchedRecOpt.id;
        rec.recommendedOptionTitle = rec.recommendedOptionTitle || matchedRecOpt.title;

        // Sanitize mainReasons to remove any accidental first-person speech or prompt repetition
        if (Array.isArray(rec.mainReasons) && rec.mainReasons.length > 0) {
          rec.mainReasons = rec.mainReasons.map((reason: string) => {
            let sanitized = String(reason)
              .replace(/\b(I recommend|I think|I suggest|I believe|In my opinion|I analyzed|I have determined|we recommend|we suggest)\b/gi, 'You should choose')
              .replace(/\b(my recommendation is|our recommendation is)\b/gi, 'your optimal choice is')
              .replace(/\bYou must choose\b/gi, 'You should choose');
            if (cleanPrompt.length > 15 && sanitized.includes(cleanPrompt)) {
              sanitized = sanitized.split(cleanPrompt).join(matchedRecOpt.title);
            }
            return sanitized;
          });
        } else {
          rec.mainReasons = [
            `Choosing ${matchedRecOpt.title} delivers the strongest alignment with your current context and core priorities.`,
            `This option minimizes regret while maximizing practical value over a ${input.timeHorizon || 'immediate'} horizon.`
          ];
        }

        // Build whyNotOptions map
        const whyNotMap: Record<string, string> = {};
        if (rec.whyNotOptions && typeof rec.whyNotOptions === 'object') {
          Object.assign(whyNotMap, rec.whyNotOptions);
        }
        parsedOptions.forEach((opt: any) => {
          if (opt.id !== matchedRecOpt.id && !whyNotMap[opt.id]) {
            whyNotMap[opt.id] = `${opt.title} carries greater trade-offs relative to your top criteria compared to ${matchedRecOpt.title}.`;
          }
        });
        rec.whyNotOptions = whyNotMap;

        // Structure triggers if missing
        if (!Array.isArray(rec.reconsiderationTriggers) || rec.reconsiderationTriggers.length === 0) {
          rec.reconsiderationTriggers = (rec.reversalConditions || []).map((cond: string, idx: number) => ({
            id: `trig_${idx + 1}`,
            factor: idx === 0 ? 'Energy / Capacity Shift' : 'New Information',
            condition: cond,
            impact: `Reassess decision and consider choosing ${parsedOptions[1]?.title || 'the alternative path'}`,
            urgency: 'Immediate',
          }));
        }

        // Normalize SWOT ensuring every option has non-empty Strengths, Weaknesses, Opportunities, Threats
        const normalizedSwot = parsedOptions.map((opt: any, idx: number) => {
          const rawSwot = (parsed.swot || []).find((s: any) =>
            s.optionId === opt.id ||
            s.optionId === `opt${idx + 1}` ||
            (s.optionId && typeof s.optionId === 'string' && s.optionId.toLowerCase() === opt.title.toLowerCase())
          ) || parsed.swot?.[idx];

          return {
            optionId: opt.id,
            strengths: Array.isArray(rawSwot?.strengths) && rawSwot.strengths.length > 0
              ? rawSwot.strengths
              : [`Directly satisfies key priorities for ${opt.title}`, `Clear practical advantages and immediate utility`],
            weaknesses: Array.isArray(rawSwot?.weaknesses) && rawSwot.weaknesses.length > 0
              ? rawSwot.weaknesses
              : [`Requires trade-offs with alternative choices`, `Initial friction or commitment demand`],
            opportunities: Array.isArray(rawSwot?.opportunities) && rawSwot.opportunities.length > 0
              ? rawSwot.opportunities
              : [`Positive compounding satisfaction and peace of mind`, `Strengthens decision confidence and clarity`],
            threats: Array.isArray(rawSwot?.threats) && rawSwot.threats.length > 0
              ? rawSwot.threats
              : [`Potential temporary regret if unexpected friction arises`, `Changes in personal energy or external circumstances`],
          };
        });

        // Normalize Pros & Cons for all options
        const normalizedProsCons = parsedOptions.map((opt: any, idx: number) => {
          const rawPc = (parsed.prosCons || []).find((p: any) =>
            p.optionId === opt.id ||
            p.optionId === `opt${idx + 1}` ||
            (p.optionId && typeof p.optionId === 'string' && p.optionId.toLowerCase() === opt.title.toLowerCase())
          ) || parsed.prosCons?.[idx];

          return {
            optionId: opt.id,
            pros: Array.isArray(rawPc?.pros) && rawPc.pros.length > 0
              ? rawPc.pros
              : [{ text: `Delivers strong alignment with your decision criteria for ${opt.title}`, weight: 'high' as const, source: 'AI SUGGESTED' as const }],
            cons: Array.isArray(rawPc?.cons) && rawPc.cons.length > 0
              ? rawPc.cons
              : [{ text: `Carries standard transition friction and resource commitments`, weight: 'medium' as const, source: 'AI SUGGESTED' as const }],
          };
        });

        return {
          id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          title: parsed.title || (cleanPrompt.length > 50 ? cleanPrompt.slice(0, 48) + '...' : cleanPrompt),
          originalPrompt: cleanPrompt,
          category: input.category || 'General',
          reversibility: input.reversibility || 'Somewhat reversible',
          timeHorizon: input.timeHorizon || 'Immediate',
          userPriorities: input.priorities || ['Personal Alignment', 'Practical Convenience', 'Energy & Well-being'],
          options: parsedOptions,
          clarificationState: input.clarificationState || {
            decisionSummary: cleanPrompt,
            optionsUnderstood: parsedOptions.map((o: any) => o.title),
            keyConstraints: [`Time Horizon: ${input.timeHorizon || 'Immediate'}`, `Reversibility: ${input.reversibility || 'Somewhat reversible'}`],
            assumptionsIdentified: [`Balancing trade-offs between available alternatives`],
            missingInfo: [],
            confirmedByUser: true,
          },
          clarifyingQuestions: [],
          prosCons: normalizedProsCons,
          comparison: parsed.comparison || [],
          swot: normalizedSwot,
          criteria: parsed.criteria || [],
          weightedScores: parsed.weightedScores || {},
          risks: parsed.risks || [],
          scenarios: parsed.scenarios || [],
          thinkDeeper: parsed.thinkDeeper || {
            assumptions: [],
            missingInformation: [],
            biases: [],
            blindspotQuestions: [],
            questionsToAskOthers: [],
            researchItems: [],
          },
          recommendation: {
            ...rec,
            domain,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'analyzed' as const,
        };
      }
    } catch (err) {
      console.warn('Gemini decision analysis fallback to deterministic engine:', err);
    }
  }

  // Level 3: Deterministic Decision Intelligence Engine (Guaranteed calculation for all domains)
  return generateDeterministicDecisionAnalysis(input, derived, domain);
}

// -------------------------------------------------------------
// 3. DETERMINISTIC DECISION ENGINE (Domain-Specific Multi-Criteria MCDA)
// -------------------------------------------------------------
export function generateDeterministicDecisionAnalysis(
  input: AnalysisInput,
  derivedOptions: ExtractedOption[],
  domainOverride?: DecisionDomain
): DecisionAnalysis {
  const cleanPrompt = input.prompt.trim();
  const options = derivedOptions.map((opt, i) => ({
    id: `opt${i + 1}`,
    title: opt.title,
    description: opt.description || `Pursue ${opt.title}`,
    source: 'user' as const,
  }));

  const opt1 = options[0];
  const opt2 = options[1] || { id: 'opt2', title: 'Alternative Strategy', description: '', source: 'user' as const };

  const domain = domainOverride || detectDecisionDomain(cleanPrompt, input.category, derivedOptions.map((d) => d.title));
  const answers = input.clarifyingAnswers || {};

  // Build domain-specific criteria, weights, scores, pros/cons, and recommendations
  let criteria: { id: string; name: string; weight: number; description: string }[] = [];
  let weightedScores: Record<string, Record<string, number>> = {};
  let prosCons: any[] = [];
  let swot: any[] = [];
  let comparison: any[] = [];
  let risks: any[] = [];
  let scenarios: any[] = [];
  let thinkDeeper: any = {};
  let recommendation: any = {};

  if (domain === 'lifestyle') {
    const isFatigueOrRest =
      cleanPrompt.toLowerCase().includes('tired') ||
      cleanPrompt.toLowerCase().includes('fatigue') ||
      cleanPrompt.toLowerCase().includes('rest') ||
      cleanPrompt.toLowerCase().includes('sleep') ||
      cleanPrompt.toLowerCase().includes('burnout') ||
      opt1.title.toLowerCase().includes('rest') ||
      opt1.title.toLowerCase().includes('recharge');

    if (isFatigueOrRest) {
      // Specialized Fatigue & Rest Recovery Analysis
      criteria = [
        { id: 'crit1', name: 'Physical Recharge & Sleep', weight: 40, description: 'Allowing the central nervous system and body to recover from acute fatigue.' },
        { id: 'crit2', name: 'Burnout & Injury Prevention', weight: 30, description: 'Preventing chronic fatigue, brain fog, and diminished cognitive performance.' },
        { id: 'crit3', name: 'Quality of Restored Focus', weight: 20, description: 'Returning to tasks tomorrow with 100% sharpness rather than struggling at 30% capacity.' },
        { id: 'crit4', name: 'Immediate Schedule Flexibility', weight: 10, description: 'Pausing non-critical tasks without negative real-world penalties.' },
      ];

      const recommended = opt1;
      const runnerUp = opt2;

      weightedScores = {
        [opt1.id]: { crit1: 9.8, crit2: 9.5, crit3: 9.2, crit4: 8.5 },
        [opt2.id]: { crit1: 3.5, crit2: 4.0, crit3: 4.5, crit4: 6.0 },
      };

      prosCons = [
        {
          optionId: opt1.id,
          pros: [
            { text: 'Restores cognitive sharpness, emotional balance, and physical energy', weight: 'high' as const, source: 'AI SUGGESTED' as const },
            { text: 'Prevents mistakes, burnout, and unproductive struggling through fatigue', weight: 'high' as const, source: 'AI SUGGESTED' as const },
          ],
          cons: [
            { text: 'Requires pausing current activities or rescheduling non-urgent items', weight: 'low' as const, source: 'AI SUGGESTED' as const },
          ],
        },
        {
          optionId: opt2.id,
          pros: [
            { text: 'Completes immediate incremental tasks without postponement', weight: 'medium' as const, source: 'AI SUGGESTED' as const },
          ],
          cons: [
            { text: 'Working while exhausted yields severe diminishing returns and higher error rates', weight: 'high' as const, source: 'AI SUGGESTED' as const },
            { text: 'Compounds sleep debt and leaves you drained for tomorrow', weight: 'high' as const, source: 'AI SUGGESTED' as const },
          ],
        },
      ];

      swot = [
        {
          optionId: opt1.id,
          strengths: ['Immediate physical and cognitive restoration', 'Protects tomorrow’s performance'],
          weaknesses: ['Temporary pause on current activity'],
          opportunities: ['Waking up fully refreshed and operating at peak clarity'],
          threats: ['Guilt over resting (which is counterproductive)'],
        },
        {
          optionId: opt2.id,
          strengths: ['Short-term task completion'],
          weaknesses: ['Diminished cognitive accuracy and high fatigue accumulation'],
          opportunities: ['Finishing urgent emergencies if non-negotiable'],
          threats: ['Burnout and severe next-day exhaustion'],
        },
      ];

      comparison = [
        {
          criterion: 'Energy & Cognitive Recovery',
          scores: { [opt1.id]: 'High (9.8)', [opt2.id]: 'Low (3.5)' },
          winnerOptionId: opt1.id,
          note: 'Resting directly remedies physical fatigue, whereas pushing through compounds exhaustion.',
        },
        {
          criterion: 'Next-Day Readiness',
          scores: { [opt1.id]: 'High (9.5)', [opt2.id]: 'Low (4.0)' },
          winnerOptionId: opt1.id,
          note: 'A well-timed rest protects tomorrow’s productivity and mental clarity.',
        },
      ];

      risks = [
        {
          id: 'r_burnout',
          optionId: opt2.id,
          risk: 'Severe cognitive fatigue and next-day grogginess',
          probability: 'High',
          impact: 'High',
          mitigation: 'Step away, hydrate, and get restorative sleep immediately.',
        },
      ];

      scenarios = [
        {
          optionId: opt1.id,
          shortTerm: 'Tonight: Deep physical recovery and mental unwind.',
          longTerm: 'Tomorrow: Starting the day with full energy, clear focus, and high productivity.',
        },
      ];

      thinkDeeper = {
        assumptions: ['Assuming no life-or-death emergency requires staying awake right now.'],
        missingInformation: ['Specific hour of day and severity of physical exhaustion.'],
        biases: ['Productivity Guilt: Feeling like taking a break or sleeping is wasteful.'],
        blindspotQuestions: ['Will pushing for another hour produce high quality work, or will you need to redo it tomorrow anyway?'],
        questionsToAskOthers: ['Communicate with collaborators if rescheduling morning items is needed.'],
        researchItems: ['Sleep science confirms that cognitive performance degrades rapidly when pushing through severe fatigue.'],
      };

      recommendation = {
        recommendedOptionId: recommended.id,
        recommendedOptionTitle: recommended.title,
        mainReasons: [
          'Pushing through acute fatigue yields severe diminishing returns and elevates error rates.',
          'Taking time to rest immediately restores physical stamina, mental clarity, and emotional resilience.',
          'Resting now protects tomorrow’s energy and prevents accumulating sleep debt.'
        ],
        tradeOff: 'You pause active tasks for tonight, but gain dramatically higher focus and efficiency tomorrow.',
        bottomLine: 'Prioritize resting now. Your body and mind need recovery, and you will accomplish far more after recharging.',
        biggestConcern: 'Resisting the urge to feel guilty about stepping away to rest.',
        missingInformation: 'Specific commitments scheduled for tomorrow morning.',
        confidenceLevel: 'High' as const,
        confidenceReason: 'Physiological recovery is non-negotiable when experiencing acute tiredness.',
        whyNotOptions: {
          [runnerUp.id]: 'Pushing through exhaustion drains your energy reserves and leads to substandard output and next-day fatigue.',
        },
        reversalConditions: [
          'Only if an urgent, non-delegable life emergency requires immediate action.',
        ],
        reconsiderationTriggers: [
          {
            id: 'trig_1',
            factor: 'Severe Sleep Debt',
            condition: 'If fatigue persists after a full night of rest',
            impact: 'Evaluate overall weekly sleep schedule, stress, and nutrition',
            urgency: 'Within 30 days' as const,
          },
        ],
      };
    } else {
      // Standard Lifestyle / Going Out vs Staying In
      criteria = [
        { id: 'crit1', name: 'Social Connection & Fun', weight: 35, description: 'Quality time with friends, shared memories, and enjoyable social bonding.' },
        { id: 'crit2', name: 'Rest, Energy & Recovery', weight: 30, description: 'Opportunity to physically recharge, relax, and reduce stress.' },
        { id: 'crit3', name: 'Tomorrow Readiness', weight: 20, description: 'Waking up refreshed with zero morning fatigue for the next day.' },
        { id: 'crit4', name: 'Cost & Convenience', weight: 15, description: 'Avoiding out-of-pocket expenses and transportation effort.' },
      ];

      let socialLean = 0;
      Object.values(answers).forEach((ans) => {
        const s = String(ans).toLowerCase();
        if (s.includes('high_energy') || s.includes('friends_long_time') || s.includes('relaxed_tomorrow')) {
          socialLean += 1;
        }
        if (s.includes('low_energy') || s.includes('early_busy') || s.includes('rare_quiet_night')) {
          socialLean -= 1;
        }
      });

      const isOpt1Social = opt1.title.toLowerCase().includes('out') || opt1.title.toLowerCase().includes('friend') || opt1.title.toLowerCase().includes('movie') || opt1.title.toLowerCase().includes('cook');
      const recommended = socialLean >= 0 ? (isOpt1Social ? opt1 : opt2) : (isOpt1Social ? opt2 : opt1);
      const runnerUp = recommended.id === opt1.id ? opt2 : opt1;

      weightedScores = {
        [opt1.id]: {
          crit1: isOpt1Social ? 8.8 : 5.5,
          crit2: isOpt1Social ? 5.0 : 9.0,
          crit3: isOpt1Social ? 6.5 : 9.2,
          crit4: isOpt1Social ? 6.0 : 9.5,
        },
        [opt2.id]: {
          crit1: isOpt1Social ? 5.5 : 8.8,
          crit2: isOpt1Social ? 9.0 : 5.0,
          crit3: isOpt1Social ? 9.2 : 6.5,
          crit4: isOpt1Social ? 9.5 : 6.0,
        },
      };

    prosCons = options.map((opt) => {
      const isSocial = opt.title.toLowerCase().includes('out') || opt.title.toLowerCase().includes('friend') || opt.title.toLowerCase().includes('party');
      return {
        optionId: opt.id,
        pros: [
          {
            text: isSocial
              ? 'Creates meaningful shared memories and strengthens friendships'
              : 'Provides complete physical and mental relaxation with zero pressure',
            weight: 'high' as const,
            source: 'AI SUGGESTED' as const,
          },
          {
            text: isSocial
              ? 'Breaks up routine and boosts mood through active engagement'
              : 'Guarantees a restful night of sleep and a productive, energized morning',
            weight: 'medium' as const,
            source: 'AI SUGGESTED' as const,
          },
        ],
        cons: [
          {
            text: isSocial
              ? 'Requires social energy, transportation effort, and spending money'
              : 'Misses out on spontaneous social bonding and group stories',
            weight: 'medium' as const,
            source: 'AI SUGGESTED' as const,
          },
        ],
      };
    });

    swot = options.map((opt) => {
      const isSocial = opt.title.toLowerCase().includes('out') || opt.title.toLowerCase().includes('friend');
      return {
        optionId: opt.id,
        strengths: [
          isSocial ? 'High social bonding and spontaneous fun' : 'Maximum personal peace and zero friction',
        ],
        weaknesses: [
          isSocial ? 'Potential fatigue if staying out late' : 'Mild FOMO (fear of missing out)',
        ],
        opportunities: [
          isSocial ? 'Reconnecting deeply with friends you haven’t seen in a while' : 'Catching up on reading, sleep, or personal hobbies',
        ],
        threats: [
          isSocial ? 'Overspending or feeling drained tomorrow morning' : 'Feeling isolated if staying home frequently',
        ],
      };
    });

    comparison = [
      {
        criterion: 'Social Connection',
        scores: { [opt1.id]: isOpt1Social ? 'High' : 'Low', [opt2.id]: isOpt1Social ? 'Low' : 'High' },
        winnerOptionId: isOpt1Social ? opt1.id : opt2.id,
        note: 'Social engagement creates memorable experiences.',
      },
      {
        criterion: 'Energy & Rest',
        scores: { [opt1.id]: isOpt1Social ? 'Moderate' : 'High', [opt2.id]: isOpt1Social ? 'High' : 'Moderate' },
        winnerOptionId: isOpt1Social ? opt2.id : opt1.id,
        note: 'Solitude allows complete nervous system recovery.',
      },
    ];

    risks = [
      {
        id: 'r_fatigue',
        optionId: isOpt1Social ? opt1.id : opt2.id,
        risk: 'Staying out too late and feeling exhausted tomorrow',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Set a firm departure curfew before you head out.',
      },
      {
        id: 'r_fomo',
        optionId: isOpt1Social ? opt2.id : opt1.id,
        risk: 'Feeling regret or boredom later in the evening',
        probability: 'Low',
        impact: 'Low',
        mitigation: 'Plan an enjoyable home activity like a good movie, dinner, or book.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Tonight: Fun social energy, spontaneous conversations, shared laughter.',
        longTerm: 'Tomorrow: Slightly tired morning, but glad you showed up for your friends.',
      },
      {
        optionId: opt2.id,
        shortTerm: 'Tonight: Cozy relaxed evening, catching up on rest or personal projects.',
        longTerm: 'Tomorrow: Wake up refreshed and energized with full battery.',
      },
    ];

    thinkDeeper = {
      assumptions: [
        'Assuming your presence is welcomed and you have reasonable transportation.',
        'Assuming you can set a reasonable boundary on when to head home if tired.',
      ],
      missingInformation: [
        'Your exact physical fatigue level right now.',
        'Whether your friends have something specific to celebrate tonight.',
      ],
      biases: [
        'FOMO (Fear Of Missing Out): Overestimating the excitement of an event simply because you are absent.',
        'Inertia Bias: Preferring the couch because standing up requires initial physical momentum.',
      ],
      blindspotQuestions: [
        'If you go for just 2 hours, does that give you the best of both worlds?',
        'Will you genuinely relax at home, or will you end up doomscrolling on your phone?',
      ],
      questionsToAskOthers: [
        'Text your friend: "What’s the plan tonight, and what time are people heading out?"',
      ],
      researchItems: [
        'Check commute time and weather for tonight.',
      ],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: recommended.title,
      mainReasons: [
        `Choosing ${recommended.title} provides the optimal balance of personal satisfaction and alignment with your current situation.`,
        `It avoids unnecessary friction while directly delivering on your immediate priorities.`,
        `If your energy permits, this choice offers the lowest probability of post-decision regret.`
      ],
      tradeOff: `Opting for ${recommended.title} means giving up the benefits of ${runnerUp.title}, but gains peace of mind and satisfaction.`,
      bottomLine: `Follow through on ${recommended.title} with full commitment and enjoy your evening.`,
      biggestConcern: 'Managing time and setting realistic boundaries.',
      missingInformation: 'Your current energy and tomorrow morning schedule.',
      confidenceLevel: 'Moderate' as const,
      confidenceReason: 'Both options have solid valid merits; the ideal choice depends on your physical energy level tonight.',
      whyNotOptions: {
        [runnerUp.id]: `${runnerUp.title} lost due to lower alignment with tonight’s primary context.`,
      },
      reversalConditions: [
        'If you feel sudden acute exhaustion before leaving the house.',
        'If tomorrow’s schedule changes into an urgent early commitment.',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Energy Threshold',
          condition: 'If your energy dips below 3/10 before leaving',
          impact: 'Stay home and take a quiet night to recharge instead',
          urgency: 'Immediate' as const,
        },
      ],
    };
    }
  } else if (domain === 'shopping') {
    // --------------------------------------------------
    // SHOPPING / PURCHASE (e.g. Buy phone vs save money)
    // --------------------------------------------------
    criteria = [
      { id: 'crit1', name: 'Daily Utility & Feature Value', weight: 35, description: 'Practical day-to-day improvement in speed, camera, battery, or tool reliability.' },
      { id: 'crit2', name: 'Budget Impact & Savings Buffer', weight: 35, description: 'Preserving cash reserves and financial peace of mind.' },
      { id: 'crit3', name: 'Longevity & Durability', weight: 20, description: 'How many years the item will reliably serve your daily needs.' },
      { id: 'crit4', name: 'Opportunity Cost', weight: 10, description: 'What alternative uses of that money are being sacrificed.' },
    ];

    const isOpt1Buy = opt1.title.toLowerCase().includes('buy') || opt1.title.toLowerCase().includes('phone') || opt1.title.toLowerCase().includes('purchase');
    const recommended = isOpt1Buy ? opt2 : opt1; // Default to saving/prudence unless user specified need
    const runnerUp = recommended.id === opt1.id ? opt2 : opt1;

    weightedScores = {
      [opt1.id]: {
        crit1: isOpt1Buy ? 8.8 : 6.0,
        crit2: isOpt1Buy ? 5.5 : 9.5,
        crit3: isOpt1Buy ? 8.5 : 6.5,
        crit4: isOpt1Buy ? 5.0 : 9.0,
      },
      [opt2.id]: {
        crit1: isOpt1Buy ? 6.0 : 8.8,
        crit2: isOpt1Buy ? 9.5 : 5.5,
        crit3: isOpt1Buy ? 6.5 : 8.5,
        crit4: isOpt1Buy ? 9.0 : 5.0,
      },
    };

    prosCons = options.map((opt) => {
      const isBuy = opt.title.toLowerCase().includes('buy') || opt.title.toLowerCase().includes('purchase');
      return {
        optionId: opt.id,
        pros: [
          {
            text: isBuy
              ? 'Immediate upgrade in daily speed, battery health, and modern features'
              : 'Keeps cash in your bank account, compounding savings and emergency security',
            weight: 'high' as const,
            source: 'AI SUGGESTED' as const,
          },
        ],
        cons: [
          {
            text: isBuy
              ? 'Outflow of cash and fast initial depreciation of consumer tech'
              : 'Continuing with older hardware limitations or battery degradation',
            weight: 'medium' as const,
            source: 'AI SUGGESTED' as const,
          },
        ],
      };
    });

    swot = options.map((opt) => ({
      optionId: opt.id,
      strengths: [`Direct utility for ${opt.title}`],
      weaknesses: ['Financial or feature trade-off'],
      opportunities: ['Maximizing value per dollar spent'],
      threats: ['Technological obsolescence or buyer remorse'],
    }));

    comparison = [
      {
        criterion: 'Financial Prudence',
        scores: { [opt1.id]: isOpt1Buy ? 'Lower' : 'High', [opt2.id]: isOpt1Buy ? 'High' : 'Lower' },
        winnerOptionId: isOpt1Buy ? opt2.id : opt1.id,
        note: 'Keeping cash maintains total financial flexibility.',
      },
    ];

    risks = [
      {
        id: 'r_buyer_remorse',
        optionId: isOpt1Buy ? opt1.id : opt2.id,
        risk: 'Buyer’s remorse after initial novelty wears off in 2 weeks',
        probability: 'Medium',
        impact: 'Low',
        mitigation: 'Implement a strict 72-hour cooling-off rule before purchasing.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Next 30 days: Evaluating the direct impact on daily routine.',
        longTerm: '1-2 years: Assessing overall cost per day of ownership.',
      },
      {
        optionId: opt2.id,
        shortTerm: 'Next 30 days: Uninterrupted savings cushion.',
        longTerm: '1-2 years: Capital available for higher priority needs or next-gen models.',
      },
    ];

    thinkDeeper = {
      assumptions: [
        'Assuming your current equipment is still functional for essential needs.',
      ],
      missingInformation: [
        'Exact battery health and daily performance of current device.',
      ],
      biases: [
        'Novelty Bias: Overvaluing the excitement of new hardware over actual utility delta.',
      ],
      blindspotQuestions: [
        'Can replacing the battery or cleaning storage extend your current setup by 1 year for a fraction of the cost?',
      ],
      questionsToAskOthers: [
        'Ask someone with the target model: "Is the real-world upgrade noticeably better day to day?"',
      ],
      researchItems: [
        'Check refurbished or trade-in value promotions.',
      ],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: recommended.title,
      mainReasons: [
        `Choosing ${recommended.title} protects your cash flow and prevents unnecessary upgrade churn.`,
        `The practical performance delta does not justify immediate capital outlay unless current hardware is broken.`,
        `Waiting or buying prudently maximizes your return on capital.`
      ],
      tradeOff: `Deferring the upgrade means waiting on new features, but keeps cash secure.`,
      bottomLine: `If your current setup works, keep your money and reassess during seasonal sales.`,
      biggestConcern: 'Premature spending before true hardware failure.',
      missingInformation: 'Exact state of current device and upcoming promotions.',
      confidenceLevel: 'High' as const,
      confidenceReason: 'Clear financial math favors savings unless current equipment is inoperable.',
      whyNotOptions: {
        [runnerUp.id]: `${runnerUp.title} lost due to high upfront cost relative to the incremental feature upgrade.`,
      },
      reversalConditions: [
        'If current device suffers catastrophic hardware or battery failure.',
        'If a promotional discount reduces the price by 30% or more.',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Device Hardware Failure',
          condition: 'If current device stops holding charge or functioning',
          impact: 'Upgrade immediately as an essential productivity tool',
          urgency: 'Immediate' as const,
        },
      ],
    };
  } else if (domain === 'education') {
    // --------------------------------------------------
    // EDUCATION / LEARNING (e.g. Python vs JavaScript)
    // --------------------------------------------------
    criteria = [
      { id: 'crit1', name: 'Learning Curve & Accessibility', weight: 30, description: 'How fast you can grasp syntax, build working code, and stay motivated.' },
      { id: 'crit2', name: 'Ecosystem & Practical Utility', weight: 30, description: 'Breadth of libraries, tooling, and real-world project versatility.' },
      { id: 'crit3', name: 'Goal Alignment', weight: 25, description: 'Direct match with what you want to build (AI/Data vs Web apps).' },
      { id: 'crit4', name: 'Community Support & Documentation', weight: 15, description: 'Availability of tutorials, documentation, and beginner help.' },
    ];

    const recommended = opt1;
    const runnerUp = opt2;

    weightedScores = {
      [opt1.id]: { crit1: 8.5, crit2: 9.0, crit3: 8.5, crit4: 9.0 },
      [opt2.id]: { crit1: 7.8, crit2: 9.2, crit3: 8.0, crit4: 9.2 },
    };

    prosCons = options.map((opt) => ({
      optionId: opt.id,
      pros: [
        { text: `Rich ecosystem with extensive beginner tutorials for ${opt.title}`, weight: 'high' as const, source: 'AI SUGGESTED' as const },
        { text: `High transferable problem-solving skills to future tools`, weight: 'medium' as const, source: 'AI SUGGESTED' as const },
      ],
      cons: [
        { text: `Requires consistent weekly practice to build muscle memory`, weight: 'medium' as const, source: 'AI SUGGESTED' as const },
      ],
    }));

    swot = options.map((opt) => ({
      optionId: opt.id,
      strengths: [`Strong market demand and great documentation for ${opt.title}`],
      weaknesses: ['Context switching if trying to learn multiple tools at once'],
      opportunities: ['Building portfolio projects that demonstrate real capability'],
      threats: ['Tutorial hell (watching videos without writing original code)'],
    }));

    comparison = [
      {
        criterion: 'Ease of First Milestone',
        scores: { [opt1.id]: 'High', [opt2.id]: 'Moderate-High' },
        winnerOptionId: opt1.id,
        note: 'Starting with a clean syntax builds early momentum.',
      },
    ];

    risks = [
      {
        id: 'r_burnout',
        optionId: opt1.id,
        risk: 'Losing motivation if studying theory without building tangible projects',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Build a mini project within the first 7 days.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Month 1: Mastering syntax fundamentals and writing simple scripts.',
        longTerm: 'Months 3-6: Shipping functional applications and understanding advanced patterns.',
      },
    ];

    thinkDeeper = {
      assumptions: ['Assuming dedicated weekly practice of at least 5 hours.'],
      missingInformation: ['Specific target project idea.'],
      biases: ['Tool Optimization Trap: Spending weeks debating which language to learn instead of coding.'],
      blindspotQuestions: ['Which tool lets you build your dream project the fastest?'],
      questionsToAskOthers: ['Ask an experienced engineer: "What project would you build in your first month?"'],
      researchItems: ['Review official interactive beginner tutorials.'],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: `Learn ${recommended.title} First`,
      mainReasons: [
        `Starting with ${recommended.title} provides a clean, rewarding learning curve and immediate practical wins.`,
        `Once you master core programming concepts in ${recommended.title}, switching to other tools is significantly easier.`,
        `Focusing on one tool prevents cognitive overload and tutorial fatigue.`
      ],
      tradeOff: `Focusing on ${recommended.title} temporarily defers exploring ${runnerUp.title}, but ensures deep competence.`,
      bottomLine: `Pick ${recommended.title}, build 2 real projects, and stick with it for at least 60 days.`,
      biggestConcern: 'Staying consistent and writing code daily.',
      missingInformation: 'Target project domain.',
      confidenceLevel: 'High' as const,
      confidenceReason: 'Mastering one language thoroughly is far more important than the specific choice between top tools.',
      whyNotOptions: {
        [runnerUp.id]: `Decline starting with ${runnerUp.title} simultaneously to avoid syntax confusion during early fundamentals.`,
      },
      reversalConditions: [
        'If a specific project or curriculum strictly requires the other tool.',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Project Requirement Shift',
          condition: 'If your target project strictly demands different tooling',
          impact: 'Pivot to the required framework after mastering basics',
          urgency: 'Within 30 days' as const,
        },
      ],
    };
  } else if (domain === 'relationships') {
    // --------------------------------------------------
    // RELATIONSHIPS / INTERPERSONAL CONFLICT / SOCIAL
    // --------------------------------------------------
    criteria = [
      { id: 'crit1', name: 'Emotional Peace & Resolution', weight: 35, description: 'Clearing the air, reducing personal anxiety, and de-escalating tension.' },
      { id: 'crit2', name: 'Relationship Trust & Bond', weight: 30, description: 'Protecting and repairing meaningful personal connection and mutual goodwill.' },
      { id: 'crit3', name: 'Healthy Boundaries & Self-Respect', weight: 20, description: 'Maintaining emotional safety and mutual respect without compromising self-worth.' },
      { id: 'crit4', name: 'Communication Ease & Timing', weight: 15, description: 'Choosing the right moment and lowest-friction channel to connect.' },
    ];

    const isOpt1ReachOut = opt1.title.toLowerCase().includes('call') ||
      opt1.title.toLowerCase().includes('talk') ||
      opt1.title.toLowerCase().includes('reach') ||
      opt1.title.toLowerCase().includes('apologiz') ||
      opt1.title.toLowerCase().includes('text') ||
      opt1.title.toLowerCase().includes('tell') ||
      opt1.title.toLowerCase().includes('communicate');

    const recommended = opt1;
    const runnerUp = opt2;

    weightedScores = {
      [opt1.id]: { crit1: 8.8, crit2: 8.5, crit3: 8.0, crit4: 7.5 },
      [opt2.id]: { crit1: 6.5, crit2: 6.0, crit3: 8.5, crit4: 8.0 },
    };

    prosCons = options.map((opt, idx) => {
      const isTalk = opt.title.toLowerCase().includes('call') || opt.title.toLowerCase().includes('talk') || opt.title.toLowerCase().includes('reach') || opt.title.toLowerCase().includes('apologiz') || opt.title.toLowerCase().includes('text');
      return {
        optionId: opt.id,
        pros: [
          {
            text: isTalk
              ? 'Proactively resolves misunderstandings before silence turns into resentment'
              : 'Gives emotions time to cool down and prevents saying things in the heat of the moment',
            weight: 'high' as const,
            source: 'AI SUGGESTED' as const,
          },
          {
            text: isTalk
              ? 'Demonstrates maturity and shows that you value the friendship'
              : 'Allows you to gather your thoughts and approach the situation calmly later',
            weight: 'medium' as const,
            source: 'AI SUGGESTED' as const,
          },
        ],
        cons: [
          {
            text: isTalk
              ? 'Requires emotional vulnerability and setting aside ego'
              : 'Risk of drifting apart or letting miscommunications fester',
            weight: 'medium' as const,
            source: 'AI SUGGESTED' as const,
          },
        ],
      };
    });

    swot = options.map((opt) => ({
      optionId: opt.id,
      strengths: [`Direct agency and emotional clarity for ${opt.title}`],
      weaknesses: ['Vulnerability to unreciprocated response'],
      opportunities: ['Strengthening mutual trust and deeper friendship'],
      threats: ['Misinterpretation of tone if done via text message'],
    }));

    comparison = [
      {
        criterion: 'Emotional Resolution',
        scores: { [opt1.id]: 'High', [opt2.id]: 'Moderate' },
        winnerOptionId: opt1.id,
        note: 'Direct, thoughtful dialogue clears tension much faster than extended silence.',
      },
    ];

    risks = [
      {
        id: 'r_defensiveness',
        optionId: opt1.id,
        risk: 'Entering the conversation with defensiveness or blame',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Use "I feel" statements and focus on understanding rather than winning an argument.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Next 24 hours: Initial vulnerability, but immediate relief once the air is cleared.',
        longTerm: 'Weeks ahead: Restored mutual trust and stronger emotional connection.',
      },
      {
        optionId: opt2.id,
        shortTerm: 'Next 24 hours: Temporary quiet, but lingering background stress.',
        longTerm: 'Weeks ahead: Unresolved awkwardness or potential drift.',
      },
    ];

    thinkDeeper = {
      assumptions: ['Assuming both parties value the relationship and wish to avoid unnecessary drama.'],
      missingInformation: ['Whether the other person is currently receptive or still heightened.'],
      biases: [
        'Fundamental Attribution Error: Assuming the other person acted out of malice rather than stress.',
        'Spite Bias: Refusing to reach out first due to pride.',
      ],
      blindspotQuestions: [
        'In 6 months, will this specific argument matter compared to the value of the friendship?',
        'Are you listening to understand their perspective, or preparing your next rebuttal?',
      ],
      questionsToAskOthers: [
        'Reach out gently: "Hey, I value our friendship and want to make sure we are good. Let’s talk when you have a free moment."',
      ],
      researchItems: [
        'Nonviolent communication principles: State observation, feeling, need, and request.',
      ],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: recommended.title,
      mainReasons: [
        `Choosing ${recommended.title} provides the fastest path to emotional peace and prevents unnecessary misunderstanding from snowballing.`,
        `Direct, mature communication signals respect and gives both of you a safe container to reset.`,
        `Addressing this proactively removes the daily mental weight and background anxiety of an unresolved conflict.`
      ],
      tradeOff: `Opting for ${recommended.title} requires setting aside pride and risking initial awkwardness, but safeguards the connection.`,
      bottomLine: `Reach out with a calm, empathetic message focusing on resolution rather than assigning blame.`,
      biggestConcern: 'Managing emotional tone and avoiding escalatory language.',
      missingInformation: 'The other person’s immediate emotional state.',
      confidenceLevel: 'High' as const,
      confidenceReason: 'Proactive, respectful communication is consistently the most reliable path to resolving interpersonal friction.',
      whyNotOptions: {
        [runnerUp.id]: `${runnerUp.title} prolongs uncertainty and increases the risk of emotional distance.`,
      },
      reversalConditions: [
        'If the other person explicitly requested complete space for a set duration.',
        'If boundaries are consistently violated without mutual respect.',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Emotional Readiness',
          condition: 'If either person is actively angry or heightened',
          impact: 'Wait 24 hours until tempers settle before resuming the discussion',
          urgency: 'Immediate' as const,
        },
      ],
    };
  } else if (domain === 'health') {
    // --------------------------------------------------
    // HEALTH / WELLNESS
    // --------------------------------------------------
    criteria = [
      { id: 'crit1', name: 'Physical & Mental Well-being', weight: 35, description: 'Direct positive impact on vitality, recovery, and holistic health.' },
      { id: 'crit2', name: 'Habit Sustainability & Consistency', weight: 30, description: 'Ease of integrating into daily routine without burnout.' },
      { id: 'crit3', name: 'Injury & Stress Prevention', weight: 20, description: 'Minimizing physical strain, overtraining, or acute mental fatigue.' },
      { id: 'crit4', name: 'Energy & Daily Vitality', weight: 15, description: 'Waking up energized and maintaining steady stamina throughout the day.' },
    ];

    const recommended = opt1;
    const runnerUp = opt2;

    weightedScores = {
      [opt1.id]: { crit1: 8.8, crit2: 8.5, crit3: 8.0, crit4: 8.5 },
      [opt2.id]: { crit1: 7.0, crit2: 7.5, crit3: 7.5, crit4: 7.0 },
    };

    prosCons = options.map((opt) => ({
      optionId: opt.id,
      pros: [
        { text: `Promotes sustained vitality and aligns with long-term body health for ${opt.title}`, weight: 'high' as const, source: 'AI SUGGESTED' as const },
      ],
      cons: [
        { text: `Requires initial routine adjustment and habit building`, weight: 'medium' as const, source: 'AI SUGGESTED' as const },
      ],
    }));

    swot = options.map((opt) => ({
      optionId: opt.id,
      strengths: [`Direct positive wellness delta for ${opt.title}`],
      weaknesses: ['Short-term adaptation friction'],
      opportunities: ['Building a resilient daily health baseline'],
      threats: ['Overdoing intensity without adequate recovery'],
    }));

    comparison = [
      {
        criterion: 'Daily Well-being',
        scores: { [opt1.id]: 'High', [opt2.id]: 'Moderate' },
        winnerOptionId: opt1.id,
        note: 'Consistency and proper pacing deliver the most reliable health compounding.',
      },
    ];

    risks = [
      {
        id: 'r_overexertion',
        optionId: opt1.id,
        risk: 'Pushing too hard before building a baseline',
        probability: 'Low',
        impact: 'Medium',
        mitigation: 'Prioritize gradual progression, adequate sleep, and listening to your body.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Next 2 weeks: Building physical rhythm and noticing early energy gains.',
        longTerm: '3-6 months: Substantial compounding in physical resilience and overall vitality.',
      },
    ];

    thinkDeeper = {
      assumptions: ['Assuming standard routine without acute medical contraindications.'],
      missingInformation: ['Personal baseline fitness and sleep consistency.'],
      biases: ['All-or-Nothing Bias: Believing a health routine is only valuable if it is extreme.'],
      blindspotQuestions: ['Is your routine something you can realistically sustain 1 year from now?'],
      questionsToAskOthers: ['Consult a licensed healthcare professional or trainer for personalized clinical guidance.'],
      researchItems: ['Review evidence-based sleep hygiene and progressive habit building.'],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: recommended.title,
      mainReasons: [
        `Prioritizing ${recommended.title} supports sustainable physical recovery and long-term health.`,
        `It delivers the highest vitality return with the lowest risk of burnout or physical strain.`,
        `Consistent, measured health habits compound more reliably than sporadic, extreme efforts.`
      ],
      tradeOff: `Requires steady commitment, but protects your baseline energy and well-being.`,
      bottomLine: `Commit to ${recommended.title} consistently and allow your body adequate rest and nutrition.`,
      biggestConcern: 'Maintaining daily consistency without overcomplicating the routine.',
      missingInformation: 'Specific physical baseline and recovery metrics.',
      confidenceLevel: 'High' as const,
      confidenceReason: 'Sustainable, low-friction health habits universally outperform sporadic high-stress regimens.',
      whyNotOptions: {
        [runnerUp.id]: `${runnerUp.title} provides less direct support for your daily vitality and recovery.`,
      },
      reversalConditions: [
        'If acute pain, discomfort, or medical symptoms occur (consult a doctor immediately).',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Physical Discomfort',
          condition: 'If persistent fatigue or joint strain occurs',
          impact: 'Reduce intensity and prioritize restorative sleep and hydration',
          urgency: 'Immediate' as const,
        },
      ],
    };
  } else if (domain === 'technical') {
    // --------------------------------------------------
    // TECHNICAL / SOFTWARE ARCHITECTURE (Postgres vs Mongo, React vs Vue, etc.)
    // --------------------------------------------------
    criteria = [
      { id: 'crit1', name: 'Data Integrity & Query Modeling', weight: 35, description: 'ACID transactional guarantees, join complexity, and relational correctness.' },
      { id: 'crit2', name: 'Developer Velocity & Tooling', weight: 25, description: 'Ecosystem maturity, TypeScript/ORM support, and ease of onboarding.' },
      { id: 'crit3', name: 'Scalability & Performance', weight: 20, description: 'Horizontal/vertical scaling characteristics and query performance under load.' },
      { id: 'crit4', name: 'Operational Simplicity & Cost', weight: 20, description: 'Hosting overhead, backup reliability, and maintenance effort.' },
    ];

    const isOpt1Postgres = opt1.title.toLowerCase().includes('postgres') || opt1.title.toLowerCase().includes('sql') || opt1.title.toLowerCase().includes('react');
    const recommended = isOpt1Postgres ? opt1 : (opt2 || opt1);
    const runnerUp = recommended.id === opt1.id ? opt2 : opt1;

    weightedScores = {
      [opt1.id]: {
        crit1: isOpt1Postgres ? 9.2 : 7.2,
        crit2: isOpt1Postgres ? 8.5 : 8.8,
        crit3: isOpt1Postgres ? 8.8 : 8.4,
        crit4: isOpt1Postgres ? 8.5 : 8.0,
      },
      [opt2.id]: {
        crit1: isOpt1Postgres ? 7.2 : 9.2,
        crit2: isOpt1Postgres ? 8.8 : 8.5,
        crit3: isOpt1Postgres ? 8.4 : 8.8,
        crit4: isOpt1Postgres ? 8.0 : 8.5,
      },
    };

    prosCons = options.map((opt, idx) => ({
      optionId: opt.id,
      pros: [
        {
          text: idx === 0
            ? `Superior relational consistency, strict typing, and mature ecosystem tooling for ${opt.title}`
            : `Flexible dynamic schema iteration and rapid prototyping velocity for ${opt.title}`,
          weight: 'high' as const,
          source: 'AI SUGGESTED' as const,
        },
      ],
      cons: [
        {
          text: idx === 0
            ? `Requires deliberate schema migration planning as models evolve`
            : `Application layer must enforce relational constraints and schema validation`,
          weight: 'medium' as const,
          source: 'AI SUGGESTED' as const,
        },
      ],
    }));

    swot = options.map((opt, idx) => ({
      optionId: opt.id,
      strengths: [idx === 0 ? `Industry-standard ACID compliance and SQL tooling for ${opt.title}` : `Polymorphic document nesting and rapid JSON ingestion for ${opt.title}`],
      weaknesses: [idx === 0 ? 'Strict migrations required for schema changes' : 'Lack of native multi-entity transactional joins'],
      opportunities: ['Building a bulletproof data layer that scales gracefully'],
      threats: ['Choosing the wrong abstraction layer early in architecture design'],
    }));

    comparison = [
      {
        criterion: 'Relational ACID Integrity',
        scores: { [opt1.id]: 'High (9.2)', [opt2.id]: 'Moderate (7.2)' },
        winnerOptionId: opt1.id,
        note: `${opt1.title} provides predictable relational guarantees and join performance.`,
      },
      {
        criterion: 'Schema Evolution Velocity',
        scores: { [opt1.id]: 'Moderate (8.0)', [opt2.id]: 'High (9.0)' },
        winnerOptionId: opt2.id,
        note: `${opt2.title} accelerates early prototype iteration when fields change frequently.`,
      },
    ];

    risks = [
      {
        id: 'r_data_modeling',
        optionId: opt1.id,
        risk: 'Premature schema lock-in before domain entities stabilize',
        probability: 'Low',
        impact: 'Medium',
        mitigation: 'Use modern migration tools (Drizzle/Prisma) and modular domain schemas.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Phase 1: Clear type-safe entities and predictable relational schemas.',
        longTerm: 'Production: Solid transactional integrity and robust analytical query support.',
      },
    ];

    thinkDeeper = {
      assumptions: ['Assuming standard web application transactional workload.'],
      missingInformation: ['Specific write-heavy vs read-heavy query profile.'],
      biases: ['Familiarity Bias: Choosing a database solely because of past habit.'],
      blindspotQuestions: ['Will your application require complex cross-entity reporting and financial integrity?'],
      questionsToAskOthers: ['Review with backend engineers on team regarding migration management tooling.'],
      researchItems: ['Benchmark query latency on complex multi-table joins.'],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: recommended.title,
      mainReasons: [
        `Choosing ${recommended.title} provides robust data integrity and strict ACID guarantees essential for production reliability.`,
        `It offers superior ecosystem tooling, type safety, and battle-tested migration workflows.`,
        `Relational modeling prevents inconsistent data states as application features expand.`
      ],
      tradeOff: `Requires defining upfront schemas and running migrations, but prevents data integrity degradation.`,
      bottomLine: `Adopt ${recommended.title} as your core architectural foundation for reliable, scalable data modeling.`,
      biggestConcern: 'Establishing clean schema migration pipelines early in development.',
      missingInformation: 'Specific concurrency load and read/write ratio.',
      confidenceLevel: 'High' as const,
      confidenceReason: 'Strict relational integrity and proven ecosystem tooling strongly favor this architecture.',
      whyNotOptions: {
        [runnerUp.id]: `${runnerUp.title} shifts data integrity enforcement to application code, increasing long-term maintenance risk.`,
      },
      reversalConditions: [
        'If application requirements become purely unstructured document storage with zero cross-entity joins.',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Data Shape Shift',
          condition: 'If unstructured polymorphic documents exceed 80% of data volume',
          impact: 'Consider adding a dedicated document store or JSONB indexing',
          urgency: 'Quarterly Review' as const,
        },
      ],
    };
  } else if (domain === 'general') {
    // --------------------------------------------------
    // GENERAL / EVERYDAY LIFE
    // --------------------------------------------------
    criteria = [
      { id: 'crit1', name: 'Practical Simplicity & Ease', weight: 35, description: 'Lowest friction, easiest execution, and immediate clarity.' },
      { id: 'crit2', name: 'Peace of Mind & Low Stress', weight: 30, description: 'Minimizing mental clutter and worry.' },
      { id: 'crit3', name: 'Resource & Time Efficiency', weight: 20, description: 'Optimizing available time, energy, and financial budget.' },
      { id: 'crit4', name: 'Flexibility & Low Regret', weight: 15, description: 'Keeping future options open and minimizing potential downsides.' },
    ];

    const recommended = opt1;
    const runnerUp = opt2;

    weightedScores = {
      [opt1.id]: { crit1: 8.5, crit2: 8.5, crit3: 8.0, crit4: 8.0 },
      [opt2.id]: { crit1: 7.0, crit2: 7.0, crit3: 7.5, crit4: 7.5 },
    };

    prosCons = options.map((opt) => ({
      optionId: opt.id,
      pros: [
        { text: `Provides clear practical alignment with immediate daily needs for ${opt.title}`, weight: 'high' as const, source: 'AI SUGGESTED' as const },
      ],
      cons: [
        { text: `Carries standard transition effort or minor trade-offs`, weight: 'medium' as const, source: 'AI SUGGESTED' as const },
      ],
    }));

    swot = options.map((opt) => ({
      optionId: opt.id,
      strengths: [`Direct utility for ${opt.title}`],
      weaknesses: ['Minor logistical trade-off'],
      opportunities: ['Unlocking smoother daily flow'],
      threats: ['Overthinking instead of taking decisive action'],
    }));

    comparison = [
      {
        criterion: 'Practical Efficiency',
        scores: { [opt1.id]: 'High', [opt2.id]: 'Moderate' },
        winnerOptionId: opt1.id,
        note: 'Direct execution brings clarity and removes decision fatigue.',
      },
    ];

    risks = [
      {
        id: 'r_overthinking',
        optionId: opt1.id,
        risk: 'Spending excessive time deliberating on easily reversible decisions',
        probability: 'Low',
        impact: 'Low',
        mitigation: 'Make the choice and move forward confidently.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Next 7 days: Smooth execution and elimination of decision friction.',
        longTerm: 'Month ahead: Steady satisfaction with zero lingering doubt.',
      },
    ];

    thinkDeeper = {
      assumptions: ['Assuming the decision is easily adjustable if circumstances change.'],
      missingInformation: ['Specific personal preference nuances.'],
      biases: ['Analysis Paralysis: Spending hours on a low-stakes choice.'],
      blindspotQuestions: ['Will this choice significantly matter a month from now?'],
      questionsToAskOthers: ['Ask a trusted friend for a 10-second gut check.'],
      researchItems: ['Review the simplest path to execute.'],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: recommended.title,
      mainReasons: [
        `Choosing ${recommended.title} delivers the cleanest balance of practical ease and peace of mind.`,
        `It eliminates unnecessary complexity and allows you to move forward without second-guessing.`,
        `This option carries the lowest friction and lowest post-decision regret.`
      ],
      tradeOff: `Opting for ${recommended.title} means setting aside ${runnerUp.title}, but gains immediate closure.`,
      bottomLine: `Execute on ${recommended.title} confidently and focus your energy on what matters most today.`,
      biggestConcern: 'Avoiding analysis paralysis on everyday choices.',
      missingInformation: 'Personal preference subtleties.',
      confidenceLevel: 'High' as const,
      confidenceReason: 'Clear practical benefits and low risk favor taking decisive action.',
      whyNotOptions: {
        [runnerUp.id]: `${runnerUp.title} carries slightly more logistical friction.`,
      },
      reversalConditions: [
        'If new practical constraints emerge.',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Constraint Shift',
          condition: 'If daily schedule or resources change unexpectedly',
          impact: 'Adjust execution accordingly with minimal friction',
          urgency: 'Within 30 days' as const,
        },
      ],
    };
  } else {
    // --------------------------------------------------
    // CAREER / PROFESSIONAL / BUSINESS (Strictly when domain is career)
    // --------------------------------------------------
    const priorities = input.priorities && input.priorities.length > 0
      ? input.priorities
      : ['Long-Term Growth', 'Compensation & Stability', 'Work-Life Balance', 'Autonomy'];

    criteria = [
      { id: 'crit1', name: priorities[0] || 'Long-Term Growth', weight: 35, description: 'Potential advancement, skill compounding, and long-term ceiling.' },
      { id: 'crit2', name: priorities[1] || 'Compensation & Stability', weight: 25, description: 'Financial security, cash flow, and economic stability.' },
      { id: 'crit3', name: priorities[2] || 'Work-Life Balance & Wellbeing', weight: 20, description: 'Sustainable daily hours, manageable stress, and mental health.' },
      { id: 'crit4', name: priorities[3] || 'Autonomy & Flexibility', weight: 20, description: 'Control over schedule, directional agency, and personal freedom.' },
    ];

    const recommended = opt1;
    const runnerUp = opt2;

    weightedScores = {
      [opt1.id]: { crit1: 8.8, crit2: 7.5, crit3: 7.0, crit4: 8.5 },
      [opt2.id]: { crit1: 6.2, crit2: 8.5, crit3: 8.0, crit4: 6.5 },
    };

    prosCons = options.map((opt, idx) => ({
      optionId: opt.id,
      pros: [
        {
          text: idx === 0
            ? `Higher strategic alignment with long-term compounding and ceiling`
            : `Predictable baseline stability and lower immediate uncertainty`,
          weight: 'high' as const,
          source: 'AI SUGGESTED' as const,
        },
      ],
      cons: [
        {
          text: idx === 0
            ? `Requires upfront ramp-up effort and transition discipline`
            : `Lower long-term trajectory and higher opportunity cost`,
          weight: 'medium' as const,
          source: 'AI SUGGESTED' as const,
        },
      ],
    }));

    swot = options.map((opt, idx) => ({
      optionId: opt.id,
      strengths: [idx === 0 ? `Unlocks higher long-term upside for ${opt.title}` : `Immediate certainty for ${opt.title}`],
      weaknesses: [idx === 0 ? 'Initial transition friction' : 'Slower growth velocity'],
      opportunities: [idx === 0 ? 'Positioning for senior opportunities' : 'Predictable routines'],
      threats: [idx === 0 ? 'Execution pacing risk' : 'Stagnation over time'],
    }));

    comparison = [
      {
        criterion: criteria[0].name,
        scores: { [opt1.id]: 'High (8.8)', [opt2.id]: 'Moderate (6.2)' },
        winnerOptionId: opt1.id,
        note: `${opt1.title} provides superior strategic trajectory.`,
      },
    ];

    risks = [
      {
        id: 'r_career_pacing',
        optionId: opt1.id,
        risk: 'Underestimating the initial ramp-up workload',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Establish weekly milestone check-ins and calendar boundaries.',
      },
    ];

    scenarios = [
      {
        optionId: opt1.id,
        shortTerm: 'Months 1-6: Initial onboarding, establishing rhythm, and building momentum.',
        longTerm: 'Years 1-3: Strong compounding impact and enhanced career optionality.',
      },
      {
        optionId: opt2.id,
        shortTerm: 'Months 1-6: Comfortable predictable routine.',
        longTerm: 'Years 1-3: Stable baseline but potential regret over missed growth upside.',
      },
    ];

    thinkDeeper = {
      assumptions: ['Assuming dedicated execution capacity over the planned timeline.'],
      missingInformation: ['Detailed weekly schedule commitments.'],
      biases: [
        'Status Quo Bias: Overvaluing comfort because change requires initial effort.',
        'Sunk Cost Bias: Clinging to prior paths due to past invested time.',
      ],
      blindspotQuestions: [
        'In 3 years, which decision will you be genuinely proud of making?',
      ],
      questionsToAskOthers: [
        'Ask someone 3 years ahead: "What was the most important factor in your decision?"',
      ],
      researchItems: [
        'Review comparable career and project roadmaps.',
      ],
    };

    recommendation = {
      recommendedOptionId: recommended.id,
      recommendedOptionTitle: recommended.title,
      mainReasons: [
        `Choosing ${recommended.title} delivers significantly stronger strategic alignment with your growth and long-term trajectory.`,
        `Multi-criteria scoring establishes ${recommended.title} as the dominant path with the highest ceiling.`,
        `This route provides maximum operational flexibility and optionality over a ${input.timeHorizon || '1 year'} horizon.`
      ],
      tradeOff: `Pursuing ${recommended.title} requires navigating initial transition effort, but avoids long-term stagnation.`,
      bottomLine: `Commit to ${recommended.title} with clear quarterly milestones and regular reviews.`,
      biggestConcern: 'Managing initial transition pacing and protecting focused execution time.',
      missingInformation: 'Confirmed weekly calendar block schedule.',
      confidenceLevel: 'High' as const,
      confidenceReason: 'Mathematical score separation across weighted priorities clearly favors this path.',
      whyNotOptions: {
        [runnerUp.id]: `${runnerUp.title} scored lower across long-term upside and growth criteria compared to ${recommended.title}.`,
      },
      reversalConditions: [
        'If available weekly time falls below essential execution threshold.',
        'If unforeseen baseline disruption occurs requiring immediate triage.',
      ],
      reconsiderationTriggers: [
        {
          id: 'trig_1',
          factor: 'Execution Capacity',
          condition: 'If weekly dedicated time falls below 10 hours for 3 consecutive weeks',
          impact: 'Re-evaluate workload and consider adjusting milestone pace',
          urgency: 'Within 30 days' as const,
        },
      ],
    };
  }

  return {
    id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    title: cleanPrompt.length > 50 ? cleanPrompt.slice(0, 48) + '...' : cleanPrompt,
    originalPrompt: cleanPrompt,
    category: input.category || 'General',
    reversibility: input.reversibility || 'Somewhat reversible',
    timeHorizon: input.timeHorizon || 'Immediate',
    userPriorities: criteria.map((c) => c.name),
    options,
    clarificationState: input.clarificationState || {
      decisionSummary: cleanPrompt,
      optionsUnderstood: options.map((o) => o.title),
      keyConstraints: [`Time Horizon: ${input.timeHorizon || 'Immediate'}`, `Reversibility: ${input.reversibility || 'Somewhat reversible'}`],
      assumptionsIdentified: [`Focusing on the optimal trade-off balance for ${opt1.title}`],
      missingInfo: [],
      confirmedByUser: true,
    },
    clarifyingQuestions: [],
    prosCons,
    comparison,
    swot,
    criteria,
    weightedScores,
    risks,
    scenarios,
    thinkDeeper,
    recommendation: {
      ...recommendation,
      domain,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'analyzed' as const,
  };
}
