import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E8E5DF]/60 bg-[#FAF8F5] py-8 sm:py-10 px-4 md:px-8 text-[#595E68] text-xs mt-12 sm:mt-16 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 max-w-full">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-[#18191C] text-[#C59B27] flex items-center justify-center font-serif text-xs font-bold shadow-xs shrink-0">
              T
            </div>
            <span className="text-base font-serif italic tracking-tight font-semibold text-[#18191C] whitespace-nowrap">
              Tie Breaker
            </span>
          </div>
          <span className="text-[#8C909A] hidden sm:inline">•</span>
          <span className="text-[10px] text-[#8C909A] uppercase tracking-[0.18em] font-medium max-w-full break-words">
            Decision Intelligence Platform
          </span>
        </div>

        <p className="text-[#8C909A] text-center sm:text-right text-[11px] font-sans leading-relaxed max-w-md">
          "Don’t decide for me. Help me decide better." — Analysis powered by Google Gemini.
        </p>
      </div>
    </footer>
  );
};

