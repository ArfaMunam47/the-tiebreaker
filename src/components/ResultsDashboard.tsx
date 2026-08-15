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
import { ExportReportModal } from './ExportReportModal';
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

  // Export report modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // SWOT interactive state
  const [swotData, setSwotData] = useState(decision.swot || []);
  const [selectedSwotOptionId, setSelectedSwotOptionId] = useState<string>('all');
  const [activeSwotInput, setActiveSwotInput] = useState<{
    optId: string;
    quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
  } | null>(null);
  const [swotInputText, setSwotInputText] = useState('');

  // Follow-up chat state for Think Deeper
  const [chatMessages, setChatMessages] = useState<FollowUpMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  useEffect(() => {
    setCriteria(decision.criteria || []);
    setScores(decision.weightedScores || {});
    setProsConsData(decision.prosCons || []);
    setComparisonRows(decision.comparison || []);
    setSwotData(decision.swot || []);
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
    setIsExportModalOpen(true);
  };

  // SWOT manipulation handlers
  const handleAddSwotBullet = (
    optId: string,
    quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats'
  ) => {
    if (!swotInputText.trim()) {
      setActiveSwotInput(null);
      return;
    }
    const currentSwot = [...(swotData || [])];
    let optSwot = currentSwot.find((s) => s.optionId === optId);
    if (!optSwot) {
      optSwot = {
        optionId: optId,
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      };
      currentSwot.push(optSwot);
    }
    optSwot[quadrant] = [...(optSwot[quadrant] || []), swotInputText.trim()];
    setSwotData(currentSwot);
    setSwotInputText('');
    setActiveSwotInput(null);
    onUpdateDecision({
      ...decision,
      swot: currentSwot,
    });
  };

  const handleDeleteSwotBullet = (
    optId: string,
    quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    index: number
  ) => {
    const currentSwot = [...(swotData || [])];
    const optSwot = currentSwot.find((s) => s.optionId === optId);
    if (optSwot && optSwot[quadrant]) {
      optSwot[quadrant] = optSwot[quadrant].filter((_, i) => i !== index);
      setSwotData(currentSwot);
      onUpdateDecision({
        ...decision,
        swot: currentSwot,
      });
    }
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

  // Losing options and reasons for why other options lost
  const losingOptions = decision.options.filter((o) => o.id !== recommendedOpt?.id);
  const losingOptionsWithReasons = losingOptions.map((opt) => {
    let reason = decision.recommendation?.whyNotOptions?.[opt.id];
    if (!reason && (decision.recommendation as any)?.whyNotOtherOptions) {
      const found = (decision.recommendation as any).whyNotOtherOptions.find((w: any) => w.optionId === opt.id);
      if (found) reason = found.reason;
    }
    if (!reason) {
      reason = `${opt.title} presents greater operational trade-offs and lower alignment with top weighted evaluation criteria compared to the recommended path.`;
    }
    return { option: opt, reason };
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
      <div className="bg-[#FAF8F5] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs print:border-none print:shadow-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/50 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B88E3D]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-950 border border-amber-300 rounded-md">
                Decision Analysis
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {decision.options.length} Options Evaluated • Updated{' '}
                {new Date(decision.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#2C221E] leading-snug">
              {decision.title}
            </h1>

            {/* Recommendation Highlight Pill */}
            {recommendedOpt && (
              <div className="space-y-2">
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#E8E5DF] text-stone-800 text-xs font-medium shadow-2xs">
                  <Award className="w-4 h-4 text-[#B88E3D]" />
                  <span>
                    You Should Choose:{' '}
                    <strong className="font-bold text-[#B88E3D]">{recommendedOpt.title}</strong>
                  </span>
                  <span className="ml-1 text-[11px] font-mono text-[#B88E3D] font-bold">
                    ({decision.recommendation?.confidenceLevel || 'High'} Confidence)
                  </span>
                  {decision.reversibility && (
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[10px] text-stone-700 border border-[#E8E5DF]">
                      ↺ {decision.reversibility}
                    </span>
                  )}
                  {decision.timeHorizon && (
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[10px] text-stone-700 border border-[#E8E5DF]">
                      ⏱ {decision.timeHorizon} horizon
                    </span>
                  )}
                </div>

                {decision.recommendation?.confidenceReason && (
                  <p className="text-xs text-stone-700 bg-white/90 p-2.5 rounded-lg border border-[#E8E5DF] italic">
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
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#FAF7F2] text-stone-800 border-[#E8E5DF] hover:border-[#B88E3D] shadow-2xs'
              }`}
            >
              <Save className="w-4 h-4 text-[#B88E3D]" />
              <span>{savedSuccess ? 'Saved to History!' : 'Save Decision'}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#FAF7F2] text-stone-800 border border-[#E8E5DF] hover:border-[#B88E3D] rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Print or Export PDF / Markdown / HTML"
            >
              <Printer className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            <button
              onClick={onNewDecision}
              className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white bg-[#2C221E] hover:bg-[#3D312B] rounded-lg shadow-xs transition-all cursor-pointer border border-[#2C221E]"
            >
              <Plus className="w-4 h-4 text-[#D4A338] stroke-[3]" />
              <span className="text-[#D4A338]">New Decision</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLARIFYING QUESTIONS BANNER (if available) */}
      {decision.clarifyingQuestions && decision.clarifyingQuestions.length > 0 && (
        <div className="bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-[#B88E3D] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#B88E3D]" />
            <span>Clarifying Context Identified By AI</span>
          </div>
          <p className="text-xs text-stone-600">
            Key questions that sharpen the decision framework:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {decision.clarifyingQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-lg bg-white border border-[#E8E5DF] text-xs space-y-2"
              >
                <p className="font-semibold text-stone-900">{q.question}</p>
                {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.suggestedAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8E5DF] text-[11px] text-stone-700"
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

      {/* NAVIGATION TABS (Mobile Dropdown + Fully Responsive Horizontal Tab Strip) */}
      <div className="sticky top-[65px] z-20 bg-white/95 backdrop-blur-md pt-2.5 pb-4 mb-8 sm:mb-10 border-b border-[#E8E5DF] shadow-xs print:hidden space-y-2.5 max-w-full min-w-0">
        {/* Mobile Dropdown Selector (visible on small mobile screens < 640px) */}
        <div className="sm:hidden px-1">
          <label htmlFor="mobile-tab-select" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Select Analysis Section
          </label>
          <select
            id="mobile-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-stone-900 focus:outline-none focus:border-[#B88E3D] shadow-2xs cursor-pointer"
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
            className="hidden sm:flex p-1.5 rounded-lg bg-white border border-[#E8E5DF] text-stone-700 hover:text-stone-950 hover:bg-[#FAF7F2] shadow-2xs transition-colors shrink-0 cursor-pointer"
            aria-label="Scroll tabs left"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabStripRef}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1.5 px-1.5 max-w-full w-full touch-pan-x border border-[#E8E5DF] bg-[#FAF7F2] rounded-xl shadow-2xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                      ? 'bg-[#2C221E] text-white shadow-2xs font-extrabold border border-[#2C221E]'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D4A338]' : 'text-[#B88E3D]'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollTabs('right')}
            className="hidden sm:flex p-1.5 rounded-lg bg-white border border-[#E8E5DF] text-stone-700 hover:text-stone-950 hover:bg-[#FAF7F2] shadow-2xs transition-colors shrink-0 cursor-pointer"
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
            <div className="md:col-span-2 bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E3D] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B88E3D]" />
                Executive Synthesis
              </h3>
              <p className="text-sm text-stone-800 leading-relaxed font-sans">
                {decision.recommendation?.mainReasons?.join(' ') ||
                  `Analyzing ${decision.options.length} options for "${decision.title}".`}
              </p>

              {/* Priorities Tags */}
              <div className="pt-2 border-t border-[#E8E5DF]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 block mb-2">
                  Priorities Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {decision.userPriorities?.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-[#FAF7F2] text-stone-800 text-xs font-medium border border-[#E8E5DF]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Score Meter Box */}
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B88E3D]">
                  You Should Choose
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  {decision.recommendation?.confidenceLevel || 'High'} Confidence
                </span>
              </div>

              <div>
                <h4 className="font-serif italic text-xl text-stone-900 font-bold">
                  {recommendedOpt?.title}
                </h4>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed line-clamp-3">
                  {recommendedOpt?.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E5DF] space-y-1.5 text-xs">
                <span className="text-stone-500 font-medium">Primary Operational Risk:</span>
                <p className="text-[#B88E3D] font-semibold">
                  {decision.recommendation?.biggestConcern || 'Managing short-term transition.'}
                </p>
              </div>
            </div>
          </div>

          {/* Why Other Options Lost & Reversal Conditions */}
          {(losingOptionsWithReasons.length > 0 || (decision.recommendation?.reversalConditions && decision.recommendation.reversalConditions.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Why Other Options Lost */}
              {losingOptionsWithReasons.length > 0 && (
                <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E3D] flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#B88E3D]" />
                      Why Other Options Lost
                    </h4>
                    <span className="text-[10px] font-mono text-stone-500 font-semibold">
                      {losingOptionsWithReasons.length} {losingOptionsWithReasons.length === 1 ? 'Option' : 'Options'} Evaluated
                    </span>
                  </div>
                  <div className="space-y-3 text-xs">
                    {losingOptionsWithReasons.map(({ option, reason }) => (
                      <div key={option.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-serif italic text-stone-900 font-bold block text-sm">
                            {option.title}
                          </span>
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                            Trade-Off Profile
                          </span>
                        </div>
                        <p className="text-stone-700 leading-relaxed font-sans">{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions that would change the recommendation */}
              {decision.recommendation?.reversalConditions && decision.recommendation.reversalConditions.length > 0 && (
                <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Conditions That Would Flip Recommendation
                    </h4>
                    <span className="text-[10px] font-mono text-rose-600 font-bold">
                      Reversal Triggers
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    {decision.recommendation.reversalConditions.map((cond, idx) => (
                      <li key={idx} className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-stone-800 flex items-start gap-2.5 shadow-2xs">
                        <span className="text-rose-600 font-bold text-sm leading-none">•</span>
                        <span className="leading-relaxed">{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Evidence Items Breakdown (Facts vs Assumptions) */}
          {decision.evidenceItems && decision.evidenceItems.length > 0 && (
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B88E3D]" />
                Evidence & Information Integrity Breakdown
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {decision.evidenceItems.map((item) => {
                  const categoryColors = {
                    FACT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    ASSUMPTION: 'bg-amber-50 text-amber-800 border-amber-200',
                    INTERPRETATION: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    UNKNOWN: 'bg-[#FAF7F2] text-stone-700 border-[#E8E5DF]',
                  };
                  return (
                    <div key={item.id} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                      <p className="text-stone-800 font-medium leading-relaxed">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
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
                    className={`p-6 rounded-2xl border transition-all space-y-4 relative bg-white ${
                      isRecommended || isLeader
                        ? 'border-[#B88E3D] shadow-xs'
                        : 'border-[#E8E5DF] shadow-2xs'
                    }`}
                  >
                    {(isRecommended || isLeader) && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2C221E] text-white rounded-full shadow-2xs border border-[#2C221E]">
                        {isRecommended ? 'Recommended' : 'Top Matrix Score'}
                      </span>
                    )}

                    <div>
                      <h4 className="font-serif italic text-lg text-stone-900 font-bold">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                        {opt.description}
                      </p>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1.5 pt-3 border-t border-[#E8E5DF]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-semibold">Weighted Total</span>
                        <span className="font-mono font-bold text-[#B88E3D] text-sm">
                          {weightedScore} / 10
                        </span>
                      </div>
                      <div className="w-full bg-[#FAF7F2] border border-[#E8E5DF] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#B88E3D] h-full rounded-full transition-all duration-500"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Advantages & Disadvantages
            </h3>
            <span className="text-xs text-stone-500">
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
                  className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
                    <h4 className="font-serif italic text-lg text-stone-900 font-bold">
                      {opt.title}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddProCon(opt.id, 'pro')}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-stone-800 hover:bg-white hover:text-[#B88E3D] border border-[#E8E5DF] rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#B88E3D]" /> Pro
                      </button>
                      <button
                        onClick={() => handleAddProCon(opt.id, 'con')}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-stone-800 hover:bg-white hover:text-[#B88E3D] border border-[#E8E5DF] rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-stone-500" /> Con
                      </button>
                    </div>
                  </div>

                  {/* PROS LIST */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Advantages ({pc.pros.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.pros.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#FAF7F2] border-l-2 border-[#B88E3D] border-y border-r border-[#E8E5DF] text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-stone-500 mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-transparent text-stone-500'
                            }`}
                          >
                            {item.weight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CONS LIST */}
                  <div className="space-y-2 pt-2 border-t border-[#E8E5DF]">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Disadvantages ({pc.cons.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.cons.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#FAF7F2] border-l-2 border-rose-500 border-y border-r border-[#E8E5DF] text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-stone-500 mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-transparent text-stone-500'
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
        <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 sm:p-7 space-y-6 animate-fadeIn shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#B88E3D]" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#B88E3D]">
                  Side-by-Side Decision Comparison Matrix
                </h3>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Comprehensive evaluation of all options across qualitative parameters and weighted priorities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMatrixMarkdown}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  copiedMatrix
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-[#FAF7F2] hover:bg-white text-stone-800 border-[#E8E5DF]'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${copiedMatrix ? 'text-emerald-600' : 'text-stone-500'}`} />
                <span>{copiedMatrix ? 'Copied Markdown!' : 'Copy Table'}</span>
              </button>
            </div>
          </div>

          {/* ADD CUSTOM COMPARISON CRITERION INPUT */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={newCompareCriterion}
              onChange={(e) => setNewCompareCriterion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCompareCriterion()}
              placeholder="Add custom evaluation criterion (e.g., Work-Life Balance, Time-to-ROI, Stress Impact)..."
              className="flex-1 w-full px-3.5 py-2 text-xs bg-white border border-[#E8E5DF] rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#B88E3D]"
            />
            <button
              type="button"
              onClick={handleAddCompareCriterion}
              disabled={!newCompareCriterion.trim()}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-[#2C221E] hover:bg-[#3D312B] disabled:opacity-40 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5 border border-[#2C221E]"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4A338] stroke-[3]" />
              <span className="text-[#D4A338]">Add Criterion</span>
            </button>
          </div>

          {/* MAIN MATRIX TABLE */}
          <div className="overflow-x-auto rounded-xl border border-[#E8E5DF]">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8E5DF] text-[10px] uppercase font-bold text-stone-600 tracking-wider">
                  <th className="py-3.5 px-4 min-w-[180px]">Evaluation Criterion</th>
                  {decision.options.map((opt) => {
                    const isRecommended = opt.id === decision.recommendation?.recommendedOptionId;
                    const isTopScore = opt.id === topScoringOptionId;
                    return (
                      <th key={opt.id} className="py-3.5 px-4 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif italic text-xs text-stone-900 font-bold">
                              {opt.title}
                            </span>
                          </div>
                          {(isRecommended || isTopScore) && (
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#2C221E] text-white rounded">
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
              <tbody className="divide-y divide-[#E8E5DF] text-xs text-stone-800">
                {effectiveComparisonRows.map((row, rowIdx) => {
                  return (
                    <tr key={rowIdx} className="hover:bg-[#FAF7F2]/80 transition-colors">
                      <td className="py-3.5 px-4 font-serif italic text-[#B88E3D] font-semibold border-r border-[#E8E5DF] bg-[#FAF7F2]">
                        {row.criterion}
                      </td>
                      {decision.options.map((opt, optIdx) => {
                        const cellInfo = getOptionComparisonInfo(row, opt, optIdx);
                        return (
                          <td
                            key={opt.id}
                            className={`py-3.5 px-4 border-r border-[#E8E5DF] ${
                              cellInfo.isLeader ? 'bg-amber-50/70' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`font-medium ${
                                  cellInfo.isLeader
                                    ? 'font-bold text-[#B88E3D]'
                                    : 'text-stone-700'
                                }`}
                              >
                                {cellInfo.val}
                              </span>
                              {cellInfo.isLeader && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-[#2C221E] text-white rounded shrink-0 shadow-2xs">
                                  Leader
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3.5 px-4 text-stone-500 text-[11px] leading-relaxed italic bg-[#FAF7F2]/50">
                        {row.note || 'Balanced evaluation across options.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER SUMMARY */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <Award className="w-4 h-4 text-[#B88E3D] shrink-0" />
              <span>
                Compare matrix integrates both qualitative AI synthesis and user-customized matrix weights.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className="px-3 py-1.5 text-xs font-semibold text-[#B88E3D] hover:text-stone-900 bg-white border border-[#E8E5DF] rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              Adjust Weighted Matrix →
            </button>
          </div>
        </div>
      )}

      {/* 4. SWOT TAB */}
      {activeTab === 'swot' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header and Option Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
            <div>
              <h3 className="text-base font-serif italic text-stone-900 flex items-center gap-2 font-bold">
                <Grid2X2 className="w-4 h-4 text-[#B88E3D]" />
                Interactive SWOT Strategic Matrix
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Analyze internal strengths/weaknesses and external opportunities/threats. Add or edit strategic points.
              </p>
            </div>

            {/* Option Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedSwotOptionId('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedSwotOptionId === 'all'
                    ? 'bg-[#2C221E] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Options
              </button>
              {decision.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSwotOptionId(opt.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedSwotOptionId === opt.id
                      ? 'bg-[#2C221E] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {decision.options
              .filter((opt) => selectedSwotOptionId === 'all' || selectedSwotOptionId === opt.id)
              .map((opt) => {
                const optSwot = (swotData || []).find((s) => s.optionId === opt.id) || {
                  optionId: opt.id,
                  strengths: [`Direct alignment with stated goals for ${opt.title}`],
                  weaknesses: [`Requires dedicated transition focus`],
                  opportunities: [`Compounding career and strategic upside`],
                  threats: [`Execution velocity risk`],
                };

                const isRecommended = opt.id === decision.recommendation?.recommendedOptionId;

                return (
                  <div
                    key={opt.id}
                    className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xs"
                  >
                    {/* Option Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5DF] pb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif italic text-lg text-stone-900 font-bold">
                          {opt.title} — Strategic SWOT Profile
                        </h4>
                        {isRecommended && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#2C221E] text-white rounded">
                            ★ Primary Recommendation
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-[#FAF7F2] text-stone-700 border border-[#E8E5DF] self-start sm:self-auto">
                        2x2 Strategic Matrix
                      </span>
                    </div>

                    {/* 2x2 SWOT Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* S — Strengths (Internal / Positive) */}
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border-l-3 border-emerald-600 border-y border-r border-[#E8E5DF] space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]/70">
                            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> S — Internal Strengths
                            </span>
                            <span className="text-[10px] text-stone-600 font-medium">Internal Advantage</span>
                          </div>
                          <ul className="text-xs text-stone-800 space-y-2 mt-3 font-medium">
                            {optSwot.strengths?.map((s, i) => (
                              <li key={i} className="flex items-start justify-between gap-2 group">
                                <span className="flex-1 leading-relaxed">• {s}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSwotBullet(opt.id, 'strengths', i)}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-0.5 transition-all cursor-pointer"
                                  title="Delete point"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Add bullet input */}
                        {activeSwotInput?.optId === opt.id && activeSwotInput?.quadrant === 'strengths' ? (
                          <div className="pt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={swotInputText}
                              onChange={(e) => setSwotInputText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSwotBullet(opt.id, 'strengths')}
                              placeholder="Type strength and press Enter..."
                              autoFocus
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'strengths')}
                              className="px-2.5 py-1.5 text-xs font-bold bg-[#2C221E] text-white rounded-lg cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSwotInput(null)}
                              className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSwotInput({ optId: opt.id, quadrant: 'strengths' });
                              setSwotInputText('');
                            }}
                            className="pt-2 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer self-start"
                          >
                            <Plus className="w-3 h-3" /> Add Strength
                          </button>
                        )}
                      </div>

                      {/* W — Weaknesses (Internal / Negative) */}
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border-l-3 border-rose-500 border-y border-r border-[#E8E5DF] space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]/70">
                            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> W — Internal Weaknesses
                            </span>
                            <span className="text-[10px] text-stone-600 font-medium">Internal Limitation</span>
                          </div>
                          <ul className="text-xs text-stone-800 space-y-2 mt-3 font-medium">
                            {optSwot.weaknesses?.map((w, i) => (
                              <li key={i} className="flex items-start justify-between gap-2 group">
                                <span className="flex-1 leading-relaxed">• {w}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSwotBullet(opt.id, 'weaknesses', i)}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-0.5 transition-all cursor-pointer"
                                  title="Delete point"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Add bullet input */}
                        {activeSwotInput?.optId === opt.id && activeSwotInput?.quadrant === 'weaknesses' ? (
                          <div className="pt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={swotInputText}
                              onChange={(e) => setSwotInputText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSwotBullet(opt.id, 'weaknesses')}
                              placeholder="Type weakness and press Enter..."
                              autoFocus
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'weaknesses')}
                              className="px-2.5 py-1.5 text-xs font-bold bg-[#2C221E] text-white rounded-lg cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSwotInput(null)}
                              className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSwotInput({ optId: opt.id, quadrant: 'weaknesses' });
                              setSwotInputText('');
                            }}
                            className="pt-2 text-[11px] font-semibold text-rose-800 hover:text-rose-950 flex items-center gap-1 cursor-pointer self-start"
                          >
                            <Plus className="w-3 h-3" /> Add Weakness
                          </button>
                        )}
                      </div>

                      {/* O — Opportunities (External / Positive) */}
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border-l-3 border-[#B88E3D] border-y border-r border-[#E8E5DF] space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]/70">
                            <span className="text-[11px] font-bold text-[#8A631E] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#B88E3D]" /> O — External Opportunities
                            </span>
                            <span className="text-[10px] text-stone-600 font-medium">Market / Upside Potential</span>
                          </div>
                          <ul className="text-xs text-stone-800 space-y-2 mt-3 font-medium">
                            {optSwot.opportunities?.map((o, i) => (
                              <li key={i} className="flex items-start justify-between gap-2 group">
                                <span className="flex-1 leading-relaxed">• {o}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSwotBullet(opt.id, 'opportunities', i)}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-0.5 transition-all cursor-pointer"
                                  title="Delete point"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Add bullet input */}
                        {activeSwotInput?.optId === opt.id && activeSwotInput?.quadrant === 'opportunities' ? (
                          <div className="pt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={swotInputText}
                              onChange={(e) => setSwotInputText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSwotBullet(opt.id, 'opportunities')}
                              placeholder="Type opportunity and press Enter..."
                              autoFocus
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'opportunities')}
                              className="px-2.5 py-1.5 text-xs font-bold bg-[#2C221E] text-white rounded-lg cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSwotInput(null)}
                              className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSwotInput({ optId: opt.id, quadrant: 'opportunities' });
                              setSwotInputText('');
                            }}
                            className="pt-2 text-[11px] font-semibold text-[#8A631E] hover:text-[#5B4012] flex items-center gap-1 cursor-pointer self-start"
                          >
                            <Plus className="w-3 h-3" /> Add Opportunity
                          </button>
                        )}
                      </div>

                      {/* T — Threats & Risks (External / Negative) */}
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border-l-3 border-amber-600 border-y border-r border-[#E8E5DF] space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]/70">
                            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-amber-700" /> T — External Threats & Risks
                            </span>
                            <span className="text-[10px] text-stone-600 font-medium">External Risk</span>
                          </div>
                          <ul className="text-xs text-stone-800 space-y-2 mt-3 font-medium">
                            {optSwot.threats?.map((t, i) => (
                              <li key={i} className="flex items-start justify-between gap-2 group">
                                <span className="flex-1 leading-relaxed">• {t}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSwotBullet(opt.id, 'threats', i)}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-0.5 transition-all cursor-pointer"
                                  title="Delete point"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Add bullet input */}
                        {activeSwotInput?.optId === opt.id && activeSwotInput?.quadrant === 'threats' ? (
                          <div className="pt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={swotInputText}
                              onChange={(e) => setSwotInputText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSwotBullet(opt.id, 'threats')}
                              placeholder="Type threat/risk and press Enter..."
                              autoFocus
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'threats')}
                              className="px-2.5 py-1.5 text-xs font-bold bg-[#2C221E] text-white rounded-lg cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSwotInput(null)}
                              className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSwotInput({ optId: opt.id, quadrant: 'threats' });
                              setSwotInputText('');
                            }}
                            className="pt-2 text-[11px] font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer self-start"
                          >
                            <Plus className="w-3 h-3" /> Add Threat / Risk
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Strategic Synthesis Card */}
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88E3D] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#B88E3D]" /> Strategic Takeaway for {opt.title}
                      </span>
                      <p className="text-stone-700 leading-relaxed font-medium">
                        {isRecommended
                          ? `You should choose ${opt.title} by leveraging its core Strengths (${optSwot.strengths?.[0] || 'primary advantages'}) to seize high-upside Opportunities, while actively setting safeguards against identified Weaknesses and Threats.`
                          : `If executing ${opt.title}, deploy strict risk controls to ensure its Weaknesses do not compound under external Threats.`}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. DECISION MATRIX TAB */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
            <div>
              <h3 className="text-base font-serif italic text-stone-900 flex items-center gap-2 font-bold">
                <SlidersHorizontal className="w-4 h-4 text-[#B88E3D]" />
                Interactive Weighted Decision Matrix
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Adjust criteria weights (%) and score options (1–10) in real time to test decision sensitivity.
              </p>
            </div>

            <button
              onClick={handleAddCriterion}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#2C221E] hover:bg-[#3D312B] text-white border border-[#2C221E] rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4A338] stroke-[3]" />
              <span className="text-[#D4A338]">Add Priority</span>
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
                  className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                    isLeader
                      ? 'bg-amber-50/70 text-stone-900 border-[#B88E3D] shadow-xs'
                      : 'bg-[#FAF7F2] text-stone-800 border-[#E8E5DF]'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold ${
                        isLeader ? 'text-[#B88E3D]' : 'text-stone-500'
                      }`}
                    >
                      {isLeader ? '★ Matrix Leader' : 'Weighted Total'}
                    </span>
                    <h4 className="font-serif italic text-base font-bold text-stone-900">
                      {opt.title}
                    </h4>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-2xl font-bold ${
                        isLeader ? 'text-[#B88E3D]' : 'text-stone-900'
                      }`}
                    >
                      {totalScore}
                    </span>
                    <span className="text-stone-500 text-xs font-semibold"> / 10</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CRITERIA & SCORES SLIDERS TABLE */}
          <div className="space-y-4 pt-4 border-t border-[#E8E5DF]">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-4 shadow-2xs"
              >
                {/* Criterion Header & Weight Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DF] pb-3">
                  <div>
                    <h4 className="text-sm font-serif italic text-stone-900 font-bold">
                      {crit.name}
                    </h4>
                    {crit.description && (
                      <p className="text-xs text-stone-600 mt-0.5">{crit.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E8E5DF]">
                      <span className="text-xs text-stone-500 font-mono">Weight:</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={crit.weight}
                        onChange={(e) => handleWeightChange(crit.id, parseInt(e.target.value))}
                        className="w-24 accent-[#B88E3D] cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-[#B88E3D] w-8">
                        {crit.weight}%
                      </span>
                    </div>

                    {criteria.length > 1 && (
                      <button
                        onClick={() => handleRemoveCriterion(crit.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer rounded-md hover:bg-rose-50"
                        title="Remove Criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Option Score Sliders for this Criterion */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {decision.options.map((opt) => {
                    const currentScore = scores[opt.id]?.[crit.id] ?? 5;
                    return (
                      <div
                        key={opt.id}
                        className="p-3.5 rounded-xl bg-white border border-[#E8E5DF] space-y-2 shadow-2xs"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-900 font-serif italic truncate max-w-[180px] font-semibold">
                            {opt.title}
                          </span>
                          <span className="font-mono text-[#B88E3D] font-bold">
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
                          className="w-full accent-[#B88E3D] cursor-pointer"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E3D] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B88E3D]" />
              Risk Assessment & Mitigation Strategy
            </h3>
            <span className="text-xs text-stone-500">
              Probability and actionable safeguards
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {decision.risks.map((risk) => {
              const opt = decision.options.find((o) => o.id === risk.optionId);
              return (
                <div
                  key={risk.id}
                  className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#B88E3D] font-bold uppercase">
                        Option: {opt?.title || 'General'}
                      </span>
                      <h4 className="text-sm font-serif italic text-stone-900 mt-1 font-bold">
                        {risk.risk}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                          risk.probability === 'High'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-[#FAF7F2] text-stone-700 border border-[#E8E5DF]'
                        }`}
                      >
                        Prob: {risk.probability}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                          risk.impact === 'High'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-[#FAF7F2] text-stone-700 border border-[#E8E5DF]'
                        }`}
                      >
                        Impact: {risk.impact}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-1">
                    <span className="text-[10px] font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#B88E3D]" /> Recommended Safeguard
                    </span>
                    <p className="text-xs text-stone-800 leading-normal font-medium">
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
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-stone-700 shadow-2xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B88E3D] shrink-0" />
            <span>
              <strong className="text-stone-900 font-bold">Future Projections:</strong> Plausible trajectories based on trade-off models to stress-test your decision horizon.
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {decision.scenarios.map((sc, idx) => {
              const opt = decision.options.find((o) => o.id === sc.optionId) || decision.options[idx];
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
                    <h4 className="font-serif italic text-base text-stone-900 font-bold">
                      {opt?.title || `Option ${idx + 1}`}
                    </h4>
                    <span className="text-[10px] font-mono text-stone-500 font-semibold uppercase">
                      Timeline Projection
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-1">
                      <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B88E3D]" /> Short-Term (1–6 Months)
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        {sc.shortTerm}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-1">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#B88E3D]" /> Long-Term (1–5 Years)
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        {sc.longTerm}
                      </p>
                    </div>

                    {sc.keyTurningPoint && (
                      <div className="text-[11px] text-[#B88E3D] font-mono italic pt-1 flex items-center gap-1">
                        <span>Key Turning Point:</span>
                        <span className="font-bold">{sc.keyTurningPoint}</span>
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
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center gap-3 border-b border-[#E8E5DF] pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#2C221E] text-white flex items-center justify-center shrink-0 border border-[#2C221E]">
                <Compass className="w-5 h-5 text-[#D4A338]" />
              </div>
              <div>
                <h3 className="font-serif italic text-xl text-stone-900 font-bold">
                  Cognitive Analysis & Blindspot Check
                </h3>
                <p className="text-xs text-stone-600">
                  Uncover hidden assumptions, potential biases, and critical follow-up questions.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Assumptions */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#B88E3D]" /> Hidden Assumptions
                </span>
                <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.assumptions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Cognitive Biases */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Potential Biases
                </span>
                <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.biases?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Blindspot Questions */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#B88E3D]" /> Blindspot Questions
                </span>
                <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.blindspotQuestions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Questions to Ask Others */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#B88E3D]" /> Questions to Ask Others
                </span>
                <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.questionsToAskOthers?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CHAT BOX WITH AI FOR FOLLOW-UP QUESTIONS */}
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E3D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                Follow-up Conversation with Decision AI
              </h4>
              <span className="text-[10px] font-mono text-stone-500 font-semibold">
                Interactive Advisor
              </span>
            </div>

            {chatMessages.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      m.role === 'user'
                        ? 'bg-[#2C221E] text-white font-medium ml-8 shadow-2xs'
                        : 'bg-white border border-[#E8E5DF] text-stone-900 mr-8 shadow-2xs'
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#B88E3D]"
                disabled={isSendingChat}
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#2C221E] hover:bg-[#3D312B] text-white font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer border border-[#2C221E]"
              >
                {isSendingChat ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A338]" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-[#D4A338] stroke-[2.5]" />
                )}
                <span className="text-[#D4A338]">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT REPORT MODAL */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        decision={decision}
      />
    </div>
  );
};
