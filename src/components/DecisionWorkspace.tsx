import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  SlidersHorizontal,
  HelpCircle,
  Clock,
  Layers,
  Wand2,
  AlertCircle,
  FileCheck2,
  Loader2,
  AlertTriangle,
  History,
  X,
  PlusCircle,
  Zap,
  CheckCircle2,
  Edit3,
  Calendar,
  Compass,
  ChevronRight,
} from 'lucide-react';
import {
  DecisionCategory,
  ReversibilityLevel,
  DecisionAnalysis,
  ClarificationState,
  ClarifyingQuestion,
  User,
} from '../types';
import { extractAlternativesFromQuestionClient } from '../utils/optionExtractor';

const formatRelativeTime = (dateStr?: string): string => {
  if (!dateStr) return 'Recently';
  try {
    const time = new Date(dateStr).getTime();
    const now = Date.now();
    const diffHours = (now - time) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return 'Today';
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else if (diffHours < 24 * 7) {
      const days = Math.floor(diffHours / 24);
      return `${days} days ago`;
    }
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

export interface WorkspaceInitialData {
  prompt?: string;
  options?: string[];
  priorities?: string[];
  timeHorizon?: string;
  category?: DecisionCategory;
  reversibility?: ReversibilityLevel;
  startStep?: 'step1' | 'step2' | 'step3' | 'step4' | 'review';
}

interface DecisionWorkspaceProps {
  onRunAnalysis: (
    prompt: string,
    options: string[],
    priorities: string[],
    clarifyingAnswers: Record<string, string>,
    category?: DecisionCategory,
    reversibility?: ReversibilityLevel,
    timeHorizon?: string,
    clarificationState?: ClarificationState,
    isQuickDecision?: boolean
  ) => Promise<void>;
  isAnalyzing: boolean;
  loadingStep: number;
  analysisError?: string | null;
  onClearAnalysisError?: () => void;
  onOpenHowItWorks?: () => void;
  onSelectSample?: (sampleId?: string) => void;
  savedDecisions?: DecisionAnalysis[];
  onSelectDecision?: (decision: DecisionAnalysis) => void;
  onDeleteDecision?: (id: string) => Promise<void>;
  onOpenHistory?: () => void;
  currentUser?: User | null;
  initialData?: WorkspaceInitialData | null;
}

export type StepType = 'step1_question' | 'step2_factors' | 'step3_timing' | 'step4_options' | 'review';

const STANDARD_FACTORS = [
  'Money & Cost',
  'Time & Freedom',
  'Happiness & Fun',
  'Career & Growth',
  'Stability & Security',
  'Family & Relationships',
  'Personal Goals',
  'Freedom & Flexibility',
  'Convenience & Simplicity',
  'Health & Wellbeing',
  'Learning & Skills',
  'Low Risk & Safety',
];

const TIMING_OPTIONS = [
  { id: 'Right now', label: 'Right now', desc: 'Need an immediate choice today or right this moment' },
  { id: 'Today', label: 'Today', desc: 'Decision needed within 24 hours' },
  { id: 'This week', label: 'This week', desc: 'Decision needed in the next few days' },
  { id: 'This month', label: 'This month', desc: 'Planning over the next 2 to 4 weeks' },
  { id: 'Long term', label: 'Long term', desc: 'Major horizon (1–5+ years of long-term impact)' },
  { id: "I'm not sure", label: "I'm not sure", desc: 'Flexible timeline / exploring options' },
];

const EXAMPLE_PROMPTS = [
  {
    title: 'Accept Job Offer vs Stay',
    prompt: 'Should I accept a new high-growth job offer or stay at my current stable job?',
    options: ['Accept New Job Offer', 'Stay at Current Job'],
  },
  {
    title: 'MacBook vs Windows Laptop',
    prompt: 'Should I buy a MacBook Pro or a high-end Windows laptop for software development?',
    options: ['Apple MacBook Pro', 'Windows Workstation Laptop'],
  },
  {
    title: 'Rent vs Buy a Home',
    prompt: 'Should I continue renting an apartment or buy a home in my current city this year?',
    options: ['Continue Renting', 'Buy a Home'],
  },
  {
    title: 'React vs Vue.js',
    prompt: 'Should I learn React or Vue for frontend web development in 2026?',
    options: ['Learn React', 'Learn Vue.js'],
  },
];

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = ({
  onRunAnalysis,
  isAnalyzing,
  loadingStep,
  analysisError,
  onClearAnalysisError,
  onOpenHowItWorks,
  onSelectSample,
  savedDecisions = [],
  onSelectDecision,
  onDeleteDecision,
  onOpenHistory,
  currentUser,
  initialData,
}) => {
  // Navigation Step
  const [currentStep, setCurrentStep] = useState<StepType>('step1_question');

  // Decision State
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  // RULE: Nothing is selected automatically for a new user!
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [customPrioritiesList, setCustomPrioritiesList] = useState<string[]>([]);
  const [customPriorityInput, setCustomPriorityInput] = useState('');
  const [showAddCustomPriority, setShowAddCustomPriority] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<string>('This week');
  const [category, setCategory] = useState<DecisionCategory>('General');
  const [reversibility, setReversibility] = useState<ReversibilityLevel>('Somewhat reversible');

  // AI Prompt Enhancement & Suggestion Cache
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<{
    enhancedPrompt: string;
    detectedLanguage?: string;
    suggestedOptions?: string[];
    suggestedFactors?: string[];
  } | null>(null);
  const [enhancedDraft, setEnhancedDraft] = useState('');
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [enhanceInputNotice, setEnhanceInputNotice] = useState<string | null>(null);
  const [suggestedFactorsFromAI, setSuggestedFactorsFromAI] = useState<string[]>([]);
  const enhanceCacheRef = useRef<Map<string, any>>(new Map());

  // Error validation message
  const [stepError, setStepError] = useState<string>('');

  // Handle incoming initialData (e.g. from "Make This More Personal")
  useEffect(() => {
    if (initialData) {
      if (initialData.prompt) setPrompt(initialData.prompt);
      if (initialData.options && initialData.options.length >= 2) setOptions(initialData.options);
      if (initialData.priorities) setSelectedPriorities(initialData.priorities);
      if (initialData.timeHorizon) setTimeHorizon(initialData.timeHorizon);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.reversibility) setReversibility(initialData.reversibility);

      if (initialData.startStep === 'step2') setCurrentStep('step2_factors');
      else if (initialData.startStep === 'step3') setCurrentStep('step3_timing');
      else if (initialData.startStep === 'step4') setCurrentStep('step4_options');
      else if (initialData.startStep === 'review') setCurrentStep('review');
      else setCurrentStep('step1_question');
    }
  }, [initialData]);

  const safeSavedDecisions = Array.isArray(savedDecisions) ? savedDecisions : [];

  const handlePromptChange = (val: string) => {
    setPrompt(val);
    if (stepError) setStepError('');
    if (enhanceInputNotice) setEnhanceInputNotice(null);
  };

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
    if (stepError) setStepError('');
  };

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== priority));
    } else {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };

  const handleAddCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customPriorityInput.trim();
    if (clean && !selectedPriorities.includes(clean)) {
      setCustomPrioritiesList((prev) => [...prev, clean]);
      setSelectedPriorities((prev) => [...prev, clean]);
      setCustomPriorityInput('');
      setShowAddCustomPriority(false);
    }
  };

  const handleResetForm = () => {
    setPrompt('');
    setOptions(['', '']);
    setSelectedPriorities([]);
    setCustomPrioritiesList([]);
    setSuggestedFactorsFromAI([]);
    setTimeHorizon('This week');
    setCategory('General');
    setReversibility('Somewhat reversible');
    setCurrentStep('step1_question');
    setEnhancedResult(null);
    setEnhanceError(null);
    setStepError('');
  };

  // Fast lightweight "Make Question Clearer"
  const handleEnhancePrompt = async () => {
    if (isEnhancing) return;

    const clean = prompt.trim();
    if (!clean) {
      setEnhanceInputNotice('Please write your dilemma or question first so we can make it clearer.');
      setTimeout(() => setEnhanceInputNotice(null), 4000);
      return;
    }

    // Check client cache for instant response
    const cacheKey = clean.toLowerCase();
    if (enhanceCacheRef.current.has(cacheKey)) {
      const cached = enhanceCacheRef.current.get(cacheKey);
      setEnhancedResult(cached);
      setEnhancedDraft(cached.enhancedPrompt);
      if (cached.suggestedFactors) {
        setSuggestedFactorsFromAI(cached.suggestedFactors);
      }
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
          prompt: clean,
          category,
          reversibility,
          timeHorizon,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not enhance question right now. Your original question is completely safe.');
      }

      const data = await response.json();
      if (data.enhancedPrompt) {
        enhanceCacheRef.current.set(cacheKey, data);
        setEnhancedResult(data);
        setEnhancedDraft(data.enhancedPrompt);
        if (data.suggestedFactors && Array.isArray(data.suggestedFactors)) {
          setSuggestedFactorsFromAI(data.suggestedFactors);
        }
      } else {
        throw new Error('No enhanced text returned.');
      }
    } catch (err: any) {
      setEnhanceError(err.message || 'Something went wrong. Your original question is safe.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptEnhancedPrompt = () => {
    if (!enhancedDraft.trim()) return;
    setPrompt(enhancedDraft.trim());

    if (enhancedResult?.suggestedOptions && enhancedResult.suggestedOptions.length >= 2) {
      const areCurrentEmpty = options.every((o) => !o.trim());
      if (areCurrentEmpty) {
        setOptions(enhancedResult.suggestedOptions.slice(0, 4));
      }
    }

    if (enhancedResult?.suggestedFactors && enhancedResult.suggestedFactors.length > 0) {
      setSuggestedFactorsFromAI(enhancedResult.suggestedFactors);
    }

    setEnhancedResult(null);
    setEnhanceError(null);
  };

  const handleDiscardEnhancedPrompt = () => {
    setEnhancedResult(null);
    setEnhanceError(null);
  };

  // Step 1 -> Quick Decision (Fast Path)
  const handleGenerateQuickDecision = async () => {
    if (!prompt.trim()) {
      setStepError('Please enter what you are deciding first.');
      return;
    }
    setStepError('');

    // Extract options if empty
    const cleanOpts = options.map((o) => o.trim()).filter(Boolean);
    const resolvedOpts =
      cleanOpts.length >= 2
        ? cleanOpts
        : extractAlternativesFromQuestionClient(prompt.trim());

    await onRunAnalysis(
      prompt.trim(),
      resolvedOpts,
      selectedPriorities,
      {},
      category,
      reversibility,
      timeHorizon,
      undefined,
      true // isQuickDecision
    );
  };

  // Step 1 -> Step 2
  const handleProceedToStep2 = () => {
    if (!prompt.trim()) {
      setStepError('Please enter what you are deciding before continuing.');
      return;
    }
    setStepError('');
    setCurrentStep('step2_factors');
  };

  // Step 2 -> Step 3
  const handleProceedToStep3 = () => {
    setStepError('');
    setCurrentStep('step3_timing');
  };

  // Step 3 -> Step 4
  const handleProceedToStep4 = () => {
    setStepError('');
    // If options are empty, try auto-filling initial suggestions
    if (options.every((o) => !o.trim())) {
      const extracted = extractAlternativesFromQuestionClient(prompt.trim());
      if (extracted.length >= 2) {
        setOptions(extracted);
      }
    }
    setCurrentStep('step4_options');
  };

  // Step 4 -> Review
  const handleProceedToReview = () => {
    const filledOptions = options.map((o) => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      setStepError('Please provide at least 2 options to compare (e.g. Option A and Option B).');
      return;
    }
    setStepError('');
    setCurrentStep('review');
  };

  // Full Guided Decision Run
  const handleRunFullAnalysis = async () => {
    if (!prompt.trim()) {
      setCurrentStep('step1_question');
      setStepError('Please enter your decision question.');
      return;
    }

    const filledOptions = options.map((o) => o.trim()).filter(Boolean);
    const resolvedOptions =
      filledOptions.length >= 2
        ? filledOptions
        : extractAlternativesFromQuestionClient(prompt.trim());

    await onRunAnalysis(
      prompt.trim(),
      resolvedOptions,
      selectedPriorities,
      {},
      category,
      reversibility,
      timeHorizon,
      undefined,
      false
    );
  };

  const loadingSteps = [
    'Reading your dilemma & personal criteria...',
    'Comparing pros, cons, and scoring each option...',
    'Checking for blind spots and preparing your decision perspective...',
  ];

  // Progress Bar Helper
  const stepNumberMap: Record<StepType, number> = {
    step1_question: 1,
    step2_factors: 2,
    step3_timing: 3,
    step4_options: 4,
    review: 5,
  };
  const currentStepNum = stepNumberMap[currentStep];

  return (
    <div id="workspace" className="w-full space-y-6 sm:space-y-8 max-w-7xl 2xl:max-w-[1560px] mx-auto pb-12">
      {/* 1. TOP WELCOME & DASHBOARD HEADER */}
      <div className="skeuo-card text-stone-900 rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden bg-gradient-to-br from-[#FAF7F2] to-[#F4EFE6] border border-[#E0D9CC] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full skeuo-well text-[11px] font-bold text-[#B88E3D]">
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>
                {currentUser?.name
                  ? `Welcome back, ${currentUser.name.split(' ')[0]}`
                  : 'Welcome to Tiebreaker'}
              </span>
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-[#2C221E] font-bold tracking-tight">
              What's on your <span className="not-italic font-serif text-[#B88E3D]">mind today?</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-stone-600 leading-relaxed font-sans max-w-2xl">
              Create a clear, structured decision in a few simple steps, or get a quick perspective instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-2 px-5 py-3 rounded-xl skeuo-btn-primary font-bold text-xs uppercase tracking-wider text-[#D4A338] cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Start New Decision</span>
            </button>

            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample()}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 hover:text-stone-900 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>Explore Examples</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                <span>How It Works</span>
              </button>
            )}
          </div>
        </div>

        {/* QUICK EXAMPLE PROMPT LAUNCHERS */}
        {currentStep === 'step1_question' && !prompt && (
          <div className="pt-4 border-t border-[#E3DCD0] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#B88E3D]" />
                <span>Popular Dilemmas to Try:</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(ex.prompt);
                    setOptions(ex.options);
                    if (stepError) setStepError('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl skeuo-btn-secondary text-xs text-stone-800 hover:text-stone-950 font-medium cursor-pointer transition-colors"
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. DECISION STUDIO CONTAINER & STEPPER */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-8 lg:p-10 space-y-8 bg-white border border-[#E0D9CC] shadow-sm">
        {/* Step Progress Bar & Indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md skeuo-badge text-[11px] font-bold text-[#B88E3D]">
                Step {currentStepNum} of 5
              </span>
              <span className="font-semibold text-stone-800 hidden sm:inline">
                {currentStep === 'step1_question' && 'What are you deciding?'}
                {currentStep === 'step2_factors' && 'What matters most to you?'}
                {currentStep === 'step3_timing' && 'When does this decision matter?'}
                {currentStep === 'step4_options' && 'What are your options?'}
                {currentStep === 'review' && 'Review Your Decision'}
              </span>
            </div>

            {/* Quick Step Jump Tabs */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500">
              <button
                type="button"
                onClick={() => setCurrentStep('step1_question')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 'step1_question' ? 'skeuo-btn-primary text-[#D4A338] font-bold' : 'hover:text-stone-900'
                }`}
              >
                1. Question
              </button>
              <span className="text-stone-300">›</span>
              <button
                type="button"
                onClick={() => prompt.trim() && setCurrentStep('step2_factors')}
                disabled={!prompt.trim()}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 'step2_factors'
                    ? 'skeuo-btn-primary text-[#D4A338] font-bold'
                    : prompt.trim()
                    ? 'hover:text-stone-900'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                2. Factors
              </button>
              <span className="text-stone-300">›</span>
              <button
                type="button"
                onClick={() => prompt.trim() && setCurrentStep('step3_timing')}
                disabled={!prompt.trim()}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 'step3_timing'
                    ? 'skeuo-btn-primary text-[#D4A338] font-bold'
                    : prompt.trim()
                    ? 'hover:text-stone-900'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                3. Timing
              </button>
              <span className="text-stone-300">›</span>
              <button
                type="button"
                onClick={() => prompt.trim() && setCurrentStep('step4_options')}
                disabled={!prompt.trim()}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 'step4_options'
                    ? 'skeuo-btn-primary text-[#D4A338] font-bold'
                    : prompt.trim()
                    ? 'hover:text-stone-900'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                4. Options
              </button>
              <span className="text-stone-300">›</span>
              <button
                type="button"
                onClick={() => prompt.trim() && setCurrentStep('review')}
                disabled={!prompt.trim()}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 'review'
                    ? 'skeuo-btn-primary text-[#D4A338] font-bold'
                    : prompt.trim()
                    ? 'hover:text-stone-900'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                5. Review
              </button>
            </div>
          </div>

          <div className="w-full bg-[#E5DFC8] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#B88E3D] h-full transition-all duration-300"
              style={{ width: `${(currentStepNum / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Global Step Validation Error */}
        {stepError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300/90 text-xs text-stone-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{stepError}</span>
          </div>
        )}

        {/* Loading Spinner & Active Analysis Display */}
        {isAnalyzing ? (
          <div className="p-8 sm:p-12 rounded-2xl skeuo-well text-center space-y-6">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#B88E3D] animate-spin" />
              <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-[#2C221E]">
                Thinking through your decision...
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-md">
                {loadingSteps[loadingStep] || loadingSteps[0]}
              </p>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden max-w-md mx-auto">
              <div
                className="bg-[#B88E3D] h-full transition-all duration-700"
                style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          /* ACTIVE STEP CONTENT */
          <div>
            {/* ============================================================ */}
            {/* STEP 1: WHAT ARE YOU DECIDING? */}
            {/* ============================================================ */}
            {currentStep === 'step1_question' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
                    Step 1 — What are you deciding?
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    Enter the core question or dilemma you want help with. Be as specific or natural as you like.
                  </p>
                </div>

                {/* Question Input Textarea */}
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      id="decision-question-input"
                      rows={4}
                      value={prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      placeholder='e.g., "Should I accept the new job offer at a startup or stay at my current stable company?"'
                      className="w-full p-4 sm:p-5 rounded-2xl text-sm sm:text-base text-stone-900 placeholder:text-stone-400 bg-[#FAF8F5] border border-[#E0D9CC] focus:outline-none focus:border-[#B88E3D] focus:ring-2 focus:ring-[#B88E3D]/20 transition-all font-sans leading-relaxed resize-y"
                    />
                  </div>

                  {/* Make Question Clearer Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 hover:text-stone-950 transition-all cursor-pointer disabled:opacity-50"
                        title="Refine your question into a clear, structured dilemma"
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B88E3D]" />
                            <span>Making clearer...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5 text-[#B88E3D]" />
                            <span>Make Question Clearer</span>
                          </>
                        )}
                      </button>

                      {enhanceInputNotice && (
                        <span className="text-xs text-amber-800 font-medium animate-fadeIn">
                          {enhanceInputNotice}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-stone-400 font-mono">
                      {prompt.trim().length > 0 ? `${prompt.trim().length} characters` : 'Enter question above'}
                    </span>
                  </div>
                </div>

                {/* Enhanced Prompt Preview Card */}
                {enhancedResult && (
                  <div className="p-5 rounded-2xl skeuo-well border border-[#D4A338]/40 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#B88E3D]">
                        <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                        <span>Refined Question Suggestion</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 font-semibold">
                        Optimized for clarity
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={enhancedDraft}
                      onChange={(e) => setEnhancedDraft(e.target.value)}
                      className="w-full p-3.5 rounded-xl text-sm font-sans text-stone-900 bg-white border border-[#E0D9CC] focus:outline-none focus:border-[#B88E3D]"
                    />

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleDiscardEnhancedPrompt}
                        className="px-3.5 py-1.5 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-700 cursor-pointer"
                      >
                        Keep Original
                      </button>
                      <button
                        type="button"
                        onClick={handleAcceptEnhancedPrompt}
                        className="px-4 py-1.5 rounded-xl skeuo-btn-primary text-xs font-bold text-[#D4A338] cursor-pointer shadow-xs"
                      >
                        Use Refined Question
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Factors Quick Preview Chips (Suggestions only, not pre-selected) */}
                {suggestedFactorsFromAI.length > 0 && (
                  <div className="p-4 rounded-xl skeuo-well space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88E3D]" />
                      <span>Suggested factors for your question (tap to select for Step 2):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedFactorsFromAI.map((fac, idx) => {
                        const isSelected = selectedPriorities.includes(fac);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => togglePriority(fac)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                              isSelected
                                ? 'skeuo-btn-primary text-white font-bold'
                                : 'skeuo-card text-stone-800 hover:border-[#B88E3D]'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {fac}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 1 ACTION BUTTONS (Quick Decision + Continue to Guided Flow) */}
                <div className="pt-6 border-t border-[#E0D9CC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Quick Decision Button */}
                  <button
                    type="button"
                    onClick={handleGenerateQuickDecision}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                    title="Generate a fast perspective without going through every step"
                  >
                    <Zap className="w-4 h-4 fill-stone-950" />
                    <span>Generate Quick Decision</span>
                  </button>

                  {/* Guided Flow Next Step */}
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl skeuo-btn-primary text-[#D4A338] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
                  >
                    <span>Continue to Step 2</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: WHAT MATTERS MOST TO YOU? */}
            {/* ============================================================ */}
            {currentStep === 'step2_factors' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Step Top Back Navigation */}
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE7DB]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step1_question')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer min-h-[40px]"
                    aria-label="Back to Question"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#B88E3D]" />
                    <span>Back to Question (Step 1)</span>
                  </button>
                  <span className="text-[11px] font-mono text-stone-500 font-bold">Step 2 of 5</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
                      Step 2 — What matters most to you?
                    </h2>
                    <span className="text-xs font-mono text-stone-500 font-semibold">
                      {selectedPriorities.length}{' '}
                      {selectedPriorities.length === 1 ? 'factor' : 'factors'} chosen
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    Choose the factors that are most important for this specific decision. Tiebreaker will weight and evaluate your options against what you choose.
                  </p>
                </div>

                {/* Factors Chips Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {STANDARD_FACTORS.map((factor) => {
                      const isSelected = selectedPriorities.includes(factor);
                      return (
                        <button
                          key={factor}
                          type="button"
                          onClick={() => togglePriority(factor)}
                          className={`p-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'skeuo-btn-primary text-white font-bold shadow-sm'
                              : 'skeuo-btn-secondary text-stone-800 hover:border-[#B88E3D]'
                          }`}
                        >
                          <span>{factor}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#D4A338] shrink-0" />}
                        </button>
                      );
                    })}

                    {/* Render Any Custom Added Factors */}
                    {customPrioritiesList.map((custom) => {
                      const isSelected = selectedPriorities.includes(custom);
                      return (
                        <button
                          key={custom}
                          type="button"
                          onClick={() => togglePriority(custom)}
                          className={`p-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'skeuo-btn-primary text-white font-bold shadow-sm'
                              : 'skeuo-btn-secondary text-stone-800 hover:border-[#B88E3D]'
                          }`}
                        >
                          <span>{custom}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#D4A338] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Factor Form */}
                  <div className="pt-2">
                    {showAddCustomPriority ? (
                      <form onSubmit={handleAddCustomPriority} className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={customPriorityInput}
                          onChange={(e) => setCustomPriorityInput(e.target.value)}
                          placeholder="e.g. Work-Life Balance, Brand Prestige..."
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl skeuo-card text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl skeuo-btn-primary text-xs font-bold text-[#D4A338] cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCustomPriority(false)}
                          className="p-2 rounded-xl skeuo-btn-secondary text-xs text-stone-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddCustomPriority(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-700 hover:text-stone-950 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#B88E3D]" />
                        <span>Add custom factor</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* STEP 2 ACTIONS */}
                <div className="pt-6 border-t border-[#E0D9CC] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step1_question')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Question</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToStep3}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl skeuo-btn-primary text-[#D4A338] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-md"
                  >
                    <span>Continue to Step 3</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: WHEN DOES THIS DECISION MATTER? */}
            {/* ============================================================ */}
            {currentStep === 'step3_timing' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Step Top Back Navigation */}
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE7DB]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step2_factors')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer min-h-[40px]"
                    aria-label="Back to Factors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#B88E3D]" />
                    <span>Back to Factors (Step 2)</span>
                  </button>
                  <span className="text-[11px] font-mono text-stone-500 font-bold">Step 3 of 5</span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
                    Step 3 — When does this decision matter?
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    Select the timeline for this decision so Tiebreaker can appropriately weigh short-term trade-offs versus long-term impact.
                  </p>
                </div>

                {/* Timing Options Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {TIMING_OPTIONS.map((t) => {
                    const isSelected = timeHorizon === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTimeHorizon(t.id)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all space-y-1.5 ${
                          isSelected
                            ? 'skeuo-btn-primary text-white font-bold shadow-md border-[#D4A338]'
                            : 'skeuo-card hover:border-[#B88E3D]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${isSelected ? 'text-[#D4A338]' : 'text-stone-900'}`}>
                            {t.label}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D4A338]" />}
                        </div>
                        <p className={`text-xs leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {t.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* STEP 3 ACTIONS */}
                <div className="pt-6 border-t border-[#E0D9CC] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step2_factors')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Factors</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToStep4}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl skeuo-btn-primary text-[#D4A338] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-md"
                  >
                    <span>Continue to Step 4</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 4: WHAT ARE YOUR OPTIONS? */}
            {/* ============================================================ */}
            {currentStep === 'step4_options' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Step Top Back Navigation */}
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE7DB]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step3_timing')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer min-h-[40px]"
                    aria-label="Back to Timing"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#B88E3D]" />
                    <span>Back to Timing (Step 3)</span>
                  </button>
                  <span className="text-[11px] font-mono text-stone-500 font-bold">Step 4 of 5</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
                      Step 4 — What are your options?
                    </h2>
                    <span className="text-xs font-mono text-stone-500 font-semibold">
                      {options.length} options (2 min, 5 max)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    Enter the distinct choices you want to compare against each other.
                  </p>
                </div>

                {/* Option Inputs */}
                <div className="space-y-3 max-w-3xl">
                  {options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg skeuo-badge flex items-center justify-center font-mono font-bold text-xs text-[#B88E3D] shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1} (e.g., ${
                          idx === 0 ? 'Accept the job offer' : idx === 1 ? 'Stay at current company' : 'Start my own business'
                        })`}
                        className="flex-1 p-3.5 rounded-xl text-sm font-sans text-stone-900 bg-[#FAF8F5] border border-[#E0D9CC] focus:outline-none focus:border-[#B88E3D]"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2.5 rounded-xl skeuo-btn-secondary text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 hover:text-stone-950 transition-all cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B88E3D]" />
                      <span>Add Option {String.fromCharCode(65 + options.length)}</span>
                    </button>
                  )}
                </div>

                {/* STEP 4 ACTIONS */}
                <div className="pt-6 border-t border-[#E0D9CC] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step3_timing')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Timing</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToReview}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl skeuo-btn-primary text-[#D4A338] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-md"
                  >
                    <span>Review Decision</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 5: REVIEW & GENERATE DECISION */}
            {/* ============================================================ */}
            {currentStep === 'review' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Step Top Back Navigation */}
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE7DB]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step4_options')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer min-h-[40px]"
                    aria-label="Back to Options"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#B88E3D]" />
                    <span>Back to Options (Step 4)</span>
                  </button>
                  <span className="text-[11px] font-mono text-stone-500 font-bold">Step 5 of 5 (Final)</span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
                    Review Your Decision
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    Here is what Tiebreaker will analyze. You can edit any step before getting your result.
                  </p>
                </div>

                {/* Review Cards Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Question Review Card */}
                  <div className="p-5 rounded-2xl skeuo-card space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3D]">
                        1. What You Are Deciding
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('step1_question')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B88E3D] hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base font-bold text-[#2C221E] leading-relaxed">
                      "{prompt.trim()}"
                    </p>
                  </div>

                  {/* Options Review Card */}
                  <div className="p-5 rounded-2xl skeuo-card space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3D]">
                        2. Options to Compare ({options.filter((o) => o.trim()).length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('step4_options')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B88E3D] hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <ul className="space-y-1.5 text-xs text-stone-800">
                      {options
                        .filter((o) => o.trim())
                        .map((opt, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md skeuo-badge flex items-center justify-center font-mono font-bold text-[10px] text-[#B88E3D]">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-semibold text-stone-900">{opt}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Factors Review Card */}
                  <div className="p-5 rounded-2xl skeuo-card space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3D]">
                        3. What Matters Most ({selectedPriorities.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('step2_factors')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B88E3D] hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    {selectedPriorities.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPriorities.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg skeuo-well text-[11px] font-medium text-stone-800"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 italic">
                        No specific factors chosen — balanced evaluation across standard criteria.
                      </p>
                    )}
                  </div>

                  {/* Timing Review Card */}
                  <div className="p-5 rounded-2xl skeuo-card space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3D]">
                        4. Timeline
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('step3_timing')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B88E3D] hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl skeuo-well text-xs font-bold text-stone-800">
                      <Clock className="w-3.5 h-3.5 text-[#B88E3D]" />
                      <span>{timeHorizon}</span>
                    </div>
                  </div>
                </div>

                {/* Analysis Error Message */}
                {analysisError && !isAnalyzing && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-stone-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{analysisError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunFullAnalysis}
                      className="px-3 py-1 text-xs font-bold skeuo-btn-primary rounded-lg cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* SUBMIT BUTTONS */}
                <div className="pt-6 border-t border-[#E0D9CC] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step4_options')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    ← Edit Options
                  </button>

                  <button
                    type="button"
                    onClick={handleRunFullAnalysis}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 text-xs font-extrabold uppercase tracking-widest skeuo-btn-primary rounded-xl cursor-pointer shadow-lg hover:scale-[1.01] transition-transform"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4A338]" />
                    <span className="text-[#D4A338]">Get My Decision Result</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A338] stroke-[3]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. RECENT DECISIONS (Compact, clean, secondary) */}
      {safeSavedDecisions.length > 0 && (
        <div className="space-y-3 pt-2 max-w-4xl">
          <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#B88E3D]" />
              <h3 className="font-serif italic text-base sm:text-lg font-bold text-[#2C221E]">
                Recent Decisions
              </h3>
            </div>

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-xs font-bold text-[#B88E3D] hover:text-[#9A742E] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-[#EDE7DB] rounded-xl bg-white border border-[#E0D9CC] overflow-hidden shadow-2xs">
            {safeSavedDecisions.slice(0, 4).map((dec) => {
              const timeAgo = formatRelativeTime(dec.updatedAt || dec.createdAt);
              return (
                <div
                  key={dec.id}
                  onClick={() => onSelectDecision && onSelectDecision(dec)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-serif italic text-sm sm:text-base font-bold text-[#2C221E] group-hover:text-[#B88E3D] transition-colors truncate">
                      {dec.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 font-sans">
                      <span className="font-medium text-stone-600">{timeAgo}</span>
                      {dec.category && (
                        <>
                          <span>•</span>
                          <span>{dec.category}</span>
                        </>
                      )}
                      {dec.options && (
                        <>
                          <span>•</span>
                          <span>{dec.options.length} options</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[#B88E3D] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                      View
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#B88E3D] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>

          {onOpenHistory && safeSavedDecisions.length > 4 && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline cursor-pointer"
              >
                + {safeSavedDecisions.length - 4} more decisions in History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
