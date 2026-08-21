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
  User as UserIcon,
  SlidersHorizontal,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAboutPage: () => void;
  onLogout: () => void;
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
  onOpenProfile,
  onOpenSettings,
  onOpenAboutPage,
  onLogout,
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 editorial-header text-[#141413] px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section: Mobile Menu Toggle + Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (onToggleMobileSidebar) {
                  onToggleMobileSidebar();
                } else {
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
              className="w-10 h-10 flex items-center justify-center text-[#141413] editorial-btn-secondary lg:hidden cursor-pointer shrink-0"
              title="Toggle Navigation"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo & Brand Name */}
            <button
              type="button"
              onClick={onNewDecision}
              className="flex items-center gap-2.5 group text-left focus:outline-none min-w-0 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#141413] text-[#FAF8F5] flex items-center justify-center border border-[#141413] shadow-[2px_2px_0px_#141413] shrink-0 group-hover:bg-[#2A2927] transition-all">
                <span className="font-serif italic font-bold text-lg sm:text-xl leading-none text-[#C49235]">
                  T
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-[#141413] group-hover:text-[#C49235] transition-colors truncate">
                  Tiebreaker
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-[#F4EFE6] text-stone-700 border border-[#D5CEBF] shrink-0">
                  Studio
                </span>
              </div>
            </button>

            {/* Active Workspace Title Indicator */}
            {currentDecisionTitle && (
              <div className="hidden md:flex items-center gap-2 pl-3.5 ml-1 border-l border-[#E4DFD5] min-w-0">
                <div className="w-5 h-5 bg-[#F4EFE6] border border-[#D5CEBF] flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-3 h-3 text-[#C49235]" />
                </div>
                <span className="text-xs font-serif italic text-stone-700 font-medium max-w-[200px] lg:max-w-md truncate">
                  {currentDecisionTitle}
                </span>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop Only: What is Tiebreaker? */}
            <button
              type="button"
              onClick={onOpenAboutPage}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-[#141413] editorial-btn-secondary cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C49235]" />
              <span>What is Tiebreaker?</span>
            </button>

            {/* Desktop Only: Samples */}
            <button
              type="button"
              onClick={onSelectSample}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141413] editorial-btn-secondary cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C49235]" />
              <span>Examples</span>
            </button>

            {/* Desktop Only: History Library */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="hidden sm:flex relative items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141413] editorial-btn-secondary cursor-pointer"
              title="Saved Decision Library"
            >
              <History className="w-3.5 h-3.5 text-[#C49235]" />
              <span>History</span>
              {savedCount > 0 && (
                <span className="bg-[#141413] text-[#FAF8F5] font-mono font-bold px-1.5 py-0.2 text-[10px] min-w-[18px] text-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* User Account Button with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    setUserDropdownOpen(!userDropdownOpen);
                  } else {
                    onOpenAuth();
                  }
                }}
                className="flex items-center justify-center gap-2 min-h-[38px] px-2.5 sm:px-3 py-1.5 text-xs font-bold editorial-btn-secondary text-[#141413] cursor-pointer"
                title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign In'}
                aria-label="Account Profile"
              >
                <div className="w-6 h-6 sm:w-5 sm:h-5 bg-[#141413] text-[#FAF8F5] flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : currentUser?.name ? (
                    currentUser.name.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-[#C49235]" />
                  )}
                </div>
                <span className="hidden sm:inline max-w-[110px] lg:max-w-[140px] truncate">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'Sign In'}
                </span>
                {currentUser && <ChevronDown className="w-3 h-3 text-stone-500 hidden sm:inline" />}
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && currentUser && (
                <div className="absolute right-0 top-full mt-1.5 w-56 editorial-modal-shell p-2 shadow-lg z-50 animate-fadeIn">
                  <div className="px-2.5 py-2 border-b border-[#E4DFD5] mb-1">
                    <span className="block text-xs font-bold text-[#141413] truncate">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] font-mono text-stone-500 truncate">
                      {currentUser.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] text-left transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#C49235]" />
                    <span>View & Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] text-left transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#C49235]" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenHistory();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-stone-500" />
                      <span>Decisions History</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 font-bold">{savedCount}</span>
                  </button>

                  <div className="border-t border-[#E4DFD5] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Fallback */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-stone-900/60 backdrop-blur-xs flex justify-start animate-fadeIn">
          <div className="w-72 max-w-[80vw] bg-[#FAF8F5] h-full p-4 space-y-4 shadow-xl border-r border-[#141413] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD5]">
                <span className="font-serif italic font-bold text-base text-[#141413]">
                  Tiebreaker Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNewDecision();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#141413] hover:bg-[#F4EFE6] rounded cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C49235]" />
                  <span>New Decision</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] rounded cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#C49235]" />
                    <span>Decision History</span>
                  </span>
                  {savedCount > 0 && (
                    <span className="font-mono text-[10px] font-bold bg-[#141413] text-[#FAF8F5] px-1.5 py-0.2">
                      {savedCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAboutPage();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] rounded cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#C49235]" />
                  <span>What is Tiebreaker?</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSelectSample();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] rounded cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#C49235]" />
                  <span>Browse Examples</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#E4DFD5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3">
                  Account & Settings
                </span>

                {currentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] rounded cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-[#C49235]" />
                      <span>Profile ({currentUser.name})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#141413] hover:bg-[#F4EFE6] rounded cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#C49235]" />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#141413] hover:bg-[#F4EFE6] rounded cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#C49235]" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DFD5] text-[11px] text-stone-500 italic font-serif">
              "Don't decide for me. Help me decide better."
            </div>
          </div>
        </div>
      )}
    </>
  );
};
