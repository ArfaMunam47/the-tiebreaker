import React from 'react';
import { ArrowRight, Sparkles, Scale, ShieldCheck, Compass, GitMerge } from 'lucide-react';

interface HeroProps {
  onStartAnalysis: () => void;
  onOpenHowItWorks: () => void;
  onSelectSample: (sampleId?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartAnalysis,
  onOpenHowItWorks,
  onSelectSample,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 md:pt-14 md:pb-14 border-b border-slate-800 bg-[#0B0F17] text-slate-100">
      {/* Rich ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-amber-500/10 via-indigo-500/10 to-amber-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-[11px] font-bold tracking-wider shadow-sm max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate uppercase tracking-widest">Don’t decide for me. Help me decide better.</span>
            </div>

            {/* Main Headline with Editorial Serif */}
            <h1 className="font-serif italic text-3xl sm:text-5xl lg:text-5xl xl:text-6xl tracking-tight text-white leading-[1.12] font-normal">
              When the choice is difficult, <br className="hidden sm:inline" />
              <span className="not-italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 relative inline-block mt-1 sm:mt-0 font-bold">
                make the decision clearer.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              The Tiebreaker transforms complex dilemmas into structured insights, weighted MCDA matrices, risk safeguards, and cognitive bias neutralization.
            </p>

            {/* Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={onStartAnalysis}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 text-xs font-extrabold uppercase tracking-widest text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] group cursor-pointer"
              >
                <span>ANALYZE A DECISION</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenHowItWorks}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>THE METHODOLOGY</span>
              </button>
            </div>

            {/* Quick Sample Starter Chips */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">
                Example Dilemmas:
              </span>

              <button
                onClick={() => onSelectSample('sample_1')}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-amber-300 transition-all shadow-2xs cursor-pointer"
              >
                "Startup Offer vs CS Degree"
              </button>

              <button
                onClick={() => onSelectSample('sample_2')}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-amber-300 transition-all shadow-2xs cursor-pointer"
              >
                "Suburban Home vs Rent & Invest"
              </button>

              <button
                onClick={() => onSelectSample()}
                className="px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-400 transition-all cursor-pointer"
              >
                Explore All Samples →
              </button>
            </div>
          </div>

          {/* Right Hero Column: 4 Methodology Pillars Showcase Card */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-4 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                Decision Intelligence Framework
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Gemini AI Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
                <Scale className="w-4 h-4 text-amber-400 mb-1.5" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Weighted Matrix</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Criteria weights & real-time MCDA scoring.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
                <GitMerge className="w-4 h-4 text-indigo-400 mb-1.5" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trade-offs & SWOT</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Pros, cons, strengths, and weaknesses.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1.5" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Risk Modeling</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Probabilities, impacts, and safeguards.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
                <Compass className="w-4 h-4 text-amber-400 mb-1.5" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Think Deeper</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Expose cognitive biases and blindspots.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectSample('sample_1')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white transition-colors text-xs font-semibold group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Preview Full Sample Analysis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


