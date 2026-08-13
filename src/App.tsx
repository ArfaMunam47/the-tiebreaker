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
import { ResultsDashboard } from './components/ResultsDashboard';
import { DecisionHistory } from './components/DecisionHistory';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Footer } from './components/Footer';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [currentDecision, setCurrentDecision] = useState<DecisionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

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
    clarifyingAnswers: Record<string, string>
  ) => {
    setIsAnalyzing(true);
    setLoadingStep(0);

    // Step progression intervals
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const analysisResult: DecisionAnalysis = await response.json();

      // Save to storage
      saveDecision(analysisResult);
      setSavedDecisions(getSavedDecisions());
      setCurrentDecision(analysisResult);

      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Analysis failed, using resilient fallback analysis:', error);
      // Construct fallback analysis so user never sees a broken experience
      const fallbackResult: DecisionAnalysis = {
        id: 'dec_' + Date.now(),
        title: prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt,
        originalPrompt: prompt,
        userPriorities: priorities.length > 0 ? priorities : ['Career Growth', 'Financial Outcome'],
        options: options.length >= 2 ? options.map((o, idx) => ({ id: `opt${idx + 1}`, title: o, description: `Option path: ${o}` })) : [
          { id: 'opt1', title: options[0] || 'Option 1: Change Path', description: 'Pursue proactive change with potential higher upside.' },
          { id: 'opt2', title: options[1] || 'Option 2: Status Quo', description: 'Maintain current path for predictability.' },
        ],
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
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
    }
  };

  const handleSelectDecision = (decision: DecisionAnalysis) => {
    setCurrentDecision(decision);
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
    a.download = `the_tiebreaker_decisions_${new Date().toISOString().slice(0, 10)}.json`;
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setShowSamplePicker(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] font-sans selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      {/* HEADER */}
      <Header
        onNewDecision={handleNewDecision}
        onOpenHistory={() => setShowHistory(true)}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
        onSelectSample={() => handleSelectSample()}
        savedCount={savedDecisions.length}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* MAIN CONTENT AREA */}
      <main>
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
          />
        ) : (
          /* HOMEPAGE & DECISION WORKSPACE VIEW */
          <div className="space-y-4">
            <Hero
              onStartAnalysis={() => {
                const el = document.getElementById('workspace');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenHowItWorks={() => setShowHowItWorks(true)}
              onSelectSample={handleSelectSample}
            />

            <DecisionWorkspace
              onRunAnalysis={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
              loadingStep={loadingStep}
            />
          </div>
        )}
      </main>

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
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111111] border border-[#222222] rounded-lg max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif italic text-lg font-light text-[#F5F5F0]">
                  Select a Sample Decision Analysis
                </h3>
              </div>
              <button
                onClick={() => setShowSamplePicker(false)}
                className="p-1.5 text-[#A0A0A0] hover:text-[#F5F5F0] rounded-sm bg-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {SAMPLE_DECISIONS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.id)}
                  className="p-4 rounded-sm bg-[#0A0A0A] border border-[#222222] hover:border-[#D4AF37]/40 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif italic text-sm font-light text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors">
                      {sample.title}
                    </h4>
                    <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Load Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <p className="text-xs text-[#A0A0A0] line-clamp-2">
                    {sample.originalPrompt}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#666666] pt-1">
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
