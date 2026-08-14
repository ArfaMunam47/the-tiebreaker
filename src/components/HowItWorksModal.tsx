import React from 'react';
import { X, Scale, GitMerge, ShieldCheck, Compass, SlidersHorizontal, Check } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  onStart: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-[#E8E5DF] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2C221E] text-[#D4A338] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#D4A338]" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl text-[#2C221E] font-bold">
                The Decision Intelligence Principles
              </h2>
              <p className="text-xs text-stone-500">
                How The Tiebreaker structures complex dilemmas logically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700 leading-relaxed font-sans">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
            <p className="font-serif italic text-base font-bold mb-1 text-[#B88E3D]">
              "Don't decide for me. Help me decide better."
            </p>
            <p className="text-xs text-stone-600">
              The Tiebreaker eliminates cognitive paralysis and emotional bias by breaking dilemmas into 5 structured analysis layers.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88E3D]" /> Options & Priority Extraction
                </h3>
                <p className="text-stone-600 mt-1">
                  AI extracts discrete options and maps core criteria (Career Growth, Financial, Flexibility, Stability).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5 text-[#B88E3D]" /> Pros, Cons & SWOT Grid
                </h3>
                <p className="text-stone-600 mt-1">
                  Evaluates trade-offs with impact weights, and compiles a 2x2 SWOT grid for every alternative.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#B88E3D]" /> Weighted Decision Matrix
                </h3>
                <p className="text-stone-600 mt-1">
                  Calculates mathematical total scores based on criterion weights. Adjusting weight sliders updates scores dynamically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B88E3D]" /> Risk Modeling & Scenarios
                </h3>
                <p className="text-stone-600 mt-1">
                  Assesses probabilities, impacts, and safeguards while projecting short-term and multi-year scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#B88E3D]" /> Cognitive Bias Neutralization
                </h3>
                <p className="text-stone-600 mt-1">
                  Exposes sunk-cost fallacies, status-quo bias, and hidden assumptions for clear, confident choices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#E8E5DF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 text-stone-600 text-xs">
            <Check className="w-4 h-4 text-[#B88E3D]" />
            <span>Ready to analyze your decision?</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="px-6 py-2.5 rounded-lg bg-[#2C221E] hover:bg-[#3D312B] text-white font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer border border-[#2C221E]"
          >
            <span className="text-[#D4A338]">Start Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};

