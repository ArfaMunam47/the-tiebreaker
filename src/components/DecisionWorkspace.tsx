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
  RefreshCw,
  X,
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
  'Personal Enjoyment & Fun',
  'Rest, Health & Wellbeing',
  'Career Growth',
  'Money & Income',
  'Time Flexibility & Freedom',
  'Long-term Stability & Peace of Mind',
  'Learning & Skills',
  'Family & Friends',
  'Low Risk & Safety',
];

const CATEGORIES: DecisionCategory[] = [
  'Lifestyle',
  'Career',
  'Job Offer',
  'Education',
  'Shopping',
  'Finance',
  'Relationships',
  'Health',
  'Personal',
  'Business',
  'Technology',
  'Travel',
  'Relocation',
  'Startup',
  'Project',
  'General',
];

const REVERSIBILITY_OPTIONS: { level: ReversibilityLevel; description: string }[] = [
  { level: 'Easy to reverse', description: 'Very easy and cheap to undo (e.g. trial subscription or daily choice)' },
  { level: 'Somewhat reversible', description: 'Takes some time or effort to undo (e.g. changing jobs or classes)' },
  { level: 'Difficult to reverse', description: 'Hard or costly to undo (e.g. buying a house or car)' },
  { level: 'Nearly irreversible', description: 'Almost impossible to undo (e.g. selling equity or permanent moves)' },
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
  initialPriorities = ['Personal Enjoyment & Fun', 'Rest, Health & Wellbeing', 'Time Flexibility & Freedom'],
  initialCategory = 'Lifestyle',
  initialReversibility = 'Somewhat reversible',
  initialTimeHorizon = 'Immediate',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [options, setOptions] = useState<string[]>(
    initialOptions.length >= 2 ? initialOptions : ['', '']
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(initialPriorities);
  const [category, setCategory] = useState<DecisionCategory>(initialCategory);
  const [userCustomizedCategory, setUserCustomizedCategory] = useState(false);
  const [reversibility, setReversibility] = useState<ReversibilityLevel>(initialReversibility);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(initialTimeHorizon);

  // Enhance Prompt State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<{
    enhancedPrompt: string;
    originalPrompt: string;
    suggestedOptions?: string[];
    detectedLanguage?: string;
  } | null>(null);
  const [enhancedDraft, setEnhancedDraft] = useState('');
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [enhanceInputNotice, setEnhanceInputNotice] = useState<string | null>(null);

  // Auto-detect category and priorities from prompt if user hasn't explicitly picked one
  const handlePromptChange = (val: string) => {
    setPrompt(val);
    if (enhanceInputNotice) setEnhanceInputNotice(null);

    if (!userCustomizedCategory) {
      const lower = val.toLowerCase();
      if (
        lower.includes('friend') ||
        lower.includes('fight') ||
        lower.includes('argument') ||
        lower.includes('call her') ||
        lower.includes('call him') ||
        lower.includes('text') ||
        lower.includes('apologiz') ||
        lower.includes('relationship') ||
        lower.includes('breakup')
      ) {
        setCategory('Relationships');
        setSelectedPriorities(['Family & Friends', 'Long-term Stability & Peace of Mind', 'Time Flexibility & Freedom']);
      } else if (
        lower.includes('buy') ||
        lower.includes('phone') ||
        lower.includes('laptop') ||
        lower.includes('save money') ||
        lower.includes('spend') ||
        lower.includes('purchase') ||
        lower.includes('car')
      ) {
        setCategory('Shopping');
        setSelectedPriorities(['Money & Income', 'Long-term Stability & Peace of Mind', 'Low Risk & Safety']);
      } else if (
        lower.includes('stay home') ||
        lower.includes('stay at home') ||
        lower.includes('home order') ||
        lower.includes('order food') ||
        lower.includes('cook') ||
        lower.includes('go out') ||
        lower.includes('movie') ||
        lower.includes('read a book') ||
        lower.includes('weekend') ||
        lower.includes('party') ||
        lower.includes('relax')
      ) {
        setCategory('Lifestyle');
        setSelectedPriorities(['Personal Enjoyment & Fun', 'Rest, Health & Wellbeing', 'Time Flexibility & Freedom']);
      } else if (
        lower.includes('learn python') ||
        lower.includes('learn') ||
        lower.includes('study') ||
        lower.includes('course') ||
        lower.includes('degree') ||
        lower.includes('bootcamp')
      ) {
        setCategory('Education');
        setSelectedPriorities(['Learning & Skills', 'Career Growth', 'Time Flexibility & Freedom']);
      } else if (
        lower.includes('job offer') ||
        lower.includes('salary') ||
        lower.includes('promotion') ||
        lower.includes('career') ||
        lower.includes('startup') ||
        lower.includes('boss') ||
        lower.includes('resign')
      ) {
        setCategory('Career');
        setSelectedPriorities(['Career Growth', 'Money & Income', 'Time Flexibility & Freedom']);
      }
    }
  };

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

  // Real Enhance Prompt Integration
  const handleEnhancePrompt = async () => {
    if (isEnhancing) return;

    if (!prompt.trim()) {
      setEnhanceInputNotice('Please type your question or decision first so AI can make it clearer.');
      setTimeout(() => setEnhanceInputNotice(null), 4000);
      return;
    }

    setIsEnhancing(true);
    setEnhanceError(null);
    setEnhanceInputNotice(null);

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category,
          reversibility,
          timeHorizon,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not enhance the question right now. You can try again.');
      }

      const data = await response.json();
      if (data.enhancedPrompt) {
        setEnhancedResult(data);
        setEnhancedDraft(data.enhancedPrompt);
      } else {
        throw new Error('No enhanced prompt returned.');
      }
    } catch (err: any) {
      setEnhanceError(err.message || 'Something went wrong. Your original question is completely safe.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptEnhancedPrompt = () => {
    if (!enhancedDraft.trim()) return;
    setPrompt(enhancedDraft.trim());

    // If options are suggested and user currently has empty options, auto-fill them
    if (
      enhancedResult?.suggestedOptions &&
      enhancedResult.suggestedOptions.length >= 2
    ) {
      const areCurrentEmpty = options.every((o) => !o.trim());
      if (areCurrentEmpty) {
        setOptions(enhancedResult.suggestedOptions.slice(0, 4));
        setShowAdvancedOptions(true);
      }
    }

    setEnhancedResult(null);
    setEnhanceError(null);
  };

  const handleDiscardEnhancedPrompt = () => {
    setEnhancedResult(null);
    setEnhanceError(null);
  };

  const handleProceedToClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!prompt.trim()) {
      setErrorMessage('Please tell us what decision you are trying to make.');
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
            `Primary focus is finding the best choice over ${timeHorizon}`,
            `Priorities reflect what matters most to you`,
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
          `Timeframe: ${timeHorizon}`,
          `How easy to undo: ${reversibility}`,
          `Category: ${category}`,
        ],
        assumptionsIdentified: [
          `You want to pick the best path over ${timeHorizon}`,
          `Your selected factors are most important`,
        ],
        missingInfo: [
          'Specific budget or time limits',
          'What happens in the worst-case scenario',
        ],
        confirmedByUser: false,
      };

      const fallbackQuestions: ClarifyingQuestion[] = [
        {
          id: 'q1',
          question: `What matters most to you between "${optionsUnderstood[0] || 'Choice 1'}" and "${optionsUnderstood[1] || 'Choice 2'}"?`,
          type: 'single_select',
          suggestedAnswers: ['Long-term upside', 'Safety & peace of mind', 'Time freedom & flexibility', 'Personal happiness'],
          whyItMatters: 'Helps us score your choices based on your true goal.',
        },
        {
          id: 'q2',
          question: 'How comfortable are you taking risks with this choice?',
          type: 'single_select',
          suggestedAnswers: ['Very comfortable (ready for a big leap)', 'Moderate (want some safety buffer)', 'Low (prefer the safe, proven path)'],
          whyItMatters: 'Ensures we do not recommend something that feels too risky for you.',
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
    'Reading your choices & what matters most to you...',
    'Comparing pros, cons, and scoring each option...',
    'Checking for risks, blind spots, and preparing your recommendation...',
  ];

  return (
    <div id="workspace" className="w-full space-y-6">
      {/* Sleek Top Studio Header Banner */}
      <div className="skeuo-card text-stone-900 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/35 blur-[90px] rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full skeuo-well text-[11px] font-bold text-[#B88E3D]">
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Tiebreaker Decision Workspace</span>
              <span className="text-stone-400 font-mono">•</span>
              <span className="text-[#B88E3D] font-mono">Gemini AI</span>
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[#2C221E] font-normal tracking-tight">
              Turn hard choices into <span className="not-italic font-serif text-[#B88E3D] font-bold">clear, confident decisions.</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Compare your options, see real trade-offs, spot hidden risks, and get an honest, unbiased recommendation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl skeuo-btn-primary text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A338]" />
                <span className="text-[#D4A338]">See Examples</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>How It Works</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Unified Surface */}
      <div className="skeuo-card rounded-2xl overflow-hidden text-stone-900">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 items-stretch">
          
          {/* PANEL 1: DECISION SETUP & CONFIGURATION */}
          <div className="order-2 md:order-1 md:col-span-4 lg:col-span-3 bg-gradient-to-b from-[#FAF7F2] to-[#F4EFE6] p-4 sm:p-5 lg:p-6 space-y-6 border-t md:border-t-0 md:border-r border-[#E0D9CC] min-w-0">
            {/* Studio Navigation & Library */}
            <div className="space-y-2 pb-4 border-b border-[#E0D9CC]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  Quick Actions
                </span>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300/80 font-bold shadow-2xs">
                  AI Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('');
                    setOptions(['', '']);
                    setSelectedPriorities(['Personal Enjoyment & Fun', 'Rest, Health & Wellbeing', 'Time Flexibility & Freedom']);
                    setCategory('Lifestyle');
                    setReversibility('Somewhat reversible');
                    setTimeHorizon('Immediate');
                    setWorkspaceStep('input');
                    setEnhancedResult(null);
                    setEnhanceError(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>New Decision</span>
                </button>

                {onOpenHistory && (
                  <button
                    type="button"
                    onClick={onOpenHistory}
                    className="flex items-center justify-between px-3 py-2 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <History className="w-3.5 h-3.5 text-[#B88E3D]" />
                      <span className="truncate">Saved</span>
                    </div>
                    {savedDecisions && savedDecisions.length > 0 && (
                      <span className="text-[10px] font-mono font-bold skeuo-btn-primary text-[#D4A338] px-1.5 py-0.2 rounded-full ml-1">
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
                    Settings & Context
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as DecisionCategory);
                    setUserCustomizedCategory(true);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg skeuo-input text-stone-900 cursor-pointer font-semibold"
                  disabled={isAnalyzing}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-stone-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reversibility */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>How easy is this to undo?</span>
                </label>
                <select
                  value={reversibility}
                  onChange={(e) => setReversibility(e.target.value as ReversibilityLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg skeuo-input text-stone-900 cursor-pointer font-semibold"
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
              <div className="space-y-2 pt-1 border-t border-[#E0D9CC]">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>How far ahead are you looking?</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_HORIZONS.map((th) => {
                    const isSel = timeHorizon === th;
                    return (
                      <button
                        key={th}
                        type="button"
                        onClick={() => setTimeHorizon(th)}
                        className={`px-2 py-1.5 rounded-md text-[11px] font-medium text-center transition-all cursor-pointer ${
                          isSel
                            ? 'skeuo-btn-primary font-bold text-white'
                            : 'skeuo-btn-secondary text-stone-700'
                        }`}
                      >
                        {th}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What Matters Most */}
              <div className="space-y-2.5 pt-2 border-t border-[#E0D9CC]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#B88E3D]" />
                    <span>What matters most to you?</span>
                  </label>
                  <span className="text-[10px] text-[#B88E3D] font-mono font-bold">
                    {selectedPriorities.length} chosen
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
                        className={`px-2.5 py-1 rounded-full text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'skeuo-btn-primary text-white font-bold'
                            : 'skeuo-btn-secondary text-stone-700'
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

          {/* PANEL 2: CENTRAL PRIMARY WORKSPACE */}
          <div className="order-1 md:order-2 md:col-span-8 lg:col-span-6 bg-white p-4 sm:p-6 lg:p-7 space-y-6 min-w-0 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Step Indicator Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E0D9CC] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      workspaceStep === 'input'
                        ? 'skeuo-btn-primary text-[#D4A338] font-extrabold'
                        : 'skeuo-well text-stone-500'
                    }`}
                  >
                    1
                  </span>
                  <span className={`text-xs ${workspaceStep === 'input' ? 'font-bold text-stone-900' : 'text-stone-500'}`}>
                    1. Your Question
                  </span>
                </div>

                <div className="h-0.5 flex-1 mx-4 bg-[#E0D9CC]" />

                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      workspaceStep === 'clarify'
                        ? 'skeuo-btn-primary text-[#D4A338] font-extrabold'
                        : 'skeuo-well text-stone-500'
                    }`}
                  >
                    2
                  </span>
                  <span className={`text-xs ${workspaceStep === 'clarify' ? 'font-bold text-stone-900' : 'text-stone-500'}`}>
                    2. Quick Check
                  </span>
                </div>
              </div>

              {/* STEP 1: INPUT FORM */}
              {workspaceStep === 'input' && (
                <form onSubmit={handleProceedToClarification} className="space-y-5 animate-fadeIn">
                  {/* Header & Enhance Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D] mb-0.5 block">
                        Step 1
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif italic text-[#2C221E] font-bold">
                        Tell us what decision you're trying to make
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || isAnalyzing}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl skeuo-btn-amber text-xs font-bold text-amber-950 transition-colors cursor-pointer shrink-0 disabled:opacity-50 self-start sm:self-auto"
                      title="AI will make your question clearer while keeping your language"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B88E3D]" />
                          <span>Improving...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 text-[#B88E3D]" />
                          <span>Enhance Question</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Empty Input Friendly Notice */}
                  {enhanceInputNotice && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{enhanceInputNotice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnhanceInputNotice(null)}
                        className="text-amber-700 hover:text-amber-900 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Dilemma Textarea */}
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      placeholder="e.g. Should I go out with friends or stay home and rest? / Should I learn React or Python first? / Should I cook dinner or order food? (You can type in English, Urdu, or Roman Urdu)"
                      className="w-full px-4 py-3.5 rounded-xl skeuo-input text-stone-900 placeholder:text-stone-400 text-sm sm:text-base resize-y leading-relaxed font-sans"
                      disabled={isAnalyzing}
                    />
                    {errorMessage && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        ⚠️ {errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Enhance Prompt Result / Review Card */}
                  {enhancedResult && (
                    <div className="p-4 rounded-xl skeuo-card border-2 border-amber-300 bg-amber-50/60 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                          <span className="text-xs font-bold text-amber-950">
                            Clearer Version of Your Question
                          </span>
                        </div>
                        {enhancedResult.detectedLanguage && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                            {enhancedResult.detectedLanguage}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-600">
                        You can edit this improved question or use it right away:
                      </p>

                      <textarea
                        rows={3}
                        value={enhancedDraft}
                        onChange={(e) => setEnhancedDraft(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg skeuo-input text-stone-900 font-sans leading-relaxed"
                      />

                      {/* Suggested options if returned */}
                      {enhancedResult.suggestedOptions && enhancedResult.suggestedOptions.length >= 2 && (
                        <div className="text-[11px] text-stone-600 flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-stone-700">Identified choices:</span>
                          {enhancedResult.suggestedOptions.map((opt, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-white border border-amber-200 text-stone-800 font-medium">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDiscardEnhancedPrompt}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/40 cursor-pointer"
                        >
                          Keep Original
                        </button>
                        <button
                          type="button"
                          onClick={handleAcceptEnhancedPrompt}
                          className="px-4 py-1.5 rounded-lg skeuo-btn-primary text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-[#D4A338]" />
                          <span>Use This Question</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Enhance Error Notice with Retry */}
                  {enhanceError && (
                    <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-stone-900 flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{enhanceError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleEnhancePrompt}
                        className="px-3 py-1 text-xs font-bold skeuo-btn-secondary rounded-md cursor-pointer shrink-0"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Custom Options Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#E0D9CC]">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#B88E3D] hover:text-[#9A732D] font-bold transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{showAdvancedOptions ? 'Hide Choices' : 'Write Choices Manually (Optional)'}</span>
                    </button>
                    <span className="text-[11px] text-stone-500">AI finds your choices automatically if left empty</span>
                  </div>

                  {showAdvancedOptions && (
                    <div className="p-4 rounded-xl skeuo-well space-y-3 animate-fadeIn">
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {options.map((opt, index) => (
                          <div
                            key={index}
                            className="p-2.5 rounded-lg skeuo-card space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                              <span>Choice {index + 1}</span>
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
                              placeholder={`Choice ${index + 1}`}
                              className="w-full px-2.5 py-1 text-xs rounded-md skeuo-input text-stone-900"
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
                          <span>Add Another Choice</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest skeuo-btn-primary group cursor-pointer"
                    >
                      <span className="text-[#D4A338]">CONTINUE TO QUICK CHECK</span>
                      <ArrowRight className="w-4 h-4 text-[#D4A338] stroke-[3] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: QUICK CLARIFICATION CHECK */}
              {workspaceStep === 'clarify' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Loading State when AI is preparing questions */}
                  {isGeneratingQuestions ? (
                    <div className="p-8 rounded-xl skeuo-well text-center space-y-4">
                      <Loader2 className="w-8 h-8 text-[#B88E3D] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-serif italic text-base font-bold text-[#2C221E]">
                          Checking your question and choices...
                        </h4>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
                          Finding the key trade-offs for "{prompt.slice(0, 45)}..."
                        </p>
                      </div>
                    </div>
                  ) : clarification ? (
                    <div className="space-y-6">
                      {/* Summary Header */}
                      <div className="p-5 rounded-xl skeuo-well space-y-4">
                        <div className="flex items-center gap-3 border-b border-[#E0D9CC] pb-3">
                          <div className="w-8 h-8 rounded-lg skeuo-btn-primary text-[#D4A338] flex items-center justify-center font-bold shrink-0">
                            <FileCheck2 className="w-4 h-4 text-[#D4A338]" />
                          </div>
                          <div>
                            <h3 className="font-serif italic text-lg text-[#2C221E] font-bold">
                              Summary of Your Choices
                            </h3>
                            <p className="text-xs text-stone-500">
                              Answer the quick questions below to sharpen your results, or skip right away.
                            </p>
                          </div>
                        </div>

                        {/* Options Understood */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-stone-900 uppercase tracking-wider block">
                            Choices Understood ({clarification.optionsUnderstood.length})
                          </span>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {clarification.optionsUnderstood.map((optTitle, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-lg skeuo-card text-xs font-medium text-stone-800 flex items-center justify-between"
                              >
                                <span>
                                  <strong className="text-[#B88E3D]">Choice {i + 1}:</strong> {optTitle}
                                </span>
                                <Check className="w-3.5 h-3.5 text-[#B88E3D]" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Parameters */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="px-2.5 py-1 rounded-md skeuo-badge text-[11px] text-stone-700 font-medium">
                            📁 <strong>Category:</strong> {category}
                          </span>
                          <span className="px-2.5 py-1 rounded-md skeuo-badge text-[11px] text-stone-700 font-medium">
                            ↺ <strong>Undo:</strong> {reversibility}
                          </span>
                          <span className="px-2.5 py-1 rounded-md skeuo-badge text-[11px] text-stone-700 font-medium">
                            ⏱ <strong>Timeframe:</strong> {timeHorizon}
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
                                Quick Helpful Questions ({clarifyingQuestions.length})
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-stone-400">
                              Optional
                            </span>
                          </div>

                          <div className="space-y-4">
                            {clarifyingQuestions.map((q, idx) => {
                              const currentVal = clarifyingAnswers[q.id] || '';
                              const selectedMulti = currentVal ? currentVal.split(', ').filter(Boolean) : [];

                              return (
                                <div
                                  key={q.id || idx}
                                  className="p-4 sm:p-5 rounded-xl skeuo-card space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold skeuo-well text-[#B88E3D]">
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
                                    {/* Type: single_select */}
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
                                              className={`flex items-center justify-between p-3 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                                                isSelected
                                                  ? 'skeuo-btn-primary text-white font-semibold'
                                                  : 'skeuo-btn-secondary text-stone-800'
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
                                              className={`flex items-center justify-between p-3 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                                                isSelected
                                                  ? 'skeuo-btn-primary text-white font-semibold'
                                                  : 'skeuo-btn-secondary text-stone-800'
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
                                              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                isSelected
                                                  ? 'skeuo-btn-primary text-[#D4A338]'
                                                  : 'skeuo-btn-secondary text-stone-800'
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
                                          className="w-full px-3.5 py-2 rounded-lg skeuo-input text-xs font-bold text-stone-900"
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
                                          className="w-full pl-8 pr-3.5 py-2 rounded-lg skeuo-input text-xs font-bold text-stone-900"
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
                                        className="w-full px-3.5 py-2 rounded-lg skeuo-input text-xs font-medium text-stone-900"
                                      />
                                    )}

                                    {/* Custom answer option for single_select */}
                                    {(!q.type || q.type === 'single_select') && (
                                      <div className="pt-1">
                                        <input
                                          type="text"
                                          placeholder="Or enter your own answer..."
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
                                          className="w-full px-3 py-1.5 rounded-lg skeuo-input text-[11px] text-stone-800 placeholder-stone-400"
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
                        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-stone-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn shadow-xs">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-amber-900">Notice</p>
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
                              className="px-4 py-1.5 text-xs font-bold skeuo-btn-primary rounded-lg cursor-pointer"
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Loading State or Submit Button */}
                      {isAnalyzing ? (
                        <div className="p-6 rounded-xl skeuo-well text-center space-y-4">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 text-[#B88E3D] animate-spin" />
                            <span className="font-serif italic text-base font-medium text-[#2C221E]">
                              {loadingSteps[loadingStep] || loadingSteps[0]}
                            </span>
                          </div>

                          <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden max-w-md mx-auto shadow-inner">
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
                            className="w-full sm:w-auto px-4 py-2.5 rounded-lg skeuo-btn-secondary text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
                          >
                            ← Edit Question
                          </button>

                          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={handleConfirmAndRun}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-800 hover:text-[#B88E3D] transition-colors cursor-pointer"
                            >
                              Skip Questions & Analyze
                            </button>

                            <button
                              type="button"
                              onClick={handleConfirmAndRun}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-widest skeuo-btn-primary rounded-xl transition-all group cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-[#D4A338]" />
                              <span className="text-[#D4A338]">GET MY DECISION RESULT</span>
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

          {/* PANEL 3: AI INTELLIGENCE SUITE */}
          <div className="order-3 md:col-span-12 lg:col-span-3 bg-gradient-to-b from-[#FAF7F2] to-[#F4EFE6] p-4 sm:p-5 lg:p-6 space-y-5 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl border-t lg:border-t-0 lg:border-l border-[#E0D9CC] min-w-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CC]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#B88E3D]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2C221E]">
                  Sample Dilemmas
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300/80 font-bold shadow-2xs">
                Click to try
              </span>
            </div>

            {/* Quick Starter Scenarios */}
            <div className="space-y-2.5">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('Should I accept a $1,200/month remote software engineer offer now, or spend 6 months upskilling in AI agents for higher-paying international roles?');
                    setCategory('Career');
                    setReversibility('Somewhat reversible');
                    setTimeHorizon('1 year');
                    setOptions(['Take $1,200/mo Remote Engineer Job', 'Dedicate 6 Months to Intensive Upskilling']);
                    setSelectedPriorities(['Career Growth', 'Money & Income', 'Learning & Skills']);
                  }}
                  className="w-full p-2.5 sm:p-3 rounded-xl skeuo-card text-left transition-all space-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-[#B88E3D]">
                      Job Offer vs. Upskilling
                    </span>
                    <span className="text-[10px] text-[#B88E3D] font-mono font-bold">Career</span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    Immediate income today vs 6 months of skill building for higher future earnings.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrompt('Should I buy a suburban home with a down payment or stay in my rented apartment and invest the savings into stocks?');
                    setCategory('Finance');
                    setReversibility('Difficult to reverse');
                    setTimeHorizon('5+ years');
                    setOptions(['Buy Suburban Home', 'Rent Apartment & Invest Savings']);
                    setSelectedPriorities(['Money & Income', 'Long-term Stability & Peace of Mind', 'Time Flexibility & Freedom']);
                  }}
                  className="w-full p-2.5 sm:p-3 rounded-xl skeuo-card text-left transition-all space-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-[#B88E3D]">
                      Buy Home vs Rent & Invest
                    </span>
                    <span className="text-[10px] text-[#B88E3D] font-mono font-bold">Finance</span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    Home ownership stability vs flexible stock investing.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrompt('Mujhe weekend par doston ke sath out of station jana chahiye ya ghar par reh kar apna project complete karna chahiye?');
                    setCategory('Lifestyle');
                    setReversibility('Easy to reverse');
                    setTimeHorizon('Immediate');
                    setOptions(['Doston ke sath trip par jana', 'Ghar reh kar project khatam karna']);
                    setSelectedPriorities(['Personal Enjoyment & Fun', 'Career Growth', 'Rest, Health & Wellbeing']);
                  }}
                  className="w-full p-2.5 sm:p-3 rounded-xl skeuo-card text-left transition-all space-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-[#B88E3D]">
                      Friends Trip vs Project (Roman Urdu)
                    </span>
                    <span className="text-[10px] text-[#B88E3D] font-mono font-bold">Lifestyle</span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    Social fun with friends vs finishing your work on time.
                  </p>
                </button>
              </div>
            </div>

            {/* What you'll get */}
            <div className="space-y-2.5 pt-2.5 border-t border-[#E0D9CC]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                What Tiebreaker Gives You
              </span>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-2.5 p-2 rounded-lg skeuo-card">
                  <BarChart3 className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">Score Comparison</span>
                    <span className="text-[10px] text-stone-500">Based on what you value most</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg skeuo-card">
                  <Grid2X2 className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">Pros & Cons Analysis</span>
                    <span className="text-[10px] text-stone-500">Clear strengths and weaknesses</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg skeuo-card">
                  <Shield className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">Risk & Safety Plan</span>
                    <span className="text-[10px] text-stone-500">Solutions for what could go wrong</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg skeuo-card">
                  <Brain className="w-4 h-4 text-[#B88E3D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-900 block text-[11px]">Blind Spot Check</span>
                    <span className="text-[10px] text-stone-500">Avoid common mental traps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* LOWER DASHBOARD: LIVE SCORE SIMULATOR + THINKING TRAPS CHECK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: LIVE SCORE SIMULATOR */}
        <div className="lg:col-span-7 skeuo-card p-5 space-y-5 text-stone-900 rounded-2xl">
          <div className="flex items-center justify-between border-b border-[#E0D9CC] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl skeuo-btn-primary text-[#D4A338] flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-[#D4A338]" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-[#2C221E] font-bold">
                  Live Score Simulator
                </h3>
                <p className="text-xs text-stone-500">
                  Move the sliders below to see how changing what you care about changes which choice wins.
                </p>
              </div>
            </div>
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
            const optATitle = options[0]?.trim() || 'Choice 1 (e.g. Big Growth / Big Leap)';
            const optBTitle = options[1]?.trim() || 'Choice 2 (e.g. Safe & Balanced)';

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* OPTION A CARD */}
                  <div
                    className={`p-4 rounded-xl transition-all space-y-2.5 ${
                      isOptALeader
                        ? 'skeuo-card border-[#B88E3D]/60 text-stone-900 bg-[#FAF7F2]'
                        : 'skeuo-card text-stone-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isOptALeader ? 'text-[#B88E3D]' : 'text-stone-500'
                        }`}
                      >
                        {isOptALeader ? '🏆 Current Leader' : 'Choice 1'}
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
                    <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden shadow-inner">
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
                    className={`p-4 rounded-xl transition-all space-y-2.5 ${
                      !isOptALeader
                        ? 'skeuo-card border-[#B88E3D]/60 text-stone-900 bg-[#FAF7F2]'
                        : 'skeuo-card text-stone-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          !isOptALeader ? 'text-[#B88E3D]' : 'text-stone-500'
                        }`}
                      >
                        {!isOptALeader ? '🏆 Current Leader' : 'Choice 2'}
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
                    <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden shadow-inner">
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
                <div className="p-4 rounded-xl skeuo-well space-y-3.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 block">
                    Change What Matters Most to You (% Weight)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Slider 1: Growth */}
                    <div className="space-y-1.5 skeuo-card p-3 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Growth & Learning</span>
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
                    <div className="space-y-1.5 skeuo-card p-3 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Money & Savings</span>
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
                    <div className="space-y-1.5 skeuo-card p-3 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Peace of Mind & Health</span>
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

                    {/* Slider 4: Risk */}
                    <div className="space-y-1.5 skeuo-card p-3 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">Safety & Low Risk</span>
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

        {/* RIGHT COLUMN: BLIND SPOT & THINKING TRAPS CHECK */}
        <div className="lg:col-span-5 skeuo-card p-5 space-y-4 text-stone-900 rounded-2xl">
          <div className="flex items-center justify-between border-b border-[#E0D9CC] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D] block">
                Clear Thinking
              </span>
              <h3 className="font-serif italic text-lg text-[#2C221E] font-bold">
                Thinking Traps Check
              </h3>
            </div>
            {(() => {
              const auditedCount = Object.values(auditedBiases).filter(Boolean).length;
              const pct = Math.round((auditedCount / 4) * 100);
              return (
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-100/90 text-amber-950 rounded-full border border-amber-300/80 shadow-2xs">
                  {pct}% Checked
                </span>
              );
            })()}
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Avoid common mental traps before making your choice. Click to check off each one you have considered.
          </p>

          <div className="space-y-2.5">
            {/* Bias 1: Sunk Cost */}
            <div
              onClick={() =>
                setAuditedBiases({ ...auditedBiases, sunkCost: !auditedBiases.sunkCost })
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                auditedBiases.sunkCost
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-2xs'
                  : 'skeuo-card hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.sunkCost ? 'bg-emerald-600 text-white shadow-2xs' : 'skeuo-well text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>The "Past Cost" Trap</span>
                  {auditedBiases.sunkCost && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Checked
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Am I only sticking with this choice because of time or money I already spent?
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
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-2xs'
                  : 'skeuo-card hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.statusQuo ? 'bg-emerald-600 text-white shadow-2xs' : 'skeuo-well text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>The "Fear of Change" Trap</span>
                  {auditedBiases.statusQuo && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Checked
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Am I staying put just to avoid temporary discomfort or uncertainty?
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
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-2xs'
                  : 'skeuo-card hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.overconfidence ? 'bg-emerald-600 text-white shadow-2xs' : 'skeuo-well text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>The "Too Optimistic" Trap</span>
                  {auditedBiases.overconfidence && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Checked
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Have I added realistic extra time and budget in case things take longer?
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
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-2xs'
                  : 'skeuo-card hover:border-[#B88E3D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.confirmation ? 'bg-emerald-600 text-white shadow-2xs' : 'skeuo-well text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>The "Only Seeing What I Want" Trap</span>
                  {auditedBiases.confirmation && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      Checked
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Have I actively looked for arguments against my favorite option?
                </p>
              </div>
            </div>
          </div>

          {/* LOWER LINKS */}
          <div className="pt-2 border-t border-[#E0D9CC] flex items-center justify-between text-xs">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="inline-flex items-center gap-1 text-stone-800 font-bold hover:text-[#B88E3D] transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>Saved Decisions ({savedDecisions.length})</span>
              </button>
            )}

            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample()}
                className="inline-flex items-center gap-1 text-stone-800 font-bold hover:text-[#B88E3D] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>Examples</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="inline-flex items-center gap-1 text-stone-800 font-bold hover:text-[#B88E3D] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>How It Works</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
