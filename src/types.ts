export type ReversibilityLevel =
  | 'Easy to reverse'
  | 'Somewhat reversible'
  | 'Difficult to reverse'
  | 'Nearly irreversible';

export type TimeHorizon =
  | 'Right now'
  | 'Today'
  | 'This week'
  | 'This month'
  | 'Long term'
  | "I'm not sure"
  | 'Immediate'
  | '3 months'
  | '1 year'
  | '1–2 years'
  | '3 years'
  | '5+ years'
  | 'Not sure'
  | string;

export type DecisionCategory =
  | 'Lifestyle'
  | 'Career'
  | 'Job Offer'
  | 'Education'
  | 'Shopping'
  | 'Purchase'
  | 'Finance'
  | 'Relationships'
  | 'Health'
  | 'Personal'
  | 'Business'
  | 'Technology'
  | 'Travel'
  | 'Relocation'
  | 'Startup'
  | 'Project'
  | 'General';

export interface Option {
  id: string;
  title: string;
  description: string;
  source?: 'user' | 'ai_suggested';
  addedAt?: string;
}

export type ClarifyingQuestionType =
  | 'single_select'
  | 'multi_select'
  | 'yes_no'
  | 'numeric'
  | 'currency'
  | 'short_text'
  | 'long_text';

export interface ClarifyingQuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type?: ClarifyingQuestionType;
  options?: ClarifyingQuestionOption[] | string[];
  suggestedAnswers?: string[]; // for backward compatibility
  userAnswer?: string | string[];
  whyItMatters?: string;
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

export interface ClarificationState {
  decisionSummary: string;
  optionsUnderstood: string[];
  keyConstraints: string[];
  assumptionsIdentified: string[];
  missingInfo: string[];
  clarifyingQuestions?: ClarifyingQuestion[];
  clarifyingAnswers?: Record<string, string | string[]>;
  confirmedByUser: boolean;
}

export interface ProConItem {
  id?: string;
  text: string;
  weight: 'low' | 'medium' | 'high';
  details?: string;
  source?: 'USER PROVIDED' | 'AI SUGGESTED';
}

export interface ProsConsOption {
  optionId: string;
  pros: ProConItem[];
  cons: ProConItem[];
}

export interface ComparisonRow {
  criterion: string;
  scores: Record<string, string>; // optionId -> display value
  winnerOptionId?: string;
  note?: string;
}

export interface SWOTOption {
  optionId: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Criterion {
  id: string;
  name: string;
  weight: number; // percentage (sum approx 100)
  description?: string;
}

export interface WeightedScores {
  // optionId -> criterionId -> score (1-10)
  [optionId: string]: Record<string, number>;
}

export interface RiskItem {
  id: string;
  optionId: string;
  risk: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
}

export interface ScenarioItem {
  optionId: string;
  shortTerm: string; // 1-6 months
  longTerm: string; // 1-5 years
  keyTurningPoint?: string;
}

export interface CaseScenario {
  optionId: string;
  bestCase: string;
  expectedCase: string;
  worstCase: string;
}

export interface LongTermImpact {
  optionId: string;
  financialImpact: string;
  careerImpact: string;
  timeImpact: string;
  learningImpact: string;
  opportunityCost: string;
}

export interface ThinkDeeper {
  assumptions: string[];
  missingInformation: string[];
  biases: string[];
  blindspotQuestions: string[];
  questionsToAskOthers: string[];
  researchItems: string[];
}

export interface AssumptionItem {
  id: string;
  text: string;
  status: 'confirmed' | 'edited' | 'rejected';
  userNote?: string;
}

export interface EvidenceItem {
  id: string;
  text: string;
  category: 'FACT' | 'ASSUMPTION' | 'INTERPRETATION' | 'UNKNOWN';
  source?: string;
}

export interface AISuggestedAlternative {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  isAdded?: boolean;
}

export interface ReconsiderationTrigger {
  id?: string;
  factor: string;
  condition: string;
  impact: string;
  urgency?: 'Immediate' | 'Within 30 days' | 'Quarterly Review';
}

export interface Recommendation {
  recommendedOptionId: string;
  recommendedOptionTitle: string;
  mainReasons: string[];
  biggestConcern: string;
  missingInformation: string;
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  confidenceReason?: string;
  tradeOff?: string;
  bottomLine?: string;
  domain?: string;
  whyNotOptions?: Record<string, string>; // optionId -> reason lost
  reversalConditions?: string[]; // "When should you reconsider?"
  reconsiderationTriggers?: ReconsiderationTrigger[];
  opportunityCosts?: Record<string, string>; // optionId -> cost description
}

export interface SensitivityItem {
  criterionId: string;
  criterionName: string;
  influenceRank: number;
  explanation: string;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  type: 'thought' | 'concern' | 'update' | 'final_reflection';
  content: string;
}

export interface DecisionOutcome {
  chosenOptionId?: string;
  chosenDate?: string;
  status?: 'Successful' | 'Mixed' | 'Unsuccessful';
  notes?: string;
  predictedVsActual?: {
    correctPredictions: string[];
    incorrectAssumptions: string[];
    unexpectedEvents: string[];
    lessonsLearned: string[];
  };
}

export interface DecisionVersion {
  id: string;
  timestamp: string;
  label: string;
  criteria: Criterion[];
  weightedScores: WeightedScores;
  options: Option[];
}

export interface DecisionAnalysis {
  id: string;
  title: string;
  originalPrompt: string;
  category: DecisionCategory;
  reversibility: ReversibilityLevel;
  timeHorizon: TimeHorizon;
  userPriorities: string[];
  options: Option[];
  clarificationState?: ClarificationState;
  clarifyingQuestions: ClarifyingQuestion[];
  prosCons: ProsConsOption[];
  comparison: ComparisonRow[];
  swot: SWOTOption[];
  criteria: Criterion[];
  weightedScores: WeightedScores;
  risks: RiskItem[];
  scenarios: ScenarioItem[];
  caseScenarios?: CaseScenario[];
  longTermImpacts?: LongTermImpact[];
  thinkDeeper: ThinkDeeper;
  assumptionsList?: AssumptionItem[];
  evidenceItems?: EvidenceItem[];
  aiSuggestedAlternatives?: AISuggestedAlternative[];
  recommendation: Recommendation;
  sensitivityAnalysis?: SensitivityItem[];
  journalEntries?: JournalEntry[];
  outcome?: DecisionOutcome;
  versionHistory?: DecisionVersion[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'clarifying' | 'analyzed' | 'decided';
  isQuickDecision?: boolean;
  quickDecisionNote?: string;
  selectedOptionId?: string;
  isFavorite?: boolean;
  customNotes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface FollowUpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}


