import React from 'react';
import {
  Plus,
  History,
  Sparkles,
  HelpCircle,
  Download,
  Upload,
  BarChart3,
  GitMerge,
  Table,
  Grid2X2,
  SlidersHorizontal,
  Shield,
  Clock,
  Compass,
  X,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { DecisionAnalysis } from '../types';

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
  onSelectSample: () => void;
  savedCount: number;
  onExport: () => void;
  onImport: () => void;
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
  onOpenHowItWorks,
  onSelectSample,
  savedCount,
  onExport,
  onImport,
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

  const content = (
    <div className="w-full flex flex-col justify-between p-4 sm:p-5 text-sm text-stone-900 select-none space-y-5 rounded-2xl min-w-0">
      {/* TOP CONTAINER */}
      <div className="space-y-4 min-w-0">
        {/* Brand & Identity */}
        <div className="pb-3 border-b border-[#E3DCD0]">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onNewDecision();
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer min-w-0 flex-1"
            >
              <div className="w-8 h-8 rounded-xl skeuo-btn-primary text-[#D4A338] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                <span className="font-serif italic font-extrabold text-lg leading-none">T</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif italic font-bold text-base text-[#2C221E] tracking-tight group-hover:text-[#B88E3D] transition-colors truncate">
                    Tie Breaker
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs shrink-0">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium tracking-wide truncate">
                  Decision Intelligence
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

        {/* Primary Action Button */}
        <div>
          <button
            onClick={() => {
              onNewDecision();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full min-h-[42px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl skeuo-btn-primary font-extrabold text-xs tracking-wider uppercase group cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4A338] stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[#D4A338]">New Decision</span>
          </button>
        </div>

        {/* Active Decision Navigation (If active) */}
        {currentDecision && (
          <div className="space-y-2 min-w-0">
            <div className="px-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
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
                    className={`w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'skeuo-btn-primary font-extrabold text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-[#F2ECE1] border border-transparent hover:border-[#E0D8CA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
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

        {/* Saved Decisions List in Sidebar */}
        {savedDecisions.length > 0 && onSelectDecision && (
          <div className="space-y-2 pt-2.5 border-t border-[#E3DCD0] min-w-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                Recent Decisions
              </span>
              <span className="text-[10px] font-mono text-stone-600 px-1.5 py-0.2 rounded skeuo-well font-bold">
                {savedDecisions.length}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {savedDecisions.slice(0, 5).map((dec) => {
                const isActive = currentDecision?.id === dec.id;
                return (
                  <button
                    key={dec.id}
                    onClick={() => {
                      onSelectDecision(dec);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title={dec.title}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'skeuo-card border-[#B88E3D] ring-1 ring-[#B88E3D]/30'
                        : 'skeuo-card-interactive text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-500 mb-0.5">
                      <span className="font-mono uppercase font-bold text-[#B88E3D]">
                        {dec.category || 'Decision'}
                      </span>
                      <span className="text-[9px] text-stone-400 font-mono">
                        {new Date(dec.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="line-clamp-1 block font-serif italic text-xs leading-snug font-semibold text-[#2C221E] break-words">
                      {dec.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Studio Navigation & Tools */}
        <div className="space-y-1.5 pt-2.5 border-t border-[#E3DCD0]">
          <span className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500 block mb-1">
            Studio Tools
          </span>

          <button
            onClick={() => {
              onOpenHistory();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 skeuo-btn-secondary cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-[#B88E3D]" />
              <span>Saved Library</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectSample();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 skeuo-btn-secondary cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#B88E3D]" />
              <span>Sample Dilemmas</span>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHowItWorks();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 skeuo-btn-secondary cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <span>How It Works</span>
            </div>
          </button>
        </div>
      </div>

      {/* BOTTOM CONTAINER */}
      <div className="pt-3.5 border-t border-[#E3DCD0] space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Data Backup</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExport}
              title="Export Decisions JSON"
              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 skeuo-btn-secondary rounded-lg cursor-pointer"
              aria-label="Export decisions backup"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onImport}
              title="Import Decisions JSON"
              className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 skeuo-btn-secondary rounded-lg cursor-pointer"
              aria-label="Import decisions backup"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-2.5 rounded-xl skeuo-well text-center">
          <p className="text-[11px] text-stone-600 leading-relaxed italic font-serif">
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
