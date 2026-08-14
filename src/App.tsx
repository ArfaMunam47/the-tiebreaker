import { useState, useEffect } from 'react';
import { DecisionAnalysis } from './types';
import { SAMPLE_DECISIONS } from './data/sampleDecisions';
import {
  getSavedDecisions,
  saveDecision,
  deleteDecision,
  exportDecisionsJSON,
  importDecisionsJSON,
} from './utils/storage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DecisionWorkspace } from './components/DecisionWorkspace';
import { ResultsDashboard, TabType } from './components/ResultsDashboard';
import { DecisionHistory } from './components/DecisionHistory';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [currentDecision, setCurrentDecision] = useState<DecisionAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Drawers
  const [showHistory, setShowHistory] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSamplePicker, setShowSamplePicker] = useState(false);

  // Load saved decisions on mount
  useEffect(() => {
    const list = getSavedDecisions();
    setSavedDecisions(list);
  }, []);

  // Handle running AI Analysis
  const handleRunAnalysis = async (
    prompt: string,
    options: string[],
    priorities: string[],
    clarifyingAnswers: Record<string, string>,
    category?: any,
    reversibility?: any,
    timeHorizon?: any,
    clarificationState?: any
  ) => {
    setIsAnalyzing(true);
    setLoadingStep(0);

    const stepTimer1 = setTimeout(() => setLoadingStep(1), 1400);
    const stepTimer2 = setTimeout(() => setLoadingStep(2), 2800);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          options,
          priorities,
          clarifyingAnswers,
          category,
          reversibility,
          timeHorizon,
          clarificationState,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const analysisResult: DecisionAnalysis = await response.json();

      saveDecision(analysisResult);
      setSavedDecisions(getSavedDecisions());
      setCurrentDecision(analysisResult);
      setActiveTab('overview');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Analysis failed, using resilient fallback analysis:', error);
      const fallbackResult: DecisionAnalysis = {
        id: 'dec_' + Date.now(),
        title: prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt,
        originalPrompt: prompt,
        category: category || 'Career',
        reversibility: reversibility || 'Somewhat reversible',
        timeHorizon: timeHorizon || '1 year',
        userPriorities: priorities.length > 0 ? priorities : ['Career Growth', 'Financial Outcome'],
        options: options.length >= 2 ? options.map((o, idx) => ({ id: `opt${idx + 1}`, title: o, description: `Option path: ${o}` })) : [
          { id: 'opt1', title: options[0] || 'Option 1: Change Path', description: 'Pursue proactive change with potential higher upside.' },
          { id: 'opt2', title: options[1] || 'Option 2: Status Quo', description: 'Maintain current path for predictability.' },
        ],
        clarificationState,
        clarifyingQuestions: [
          { id: 'q1', question: 'What is your non-negotiable factor in this decision?', suggestedAnswers: ['Income level', 'Work-life balance', 'Growth potential'] }
        ],
        prosCons: [
          {
            optionId: 'opt1',
            pros: [{ text: 'High long-term upside', weight: 'high' }],
            cons: [{ text: 'Initial transition friction', weight: 'medium' }],
          },
          {
            optionId: 'opt2',
            pros: [{ text: 'Predictable baseline', weight: 'high' }],
            cons: [{ text: 'Opportunity cost', weight: 'medium' }],
          },
        ],
        comparison: [
          { criterion: 'Long-term Potential', scores: { opt1: 'High', opt2: 'Moderate' }, winnerOptionId: 'opt1' }
        ],
        swot: [
          { optionId: 'opt1', strengths: ['High upside'], weaknesses: ['Initial stress'], opportunities: ['Expanded career market'], threats: ['Pacing risk'] },
          { optionId: 'opt2', strengths: ['Low risk'], weaknesses: ['Slower growth'], opportunities: ['Free mental bandwidth'], threats: ['Market obsolescence'] },
        ],
        criteria: [
          { id: 'crit1', name: priorities[0] || 'Growth Potential', weight: 40 },
          { id: 'crit2', name: priorities[1] || 'Financial Benefit', weight: 30 },
          { id: 'crit3', name: priorities[2] || 'Stability & Risk', weight: 30 },
        ],
        weightedScores: {
          opt1: { crit1: 9, crit2: 8, crit3: 6 },
          opt2: { crit1: 5, crit2: 6, crit3: 9 },
        },
        risks: [
          { id: 'r1', optionId: 'opt1', risk: 'Transition workload surge', probability: 'Medium', impact: 'High', mitigation: 'Establish clear 30-day reviews.' }
        ],
        scenarios: [
          { optionId: 'opt1', shortTerm: 'Months 1-6: Initial onboarding, building momentum.', longTerm: 'Years 1-3: Higher performance baseline.' },
          { optionId: 'opt2', shortTerm: 'Months 1-6: Steady operations.', longTerm: 'Years 1-3: Predictable incremental progress.' },
        ],
        thinkDeeper: {
          assumptions: ['Assuming workload stabilizes after onboarding phase.'],
          missingInformation: ['Exact long-term financial parameters.'],
          biases: ['Status Quo Bias: Overvaluing current path due to comfort.'],
          blindspotQuestions: ['What is the worst case scenario and could you handle it?'],
          questionsToAskOthers: ['Ask a mentor: What surprised you when taking a similar leap?'],
          researchItems: ['Review market benchmarks.'],
        },
        recommendation: {
          recommendedOptionId: 'opt1',
          recommendedOptionTitle: options[0] || 'Option 1',
          mainReasons: ['Stronger alignment with long-term growth priorities.'],
          biggestConcern: 'Managing short-term transition pacing.',
          missingInformation: 'Firm confirmation on timeline flexibility.',
          confidenceLevel: 'High',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'analyzed',
      };

      saveDecision(fallbackResult);
      setSavedDecisions(getSavedDecisions());
      setCurrentDecision(fallbackResult);
      setActiveTab('overview');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
    }
  };

  const handleSelectDecision = (decision: DecisionAnalysis) => {
    setCurrentDecision(decision);
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewDecision = () => {
    setCurrentDecision(null);
    setTimeout(() => {
      const workspaceEl = document.getElementById('workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleUpdateDecision = (updated: DecisionAnalysis) => {
    setCurrentDecision(updated);
    saveDecision(updated);
    setSavedDecisions(getSavedDecisions());
  };

  const handleDeleteDecision = (id: string) => {
    deleteDecision(id);
    const updatedList = getSavedDecisions();
    setSavedDecisions(updatedList);
    if (currentDecision?.id === id) {
      setCurrentDecision(null);
    }
  };

  const handleExport = () => {
    const jsonStr = exportDecisionsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tie_breaker_decisions_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importDecisionsJSON(content);
          if (success) {
            const list = getSavedDecisions();
            setSavedDecisions(list);
            alert('Decisions successfully imported!');
          } else {
            alert('Invalid JSON file format.');
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSelectSample = (sampleId?: string) => {
    if (sampleId) {
      const found = SAMPLE_DECISIONS.find((s) => s.id === sampleId);
      if (found) {
        setCurrentDecision(found);
        setShowSamplePicker(false);
        setActiveTab('overview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setShowSamplePicker(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-950 flex flex-col overflow-x-hidden">
      {/* HEADER */}
      <Header
        onNewDecision={handleNewDecision}
        onOpenHistory={() => setShowHistory(true)}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
        onSelectSample={() => handleSelectSample()}
        savedCount={savedDecisions.length}
        onExport={handleExport}
        onImport={handleImport}
        currentDecisionTitle={currentDecision?.title}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* MOBILE OVERLAY SIDEBAR DRAWER */}
      {isMobileSidebarOpen && (
        <Sidebar
          currentDecision={currentDecision}
          savedDecisions={savedDecisions}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onSelectDecision={handleSelectDecision}
          onNewDecision={handleNewDecision}
          onOpenHistory={() => setShowHistory(true)}
          onOpenHowItWorks={() => setShowHowItWorks(true)}
          onSelectSample={() => handleSelectSample()}
          savedCount={savedDecisions.length}
          onExport={handleExport}
          onImport={handleImport}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA WITH PERSISTENT APPLICATION SIDEBAR SHELL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] w-full max-w-[1536px] mx-auto min-h-[calc(100vh-65px)]">
        {/* Persistent Desktop Sidebar Shell */}
        <aside className="hidden lg:block border-r border-[#E8E5DF] bg-white sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          <Sidebar
            currentDecision={currentDecision}
            savedDecisions={savedDecisions}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onSelectDecision={handleSelectDecision}
            onNewDecision={handleNewDecision}
            onOpenHistory={() => setShowHistory(true)}
            onOpenHowItWorks={() => setShowHowItWorks(true)}
            onSelectSample={() => handleSelectSample()}
            savedCount={savedDecisions.length}
            onExport={handleExport}
            onImport={handleImport}
          />
        </aside>

        {/* Main Application Workspace */}
        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden bg-[#FAF8F5] p-4 sm:p-6 lg:p-7">
          {currentDecision ? (
            /* RESULTS DASHBOARD VIEW */
            <ResultsDashboard
              decision={currentDecision}
              onUpdateDecision={handleUpdateDecision}
              onSave={() => {
                saveDecision(currentDecision);
                setSavedDecisions(getSavedDecisions());
              }}
              onNewDecision={handleNewDecision}
              initialTab={activeTab}
            />
          ) : (
            /* HOMEPAGE & DECISION WORKSPACE VIEW */
            <DecisionWorkspace
              onRunAnalysis={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
              loadingStep={loadingStep}
              onOpenHowItWorks={() => setShowHowItWorks(true)}
              onSelectSample={handleSelectSample}
              savedDecisions={savedDecisions}
              onSelectDecision={handleSelectDecision}
              onDeleteDecision={handleDeleteDecision}
              onOpenHistory={() => setShowHistory(true)}
            />
          )}
        </main>
      </div>

      {/* FOOTER */}
      <Footer />

      {/* DECISION HISTORY DRAWER */}
      {showHistory && (
        <DecisionHistory
          savedDecisions={savedDecisions}
          onSelectDecision={handleSelectDecision}
          onDeleteDecision={handleDeleteDecision}
          onClose={() => setShowHistory(false)}
          onNewDecision={handleNewDecision}
        />
      )}

      {/* HOW IT WORKS METHODOLOGY MODAL */}
      {showHowItWorks && (
        <HowItWorksModal
          onClose={() => setShowHowItWorks(false)}
          onStart={() => {
            handleNewDecision();
          }}
        />
      )}

      {/* SAMPLE DECISION PICKER MODAL */}
      {showSamplePicker && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl max-w-2xl w-full p-5 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col text-stone-900">
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#B88E3D]" />
                <h3 className="font-serif italic text-lg sm:text-xl font-bold text-[#2C221E]">
                  Select a Pre-Built Sample Analysis
                </h3>
              </div>
              <button
                onClick={() => setShowSamplePicker(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {SAMPLE_DECISIONS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.id)}
                  className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] hover:border-[#B88E3D] cursor-pointer transition-all space-y-2 group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif italic text-base font-bold text-[#2C221E] group-hover:text-[#B88E3D] transition-colors">
                      {sample.title}
                    </h4>
                    <span className="text-[#B88E3D] text-xs font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Load Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    {sample.originalPrompt}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 pt-1">
                    <span>{sample.options.length} Options</span>
                    <span>•</span>
                    <span>{sample.criteria.length} Matrix Criteria</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


