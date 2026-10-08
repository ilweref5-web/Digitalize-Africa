import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode as QrIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Smartphone, 
  Sparkles,
  Edit3,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { MeetingConfig } from '../types';

interface QrCodeDisplayProps {
  meeting: MeetingConfig;
  onOpenMobileSimulator: () => void;
  onOpenQrEditor: () => void;
  onOpenFullscreenQr?: () => void;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  meeting,
  onOpenMobileSimulator,
  onOpenQrEditor,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [targetUrl, setTargetUrl] = useState<string>('');

  const qrConfig = meeting.qrConfig || {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Instant RSVP & Partner Portals',
    customUrl: '',
    googleFormsUrl: meeting.googleFormsUrl || '',
    eotofUrl: meeting.eotofUrl || 'https://www.eotof.co.za',
    damlogateUrl: meeting.damlogateUrl || 'https://www.damlogate.co.za',
    showEotofLink: true,
    showDamlogateLink: true,
    additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    errorCorrectionLevel: 'H',
  };

  useEffect(() => {
    const origin = window.location.origin;
    let finalUrl = '';

    if (qrConfig.mode === 'registration_hub') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'register');
      finalUrl = url.toString();
    } else if (qrConfig.mode === 'google_form_direct') {
      finalUrl = qrConfig.googleFormsUrl || `${origin}?view=register`;
    } else if (qrConfig.mode === 'portal_links') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'portals');
      finalUrl = url.toString();
    } else if (qrConfig.mode === 'custom_url') {
      finalUrl = qrConfig.customUrl || origin;
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'register');
      finalUrl = url.toString();
    }

    setTargetUrl(finalUrl);

    // Generate high-res QR code
    QRCode.toDataURL(finalUrl, {
      width: 440,
      margin: 2,
      color: {
        dark: qrConfig.fgColor || '#0f172a',
        light: qrConfig.bgColor || '#ffffff',
      },
      errorCorrectionLevel: qrConfig.errorCorrectionLevel || 'H',
    }).then(setQrDataUrl).catch(console.error);
  }, [meeting, qrConfig]);

  const handleCopyLink = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `meeting-rsvp-qr-${meeting.title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const qrPixelSize = 
    qrSize === 'md' ? 'w-48 h-48 sm:w-56 sm:h-56' : 
    qrSize === 'lg' ? 'w-60 h-60 sm:w-72 sm:h-72' : 
    'w-72 h-72 sm:w-84 sm:h-84';

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header with Title and Editor Button */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {qrConfig.badgeText || 'Live Scannable QR'}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Desktop Monitor Optimized
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              {qrConfig.qrTitle || 'Scan from Desktop Screen'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {qrConfig.qrSubtitle || 'Attendees can point their smartphone camera directly at this screen to register.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Edit QR Code Info button */}
            <button
              onClick={onOpenQrEditor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Edit QR information, links, and partner portals"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit QR Info</span>
            </button>

            {/* Size controls */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60">
              <button
                onClick={() => setQrSize('md')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded ${qrSize === 'md' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Standard Size"
              >
                M
              </button>
              <button
                onClick={() => setQrSize('lg')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded ${qrSize === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Large Size"
              >
                L
              </button>
              <button
                onClick={() => setQrSize('xl')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded ${qrSize === 'xl' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Extra Large"
              >
                XL
              </button>
            </div>
          </div>
        </div>

        {/* The QR Code Card Frame */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative p-4 sm:p-5 bg-white rounded-2xl shadow-2xl border-4 border-indigo-500/30 flex items-center justify-center transition-all">
            {/* Target corners indicator */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-600"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-600"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-600"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-600"></div>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Registration & Portals QR Code"
                className={`${qrPixelSize} object-contain transition-all duration-200 select-none`}
              />
            ) : (
              <div className={`${qrPixelSize} flex items-center justify-center text-slate-400`}>
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Quick instructions pill below QR */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 max-w-md text-center">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
            <span className="line-clamp-1">Any Cell Phone Camera &rarr; Point at Screen &rarr; Instant RSVP &amp; Portals</span>
          </div>

          {/* Partner Portals Chips Directly Underneath QR Code */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <a
              href={qrConfig.eotofUrl || 'https://www.eotof.co.za'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>www.eotof.co.za</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>

            <a
              href={qrConfig.damlogateUrl || 'https://www.damlogate.co.za'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>www.damlogate.co.za</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Test on screen / Simulator */}
          <button
            onClick={onOpenMobileSimulator}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Preview what mobile scanners see right on your desktop"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Scan</span>
          </button>

          {/* Open in new tab */}
          <a
            href={targetUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="Open link in a new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Link</span>
          </a>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          {/* Download Image */}
          <button
            onClick={handleDownloadQr}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Save PNG for slide decks or printed signage"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
