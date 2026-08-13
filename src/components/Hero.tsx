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
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#2A2A2A] bg-[#0A0A0A]">
      {/* Subtle gold background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium uppercase tracking-widest mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          <span>Don’t decide for me. Help me decide better.</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif italic text-4xl sm:text-5xl md:text-6xl tracking-tight font-light text-[#F5F5F0] max-w-4xl mx-auto leading-[1.15]">
          When the choice is difficult, <br />
          <span className="text-[#D4AF37] not-italic font-serif">
            make the decision clearer.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="mt-6 text-base sm:text-lg text-[#A0A0A0] max-w-2xl mx-auto font-normal leading-relaxed">
          The Tiebreaker turns complex decisions into structured insights, trade-offs, and personalized analysis through weighted matrices, risk modeling, and cognitive bias detection.
        </p>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-xs uppercase tracking-widest font-bold text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#e0be48] rounded-sm shadow-lg transition-all group"
          >
            <span>ANALYZE A DECISION</span>
            <ArrowRight className="w-4 h-4 text-[#0A0A0A] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-xs uppercase tracking-widest font-bold text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 rounded-sm transition-all"
          >
            <span>THE METHODOLOGY</span>
          </button>
        </div>

        {/* Core Pillars */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-4 rounded-sm bg-[#111111] border border-[#222222]">
            <Scale className="w-5 h-5 text-[#D4AF37] mb-2" />
            <h3 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">Weighted Matrix</h3>
            <p className="text-xs text-[#A0A0A0] mt-1">Assign customized criteria weights & score options dynamically.</p>
          </div>

          <div className="p-4 rounded-sm bg-[#111111] border border-[#222222]">
            <GitMerge className="w-5 h-5 text-[#D4AF37] mb-2" />
            <h3 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">Trade-off & SWOT</h3>
            <p className="text-xs text-[#A0A0A0] mt-1">Side-by-side comparison across pros, cons, and future scenarios.</p>
          </div>

          <div className="p-4 rounded-sm bg-[#111111] border border-[#222222]">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-2" />
            <h3 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">Risk Analysis</h3>
            <p className="text-xs text-[#A0A0A0] mt-1">Identify probabilities, impacts, and actionable mitigations.</p>
          </div>

          <div className="p-4 rounded-sm bg-[#111111] border border-[#222222]">
            <Compass className="w-5 h-5 text-[#D4AF37] mb-2" />
            <h3 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">Think Deeper</h3>
            <p className="text-xs text-[#A0A0A0] mt-1">Uncover cognitive biases, blindspots, and missing context.</p>
          </div>
        </div>

        {/* Quick Sample Decision Starters */}
        <div className="mt-10 pt-8 border-t border-[#2A2A2A] flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-medium text-[#666666] uppercase tracking-widest mr-2">Try an example decision:</span>
          
          <button
            onClick={() => onSelectSample('sample_1')}
            className="px-3 py-1.5 rounded-sm bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#D4AF37]/40 text-xs text-[#A0A0A0] hover:text-[#D4AF37] transition-all text-left"
          >
            "Startup Offer vs CS Degree"
          </button>

          <button
            onClick={() => onSelectSample('sample_2')}
            className="px-3 py-1.5 rounded-sm bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#D4AF37]/40 text-xs text-[#A0A0A0] hover:text-[#D4AF37] transition-all text-left"
          >
            "Buy Suburban Home vs Rent & Invest"
          </button>

          <button
            onClick={() => onSelectSample()}
            className="px-3 py-1.5 rounded-sm bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#D4AF37]/40 text-xs text-[#D4AF37] hover:text-[#f5f5f0] transition-all font-semibold uppercase tracking-wider"
          >
            Explore All Samples →
          </button>
        </div>
      </div>
    </section>
  );
};
