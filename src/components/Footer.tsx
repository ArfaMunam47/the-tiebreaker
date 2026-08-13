import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-8 px-4 md:px-8 text-[#A0A0A0] text-xs mt-16 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-full border border-[#D4AF37] flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-sm rotate-45"></div>
          </div>
          <span className="text-base font-serif italic tracking-tight font-light text-[#F5F5F0]">
            The Tiebreaker
          </span>
          <span className="text-[#666666]">•</span>
          <span className="text-[10px] text-[#666666] uppercase tracking-[0.2em] font-medium">
            Decision Intelligence Platform
          </span>
        </div>

        <p className="text-[#666666] text-center sm:text-right text-[11px] font-sans">
          "Don’t decide for me. Help me decide better." — AI analysis powered by Google Gemini.
        </p>
      </div>
    </footer>
  );
};
