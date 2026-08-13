import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, ArrowRight, CheckCircle2, SlidersHorizontal, Loader2 } from 'lucide-react';

interface DecisionWorkspaceProps {
  onRunAnalysis: (
    prompt: string,
    options: string[],
    priorities: string[],
    clarifyingAnswers: Record<string, string>
  ) => Promise<void>;
  isAnalyzing: boolean;
  loadingStep: number; // 0, 1, 2
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

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = ({
  onRunAnalysis,
  isAnalyzing,
  loadingStep,
}) => {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Career Growth',
    'Money & Income',
    'Time Flexibility',
  ]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!prompt.trim()) {
      setErrorMessage('Please describe the decision you are facing.');
      return;
    }

    const filteredOptions = options.map((o) => o.trim()).filter(Boolean);

    await onRunAnalysis(
      prompt.trim(),
      filteredOptions,
      selectedPriorities,
      {}
    );
  };

  const loadingSteps = [
    'Understanding your decision context...',
    'Evaluating trade-offs & option metrics...',
    'Building structured analysis & score matrix...',
  ];

  return (
    <div id="workspace" className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        {/* Form Title */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-[#1A1A1A] flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-serif italic font-light text-[#F5F5F0]">
                Analyze Your Decision
              </h2>
              <p className="text-xs text-[#A0A0A0]">
                Describe your dilemma in plain English. AI will extract options, criteria, and risks.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A1A1A] hover:bg-[#222222] text-xs text-[#A0A0A0] hover:text-[#D4AF37] border border-[#222222] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="uppercase text-[10px] tracking-wider font-bold">{showAdvancedOptions ? 'Simple View' : 'Customize Options'}</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Decision Prompt Text Area */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] mb-2">
              WHAT DECISION ARE YOU FACING? <span className="text-[#D4AF37]">*</span>
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Should I accept this $80k remote job offer from an early-stage startup, stay at my current corporate position, or go back to university full-time?"
              className="w-full px-4 py-3.5 rounded-sm bg-[#0A0A0A] border border-[#222222] text-[#F5F5F0] placeholder:text-[#666666] text-sm focus:outline-none focus:border-[#D4AF37] transition-all resize-y font-sans leading-relaxed"
              disabled={isAnalyzing}
            />
            {errorMessage && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1 font-mono">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>

          {/* Core Priorities Checklist */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] mb-2">
              WHAT MATTERS MOST TO YOU? (SELECT CORE PRIORITIES)
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_PRIORITIES.map((priority) => {
                const isSelected = selectedPriorities.includes(priority);
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => togglePriority(priority)}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50 font-bold'
                        : 'bg-[#0A0A0A] text-[#A0A0A0] border-[#222222] hover:border-[#D4AF37]/30 hover:text-[#F5F5F0]'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>{priority}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Explicit Options Input */}
          {showAdvancedOptions && (
            <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666]">
                  EXPLICIT OPTIONS (OPTIONAL)
                </label>
                <span className="text-[11px] text-[#666666]">
                  Leave blank to let AI auto-detect options from your text.
                </span>
              </div>

              <div className="space-y-2">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#666666] w-5">
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`e.g. ${index === 0 ? 'Accept Startup Offer' : 'Stay in Current Job'}`}
                      className="flex-1 px-3 py-2 text-xs rounded-sm bg-[#111111] border border-[#222222] text-[#F5F5F0] placeholder:text-[#666666] focus:outline-none focus:border-[#D4AF37]"
                      disabled={isAnalyzing}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-[#666666] hover:text-rose-400 transition-colors"
                        disabled={isAnalyzing}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline font-bold tracking-wider uppercase text-[10px] mt-1 transition-colors"
                  disabled={isAnalyzing}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Option</span>
                </button>
              )}
            </div>
          )}

          {/* Loading Progress State */}
          {isAnalyzing ? (
            <div className="p-6 rounded-sm bg-[#0A0A0A] border border-[#D4AF37]/30 text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                <span className="font-serif italic text-lg font-light text-[#D4AF37]">
                  {loadingSteps[loadingStep] || loadingSteps[0]}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D4AF37] h-full transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#A0A0A0] font-mono">
                <span className={loadingStep >= 0 ? 'text-[#D4AF37] font-semibold' : ''}>
                  1. Context
                </span>
                <span className={loadingStep >= 1 ? 'text-[#D4AF37] font-semibold' : ''}>
                  2. Trade-offs
                </span>
                <span className={loadingStep >= 2 ? 'text-[#D4AF37] font-semibold' : ''}>
                  3. Matrix & Risks
                </span>
              </div>
            </div>
          ) : (
            /* Submit Button */
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[#666666] hidden sm:block">
                ⚡ Returns structured options, SWOT, risk mitigation, and interactive weighted matrix.
              </p>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#e0be48] rounded-sm shadow-md transition-all group"
              >
                <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                <span>ANALYZE DECISION</span>
                <ArrowRight className="w-4 h-4 text-[#0A0A0A] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
