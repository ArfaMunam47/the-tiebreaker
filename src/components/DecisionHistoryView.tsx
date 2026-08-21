import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  Layers,
  Award,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileText,
} from 'lucide-react';
import { DecisionAnalysis } from '../types';

interface DecisionHistoryViewProps {
  decisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string, e?: React.MouseEvent) => void;
  onNewDecision: () => void;
  onSelectSample?: () => void;
  onBack?: () => void;
}

export const DecisionHistoryView: React.FC<DecisionHistoryViewProps> = ({
  decisions = [],
  onSelectDecision,
  onDeleteDecision,
  onNewDecision,
  onSelectSample,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    decisions.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [decisions]);

  // Filter & Search Logic
  const filteredDecisions = useMemo(() => {
    let list = [...decisions];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((d) => {
        const titleMatch = (d.title || '').toLowerCase().includes(q);
        const promptMatch = (d.originalPrompt || '').toLowerCase().includes(q);
        const catMatch = (d.category || '').toLowerCase().includes(q);
        const recMatch = (d.recommendation?.recommendedOptionTitle || '').toLowerCase().includes(q);
        const optMatch = (d.options || []).some((o) => (o.title || '').toLowerCase().includes(q));
        return titleMatch || promptMatch || catMatch || recMatch || optMatch;
      });
    }

    // 2. Status Filter
    if (selectedFilter === 'recent') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((d) => {
        const time = d.updatedAt ? new Date(d.updatedAt).getTime() : d.createdAt ? new Date(d.createdAt).getTime() : 0;
        return time >= thirtyDaysAgo;
      });
    } else if (selectedFilter === 'completed') {
      list = list.filter((d) => !!d.recommendation?.recommendedOptionId);
    }

    // 3. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((d) => (d.category || 'General').toLowerCase() === selectedCategory.toLowerCase());
    }

    // 4. Sorting
    list.sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (sortBy === 'newest') return timeB - timeA;
      if (sortBy === 'oldest') return timeA - timeB;
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return list;
  }, [decisions, searchQuery, selectedFilter, selectedCategory, sortBy]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'career':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'finance':
      case 'money':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'education':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'lifestyle':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'personal':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1560px] mx-auto space-y-6 sm:space-y-8 animate-fadeIn text-[#141413] pb-16 px-2 sm:px-4">
      {/* STANDARD BACK NAVIGATION BAR */}
      {onBack && (
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#E3DCD0] print:hidden">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE0] border border-[#D5CEBF] text-stone-900 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:-translate-x-0.5"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 text-[#B88E3D] stroke-[2.5]" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCD0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg skeuo-btn-primary text-[#D4A338] flex items-center justify-center font-bold text-xs">
              <History className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#B88E3D] font-bold">
              Personal Decision Archives
            </span>
          </div>
          <h1 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[#2C221E] font-bold tracking-tight">
            Your Decisions
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-sans">
            Review the decisions you've worked through with Tiebreaker.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onSelectSample && (
            <button
              type="button"
              onClick={onSelectSample}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Explore Examples</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewDecision}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl skeuo-btn-primary text-xs font-bold uppercase tracking-wider text-[#D4A338] cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#D4A338]" />
            <span>New Decision</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filter Toolbar */}
      <div className="skeuo-card rounded-2xl p-4 sm:p-5 space-y-3.5 bg-[#FAF7F2]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions, questions, categories, or choices..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl skeuo-well text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B88E3D]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EBE5DA] shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({decisions.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'recent'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Recent (30d)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'completed'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Decided
            </button>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-stone-500 hidden lg:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl skeuo-well text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B88E3D] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (if categories exist) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-stone-500 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#2C221E] text-white'
                  : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#2C221E] text-white'
                    : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decision Cards List / Grid */}
      {filteredDecisions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredDecisions.map((decision) => {
            const recommendedOpt =
              decision.options.find((o) => o.id === decision.recommendation?.recommendedOptionId) ||
              decision.options[0];
            const isConfirmingDelete = deleteConfirmId === decision.id;

            return (
              <div
                key={decision.id}
                onClick={() => onSelectDecision(decision)}
                className="skeuo-card rounded-2xl p-5 sm:p-6 space-y-4 hover:border-[#B88E3D] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative bg-white"
              >
                <div className="space-y-3">
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getCategoryColor(
                          decision.category
                        )}`}
                      >
                        {decision.category || 'General'}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formatDate(decision.updatedAt || decision.createdAt)}
                      </span>
                    </div>

                    {/* Delete Icon / Confirmation */}
                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-rose-50 border border-rose-200 animate-fadeIn">
                          <span className="text-[10px] text-rose-800 font-bold pl-1">Delete?</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDecision(decision.id, e);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="px-1.5 py-0.5 text-[10px] text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(decision.id);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Decision"
                          aria-label="Delete decision"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Dilemma */}
                  <div className="space-y-1.5">
                    <h3 className="font-serif italic text-base sm:text-lg font-bold text-[#2C221E] group-hover:text-[#B88E3D] transition-colors leading-snug line-clamp-2">
                      {decision.title}
                    </h3>
                    {decision.originalPrompt && decision.originalPrompt !== decision.title && (
                      <p className="text-xs text-stone-500 line-clamp-2 italic font-serif">
                        "{decision.originalPrompt}"
                      </p>
                    )}
                  </div>

                  {/* Recommended Winner Box */}
                  {recommendedOpt && (
                    <div className="p-3 rounded-xl skeuo-well space-y-1 border border-amber-200/70 bg-amber-50/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88E3D] flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#B88E3D]" /> Recommended Choice
                        </span>
                        {decision.recommendation?.confidenceLevel && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            {decision.recommendation.confidenceLevel} Confidence
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#2C221E] truncate">
                        {recommendedOpt.title}
                      </p>
                      {decision.recommendation?.mainReasons?.[0] && (
                        <p className="text-[11px] text-stone-600 line-clamp-1">
                          • {decision.recommendation.mainReasons[0]}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-[#EAE4D9] flex items-center justify-between text-xs">
                  <span className="text-stone-500 flex items-center gap-1 font-mono text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-stone-400" />
                    {decision.options?.length || 0} Options Evaluated
                  </span>

                  <span className="flex items-center gap-1 font-bold text-[#B88E3D] group-hover:translate-x-1 transition-transform">
                    <span>Open Decision</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="skeuo-card rounded-3xl p-10 sm:p-16 text-center space-y-5 max-w-xl mx-auto my-6 bg-[#FAF7F2]">
          <div className="w-16 h-16 rounded-2xl skeuo-btn-secondary text-[#B88E3D] mx-auto flex items-center justify-center shadow-xs">
            <History className="w-8 h-8 text-[#B88E3D]" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif italic text-2xl font-bold text-[#2C221E]">
              {searchQuery ? 'No matching decisions found' : 'No decisions yet'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `We couldn't find any decisions matching "${searchQuery}". Try clearing your search query or filters.`
                : 'Your saved decisions will appear here when you start using Tiebreaker.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                  setSelectedCategory('all');
                }}
                className="px-5 py-2.5 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 cursor-pointer"
              >
                Clear Search & Filters
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onNewDecision}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl skeuo-btn-primary text-xs font-bold uppercase tracking-wider text-[#D4A338] cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-[#D4A338]" />
                  <span>Create Your First Decision</span>
                </button>

                {onSelectSample && (
                  <button
                    type="button"
                    onClick={onSelectSample}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl skeuo-btn-secondary text-xs font-bold text-stone-800 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                    <span>Try an Example Dilemma</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
