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
  Download,
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
          history: chatMessages,
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
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'prosCons', label: 'Pros & Cons', icon: FileText },
    { id: 'compare', label: 'Compare Choices', icon: Table },
    { id: 'swot', label: 'Strengths & Weaknesses', icon: Grid2X2 },
    { id: 'matrix', label: 'Score Matrix', icon: SlidersHorizontal },
    { id: 'risks', label: 'Risks & Solutions', icon: Shield },
    { id: 'future', label: 'Future Scenarios', icon: Clock },
    { id: 'thinkDeeper', label: 'Ask Questions', icon: Compass },
  ];

  return (
    <div className="w-full space-y-8 animate-fadeIn print:px-0 print:py-0">
      {/* HEADER BANNER */}
      <div className="skeuo-card rounded-2xl p-6 sm:p-8 relative overflow-hidden print:border-none print:shadow-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/40 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B88E3D]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-amber-100/90 text-amber-950 border border-amber-300/80 rounded-md shadow-2xs">
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
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl skeuo-card text-stone-800 text-xs font-medium">
                  <Award className="w-4 h-4 text-[#B88E3D]" />
                  <span>
                    You Should Choose:{' '}
                    <strong className="font-bold text-[#B88E3D]">{recommendedOpt.title}</strong>
                  </span>
                  <span className="ml-1 text-[11px] font-mono text-[#B88E3D] font-bold">
                    ({decision.recommendation?.confidenceLevel || 'High'} Confidence)
                  </span>
                  {decision.reversibility && (
                    <span className="px-2 py-0.5 rounded-md skeuo-well text-[10px] text-stone-700">
                      ↺ {decision.reversibility}
                    </span>
                  )}
                  {decision.timeHorizon && (
                    <span className="px-2 py-0.5 rounded-md skeuo-well text-[10px] text-stone-700">
                      ⏱ {decision.timeHorizon} horizon
                    </span>
                  )}
                </div>

                {decision.recommendation?.confidenceReason && (
                  <p className="text-xs text-stone-700 skeuo-well p-3 rounded-xl italic leading-relaxed">
                    💡 <strong>Why we are confident:</strong> {decision.recommendation.confidenceReason}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 print:hidden w-full sm:w-auto pt-2 sm:pt-0">
            <button
              onClick={handleSaveClick}
              className={`flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer w-full sm:w-auto ${
                savedSuccess
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                  : 'skeuo-btn-secondary text-stone-800'
              }`}
            >
              <Save className="w-4 h-4 text-[#B88E3D]" />
              <span>{savedSuccess ? 'Saved!' : 'Save Decision'}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="skeuo-btn-secondary flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs font-bold uppercase tracking-wider text-stone-800 rounded-xl transition-all cursor-pointer hover:border-[#B88E3D] w-full sm:w-auto"
              title="Save complete decision report as PDF"
            >
              <Download className="w-4 h-4 text-[#B88E3D]" />
              <span>Save as PDF</span>
            </button>

            <button
              onClick={onNewDecision}
              className="skeuo-btn-primary flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs font-extrabold uppercase tracking-wider text-white rounded-xl transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 text-[#D4A338] stroke-[3]" />
              <span className="text-[#D4A338]">New Decision</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLARIFYING QUESTIONS BANNER (if available) */}
      {decision.clarifyingQuestions && decision.clarifyingQuestions.length > 0 && (
        <div className="skeuo-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#B88E3D] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#B88E3D]" />
            <span>Helpful Questions & Context</span>
          </div>
          <p className="text-xs text-stone-600">
            Key points considered for your decision:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {decision.clarifyingQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl skeuo-well text-xs space-y-2"
              >
                <p className="font-semibold text-stone-900">{q.question}</p>
                {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.suggestedAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg skeuo-card text-[11px] text-stone-700"
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
      <div className="sticky top-[60px] z-20 bg-[#F7F5F0]/95 backdrop-blur-md pt-2 pb-3 mb-6 sm:mb-8 border-b border-[#E0D9CC] shadow-xs print:hidden space-y-2 max-w-full min-w-0">
        {/* Mobile Dropdown Selector (visible on small mobile screens < 640px) */}
        <div className="sm:hidden px-1">
          <label htmlFor="mobile-tab-select" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Select Analysis Section
          </label>
          <select
            id="mobile-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl skeuo-well text-stone-900 focus:outline-none focus:border-[#B88E3D] cursor-pointer"
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
            className="hidden sm:flex p-2 rounded-xl skeuo-btn-secondary text-stone-700 hover:text-stone-950 transition-colors shrink-0 cursor-pointer"
            aria-label="Scroll tabs left"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabStripRef}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1.5 px-1.5 max-w-full w-full touch-pan-x skeuo-well rounded-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                      ? 'skeuo-btn-primary text-white font-extrabold shadow-sm'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-white/80 border border-transparent'
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
            className="hidden sm:flex p-2 rounded-xl skeuo-btn-secondary text-stone-700 hover:text-stone-950 transition-colors shrink-0 cursor-pointer"
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
            <div className="md:col-span-2 skeuo-card rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E3D] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B88E3D]" />
                Executive Synthesis
              </h3>
              
              {decision.recommendation?.mainReasons && decision.recommendation.mainReasons.length > 0 ? (
                <div className="space-y-2">
                  <ul className="space-y-2 text-sm text-stone-800">
                    {decision.recommendation.mainReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#B88E3D] font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>

                  {decision.recommendation?.tradeOff && (
                    <div className="p-3.5 rounded-xl skeuo-well text-xs text-stone-700 mt-2">
                      <strong className="text-stone-900 font-semibold">Key Trade-off: </strong>
                      {decision.recommendation.tradeOff}
                    </div>
                  )}

                  {decision.recommendation?.bottomLine && (
                    <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs text-stone-800 font-medium mt-2 shadow-2xs">
                      <strong className="text-amber-950 font-semibold">Bottom Line: </strong>
                      {decision.recommendation.bottomLine}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-800 leading-relaxed font-sans">
                  {`Evaluating ${decision.options.length} options for "${decision.title}".`}
                </p>
              )}

              {/* Priorities Tags */}
              <div className="pt-3 border-t border-[#E0D9CC]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 block mb-2">
                  Priorities Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {decision.userPriorities?.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl skeuo-card text-stone-800 text-xs font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Score Meter Box */}
            <div className="skeuo-card rounded-2xl p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B88E3D]">
                  You Should Choose
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300/80 font-bold shadow-2xs">
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

              <div className="pt-3 border-t border-[#E0D9CC] space-y-1.5 text-xs">
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
                <div className="skeuo-card rounded-2xl p-6 space-y-4">
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
                      <div key={option.id} className="p-4 rounded-xl skeuo-well space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif italic text-stone-900 font-bold block text-sm">
                            {option.title}
                          </span>
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md skeuo-card text-stone-700">
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
                <div className="skeuo-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Conditions That Would Flip Recommendation
                    </h4>
                    <span className="text-[10px] font-mono text-rose-700 font-bold bg-rose-100/90 px-2 py-0.5 rounded-full border border-rose-300/80 shadow-2xs">
                      Reversal Triggers
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    {decision.recommendation.reversalConditions.map((cond, idx) => (
                      <li key={idx} className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/90 text-stone-800 flex items-start gap-2.5 shadow-2xs">
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
            <div className="skeuo-card rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B88E3D]" />
                Evidence & Information Integrity Breakdown
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {decision.evidenceItems.map((item) => {
                  const categoryColors = {
                    FACT: 'bg-emerald-50 text-emerald-800 border-emerald-300/80 shadow-2xs',
                    ASSUMPTION: 'bg-amber-50 text-amber-900 border-amber-300/80 shadow-2xs',
                    INTERPRETATION: 'bg-indigo-50 text-indigo-900 border-indigo-300/80 shadow-2xs',
                    UNKNOWN: 'skeuo-card text-stone-700',
                  };
                  return (
                    <div key={item.id} className="p-3.5 rounded-xl skeuo-well space-y-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${categoryColors[item.category]}`}>
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
                    className={`p-6 rounded-2xl transition-all space-y-4 relative ${
                      isRecommended || isLeader
                        ? 'skeuo-card border-[#B88E3D]/60'
                        : 'skeuo-card'
                    }`}
                  >
                    {(isRecommended || isLeader) && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider skeuo-btn-primary text-white rounded-full">
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
                    <div className="space-y-1.5 pt-3 border-t border-[#E0D9CC]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-semibold">Weighted Total</span>
                        <span className="font-mono font-bold text-[#B88E3D] text-sm">
                          {weightedScore} / 10
                        </span>
                      </div>
                      <div className="w-full skeuo-well h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#B88E3D] h-full rounded-full transition-all duration-500 shadow-2xs"
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
                  className="skeuo-card rounded-2xl p-6 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#E0D9CC] pb-3">
                    <h4 className="font-serif italic text-lg text-stone-900 font-bold">
                      {opt.title}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddProCon(opt.id, 'pro')}
                        className="skeuo-btn-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-800 hover:text-[#B88E3D] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#B88E3D]" /> Pro
                      </button>
                      <button
                        onClick={() => handleAddProCon(opt.id, 'con')}
                        className="skeuo-btn-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-800 hover:text-[#B88E3D] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
                          className="p-3.5 rounded-xl skeuo-well border-l-4 border-l-[#B88E3D] text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-stone-500 mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs'
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
                  <div className="space-y-2 pt-3 border-t border-[#E0D9CC]">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Disadvantages ({pc.cons.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.cons.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl skeuo-well border-l-4 border-l-rose-500 text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-stone-900">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-stone-500 mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-rose-100 text-rose-950 border border-rose-300 shadow-2xs'
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
        <div className="skeuo-card rounded-2xl p-5 sm:p-7 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0D9CC] pb-4">
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
                className={`skeuo-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  copiedMatrix
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'text-stone-800'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${copiedMatrix ? 'text-emerald-600' : 'text-stone-500'}`} />
                <span>{copiedMatrix ? 'Copied Markdown!' : 'Copy Table'}</span>
              </button>
            </div>
          </div>

          {/* ADD CUSTOM COMPARISON CRITERION INPUT */}
          <div className="p-3.5 rounded-xl skeuo-well flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={newCompareCriterion}
              onChange={(e) => setNewCompareCriterion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCompareCriterion()}
              placeholder="Add custom evaluation criterion (e.g., Work-Life Balance, Time-to-ROI, Stress Impact)..."
              className="flex-1 w-full px-3.5 py-2.5 text-xs skeuo-input rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#B88E3D]"
            />
            <button
              type="button"
              onClick={handleAddCompareCriterion}
              disabled={!newCompareCriterion.trim()}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white skeuo-btn-primary disabled:opacity-40 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4A338] stroke-[3]" />
              <span className="text-[#D4A338]">Add Criterion</span>
            </button>
          </div>

          {/* MOBILE STACKED CARDS VIEW (Clean, No Clipping, Full Width Responsive) */}
          <div className="space-y-4 md:hidden">
            {effectiveComparisonRows.map((row, rowIdx) => {
              return (
                <div
                  key={rowIdx}
                  className="p-4 rounded-xl skeuo-well border border-[#E0D9CC] space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CC]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#B88E3D] shrink-0" />
                      <h4 className="font-serif italic font-bold text-stone-900 text-sm">
                        {row.criterion}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {decision.options.map((opt, optIdx) => {
                      const cellInfo = getOptionComparisonInfo(row, opt, optIdx);
                      const isRecommended =
                        opt.id === decision.recommendation?.recommendedOptionId;
                      const isTopScore = opt.id === topScoringOptionId;

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-all ${
                            cellInfo.isLeader
                              ? 'bg-amber-50/90 border border-amber-300/90 shadow-2xs'
                              : 'skeuo-card border border-stone-200/90'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif italic font-bold text-stone-900 text-xs">
                                {opt.title}
                              </span>
                              {isRecommended && (
                                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase skeuo-btn-primary text-[#D4A338] rounded">
                                  ★ Rec
                                </span>
                              )}
                              {isTopScore && !isRecommended && (
                                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase skeuo-badge text-stone-700 rounded">
                                  Top Score
                                </span>
                              )}
                            </div>
                            <p
                              className={`mt-1 text-xs leading-snug ${
                                cellInfo.isLeader
                                  ? 'text-amber-950 font-bold'
                                  : 'text-stone-700 font-medium'
                              }`}
                            >
                              {cellInfo.val}
                            </p>
                          </div>

                          {cellInfo.isLeader && (
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase skeuo-btn-primary text-white rounded-md shrink-0 shadow-2xs">
                              Leader
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {row.note && (
                    <div className="pt-2 border-t border-[#E0D9CC]/70 text-[11px] text-stone-600 italic leading-relaxed">
                      <strong className="text-stone-700 not-italic font-semibold">Note: </strong>
                      {row.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP MATRIX TABLE */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#E0D9CC] shadow-xs">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#EFECE6] border-b border-[#E0D9CC] text-[10px] uppercase font-bold text-stone-600 tracking-wider">
                  <th className="py-3.5 px-4 min-w-[170px]">Evaluation Criterion</th>
                  {decision.options.map((opt) => {
                    const isRecommended = opt.id === decision.recommendation?.recommendedOptionId;
                    const isTopScore = opt.id === topScoringOptionId;
                    return (
                      <th key={opt.id} className="py-3.5 px-4 min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif italic text-xs text-stone-900 font-bold">
                              {opt.title}
                            </span>
                          </div>
                          {(isRecommended || isTopScore) && (
                            <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase skeuo-btn-primary text-white rounded-md">
                              {isRecommended ? '★ Recommended' : 'Top Matrix Score'}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-3.5 px-4 min-w-[190px]">Trade-Off & Guidance Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CC] text-xs text-stone-800">
                {effectiveComparisonRows.map((row, rowIdx) => {
                  return (
                    <tr key={rowIdx} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4 font-serif italic text-[#B88E3D] font-semibold border-r border-[#E0D9CC] bg-[#F7F5F0]">
                        {row.criterion}
                      </td>
                      {decision.options.map((opt, optIdx) => {
                        const cellInfo = getOptionComparisonInfo(row, opt, optIdx);
                        return (
                          <td
                            key={opt.id}
                            className={`py-3.5 px-4 border-r border-[#E0D9CC] ${
                              cellInfo.isLeader ? 'bg-amber-50/80 font-semibold' : 'bg-white'
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
                                <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase skeuo-btn-primary text-white rounded shrink-0">
                                  Leader
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3.5 px-4 text-stone-500 text-[11px] leading-relaxed italic bg-[#F7F5F0]/60">
                        {row.note || 'Balanced evaluation across options.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER SUMMARY */}
          <div className="p-4 rounded-xl skeuo-well flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <Award className="w-4 h-4 text-[#B88E3D] shrink-0" />
              <span>
                Compare matrix integrates both qualitative AI synthesis and user-customized matrix weights.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className="skeuo-btn-secondary px-3 py-1.5 text-xs font-semibold text-[#B88E3D] hover:text-stone-900 rounded-xl transition-colors shrink-0 cursor-pointer"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0D9CC] pb-4">
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
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 skeuo-well rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedSwotOptionId('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedSwotOptionId === 'all'
                    ? 'skeuo-btn-primary text-white shadow-2xs font-bold'
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
                      ? 'skeuo-btn-primary text-white shadow-2xs font-bold'
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
                    className="skeuo-card rounded-2xl p-6 sm:p-7 space-y-6"
                  >
                    {/* Option Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0D9CC] pb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif italic text-lg text-stone-900 font-bold">
                          {opt.title} — Strategic SWOT Profile
                        </h4>
                        {isRecommended && (
                          <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase skeuo-btn-primary text-white rounded-md">
                            ★ Primary Recommendation
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md skeuo-well text-stone-700 self-start sm:self-auto">
                        2x2 Strategic Matrix
                      </span>
                    </div>

                    {/* 2x2 SWOT Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* S — Strengths (Internal / Positive) */}
                      <div className="p-4 rounded-xl skeuo-well border-l-4 border-l-emerald-600 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CC]/70">
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
                              className="flex-1 px-3 py-1.5 text-xs skeuo-input rounded-xl focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'strengths')}
                              className="px-3 py-1.5 text-xs font-bold skeuo-btn-primary text-white rounded-xl cursor-pointer"
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
                      <div className="p-4 rounded-xl skeuo-well border-l-4 border-l-rose-500 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CC]/70">
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
                              className="flex-1 px-3 py-1.5 text-xs skeuo-input rounded-xl focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'weaknesses')}
                              className="px-3 py-1.5 text-xs font-bold skeuo-btn-primary text-white rounded-xl cursor-pointer"
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
                      <div className="p-4 rounded-xl skeuo-well border-l-4 border-l-[#B88E3D] space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CC]/70">
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
                              className="flex-1 px-3 py-1.5 text-xs skeuo-input rounded-xl focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'opportunities')}
                              className="px-3 py-1.5 text-xs font-bold skeuo-btn-primary text-white rounded-xl cursor-pointer"
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
                      <div className="p-4 rounded-xl skeuo-well border-l-4 border-l-amber-600 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CC]/70">
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
                              className="flex-1 px-3 py-1.5 text-xs skeuo-input rounded-xl focus:outline-none focus:border-[#B88E3D]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSwotBullet(opt.id, 'threats')}
                              className="px-3 py-1.5 text-xs font-bold skeuo-btn-primary text-white rounded-xl cursor-pointer"
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
                    <div className="p-4 rounded-xl skeuo-well space-y-2 text-xs">
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
        <div className="skeuo-card rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0D9CC] pb-4">
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
              className="skeuo-btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
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
                  className={`p-5 rounded-2xl flex items-center justify-between transition-all ${
                    isLeader
                      ? 'skeuo-card border-[#B88E3D]/80 bg-amber-50/60'
                      : 'skeuo-well'
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
          <div className="space-y-4 pt-4 border-t border-[#E0D9CC]">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="p-5 rounded-2xl skeuo-well space-y-4"
              >
                {/* Criterion Header & Weight Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0D9CC] pb-3">
                  <div>
                    <h4 className="text-sm font-serif italic text-stone-900 font-bold">
                      {crit.name}
                    </h4>
                    {crit.description && (
                      <p className="text-xs text-stone-600 mt-0.5">{crit.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 skeuo-card px-3 py-1.5 rounded-xl">
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
                        className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50/80"
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
                        className="p-3.5 rounded-xl skeuo-card space-y-2"
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
                  className="skeuo-card rounded-2xl p-6 space-y-4"
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
                        className={`px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold rounded-md ${
                          risk.probability === 'High'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs'
                            : 'skeuo-well text-stone-700'
                        }`}
                      >
                        Prob: {risk.probability}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold rounded-md ${
                          risk.impact === 'High'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs'
                            : 'skeuo-well text-stone-700'
                        }`}
                      >
                        Impact: {risk.impact}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl skeuo-well space-y-1">
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
          <div className="p-4 rounded-xl skeuo-well text-xs text-stone-700 flex items-center gap-2">
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
                  className="skeuo-card rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#E0D9CC] pb-3">
                    <h4 className="font-serif italic text-base text-stone-900 font-bold">
                      {opt?.title || `Option ${idx + 1}`}
                    </h4>
                    <span className="text-[10px] font-mono text-stone-500 font-semibold uppercase">
                      Timeline Projection
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl skeuo-well space-y-1">
                      <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B88E3D]" /> Short-Term (1–6 Months)
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        {sc.shortTerm}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl skeuo-well space-y-1">
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
          <div className="skeuo-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E0D9CC] pb-4">
              <div className="w-10 h-10 rounded-xl skeuo-btn-primary text-white flex items-center justify-center shrink-0">
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
              <div className="p-4 rounded-xl skeuo-well space-y-2">
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
              <div className="p-4 rounded-xl skeuo-well space-y-2">
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
              <div className="p-4 rounded-xl skeuo-well space-y-2">
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
              <div className="p-4 rounded-xl skeuo-well space-y-2">
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
          <div className="skeuo-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0D9CC] pb-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E3D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                Follow-up Conversation with Decision AI
              </h4>
              <span className="text-[10px] font-mono text-stone-500 font-semibold">
                Interactive Advisor
              </span>
            </div>

            {chatMessages.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl skeuo-well">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      m.role === 'user'
                        ? 'skeuo-btn-primary text-white font-medium ml-8 shadow-xs'
                        : 'skeuo-card text-stone-900 mr-8'
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
                className="flex-1 px-4 py-2.5 rounded-xl skeuo-input text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#B88E3D]"
                disabled={isSendingChat}
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-5 py-2.5 rounded-xl skeuo-btn-primary text-white font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
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
