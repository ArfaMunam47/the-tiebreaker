import React, { useState, useEffect } from 'react';
import {
  DecisionAnalysis,
  Criterion,
  WeightedScores,
  ProConItem,
  RiskItem,
  ComparisonRow,
  FollowUpMessage,
} from '../types';
import { calculateWeightedTotalScore } from '../utils/storage';
import {
  Check,
  AlertTriangle,
  Scale,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Compass,
  Plus,
  Trash2,
  Save,
  Printer,
  Send,
  HelpCircle,
  BarChart3,
  Lightbulb,
  FileText,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  RefreshCw,
  Award,
  SlidersHorizontal,
  Table,
  Grid2X2,
} from 'lucide-react';

interface ResultsDashboardProps {
  decision: DecisionAnalysis;
  onUpdateDecision: (updated: DecisionAnalysis) => void;
  onSave: () => void;
  onNewDecision: () => void;
  initialTab?: TabType;
}

export type TabType =
  | 'overview'
  | 'prosCons'
  | 'compare'
  | 'swot'
  | 'matrix'
  | 'risks'
  | 'future'
  | 'thinkDeeper';

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  decision,
  onUpdateDecision,
  onSave,
  onNewDecision,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tabStripRef = React.useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabStripRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      tabStripRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Editable local state for Matrix Criteria and Option Scores
  const [criteria, setCriteria] = useState<Criterion[]>(decision.criteria || []);
  const [scores, setScores] = useState<WeightedScores>(decision.weightedScores || {});
  const [prosConsData, setProsConsData] = useState(decision.prosCons || []);
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>(decision.comparison || []);
  const [copiedMatrix, setCopiedMatrix] = useState(false);
  const [newCompareCriterion, setNewCompareCriterion] = useState('');

  // Follow-up chat state for Think Deeper
  const [chatMessages, setChatMessages] = useState<FollowUpMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  useEffect(() => {
    setCriteria(decision.criteria || []);
    setScores(decision.weightedScores || {});
    setProsConsData(decision.prosCons || []);
    setComparisonRows(decision.comparison || []);
  }, [decision]);

  // Robust comparison cell resolver
  const getOptionComparisonInfo = (
    row: ComparisonRow,
    opt: typeof decision.options[0],
    optIndex: number
  ): { val: string; isLeader: boolean } => {
    if (!row || !row.scores) {
      // Fallback to matrix scores
      const matchedCrit = criteria.find(
        (c) => c.name.toLowerCase() === row.criterion.toLowerCase()
      );
      if (matchedCrit && scores[opt.id]?.[matchedCrit.id] !== undefined) {
        const valNum = scores[opt.id][matchedCrit.id];
        // Calculate leader for this crit
        let maxVal = -1;
        let leaderOptId = '';
        decision.options.forEach((o) => {
          const s = scores[o.id]?.[matchedCrit.id] ?? 0;
          if (s > maxVal) {
            maxVal = s;
            leaderOptId = o.id;
          }
        });
        return { val: `${valNum} / 10`, isLeader: leaderOptId === opt.id && maxVal > 0 };
      }
      return { val: '-', isLeader: false };
    }

    const winnerIdOrTitle = (row.winnerOptionId || '').toLowerCase().trim();
    const optIdLower = opt.id.toLowerCase().trim();
    const optTitleLower = opt.title.toLowerCase().trim();

    // 1. Direct ID match
    if (row.scores[opt.id] !== undefined && String(row.scores[opt.id]).trim() !== '') {
      const val = String(row.scores[opt.id]);
      const isLeader =
        winnerIdOrTitle === optIdLower ||
        winnerIdOrTitle === optTitleLower ||
        (winnerIdOrTitle.length > 0 && optTitleLower.includes(winnerIdOrTitle));
      return { val, isLeader };
    }

    // 2. Direct Title match
    if (row.scores[opt.title] !== undefined && String(row.scores[opt.title]).trim() !== '') {
      const val = String(row.scores[opt.title]);
      const isLeader =
        winnerIdOrTitle === optIdLower ||
        winnerIdOrTitle === optTitleLower ||
        (winnerIdOrTitle.length > 0 && optTitleLower.includes(winnerIdOrTitle));
      return { val, isLeader };
    }

    // 3. Substring or case-insensitive key search
    const keys = Object.keys(row.scores);
    const matchedKey = keys.find(
      (k) =>
        k.toLowerCase() === optIdLower ||
        k.toLowerCase() === optTitleLower ||
        optTitleLower.includes(k.toLowerCase()) ||
        k.toLowerCase().includes(optTitleLower)
    );

    if (matchedKey && row.scores[matchedKey] !== undefined && String(row.scores[matchedKey]).trim() !== '') {
      const val = String(row.scores[matchedKey]);
      const isLeader =
        winnerIdOrTitle === optIdLower ||
        winnerIdOrTitle === optTitleLower ||
        winnerIdOrTitle === matchedKey.toLowerCase() ||
        (winnerIdOrTitle.length > 0 && optTitleLower.includes(winnerIdOrTitle));
      return { val, isLeader };
    }

    // 4. Index based key search ('opt1', 'opt2', '0', '1', 'opt_1')
    const indexKeys = [`opt${optIndex + 1}`, `Option ${optIndex + 1}`, `${optIndex}`, `opt_${optIndex + 1}`];
    for (const ik of indexKeys) {
      if (row.scores[ik] !== undefined && String(row.scores[ik]).trim() !== '') {
        const val = String(row.scores[ik]);
        const isLeader = winnerIdOrTitle === ik.toLowerCase() || winnerIdOrTitle === optIdLower;
        return { val, isLeader };
      }
    }

    // 5. Fallback matrix scores
    const matchedCrit = criteria.find(
      (c) =>
        c.name.toLowerCase().includes(row.criterion.toLowerCase()) ||
        row.criterion.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedCrit && scores[opt.id]?.[matchedCrit.id] !== undefined) {
      const valNum = scores[opt.id][matchedCrit.id];
      let maxVal = -1;
      let leaderOptId = '';
      decision.options.forEach((o) => {
        const s = scores[o.id]?.[matchedCrit.id] ?? 0;
        if (s > maxVal) {
          maxVal = s;
          leaderOptId = o.id;
        }
      });
      return { val: `${valNum} / 10`, isLeader: leaderOptId === opt.id && maxVal > 0 };
    }

    return { val: '-', isLeader: false };
  };

  const handleAddCompareCriterion = () => {
    if (!newCompareCriterion.trim()) return;
    const critName = newCompareCriterion.trim();

    // Default scores across options
    const defaultScores: Record<string, string> = {};
    decision.options.forEach((opt, idx) => {
      defaultScores[opt.id] = idx === 0 ? 'High' : 'Moderate';
    });

    const newRow: ComparisonRow = {
      criterion: critName,
      scores: defaultScores,
      winnerOptionId: decision.options[0]?.id || '',
      note: 'User defined evaluation criterion.',
    };

    const updatedRows = [...comparisonRows, newRow];
    setComparisonRows(updatedRows);
    setNewCompareCriterion('');
    onUpdateDecision({
      ...decision,
      comparison: updatedRows,
    });
  };

  const handleCopyMatrixMarkdown = () => {
    let md = `| Evaluation Criterion | ${decision.options.map((o) => o.title).join(' | ')} | Trade-Off Note |\n`;
    md += `| ${'--- | '.repeat(decision.options.length + 2)}\n`;

    effectiveComparisonRows.forEach((row) => {
      const scoresCols = decision.options
        .map((opt, idx) => {
          const info = getOptionComparisonInfo(row, opt, idx);
          return `${info.val}${info.isLeader ? ' ⭐ (Leader)' : ''}`;
        })
        .join(' | ');
      md += `| ${row.criterion} | ${scoresCols} | ${row.note || '-'} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedMatrix(true);
    setTimeout(() => setCopiedMatrix(false), 2000);
  };

  // Compute effective comparison rows by combining AI comparison rows + matrix criteria
  const effectiveComparisonRows: ComparisonRow[] = [...comparisonRows];
  criteria.forEach((crit) => {
    const exists = effectiveComparisonRows.some(
      (r) => r.criterion.toLowerCase() === crit.name.toLowerCase()
    );
    if (!exists) {
      const scoresMap: Record<string, string> = {};
      let maxScore = -1;
      let leaderId = '';

      decision.options.forEach((opt) => {
        const s = scores[opt.id]?.[crit.id] ?? 5;
        scoresMap[opt.id] = `${s} / 10`;
        if (s > maxScore) {
          maxScore = s;
          leaderId = opt.id;
        }
      });

      effectiveComparisonRows.push({
        criterion: crit.name,
        scores: scoresMap,
        winnerOptionId: leaderId,
        note: `Weighted at ${crit.weight}% in evaluation matrix.`,
      });
    }
  });

  // Sync criteria or score changes back to parent
  const handleWeightChange = (critId: string, newWeight: number) => {
    const updatedCriteria = criteria.map((c) =>
      c.id === critId ? { ...c, weight: Math.max(0, Math.min(100, newWeight)) } : c
    );
    setCriteria(updatedCriteria);
    onUpdateDecision({
      ...decision,
      criteria: updatedCriteria,
    });
  };

  const handleScoreChange = (optionId: string, critId: string, newScore: number) => {
    const updatedScores = {
      ...scores,
      [optionId]: {
        ...(scores[optionId] || {}),
        [critId]: Math.max(1, Math.min(10, newScore)),
      },
    };
    setScores(updatedScores);
    onUpdateDecision({
      ...decision,
      weightedScores: updatedScores,
    });
  };

  const handleAddCriterion = () => {
    const newId = 'crit_' + Date.now();
    const newCrit: Criterion = {
      id: newId,
      name: 'Custom Priority',
      weight: 10,
      description: 'User specified evaluation parameter',
    };
    const updatedCriteria = [...criteria, newCrit];
    setCriteria(updatedCriteria);

    const updatedScores = { ...scores };
    decision.options.forEach((opt) => {
      if (!updatedScores[opt.id]) updatedScores[opt.id] = {};
      updatedScores[opt.id][newId] = 5;
    });
    setScores(updatedScores);

    onUpdateDecision({
      ...decision,
      criteria: updatedCriteria,
      weightedScores: updatedScores,
    });
  };

  const handleRemoveCriterion = (critId: string) => {
    if (criteria.length <= 1) return;
    const updatedCriteria = criteria.filter((c) => c.id !== critId);
    setCriteria(updatedCriteria);
    onUpdateDecision({
      ...decision,
      criteria: updatedCriteria,
    });
  };

  const handleAddProCon = (optionId: string, type: 'pro' | 'con') => {
    const text = prompt(`Enter custom ${type === 'pro' ? 'Advantage' : 'Disadvantage'}:`);
    if (!text || !text.trim()) return;

    const newItem: ProConItem = {
      id: 'pc_' + Date.now(),
      text: text.trim(),
      weight: 'medium',
    };

    const exists = prosConsData.some((pc) => pc.optionId === optionId);
    let updated: typeof prosConsData;
    if (exists) {
      updated = prosConsData.map((pc) => {
        if (pc.optionId === optionId) {
          return {
            ...pc,
            pros: type === 'pro' ? [...pc.pros, newItem] : pc.pros,
            cons: type === 'con' ? [...pc.cons, newItem] : pc.cons,
          };
        }
        return pc;
      });
    } else {
      updated = [
        ...prosConsData,
        {
          optionId,
          pros: type === 'pro' ? [newItem] : [],
          cons: type === 'con' ? [newItem] : [],
        },
      ];
    }

    setProsConsData(updated);
    onUpdateDecision({
      ...decision,
      prosCons: updated,
    });
  };

  const handleSaveClick = () => {
    onSave();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg: FollowUpMessage = {
      id: 'm_' + Date.now(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/think-deeper-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionContext: decision,
          message: currentInput,
        }),
      });

      const data = await res.json();
      const botMsg: FollowUpMessage = {
        id: 'm_' + (Date.now() + 1),
        role: 'assistant',
        content: data.reply || 'Consider how this aligns with your non-negotiable core values.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Find recommended option
  const recommendedOpt =
    decision.options.find((o) => o.id === decision.recommendation?.recommendedOptionId) ||
    decision.options[0];

  // Calculate top scoring option dynamically from matrix
  let topScoringOptionId = decision.options[0]?.id || '';
  let highestScore = -1;

  decision.options.forEach((opt) => {
    const score = calculateWeightedTotalScore(opt.id, criteria, scores);
    if (score > highestScore) {
      highestScore = score;
      topScoringOptionId = opt.id;
    }
  });

  const tabList: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'prosCons', label: 'Pros & Cons', icon: FileText },
    { id: 'compare', label: 'Compare Matrix', icon: Table },
    { id: 'swot', label: 'SWOT Grid', icon: Grid2X2 },
    { id: 'matrix', label: 'Weighted Matrix', icon: SlidersHorizontal },
    { id: 'risks', label: 'Risk Analysis', icon: Shield },
    { id: 'future', label: '1–5 Yr Scenarios', icon: Clock },
    { id: 'thinkDeeper', label: 'Think Deeper & AI', icon: Compass },
  ];

  return (
    <div className="w-full space-y-8 animate-fadeIn print:px-0 print:py-0">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg print:border-none print:shadow-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-slate-800 text-amber-400 border border-amber-500/30 rounded-md">
                Decision Analysis
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {decision.options.length} Options Evaluated • Updated{' '}
                {new Date(decision.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif italic text-2xl sm:text-3xl font-normal text-white leading-snug">
              {decision.title}
            </h1>

            {/* Recommendation Highlight Pill */}
            {recommendedOpt && (
              <div className="space-y-2">
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/90 border border-amber-500/30 text-slate-200 text-xs font-medium shadow-xs">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>
                    Recommended:{' '}
                    <strong className="font-bold text-amber-300">{recommendedOpt.title}</strong>
                  </span>
                  <span className="ml-1 text-[11px] font-mono text-amber-400 font-bold">
                    ({decision.recommendation?.confidenceLevel || 'High'} Confidence)
                  </span>
                  {decision.reversibility && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 border border-slate-700">
                      ↺ {decision.reversibility}
                    </span>
                  )}
                  {decision.timeHorizon && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 border border-slate-700">
                      ⏱ {decision.timeHorizon} horizon
                    </span>
                  )}
                </div>

                {decision.recommendation?.confidenceReason && (
                  <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 italic">
                    💡 <strong>Confidence Rationale:</strong> {decision.recommendation.confidenceReason}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                savedSuccess
                  ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 shadow-xs'
              }`}
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{savedSuccess ? 'Saved to History!' : 'Save Decision'}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all shadow-xs"
              title="Print or Export PDF"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            <button
              onClick={onNewDecision}
              className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>New Decision</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLARIFYING QUESTIONS BANNER (if available) */}
      {decision.clarifyingQuestions && decision.clarifyingQuestions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Clarifying Context Identified By AI</span>
          </div>
          <p className="text-xs text-slate-300">
            Key questions that sharpen the decision framework:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {decision.clarifyingQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-2"
              >
                <p className="font-semibold text-white">{q.question}</p>
                {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.suggestedAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300"
                      >
                        {ans}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAVIGATION TABS (Mobile Dropdown + Fully Responsive Horizontal Tab Strip with Generous Bottom Margin) */}
      <div className="sticky top-[65px] z-20 bg-slate-950/90 backdrop-blur-md pt-2.5 pb-4 mb-8 sm:mb-10 border-b border-slate-800 shadow-md print:hidden space-y-2.5 max-w-full min-w-0">
        {/* Mobile Dropdown Selector (visible on small mobile screens < 640px) */}
        <div className="sm:hidden px-1">
          <label htmlFor="mobile-tab-select" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Select Analysis Section
          </label>
          <select
            id="mobile-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 shadow-xs cursor-pointer"
          >
            {tabList.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Horizontal Tab Strip (Scrollable & Responsive across all viewports) */}
        <div className="relative w-full max-w-full min-w-0 flex items-center gap-1.5">
          <button
            onClick={() => scrollTabs('left')}
            className="hidden sm:flex p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-2xs transition-colors shrink-0 cursor-pointer"
            aria-label="Scroll tabs left"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabStripRef}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1.5 px-1.5 max-w-full w-full touch-pan-x border border-slate-800 bg-slate-900/90 rounded-xl shadow-2xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400/80'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollTabs('right')}
            className="hidden sm:flex p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-2xs transition-colors shrink-0 cursor-pointer"
            aria-label="Scroll tabs right"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Summary & Top Recommendation Box */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Executive Synthesis
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {decision.recommendation?.mainReasons?.join(' ') ||
                  `Analyzing ${decision.options.length} options for "${decision.title}".`}
              </p>

              {/* Priorities Tags */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 block mb-2">
                  Priorities Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {decision.userPriorities?.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-200 text-xs font-medium border border-slate-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Score Meter Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Primary Direction
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                  {decision.recommendation?.confidenceLevel || 'High'} Confidence
                </span>
              </div>

              <div>
                <h4 className="font-serif italic text-xl text-white font-bold">
                  {recommendedOpt?.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  {recommendedOpt?.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <span className="text-slate-400 font-medium">Primary Operational Risk:</span>
                <p className="text-amber-300 font-semibold">
                  {decision.recommendation?.biggestConcern || 'Managing short-term transition.'}
                </p>
              </div>
            </div>
          </div>

          {/* Why Other Options Lost & Reversal Conditions */}
          {(decision.recommendation?.whyNotOptions || (decision.recommendation?.reversalConditions && decision.recommendation.reversalConditions.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Why Other Options Lost */}
              {decision.recommendation?.whyNotOptions && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    Why Other Options Lost
                  </h4>
                  <div className="space-y-2 text-xs">
                    {Object.entries(decision.recommendation.whyNotOptions).map(([optId, reason]) => {
                      const opt = decision.options.find((o) => o.id === optId);
                      return (
                        <div key={optId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="font-serif italic text-white font-bold block">
                            {opt?.title || optId}
                          </span>
                          <p className="text-slate-300 leading-relaxed">{reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditions that would change the recommendation */}
              {decision.recommendation?.reversalConditions && decision.recommendation.reversalConditions.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Conditions That Would Flip Recommendation
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {decision.recommendation.reversalConditions.map((cond, idx) => (
                      <li key={idx} className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-slate-200 flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Evidence Items Breakdown (Facts vs Assumptions) */}
          {decision.evidenceItems && decision.evidenceItems.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Evidence & Information Integrity Breakdown
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {decision.evidenceItems.map((item) => {
                  const categoryColors = {
                    FACT: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
                    ASSUMPTION: 'bg-amber-950/80 text-amber-300 border-amber-800',
                    INTERPRETATION: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
                    UNKNOWN: 'bg-slate-950 text-slate-300 border-slate-800',
                  };
                  return (
                    <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                      <p className="text-slate-200 font-medium leading-relaxed">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Evaluated Options & Scores
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decision.options.map((opt) => {
                const weightedScore = calculateWeightedTotalScore(opt.id, criteria, scores);
                const isRecommended = opt.id === decision.recommendation?.recommendedOptionId;
                const isLeader = opt.id === topScoringOptionId;

                return (
                  <div
                    key={opt.id}
                    className={`p-6 rounded-2xl border transition-all space-y-4 relative bg-slate-900 ${
                      isRecommended || isLeader
                        ? 'border-amber-500/80 shadow-md shadow-amber-500/10'
                        : 'border-slate-800 shadow-sm'
                    }`}
                  >
                    {(isRecommended || isLeader) && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded-full shadow-xs">
                        {isRecommended ? 'Recommended' : 'Top Matrix Score'}
                      </span>
                    )}

                    <div>
                      <h4 className="font-serif italic text-lg text-white font-bold">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                        {opt.description}
                      </p>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Weighted Total</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {weightedScore} / 10
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 border border-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(weightedScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROS & CONS TAB */}
      {activeTab === 'prosCons' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Advantages & Disadvantages
            </h3>
            <span className="text-xs text-slate-400">
              Custom items can be added dynamically
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {decision.options.map((opt) => {
              const pc = prosConsData.find((p) => p.optionId === opt.id) || {
                optionId: opt.id,
                pros: [],
                cons: [],
              };

              return (
                <div
                  key={opt.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-serif italic text-lg text-white font-bold">
                      {opt.title}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddProCon(opt.id, 'pro')}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-slate-200 hover:bg-slate-800 hover:text-amber-300 border border-slate-800 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-amber-400" /> Pro
                      </button>
                      <button
                        onClick={() => handleAddProCon(opt.id, 'con')}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-950 text-slate-200 hover:bg-slate-800 hover:text-amber-300 border border-slate-800 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-slate-400" /> Con
                      </button>
                    </div>
                  </div>

                  {/* PROS LIST */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Advantages ({pc.pros.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.pros.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-950 border-l-2 border-amber-500 border-y border-r border-slate-800 text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-slate-100">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-slate-400 mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-transparent text-slate-400'
                            }`}
                          >
                            {item.weight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CONS LIST */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Disadvantages ({pc.cons.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.cons.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-950 border-l-2 border-rose-500 border-y border-r border-slate-800 text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-slate-100">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-slate-400 mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                                : 'bg-transparent text-slate-400'
                            }`}
                          >
                            {item.weight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. COMPARE TAB */}
      {activeTab === 'compare' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 animate-fadeIn shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
                  Side-by-Side Decision Comparison Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Comprehensive evaluation of all options across qualitative parameters and weighted priorities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMatrixMarkdown}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  copiedMatrix
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${copiedMatrix ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{copiedMatrix ? 'Copied Markdown!' : 'Copy Table'}</span>
              </button>
            </div>
          </div>

          {/* ADD CUSTOM COMPARISON CRITERION INPUT */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={newCompareCriterion}
              onChange={(e) => setNewCompareCriterion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCompareCriterion()}
              placeholder="Add custom evaluation criterion (e.g., Work-Life Balance, Time-to-ROI, Stress Impact)..."
              className="flex-1 w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleAddCompareCriterion}
              disabled={!newCompareCriterion.trim()}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
              <span>Add Criterion</span>
            </button>
          </div>

          {/* MAIN MATRIX TABLE */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4 min-w-[180px]">Evaluation Criterion</th>
                  {decision.options.map((opt, idx) => {
                    const isRecommended = opt.id === decision.recommendation?.recommendedOptionId;
                    const isTopScore = opt.id === topScoringOptionId;
                    return (
                      <th key={opt.id} className="py-3.5 px-4 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif italic text-xs text-white font-bold">
                              {opt.title}
                            </span>
                          </div>
                          {(isRecommended || isTopScore) && (
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-amber-500 text-slate-950 rounded">
                              {isRecommended ? '★ Recommended' : 'Top Matrix Score'}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-3.5 px-4 min-w-[200px]">Trade-Off & Guidance Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
                {effectiveComparisonRows.map((row, rowIdx) => {
                  return (
                    <tr key={rowIdx} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-3.5 px-4 font-serif italic text-amber-300 font-semibold border-r border-slate-800 bg-slate-950/40">
                        {row.criterion}
                      </td>
                      {decision.options.map((opt, optIdx) => {
                        const cellInfo = getOptionComparisonInfo(row, opt, optIdx);
                        return (
                          <td
                            key={opt.id}
                            className={`py-3.5 px-4 border-r border-slate-800 ${
                              cellInfo.isLeader ? 'bg-amber-500/10' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`font-medium ${
                                  cellInfo.isLeader
                                    ? 'font-bold text-amber-300'
                                    : 'text-slate-300'
                                }`}
                              >
                                {cellInfo.val}
                              </span>
                              {cellInfo.isLeader && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-amber-500 text-slate-950 rounded shrink-0 shadow-2xs">
                                  Leader
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] leading-relaxed italic bg-slate-950/20">
                        {row.note || 'Balanced evaluation across options.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER SUMMARY */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Compare matrix integrates both qualitative AI synthesis and user-customized matrix weights.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className="px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              Adjust Weighted Matrix →
            </button>
          </div>
        </div>
      )}

      {/* 4. SWOT TAB */}
      {activeTab === 'swot' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            SWOT Strategic Grid
          </h3>

          <div className="space-y-8">
            {decision.options.map((opt) => {
              const swot = decision.swot.find((s) => s.optionId === opt.id) || {
                optionId: opt.id,
                strengths: [],
                weaknesses: [],
                opportunities: [],
                threats: [],
              };

              return (
                <div
                  key={opt.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md"
                >
                  <h4 className="font-serif italic text-lg text-white border-b border-slate-800 pb-3 font-bold">
                    {opt.title} — SWOT Overview
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-slate-950 border-l-2 border-amber-500 border-y border-r border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        S — Strengths
                      </span>
                      <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                        {swot.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-4 rounded-xl bg-slate-950 border-l-2 border-rose-500 border-y border-r border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                        W — Weaknesses
                      </span>
                      <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                        {swot.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="p-4 rounded-xl bg-slate-950 border-l-2 border-amber-400 border-y border-r border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        O — Opportunities
                      </span>
                      <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                        {swot.opportunities.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Threats */}
                    <div className="p-4 rounded-xl bg-slate-950 border-l-2 border-indigo-400 border-y border-r border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                        T — Threats
                      </span>
                      <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                        {swot.threats.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. DECISION MATRIX TAB */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-serif italic text-white flex items-center gap-2 font-bold">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Interactive Weighted Decision Matrix
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Adjust criteria weights (%) and score options (1–10) in real time.
              </p>
            </div>

            <button
              onClick={handleAddCriterion}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Priority</span>
            </button>
          </div>

          {/* TOTAL CALCULATED SCORES BANNER */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decision.options.map((opt) => {
              const totalScore = calculateWeightedTotalScore(opt.id, criteria, scores);
              const isLeader = opt.id === topScoringOptionId;

              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isLeader
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-white border-amber-500/60 shadow-md'
                      : 'bg-slate-950 text-slate-200 border-slate-800'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold ${
                        isLeader ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {isLeader ? '🏆 Matrix Leader' : 'Weighted Total'}
                    </span>
                    <h4 className="font-serif italic text-sm font-bold text-white">
                      {opt.title}
                    </h4>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-xl font-bold ${
                        isLeader ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {totalScore}
                    </span>
                    <span className={isLeader ? 'text-amber-300/80 text-xs' : 'text-slate-400 text-xs'}>
                      {' '}
                      / 10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CRITERIA & SCORES SLIDERS TABLE */}
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
              >
                {/* Criterion Header & Weight Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-serif italic text-white font-bold">
                      {crit.name}
                    </h4>
                    {crit.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{crit.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">Weight:</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={crit.weight}
                        onChange={(e) => handleWeightChange(crit.id, parseInt(e.target.value))}
                        className="w-24 accent-amber-400 cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-amber-400 w-8">
                        {crit.weight}%
                      </span>
                    </div>

                    {criteria.length > 1 && (
                      <button
                        onClick={() => handleRemoveCriterion(crit.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Option Score Sliders for this Criterion */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {decision.options.map((opt) => {
                    const currentScore = scores[opt.id]?.[crit.id] ?? 5;
                    return (
                      <div
                        key={opt.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-xs"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-200 font-serif italic truncate max-w-[180px]">
                            {opt.title}
                          </span>
                          <span className="font-mono text-amber-400 font-bold">
                            {currentScore} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={currentScore}
                          onChange={(e) =>
                            handleScoreChange(opt.id, crit.id, parseInt(e.target.value))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. RISK ANALYSIS TAB */}
      {activeTab === 'risks' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Risk Assessment & Mitigation Strategy
            </h3>
            <span className="text-xs text-slate-400">
              Probability and actionable safeguards
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {decision.risks.map((risk) => {
              const opt = decision.options.find((o) => o.id === risk.optionId);
              return (
                <div
                  key={risk.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                        Option: {opt?.title || 'General'}
                      </span>
                      <h4 className="text-sm font-serif italic text-white mt-1 font-bold">
                        {risk.risk}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                          risk.probability === 'High'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : 'bg-slate-950 text-slate-300 border border-slate-800'
                        }`}
                      >
                        Prob: {risk.probability}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                          risk.impact === 'High'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        Impact: {risk.impact}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-400" /> Recommended Safeguard
                    </span>
                    <p className="text-xs text-slate-200 leading-normal font-medium">
                      {risk.mitigation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. FUTURE SCENARIOS TAB */}
      {activeTab === 'future' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-xs">
            💡 <strong className="text-amber-400">Future Projections:</strong> Plausible trajectories based on trade-off trends — not guaranteed outcomes.
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {decision.scenarios.map((sc, idx) => {
              const opt = decision.options.find((o) => o.id === sc.optionId) || decision.options[idx];
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md"
                >
                  <h4 className="font-serif italic text-base text-white border-b border-slate-800 pb-3 font-bold">
                    {opt?.title || `Option ${idx + 1}`}
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Short-Term (1–6 Months)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {sc.shortTerm}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Long-Term (1–5 Years)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {sc.longTerm}
                      </p>
                    </div>

                    {sc.keyTurningPoint && (
                      <div className="text-[11px] text-amber-300/80 font-mono italic pt-1">
                        Key Turning Point: {sc.keyTurningPoint}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. THINK DEEPER TAB & CHAT */}
      {activeTab === 'thinkDeeper' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="font-serif italic text-xl text-white font-bold">
                  Cognitive Analysis & Blindspot Check
                </h3>
                <p className="text-xs text-slate-300">
                  Uncover hidden assumptions, potential biases, and critical follow-up questions.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Assumptions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Hidden Assumptions
                </span>
                <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.assumptions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Cognitive Biases */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Potential Biases
                </span>
                <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.biases?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Blindspot Questions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Blindspot Questions
                </span>
                <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.blindspotQuestions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Questions to Ask Others */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Questions to Ask Others
                </span>
                <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.questionsToAskOthers?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CHAT BOX WITH AI FOR FOLLOW-UP QUESTIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Follow-up Conversation with Decision AI
            </h4>

            {chatMessages.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      m.role === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium ml-8 shadow-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 mr-8 shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between font-mono text-[10px] opacity-80">
                      <span>{m.role === 'user' ? 'You' : 'The Tiebreaker AI'}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed font-sans">{m.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow-up question (e.g. What if my main assumption about remote work turns out false?)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                disabled={isSendingChat}
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isSendingChat ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                )}
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
