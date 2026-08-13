import React from 'react';
import { X, Scale, GitMerge, ShieldCheck, Compass, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  onStart: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111111] border border-[#222222] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#222222] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-[#1A1A1A] flex items-center justify-center text-[#D4AF37]">
              <Scale className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif italic font-light text-xl text-[#F5F5F0]">
                The Decision Methodology
              </h2>
              <p className="text-xs text-[#A0A0A0]">
                How The Tiebreaker structures complex decisions rationally
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A0A0A0] hover:text-[#F5F5F0] rounded-sm bg-[#1A1A1A] hover:bg-[#222222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#A0A0A0] leading-relaxed font-sans">
          <div className="p-4 rounded-sm bg-[#1A1A1A] border border-[#D4AF37]/30 text-[#D4AF37]">
            <p className="font-serif italic text-sm font-semibold mb-1 text-[#F5F5F0]">
              "Don't decide for me. Help me decide better."
            </p>
            <p className="text-xs text-[#A0A0A0]">
              The Tiebreaker is engineered to eliminate cognitive paralysis and emotional bias by translating your dilemma into 5 systematic analysis layers.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0A0A0A] border border-[#222222]">
              <div className="w-6 h-6 rounded-sm bg-[#1A1A1A] border border-[#222222] text-[#D4AF37] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-[#F5F5F0] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" /> Options & Priority Extraction
                </h3>
                <p className="text-[#A0A0A0] mt-1">
                  AI reads your natural language text, extracts discrete options, and maps your core values (e.g. Career Growth, Financial, Flexibility, Stability).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0A0A0A] border border-[#222222]">
              <div className="w-6 h-6 rounded-sm bg-[#1A1A1A] border border-[#222222] text-[#D4AF37] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-[#F5F5F0] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5 text-[#D4AF37]" /> Pros, Cons & SWOT Matrix
                </h3>
                <p className="text-[#A0A0A0] mt-1">
                  Evaluates advantages and disadvantages with impact ratings, and builds a 2x2 SWOT grid (Strengths, Weaknesses, Opportunities, Threats) for each path.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0A0A0A] border border-[#222222]">
              <div className="w-6 h-6 rounded-sm bg-[#1A1A1A] border border-[#222222] text-[#D4AF37] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-[#F5F5F0] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#D4AF37]" /> Interactive Weighted Decision Matrix
                </h3>
                <p className="text-[#A0A0A0] mt-1">
                  Calculates weighted mathematical scores for every option based on criterion weight percentages. As you move criteria sliders, scores recalculate instantly!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0A0A0A] border border-[#222222]">
              <div className="w-6 h-6 rounded-sm bg-[#1A1A1A] border border-[#222222] text-[#D4AF37] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-[#F5F5F0] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Risk Modeling & Scenarios
                </h3>
                <p className="text-[#A0A0A0] mt-1">
                  Identifies probabilities, potential damage, and concrete mitigations, while mapping 1–6 month and 1–5 year plausible future scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0A0A0A] border border-[#222222]">
              <div className="w-6 h-6 rounded-sm bg-[#1A1A1A] border border-[#222222] text-[#D4AF37] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <div>
                <h3 className="font-bold text-[#F5F5F0] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#D4AF37]" /> Think Deeper & Bias Neutralization
                </h3>
                <p className="text-[#A0A0A0] mt-1">
                  Exposes status-quo bias, sunk-cost fallacy, and hidden assumptions so you can make your final choice with total clarity and zero regret.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#222222] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2 text-[#A0A0A0] text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Ready to make your decision clearer?</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="px-6 py-2.5 rounded-sm bg-[#D4AF37] hover:bg-[#e0be48] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider shadow-md transition-all"
          >
            Start Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
