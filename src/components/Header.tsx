import React from 'react';
import { History, PlusCircle, Sparkles, HelpCircle, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenHowItWorks: () => void;
  onSelectSample: () => void;
  savedCount: number;
  onExport: () => void;
  onImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  onOpenHowItWorks,
  onSelectSample,
  savedCount,
  onExport,
  onImport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#2A2A2A] px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={onNewDecision}
          className="flex items-center gap-3.5 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-4 h-4 bg-[#D4AF37] rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-300"></div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-serif italic text-xl tracking-tight font-light text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors">
                The Tiebreaker
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest font-bold uppercase bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full">
                AI Core
              </span>
            </div>
            <p className="text-[11px] text-[#A0A0A0] hidden sm:block tracking-wide font-sans">
              Decision Intelligence Platform
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-4 text-xs font-medium uppercase tracking-widest text-[#A0A0A0]">
          <button
            onClick={onSelectSample}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A0A0A0] hover:text-[#D4AF37] bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#D4AF37]/40 rounded-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Samples</span>
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A0A0A0] hover:text-[#F5F5F0] bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] rounded-sm transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#666666]" />
            <span>Principles</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 px-3 py-1.5 text-xs text-[#A0A0A0] hover:text-[#D4AF37] bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#D4AF37]/40 rounded-sm transition-all"
            title="View Decision History"
          >
            <History className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden md:inline">History</span>
            {savedCount > 0 && (
              <span className="bg-[#D4AF37] text-[#0A0A0A] font-bold px-1.5 py-0.2 rounded-full text-[10px] min-w-[18px] text-center">
                {savedCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center border-l border-[#2A2A2A] pl-2.5 ml-1 gap-1">
            <button
              onClick={onExport}
              title="Export Decisions JSON"
              className="p-1.5 text-[#666666] hover:text-[#F5F5F0] hover:bg-[#1A1A1A] rounded-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onImport}
              title="Import Decisions JSON"
              className="p-1.5 text-[#666666] hover:text-[#F5F5F0] hover:bg-[#1A1A1A] rounded-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onNewDecision}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-[#e0be48] transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-[#0A0A0A]" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>
    </header>
  );
};
