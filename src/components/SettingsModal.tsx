import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  SlidersHorizontal,
  Download,
  Upload,
  Trash2,
  Check,
  User,
  Shield,
  Moon,
  Sun,
  AlertTriangle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onOpenProfile: () => void;
  onLogout: () => void;
  onExport: () => void;
  onImport: () => void;
  savedCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenProfile,
  onLogout,
  onExport,
  onImport,
  savedCount,
}) => {
  const [autoSave, setAutoSave] = useState(true);
  const [detailLevel, setDetailLevel] = useState<'balanced' | 'concise' | 'inDepth'>('balanced');
  const [clearSuccess, setClearSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear temporary browser cache? (Your saved decisions in your account will stay intact).')) {
      try {
        sessionStorage.clear();
        setClearSuccess(true);
        setTimeout(() => setClearSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to clear cache:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="skeuo-modal-shell max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-stone-900 rounded-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E0D9CC] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 bg-[#F4EFE6] hover:bg-[#EBE4D8] border border-[#D5CEBF] rounded-lg cursor-pointer transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B88E3D]" />
              <span>Back</span>
            </button>

            <div className="w-9 h-9 rounded-xl skeuo-btn-primary text-[#D4A338] flex items-center justify-center font-bold shrink-0 hidden xs:flex">
              <SlidersHorizontal className="w-4 h-4 text-[#D4A338]" />
            </div>
            <div>
              <h2 className="font-serif italic text-lg sm:text-xl text-[#2C221E] font-bold">
                Application Settings
              </h2>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Preferences, data storage, and account controls
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-stone-800 leading-relaxed font-sans custom-scrollbar">
          {/* 1. Account Section */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Account & Profile
            </span>
            <div className="p-4 rounded-xl skeuo-well flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full skeuo-btn-primary text-[#D4A338] flex items-center justify-center font-serif italic text-base font-bold shrink-0">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'G'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C221E] truncate">
                    {currentUser ? currentUser.name : 'Guest User'}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentUser ? currentUser.email : 'Local device session'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="px-3.5 py-1.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-800 hover:text-[#B88E3D] shrink-0 cursor-pointer"
              >
                {currentUser ? 'Edit Profile' : 'Sign In'}
              </button>
            </div>
          </div>

          {/* 2. Analysis Preferences */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Analysis Preferences
            </span>
            <div className="p-4 rounded-xl skeuo-well space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-stone-900">Auto-save Decisions</h4>
                  <p className="text-[11px] text-stone-500">Automatically save new analysis to your library</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSave(!autoSave)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoSave ? 'bg-[#B88E3D]' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      autoSave ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 border-t border-[#E0D9CC] space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Default Analysis Detail Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'concise', label: 'Concise' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'inDepth', label: 'In-Depth' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDetailLevel(item.id as any)}
                      className={`p-2 rounded-lg text-center text-xs font-semibold cursor-pointer transition-all ${
                        detailLevel === item.id
                          ? 'skeuo-btn-primary text-white font-bold'
                          : 'skeuo-btn-secondary text-stone-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Data & Privacy Management */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Data Management & Backup
            </span>
            <div className="p-4 rounded-xl skeuo-well space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700">Decisions Saved in Library:</span>
                <span className="font-mono font-bold text-[#B88E3D] px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                  {savedCount}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onExport}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-800 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>Export Backup (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={onImport}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg skeuo-btn-secondary text-xs font-bold text-stone-800 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#B88E3D]" />
                  <span>Import Backup (JSON)</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#E0D9CC] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-800 block">Temporary Browser Cache</span>
                  <span className="text-[11px] text-stone-500">Free up local storage</span>
                </div>

                <button
                  type="button"
                  onClick={handleClearCache}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cache</span>
                </button>
              </div>

              {clearSuccess && (
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Browser cache cleaned successfully.</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Session & Sign out */}
          {currentUser && (
            <div className="pt-2 border-t border-[#E0D9CC] flex items-center justify-between">
              <span className="text-xs text-stone-500">Currently logged in as {currentUser.email}</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E0D9CC] flex items-center justify-end bg-[#FAF7F2]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl skeuo-btn-primary text-xs font-bold uppercase tracking-wider text-[#D4A338] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
