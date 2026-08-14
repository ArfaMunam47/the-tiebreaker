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
    <div className="min-h-full flex flex-col justify-between p-5 text-sm bg-slate-900 text-slate-100 select-none space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-r border-slate-800">
      {/* TOP CONTAINER */}
      <div className="space-y-5">
        {/* Brand & Identity */}
        <div className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                onNewDecision();
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-all">
                <span className="font-serif italic font-extrabold text-xl leading-none">T</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif italic font-bold text-lg text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    Tie Breaker
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Decision Intelligence Studio
                </p>
              </div>
            </button>

            {/* Mobile close button */}
            {isOpenMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.99] group cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            <span>New Decision</span>
          </button>
        </div>

        {/* Active Decision Navigation (If active) */}
        {currentDecision && (
          <div className="space-y-2">
            <div className="px-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Active Analysis
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                {currentDecision.options.length} Options
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 shadow-2xs">
              <div className="flex items-center gap-2 text-white text-xs font-serif italic font-bold leading-snug">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="line-clamp-2" title={currentDecision.title}>
                  {currentDecision.title}
                </span>
              </div>
            </div>

            <nav className="space-y-1 pt-1">
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
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-slate-950' : 'text-amber-400/80'
                        }`}
                      />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Saved Decisions List in Sidebar */}
        {savedDecisions.length > 0 && onSelectDecision && (
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Recent Decisions
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {savedDecisions.length}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {savedDecisions.slice(0, 6).map((dec) => {
                const isActive = currentDecision?.id === dec.id;
                return (
                  <button
                    key={dec.id}
                    onClick={() => {
                      onSelectDecision(dec);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title={dec.title}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-slate-800 font-bold text-amber-300 border-amber-500/80 shadow-2xs'
                        : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono uppercase font-bold text-amber-400">
                        {dec.category || 'Decision'}
                      </span>
                      <span>{new Date(dec.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="line-clamp-2 block font-serif italic text-xs leading-snug">
                      {dec.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Studio Navigation & Tools */}
        <div className="space-y-1 pt-3 border-t border-slate-800">
          <span className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 block mb-1.5">
            Decision Studio
          </span>

          <button
            onClick={() => {
              onOpenHistory();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-amber-400" />
              <span>Saved Library</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectSample();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sample Scenarios</span>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHowItWorks();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Methodology</span>
            </div>
          </button>
        </div>
      </div>

      {/* BOTTOM CONTAINER */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Backup & Data</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              title="Export Decisions JSON"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onImport}
              title="Import Decisions JSON"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <p className="text-[11px] text-slate-400 leading-relaxed italic font-serif">
            "Don't decide for me. Help me decide better."
          </p>
        </div>
      </div>
    </div>
  );

  if (isOpenMobile) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden flex">
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-fadeIn"
          onClick={onCloseMobile}
        />
        <div className="relative w-72 max-w-[85vw] bg-slate-900 h-full shadow-2xl z-10 animate-slideRight">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

