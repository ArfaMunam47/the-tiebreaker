import React, { useState } from 'react';
import {
  History,
  Plus,
  Sparkles,
  HelpCircle,
  Download,
  Upload,
  Menu,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenHowItWorks: () => void;
  onSelectSample: () => void;
  savedCount: number;
  onExport: () => void;
  onImport: () => void;
  currentDecisionTitle?: string;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  onOpenHowItWorks,
  onSelectSample,
  savedCount,
  onExport,
  onImport,
  currentDecisionTitle,
  onToggleMobileSidebar,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-stone-900 border-b border-[#E8E5DF] px-4 sm:px-6 lg:px-8 py-3 transition-all shadow-xs">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          {/* Left Section: Mobile Toggle + Logo & Workspace Indicator */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                if (onToggleMobileSidebar) {
                  onToggleMobileSidebar();
                } else {
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg lg:hidden transition-colors shrink-0 cursor-pointer"
              title="Toggle Menu"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo & Brand Name */}
            <button
              onClick={onNewDecision}
              className="flex items-center gap-3 group text-left focus:outline-none shrink-0 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#2C221E] text-[#D4A338] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-all">
                <span className="font-serif italic font-extrabold text-xl leading-none">T</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-base sm:text-xl font-bold tracking-tight text-[#2C221E] group-hover:text-[#B88E3D] transition-colors">
                  Tie Breaker
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                  Studio
                </span>
              </div>
            </button>

            {/* Active Workspace Title Indicator if available (Tablet & Desktop) */}
            {currentDecisionTitle && (
              <div className="hidden md:flex items-center gap-2 pl-4 ml-1 border-l border-[#E8E5DF] min-w-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
                <span className="text-xs font-serif italic text-stone-700 font-medium max-w-[200px] lg:max-w-md truncate">
                  {currentDecisionTitle}
                </span>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Samples (Hidden on mobile) */}
            <button
              onClick={onSelectSample}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF] rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Samples</span>
            </button>

            {/* Methodology (Hidden on mobile) */}
            <button
              onClick={onOpenHowItWorks}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF] rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Methodology</span>
            </button>

            {/* Library / History Button */}
            <button
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-[#FAF7F2] hover:bg-[#F4F1EA] border border-[#E8E5DF] rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Saved Decision Library"
            >
              <History className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span className="hidden sm:inline">Library</span>
              {savedCount > 0 && (
                <span className="bg-[#2C221E] text-[#D4A338] font-mono font-extrabold px-1.5 py-0.2 rounded-full text-[10px] min-w-[18px] text-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Backup / Export Import (Desktop) */}
            <div className="hidden lg:flex items-center border-l border-[#E8E5DF] pl-2 ml-0.5 gap-1">
              <button
                onClick={onExport}
                title="Export Decisions JSON"
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onImport}
                title="Import Decisions JSON"
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* New Decision Button */}
            <button
              onClick={onNewDecision}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-[#2C221E] hover:bg-[#3D312B] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs active:scale-[0.98] group cursor-pointer border border-[#2C221E]"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4A338] stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">New Decision</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu Sheet (if mobileMenuOpen is true and sidebar toggle wasn't supplied) */}
      {mobileMenuOpen && !onToggleMobileSidebar && (
        <div className="lg:hidden fixed inset-x-0 top-[53px] z-20 bg-white/98 backdrop-blur-md border-b border-[#E8E5DF] shadow-xl p-4 animate-fadeIn">
          <div className="space-y-2">
            <button
              onClick={() => {
                onNewDecision();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#2C221E] text-white font-bold text-xs uppercase tracking-wider shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4A338] stroke-[3]" />
                New Decision
              </span>
            </button>

            <button
              onClick={() => {
                onOpenHistory();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-semibold text-stone-800 hover:text-stone-900"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#B88E3D]" />
                Saved Decision Library
              </span>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2C221E] text-[#D4A338]">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectSample();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-semibold text-stone-800 hover:text-stone-900"
            >
              <Sparkles className="w-4 h-4 text-[#B88E3D]" />
              Sample Analyses
            </button>

            <button
              onClick={() => {
                onOpenHowItWorks();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs font-semibold text-stone-800 hover:text-stone-900"
            >
              <HelpCircle className="w-4 h-4 text-stone-500" />
              Decision Methodology
            </button>

            <div className="pt-2 flex items-center justify-between border-t border-[#E8E5DF] text-xs text-stone-700">
              <button
                onClick={() => {
                  onExport();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] font-semibold text-stone-800 hover:text-stone-900"
              >
                <Download className="w-3.5 h-3.5 text-[#B88E3D]" />
                Export JSON
              </button>

              <button
                onClick={() => {
                  onImport();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] font-semibold text-stone-800 hover:text-stone-900"
              >
                <Upload className="w-3.5 h-3.5 text-[#B88E3D]" />
                Import JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


