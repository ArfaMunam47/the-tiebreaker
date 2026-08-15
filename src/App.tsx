import { useState, useEffect, useRef } from 'react';
import { DecisionAnalysis, User, AuthResponse } from './types';
import { SAMPLE_DECISIONS } from './data/sampleDecisions';
import {
  apiGetMe,
  apiLoginDemo,
  apiLogout,
  apiGetDecisions,
  apiSaveDecision,
  apiDeleteDecision,
  apiAnalyzeDecision,
  getStoredToken,
} from './utils/api';
import {
  exportDecisionsJSON,
  importDecisionsJSON,
} from './utils/storage';
import { Header } from './components/Header';
import { DecisionWorkspace } from './components/DecisionWorkspace';
import { ResultsDashboard, TabType } from './components/ResultsDashboard';
import { DecisionHistory } from './components/DecisionHistory';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [currentDecision, setCurrentDecision] = useState<DecisionAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Request cancellation and race condition tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRequestIdRef = useRef<number>(0);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Drawers
  const [showHistory, setShowHistory] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSamplePicker, setShowSamplePicker] = useState(false);

  // Initialize Authentication and User Decision Library on Mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const { user } = await apiGetMe();
          // Wipe any stale demo token or legacy Alex session so user starts in fresh Guest mode
          if (!user || user.id?.startsWith('demo_') || user.name?.toLowerCase().includes('alex')) {
            apiLogout();
            setCurrentUser(null);
            setSavedDecisions([]);
            return;
          }
          setCurrentUser(user);
          const decisions = await apiGetDecisions();
          setSavedDecisions(decisions);
          return;
        } catch (err) {
          console.warn('Existing session invalid or expired:', err);
          apiLogout();
        }
      }

      // Default to clean unauthenticated state (Guest mode)
      setCurrentUser(null);
      setSavedDecisions([]);
    };

    initAuth();
  }, []);

  // Reload user decisions library
  const refreshUserDecisions = async () => {
    try {
      const list = await apiGetDecisions();
      setSavedDecisions(list);
    } catch (err) {
      console.error('Failed to refresh user decisions:', err);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = async (auth: AuthResponse) => {
    setCurrentUser(auth.user);
    // Reset active decision to ensure clean isolation
    setCurrentDecision(null);
    const decisions = await apiGetDecisions();
    setSavedDecisions(decisions);
  };

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setCurrentDecision(null);
    setSavedDecisions([]);
  };

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
    // 1. Cancel previous in-flight analysis request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const requestId = ++currentRequestIdRef.current;

    setIsAnalyzing(true);
    setLoadingStep(0);

    const stepTimer1 = setTimeout(() => setLoadingStep(1), 1200);
    const stepTimer2 = setTimeout(() => setLoadingStep(2), 2400);

    try {
      const analysisResult = await apiAnalyzeDecision(
        {
          prompt,
          options,
          priorities,
          clarifyingAnswers,
          category,
          reversibility,
          timeHorizon,
          clarificationState,
        },
        abortController.signal
      );

      // Check if this is still the active request
      if (requestId !== currentRequestIdRef.current) {
        console.warn('Discarding stale analysis response');
        return;
      }

      // Save to database library
      try {
        await apiSaveDecision(analysisResult);
      } catch (err) {
        console.warn('Note: Auto-save to server:', err);
      }

      await refreshUserDecisions();
      setCurrentDecision(analysisResult);
      setActiveTab('overview');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Analysis request aborted by user');
        return;
      }

      console.error('Analysis failed, using resilient fallback analysis:', error);
      // Fallback result will have been saved by server or can be structured here
      await refreshUserDecisions();
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      if (requestId === currentRequestIdRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSelectDecision = (decision: DecisionAnalysis) => {
    setCurrentDecision(decision);
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewDecision = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentDecision(null);
    setTimeout(() => {
      const workspaceEl = document.getElementById('workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleUpdateDecision = async (updated: DecisionAnalysis) => {
    setCurrentDecision(updated);
    try {
      await apiSaveDecision(updated);
      await refreshUserDecisions();
    } catch (err) {
      console.error('Failed to update decision on server:', err);
    }
  };

  const handleDeleteDecision = async (id: string) => {
    try {
      await apiDeleteDecision(id);
      await refreshUserDecisions();
      if (currentDecision?.id === id) {
        setCurrentDecision(null);
      }
    } catch (err) {
      console.error('Failed to delete decision on server:', err);
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
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              for (const d of parsed) {
                await apiSaveDecision(d);
              }
              await refreshUserDecisions();
              alert('Decisions successfully imported into your library!');
            }
          } catch (err) {
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
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
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

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-[1880px] mx-auto px-3 sm:px-5 lg:px-7 xl:px-8 py-4 sm:py-6 flex-1">
        {currentDecision ? (
          /* RESULTS DASHBOARD VIEW WITH DEDICATED DESKTOP SIDEBAR */
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-6 min-h-[calc(100vh-120px)] items-start">
            {/* Desktop Navigation Sidebar for Active Decision */}
            <aside className="hidden lg:block bg-white rounded-2xl border border-[#E8E5DF] sticky top-[80px] h-[calc(100vh-110px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 shadow-2xs">
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

            {/* Results Canvas */}
            <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">
              <ResultsDashboard
                decision={currentDecision}
                onUpdateDecision={handleUpdateDecision}
                onSave={async () => {
                  if (currentDecision) {
                    await apiSaveDecision(currentDecision);
                    await refreshUserDecisions();
                  }
                }}
                onNewDecision={handleNewDecision}
                initialTab={activeTab}
              />
            </main>
          </div>
        ) : (
          /* HOMEPAGE & DECISION STUDIO WORKSPACE */
          <main className="w-full min-w-0 max-w-full overflow-x-hidden">
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
          </main>
        )}
      </div>

      {/* FOOTER */}
      <Footer />

      {/* AUTHENTICATION & MULTI-USER PROFILE MODAL */}
      <AuthModal
        currentUser={currentUser}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />

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
