import React, { useState } from 'react';
import { User, AuthResponse } from '../types';
import { apiLogin, apiRegister, apiLoginDemo } from '../utils/api';
import { User as UserIcon, LogIn, UserPlus, Sparkles, X, Shield, Check, AlertCircle } from 'lucide-react';

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
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      onAuthSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRegister(email, password, name);
      onAuthSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (profile: 'user_a' | 'user_b' | 'guest') => {
    setError('');
    setLoading(true);
    try {
      const res = await apiLoginDemo(profile);
      onAuthSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-[#E8E5DF] rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative text-stone-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[#B88E3D] text-[11px] font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Private User Decision Library</span>
          </div>
          <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-[#2C221E]">
            {currentUser ? 'User Profile & Account' : 'Sign In to Your Decision Workspace'}
          </h3>
          <p className="text-xs text-stone-600">
            Every decision analysis is stored strictly in your private, authenticated account.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {currentUser ? (
          <div className="space-y-5 pt-1">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2C221E] text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{currentUser.name}</h4>
                  <p className="text-xs font-mono text-stone-500">{currentUser.email}</p>
                </div>
              </div>
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Isolated Private Library Active</span>
              </div>
            </div>

            {/* Quick Demo Profile Switcher for fast verification */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-stone-500 tracking-wider block">
                Switch Test Account (Multi-User Verification)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickDemo('user_a')}
                  disabled={loading}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    currentUser.email.includes('workspace1')
                      ? 'bg-amber-50/70 border-[#B88E3D] font-bold text-stone-900'
                      : 'bg-white border-[#E8E5DF] text-stone-700 hover:border-[#B88E3D]'
                  }`}
                >
                  <span className="block font-bold text-stone-900">Workspace Demo A</span>
                  <span className="text-[10px] text-stone-500 font-mono">Test Account 1</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('user_b')}
                  disabled={loading}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    currentUser.email.includes('workspace2')
                      ? 'bg-amber-50/70 border-[#B88E3D] font-bold text-stone-900'
                      : 'bg-white border-[#E8E5DF] text-stone-700 hover:border-[#B88E3D]'
                  }`}
                >
                  <span className="block font-bold text-stone-900">Workspace Demo B</span>
                  <span className="text-[10px] text-stone-500 font-mono">Test Account 2</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2C221E] hover:bg-[#3D312B] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Demo Switcher Buttons */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-stone-500 tracking-wider block">
                Instant Demo Access (Test Isolation)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user_a')}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-white border border-[#E8E5DF] hover:border-[#B88E3D] text-left text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <span className="font-bold block text-stone-900">Workspace Demo A</span>
                  <span className="text-[10px] text-stone-500">Test Account 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user_b')}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-white border border-[#E8E5DF] hover:border-[#B88E3D] text-left text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <span className="font-bold block text-stone-900">Workspace Demo B</span>
                  <span className="text-[10px] text-stone-500">Test Account 2</span>
                </button>
              </div>
            </div>

            <div className="flex border-b border-[#E8E5DF]">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 pb-2.5 text-xs font-bold text-center transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'text-[#B88E3D] border-b-2 border-[#B88E3D]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 pb-2.5 text-xs font-bold text-center transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'text-[#B88E3D] border-b-2 border-[#B88E3D]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#2C221E] hover:bg-[#3D312B] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E5DF] text-xs text-stone-900 focus:outline-none focus:border-[#B88E3D]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#2C221E] hover:bg-[#3D312B] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
