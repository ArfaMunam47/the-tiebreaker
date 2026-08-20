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
    <section className="relative overflow-hidden pt-8 pb-10 md:pt-12 md:pb-12 border-b border-[#E0D9CC] bg-[#F7F4EE] text-stone-900">
      {/* Rich ambient warm radial background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-amber-200/30 via-amber-100/20 to-yellow-100/30 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full skeuo-well text-[#B88E3D] text-[11px] font-bold tracking-wider max-w-full">
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
              Tiebreaker helps you compare your choices, weigh what matters most, spot hidden risks, and make your decision with confidence.
            </p>

            {/* Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={onStartAnalysis}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white skeuo-btn-primary rounded-xl transition-all active:scale-[0.98] group cursor-pointer"
              >
                <span className="text-[#D4A338]">START YOUR DECISION</span>
                <ArrowRight className="w-4 h-4 text-[#D4A338] stroke-[3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenHowItWorks}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-stone-800 skeuo-btn rounded-xl transition-all cursor-pointer"
              >
                <span>HOW IT WORKS</span>
              </button>
            </div>

            {/* Quick Sample Starter Chips */}
            <div className="pt-4 border-t border-[#E0D9CC] flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">
                Try an example:
              </span>

              <button
                onClick={() => onSelectSample('sample_1')}
                className="px-3.5 py-1.5 rounded-full skeuo-btn text-xs font-medium text-stone-800 hover:text-[#B88E3D] transition-all cursor-pointer"
              >
                "Startup Job vs College Degree"
              </button>

              <button
                onClick={() => onSelectSample('sample_2')}
                className="px-3.5 py-1.5 rounded-full skeuo-btn text-xs font-medium text-stone-800 hover:text-[#B88E3D] transition-all cursor-pointer"
              >
                "Buy a Home vs Rent & Invest"
              </button>

              <button
                onClick={() => onSelectSample()}
                className="px-3.5 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 transition-all cursor-pointer shadow-2xs"
              >
                See All Examples →
              </button>
            </div>
          </div>

          {/* Right Hero Column: 4 Methodology Pillars Showcase Card */}
          <div className="lg:col-span-5 skeuo-card rounded-2xl p-6 sm:p-7 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CC]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
                How Tiebreaker Helps You
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs">
                Smart AI Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl skeuo-well hover:border-[#B88E3D] transition-colors">
                <Scale className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Score Choices</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">Rate options by what is most important to you.</p>
              </div>

              <div className="p-3.5 rounded-xl skeuo-well hover:border-[#B88E3D] transition-colors">
                <GitMerge className="w-4 h-4 text-indigo-600 mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Pros & Cons</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">See the good, the bad, and key trade-offs.</p>
              </div>

              <div className="p-3.5 rounded-xl skeuo-well hover:border-[#B88E3D] transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Risk Check</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">Find possible problems and solutions in advance.</p>
              </div>

              <div className="p-3.5 rounded-xl skeuo-well hover:border-[#B88E3D] transition-colors">
                <Compass className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Blind Spots</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">Spot thinking traps and see fresh angles.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectSample('sample_1')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl skeuo-btn text-stone-900 transition-colors text-xs font-semibold group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                  <span>See an Example Decision Result</span>
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


