import React from 'react';
import {
  Home,
  Plus,
  History,
  User as UserIcon,
  SlidersHorizontal,
  HelpCircle,
  LogOut,
  LogIn,
  X,
  FileText,
  ChevronRight,
  BarChart3,
  GitMerge,
  Table,
  Grid2X2,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';
import { DecisionAnalysis, User } from '../types';

export type TabType =
  | 'overview'
  | 'prosCons'
  | 'compare'
  | 'swot'
  | 'matrix'
  | 'risks'
  | 'future'
  | 'thinkDeeper';

interface SidebarProps {
  currentDecision: DecisionAnalysis | null;
  savedDecisions?: DecisionAnalysis[];
  activeTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
  onSelectDecision?: (decision: DecisionAnalysis) => void;
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenHowItWorks: () => void;
  onOpenAboutPage: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentUser: User | null;
  savedCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDecision,
  savedDecisions = [],
  activeTab = 'overview',
  onSelectTab,
  onSelectDecision,
  onNewDecision,
  onOpenHistory,
  onOpenAboutPage,
  onOpenProfile,
  onOpenSettings,
  onOpenAuth,
  onLogout,
  currentUser,
  savedCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const analysisTabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'prosCons', label: 'Pros & Cons', icon: GitMerge },
    { id: 'compare', label: 'Side-by-Side Compare', icon: Table },
    { id: 'swot', label: 'SWOT Grid', icon: Grid2X2 },
    { id: 'matrix', label: 'Weighted Matrix', icon: SlidersHorizontal },
    { id: 'risks', label: 'Risk & Mitigation', icon: Shield },
    { id: 'future', label: '1–5 Yr Scenarios', icon: Clock },
    { id: 'thinkDeeper', label: 'Think Deeper & AI', icon: Compass },
  ];

  const safeDecisions = Array.isArray(savedDecisions) ? savedDecisions : [];

  const content = (
    <div className="w-full flex flex-col justify-between p-4 sm:p-5 text-sm text-stone-900 select-none space-y-6 rounded-2xl min-w-0">
      {/* TOP SECTION */}
      <div className="space-y-5 min-w-0">
        {/* Brand & Identity */}
        <div className="pb-3.5 border-b border-[#E3DCD0]">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onNewDecision();
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer min-w-0 flex-1"
            >
              <div className="w-8 h-8 rounded-xl skeuo-btn-primary text-[#D4A338] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all font-serif italic font-bold text-lg leading-none">
                T
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif italic font-bold text-base text-[#2C221E] tracking-tight group-hover:text-[#B88E3D] transition-colors truncate">
                    Tiebreaker
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs shrink-0">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium tracking-wide truncate">
                  Clarity & Decision Support
                </p>
              </div>
            </button>

            {/* Mobile close button */}
            {isOpenMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 skeuo-btn-secondary lg:hidden cursor-pointer shrink-0"
                aria-label="Close navigation sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1. MAIN NAVIGATION */}
        <div className="space-y-1.5">
          <span className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 block">
            Main
          </span>

          {/* Home */}
          <button
            type="button"
            onClick={() => {
              onNewDecision();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#B88E3D]" />
            <span>Home</span>
          </button>

          {/* New Decision */}
          <button
            type="button"
            onClick={() => {
              onNewDecision();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full min-h-[38px] flex items-center justify-between px-3 py-2 rounded-xl skeuo-btn-primary font-bold text-xs tracking-wider uppercase group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D4A338] stroke-[3] group-hover:rotate-90 transition-transform" />
              <span className="text-[#D4A338]">New Decision</span>
            </div>
          </button>

          {/* Decision History */}
          <button
            type="button"
            onClick={() => {
              onOpenHistory();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-[#B88E3D]" />
              <span>Decision History</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* ACTIVE DECISION ANALYSIS TABS (When viewing results) */}
        {currentDecision && (
          <div className="space-y-2 pt-2 border-t border-[#E3DCD0] min-w-0">
            <div className="px-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                Active Analysis
              </span>
              <span className="text-[10px] font-mono text-[#B88E3D] font-bold px-2 py-0.5 rounded-md skeuo-well shrink-0">
                {currentDecision.options.length} Options
              </span>
            </div>

            <div className="p-2.5 rounded-xl skeuo-well min-w-0">
              <div className="flex items-center gap-2 text-[#2C221E] text-xs font-serif italic font-bold leading-snug">
                <FileText className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
                <span className="line-clamp-2 break-words" title={currentDecision.title}>
                  {currentDecision.title}
                </span>
              </div>
            </div>

            <nav className="space-y-1 pt-0.5" aria-label="Analysis sections">
              {analysisTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (onSelectTab) onSelectTab(tab.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full min-h-[36px] flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'skeuo-btn-primary font-extrabold text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-[#D4A338]' : 'text-[#B88E3D]'
                        }`}
                      />
                      <span className={`truncate ${isSelected ? 'text-[#D4A338] font-bold' : ''}`}>
                        {tab.label}
                      </span>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#D4A338] shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* 2. PERSONAL */}
        <div className="space-y-1.5 pt-2 border-t border-[#E3DCD0]">
          <span className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 block">
            Personal
          </span>

          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                onOpenProfile();
              } else {
                onOpenAuth();
              }
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4 text-[#B88E3D]" />
              <span>Profile</span>
            </div>
            {currentUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Signed in" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#B88E3D]" />
            <span>Settings</span>
          </button>
        </div>

        {/* 3. INFORMATION */}
        <div className="space-y-1.5 pt-2 border-t border-[#E3DCD0]">
          <span className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 block">
            Information
          </span>

          <button
            type="button"
            onClick={() => {
              onOpenAboutPage();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#B88E3D]" />
            <span>What is Tiebreaker?</span>
          </button>
        </div>
      </div>

      {/* 4. ACCOUNT SECTION (BOTTOM) */}
      <div className="pt-3.5 border-t border-[#E3DCD0] space-y-3">
        {currentUser ? (
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl skeuo-well flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full skeuo-btn-primary text-[#D4A338] flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-stone-500 truncate">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onLogout();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onOpenAuth();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 hover:text-[#B88E3D] transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#B88E3D]" />
            <span>Sign In / Create Account</span>
          </button>
        )}

        <div className="p-2 rounded-lg skeuo-well text-center">
          <p className="text-[10px] text-stone-500 italic font-serif">
            "Don't decide for me. Help me decide better."
          </p>
        </div>
      </div>
    </div>
  );

  if (isOpenMobile) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
        <div
          className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity animate-fadeIn"
          onClick={onCloseMobile}
        />
        <div className="relative w-80 max-w-[85vw] bg-[#FAF7F2] h-full shadow-2xl z-10 animate-slideRight overflow-y-auto custom-scrollbar border-r border-[#E0D9CC]">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
