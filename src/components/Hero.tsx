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
    <section className="relative overflow-hidden pt-6 pb-8 md:pt-12 md:pb-12 border-b border-[#E8E5DF]/60 bg-[#FAF8F5]">
      {/* Subtle warm ambient radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C59B27]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E5DF]/80 text-[#18191C] text-[11px] font-semibold tracking-wider shadow-xs max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
              <span className="truncate">Don’t decide for me. Help me decide better.</span>
            </div>

            {/* Main Headline with Editorial Serif */}
            <h1 className="font-serif italic text-3xl sm:text-5xl lg:text-5xl xl:text-6xl tracking-tight text-[#18191C] leading-[1.12] font-normal">
              When the choice is difficult, <br className="hidden sm:inline" />
              <span className="not-italic font-serif text-[#18191C] relative inline-block mt-1 sm:mt-0">
                make the decision clearer.
                <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#C59B27]/30 rounded-full"></span>
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-sm sm:text-base md:text-lg text-[#595E68] font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              The Tiebreaker transforms complex dilemmas into structured insights, weighted matrices, risk analysis, and cognitive bias neutralization.
            </p>

            {/* Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onStartAnalysis}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white bg-[#18191C] hover:bg-[#2A2D34] rounded-lg shadow-xs transition-all group cursor-pointer"
              >
                <span>ANALYZE A DECISION</span>
                <ArrowRight className="w-4 h-4 text-[#C59B27] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenHowItWorks}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[#18191C] bg-white border border-[#E8E5DF]/80 hover:bg-[#FAF7F2] rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <span>THE METHODOLOGY</span>
              </button>
            </div>

            {/* Quick Sample Starter Chips */}
            <div className="pt-4 border-t border-[#E8E5DF]/50 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-[11px] font-semibold text-[#8C909A] uppercase tracking-wider w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">
                Example Dilemmas:
              </span>

              <button
                onClick={() => onSelectSample('sample_1')}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF]/70 text-xs font-medium text-[#18191C] transition-all shadow-xs cursor-pointer"
              >
                "Startup Offer vs CS Degree"
              </button>

              <button
                onClick={() => onSelectSample('sample_2')}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF]/70 text-xs font-medium text-[#18191C] transition-all shadow-xs cursor-pointer"
              >
                "Suburban Home vs Rent & Invest"
              </button>

              <button
                onClick={() => onSelectSample()}
                className="px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF]/70 text-xs font-semibold text-[#B88E3D] transition-all cursor-pointer"
              >
                Explore All Samples →
              </button>
            </div>
          </div>

          {/* Right Hero Column: 4 Methodology Pillars Showcase Card */}
          <div className="lg:col-span-5 bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C59B27]/5 rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]/60">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
                Decision Intelligence Framework
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#18191C] border border-[#E8E5DF]">
                Gemini AI Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2]/80 border border-[#E8E5DF]/60 hover:border-[#C59B27]/40 transition-colors">
                <Scale className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Weighted Matrix</h3>
                <p className="text-[11px] text-[#646974] mt-1 leading-snug">Criteria weights & real-time option scoring.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2]/80 border border-[#E8E5DF]/60 hover:border-[#C59B27]/40 transition-colors">
                <GitMerge className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Trade-offs & SWOT</h3>
                <p className="text-[11px] text-[#646974] mt-1 leading-snug">Pros, cons, strengths, and weaknesses.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2]/80 border border-[#E8E5DF]/60 hover:border-[#C59B27]/40 transition-colors">
                <ShieldCheck className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Risk Modeling</h3>
                <p className="text-[11px] text-[#646974] mt-1 leading-snug">Probabilities, impacts, and safeguards.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2]/80 border border-[#E8E5DF]/60 hover:border-[#C59B27]/40 transition-colors">
                <Compass className="w-4 h-4 text-[#B88E3D] mb-1.5" />
                <h3 className="text-xs font-semibold text-[#18191C] uppercase tracking-wider">Think Deeper</h3>
                <p className="text-[11px] text-[#646974] mt-1 leading-snug">Expose cognitive biases and blindspots.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectSample('sample_1')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#18191C] text-white hover:bg-[#2A2D34] transition-colors text-xs font-medium group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C59B27]" />
                  <span>Preview Full Sample Analysis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#C59B27] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


