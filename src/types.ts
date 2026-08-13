export interface Option {
  id: string;
  title: string;
  description: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  suggestedAnswers: string[];
  userAnswer?: string;
}

export interface ProConItem {
  id?: string;
  text: string;
  weight: 'low' | 'medium' | 'high';
  details?: string;
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

export interface ThinkDeeper {
  assumptions: string[];
  missingInformation: string[];
  biases: string[];
  blindspotQuestions: string[];
  questionsToAskOthers: string[];
  researchItems: string[];
}

export interface Recommendation {
  recommendedOptionId: string;
  recommendedOptionTitle: string;
  mainReasons: string[];
  biggestConcern: string;
  missingInformation: string;
  confidenceLevel: 'High' | 'Medium' | 'Moderate' | 'Low';
}

export interface DecisionAnalysis {
  id: string;
  title: string;
  originalPrompt: string;
  userPriorities: string[];
  options: Option[];
  clarifyingQuestions: ClarifyingQuestion[];
  prosCons: ProsConsOption[];
  comparison: ComparisonRow[];
  swot: SWOTOption[];
  criteria: Criterion[];
  weightedScores: WeightedScores;
  risks: RiskItem[];
  scenarios: ScenarioItem[];
  thinkDeeper: ThinkDeeper;
  recommendation: Recommendation;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'analyzed' | 'decided';
  selectedOptionId?: string;
  customNotes?: string;
}

export interface FollowUpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
