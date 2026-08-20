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
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
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
  currentUser,
  onOpenAuth,
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
      <header className="sticky top-0 z-30 skeuo-header-deck text-stone-900 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section: Mobile Menu Toggle + Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* Mobile Menu Toggle Button (44px min touch area) */}
            <button
              type="button"
              onClick={() => {
                if (onToggleMobileSidebar) {
                  onToggleMobileSidebar();
                } else {
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
              className="w-10 h-10 flex items-center justify-center text-stone-700 skeuo-btn-secondary rounded-xl lg:hidden cursor-pointer"
              title="Navigation Menu"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo & Brand Name */}
            <button
              type="button"
              onClick={onNewDecision}
              className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none min-w-0 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl skeuo-btn-primary text-[#D4A338] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                <span className="font-serif italic font-extrabold text-lg sm:text-xl leading-none">T</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-serif italic text-base sm:text-xl font-bold tracking-tight text-[#2C221E] group-hover:text-[#B88E3D] transition-colors truncate">
                  Tie Breaker
                </span>
                <span className="hidden xs:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border border-amber-300/80 rounded-md shadow-2xs shrink-0">
                  Studio
                </span>
              </div>
            </button>

            {/* Active Workspace Title Indicator (Tablet & Desktop only) */}
            {currentDecisionTitle && (
              <div className="hidden md:flex items-center gap-2 pl-3.5 ml-1 border-l border-[#DFD8CC] min-w-0">
                <div className="w-5 h-5 rounded-md skeuo-well flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-3 h-3 text-[#B88E3D]" />
                </div>
                <span className="text-xs font-serif italic text-stone-700 font-medium max-w-[180px] lg:max-w-md truncate">
                  {currentDecisionTitle}
                </span>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop Only: Samples */}
            <button
              type="button"
              onClick={onSelectSample}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 skeuo-btn-secondary rounded-xl cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Samples</span>
            </button>

            {/* Desktop Only: Methodology */}
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 skeuo-btn-secondary rounded-xl cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Methodology</span>
            </button>

            {/* Desktop Only: Library */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="hidden sm:flex relative items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 skeuo-btn-secondary rounded-xl cursor-pointer"
              title="Saved Decision Library"
            >
              <History className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Library</span>
              {savedCount > 0 && (
                <span className="skeuo-btn-primary text-[#D4A338] font-mono font-extrabold px-1.5 py-0.2 rounded-full text-[10px] min-w-[18px] text-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Backup / Export Import (Large Desktop) */}
            <div className="hidden xl:flex items-center border-l border-[#DFD8CC] pl-2 ml-0.5 gap-1.5">
              <button
                type="button"
                onClick={onExport}
                title="Export Decisions JSON"
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-950 skeuo-btn-secondary rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onImport}
                title="Import Decisions JSON"
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-950 skeuo-btn-secondary rounded-lg cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Account / Multi-User Switcher (Comfortable >=44px mobile touch target) */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center justify-center gap-2 min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl skeuo-btn-secondary text-stone-800 cursor-pointer"
              title="Account Profile & Switcher"
              aria-label="Account and Profile"
            >
              <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full skeuo-btn-primary text-[#D4A338] flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-[#D4A338]" />}
              </div>
              <span className="hidden sm:inline max-w-[100px] lg:max-w-[130px] truncate">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Sign In'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#B88E3D] hidden md:inline shrink-0" />
            </button>

            {/* Desktop Only: New Decision Primary Action */}
            <button
              type="button"
              onClick={onNewDecision}
              className="hidden sm:flex items-center gap-1.5 px-3.5 sm:px-4 py-2 skeuo-btn-primary rounded-xl font-bold text-xs tracking-wider uppercase group cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4A338] stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
              <span>New Decision</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && !onToggleMobileSidebar && (
        <div className="lg:hidden fixed inset-x-0 top-[55px] z-40 skeuo-modal-shell border-b border-[#DFD8CC] p-4 animate-fadeIn">
          <div className="space-y-2.5 max-w-lg mx-auto">
            {/* Primary Mobile Action: New Decision */}
            <button
              type="button"
              onClick={() => {
                onNewDecision();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl skeuo-btn-primary font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-[#D4A338] stroke-[3]" />
                <span className="text-[#D4A338]">Start New Decision</span>
              </span>
              <span className="text-[10px] text-stone-300 font-mono">Workspace</span>
            </button>

            {/* User Account Profile */}
            <button
              type="button"
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl skeuo-btn-amber text-stone-900 font-bold text-xs cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <UserIcon className="w-4 h-4 text-[#B88E3D]" />
                {currentUser?.name ? `Account: ${currentUser.name}` : 'Sign In / Register'}
              </span>
              <span className="text-[10px] text-[#B88E3D] font-mono font-semibold">Private Library</span>
            </button>

            {/* Decision Library */}
            <button
              type="button"
              onClick={() => {
                onOpenHistory();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-800 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-[#B88E3D]" />
                Saved Decisions
              </span>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold skeuo-btn-primary text-[#D4A338]">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Prebuilt Samples */}
            <button
              type="button"
              onClick={() => {
                onSelectSample();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-800 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                Sample Scenarios
              </span>
              <span className="text-[10px] font-mono text-stone-500">4 pre-built</span>
            </button>

            {/* How It Works */}
            <button
              type="button"
              onClick={() => {
                onOpenHowItWorks();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-3 rounded-xl skeuo-btn-secondary text-xs font-semibold text-stone-800 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <span>How It Works</span>
            </button>

            {/* Export / Import Mobile Controls */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#DFD8CC]">
              <button
                type="button"
                onClick={() => {
                  onExport();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl skeuo-btn-secondary text-[11px] font-semibold text-stone-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onImport();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl skeuo-btn-secondary text-[11px] font-semibold text-stone-700 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Import JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
