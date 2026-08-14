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
import { DecisionAnalysis, DecisionCategory, ReversibilityLevel, TimeHorizon, ClarificationState } from '../types';

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

  const handleProceedToClarification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!prompt.trim()) {
      setErrorMessage('Please describe the decision you are facing.');
      return;
    }

    const filteredOpts = options.map((o) => o.trim()).filter(Boolean);
    const optionsUnderstood =
      filteredOpts.length >= 2
        ? filteredOpts
        : ['Option A (Primary alternative)', 'Option B (Status quo / Secondary route)'];

    const generatedClarification: ClarificationState = {
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

    setClarification(generatedClarification);
    setWorkspaceStep('clarify');
  };

  const handleConfirmAndRun = async () => {
    if (!clarification) return;

    const filteredOptions = options.map((o) => o.trim()).filter(Boolean);

    await onRunAnalysis(
      prompt.trim(),
      filteredOptions,
      selectedPriorities,
      {},
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden border border-slate-700/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[90px] rounded-bl-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-amber-500/30 text-[11px] font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Decision Intelligence Studio</span>
              <span className="text-slate-600 font-mono">•</span>
              <span className="text-amber-400 font-mono">Gemini AI Executive Engine</span>
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white font-normal tracking-tight">
              Turn complex dilemmas into <span className="not-italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-bold">clear, confident decisions.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Multi-criteria decision analysis (MCDA), weighted scoring matrices, SWOT trade-offs, risk scenarios, and cognitive bias prevention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-bold text-slate-950 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Pre-Built Samples</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Methodology</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Unified Surface */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 lg:divide-x divide-slate-800 items-stretch">
          
          {/* PANEL 1: DECISION CONFIGURATION (Mobile: full, Tablet: col-span-1, Laptop: col-span-3) */}
          <div className="md:col-span-1 lg:col-span-3 bg-slate-950/60 p-5 space-y-5 border-b md:border-b-0 md:border-r border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                  Configuration
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                Setup
              </span>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Domain Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DecisionCategory)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 cursor-pointer shadow-2xs font-semibold"
                  disabled={isAnalyzing}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reversibility Meter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reversibility Meter</span>
                </label>
                <select
                  value={reversibility}
                  onChange={(e) => setReversibility(e.target.value as ReversibilityLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 cursor-pointer shadow-2xs font-semibold"
                  disabled={isAnalyzing}
                >
                  {REVERSIBILITY_OPTIONS.map((r) => (
                    <option key={r.level} value={r.level} className="bg-slate-900 text-white">
                      {r.level}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 leading-tight italic pt-0.5">
                  {REVERSIBILITY_OPTIONS.find((r) => r.level === reversibility)?.description}
                </p>
              </div>

              {/* Time Horizon Selector */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
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
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-white'
                        }`}
                      >
                        {th}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Evaluation Metrics */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Evaluation Metrics</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
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
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-2xs'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        <span>{priority}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: CENTRAL PRIMARY WORKSPACE (Mobile: full, Tablet: col-span-1, Laptop: col-span-6) */}
          <div className="md:col-span-1 lg:col-span-6 bg-slate-900 p-5 sm:p-6 space-y-5 relative flex flex-col justify-between">
            <div className="space-y-5">
              {/* Step Indicator Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      workspaceStep === 'input'
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    1
                  </span>
                  <span className={`text-xs ${workspaceStep === 'input' ? 'font-bold text-white' : 'text-slate-400'}`}>
                    1. Decision Inputs
                  </span>
                </div>

                <div className="h-0.5 flex-1 mx-4 bg-slate-800" />

                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      workspaceStep === 'clarify'
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    2
                  </span>
                  <span className={`text-xs ${workspaceStep === 'clarify' ? 'font-bold text-white' : 'text-slate-400'}`}>
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
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-0.5 block">
                        Your Dilemma
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif italic text-white font-bold">
                        Describe the decision you are facing
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 border border-amber-500/30 transition-colors cursor-pointer shrink-0"
                      title="Auto-enrich dilemma with trade-offs"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-amber-400" />
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
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-sm sm:text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all resize-y leading-relaxed font-sans"
                      disabled={isAnalyzing}
                    />
                    {errorMessage && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
                        ⚠️ {errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Explicit Options Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{showAdvancedOptions ? 'Hide Custom Options' : 'Specify Options Explicitly (Optional)'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Auto-extracts options if left blank</span>
                  </div>

                  {showAdvancedOptions && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {options.map((opt, index) => (
                          <div
                            key={index}
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                              <span>Option {index + 1}</span>
                              {options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
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
                              className="w-full px-2.5 py-1 text-xs rounded-md bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                              disabled={isAnalyzing}
                            />
                          </div>
                        ))}
                      </div>

                      {options.length < 5 && (
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
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
                      className="w-full flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all group active:scale-[0.99] cursor-pointer"
                    >
                      <span>CONTINUE TO AI CLARIFICATION</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: AI DECISION CLARIFICATION */}
              {workspaceStep === 'clarify' && clarification && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                        <FileCheck2 className="w-4 h-4 text-slate-950" />
                      </div>
                      <div>
                        <h3 className="font-serif italic text-lg text-white font-bold">
                          AI Parameters Verified
                        </h3>
                        <p className="text-xs text-slate-400">
                          Confirm or refine parameters before generating full decision intelligence analysis.
                        </p>
                      </div>
                    </div>

                    {/* Options Understood */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Identified Options ({clarification.optionsUnderstood.length})
                      </span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {clarification.optionsUnderstood.map((optTitle, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-medium text-slate-200 flex items-center justify-between shadow-2xs"
                          >
                            <span>
                              <strong className="text-amber-400">Option {i + 1}:</strong> {optTitle}
                            </span>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Constraints & Missing Info */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> Key Scope
                        </span>
                        <ul className="space-y-0.5 text-slate-300 text-[11px]">
                          <li>• Category: {category}</li>
                          <li>• Reversibility: {reversibility}</li>
                          <li>• Horizon: {timeHorizon}</li>
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                        <span className="font-bold text-white flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Assumptions
                        </span>
                        <ul className="space-y-0.5 text-slate-300 text-[11px]">
                          {clarification.missingInfo.map((m, i) => (
                            <li key={i}>• {m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Loading State or Submit Button */}
                  {isAnalyzing ? (
                    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                        <span className="font-serif italic text-base font-medium text-white">
                          {loadingSteps[loadingStep] || loadingSteps[0]}
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden max-w-md mx-auto">
                        <div
                          className="bg-amber-400 h-full transition-all duration-700 ease-out"
                          style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setWorkspaceStep('input')}
                        className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        ← Edit Inputs
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmAndRun}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all group active:scale-[0.99] cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>GENERATE DECISION INTELLIGENCE</span>
                        <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3] group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PANEL 3: AI INTELLIGENCE SUITE (Mobile: full, Tablet: col-span-2, Laptop: col-span-3) */}
          <div className="md:col-span-2 lg:col-span-3 bg-slate-900/90 p-5 space-y-5 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl border-t md:border-t-0 md:border-l border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                  AI Intelligence
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                Preview
              </span>
            </div>

            {/* Quick Starter Scenarios */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
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
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-left transition-all space-y-1 cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      Job Offer vs. Upskilling
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">Career</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
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
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-left transition-all space-y-1 cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      Suburban Home vs Rent & Invest
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">Finance</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    Real estate equity stability vs liquid stock market compounding.
                  </p>
                </button>
              </div>
            </div>

            {/* Generated Outputs Suite */}
            <div className="space-y-2.5 pt-2.5 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Generated Intelligence Outputs
              </span>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 shadow-2xs">
                  <BarChart3 className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-white block text-[11px]">Weighted Score Matrix</span>
                    <span className="text-[10px] text-slate-400">Normalized priority ratings</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 shadow-2xs">
                  <Grid2X2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-white block text-[11px]">2x2 SWOT Trade-Off Grid</span>
                    <span className="text-[10px] text-slate-400">Internal & external analysis</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 shadow-2xs">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-white block text-[11px]">Risk Mitigation Protocol</span>
                    <span className="text-[10px] text-slate-400">Downside pre-mortem safeguards</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 shadow-2xs">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-white block text-[11px]">1–5 Year Future Scenarios</span>
                    <span className="text-[10px] text-slate-400">Timeline trajectory forecasting</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 shadow-2xs">
                  <Brain className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-white block text-[11px]">Cognitive Bias Filter</span>
                    <span className="text-[10px] text-slate-400">Sunk cost & FOMO audit</span>
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
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-5 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-white font-bold">
                  Interactive Trade-Off Simulator
                </h3>
                <p className="text-xs text-slate-400">
                  Adjust weight priorities in real time to observe live score sensitivity across options.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-amber-400 border border-amber-500/30 rounded-full shrink-0">
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
                        ? 'bg-slate-950 text-white border-amber-500/80 shadow-md'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isOptALeader ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {isOptALeader ? '🏆 Leader Option' : 'Option 1'}
                      </span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          isOptALeader ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      >
                        {scoreA} <span className="text-xs font-normal opacity-70">/ 10</span>
                      </span>
                    </div>
                    <h4 className="font-serif italic text-sm font-bold truncate">
                      {optATitle}
                    </h4>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOptALeader ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${parseFloat(scoreA) * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* OPTION B CARD */}
                  <div
                    className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                      !isOptALeader
                        ? 'bg-slate-950 text-white border-amber-500/80 shadow-md'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          !isOptALeader ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {!isOptALeader ? '🏆 Leader Option' : 'Option 2'}
                      </span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          !isOptALeader ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      >
                        {scoreB} <span className="text-xs font-normal opacity-70">/ 10</span>
                      </span>
                    </div>
                    <h4 className="font-serif italic text-sm font-bold truncate">
                      {optBTitle}
                    </h4>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          !isOptALeader ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${parseFloat(scoreB) * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* PRIORITY SLIDERS WORKBENCH */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Interactive Priority Weight Allocator (%)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Slider 1: Growth */}
                    <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Growth Potential</span>
                        <span className="font-mono font-bold text-amber-400">{simWeights.growth}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.growth}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, growth: parseInt(e.target.value) })
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Slider 2: Financial */}
                    <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Financial Impact</span>
                        <span className="font-mono font-bold text-amber-400">{simWeights.financial}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.financial}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, financial: parseInt(e.target.value) })
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Slider 3: Work-Life Balance */}
                    <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Work-Life & Health</span>
                        <span className="font-mono font-bold text-amber-400">{simWeights.balance}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.balance}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, balance: parseInt(e.target.value) })
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Slider 4: Risk Mitigation */}
                    <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Stability & Risk</span>
                        <span className="font-mono font-bold text-amber-400">{simWeights.risk}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simWeights.risk}
                        onChange={(e) =>
                          setSimWeights({ ...simWeights, risk: parseInt(e.target.value) })
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT COLUMN: COGNITIVE BIAS DIAGNOSTIC ENGINE (5 Cols on LG) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 block">
                Psychological Rigor
              </span>
              <h3 className="font-serif italic text-lg text-white font-bold">
                Cognitive Bias Audit Engine
              </h3>
            </div>
            {(() => {
              const auditedCount = Object.values(auditedBiases).filter(Boolean).length;
              const pct = Math.round((auditedCount / 4) * 100);
              return (
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-950 text-amber-400 rounded-full border border-amber-500/30">
                  {pct}% Audited
                </span>
              );
            })()}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
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
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/60'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.sunkCost ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Sunk Cost Fallacy</span>
                  {auditedBiases.sunkCost && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
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
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/60'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.statusQuo ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Status Quo Bias</span>
                  {auditedBiases.statusQuo && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
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
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/60'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.overconfidence ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Planning Fallacy</span>
                  {auditedBiases.overconfidence && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
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
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/60'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  auditedBiases.confirmation ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Confirmation Bias</span>
                  {auditedBiases.confirmation && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                      Mitigated
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Have I actively searched for disconfirming evidence against my favored option?
                </p>
              </div>
            </div>
          </div>

          {/* LOWER LINKS */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="inline-flex items-center gap-1 text-slate-200 font-bold hover:text-amber-400 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>History ({savedDecisions.length})</span>
              </button>
            )}

            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample()}
                className="inline-flex items-center gap-1 text-slate-200 font-bold hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Samples</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="inline-flex items-center gap-1 text-slate-200 font-bold hover:text-amber-400 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Framework</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

