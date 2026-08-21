import React, { useState, useRef, useEffect } from 'react';
import { User, DecisionAnalysis } from '../types';
import { apiUpdateProfile } from '../utils/api';
import {
  X,
  ArrowLeft,
  User as UserIcon,
  Camera,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  Award,
  LogOut,
  Mail,
} from 'lucide-react';

interface UserProfileModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updatedUser: User) => void;
  onLogout: () => void;
  savedDecisions?: DecisionAnalysis[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onProfileUpdated,
  onLogout,
  savedDecisions = [],
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
      setErrorMessage('');
      setSaveSuccess(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  // Compute user statistics
  const safeDecisions = Array.isArray(savedDecisions) ? savedDecisions : [];
  const totalDecisions = safeDecisions.length;
  const decidedCount = safeDecisions.filter(
    (d) => d.status === 'decided' || Boolean(d.selectedOptionId) || Boolean(d.recommendation?.recommendedOptionId)
  ).length;
  const favoriteCount = safeDecisions.filter((d) => d.isFavorite).length;

  const memberSince = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent';

  // Handle avatar upload via file input
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image file must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setErrorMessage('');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try a different image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const res = await apiUpdateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar,
      });

      onProfileUpdated(res.user);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "We couldn't save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div className="editorial-modal-shell w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-[#141413] my-auto relative shadow-2xl">
        {/* Pinned Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-[#E4DFD5] flex items-center justify-between bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 bg-[#F4EFE6] hover:bg-[#EBE4D8] border border-[#D5CEBF] cursor-pointer transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C49235]" />
              <span>Back</span>
            </button>

            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#141413] text-[#FAF8F5] text-[10px] font-mono uppercase tracking-widest font-bold">
                <UserIcon className="w-3 h-3 text-[#C49235]" />
                <span>Account & Profile</span>
              </div>
              <h2 id="profile-title" className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#141413]">
                Profile Settings
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 border border-transparent hover:border-[#141413] hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-5 flex-1 text-xs sm:text-sm">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 border border-rose-300 bg-rose-50 text-rose-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Profile saved successfully. Changes are persisted with your account.</span>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#F4EFE6] border border-[#E0D9CC]">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-stone-500 font-bold">
                <Layers className="w-3 h-3 text-[#141413]" />
                <span>Decisions</span>
              </div>
              <span className="font-serif text-xl font-bold text-[#141413] block mt-0.5">
                {totalDecisions}
              </span>
            </div>

            <div className="p-3 bg-[#F4EFE6] border border-[#E0D9CC]">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-stone-500 font-bold">
                <Award className="w-3 h-3 text-[#C49235]" />
                <span>Decided</span>
              </div>
              <span className="font-serif text-xl font-bold text-[#141413] block mt-0.5">
                {decidedCount}
              </span>
            </div>

            <div className="p-3 bg-[#F4EFE6] border border-[#E0D9CC]">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-stone-500 font-bold">
                <Sparkles className="w-3 h-3 text-[#C49235]" />
                <span>Favorites</span>
              </div>
              <span className="font-serif text-xl font-bold text-[#141413] block mt-0.5">
                {favoriteCount}
              </span>
            </div>

            <div className="p-3 bg-[#F4EFE6] border border-[#E0D9CC]">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-stone-500 font-bold">
                <Calendar className="w-3 h-3 text-stone-600" />
                <span>Member</span>
              </div>
              <span className="text-xs font-semibold text-[#141413] block mt-1 truncate" title={memberSince}>
                {memberSince}
              </span>
            </div>
          </div>

          {/* Avatar Upload / Management */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#FAF8F5] border border-[#E4DFD5]">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#141413] bg-[#141413] text-[#FAF8F5] flex items-center justify-center font-serif text-2xl font-bold overflow-hidden shadow-[2px_2px_0px_#141413]">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name || 'Profile Avatar'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{name ? name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <span className="text-xs font-bold text-[#141413] block">Profile Picture</span>
                <span className="text-[11px] text-stone-500 block">
                  PNG, JPG, or WebP (max 2MB). Persists across your sessions.
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  id="avatar-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="editorial-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#C49235]" />
                  <span>{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-950 border border-rose-300 hover:border-rose-700 bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
              className="editorial-input w-full p-2.5 text-sm font-medium"
            />
          </div>

          {/* Email Address (Read-only verified account) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Email Address
              </label>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 font-semibold">
                Verified Account
              </span>
            </div>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3" />
              <input
                type="email"
                value={currentUser.email}
                readOnly
                disabled
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-stone-100 border border-[#D5CEBF] text-stone-600 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {/* Bio Textarea (Proper multi-line, scrollable, character limited) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                Biography & Decision Priorities
              </label>
              <span className="text-[10px] font-mono text-stone-500">
                {bio.length} / 300
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Tell Tiebreaker what values guide your choices (e.g. long-term financial freedom, family time, career upside, peace of mind)..."
              className="editorial-input w-full p-2.5 text-xs sm:text-sm leading-relaxed"
            />
            <p className="text-[11px] text-stone-500">
              Brief context about your career stage, personal goals, or values.
            </p>
          </div>
        </form>

        {/* Pinned Bottom Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-[#E4DFD5] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold text-rose-700 hover:text-rose-950 border border-rose-300 hover:border-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none editorial-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none editorial-btn-primary px-5 py-2 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-[#D4A338]"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
