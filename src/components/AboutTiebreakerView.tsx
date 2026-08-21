import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Shield,
  Layers,
  Compass,
  FileQuestion,
  Lightbulb,
  X,
} from 'lucide-react';

interface AboutTiebreakerViewProps {
  onStartDecision: () => void;
  onSelectSample: () => void;
  onClose?: () => void;
  onBack?: () => void;
}

export const AboutTiebreakerView: React.FC<AboutTiebreakerViewProps> = ({
  onStartDecision,
  onSelectSample,
  onClose,
  onBack,
}) => {
  const problemExamples = [
    'Which job or career offer should I accept?',
    'Should I buy this major item now or save the money?',
    'Should I move to a new city or stay where I am?',
    'Which project or business idea should I focus on first?',
    'Should I take on this new opportunity or protect my current schedule?',
    'Which option makes the most sense for my long-term goals?',
  ];

  const steps = [
    {
      num: '01',
      title: "Tell us what you're deciding",
      desc: 'Describe the dilemma you are facing in your own words, and list the 2 or more options you are considering.',
      icon: FileQuestion,
    },
    {
      num: '02',
      title: 'Tell us what matters',
      desc: 'Pick the factors that matter specifically for this choice—whether that is income, peace of mind, time freedom, career growth, or relationships.',
      icon: Layers,
    },
    {
      num: '03',
      title: 'Get a clearer perspective',
      desc: 'Tiebreaker analyzes your options against your personal criteria, showing side-by-side trade-offs, pros & cons, risk checks, and a scored recommendation.',
      icon: Compass,
    },
  ];

  const benefits = [
    {
      title: 'Clarity',
      desc: 'Turn a tangled, stressful dilemma into an orderly, structured comparison you can see at a glance.',
      badge: 'Uncluttered',
    },
    {
      title: 'Perspective',
      desc: 'View each option from multiple angles to uncover hidden risks, trade-offs, and assumptions.',
      badge: 'Multi-angle',
    },
    {
      title: 'Personalization',
      desc: 'No one-size-fits-all answers. The evaluation is shaped entirely around what you care about.',
      badge: 'Tailored',
    },
    {
      title: 'Confidence',
      desc: 'Understand the exact reasons and transparent weights behind each score so you can move forward with peace of mind.',
      badge: 'Reasoned',
    },
  ];

  return (
    <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto space-y-8 animate-fadeIn text-stone-900 pb-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E3DCD0] print:hidden">
        <div className="flex items-center gap-3">
          {(onBack || onClose) && (
            <button
              type="button"
              onClick={onBack || onClose}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE0] border border-[#D5CEBF] text-stone-900 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:-translate-x-0.5"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4 text-[#B88E3D] stroke-[2.5]" />
              <span>Back to Home</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg skeuo-btn-primary text-[#D4A338] flex items-center justify-center font-bold text-xs">
              ?
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#B88E3D] font-bold">
              Product Information & Philosophy
            </span>
          </div>
        </div>

        {(onClose || onBack) && (
          <button
            type="button"
            onClick={onClose || onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg skeuo-btn-secondary text-xs font-semibold text-stone-700 hover:text-stone-900 cursor-pointer min-h-[40px]"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* 1. HERO SECTION */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-10 relative overflow-hidden bg-gradient-to-br from-[#FAF7F2] to-[#F4EFE6] border border-[#E0D9CC]">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full skeuo-well text-[11px] font-bold text-[#B88E3D]">
            <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
            <span>What is Tiebreaker?</span>
          </div>

          <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-[#2C221E] font-normal tracking-tight leading-tight">
            Make difficult decisions <span className="not-italic font-serif text-[#B88E3D] font-bold">easier.</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans max-w-2xl">
            Tiebreaker helps you think through difficult choices by comparing your options,
            considering what matters to you, and helping you reach a clearer decision.
          </p>

          <p className="text-xs text-stone-500 italic">
            Tiebreaker is a decision-support tool designed to give you clarity and structure—never to control your life.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartDecision}
              className="flex items-center gap-2 px-6 py-3 rounded-xl skeuo-btn-primary font-bold text-xs uppercase tracking-wider text-[#D4A338] shadow-sm cursor-pointer group"
            >
              <span>Start a Decision</span>
              <ArrowRight className="w-4 h-4 text-[#D4A338] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onSelectSample}
              className="flex items-center gap-2 px-5 py-3 rounded-xl skeuo-btn-secondary font-bold text-xs text-stone-800 hover:text-stone-900 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-[#B88E3D]" />
              <span>Browse Example Dilemmas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE PROBLEM */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
            The Common Struggle
          </span>
          <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
            We all get stuck between choices.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            When options seem equally good or equally risky, our minds jump back and forth. You might wonder:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {problemExamples.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl skeuo-well space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100/90 text-[#B88E3D] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                  {idx + 1}
                </span>
                <p className="text-xs font-semibold text-stone-800 leading-snug">
                  "{item}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. HOW TIEBREAKER WORKS */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
            Simple Process
          </span>
          <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
            How Tiebreaker Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            A simple three-step journey to move from uncertainty to clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 rounded-xl skeuo-well space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold text-[#B88E3D] px-2.5 py-1 rounded bg-amber-100 border border-amber-300">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-stone-500" />
                  </div>
                  <h3 className="font-serif italic text-base font-bold text-[#2C221E]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WHAT TIEBREAKER GIVES YOU */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
            Core Benefits
          </span>
          <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C221E]">
            What Tiebreaker Gives You
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b) => (
            <div key={b.title} className="p-4 sm:p-5 rounded-xl skeuo-card space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B88E3D]" />
                  <span>{b.title}</span>
                </h3>
                <span className="text-[10px] font-mono text-stone-500 px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                  {b.badge}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed pl-6">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. WHAT TIEBREAKER DOES NOT DO */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-8 space-y-4 border-2 border-stone-300/80 bg-[#FAF7F2]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg skeuo-btn-secondary text-stone-700 flex items-center justify-center font-bold">
            <Shield className="w-4 h-4 text-[#B88E3D]" />
          </div>
          <div>
            <h2 className="font-serif italic text-xl font-bold text-[#2C221E]">
              What Tiebreaker Does NOT Do
            </h2>
            <p className="text-xs text-stone-500">
              Clear boundaries on our mission and role
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl skeuo-well space-y-2">
          <p className="text-sm font-semibold text-stone-900">
            "Tiebreaker doesn't decide your life for you."
          </p>
          <p className="text-xs text-stone-600 leading-relaxed">
            The final decision is always 100% yours. Tiebreaker does not force choices, make moral judgments,
            or pretend to predict the future with certainty. Instead, it provides structured comparison,
            objective trade-offs, and reasoned perspective so you feel completely prepared to make the call.
          </p>
        </div>
      </div>

      {/* BOTTOM CTA BAR */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#FAF7F2] to-[#F4EFE6]">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif italic text-lg sm:text-xl font-bold text-[#2C221E]">
            Ready to think through your choice?
          </h3>
          <p className="text-xs text-stone-600">
            Start free with no complicated setup. Type your dilemma and see clear results.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartDecision}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl skeuo-btn-primary font-bold text-xs uppercase tracking-widest text-[#D4A338] shadow-md cursor-pointer shrink-0"
        >
          <span>Start My Decision</span>
          <ArrowRight className="w-4 h-4 text-[#D4A338]" />
        </button>
      </div>
    </div>
  );
};
