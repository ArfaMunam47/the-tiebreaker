import React, { useState, useEffect } from 'react';
import {
  DecisionAnalysis,
  Criterion,
  WeightedScores,
  ProConItem,
  RiskItem,
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

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Editable local state for Matrix Criteria and Option Scores
  const [criteria, setCriteria] = useState<Criterion[]>(decision.criteria || []);
  const [scores, setScores] = useState<WeightedScores>(decision.weightedScores || {});
  const [prosConsData, setProsConsData] = useState(decision.prosCons || []);

  // Follow-up chat state for Think Deeper
  const [chatMessages, setChatMessages] = useState<FollowUpMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  useEffect(() => {
    setCriteria(decision.criteria || []);
    setScores(decision.weightedScores || {});
    setProsConsData(decision.prosCons || []);
  }, [decision]);

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
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fadeIn print:px-0 print:py-0">
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs print:border-none print:shadow-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C59B27]/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#FAF7F2] text-[#B88E3D] border border-[#E8E5DF] rounded-md">
                Decision Analysis
              </span>
              <span className="text-xs text-[#8C909A] font-mono">
                {decision.options.length} Options Evaluated • Updated{' '}
                {new Date(decision.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#18191C] leading-snug">
              {decision.title}
            </h1>

            {/* Recommendation Highlight Pill */}
            {recommendedOpt && (
              <div className="space-y-2">
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-[#18191C] text-xs font-medium shadow-xs">
                  <Award className="w-4 h-4 text-[#B88E3D]" />
                  <span>
                    Recommended:{' '}
                    <strong className="font-semibold text-[#18191C]">{recommendedOpt.title}</strong>
                  </span>
                  <span className="ml-1 text-[11px] font-mono text-[#B88E3D] font-bold">
                    ({decision.recommendation?.confidenceLevel || 'High'} Confidence)
                  </span>
                  {decision.reversibility && (
                    <span className="px-2 py-0.5 rounded bg-white text-[10px] text-[#595E68] border border-[#E8E5DF]">
                      ↺ {decision.reversibility}
                    </span>
                  )}
                  {decision.timeHorizon && (
                    <span className="px-2 py-0.5 rounded bg-white text-[10px] text-[#595E68] border border-[#E8E5DF]">
                      ⏱ {decision.timeHorizon} horizon
                    </span>
                  )}
                </div>

                {decision.recommendation?.confidenceReason && (
                  <p className="text-xs text-[#595E68] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8E5DF] italic">
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
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border transition-all ${
                savedSuccess
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white hover:bg-[#FAF7F2] text-[#18191C] border-[#E8E5DF] shadow-xs'
              }`}
            >
              <Save className="w-4 h-4 text-[#B88E3D]" />
              <span>{savedSuccess ? 'Saved to History!' : 'Save Decision'}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white hover:bg-[#FAF7F2] text-[#18191C] border border-[#E8E5DF] rounded-lg transition-all shadow-xs"
              title="Print or Export PDF"
            >
              <Printer className="w-4 h-4 text-[#8C909A]" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            <button
              onClick={onNewDecision}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#18191C] hover:bg-[#2A2D34] rounded-lg shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 text-[#C59B27]" />
              <span>New Decision</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLARIFYING QUESTIONS BANNER (if available) */}
      {decision.clarifyingQuestions && decision.clarifyingQuestions.length > 0 && (
        <div className="bg-white border border-[#E8E5DF] rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#B88E3D] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#B88E3D]" />
            <span>Clarifying Context Identified By AI</span>
          </div>
          <p className="text-xs text-[#595E68]">
            Key questions that sharpen the decision framework:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {decision.clarifyingQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-xs space-y-2"
              >
                <p className="font-semibold text-[#18191C]">{q.question}</p>
                {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.suggestedAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white border border-[#E8E5DF] text-[11px] text-[#595E68]"
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
      <div className="border-b border-[#E8E5DF]/60 pb-3 print:hidden space-y-2.5 max-w-full min-w-0">
        {/* Mobile Dropdown Selector (visible on small mobile screens < 640px) */}
        <div className="sm:hidden">
          <label htmlFor="mobile-tab-select" className="block text-[10px] font-bold uppercase tracking-wider text-[#8C909A] mb-1">
            Select Analysis Section
          </label>
          <select
            id="mobile-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-white border border-[#E8E5DF] text-[#18191C] focus:outline-none focus:border-[#C59B27] shadow-xs cursor-pointer"
          >
            {tabList.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Horizontal Tab Strip (Scrollable & Responsive across all viewports) */}
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-1 max-w-full w-full touch-pan-x border border-[#E8E5DF]/60 bg-[#FAF7F2]/70 rounded-xl shadow-2xs">
            {tabList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#18191C] text-white shadow-xs'
                      : 'text-[#595E68] hover:text-[#18191C] hover:bg-white border border-transparent hover:border-[#E8E5DF]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C59B27]' : 'text-[#8C909A]'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Summary & Top Recommendation Box */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E3D] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B88E3D]" />
                Executive Synthesis
              </h3>
              <p className="text-sm text-[#18191C] leading-relaxed font-sans">
                {decision.recommendation?.mainReasons?.join(' ') ||
                  `Analyzing ${decision.options.length} options for "${decision.title}".`}
              </p>

              {/* Priorities Tags */}
              <div className="pt-2 border-t border-[#E8E5DF]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C909A] block mb-2">
                  Priorities Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {decision.userPriorities?.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#18191C] text-xs font-medium border border-[#E8E5DF]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Score Meter Box */}
            <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-4 relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B88E3D]">
                  Primary Direction
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F2] text-[#18191C] border border-[#E8E5DF] font-semibold">
                  {decision.recommendation?.confidenceLevel || 'High'} Confidence
                </span>
              </div>

              <div>
                <h4 className="font-serif italic text-xl text-[#18191C]">
                  {recommendedOpt?.title}
                </h4>
                <p className="text-xs text-[#595E68] mt-1.5 leading-relaxed line-clamp-3">
                  {recommendedOpt?.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E5DF] space-y-1.5 text-xs">
                <span className="text-[#8C909A] font-medium">Primary Operational Risk:</span>
                <p className="text-[#18191C] font-semibold">
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
                <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#B88E3D]" />
                    Why Other Options Lost
                  </h4>
                  <div className="space-y-2 text-xs">
                    {Object.entries(decision.recommendation.whyNotOptions).map(([optId, reason]) => {
                      const opt = decision.options.find((o) => o.id === optId);
                      return (
                        <div key={optId} className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-1">
                          <span className="font-serif italic text-[#18191C] font-semibold block">
                            {opt?.title || optId}
                          </span>
                          <p className="text-[#595E68] leading-relaxed">{reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditions that would change the recommendation */}
              {decision.recommendation?.reversalConditions && decision.recommendation.reversalConditions.length > 0 && (
                <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Conditions That Would Flip Recommendation
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {decision.recommendation.reversalConditions.map((cond, idx) => (
                      <li key={idx} className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 text-[#18191C] flex items-start gap-2">
                        <span className="text-rose-600 font-bold">•</span>
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
            <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B88E3D]" />
                Evidence & Information Integrity Breakdown
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {decision.evidenceItems.map((item) => {
                  const categoryColors = {
                    FACT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    ASSUMPTION: 'bg-amber-50 text-amber-800 border-amber-200',
                    INTERPRETATION: 'bg-blue-50 text-blue-800 border-blue-200',
                    UNKNOWN: 'bg-slate-50 text-slate-800 border-slate-200',
                  };
                  return (
                    <div key={item.id} className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                      <p className="text-[#18191C] font-medium leading-relaxed">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A]">
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
                    className={`p-6 rounded-xl border transition-all space-y-4 relative bg-white ${
                      isRecommended || isLeader
                        ? 'border-[#C59B27] shadow-sm'
                        : 'border-[#E8E5DF] shadow-xs'
                    }`}
                  >
                    {(isRecommended || isLeader) && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#18191C] text-[#C59B27] rounded-full shadow-xs">
                        {isRecommended ? 'Recommended' : 'Top Matrix Score'}
                      </span>
                    )}

                    <div>
                      <h4 className="font-serif italic text-lg text-[#18191C] font-normal">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-[#595E68] mt-1 leading-relaxed line-clamp-2">
                        {opt.description}
                      </p>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1.5 pt-3 border-t border-[#E8E5DF]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#8C909A] font-semibold">Weighted Total</span>
                        <span className="font-mono font-bold text-[#18191C] text-sm">
                          {weightedScore} / 10
                        </span>
                      </div>
                      <div className="w-full bg-[#FAF7F2] border border-[#E8E5DF] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#18191C] h-full rounded-full transition-all duration-500"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A]">
              Advantages & Disadvantages
            </h3>
            <span className="text-xs text-[#8C909A]">
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
                  className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-5 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
                    <h4 className="font-serif italic text-lg text-[#18191C]">
                      {opt.title}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddProCon(opt.id, 'pro')}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-[#18191C] hover:bg-[#18191C] hover:text-white border border-[#E8E5DF] rounded transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-[#B88E3D]" /> Pro
                      </button>
                      <button
                        onClick={() => handleAddProCon(opt.id, 'con')}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#FAF7F2] text-[#18191C] hover:bg-[#18191C] hover:text-white border border-[#E8E5DF] rounded transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-[#8C909A]" /> Con
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
                          className="p-3.5 rounded-lg bg-[#FAF7F2] border-l-2 border-[#B88E3D] border-y border-r border-[#E8E5DF] text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-[#18191C]">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-[#595E68] mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-white text-[#18191C] border border-[#E8E5DF]'
                                : 'bg-transparent text-[#8C909A]'
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
                    <span className="text-[10px] font-bold text-[#8C909A] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#8C909A]" /> Disadvantages ({pc.cons.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.cons.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-lg bg-[#FAF7F2] border-l-2 border-[#8C909A] border-y border-r border-[#E8E5DF] text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-[#18191C]">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-[#595E68] mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-white text-[#18191C] border border-[#E8E5DF]'
                                : 'bg-transparent text-[#8C909A]'
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
        <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 sm:p-8 space-y-6 animate-fadeIn overflow-x-auto shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A]">
              Side-by-Side Evaluation Matrix
            </h3>
            <span className="text-xs text-[#8C909A]">
              Cross-option criterion assessment
            </span>
          </div>

          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#E8E5DF] text-[10px] uppercase font-bold text-[#8C909A] tracking-wider">
                <th className="py-3 px-4">Evaluation Criterion</th>
                {decision.options.map((opt) => (
                  <th key={opt.id} className="py-3 px-4">
                    {opt.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF] text-xs text-[#18191C]">
              {decision.comparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-4 font-serif italic text-[#18191C] font-medium">
                    {row.criterion}
                  </td>
                  {decision.options.map((opt) => {
                    const scoreVal = row.scores?.[opt.id] || '-';
                    const isWinner = row.winnerOptionId === opt.id;
                    return (
                      <td key={opt.id} className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              isWinner ? 'font-bold text-[#18191C]' : 'text-[#595E68]'
                            }
                          >
                            {scoreVal}
                          </span>
                          {isWinner && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-[#18191C] text-[#C59B27] rounded">
                              Leader
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. SWOT TAB */}
      {activeTab === 'swot' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A]">
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
                  className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-4 shadow-xs"
                >
                  <h4 className="font-serif italic text-lg text-[#18191C] border-b border-[#E8E5DF] pb-3">
                    {opt.title} — SWOT Overview
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-lg bg-[#FAF7F2] border-l-2 border-[#B88E3D] border-y border-r border-[#E8E5DF] space-y-2">
                      <span className="text-[10px] font-bold text-[#B88E3D] uppercase tracking-wider">
                        S — Strengths
                      </span>
                      <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
                        {swot.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-4 rounded-lg bg-[#FAF7F2] border-l-2 border-[#8C909A] border-y border-r border-[#E8E5DF] space-y-2">
                      <span className="text-[10px] font-bold text-[#8C909A] uppercase tracking-wider">
                        W — Weaknesses
                      </span>
                      <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
                        {swot.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="p-4 rounded-lg bg-[#FAF7F2] border-l-2 border-[#B88E3D] border-y border-r border-[#E8E5DF] space-y-2">
                      <span className="text-[10px] font-bold text-[#B88E3D] uppercase tracking-wider">
                        O — Opportunities
                      </span>
                      <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
                        {swot.opportunities.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Threats */}
                    <div className="p-4 rounded-lg bg-[#FAF7F2] border-l-2 border-[#8C909A] border-y border-r border-[#E8E5DF] space-y-2">
                      <span className="text-[10px] font-bold text-[#8C909A] uppercase tracking-wider">
                        T — Threats
                      </span>
                      <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
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
        <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
            <div>
              <h3 className="text-base font-serif italic text-[#18191C] flex items-center gap-2 font-normal">
                <TrendingUp className="w-4 h-4 text-[#B88E3D]" />
                Interactive Weighted Decision Matrix
              </h3>
              <p className="text-xs text-[#595E68] mt-0.5">
                Adjust criteria weights (%) and score options (1–10) in real time.
              </p>
            </div>

            <button
              onClick={handleAddCriterion}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#FAF7F2] hover:bg-[#F4F1EA] text-[#18191C] border border-[#E8E5DF] rounded-lg transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#B88E3D]" />
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
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isLeader
                      ? 'bg-[#18191C] text-white border-[#18191C] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#18191C] border-[#E8E5DF]'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold ${
                        isLeader ? 'text-[#C59B27]' : 'text-[#8C909A]'
                      }`}
                    >
                      {isLeader ? '🏆 Matrix Leader' : 'Weighted Total'}
                    </span>
                    <h4 className="font-serif italic text-sm font-medium">
                      {opt.title}
                    </h4>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-xl font-bold ${
                        isLeader ? 'text-[#C59B27]' : 'text-[#18191C]'
                      }`}
                    >
                      {totalScore}
                    </span>
                    <span className={isLeader ? 'text-white/60 text-xs' : 'text-[#8C909A] text-xs'}>
                      {' '}
                      / 10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CRITERIA & SCORES SLIDERS TABLE */}
          <div className="space-y-6 pt-4 border-t border-[#E8E5DF]">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-4"
              >
                {/* Criterion Header & Weight Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DF] pb-3">
                  <div>
                    <h4 className="text-sm font-serif italic text-[#18191C] font-semibold">
                      {crit.name}
                    </h4>
                    {crit.description && (
                      <p className="text-xs text-[#595E68] mt-0.5">{crit.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8C909A] font-mono">Weight:</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={crit.weight}
                        onChange={(e) => handleWeightChange(crit.id, parseInt(e.target.value))}
                        className="w-24 accent-[#18191C] cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-[#18191C] w-8">
                        {crit.weight}%
                      </span>
                    </div>

                    {criteria.length > 1 && (
                      <button
                        onClick={() => handleRemoveCriterion(crit.id)}
                        className="p-1 text-[#8C909A] hover:text-rose-600 transition-colors"
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
                        className="p-3.5 rounded-lg bg-white border border-[#E8E5DF] space-y-1.5 shadow-xs"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#18191C] font-serif italic truncate max-w-[180px]">
                            {opt.title}
                          </span>
                          <span className="font-mono text-[#18191C] font-bold">
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
                          className="w-full accent-[#18191C] cursor-pointer"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A]">
              Risk Assessment & Mitigation Strategy
            </h3>
            <span className="text-xs text-[#8C909A]">
              Probability and actionable safeguards
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {decision.risks.map((risk) => {
              const opt = decision.options.find((o) => o.id === risk.optionId);
              return (
                <div
                  key={risk.id}
                  className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#B88E3D] font-bold uppercase">
                        Option: {opt?.title || 'General'}
                      </span>
                      <h4 className="text-sm font-serif italic text-[#18191C] mt-1 font-semibold">
                        {risk.risk}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                          risk.probability === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-[#FAF7F2] text-[#18191C] border border-[#E8E5DF]'
                        }`}
                      >
                        Prob: {risk.probability}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                          risk.impact === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-[#FAF7F2] text-[#595E68] border border-[#E8E5DF]'
                        }`}
                      >
                        Impact: {risk.impact}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-1">
                    <span className="text-[10px] font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#B88E3D]" /> Recommended Safeguard
                    </span>
                    <p className="text-xs text-[#18191C] leading-normal font-medium">
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
          <div className="p-4 rounded-xl bg-white border border-[#E8E5DF] text-xs text-[#595E68] shadow-xs">
            💡 <strong>Future Projections:</strong> Plausible trajectories based on trade-off trends — not guaranteed outcomes.
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {decision.scenarios.map((sc, idx) => {
              const opt = decision.options.find((o) => o.id === sc.optionId) || decision.options[idx];
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-4 shadow-xs"
                >
                  <h4 className="font-serif italic text-base text-[#18191C] border-b border-[#E8E5DF] pb-3">
                    {opt?.title || `Option ${idx + 1}`}
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-1">
                      <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B88E3D]" /> Short-Term (1–6 Months)
                      </span>
                      <p className="text-xs text-[#18191C] leading-relaxed font-medium">
                        {sc.shortTerm}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-1">
                      <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#B88E3D]" /> Long-Term (1–5 Years)
                      </span>
                      <p className="text-xs text-[#18191C] leading-relaxed font-medium">
                        {sc.longTerm}
                      </p>
                    </div>

                    {sc.keyTurningPoint && (
                      <div className="text-[11px] text-[#8C909A] font-mono italic pt-1">
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
          <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E8E5DF] pb-4">
              <div className="w-8 h-8 rounded-lg bg-[#18191C] text-[#C59B27] flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#C59B27]" />
              </div>
              <div>
                <h3 className="font-serif italic text-xl text-[#18191C]">
                  Cognitive Analysis & Blindspot Check
                </h3>
                <p className="text-xs text-[#595E68]">
                  Uncover hidden assumptions, potential biases, and critical follow-up questions.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Assumptions */}
              <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#B88E3D]" /> Hidden Assumptions
                </span>
                <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.assumptions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Cognitive Biases */}
              <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#B88E3D]" /> Potential Biases
                </span>
                <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.biases?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Blindspot Questions */}
              <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#B88E3D]" /> Blindspot Questions
                </span>
                <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.blindspotQuestions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Questions to Ask Others */}
              <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
                <span className="text-xs font-bold text-[#B88E3D] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#B88E3D]" /> Questions to Ask Others
                </span>
                <ul className="text-xs text-[#18191C] space-y-1.5 list-disc list-inside font-medium">
                  {decision.thinkDeeper?.questionsToAskOthers?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CHAT BOX WITH AI FOR FOLLOW-UP QUESTIONS */}
          <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C909A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88E3D]" />
              Follow-up Conversation with Decision AI
            </h4>

            {chatMessages.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF]">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-lg text-xs space-y-1 ${
                      m.role === 'user'
                        ? 'bg-[#18191C] text-white ml-8 shadow-xs'
                        : 'bg-white border border-[#E8E5DF] text-[#18191C] mr-8 shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between font-mono text-[10px] opacity-70">
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
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-[#18191C] placeholder:text-[#8C909A] focus:outline-none focus:bg-white focus:border-[#C59B27]"
                disabled={isSendingChat}
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-5 py-2.5 rounded-lg bg-[#18191C] hover:bg-[#2A2D34] text-white font-semibold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isSendingChat ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-[#C59B27]" />
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
