import React from 'react';
import { X, Scale, GitMerge, ShieldCheck, Compass, SlidersHorizontal, Check } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  onStart: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#18191C]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-[#E8E5DF] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18191C] text-[#C59B27] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#C59B27]" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl text-[#18191C] font-semibold">
                The Decision Intelligence Principles
              </h2>
              <p className="text-xs text-[#646974]">
                How The Tiebreaker structures complex dilemmas logically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#646974] hover:text-[#18191C] rounded-md hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#595E68] leading-relaxed font-sans">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
            <p className="font-serif italic text-base font-semibold mb-1 text-[#18191C]">
              "Don't decide for me. Help me decide better."
            </p>
            <p className="text-xs text-[#595E68]">
              The Tiebreaker eliminates cognitive paralysis and emotional bias by breaking dilemmas into 5 structured analysis layers.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-[#18191C] text-[#C59B27] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[#18191C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88E3D]" /> Options & Priority Extraction
                </h3>
                <p className="text-[#595E68] mt-1">
                  AI extracts discrete options and maps core criteria (Career Growth, Financial, Flexibility, Stability).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-[#18191C] text-[#C59B27] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[#18191C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5 text-[#B88E3D]" /> Pros, Cons & SWOT Grid
                </h3>
                <p className="text-[#595E68] mt-1">
                  Evaluates trade-offs with impact weights, and compiles a 2x2 SWOT grid for every alternative.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-[#18191C] text-[#C59B27] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[#18191C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#B88E3D]" /> Weighted Decision Matrix
                </h3>
                <p className="text-[#595E68] mt-1">
                  Calculates mathematical total scores based on criterion weights. Adjusting weight sliders updates scores dynamically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-[#18191C] text-[#C59B27] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-[#18191C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B88E3D]" /> Risk Modeling & Scenarios
                </h3>
                <p className="text-[#595E68] mt-1">
                  Assesses probabilities, impacts, and safeguards while projecting short-term and multi-year scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
              <div className="w-6 h-6 rounded-md bg-[#18191C] text-[#C59B27] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <div>
                <h3 className="font-semibold text-[#18191C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#B88E3D]" /> Cognitive Bias Neutralization
                </h3>
                <p className="text-[#595E68] mt-1">
                  Exposes sunk-cost fallacies, status-quo bias, and hidden assumptions for clear, confident choices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#E8E5DF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 text-[#595E68] text-xs">
            <Check className="w-4 h-4 text-[#B88E3D]" />
            <span>Ready to analyze your decision?</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="px-6 py-2.5 rounded-lg bg-[#18191C] hover:bg-[#2A2D34] text-white font-semibold text-xs uppercase tracking-wider shadow transition-all"
          >
            Start Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

