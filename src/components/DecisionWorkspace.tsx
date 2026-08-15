import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Check,
  SlidersHorizontal,
  Loader2,
  Clock,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  FileCheck2,
  Shield,
  BarChart3,
  Grid2X2,
  Compass,
  Brain,
  Wand2,
  Layers,
  History,
  Award,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  DecisionAnalysis,
  DecisionCategory,
  ReversibilityLevel,
  TimeHorizon,
  ClarificationState,
  ClarifyingQuestion,
} from '../types';
import { extractAlternativesFromQuestionClient } from '../utils/optionExtractor';

interface DecisionWorkspaceProps {
  onRunAnalysis: (
    prompt: string,
    options: string[],
    priorities: string[],
    clarifyingAnswers: Record<string, string>,
    category: DecisionCategory,
    reversibility: ReversibilityLevel,
    timeHorizon: TimeHorizon,
    clarificationState?: ClarificationState
  ) => Promise<void>;
  isAnalyzing: boolean;
  loadingStep: number; // 0, 1, 2
  analysisError?: string | null;
  onClearAnalysisError?: () => void;
  onOpenTemplates?: () => void;
  onOpenHowItWorks?: () => void;
  onSelectSample?: (sampleId?: string) => void;
  savedDecisions?: DecisionAnalysis[];
  onSelectDecision?: (decision: DecisionAnalysis) => void;
  onDeleteDecision?: (id: string) => void;
  onOpenHistory?: () => void;
  initialPrompt?: string;
  initialOptions?: string[];
  initialPriorities?: string[];
  initialCategory?: DecisionCategory;
  initialReversibility?: ReversibilityLevel;
  initialTimeHorizon?: TimeHorizon;
}

const DEFAULT_PRIORITIES = [
  'Career Growth',
  'Money & Income',
  'Time Flexibility',
  'Long-term Stability',
  'Freedom & Autonomy',
  'Learning & Mastery',
  'Family & Relationships',
  'Risk Tolerance',
  'Health & Wellbeing',
];

const CATEGORIES: DecisionCategory[] = [
  'Career',
  'Job Offer',
  'Education',
  'Business',
  'Technology',
  'Purchase',
  'Travel',
  'Relocation',
  'Relationships',
  'Finance',
  'Startup',
  'Project',
  'General',
];

const REVERSIBILITY_OPTIONS: { level: ReversibilityLevel; description: string }[] = [
  { level: 'Easy to reverse', description: 'Low cost/effort to undo (e.g. trial subscription)' },
  { level: 'Somewhat reversible', description: 'Requires minor time or negotiation to undo (e.g. job change)' },
  { level: 'Difficult to reverse', description: 'High cost or capital commitment (e.g. house purchase)' },
  { level: 'Nearly irreversible', description: 'Permanent strategic shift (e.g. selling equity)' },
];

