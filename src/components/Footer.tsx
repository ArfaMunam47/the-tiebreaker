import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E0D9CC] bg-[#FAF7F2] py-6 sm:py-8 px-4 md:px-8 text-stone-600 text-xs mt-6 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 max-w-full">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg skeuo-btn-primary text-[#D4A338] flex items-center justify-center font-serif text-xs font-bold shrink-0">
              T
            </div>
            <span className="text-base font-serif italic tracking-tight font-bold text-[#2C221E] whitespace-nowrap">
              Tie Breaker
            </span>
          </div>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-[10px] text-[#B88E3D] uppercase tracking-[0.18em] font-semibold max-w-full break-words">
            Decision Intelligence Platform
          </span>
        </div>

        <p className="text-stone-500 text-center sm:text-right text-[11px] font-sans leading-relaxed max-w-md">
          "Don’t decide for me. Help me decide better." — Analysis powered by Google Gemini.
        </p>
      </div>
    </footer>
  );
};


