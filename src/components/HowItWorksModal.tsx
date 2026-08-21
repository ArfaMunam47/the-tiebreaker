import React from 'react';
import { X, ArrowLeft, Scale, GitMerge, ShieldCheck, Compass, SlidersHorizontal, Check } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  onStart: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="skeuo-modal-shell max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-stone-900">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E0D9CC] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 bg-[#F4EFE6] hover:bg-[#EBE4D8] border border-[#D5CEBF] rounded-lg cursor-pointer transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Back</span>
            </button>

            <div className="w-9 h-9 rounded-xl skeuo-btn-primary text-[#D4A338] flex items-center justify-center hidden xs:flex">
              <Scale className="w-4 h-4 text-[#D4A338]" />
            </div>
            <div>
              <h2 className="font-serif italic text-lg sm:text-xl text-[#2C221E] font-bold">
                How Tiebreaker Works
              </h2>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                A simple 5-step process to help you choose with confidence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700 leading-relaxed font-sans">
          <div className="p-4 rounded-xl skeuo-well">
            <p className="font-serif italic text-base font-bold mb-1 text-[#B88E3D]">
              "Don't decide for me. Help me decide better."
            </p>
            <p className="text-xs text-stone-600">
              Tiebreaker takes away the stress and confusion by breaking your decision down into 5 easy steps.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-4 rounded-xl skeuo-well">
              <div className="w-6 h-6 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-2xs">
                1
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88E3D]" /> Find Your Choices & Priorities
                </h3>
                <p className="text-stone-600 mt-1">
                  We figure out your exact options and what you care about most (like happiness, income, or flexibility).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl skeuo-well">
              <div className="w-6 h-6 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-2xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5 text-[#B88E3D]" /> Compare Pros, Cons & Trade-offs
                </h3>
                <p className="text-stone-600 mt-1">
                  See the good and bad of each choice clearly so you know exactly what you are trading off.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl skeuo-well">
              <div className="w-6 h-6 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-2xs">
                3
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#B88E3D]" /> Score Each Option
                </h3>
                <p className="text-stone-600 mt-1">
                  Each choice receives a clear score out of 10 based on how well it fits your personal goals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl skeuo-well">
              <div className="w-6 h-6 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-2xs">
                4
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B88E3D]" /> Check Risks & Plan Ahead
                </h3>
                <p className="text-stone-600 mt-1">
                  Spot possible problems in advance and get practical ways to handle them if they happen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl skeuo-well">
              <div className="w-6 h-6 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-2xs">
                5
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#B88E3D]" /> Avoid Thinking Traps
                </h3>
                <p className="text-stone-600 mt-1">
                  We check for blind spots like sticking with something just because of past time or fear of change.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#E0D9CC] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2 text-stone-600 text-xs">
            <Check className="w-4 h-4 text-[#B88E3D]" />
            <span>Ready to start?</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="px-6 py-2.5 rounded-xl skeuo-btn-primary text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <span className="text-[#D4A338]">Start My Decision</span>
          </button>
        </div>
      </div>
    </div>
  );
};

