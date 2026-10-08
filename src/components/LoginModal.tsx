import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  LogIn,
  Phone,
  Mail,
  Sparkles
} from 'lucide-react';
import { OrganizerUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: OrganizerUser) => void;
  currentUser?: OrganizerUser | null;
  onLogout?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout,
}) => {
  const [username, setUsername] = useState('DaveN');
  const [password, setPassword] = useState('Damlo@1234');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickUser = (user: 'dave' | 'katlego' | 'kmat') => {
    if (user === 'dave') {
      setUsername('DaveN');
      setPassword('Damlo@1234');
    } else if (user === 'kmat') {
      setUsername('Kmat');
      setPassword('Data@1234');
    } else {
      setUsername('KatlegoM');
      setPassword('Damlo@1234');
    }
    setErrorMessage(null);
  };

  // If already logged in, show current session profile card with logout option
  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Organizer Authenticated</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-850 border border-slate-750">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                {currentUser.avatarInitials || currentUser.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{currentUser.fullName}</h3>
                <p className="text-xs text-indigo-400 font-medium">{currentUser.role}</p>
                <div className="text-[11px] text-slate-400 font-mono mt-1">User ID: {currentUser.username}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser.email}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/60 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Organizer Portal Login</h2>
              <p className="text-xs text-slate-400">David Nkwe &amp; Katlego Mathunywa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick User Selectors */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Authorized Organizer Accounts:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectQuickUser('dave')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  username.toLowerCase() === 'daven'
                    ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-850 border-slate-750 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white">David Nkwe</div>
                <div className="text-[10px] text-indigo-300 font-mono">User ID: DaveN</div>
                <div className="text-[9px] text-slate-400">+27 76 977 5423</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickUser('kmat')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  username.toLowerCase() === 'kmat'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-850 border-slate-750 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white">Katlego Mathunywa</div>
                <div className="text-[10px] text-emerald-300 font-mono">User ID: Kmat</div>
                <div className="text-[9px] text-slate-400">Pass: Data@1234</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickUser('katlego')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  username.toLowerCase() === 'katlegom'
                    ? 'bg-purple-950/70 border-purple-500 text-white shadow-sm'
                    : 'bg-slate-850 border-slate-750 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white">Katlego (Alt)</div>
                <div className="text-[10px] text-purple-300 font-mono">User ID: KatlegoM</div>
                <div className="text-[9px] text-slate-400">+27 69 497 7018</div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                User ID / Login ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="DaveN or KatlegoM"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Default: Damlo@1234</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Organizer</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            Secure session access for meeting reporting, RSVP administration &amp; data export.
          </div>
        </div>
      </div>
    </div>
  );
};
