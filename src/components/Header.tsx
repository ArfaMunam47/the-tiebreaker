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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E5DF]/60 px-3.5 sm:px-6 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left Section: Mobile Toggle + Logo & Workspace Indicator */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                if (onToggleMobileSidebar) {
                  onToggleMobileSidebar();
                } else {
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
              className="p-1.5 text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2] rounded-lg lg:hidden transition-colors shrink-0"
              title="Toggle Menu"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo & Brand Name */}
            <button
              onClick={onNewDecision}
              className="flex items-center gap-2.5 group text-left focus:outline-none shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#18191C] text-[#C59B27] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#C59B27] group-hover:text-white transition-colors">
                <span className="font-serif italic font-bold text-lg leading-none">T</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-base sm:text-lg font-semibold tracking-tight text-[#18191C] group-hover:text-[#C59B27] transition-colors">
                  Tie Breaker
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[#FAF7F2] text-[#B88E3D] border border-[#E8E5DF]/60 rounded">
                  Studio
                </span>
              </div>
            </button>

            {/* Active Workspace Title Indicator if available (Tablet & Desktop) */}
            {currentDecisionTitle && (
              <div className="hidden md:flex items-center gap-2 pl-3.5 ml-1 border-l border-[#E8E5DF]/60 min-w-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
                <span className="text-xs font-serif italic text-[#18191C] font-medium max-w-[180px] lg:max-w-xs truncate">
                  {currentDecisionTitle}
                </span>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Samples (Hidden on mobile) */}
            <button
              onClick={onSelectSample}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#595E68] hover:text-[#18191C] bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF]/70 rounded-lg transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Samples</span>
            </button>

            {/* Methodology (Hidden on mobile) */}
            <button
              onClick={onOpenHowItWorks}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#595E68] hover:text-[#18191C] bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF]/70 rounded-lg transition-all shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#8C909A]" />
              <span>Methodology</span>
            </button>

            {/* Library / History Button */}
            <button
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#595E68] hover:text-[#18191C] bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF]/70 rounded-lg transition-all shadow-xs"
              title="Saved Decision Library"
            >
              <History className="w-3.5 h-3.5 text-[#8C909A]" />
              <span className="hidden sm:inline">Library</span>
              {savedCount > 0 && (
                <span className="bg-[#18191C] text-[#FAF7F2] font-mono font-bold px-1.5 py-0.2 rounded-full text-[10px] min-w-[18px] text-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Backup / Export Import (Desktop) */}
            <div className="hidden lg:flex items-center border-l border-[#E8E5DF]/60 pl-2 ml-0.5 gap-1">
              <button
                onClick={onExport}
                title="Export Decisions JSON"
                className="p-1.5 text-[#8C909A] hover:text-[#18191C] hover:bg-[#FAF7F2] rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onImport}
                title="Import Decisions JSON"
                className="p-1.5 text-[#8C909A] hover:text-[#18191C] hover:bg-[#FAF7F2] rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* New Decision Button */}
            <button
              onClick={onNewDecision}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-[#18191C] hover:bg-[#2A2D34] text-white rounded-lg font-semibold text-xs tracking-wider uppercase transition-all shadow-xs active:scale-[0.99] group"
            >
              <Plus className="w-3.5 h-3.5 text-[#C59B27] group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">New Decision</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu Sheet (if mobileMenuOpen is true and sidebar toggle wasn't supplied) */}
      {mobileMenuOpen && !onToggleMobileSidebar && (
        <div className="lg:hidden fixed inset-x-0 top-[53px] z-20 bg-white/98 backdrop-blur-md border-b border-[#E8E5DF]/80 shadow-xl p-4 animate-fadeIn">
          <div className="space-y-2">
            <button
              onClick={() => {
                onNewDecision();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#18191C] text-white font-semibold text-xs uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C59B27]" />
                New Decision
              </span>
            </button>

            <button
              onClick={() => {
                onOpenHistory();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF]/60 text-xs font-medium text-[#18191C]"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#B88E3D]" />
                Saved Decision Library
              </span>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18191C] text-white">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectSample();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF]/60 text-xs font-medium text-[#18191C]"
            >
              <Sparkles className="w-4 h-4 text-[#B88E3D]" />
              Sample Analyses
            </button>

            <button
              onClick={() => {
                onOpenHowItWorks();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF]/60 text-xs font-medium text-[#18191C]"
            >
              <HelpCircle className="w-4 h-4 text-[#8C909A]" />
              Decision Methodology
            </button>

            <div className="pt-2 flex items-center justify-between border-t border-[#E8E5DF]/60 text-xs text-[#595E68]">
              <button
                onClick={() => {
                  onExport();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E8E5DF]/60 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-[#8C909A]" />
                Export JSON
              </button>

              <button
                onClick={() => {
                  onImport();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E8E5DF]/60 font-medium"
              >
                <Upload className="w-3.5 h-3.5 text-[#8C909A]" />
                Import JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


