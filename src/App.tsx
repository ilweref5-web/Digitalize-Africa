/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MeetingConfig, 
  Registration, 
  RegistrationStats, 
  NotificationRecord,
  QrCodeConfig
} from './types';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { QrCodeDisplay } from './components/QrCodeDisplay';
import { AttendeeList } from './components/AttendeeList';
import { RegistrationForm } from './components/RegistrationForm';
import { PresenterStageMode } from './components/PresenterStageMode';
import { NotificationModal } from './components/NotificationModal';
import { MeetingSettingsModal } from './components/MeetingSettingsModal';
import { MobileSimulatorModal } from './components/MobileSimulatorModal';
import { QrInformationEditorModal } from './components/QrInformationEditorModal';
import { playNotificationChime } from './utils/audio';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  PlusCircle,
  Tv,
  Edit3,
  Globe,
  ExternalLink,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [meeting, setMeeting] = useState<MeetingConfig>({
    title: 'Executive Strategic Planning & Operations Meeting 2026',
    description: 'Quarterly all-hands briefing and departmental milestone review with leadership and project partners.',
    date: '2026-10-15',
    time: '10:00 AM - 12:30 PM (CAT / UTC+2)',
    location: 'Boardroom Suite A & Virtual Livestream',
    isVirtualAvailable: true,
    meetingLink: 'https://meet.google.com/ex-strat-2026',
    notificationEmails: ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com'],
    organizerNames: ['Dave Nkwe', 'Kenny Weeder'],
    googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
    eotofUrl: 'https://www.eotof.co.za',
    damlogateUrl: 'https://www.damlogate.co.za',
    qrConfig: {
      mode: 'registration_hub',
      qrTitle: 'Scan to Register & Access Portals',
      qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
      badgeText: 'Instant RSVP & Partner Portals',
      customUrl: '',
      googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
      eotofUrl: 'https://www.eotof.co.za',
      damlogateUrl: 'https://www.damlogate.co.za',
      showEotofLink: true,
      showDamlogateLink: true,
      additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      errorCorrectionLevel: 'H',
    },
  });

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats>({
    total: 0,
    attending: 0,
    inPerson: 0,
    virtual: 0,
    declined: 0,
    attendanceRate: 0,
  });
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  // Navigation & Modals
  const [viewMode, setViewMode] = useState<'dashboard' | 'form'>('dashboard');
  const [isStageModeOpen, setIsStageModeOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [isQrEditorOpen, setIsQrEditorOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keep track of registration count for real-time sound alert
  const previousCountRef = useRef<number | null>(null);

  // Check URL query parameters: if ?view=register or ?view=portals, open registration/portal view directly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'register' || params.get('view') === 'form' || params.get('view') === 'portals') {
      setViewMode('form');
    }
  }, []);

  // Fetch live registrations & stats from backend
  const fetchData = async () => {
    try {
      const res = await fetch('/api/registrations');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        setStats(data.stats || {
          total: 0,
          attending: 0,
          inPerson: 0,
          virtual: 0,
          declined: 0,
          attendanceRate: 0,
        });
        if (data.meeting) {
          setMeeting(data.meeting);
        }

        // Check if new registration arrived to trigger chime
        const newCount = (data.registrations || []).length;
        if (previousCountRef.current !== null && newCount > previousCountRef.current) {
          if (soundEnabled) {
            playNotificationChime();
          }
        }
        previousCountRef.current = newCount;
      }

      // Fetch notification history
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.debug('Error fetching real-time data:', err);
    }
  };

  // Initial fetch and real-time polling every 2.5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleDeleteAttendee = async (id: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleResetData = async (mode: 'sample' | 'empty') => {
    try {
      const res = await fetch('/api/registrations/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleSaveMeeting = async (updated: MeetingConfig) => {
    const res = await fetch('/api/meeting', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const result = await res.json();
      setMeeting(result.config);
    }
  };

  const handleSaveQrConfig = async (updatedConfig: QrCodeConfig) => {
    const res = await fetch('/api/meeting/qr-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig),
    });
    if (res.ok) {
      const result = await res.json();
      setMeeting(prev => ({
        ...prev,
        qrConfig: result.qrConfig,
        eotofUrl: result.meeting?.eotofUrl || prev.eotofUrl,
        damlogateUrl: result.meeting?.damlogateUrl || prev.damlogateUrl,
        googleFormsUrl: result.qrConfig?.googleFormsUrl || prev.googleFormsUrl,
      }));
    }
  };

  const handleTriggerDigest = async () => {
    const res = await fetch('/api/notifications/digest', { method: 'POST' });
    if (res.ok) {
      fetchData();
    }
  };

  const handleExportCsv = () => {
    window.open('/api/export/csv', '_blank');
  };

  // If viewing attendee form (e.g., when scanned on any cell phone model)
  if (viewMode === 'form') {
    return (
      <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-600 selection:text-white">
        <RegistrationForm
          meeting={meeting}
          onSubmitSuccess={() => {
            fetchData();
          }}
          onBackToDashboard={() => {
            // Update URL query parameter
            const url = new URL(window.location.href);
            url.searchParams.delete('view');
            window.history.pushState({}, '', url.toString());
            setViewMode('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        meeting={meeting}
        onOpenStageMode={() => setIsStageModeOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenQrEditor={() => setIsQrEditorOpen(true)}
        onOpenRegistrationForm={() => setViewMode('form')}
        onExportCsv={handleExportCsv}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        unreadNotificationsCount={notifications.length}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Meeting Overview Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Meeting Organizer Dashboard
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync (Polling Active)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {meeting.title}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                {meeting.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {meeting.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {meeting.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {meeting.location}
                </span>
              </div>
            </div>

            {/* Quick Hero Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => setIsQrEditorOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit QR Code Information</span>
              </button>

              <button
                onClick={() => setIsStageModeOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Tv className="w-4 h-4 text-indigo-400" />
                <span>Open Screen Stage Mode</span>
              </button>

              <button
                onClick={() => setIsMobileSimulatorOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Simulate Cell Phone Scan</span>
              </button>
            </div>
          </div>

          {/* Quick Partner Portal Banner in Hero */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-300">Shared in QR Code:</span>
              <span className="text-slate-400">Cell phones scanning this screen also receive official partner portals</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={meeting.eotofUrl || 'https://www.eotof.co.za'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 font-mono text-indigo-300 hover:underline"
              >
                <span>www.eotof.co.za</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>&bull;</span>
              <a
                href={meeting.damlogateUrl || 'https://www.damlogate.co.za'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 font-mono text-emerald-300 hover:underline"
              >
                <span>www.damlogate.co.za</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Real-time RSVP Metrics Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attendance Counters &amp; Analytics
            </h2>
            <span className="text-[11px] text-slate-500">Live RSVP Counts</span>
          </div>
          <StatsCards stats={stats} />
        </div>

        {/* Main Grid: QR Code Card & Notification Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Prominent Desktop Scannable QR Code */}
          <div className="lg:col-span-7">
            <QrCodeDisplay
              meeting={meeting}
              onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
              onOpenQrEditor={() => setIsQrEditorOpen(true)}
            />
          </div>

          {/* Side Panel: Notification routing to Dave & Kenny + Quick actions */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Email Dispatch &amp; Portals
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Automated Host Alerts
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Every attendee registration sends automated RSVP alerts to:
                </p>
              </div>

              {/* The two required recipient chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-750">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      DN
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Dave Nkwe</div>
                      <div className="text-[11px] text-slate-400 font-mono">dave.nkwe@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Ready</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-750">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                      KW
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Kenny Weeder</div>
                      <div className="text-[11px] text-slate-400 font-mono">kenny.weeder71@gmail.com</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Ready</span>
                </div>
              </div>

              {/* Partner Portals Fast Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Partner Websites Shared via QR:
                </span>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={meeting.eotofUrl || 'https://www.eotof.co.za'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-[11px] text-slate-400 hover:text-white group"
                  >
                    <span className="font-mono text-indigo-300">www.eotof.co.za</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-300" />
                  </a>
                  <a
                    href={meeting.damlogateUrl || 'https://www.damlogate.co.za'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-[11px] text-slate-400 hover:text-white group"
                  >
                    <span className="font-mono text-emerald-300">www.damlogate.co.za</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-300" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Panel */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>View Alert Logs</span>
              </button>

              <button
                onClick={handleTriggerDigest}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Send current summary digest to Dave & Kenny"
              >
                Send Digest
              </button>
            </div>
          </div>
        </div>

        {/* Full Attendees Live Roster */}
        <div>
          <AttendeeList
            registrations={registrations}
            onDeleteAttendee={handleDeleteAttendee}
            onRefreshData={fetchData}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Meeting RSVP &amp; QR Registration System &bull; Real-Time Tracking Dashboard
          </div>
          <div className="flex items-center gap-3">
            <a href={meeting.eotofUrl || 'https://www.eotof.co.za'} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400">
              www.eotof.co.za
            </a>
            <span>&bull;</span>
            <a href={meeting.damlogateUrl || 'https://www.damlogate.co.za'} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-400">
              www.damlogate.co.za
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PresenterStageMode
        isOpen={isStageModeOpen}
        onClose={() => setIsStageModeOpen(false)}
        meeting={meeting}
        stats={stats}
        registrations={registrations}
        onOpenQrEditor={() => {
          setIsStageModeOpen(false);
          setIsQrEditorOpen(true);
        }}
      />

      <QrInformationEditorModal
        isOpen={isQrEditorOpen}
        onClose={() => setIsQrEditorOpen(false)}
        meeting={meeting}
        onSaveQrConfig={handleSaveQrConfig}
        onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        meeting={meeting}
        stats={stats}
        notifications={notifications}
        registrations={registrations}
        onTriggerDigest={handleTriggerDigest}
      />

      <MeetingSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        meeting={meeting}
        onSaveMeeting={handleSaveMeeting}
        onResetData={handleResetData}
      />

      <MobileSimulatorModal
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        meeting={meeting}
        onSubmitSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
