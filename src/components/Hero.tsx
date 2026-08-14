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
    <section className="relative overflow-hidden pt-8 pb-10 md:pt-16 md:pb-16 border-b border-[#E8E5DF]/60 bg-[#FAF8F5]">
      {/* Subtle warm ambient radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#C59B27]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E5DF]/70 text-[#18191C] text-[11px] font-semibold tracking-wider mb-5 sm:mb-6 shadow-xs max-w-full">
          <Sparkles className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
          <span className="truncate">Don’t decide for me. Help me decide better.</span>
        </div>

        {/* Main Headline with Editorial Serif */}
        <h1 className="font-serif italic text-3xl sm:text-5xl md:text-6xl tracking-tight text-[#18191C] max-w-4xl mx-auto leading-[1.15] font-normal">
          When the choice is difficult, <br className="hidden sm:inline" />
          <span className="not-italic font-serif text-[#18191C] relative inline-block mt-1 sm:mt-0">
            make the decision clearer.
            <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-[#C59B27]/30 rounded-full"></span>
          </span>
        </h1>

        {/* Supporting text */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-[#595E68] max-w-2xl mx-auto font-normal leading-relaxed">
          The Tiebreaker transforms complex dilemmas into structured insights, weighted matrices, risk analysis, and cognitive bias neutralization.
        </p>

        {/* Primary CTAs */}
        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white bg-[#18191C] hover:bg-[#2A2D34] rounded-lg shadow-xs transition-all group"
          >
            <span>ANALYZE A DECISION</span>
            <ArrowRight className="w-4 h-4 text-[#C59B27] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[#18191C] bg-white border border-[#E8E5DF]/80 hover:bg-[#FAF7F2] rounded-lg transition-all shadow-xs"
          >
            <span>THE METHODOLOGY</span>
          </button>
        </div>

        {/* 4 Core Pillars */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-white border border-[#E8E5DF]/60 shadow-xs hover:border-[#C59B27]/40 transition-colors">
            <Scale className="w-4 h-4 text-[#B88E3D] mb-2" />
            <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Weighted Matrix</h3>
            <p className="text-[11px] text-[#646974] mt-1 leading-snug">Assign criteria weights & score options in real-time.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E5DF]/60 shadow-xs hover:border-[#C59B27]/40 transition-colors">
            <GitMerge className="w-4 h-4 text-[#B88E3D] mb-2" />
            <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Trade-offs & SWOT</h3>
            <p className="text-[11px] text-[#646974] mt-1 leading-snug">Side-by-side pros, cons, strengths, and weaknesses.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E5DF]/60 shadow-xs hover:border-[#C59B27]/40 transition-colors">
            <ShieldCheck className="w-4 h-4 text-[#B88E3D] mb-2" />
            <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Risk Modeling</h3>
            <p className="text-[11px] text-[#646974] mt-1 leading-snug">Identify probabilities, impacts, and actionable safeguards.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E5DF]/60 shadow-xs hover:border-[#C59B27]/40 transition-colors">
            <Compass className="w-4 h-4 text-[#B88E3D] mb-2" />
            <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Think Deeper</h3>
            <p className="text-[11px] text-[#646974] mt-1 leading-snug">Expose cognitive biases, assumptions, and blindspots.</p>
          </div>
        </div>

        {/* Quick Sample Starter Chips */}
        <div className="mt-8 pt-6 border-t border-[#E8E5DF]/50 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-semibold text-[#8C909A] uppercase tracking-wider w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">
            Example Dilemmas:
          </span>
          
          <button
            onClick={() => onSelectSample('sample_1')}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF]/70 text-xs font-medium text-[#18191C] transition-all shadow-xs"
          >
            "Startup Offer vs CS Degree"
          </button>

          <button
            onClick={() => onSelectSample('sample_2')}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF]/70 text-xs font-medium text-[#18191C] transition-all shadow-xs"
          >
            "Suburban Home vs Rent & Invest"
          </button>

          <button
            onClick={() => onSelectSample()}
            className="px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF]/70 text-xs font-semibold text-[#B88E3D] transition-all"
          >
            Explore All Samples →
          </button>
        </div>
      </div>
    </section>
  );
};


