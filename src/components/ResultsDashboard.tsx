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
  CheckCircle2,
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
  Share2,
  Send,
  HelpCircle,
  BarChart3,
  Lightbulb,
  FileText,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Award,
} from 'lucide-react';

interface ResultsDashboardProps {
  decision: DecisionAnalysis;
  onUpdateDecision: (updated: DecisionAnalysis) => void;
  onSave: () => void;
  onNewDecision: () => void;
}

type TabType =
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
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable local state for Matrix Criteria and Option Scores
  const [criteria, setCriteria] = useState<Criterion[]>(decision.criteria || []);
  const [scores, setScores] = useState<WeightedScores>(decision.weightedScores || {});
  const [prosConsData, setProsConsData] = useState(decision.prosCons || []);

  // Follow-up chat state for Think Deeper
  const [chatMessages, setChatMessages] = useState<FollowUpMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Clarifying answers local state
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});

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
      name: 'New Custom Criterion',
      weight: 10,
      description: 'Custom user priority',
    };
    const updatedCriteria = [...criteria, newCrit];
    setCriteria(updatedCriteria);

    // Initialize default scores for each option
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

    const updated = prosConsData.map((pc) => {
      if (pc.optionId === optionId) {
        return {
          ...pc,
          pros: type === 'pro' ? [...pc.pros, newItem] : pc.pros,
          cons: type === 'con' ? [...pc.cons, newItem] : pc.cons,
        };
      }
      return pc;
    });

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

  // Find recommended option title
  const recommendedOpt = decision.options.find(
    (o) => o.id === decision.recommendation?.recommendedOptionId
  ) || decision.options[0];

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn print:px-0 print:py-0">
      {/* HEADER BANNER */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-2xl print:border-none print:shadow-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full">
                Decision Analysis
              </span>
              <span className="text-xs text-[#666666] font-mono">
                {decision.options.length} Options Evaluated • Updated{' '}
                {new Date(decision.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif italic text-2xl sm:text-3xl font-light text-[#F5F5F0] leading-snug">
              {decision.title}
            </h1>

            {/* Recommendation Highlight Pill */}
            {recommendedOpt && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#1A1A1A] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  Recommended: <strong className="font-bold text-[#F5F5F0]">{recommendedOpt.title}</strong>
                </span>
                <span className="ml-1 text-[11px] font-mono text-[#D4AF37]/80">
                  ({decision.recommendation?.confidenceLevel || 'High'} Confidence)
                </span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all ${
                savedSuccess
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#1A1A1A] hover:bg-[#222222] text-[#A0A0A0] hover:text-[#F5F5F0] border border-[#222222]'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? 'Saved to History!' : 'Save Decision'}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] hover:bg-[#222222] text-[#A0A0A0] hover:text-[#F5F5F0] border border-[#222222] rounded-sm transition-all"
              title="Print or Export PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            <button
              onClick={onNewDecision}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#e0be48] rounded-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-[#0A0A0A]" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLARIFYING QUESTIONS BANNER (if available) */}
      {decision.clarifyingQuestions && decision.clarifyingQuestions.length > 0 && (
        <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>Clarifying Questions Identified By AI</span>
          </div>
          <p className="text-xs text-[#A0A0A0]">
            Consider these questions to sharpen your decision context:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {decision.clarifyingQuestions.map((q) => (
              <div key={q.id} className="p-3 rounded-sm bg-[#0A0A0A] border border-[#222222] text-xs space-y-2">
                <p className="font-medium text-[#F5F5F0]">{q.question}</p>
                {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.suggestedAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-sm bg-[#1A1A1A] border border-[#222222] text-[11px] text-[#A0A0A0]"
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

      {/* NAVIGATION TABS */}
      <div className="flex items-center border-b border-[#2A2A2A] overflow-x-auto no-scrollbar scroll-smooth print:hidden">
        <div className="flex gap-2 min-w-max pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'prosCons', label: 'Pros & Cons', icon: FileText },
            { id: 'compare', label: 'Compare', icon: Scale },
            { id: 'swot', label: 'SWOT', icon: Shield },
            { id: 'matrix', label: 'Decision Matrix', icon: TrendingUp },
            { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
            { id: 'future', label: 'Future Scenarios', icon: Clock },
            { id: 'thinkDeeper', label: 'Think Deeper', icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#1A1A1A] text-[#D4AF37] border-b-2 border-[#D4AF37]'
                    : 'text-[#A0A0A0] hover:text-[#F5F5F0] hover:bg-[#111111]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#666666]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Summary & Top Recommendation Box */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#666666] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                Executive Summary
              </h3>
              <p className="text-sm text-[#F5F5F0] leading-relaxed font-sans">
                {decision.recommendation?.mainReasons?.join(' ') ||
                  `Analyzing ${decision.options.length} options for "${decision.title}".`}
              </p>

              {/* Priorities Tags */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] block mb-2">
                  Priorities Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {decision.userPriorities?.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-sm bg-[#1A1A1A] text-[#A0A0A0] text-xs border border-[#222222]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Score Meter Box */}
            <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-lg p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  AI Recommendation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  {decision.recommendation?.confidenceLevel || 'High'} Confidence
                </span>
              </div>

              <div>
                <h4 className="font-serif italic text-lg font-light text-[#F5F5F0]">
                  {recommendedOpt?.title}
                </h4>
                <p className="text-xs text-[#A0A0A0] mt-1 line-clamp-3">
                  {recommendedOpt?.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#222222] space-y-2 text-xs">
                <div>
                  <span className="text-[#666666]">Biggest Concern:</span>
                  <p className="text-[#D4AF37] font-medium">
                    {decision.recommendation?.biggestConcern || 'Managing short-term transition.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Option Scores Overview Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#666666]">
              Evaluated Options Score Breakdown
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decision.options.map((opt) => {
                const weightedScore = calculateWeightedTotalScore(opt.id, criteria, scores);
                const isRecommended = opt.id === decision.recommendation?.recommendedOptionId;
                const isLeader = opt.id === topScoringOptionId;

                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-lg border transition-all space-y-4 relative ${
                      isRecommended || isLeader
                        ? 'bg-[#111111] border-[#D4AF37]/50 shadow-lg'
                        : 'bg-[#111111] border-[#222222]'
                    }`}
                  >
                    {(isRecommended || isLeader) && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#0A0A0A] rounded-full shadow-md">
                        {isRecommended ? 'Top Recommendation' : 'Highest Matrix Score'}
                      </span>
                    )}

                    <div>
                      <h4 className="font-serif italic text-base font-light text-[#F5F5F0]">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-[#A0A0A0] mt-1 leading-normal line-clamp-2">
                        {opt.description}
                      </p>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-[#222222]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#666666] font-medium">Weighted Score</span>
                        <span className="font-mono font-bold text-[#D4AF37] text-sm">
                          {weightedScore} / 10
                        </span>
                      </div>
                      <div className="w-full bg-[#222222] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#666666]">
              Advantages & Disadvantages by Option
            </h3>
            <span className="text-xs text-[#666666]">
              You can add your own custom Pros/Cons to refine the analysis.
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
                  className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                    <h4 className="font-serif italic text-lg font-light text-[#F5F5F0]">
                      {opt.title}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddProCon(opt.id, 'pro')}
                        className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-sm transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Pro
                      </button>
                      <button
                        onClick={() => handleAddProCon(opt.id, 'con')}
                        className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#1A1A1A] text-[#A0A0A0] hover:bg-[#222222] border border-[#222222] rounded-sm transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Con
                      </button>
                    </div>
                  </div>

                  {/* PROS LIST */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pros / Advantages ({pc.pros.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.pros.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3 rounded-sm bg-[#0A0A0A] border-l-2 border-[#D4AF37] border-y border-r border-[#222222] text-xs text-[#F5F5F0] flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium text-[#F5F5F0]">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-[#A0A0A0] mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                                : 'bg-[#1A1A1A] text-[#666666]'
                            }`}
                          >
                            {item.weight}
                          </span>
                        </li>
                      ))}
                      {pc.pros.length === 0 && (
                        <li className="text-xs text-[#666666] italic p-2">No pros listed.</li>
                      )}
                    </ul>
                  </div>

                  {/* CONS LIST */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#A0A0A0]" /> Cons / Disadvantages ({pc.cons.length})
                    </span>
                    <ul className="space-y-2">
                      {pc.cons.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3 rounded-sm bg-[#0A0A0A] border-l-2 border-[#666666] border-y border-r border-[#222222] text-xs text-[#F5F5F0] flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium text-[#F5F5F0]">{item.text}</p>
                            {item.details && (
                              <p className="text-[11px] text-[#A0A0A0] mt-1">{item.details}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold shrink-0 ${
                              item.weight === 'high'
                                ? 'bg-[#222222] text-[#A0A0A0] border border-[#444444]'
                                : 'bg-[#1A1A1A] text-[#666666]'
                            }`}
                          >
                            {item.weight}
                          </span>
                        </li>
                      ))}
                      {pc.cons.length === 0 && (
                        <li className="text-xs text-[#666666] italic p-2">No cons listed.</li>
                      )}
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
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-6 animate-fadeIn overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#666666]">
              Side-by-Side Comparison Matrix
            </h3>
            <span className="text-xs text-[#666666]">
              Criteria evaluation across options
            </span>
          </div>

          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#222222] text-[10px] uppercase font-bold text-[#666666] tracking-wider">
                <th className="py-3 px-4">Criterion</th>
                {decision.options.map((opt) => (
                  <th key={opt.id} className="py-3 px-4">
                    {opt.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] text-xs text-[#F5F5F0]">
              {decision.comparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-3.5 px-4 font-serif italic text-[#D4AF37]">
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
                              isWinner ? 'font-bold text-[#D4AF37]' : 'text-[#A0A0A0]'
                            }
                          >
                            {scoreVal}
                          </span>
                          {isWinner && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
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
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#666666]">
            SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
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
                  className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4"
                >
                  <h4 className="font-serif italic text-lg font-light text-[#F5F5F0] border-b border-[#222222] pb-3">
                    {opt.title} — SWOT Grid
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-sm bg-[#0A0A0A] border-l-2 border-[#D4AF37] border-y border-r border-[#222222] space-y-2">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                        S — Strengths
                      </span>
                      <ul className="text-xs text-[#F5F5F0] space-y-1 list-disc list-inside">
                        {swot.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-4 rounded-sm bg-[#0A0A0A] border-l-2 border-[#666666] border-y border-r border-[#222222] space-y-2">
                      <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
                        W — Weaknesses
                      </span>
                      <ul className="text-xs text-[#F5F5F0] space-y-1 list-disc list-inside">
                        {swot.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="p-4 rounded-sm bg-[#0A0A0A] border-l-2 border-[#D4AF37] border-y border-r border-[#222222] space-y-2">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                        O — Opportunities
                      </span>
                      <ul className="text-xs text-[#F5F5F0] space-y-1 list-disc list-inside">
                        {swot.opportunities.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Threats */}
                    <div className="p-4 rounded-sm bg-[#0A0A0A] border-l-2 border-[#666666] border-y border-r border-[#222222] space-y-2">
                      <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">
                        T — Threats
                      </span>
                      <ul className="text-xs text-[#F5F5F0] space-y-1 list-disc list-inside">
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
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-serif italic font-light text-[#F5F5F0] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                Interactive Weighted Decision Matrix
              </h3>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                Adjust criteria weights (%) and score options (1–10). Scores update in real time!
              </p>
            </div>

            <button
              onClick={handleAddCriterion}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Add Custom Criterion</span>
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
                  className={`p-4 rounded-sm border flex items-center justify-between ${
                    isLeader
                      ? 'bg-[#1A1A1A] border-[#D4AF37]/50 shadow-md'
                      : 'bg-[#0A0A0A] border-[#222222]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">
                      {isLeader ? '🏆 Current Matrix Leader' : 'Calculated Total'}
                    </span>
                    <h4 className="font-serif italic text-sm font-light text-[#F5F5F0]">
                      {opt.title}
                    </h4>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xl font-bold text-[#D4AF37]">{totalScore}</span>
                    <span className="text-xs text-[#666666]"> / 10</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CRITERIA & SCORES SLIDERS TABLE */}
          <div className="space-y-6 pt-4 border-t border-[#222222]">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-4"
              >
                {/* Criterion Header & Weight Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3">
                  <div>
                    <h4 className="text-sm font-serif italic font-light text-[#D4AF37]">{crit.name}</h4>
                    {crit.description && (
                      <p className="text-xs text-[#A0A0A0] mt-0.5">{crit.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#666666] font-mono">Weight:</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={crit.weight}
                        onChange={(e) => handleWeightChange(crit.id, parseInt(e.target.value))}
                        className="w-24 accent-[#D4AF37] cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-[#D4AF37] w-8">
                        {crit.weight}%
                      </span>
                    </div>

                    {criteria.length > 1 && (
                      <button
                        onClick={() => handleRemoveCriterion(crit.id)}
                        className="p-1 text-[#666666] hover:text-rose-400 transition-colors"
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
                        className="p-3 rounded-sm bg-[#111111] border border-[#222222] space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#F5F5F0] font-serif italic truncate max-w-[180px]">
                            {opt.title}
                          </span>
                          <span className="font-mono text-[#D4AF37] font-bold">
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
                          className="w-full accent-[#D4AF37] cursor-pointer"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#666666]">
              Risk Identification & Mitigation Plan
            </h3>
            <span className="text-xs text-[#666666]">
              Evaluated probabilities and actionable safeguards
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {decision.risks.map((risk) => {
              const opt = decision.options.find((o) => o.id === risk.optionId);
              return (
                <div
                  key={risk.id}
                  className="bg-[#111111] border border-[#222222] rounded-lg p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#D4AF37] font-bold uppercase">
                        Option: {opt?.title || 'General'}
                      </span>
                      <h4 className="text-sm font-serif italic font-light text-[#F5F5F0] mt-1">
                        {risk.risk}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-sm ${
                          risk.probability === 'High'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        }`}
                      >
                        Prob: {risk.probability}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-sm ${
                          risk.impact === 'High'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : 'bg-[#1A1A1A] text-[#A0A0A0]'
                        }`}
                      >
                        Impact: {risk.impact}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-1">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#D4AF37]" /> Recommended Mitigation
                    </span>
                    <p className="text-xs text-[#F5F5F0] leading-normal">
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
          <div className="p-4 rounded-sm bg-[#111111] border border-[#D4AF37]/30 text-xs text-[#D4AF37]">
            💡 <strong>Note on Scenarios:</strong> These are plausible future possibilities based on current trends and trade-offs — not guaranteed predictions.
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {decision.scenarios.map((sc, idx) => {
              const opt = decision.options.find((o) => o.id === sc.optionId) || decision.options[idx];
              return (
                <div
                  key={idx}
                  className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4"
                >
                  <h4 className="font-serif italic text-base font-light text-[#F5F5F0] border-b border-[#222222] pb-3">
                    {opt?.title || `Option ${idx + 1}`}
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-1">
                      <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Short-Term (1–6 Months)
                      </span>
                      <p className="text-xs text-[#F5F5F0] leading-relaxed">
                        {sc.shortTerm}
                      </p>
                    </div>

                    <div className="p-3 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-1">
                      <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" /> Long-Term (1–5 Years)
                      </span>
                      <p className="text-xs text-[#F5F5F0] leading-relaxed">
                        {sc.longTerm}
                      </p>
                    </div>

                    {sc.keyTurningPoint && (
                      <div className="text-[11px] text-[#A0A0A0] font-mono italic">
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
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Compass className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-serif italic text-xl font-light text-[#F5F5F0]">
                  Help Me Think Deeper
                </h3>
                <p className="text-xs text-[#A0A0A0]">
                  Uncover hidden assumptions, cognitive biases, missing context, and research items.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Assumptions */}
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-2">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" /> Hidden Assumptions
                </span>
                <ul className="text-xs text-[#F5F5F0] space-y-1.5 list-disc list-inside">
                  {decision.thinkDeeper?.assumptions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Cognitive Biases */}
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-2">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D4AF37]" /> Potential Biases
                </span>
                <ul className="text-xs text-[#F5F5F0] space-y-1.5 list-disc list-inside">
                  {decision.thinkDeeper?.biases?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Blindspot Questions */}
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-2">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Blindspot Questions
                </span>
                <ul className="text-xs text-[#F5F5F0] space-y-1.5 list-disc list-inside">
                  {decision.thinkDeeper?.blindspotQuestions?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Questions to Ask Others */}
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222222] space-y-2">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" /> Questions to Ask Others
                </span>
                <ul className="text-xs text-[#F5F5F0] space-y-1.5 list-disc list-inside">
                  {decision.thinkDeeper?.questionsToAskOthers?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CHAT BOX WITH AI FOR FOLLOW-UP QUESTIONS */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#666666] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Ask Gemini Follow-up Questions About This Decision
            </h4>

            {chatMessages.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-sm bg-[#0A0A0A] border border-[#222222]">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-sm text-xs space-y-1 ${
                      m.role === 'user'
                        ? 'bg-[#1A1A1A] border border-[#D4AF37]/30 text-[#D4AF37] ml-8'
                        : 'bg-[#111111] border border-[#222222] text-[#F5F5F0] mr-8'
                    }`}
                  >
                    <div className="flex justify-between font-mono text-[10px] text-[#666666]">
                      <span>{m.role === 'user' ? 'You' : 'The Tiebreaker AI'}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="e.g. What if my startup option fails in 6 months? Or how do I negotiate a trial period?"
                className="flex-1 px-4 py-2.5 rounded-sm bg-[#0A0A0A] border border-[#222222] text-xs text-[#F5F5F0] placeholder:text-[#666666] focus:outline-none focus:border-[#D4AF37]"
                disabled={isSendingChat}
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-5 py-2.5 rounded-sm bg-[#D4AF37] hover:bg-[#e0be48] text-[#0A0A0A] font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isSendingChat ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0A0A0A]" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-[#0A0A0A]" />
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
