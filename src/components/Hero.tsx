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
    <section className="relative overflow-hidden pt-8 pb-10 md:pt-12 md:pb-12 border-b border-[#E8E5DF] bg-[#FAF8F5] text-stone-900">
      {/* Rich ambient warm radial background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-amber-200/30 via-amber-100/20 to-yellow-100/30 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8E5DF] text-[#B88E3D] text-[11px] font-bold tracking-wider shadow-2xs max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
              <span className="truncate uppercase tracking-widest">Don’t decide for me. Help me decide better.</span>
            </div>

            {/* Main Headline with Editorial Serif */}
            <h1 className="font-serif italic text-3xl sm:text-5xl lg:text-5xl xl:text-6xl tracking-tight text-[#2C221E] leading-[1.12] font-normal">
              When the choice is difficult, <br className="hidden sm:inline" />
              <span className="not-italic font-serif text-[#B88E3D] relative inline-block mt-1 sm:mt-0 font-bold">
                make the decision clearer.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-sm sm:text-base md:text-lg text-stone-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              The Tiebreaker transforms complex dilemmas into structured insights, weighted MCDA matrices, risk safeguards, and cognitive bias neutralization.
            </p>

            {/* Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={onStartAnalysis}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white bg-[#2C221E] hover:bg-[#3D312B] rounded-xl shadow-md transition-all active:scale-[0.98] group cursor-pointer border border-[#2C221E]"
              >
                <span className="text-[#D4A338]">ANALYZE A DECISION</span>
                <ArrowRight className="w-4 h-4 text-[#D4A338] stroke-[3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenHowItWorks}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-stone-800 bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <span>THE METHODOLOGY</span>
              </button>
            </div>

            {/* Quick Sample Starter Chips */}
            <div className="pt-4 border-t border-[#E8E5DF] flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">
                Example Dilemmas:
              </span>

              <button
                onClick={() => onSelectSample('sample_1')}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-medium text-stone-800 hover:text-[#B88E3D] transition-all shadow-2xs cursor-pointer"
              >
                "Startup Offer vs CS Degree"
              </button>

              <button
                onClick={() => onSelectSample('sample_2')}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-medium text-stone-800 hover:text-[#B88E3D] transition-all shadow-2xs cursor-pointer"
              >
                "Suburban Home vs Rent & Invest"
              </button>

              <button
                onClick={() => onSelectSample()}
                className="px-3.5 py-1.5 rounded-full bg-amber-100/80 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 transition-all cursor-pointer"
              >
                Explore All Samples →
              </button>
            </div>
          </div>

          {/* Right Hero Column: 4 Methodology Pillars Showcase Card */}
          <div className="lg:col-span-5 bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
                Decision Intelligence Framework
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Gemini AI Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] transition-colors">
                <Scale className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Weighted Matrix</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">Criteria weights & real-time MCDA scoring.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] transition-colors">
                <GitMerge className="w-4 h-4 text-indigo-600 mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Trade-offs & SWOT</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">Pros, cons, strengths, and weaknesses.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Risk Modeling</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">Probabilities, impacts, and safeguards.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] transition-colors">
                <Compass className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Think Deeper</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">Expose cognitive biases and blindspots.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectSample('sample_1')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF] text-stone-900 transition-colors text-xs font-semibold group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                  <span>Preview Full Sample Analysis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#B88E3D] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


