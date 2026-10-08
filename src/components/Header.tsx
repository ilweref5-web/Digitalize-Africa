import React from 'react';
import { 
  QrCode, 
  Tv, 
  Mail, 
  Settings, 
  Volume2, 
  VolumeX, 
  Download, 
  ExternalLink,
  Users,
  Edit3,
  BarChart3,
  Lock,
  UserCheck
} from 'lucide-react';
import { MeetingConfig, OrganizerUser } from '../types';

interface HeaderProps {
  meeting: MeetingConfig;
  onOpenStageMode: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenQrEditor: () => void;
  onOpenReporting: () => void;
  onOpenLogin: () => void;
  onOpenRegistrationForm: () => void;
  onExportCsv: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  unreadNotificationsCount?: number;
  viewMode: 'dashboard' | 'form';
  onSetViewMode: (mode: 'dashboard' | 'form') => void;
  currentUser?: OrganizerUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  meeting,
  onOpenStageMode,
  onOpenNotifications,
  onOpenSettings,
  onOpenQrEditor,
  onOpenReporting,
  onOpenLogin,
  onOpenRegistrationForm,
  onExportCsv,
  soundEnabled,
  onToggleSound,
  unreadNotificationsCount = 0,
  viewMode,
  onSetViewMode,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Branding & Status */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 shadow-md">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
                  {meeting.title || 'Meeting RSVP Portal'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live RSVP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Organizers: David Nkwe &bull; Katlego Mathunywa &bull; Notifications Active
              </p>
            </div>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 flex items-center">
              <button
                onClick={() => onSetViewMode('dashboard')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="View Dashboard"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Dashboard</span>
                </span>
              </button>
              <button
                onClick={() => onSetViewMode('form')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'form'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="View Registration Form"
              >
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Attendee Form</span>
                </span>
              </button>
            </div>

            {/* Reports Suite Button */}
            <button
              onClick={onOpenReporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              title="Access Persistent Attendance & RSVP Reports"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Reports</span>
            </button>

            {/* Edit QR Code Information */}
            <button
              onClick={onOpenQrEditor}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Edit QR Code Destinations & Information"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">Edit QR</span>
            </button>

            {/* Stage / Projector Mode */}
            <button
              onClick={onOpenStageMode}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              title="Show Fullscreen Presenter / TV Screen with Big QR Code"
            >
              <Tv className="w-4 h-4 text-indigo-200" />
              <span className="hidden lg:inline">Screen Mode</span>
            </button>

            {/* Organizer Login / Account Badge */}
            <button
              onClick={onOpenLogin}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                currentUser 
                  ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60' 
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750'
              }`}
              title={currentUser ? `Logged in as ${currentUser.fullName} (${currentUser.username})` : 'Organizer Login (David Nkwe / Katlego Mathunywa)'}
            >
              {currentUser ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">{currentUser.username}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Organizer Login</span>
                </>
              )}
            </button>

            {/* Email Notifications Center */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Notifications Log (Dave Nkwe & Kenny Weeder)"
            >
              <Mail className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Sound Chime Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-slate-800 text-indigo-400 border-indigo-500/40 hover:bg-slate-750' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={soundEnabled ? 'Chime sound on registration: Enabled' : 'Chime sound: Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Meeting Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Meeting & Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