const TIME_HORIZONS: TimeHorizon[] = ['Immediate', '3 months', '1 year', '3 years', '5+ years'];

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = ({
  onRunAnalysis,
  isAnalyzing,
  loadingStep,
  analysisError,
  onClearAnalysisError,
  onOpenTemplates,
  onOpenHowItWorks,
  onSelectSample,
  savedDecisions = [],
  onSelectDecision,
  onDeleteDecision,
  onOpenHistory,
  initialPrompt = '',
  initialOptions = ['', ''],
  initialPriorities = ['Career Growth', 'Money & Income', 'Time Flexibility'],
  initialCategory = 'Career',
  initialReversibility = 'Somewhat reversible',
  initialTimeHorizon = '1 year',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [options, setOptions] = useState<string[]>(
    initialOptions.length >= 2 ? initialOptions : ['', '']
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(initialPriorities);
  const [category, setCategory] = useState<DecisionCategory>(initialCategory);
  const [reversibility, setReversibility] = useState<ReversibilityLevel>(initialReversibility);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(initialTimeHorizon);

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [workspaceStep, setWorkspaceStep] = useState<'input' | 'clarify'>('input');
  const [errorMessage, setErrorMessage] = useState('');

  // AI Decision Clarification local state
  const [clarification, setClarification] = useState<ClarificationState | null>(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Interactive Trade-Off Simulator State
  const [simWeights, setSimWeights] = useState({
    growth: 40,
    financial: 30,
    balance: 20,
    risk: 10,
  });

  // Cognitive Bias Audit State
  const [auditedBiases, setAuditedBiases] = useState<Record<string, boolean>>({
    sunkCost: false,
    statusQuo: false,
    overconfidence: false,
    confirmation: false,
  });

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== priority));
    } else {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setPrompt('Should I accept a $1,200/month remote software engineer position, or dedicate 6 months to upskilling in AI agents and full-stack development for $3,500+/month international opportunities?');
    } else {
      setPrompt((prev) => `${prev.trim()} What are the long-term trade-offs, financial trajectory, and risk mitigation strategies over a ${timeHorizon} timeline?`);
    }
  };

  const handleProceedToClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!prompt.trim()) {
      setErrorMessage('Please describe the decision you are facing.');
      return;
    }

    const filteredOpts = options.map((o) => o.trim()).filter(Boolean);
    setIsGeneratingQuestions(true);
    setWorkspaceStep('clarify');

    try {
      const response = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          options: filteredOpts,
          category,
          reversibility,
          timeHorizon,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClarification(data.clarificationState || {
          decisionSummary: prompt.trim(),
          optionsUnderstood: data.options?.map((o: any) => o.title) || (filteredOpts.length >= 2 ? filteredOpts : extractAlternativesFromQuestionClient(prompt.trim())),
          keyConstraints: [
            `Time Horizon: ${timeHorizon}`,
            `Reversibility: ${reversibility}`,
            `Category: ${category}`,
          ],
          assumptionsIdentified: [
            `Primary focus is maximizing outcome over ${timeHorizon} timeline`,
            `Selected priority order reflects core evaluation metrics`,
          ],
          missingInfo: [],
          confirmedByUser: false,
        });
        setClarifyingQuestions(data.clarifyingQuestions || []);
        // Initialize default answers if provided
        const initialAnswers: Record<string, string> = {};
        (data.clarifyingQuestions || []).forEach((q: ClarifyingQuestion) => {
          if (q.defaultValue) {
            initialAnswers[q.id] = q.defaultValue;
          }
        });
        setClarifyingAnswers(initialAnswers);
      } else {
        throw new Error('Fallback to local clarification');
      }
    } catch (err) {
      const optionsUnderstood =
        filteredOpts.length >= 2
          ? filteredOpts
          : extractAlternativesFromQuestionClient(prompt.trim());

      const fallbackClarification: ClarificationState = {
        decisionSummary: prompt.trim(),
        optionsUnderstood,
        keyConstraints: [
          `Time Horizon: ${timeHorizon}`,
          `Reversibility: ${reversibility}`,
          `Category: ${category}`,
        ],
        assumptionsIdentified: [
          `Primary focus is maximizing outcome over ${timeHorizon} timeline`,
          `Selected priority order reflects core evaluation metrics`,
        ],
        missingInfo: [
          'Specific non-negotiable financial thresholds',
          'Exact downside worst-case mitigation runway',
        ],
        confirmedByUser: false,
      };

      const fallbackQuestions: ClarifyingQuestion[] = [
        {
          id: 'q1',
          question: `What is your single most important priority between ${optionsUnderstood[0] || 'Option 1'} and ${optionsUnderstood[1] || 'Option 2'}?`,
          type: 'single_select',
          suggestedAnswers: ['Long-term upside potential', 'Immediate financial safety', 'Autonomy & freedom', 'Skill mastery & learning'],
          whyItMatters: 'Directly anchors the weighted decision matrix conviction score.',
        },
        {
          id: 'q2',
          question: 'What is your current risk tolerance or financial runway?',
          type: 'single_select',
          suggestedAnswers: ['High (6+ months runway)', 'Moderate (2-5 months runway)', 'Low (Need immediate cash flow)'],
          whyItMatters: 'Weights the probability and impact of downside operational scenarios.',
        },
      ];

      setClarification(fallbackClarification);
      setClarifyingQuestions(fallbackQuestions);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleConfirmAndRun = async () => {
    if (!clarification) return;

    const filteredOptions = options.map((o) => o.trim()).filter(Boolean);

    await onRunAnalysis(
      prompt.trim(),
      filteredOptions,
      selectedPriorities,
      clarifyingAnswers,
      category,
      reversibility,
      timeHorizon,
      { ...clarification, confirmedByUser: true }
    );
  };

  const loadingSteps = [
    'Structuring decision parameters & clarifying option constraints...',
    'Evaluating trade-offs, SWOT matrix, and option score metrics...',
    'Synthesizing weighted score matrix, sensitivity analysis, & risk scenarios...',
  ];

  return (
    <div id="workspace" className="w-full space-y-6">
      {/* Sleek Top Studio Header Banner */}
      <div className="bg-[#FAF8F5] text-stone-900 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden border border-[#E8E5DF]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/50 blur-[90px] rounded-bl-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B88E3D]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E5DF] text-[11px] font-bold text-[#B88E3D]">
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Decision Intelligence Studio</span>
              <span className="text-stone-300 font-mono">•</span>
              <span className="text-[#B88E3D] font-mono">Gemini AI Executive Engine</span>
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[#2C221E] font-normal tracking-tight">
              Turn complex dilemmas into <span className="not-italic font-serif text-[#B88E3D] font-bold">clear, confident decisions.</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Multi-criteria decision analysis (MCDA), weighted scoring matrices, SWOT trade-offs, risk scenarios, and cognitive bias prevention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C221E] hover:bg-[#3D312B] text-xs font-bold text-white transition-all shadow-xs cursor-pointer border border-[#2C221E]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A338]" />
                <span className="text-[#D4A338]">Pre-Built Samples</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-xs font-bold text-stone-800 border border-[#E8E5DF] hover:border-[#B88E3D] transition-all shadow-2xs cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>Methodology</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Unified Surface */}
      <div className="bg-white border border-[#E8E5DF] rounded-2xl shadow-sm overflow-hidden text-stone-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 lg:divide-x divide-[#E8E5DF] items-stretch">
          
          {/* PANEL 1: DECISION SETUP & CONFIGURATION (Mobile: full, Tablet: col-span-1, Laptop: col-span-3) */}
          <div className="md:col-span-1 lg:col-span-3 bg-[#FAF7F2] p-5 sm:p-6 space-y-6 border-b md:border-b-0 md:border-r border-[#E8E5DF]">
            {/* Studio Navigation & Library */}
            <div className="space-y-2 pb-4 border-b border-[#E8E5DF]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  Studio Quick Nav
                </span>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                  v3.7 AI
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('');
                    setOptions(['', '']);
                    setSelectedPriorities(['Career Growth', 'Money & Income', 'Time Flexibility']);
                    setCategory('Career');
                    setReversibility('Somewhat reversible');
                    setTimeHorizon('1 year');
                    setWorkspaceStep('input');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] text-xs font-bold text-stone-800 transition-all shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>New Dilemma</span>
                </button>

                {onOpenHistory && (
                  <button
                    type="button"
                    onClick={onOpenHistory}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] text-xs font-bold text-stone-800 transition-all shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <History className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
                      <span className="truncate">Saved</span>
                    </div>
                    {savedDecisions && savedDecisions.length > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-[#2C221E] text-[#D4A338] px-1.5 py-0.2 rounded-full ml-1">
                        {savedDecisions.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Decision Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#B88E3D]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2C221E]">
                    Context & Scope
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Parameters</span>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Domain Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DecisionCategory)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#E8E5DF] text-stone-900 focus:outline-none focus:border-[#B88E3D] cursor-pointer shadow-2xs font-semibold"
                  disabled={isAnalyzing}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-stone-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reversibility Meter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>Reversibility Meter</span>
                </label>
                <select
                  value={reversibility}
                  onChange={(e) => setReversibility(e.target.value as ReversibilityLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#E8E5DF] text-stone-900 focus:outline-none focus:border-[#B88E3D] cursor-pointer shadow-2xs font-semibold"
                  disabled={isAnalyzing}
                >
                  {REVERSIBILITY_OPTIONS.map((r) => (
                    <option key={r.level} value={r.level} className="bg-white text-stone-900">
                      {r.level}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500 leading-tight italic pt-0.5">
                  {REVERSIBILITY_OPTIONS.find((r) => r.level === reversibility)?.description}
                </p>
              </div>

              {/* Time Horizon Selector */}
              <div className="space-y-2 pt-1 border-t border-[#E8E5DF]">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>Time Horizon Timeline</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_HORIZONS.map((th) => {
                    const isSel = timeHorizon === th;
                    return (
                      <button
                        key={th}
                        type="button"
                        onClick={() => setTimeHorizon(th)}
                        className={`px-2 py-1.5 rounded-md text-[11px] font-medium border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#2C221E] text-white border-[#2C221E] font-bold shadow-xs'
                            : 'bg-white text-stone-700 border-[#E8E5DF] hover:border-[#B88E3D] hover:text-stone-900'
                        }`}
                      >
                        {th}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Evaluation Metrics */}
              <div className="space-y-2.5 pt-2 border-t border-[#E8E5DF]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#B88E3D]" />
                    <span>Evaluation Metrics</span>
                  </label>
                  <span className="text-[10px] text-[#B88E3D] font-mono font-bold">
                    {selectedPriorities.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_PRIORITIES.map((priority) => {
                    const isSelected = selectedPriorities.includes(priority);
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => togglePriority(priority)}
                        disabled={isAnalyzing}
                        className={`px-2.5 py-1 rounded-full text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
                          isSelected
                            ? 'bg-[#2C221E] text-white border-[#2C221E] font-bold shadow-2xs'
                            : 'bg-white text-stone-700 border-[#E8E5DF] hover:border-[#B88E3D] hover:text-stone-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#D4A338] stroke-[3]" />}
                        <span>{priority}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: CENTRAL PRIMARY WORKSPACE (Mobile: full, Tablet: col-span-1, Laptop: col-span-6) */}
          <div className="md:col-span-1 lg:col-span-6 bg-white p-5 sm:p-6 space-y-5 relative flex flex-col justify-between">
            <div className="space-y-5">
              {/* Step Indicator Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E5DF] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      workspaceStep === 'input'
                        ? 'bg-[#2C221E] text-[#D4A338] font-extrabold'
                        : 'bg-stone-100 text-stone-500 border border-[#E8E5DF]'
                    }`}
                  >
                    1
                  </span>
                  <span className={`text-xs ${workspaceStep === 'input' ? 'font-bold text-stone-900' : 'text-stone-500'}`}>
                    1. Decision Inputs
                  </span>
                </div>

                <div className="h-0.5 flex-1 mx-4 bg-[#E8E5DF]" />

                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      workspaceStep === 'clarify'
                        ? 'bg-[#2C221E] text-[#D4A338] font-extrabold'
                        : 'bg-stone-100 text-stone-500 border border-[#E8E5DF]'
                    }`}
                  >
                    2
                  </span>
                  <span className={`text-xs ${workspaceStep === 'clarify' ? 'font-bold text-stone-900' : 'text-stone-500'}`}>
                    2. AI Clarification
                  </span>
                </div>
              </div>

              {/* STEP 1: INPUT FORM */}
              {workspaceStep === 'input' && (
                <form onSubmit={handleProceedToClarification} className="space-y-6 animate-fadeIn">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D] mb-0.5 block">
                        Your Dilemma
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif italic text-[#2C221E] font-bold">
                        Describe the decision you are facing
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/80 hover:bg-amber-100 text-xs font-bold text-amber-950 border border-amber-300 transition-colors cursor-pointer shrink-0"
                      title="Auto-enrich dilemma with trade-offs"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#B88E3D]" />
                      <span>Enhance Prompt</span>
                    </button>
                  </div>

                  {/* Dilemma Textarea */}
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Should I accept a $1,200/month remote software engineer offer now, or dedicate 6 months to upskilling in full-stack AI agents for $3,500+/mo global roles?"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-stone-900 placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:border-[#B88E3D] focus:ring-2 focus:ring-amber-500/10 transition-all resize-y leading-relaxed font-sans"
                      disabled={isAnalyzing}
                    />
                    {errorMessage && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        ⚠️ {errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Explicit Options Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#E8E5DF]">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#B88E3D] hover:text-[#9A732D] font-bold transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{showAdvancedOptions ? 'Hide Custom Options' : 'Specify Options Explicitly (Optional)'}</span>
                    </button>
                    <span className="text-[11px] text-stone-500">Auto-extracts options if left blank</span>
                  </div>

                  {showAdvancedOptions && (
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-3 animate-fadeIn">
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {options.map((opt, index) => (
                          <div
                            key={index}
                            className="p-2.5 rounded-lg bg-white border border-[#E8E5DF] space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                              <span>Option {index + 1}</span>
                              {options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                                  disabled={isAnalyzing}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="w-full px-2.5 py-1 text-xs rounded-md bg-[#FAF7F2] border border-[#E8E5DF] text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                              disabled={isAnalyzing}
                            />
                          </div>
                        ))}
                      </div>

                      {options.length < 5 && (
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="inline-flex items-center gap-1 text-xs text-[#B88E3D] hover:text-[#9A732D] font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                          disabled={isAnalyzing}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white bg-[#2C221E] hover:bg-[#3D312B] rounded-xl shadow-md transition-all group active:scale-[0.99] cursor-pointer border border-[#2C221E]"
                    >
                      <span className="text-[#D4A338]">CONTINUE TO AI CLARIFICATION</span>
                      <ArrowRight className="w-4 h-4 text-[#D4A338] stroke-[3] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: AI DECISION CLARIFICATION */}
              {workspaceStep === 'clarify' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Loading State when AI is preparing questions */}
                  {isGeneratingQuestions ? (
                    <div className="p-8 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-center space-y-4 shadow-2xs">
                      <Loader2 className="w-8 h-8 text-[#B88E3D] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-serif italic text-base font-bold text-[#2C221E]">
                          Formulating Clarifying Questions...
                        </h4>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
                          Analyzing options, trade-offs, and critical parameters for "{prompt.slice(0, 40)}..."
                        </p>
                      </div>
                    </div>
                  ) : clarification ? (
                    <div className="space-y-6">
                      {/* Summary Header */}
                      <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-4">
                        <div className="flex items-center gap-3 border-b border-[#E8E5DF] pb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#2C221E] text-[#D4A338] flex items-center justify-center font-bold shrink-0">
                            <FileCheck2 className="w-4 h-4 text-[#D4A338]" />
                          </div>
                          <div>
                            <h3 className="font-serif italic text-lg text-[#2C221E] font-bold">
                              AI Parameters & Identified Options
                            </h3>
                            <p className="text-xs text-stone-500">
                              Answer the key clarifying questions below to sharpen recommendation conviction, or proceed immediately.
                            </p>
                          </div>
                        </div>

                        {/* Options Understood */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-stone-900 uppercase tracking-wider block">
                            Alternatives Understood ({clarification.optionsUnderstood.length})
                          </span>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {clarification.optionsUnderstood.map((optTitle, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-lg bg-white border border-[#E8E5DF] text-xs font-medium text-stone-800 flex items-center justify-between shadow-2xs"
                              >
                                <span>
                                  <strong className="text-[#B88E3D]">Option {i + 1}:</strong> {optTitle}
                                </span>
                                <Check className="w-3.5 h-3.5 text-[#B88E3D]" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Parameters */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="px-2.5 py-1 rounded-md bg-white border border-[#E8E5DF] text-[11px] text-stone-700 font-medium">
                            📁 <strong>Category:</strong> {category}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-white border border-[#E8E5DF] text-[11px] text-stone-700 font-medium">
                            ↺ <strong>Reversibility:</strong> {reversibility}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-white border border-[#E8E5DF] text-[11px] text-stone-700 font-medium">
                            ⏱ <strong>Time Horizon:</strong> {timeHorizon}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Clarifying Questions Section */}
                      {clarifyingQuestions.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-[#B88E3D]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">
                                Clarifying Questions ({clarifyingQuestions.length})
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-stone-400">
                              Optional Context
                            </span>
                          </div>

                          <div className="space-y-4">
                            {clarifyingQuestions.map((q, idx) => {
                              const currentVal = clarifyingAnswers[q.id] || '';
                              const selectedMulti = currentVal ? currentVal.split(', ').filter(Boolean) : [];

                              return (
                                <div
                                  key={q.id || idx}
                                  className="p-4 sm:p-5 rounded-xl bg-white border border-[#E8E5DF] hover:border-[#B88E3D]/50 transition-all space-y-3 shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF7F2] text-[#B88E3D] border border-[#E8E5DF]">
                                          Q{idx + 1}
                                        </span>
                                        <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                                          {q.question}
                                        </h4>
                                      </div>
                                      {q.whyItMatters && (
                                        <p className="text-[11px] text-stone-500 italic pl-8">
                                          💡 {q.whyItMatters}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Render Input Based on Question Type */}
                                  <div className="pl-0 sm:pl-8 space-y-2 pt-1">
                                    {/* Type: single_select (Default) */}
                                    {(!q.type || q.type === 'single_select') && q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {q.suggestedAnswers.map((ans, aIdx) => {
                                          const isSelected = currentVal === ans;
                                          return (
                                            <button
                                              key={aIdx}
                                              type="button"
                                              onClick={() =>
                                                setClarifyingAnswers((prev) => ({
                                                  ...prev,
                                                  [q.id]: isSelected ? '' : ans,
                                                }))
                                              }
                                              className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer ${
                                                isSelected
                                                  ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-2xs font-semibold'
                                                  : 'bg-[#FAF7F2] hover:bg-white text-stone-800 border-[#E8E5DF] hover:border-[#B88E3D]'
                                              }`}
                                            >
                                              <span className={isSelected ? 'text-[#D4A338]' : ''}>{ans}</span>
                                              {isSelected && <Check className="w-4 h-4 text-[#D4A338] shrink-0" />}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Type: multi_select */}
                                    {q.type === 'multi_select' && q.suggestedAnswers && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {q.suggestedAnswers.map((ans, aIdx) => {
                                          const isSelected = selectedMulti.includes(ans);
                                          return (
                                            <button
                                              key={aIdx}
                                              type="button"
                                              onClick={() => {
                                                const next = isSelected
                                                  ? selectedMulti.filter((item) => item !== ans)
                                                  : [...selectedMulti, ans];
                                                setClarifyingAnswers((prev) => ({
                                                  ...prev,
                                                  [q.id]: next.join(', '),
                                                }));
                                              }}
                                              className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer ${
                                                isSelected
                                                  ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-2xs font-semibold'
                                                  : 'bg-[#FAF7F2] hover:bg-white text-stone-800 border-[#E8E5DF] hover:border-[#B88E3D]'
                                              }`}
                                            >
                                              <span className={isSelected ? 'text-[#D4A338]' : ''}>{ans}</span>
                                              <div
                                                className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                                  isSelected
                                                    ? 'bg-[#B88E3D] border-[#B88E3D] text-white'
                                                    : 'border-stone-300 bg-white'
                                                }`}
                                              >
                                                {isSelected && '✓'}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Type: boolean_yes_no */}
                                    {q.type === 'boolean_yes_no' && (
                                      <div className="flex items-center gap-3">
                                        {['Yes', 'No'].map((opt) => {
                                          const isSelected = currentVal.toLowerCase() === opt.toLowerCase();
                                          return (
                                            <button
                                              key={opt}
                                              type="button"
                                              onClick={() =>
                                                setClarifyingAnswers((prev) => ({
                                                  ...prev,
                                                  [q.id]: opt,
                                                }))
                                              }
                                              className={`px-5 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                                isSelected
                                                  ? 'bg-[#2C221E] text-[#D4A338] border-[#2C221E] shadow-2xs'
                                                  : 'bg-[#FAF7F2] hover:bg-white text-stone-800 border-[#E8E5DF] hover:border-[#B88E3D]'
                                              }`}
                                            >
                                              {opt}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Type: numeric */}
                                    {q.type === 'numeric' && (
                                      <div className="flex items-center gap-2 max-w-xs">
                                        <input
                                          type="number"
                                          min={q.validation?.min ?? 0}
                                          max={q.validation?.max ?? 1000000}
                                          step={q.validation?.step ?? 1}
                                          placeholder={q.placeholder || 'e.g. 20'}
                                          value={currentVal}
                                          onChange={(e) =>
                                            setClarifyingAnswers((prev) => ({
                                              ...prev,
                                              [q.id]: e.target.value,
                                            }))
                                          }
                                          className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                                        />
                                        {q.unit && (
                                          <span className="text-xs font-semibold text-stone-600 shrink-0">
                                            {q.unit}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Type: currency */}
                                    {q.type === 'currency' && (
                                      <div className="relative max-w-xs">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                                          $
                                        </span>
                                        <input
                                          type="text"
                                          placeholder={q.placeholder || 'e.g. 5,000 / month'}
                                          value={currentVal}
                                          onChange={(e) =>
                                            setClarifyingAnswers((prev) => ({
                                              ...prev,
                                              [q.id]: e.target.value,
                                            }))
                                          }
                                          className="w-full pl-8 pr-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                                        />
                                      </div>
                                    )}

                                    {/* Type: text / short_text / long_text */}
                                    {(q.type === 'short_text' || q.type === 'long_text') && (
                                      <input
                                        type="text"
                                        placeholder={q.placeholder || 'Type your specific detail here...'}
                                        value={currentVal}
                                        onChange={(e) =>
                                          setClarifyingAnswers((prev) => ({
                                            ...prev,
                                            [q.id]: e.target.value,
                                          }))
                                        }
                                        className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-medium text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                                      />
                                    )}

                                    {/* Custom answer option for single_select */}
                                    {(!q.type || q.type === 'single_select') && (
                                      <div className="pt-1">
                                        <input
                                          type="text"
                                          placeholder="Or enter custom answer..."
                                          value={
                                            q.suggestedAnswers?.includes(currentVal)
                                              ? ''
                                              : currentVal
                                          }
                                          onChange={(e) =>
                                            setClarifyingAnswers((prev) => ({
                                              ...prev,
                                              [q.id]: e.target.value,
                                            }))
                                          }
                                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-[11px] text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#B88E3D]"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Error Alert with Try Again */}
                      {analysisError && !isAnalyzing && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-stone-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-amber-900">Analysis Notice</p>
                              <p className="text-xs text-amber-800">{analysisError}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {onClearAnalysisError && (
                              <button
                                type="button"
                                onClick={onClearAnalysisError}
                                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                              >
                                Dismiss
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleConfirmAndRun}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-[#2C221E] hover:bg-[#3D312B] rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Loading State or Submit Button */}
                      {isAnalyzing ? (
                        <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-center space-y-4">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 text-[#B88E3D] animate-spin" />
                            <span className="font-serif italic text-base font-medium text-[#2C221E]">
                              {loadingSteps[loadingStep] || loadingSteps[0]}
                            </span>
                          </div>

                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden max-w-md mx-auto">
                            <div
                              className="bg-[#B88E3D] h-full transition-all duration-700 ease-out"
                              style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setWorkspaceStep('input')}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
                          >
                            ← Edit Inputs
                          </button>

                          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={handleConfirmAndRun}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-bold text-stone-800 hover:text-[#B88E3D] transition-colors cursor-pointer"
                            >
                              Skip Questions & Analyze
                            </button>

                            <button
                              type="button"
                              onClick={handleConfirmAndRun}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-[#2C221E] hover:bg-[#3D312B] rounded-xl shadow-md transition-all group active:scale-[0.99] cursor-pointer border border-[#2C221E]"
                            >
                              <Sparkles className="w-4 h-4 text-[#D4A338]" />
                              <span className="text-[#D4A338]">GENERATE DECISION INTELLIGENCE</span>
                              <ArrowRight className="w-4 h-4 text-[#D4A338] stroke-[3] group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* PANEL 3: AI INTELLIGENCE SUITE (Mobile: full, Tablet: col-span-2, Laptop: col-span-3) */}
          <div className="md:col-span-2 lg:col-span-3 bg-[#FAF7F2] p-5 space-y-5 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl border-t md:border-t-0 md:border-l border-[#E8E5DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#B88E3D]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2C221E]">
                  AI Intelligence
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                Preview
              </span>
            </div>

            {/* Quick Starter Scenarios */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Starter Scenarios
              </span>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('Should I accept a $1,200/month remote software engineer offer now, or dedicate 6 months to upskilling in AI agents and full-stack development for $3,500+/month international roles?');
                    setCategory('Career');
                    setReversibility('Somewhat reversible');
                    setTimeHorizon('1 year');
                    setOptions(['Accept $1,200/mo Remote Engineer Job', 'Dedicate 6 Months to Intensive Upskilling']);
                    setSelectedPriorities(['Career Growth', 'Money & Income', 'Learning & Mastery']);
                  }}
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] text-left transition-all space-y-1 cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-[#B88E3D]">
                      Job Offer vs. Upskilling
                    </span>
                    <span className="text-[10px] text-[#B88E3D] font-mono font-bold">Career</span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    Immediate $1.2k income vs 6-month skill growth for $3.5k+ trajectory.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrompt('Should I buy a $650k suburban house with a 20% down payment or stay in my urban apartment rental ($2,800/mo) and invest the $130k down payment into stock market index funds?');
                    setCategory('Finance');
                    setReversibility('Difficult to reverse');
                    setTimeHorizon('5+ years');
                    setOptions(['Buy Suburban Home ($650k)', 'Rent Urban Apartment & Invest Capital']);
                    setSelectedPriorities(['Money & Income', 'Long-term Stability', 'Freedom & Autonomy']);
                  }}
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] text-left transition-all space-y-1 cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-[#B88E3D]">
                      Suburban Home vs Rent & Invest
                    </span>
                    <span className="text-[10px] text-[#B88E3D] font-mono font-bold">Finance</span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    Real estate equity stability vs liquid stock market compounding.
                  </p>
                </button>
              </div>
            </div>

            {/* Generated Outputs Suite */}
            <div className="space-y-2.5 pt-2.5 border-t border-[#E8E5DF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Generated Intelligence Outputs
              </span>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E8E5DF] shadow-2xs">
                  <BarChart3 className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">Weighted Score Matrix</span>
                    <span className="text-[10px] text-stone-500">Normalized priority ratings</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E8E5DF] shadow-2xs">
                  <Grid2X2 className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">2x2 SWOT Trade-Off Grid</span>
                    <span className="text-[10px] text-stone-500">Internal & external analysis</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E8E5DF] shadow-2xs">
                  <Shield className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">Risk Mitigation Protocol</span>
                    <span className="text-[10px] text-stone-500">Downside pre-mortem safeguards</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E8E5DF] shadow-2xs">
                  <Clock className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">1–5 Year Future Scenarios</span>
                    <span className="text-[10px] text-stone-500">Timeline trajectory forecasting</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E8E5DF] shadow-2xs">
                  <Brain className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">Cognitive Bias Filter</span>
                    <span className="text-[10px] text-stone-500">Sunk cost & FOMO audit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* LOWER DASHBOARD DESKTOP WORKBENCH: TRADE-OFF SIMULATOR + COGNITIVE BIAS AUDIT ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: LIVE TRADE-OFF SIMULATOR (7 Cols on LG) */}
        <div className="lg:col-span-7 bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs space-y-5 text-stone-900">
          <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2C221E] text-[#D4A338] flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-[#D4A338]" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-[#2C221E] font-bold">
                  Interactive Trade-Off Simulator
                </h3>
                <p className="text-xs text-stone-500">
                  Adjust weight priorities in real time to observe live score sensitivity across options.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300 rounded-full shrink-0">
              Sensitivity Engine
            </span>
          </div>

          {/* SIMULATED OPTION SCORE CARDS */}
          {(() => {
            const scoreA = (
              (simWeights.growth * 8.5 +
                simWeights.financial * 8.0 +
                simWeights.balance * 5.5 +
                simWeights.risk * 6.0) /
              100
            ).toFixed(1);
            const scoreB = (
              (simWeights.growth * 5.0 +
                simWeights.financial * 6.5 +
                simWeights.balance * 9.0 +
                simWeights.risk * 8.5) /
              100
            ).toFixed(1);
            const isOptALeader = parseFloat(scoreA) >= parseFloat(scoreB);
            const optATitle = options[0]?.trim() || 'Option A (e.g. Growth Leap)';
            const optBTitle = options[1]?.trim() || 'Option B (e.g. Stable Baseline)';

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* OPTION A CARD */}
                  <div
                    className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                      isOptALeader
                        ? 'bg-[#FAF7F2] text-stone-900 border-[#B88E3D] shadow-xs'
                        : 'bg-white text-stone-700 border-[#E8E5DF]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isOptALeader ? 'text-[#B88E3D]' : 'text-stone-500'
                        }`}
                      >
                        {isOptALeader ? '🏆 Leader Option' : 'Option 1'}
                      </span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          isOptALeader ? 'text-[#B88E3D]' : 'text-stone-800'
                        }`}
                      >
                        {scoreA} <span className="text-xs font-normal opacity-70">/ 10</span>
                      </span>
                    </div>
                    <h4 className="font-serif italic text-sm font-bold truncate text-[#2C221E]">
                      {optATitle}
                    </h4>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOptALeader ? 'bg-[#B88E3D]' : 'bg-stone-400'
                        }`}
                        style={{ width: `${parseFloat(scoreA) * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* OPTION B CARD */}
                  <div
                    className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                      !isOptALeader
                        ? 'bg-[#FAF7F2] text-stone-900 border-[#B88E3D] shadow-xs'
                        : 'bg-white text-stone-700 border-[#E8E5DF]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          !isOptALeader ? 'text-[#B88E3D]' : 'text-stone-500'
                        }`}
                      >
                        {!isOptALeader ? '🏆 Leader Option' : 'Option 2'}
                      </span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          !isOptALeader ? 'text-[#B88E3D]' : 'text-stone-800'
                        }`}
                      >
                        {scoreB} <span className="text-xs font-normal opacity-70">/ 10</span>
                      </span>
                    </div>
                    <h4 className="font-serif italic text-sm font-bold truncate text-[#2C221E]">
                      {optBTitle}
                    </h4>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          !isOptALeader ? 'bg-[#B88E3D]' : 'bg-stone-400'
                        }`}
                        style={{ width: `${parseFloat(scoreB) * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* PRIORITY SLIDERS WORKBENCH */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-3.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 block">
                    Interactive Priority Weight Allocator (%)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Slider 1: Growth */}
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-[#E8E5DF]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Growth Potential</span>
                        <span className="font-mono font-bold text-[#B88E3D]">{simWeights.growth}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.growth}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, growth: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#B88E3D] cursor-pointer"
                      />
                    </div>

                    {/* Slider 2: Financial */}
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-[#E8E5DF]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Financial Impact</span>
                        <span className="font-mono font-bold text-[#B88E3D]">{simWeights.financial}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.financial}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, financial: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#B88E3D] cursor-pointer"
                      />
                    </div>

                    {/* Slider 3: Work-Life Balance */}
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-[#E8E5DF]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Work-Life & Health</span>
                        <span className="font-mono font-bold text-[#B88E3D]">{simWeights.balance}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.balance}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, balance: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#B88E3D] cursor-pointer"
                      />
                    </div>

                    {/* Slider 4: Risk Mitigation */}
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-[#E8E5DF]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Stability & Risk</span>
                        <span className="font-mono font-bold text-[#B88E3D]">{simWeights.risk}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.risk}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, risk: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#B88E3D] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT COLUMN: COGNITIVE BIAS DIAGNOSTIC ENGINE (5 Cols on LG) */}
        <div className="lg:col-span-5 bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs space-y-4 text-stone-900">
          <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D] block">
                Psychological Rigor
              </span>
              <h3 className="font-serif italic text-lg text-[#2C221E] font-bold">
                Cognitive Bias Audit Engine
              </h3>
            </div>
            {(() => {
              const auditedCount = Object.values(auditedBiases).filter(Boolean).length;
              const pct = Math.round((auditedCount / 4) * 100);
              return (
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-100 text-amber-950 rounded-full border border-amber-300">
                  {pct}% Audited
                </span>
              );
            })()}
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Mitigate common psychological traps before finalizing your decision. Click to mark each risk parameter as audited.
          </p>

          <div className="space-y-2.5">
            {/* Bias 1: Sunk Cost */}
            <div
              onClick={() =>
                setAuditedBiases({ ...auditedBiases, sunkCost: !auditedBiases.sunkCost })
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                auditedBiases.sunkCost
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-[#FAF7F2] border-[#E8E5DF] hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.sunkCost ? 'bg-emerald-600 text-white' : 'bg-white border border-[#E8E5DF] text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>Sunk Cost Fallacy</span>
                  {auditedBiases.sunkCost && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Am I staying on this path purely because of money/time already invested?
                </p>
              </div>
            </div>

            {/* Bias 2: Status Quo */}
            <div
              onClick={() =>
                setAuditedBiases({ ...auditedBiases, statusQuo: !auditedBiases.statusQuo })
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                auditedBiases.statusQuo
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-[#FAF7F2] border-[#E8E5DF] hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.statusQuo ? 'bg-emerald-600 text-white' : 'bg-white border border-[#E8E5DF] text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>Status Quo Bias</span>
                  {auditedBiases.statusQuo && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Am I choosing inaction or default path simply to avoid immediate discomfort?
                </p>
              </div>
            </div>

            {/* Bias 3: Overconfidence */}
            <div
              onClick={() =>
                setAuditedBiases({ ...auditedBiases, overconfidence: !auditedBiases.overconfidence })
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                auditedBiases.overconfidence
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-[#FAF7F2] border-[#E8E5DF] hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.overconfidence ? 'bg-emerald-600 text-white' : 'bg-white border border-[#E8E5DF] text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>Planning Fallacy</span>
                  {auditedBiases.overconfidence && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Have I built a 30% realistic buffer for execution timeline and learning friction?
                </p>
              </div>
            </div>

            {/* Bias 4: Confirmation Bias */}
            <div
              onClick={() =>
                setAuditedBiases({ ...auditedBiases, confirmation: !auditedBiases.confirmation })
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                auditedBiases.confirmation
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-[#FAF7F2] border-[#E8E5DF] hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.confirmation ? 'bg-emerald-600 text-white' : 'bg-white border border-[#E8E5DF] text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>Confirmation Bias</span>
                  {auditedBiases.confirmation && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Have I actively searched for disconfirming evidence against my favored option?
                </p>
              </div>
            </div>
          </div>

          {/* LOWER LINKS */}
          <div className="pt-2 border-t border-[#E8E5DF] flex items-center justify-between text-xs">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="inline-flex items-center gap-1 text-stone-800 font-bold hover:text-[#B88E3D] transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>History ({savedDecisions.length})</span>
              </button>
            )}

            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample()}
                className="inline-flex items-center gap-1 text-stone-800 font-bold hover:text-[#B88E3D] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>Samples</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="inline-flex items-center gap-1 text-stone-800 font-bold hover:text-[#B88E3D] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>Framework</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

