import { useState, useEffect, useRef } from 'react';
import { DecisionAnalysis, User, AuthResponse } from './types';
import { SAMPLE_DECISIONS } from './data/sampleDecisions';
import {
  apiGetMe,
  apiLogout,
  apiGetDecisions,
  apiSaveDecision,
  apiDeleteDecision,
  apiAnalyzeDecision,
  getStoredToken,
} from './utils/api';
import {
  exportDecisionsJSON,
} from './utils/storage';
import { Header } from './components/Header';
import { DecisionWorkspace, WorkspaceInitialData } from './components/DecisionWorkspace';
import { ResultsDashboard, TabType } from './components/ResultsDashboard';
import { DecisionHistory } from './components/DecisionHistory';
import { DecisionHistoryView } from './components/DecisionHistoryView';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AboutTiebreakerView } from './components/AboutTiebreakerView';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);

  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [currentDecision, setCurrentDecision] = useState<DecisionAnalysis | null>(null);
  const [workspaceInitialData, setWorkspaceInitialData] = useState<WorkspaceInitialData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Request cancellation and race condition tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRequestIdRef = useRef<number>(0);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Drawers
  const [showHistory, setShowHistory] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSamplePicker, setShowSamplePicker] = useState(false);

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => Boolean(getStoredToken()));

  // Initialize Authentication and User Decision Library on Mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const { user } = await apiGetMe();
          if (user && user.id) {
            setCurrentUser(user);
            const decisions = await apiGetDecisions();
            setSavedDecisions(decisions);
            return;
          }
        } catch (err) {
          console.warn('Existing session invalid or expired:', err);
          apiLogout();
        }
      }

      // Default to clean unauthenticated state (Guest mode)
      setCurrentUser(null);
      setSavedDecisions([]);
    };

    initAuth().finally(() => {
      setIsAuthLoading(false);
    });
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
    setShowAboutPage(false);
    const decisions = await apiGetDecisions();
    setSavedDecisions(decisions);
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
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
    clarificationState?: any,
    isQuickDecision?: boolean
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
    setAnalysisError(null);
    setShowAboutPage(false);

    const stepTimer1 = setTimeout(() => {
      if (requestId === currentRequestIdRef.current) setLoadingStep(1);
    }, 1800);
    const stepTimer2 = setTimeout(() => {
      if (requestId === currentRequestIdRef.current) setLoadingStep(2);
    }, 3800);

    try {
      const result = await apiAnalyzeDecision(
        {
          prompt,
          options,
          priorities,
          clarifyingAnswers,
          category,
          reversibility,
          timeHorizon,
          clarificationState,
          isQuickDecision,
        },
        abortController.signal
      );

      // Check if this request is still the active one
      if (requestId !== currentRequestIdRef.current) {
        return;
      }

      setCurrentDecision(result);
      setActiveTab('overview');

      // Refresh persistent library to include newly created decision
      await refreshUserDecisions();

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        console.log('Analysis request aborted by user or superseded');
        return;
      }
      if (requestId !== currentRequestIdRef.current) {
        return;
      }
      console.error('Decision analysis failed:', err);
      setAnalysisError(
        err.message || 'Analysis could not be generated. Please try again with a clearer prompt.'
      );
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
    setShowAboutPage(false);
    setShowHistoryPage(false);
    setActiveTab('overview');
    try {
      window.history.pushState({ view: 'decision', id: decision.id }, '', '');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewDecision = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentDecision(null);
    setWorkspaceInitialData(null);
    setShowAboutPage(false);
    setShowHistoryPage(false);
    try {
      window.history.pushState({ view: 'home' }, '', '');
    } catch {}
    setTimeout(() => {
      const workspaceEl = document.getElementById('workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleMakeMorePersonal = (decision: DecisionAnalysis) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Prefill data and start directly at Step 2: What matters most to you?
    setWorkspaceInitialData({
      prompt: decision.originalPrompt || decision.title,
      options: decision.options && decision.options.length >= 2 ? decision.options.map((o) => o.title) : undefined,
      priorities: decision.userPriorities || [],
      timeHorizon: decision.timeHorizon || 'This week',
      category: decision.category,
      reversibility: decision.reversibility,
      startStep: 'step2',
    });
    setCurrentDecision(null);
    setShowAboutPage(false);
    setShowHistoryPage(false);
    setTimeout(() => {
      const workspaceEl = document.getElementById('workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Browser navigation popstate support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state || state.view === 'home') {
        setShowAboutPage(false);
        setShowHistoryPage(false);
        setCurrentDecision(null);
      } else if (state.view === 'about') {
        setShowAboutPage(true);
        setShowHistoryPage(false);
        setCurrentDecision(null);
      } else if (state.view === 'history') {
        setShowAboutPage(false);
        setShowHistoryPage(true);
        setCurrentDecision(null);
      } else if (state.view === 'decision' && state.id) {
        const found =
          savedDecisions.find((d) => d.id === state.id) ||
          SAMPLE_DECISIONS.find((d) => d.id === state.id);
        if (found) {
          setCurrentDecision(found);
          setShowAboutPage(false);
          setShowHistoryPage(false);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [savedDecisions]);

  const handleOpenHistoryPage = () => {
    setShowHistoryPage(true);
    setShowAboutPage(false);
    setCurrentDecision(null);
    try {
      window.history.pushState({ view: 'history' }, '', '');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAboutPage = () => {
    setShowAboutPage(true);
    setShowHistoryPage(false);
    setCurrentDecision(null);
    try {
      window.history.pushState({ view: 'about' }, '', '');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setShowAboutPage(false);
    setShowHistoryPage(false);
    setCurrentDecision(null);
    try {
      window.history.pushState({ view: 'home' }, '', '');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        setShowAboutPage(false);
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
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAboutPage={() => {
          setShowAboutPage(true);
          setShowHistoryPage(false);
          setCurrentDecision(null);
        }}
        onLogout={handleLogout}
        onNewDecision={handleNewDecision}
        onOpenHistory={handleOpenHistoryPage}
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
          onOpenHistory={() => {
            handleOpenHistoryPage();
            setIsMobileSidebarOpen(false);
          }}
          onOpenHowItWorks={() => setShowHowItWorks(true)}
          onOpenAboutPage={() => {
            setShowAboutPage(true);
            setShowHistoryPage(false);
            setCurrentDecision(null);
            setIsMobileSidebarOpen(false);
          }}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          savedCount={savedDecisions.length}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-[1880px] mx-auto px-3 sm:px-5 lg:px-7 xl:px-8 py-4 sm:py-6 flex-1">
        {showAboutPage ? (
          /* DEDICATED "WHAT IS TIEBREAKER?" VIEW */
          <main className="w-full min-w-0">
            <AboutTiebreakerView
              onStartDecision={handleNewDecision}
              onSelectSample={() => handleSelectSample()}
              onClose={handleBackToHome}
              onBack={handleBackToHome}
            />
          </main>
        ) : showHistoryPage ? (
          /* DEDICATED FULL-PAGE "YOUR DECISIONS" HISTORY VIEW */
          <main className="w-full min-w-0">
            <DecisionHistoryView
              decisions={savedDecisions}
              onSelectDecision={handleSelectDecision}
              onDeleteDecision={handleDeleteDecision}
              onNewDecision={handleNewDecision}
              onSelectSample={() => handleSelectSample()}
              onBack={handleBackToHome}
            />
          </main>
        ) : currentDecision ? (
          /* RESULTS DASHBOARD VIEW WITH DEDICATED DESKTOP SIDEBAR */
          <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] xl:grid-cols-[320px_1fr] 2xl:grid-cols-[340px_1fr] gap-6 xl:gap-8 items-start w-full">
            {/* Desktop Navigation Sidebar for Active Decision */}
            <aside className="hidden lg:block sticky top-[76px] shrink-0 rounded-2xl skeuo-card border border-[#E0D9CC] shadow-xs">
              <Sidebar
                currentDecision={currentDecision}
                savedDecisions={savedDecisions}
                activeTab={activeTab}
                onSelectTab={(tab) => setActiveTab(tab)}
                onSelectDecision={handleSelectDecision}
                onNewDecision={handleNewDecision}
                onOpenHistory={handleOpenHistoryPage}
                onOpenHowItWorks={() => setShowHowItWorks(true)}
                onOpenAboutPage={handleOpenAboutPage}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                currentUser={currentUser}
                savedCount={savedDecisions.length}
              />
            </aside>

            {/* Results Canvas */}
            <main className="flex-1 min-w-0 w-full">
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
                onMakeMorePersonal={handleMakeMorePersonal}
                initialTab={activeTab}
                onBack={handleBackToHome}
                backLabel="Back to Decision Studio"
              />
            </main>
          </div>
        ) : (
          /* HOMEPAGE & DECISION STUDIO WORKSPACE */
          <main className="w-full min-w-0">
            <DecisionWorkspace
              onRunAnalysis={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
              loadingStep={loadingStep}
              analysisError={analysisError}
              onClearAnalysisError={() => setAnalysisError(null)}
              onOpenHowItWorks={() => setShowHowItWorks(true)}
              onSelectSample={handleSelectSample}
              savedDecisions={savedDecisions}
              onSelectDecision={handleSelectDecision}
              onDeleteDecision={handleDeleteDecision}
              onOpenHistory={handleOpenHistoryPage}
              currentUser={currentUser}
              initialData={workspaceInitialData}
            />
          </main>
        )}
      </div>

      {/* FOOTER */}
      <Footer />

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        currentUser={currentUser}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />

      {/* USER PROFILE MANAGEMENT MODAL */}
      <UserProfileModal
        currentUser={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
        onLogout={handleLogout}
        savedDecisions={savedDecisions}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onExport={handleExport}
        onImport={handleImport}
        savedCount={savedDecisions.length}
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
            setShowHowItWorks(false);
            handleNewDecision();
          }}
        />
      )}

      {/* SAMPLE DECISION PICKER MODAL */}
      {showSamplePicker && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="skeuo-modal-shell rounded-2xl max-w-2xl w-full p-5 sm:p-8 space-y-6 max-h-[90vh] flex flex-col text-stone-900">
            <div className="flex items-center justify-between border-b border-[#E3DCcf] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 shadow-xs flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#B88E3D]" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg sm:text-xl font-bold text-[#2C221E]">
                    Select an Example Dilemma
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">Load fully structured decision models to explore</p>
                </div>
              </div>
              <button
                onClick={() => setShowSamplePicker(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-900 skeuo-btn-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {SAMPLE_DECISIONS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.id)}
                  className="p-4 sm:p-5 rounded-xl skeuo-card-interactive cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif italic text-base font-bold text-[#2C221E] group-hover:text-[#B88E3D] transition-colors">
                      {sample.title}
                    </h4>
                    <span className="text-[#B88E3D] text-xs font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Load Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {sample.originalPrompt}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-200/60">
                    <span className="px-2 py-0.5 rounded-md skeuo-well text-stone-700 font-semibold">{sample.options.length} Options</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md skeuo-well text-stone-700 font-semibold">{sample.criteria.length} Matrix Criteria</span>
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
