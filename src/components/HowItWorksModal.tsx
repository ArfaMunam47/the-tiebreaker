import React from 'react';
import { X, Scale, GitMerge, ShieldCheck, Compass, SlidersHorizontal, Check } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  onStart: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
              <Scale className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl text-white font-bold">
                The Decision Intelligence Principles
              </h2>
              <p className="text-xs text-slate-400">
                How The Tiebreaker structures complex dilemmas logically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <p className="font-serif italic text-base font-bold mb-1 text-amber-300">
              "Don't decide for me. Help me decide better."
            </p>
            <p className="text-xs text-slate-300">
              The Tiebreaker eliminates cognitive paralysis and emotional bias by breaking dilemmas into 5 structured analysis layers.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Options & Priority Extraction
                </h3>
                <p className="text-slate-300 mt-1">
                  AI extracts discrete options and maps core criteria (Career Growth, Financial, Flexibility, Stability).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5 text-amber-400" /> Pros, Cons & SWOT Grid
                </h3>
                <p className="text-slate-300 mt-1">
                  Evaluates trade-offs with impact weights, and compiles a 2x2 SWOT grid for every alternative.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" /> Weighted Decision Matrix
                </h3>
                <p className="text-slate-300 mt-1">
                  Calculates mathematical total scores based on criterion weights. Adjusting weight sliders updates scores dynamically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Risk Modeling & Scenarios
                </h3>
                <p className="text-slate-300 mt-1">
                  Assesses probabilities, impacts, and safeguards while projecting short-term and multi-year scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" /> Cognitive Bias Neutralization
                </h3>
                <p className="text-slate-300 mt-1">
                  Exposes sunk-cost fallacies, status-quo bias, and hidden assumptions for clear, confident choices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Check className="w-4 h-4 text-amber-400" />
            <span>Ready to analyze your decision?</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer"
          >
            Start Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

