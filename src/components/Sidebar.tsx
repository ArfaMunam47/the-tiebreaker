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
    <div className="h-full flex flex-col justify-between p-5 text-sm bg-white border-r border-[#E8E5DF]/60 select-none overflow-y-auto">
      <div className="space-y-6">
        {/* Brand & Identity */}
        <div className="pb-4 border-b border-[#E8E5DF]/50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                onNewDecision();
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#18191C] text-[#C59B27] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#C59B27] group-hover:text-white transition-colors">
                <span className="font-serif italic font-bold text-lg leading-none">T</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif italic font-semibold text-lg text-[#18191C] tracking-tight group-hover:text-[#C59B27] transition-colors">
                    Tie Breaker
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#B88E3D] border border-[#E8E5DF]/60">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-[#646974] font-medium tracking-wide">
                  Decision Intelligence Studio
                </p>
              </div>
            </button>

            {/* Mobile close button */}
            {isOpenMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-[#646974] hover:text-[#18191C] rounded-lg hover:bg-[#FAF7F2] lg:hidden transition-colors"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#18191C] hover:bg-[#2A2D34] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-xs active:scale-[0.99] group"
          >
            <Plus className="w-4 h-4 text-[#C59B27] group-hover:rotate-90 transition-transform duration-300" />
            <span>New Decision</span>
          </button>
        </div>

        {/* Active Decision Navigation (If active) */}
        {currentDecision && (
          <div className="space-y-1.5 pt-1">
            <div className="px-1 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C909A]">
                Active Analysis
              </span>
              <span className="text-[10px] font-mono text-[#B88E3D] font-semibold truncate max-w-[90px]">
                {currentDecision.options.length} Options
              </span>
            </div>

            <div className="px-2.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF]/60 mb-3">
              <div className="flex items-center gap-1.5 text-[#18191C] text-xs font-serif italic truncate font-medium">
                <FileText className="w-3.5 h-3.5 text-[#B88E3D] shrink-0" />
                <span className="truncate">{currentDecision.title}</span>
              </div>
            </div>

            <nav className="space-y-0.5">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#18191C] text-white font-semibold shadow-xs'
                        : 'text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#C59B27]' : 'text-[#8C909A]'
                        }`}
                      />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-3 h-3 text-[#C59B27]" />}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Saved Decisions List in Sidebar if available */}
        {savedDecisions.length > 0 && onSelectDecision && (
          <div className="space-y-1.5 pt-3 border-t border-[#E8E5DF]/50">
            <span className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C909A] block mb-1">
              Recent History
            </span>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
              {savedDecisions.slice(0, 5).map((dec) => {
                const isActive = currentDecision?.id === dec.id;
                return (
                  <button
                    key={dec.id}
                    onClick={() => {
                      onSelectDecision(dec);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md truncate transition-colors ${
                      isActive
                        ? 'bg-[#FAF7F2] font-semibold text-[#18191C] border border-[#E8E5DF]/60'
                        : 'text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span className="truncate block font-serif italic">{dec.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Studio Navigation & Tools */}
        <div className="space-y-1 pt-3 border-t border-[#E8E5DF]/50">
          <span className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C909A] block mb-1">
            Decision Studio
          </span>

          <button
            onClick={() => {
              onOpenHistory();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-[#8C909A]" />
              <span>Saved Library</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#B88E3D] border border-[#E8E5DF]/60">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectSample();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#B88E3D]" />
              <span>Sample Analyses</span>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHowItWorks();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#8C909A]" />
              <span>Methodology</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer & Import/Export */}
      <div className="pt-4 mt-6 border-t border-[#E8E5DF]/50 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-medium text-[#8C909A]">Backup & Data</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              title="Export Decisions JSON"
              className="p-1.5 text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2] rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onImport}
              title="Import Decisions JSON"
              className="p-1.5 text-[#595E68] hover:text-[#18191C] hover:bg-[#FAF7F2] rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-2.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF]/60">
          <p className="text-[10px] text-[#646974] leading-relaxed italic font-serif">
            "Don't decide for me. Help me decide better."
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 lg:w-72 shrink-0 h-full">
        {content}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#18191C]/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-slideRight">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

