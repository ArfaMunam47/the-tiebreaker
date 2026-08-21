import React, { useState } from 'react';
import { User, AuthResponse } from '../types';
import { apiLogin, apiRegister, apiLoginDemo } from '../utils/api';
import {
  LogIn,
  UserPlus,
  X,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (auth: AuthResponse) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onAuthSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const res = await apiRegister(email.trim(), password, name.trim());
        onAuthSuccess(res);
        onClose();
      } else {
        const res = await apiLogin(email.trim(), password);
        onAuthSuccess(res);
        onClose();
      }
    } catch (err: any) {
      setError(
        err.message ||
          (mode === 'login'
            ? 'Unable to sign in. Please verify your credentials.'
            : 'Unable to create account. Please check the information provided.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (profile: 'user_a' | 'user_b' | 'guest') => {
    setError('');
    setLoading(true);
    try {
      const res = await apiLoginDemo(profile);
      onAuthSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize workspace account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="editorial-modal-shell max-w-md w-full p-5 sm:p-7 relative text-[#141413]">
        {/* Top Actions: Back & Close */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4DFD5]">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-stone-700 hover:text-stone-950 bg-[#F4EFE6] hover:bg-[#EBE4D8] border border-[#D5CEBF] cursor-pointer transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C49235]" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 border border-transparent hover:border-[#141413] hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Badge */}
        <div className="space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#141413] text-[#FAF8F5] text-[10px] font-mono uppercase tracking-widest font-bold">
            <ShieldCheck className="w-3 h-3 text-[#C49235]" />
            <span>Authenticated Workspace</span>
          </div>
          <h2 id="auth-modal-title" className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
            {mode === 'login' ? 'Sign In to Tiebreaker' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-stone-600 font-sans">
            {mode === 'login'
              ? 'Access your private decision archives, criteria matrices, and intelligence reports.'
              : 'Join to preserve your decision-making rationale with persistent cloud storage.'}
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 border border-rose-300 bg-rose-50 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-700 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4EFE6] border border-[#E0D9CC] mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#141413] text-[#FAF8F5] shadow-xs'
                : 'text-stone-600 hover:text-[#141413]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#141413] text-[#FAF8F5] shadow-xs'
                : 'text-stone-600 hover:text-[#141413]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arfa Munam"
                required
                className="editorial-input w-full p-2.5 text-sm font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="editorial-input w-full p-2.5 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="editorial-input w-full p-2.5 text-sm font-medium"
            />
            {mode === 'register' && (
              <span className="text-[10px] text-stone-500 font-mono mt-1 block">
                Minimum 6 characters required.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="editorial-btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {mode === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Test Accounts for rapid verification */}
        <div className="mt-5 pt-4 border-t border-[#E4DFD5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold">
              Instant Demo Access
            </span>
            <span className="text-[10px] text-stone-400 font-mono">1-click test</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user_a')}
              disabled={loading}
              className="p-2 border border-[#E0D9CC] bg-[#FAF8F5] hover:border-[#141413] hover:bg-white text-left transition-all cursor-pointer"
            >
              <span className="block text-xs font-bold text-[#141413]">Workspace Demo A</span>
              <span className="text-[10px] text-stone-500 font-mono">Executive Profile</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('user_b')}
              disabled={loading}
              className="p-2 border border-[#E0D9CC] bg-[#FAF8F5] hover:border-[#141413] hover:bg-white text-left transition-all cursor-pointer"
            >
              <span className="block text-xs font-bold text-[#141413]">Workspace Demo B</span>
              <span className="text-[10px] text-stone-500 font-mono">Product Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
