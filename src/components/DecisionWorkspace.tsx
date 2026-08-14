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
} from 'lucide-react';
import { DecisionCategory, ReversibilityLevel, TimeHorizon, ClarificationState } from '../types';

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
  { level: 'Easy to reverse', description: 'Can easily return to previous state with low cost (e.g. trial subscription, reversible policy)' },
  { level: 'Somewhat reversible', description: 'Can reverse but requires time, negotiation, or minor cost (e.g. job change, rental)' },
  { level: 'Difficult to reverse', description: 'High cost or effort to undo (e.g. buying a house, major investment, relocation)' },
  { level: 'Nearly irreversible', description: 'Permanent or nearly impossible to reverse (e.g. equity sale, major partnership)' },
];

const TIME_HORIZONS: TimeHorizon[] = ['Immediate', '3 months', '1 year', '3 years', '5+ years'];

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = ({
  onRunAnalysis,
  isAnalyzing,
  loadingStep,
  onOpenTemplates,
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

    // Generate smart clarification understanding locally before full AI run
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
    'Understanding your decision context & clarifying parameters...',
    'Evaluating trade-offs, SWOT grid, and option metrics...',
    'Building weighted score matrix, sensitivity analysis, & risk scenarios...',
  ];

  return (
    <div id="workspace" className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Main Workspace Form Column */}
        <div className="lg:col-span-8 bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs space-y-6">
          {/* Step Indicator Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DF]/60 text-xs font-mono">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  workspaceStep === 'input'
                    ? 'bg-[#18191C] text-[#C59B27]'
                    : 'bg-[#FAF7F2] text-[#8C909A] border border-[#E8E5DF]/60'
                }`}
              >
                1
              </span>
              <span className={`text-[11px] sm:text-xs ${workspaceStep === 'input' ? 'font-bold text-[#18191C]' : 'text-[#8C909A]'}`}>
                1. Decision Inputs
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-2 sm:mx-4 bg-[#E8E5DF]/60" />

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  workspaceStep === 'clarify'
                    ? 'bg-[#18191C] text-[#C59B27]'
                    : 'bg-[#FAF7F2] text-[#8C909A] border border-[#E8E5DF]/60'
                }`}
              >
                2
              </span>
              <span className={`text-[11px] sm:text-xs ${workspaceStep === 'clarify' ? 'font-bold text-[#18191C]' : 'text-[#8C909A]'}`}>
                2. AI Clarification
              </span>
            </div>
          </div>

          {/* STEP 1: INPUT FORM */}
          {workspaceStep === 'input' && (
            <form onSubmit={handleProceedToClarification} className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D] mb-1 block">
                    Decision Intelligence Studio
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif italic text-[#18191C] font-normal">
                    What decision do you want to analyze?
                  </h2>
                  <p className="text-xs text-[#595E68] mt-1">
                    Describe your dilemma in plain language. AI will structure options, trade-offs, and scores.
                  </p>
                </div>

                {onOpenTemplates && (
                  <button
                    type="button"
                    onClick={onOpenTemplates}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4F1EA] text-xs font-semibold text-[#18191C] border border-[#E8E5DF] transition-colors shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#B88E3D]" />
                    <span>Use Decision Template</span>
                  </button>
                )}
              </div>

              {/* Dilemma Prompt */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#18191C]">
                  Describe Your Dilemma <span className="text-[#B88E3D]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Should I accept this $900/month remote junior developer job, or spend 6 months upskilling MERN and AI for higher-paying international opportunities?"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-[#18191C] placeholder:text-[#8C909A] text-sm sm:text-base focus:outline-none focus:bg-white focus:border-[#C59B27] focus:ring-2 focus:ring-[#C59B27]/10 transition-all resize-y leading-relaxed font-sans"
                  disabled={isAnalyzing}
                />
                {errorMessage && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    ⚠️ {errorMessage}
                  </p>
                )}
              </div>

              {/* Core Priorities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#18191C]">
                    Core Priorities & Values
                  </label>
                  <span className="text-[11px] text-[#8C909A]">Select decision evaluation metrics</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DEFAULT_PRIORITIES.map((priority) => {
                    const isSelected = selectedPriorities.includes(priority);
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => togglePriority(priority)}
                        disabled={isAnalyzing}
                        className={`px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-[#18191C] text-white border-[#18191C] font-semibold shadow-xs'
                            : 'bg-white text-[#595E68] border-[#E8E5DF] hover:border-[#C59B27]/50 hover:text-[#18191C]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C59B27]" />}
                        <span>{priority}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explicit Options Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#B88E3D] hover:text-[#18191C] font-semibold transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showAdvancedOptions ? 'Hide Custom Options' : 'Specify Options Explicitly (Optional)'}</span>
                </button>
              </div>

              {showAdvancedOptions && (
                <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#18191C]">Explicit Options</label>
                    <span className="text-[11px] text-[#8C909A]">
                      Leave blank to auto-detect options from text
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {options.map((opt, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-white border border-[#E8E5DF] space-y-1.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#8C909A] font-medium">
                          <span>Option {index + 1}</span>
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="text-[#8C909A] hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
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
                          placeholder={`e.g. ${
                            index === 0 ? 'Accept $900/mo Remote Job' : 'Spend 6 Months Upskilling'
                          }`}
                          className="w-full px-3 py-1.5 text-xs rounded-md bg-[#FAF7F2] border border-[#E8E5DF] text-[#18191C] placeholder:text-[#8C909A] focus:outline-none focus:bg-white focus:border-[#C59B27]"
                          disabled={isAnalyzing}
                        />
                      </div>
                    ))}
                  </div>

                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="inline-flex items-center gap-1.5 text-xs text-[#B88E3D] hover:text-[#18191C] font-semibold tracking-wider uppercase text-[10px] transition-colors cursor-pointer"
                      disabled={isAnalyzing}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Option</span>
                    </button>
                  )}
                </div>
              )}

              {/* Next Step Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-[#8C909A]">
                  ⚡ AI will verify context before running full scoring & risk matrix.
                </p>

                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-[#18191C] hover:bg-[#2A2D34] rounded-lg shadow-xs transition-all group active:scale-[0.99] cursor-pointer"
                >
                  <span>CONTINUE TO AI CLARIFICATION</span>
                  <ArrowRight className="w-4 h-4 text-[#C59B27] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: AI DECISION CLARIFICATION */}
          {workspaceStep === 'clarify' && clarification && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-4">
                <div className="flex items-center gap-3 border-b border-[#E8E5DF] pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18191C] text-[#C59B27] flex items-center justify-center font-bold shrink-0">
                    <FileCheck2 className="w-4 h-4 text-[#C59B27]" />
                  </div>
                  <div>
                    <h3 className="font-serif italic text-lg text-[#18191C] font-semibold">
                      Here's What The AI Understands
                    </h3>
                    <p className="text-xs text-[#595E68]">
                      Confirm or refine parameters before generating full decision intelligence analysis.
                    </p>
                  </div>
                </div>

                {/* Options Understood */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#18191C] uppercase tracking-wider block">
                    Identified Decision Options ({clarification.optionsUnderstood.length})
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {clarification.optionsUnderstood.map((optTitle, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-white border border-[#E8E5DF] text-xs font-medium text-[#18191C] flex items-center justify-between shadow-xs"
                      >
                        <span>
                          <strong className="text-[#B88E3D]">Option {i + 1}:</strong> {optTitle}
                        </span>
                        <Check className="w-3.5 h-3.5 text-[#B88E3D]" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Identified Constraints & Assumptions */}
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-lg bg-white border border-[#E8E5DF] space-y-1.5 text-xs">
                    <span className="font-bold text-[#18191C] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B88E3D]" /> Key Scope & Constraints
                    </span>
                    <ul className="space-y-1 text-[#595E68] list-disc list-inside">
                      <li>Category: {category}</li>
                      <li>Reversibility: {reversibility}</li>
                      <li>Time Horizon: {timeHorizon}</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white border border-[#E8E5DF] space-y-1.5 text-xs">
                    <span className="font-bold text-[#18191C] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#B88E3D]" /> Missing Info & Assumptions
                    </span>
                    <ul className="space-y-1 text-[#595E68] list-disc list-inside">
                      {clarification.missingInfo.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Loading Indicator or Run Buttons */}
              {isAnalyzing ? (
                <div className="p-8 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 text-[#B88E3D] animate-spin" />
                    <span className="font-serif italic text-lg font-normal text-[#18191C]">
                      {loadingSteps[loadingStep] || loadingSteps[0]}
                    </span>
                  </div>

                  <div className="w-full bg-[#E8E5DF] h-1.5 rounded-full overflow-hidden max-w-md mx-auto">
                    <div
                      className="bg-[#18191C] h-full transition-all duration-700 ease-out"
                      style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between max-w-md mx-auto text-[11px] text-[#8C909A] font-mono">
                    <span className={loadingStep >= 0 ? 'text-[#18191C] font-bold' : ''}>
                      1. Context Analysis
                    </span>
                    <span className={loadingStep >= 1 ? 'text-[#18191C] font-bold' : ''}>
                      2. Trade-offs & SWOT
                    </span>
                    <span className={loadingStep >= 2 ? 'text-[#18191C] font-bold' : ''}>
                      3. Weighted Matrix & Risks
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setWorkspaceStep('input')}
                    className="px-4 py-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF] text-xs font-semibold text-[#595E68] hover:text-[#18191C] transition-colors cursor-pointer"
                  >
                    ← Edit Inputs
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndRun}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-[#18191C] hover:bg-[#2A2D34] rounded-lg shadow-xs transition-all group active:scale-[0.99] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#C59B27]" />
                    <span>CONFIRM & GENERATE ANALYSIS</span>
                    <ArrowRight className="w-4 h-4 text-[#C59B27] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar Column: Parameters & Presets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Decision Framing Parameters Card */}
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]/60">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
                Decision Framing Parameters
              </span>
              <SlidersHorizontal className="w-4 h-4 text-[#8C909A]" />
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#18191C]">
                  Domain Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DecisionCategory)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-[#18191C] focus:outline-none focus:border-[#C59B27] cursor-pointer"
                  disabled={isAnalyzing}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reversibility */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#18191C] flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>Reversibility Level</span>
                </label>
                <select
                  value={reversibility}
                  onChange={(e) => setReversibility(e.target.value as ReversibilityLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-[#18191C] focus:outline-none focus:border-[#C59B27] cursor-pointer"
                  disabled={isAnalyzing}
                >
                  {REVERSIBILITY_OPTIONS.map((r) => (
                    <option key={r.level} value={r.level}>
                      {r.level}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#8C909A] leading-tight italic">
                  {REVERSIBILITY_OPTIONS.find((r) => r.level === reversibility)?.description}
                </p>
              </div>

              {/* Time Horizon */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#18191C] flex items-center gap-1">
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
                            ? 'bg-[#18191C] text-white border-[#18191C] font-semibold'
                            : 'bg-[#FAF7F2] text-[#595E68] border-[#E8E5DF] hover:bg-white'
                        }`}
                      >
                        {th}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Start Preset Presets Card */}
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]/60">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
                Quick Dilemma Presets
              </span>
              <Sparkles className="w-4 h-4 text-[#B88E3D]" />
            </div>

            <p className="text-xs text-[#595E68]">
              Load a starter scenario into the workspace:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setPrompt('Should I accept a $900/month remote junior developer offer now, or dedicate 6 months to upskilling in full-stack MERN and AI agents for $3,000+/mo global roles?');
                  setCategory('Career');
                  setReversibility('Somewhat reversible');
                  setTimeHorizon('1 year');
                  setOptions(['Accept $900/mo Remote Developer Job', 'Dedicate 6 Months to Intensive Upskilling']);
                  setSelectedPriorities(['Career Growth', 'Money & Income', 'Learning & Mastery']);
                }}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF]/80 text-left transition-colors space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#18191C] group-hover:text-[#B88E3D]">
                    Job Offer vs. Upskilling
                  </span>
                  <span className="text-[10px] text-[#8C909A] font-mono">Career</span>
                </div>
                <p className="text-[11px] text-[#646974] line-clamp-2">
                  Immediate income vs. 6-month skill growth for 3x higher trajectory.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrompt('Should I buy a 4-bedroom suburban home for $650k with a 20% down payment or stay in my urban apartment rental ($2,800/mo) and invest the $130k down payment into S&P 500 index funds?');
                  setCategory('Finance');
                  setReversibility('Difficult to reverse');
                  setTimeHorizon('5+ years');
                  setOptions(['Buy Suburban Home ($650k)', 'Rent Urban Apartment & Invest Capital']);
                  setSelectedPriorities(['Money & Income', 'Long-term Stability', 'Freedom & Autonomy']);
                }}
                className="w-full p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF]/80 text-left transition-colors space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#18191C] group-hover:text-[#B88E3D]">
                    Suburban Home vs. Rent & Invest
                  </span>
                  <span className="text-[10px] text-[#8C909A] font-mono">Finance</span>
                </div>
                <p className="text-[11px] text-[#646974] line-clamp-2">
                  Property equity stability vs liquid stock market compounding.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

