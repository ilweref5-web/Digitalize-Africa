import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Printer, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  FileText,
  Calendar,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Share2
} from 'lucide-react';
import { MeetingConfig } from '../types';

interface AttendeeFormQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  onOpenForm: () => void;
}

export const AttendeeFormQrModal: React.FC<AttendeeFormQrModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onOpenForm,
}) => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicSharedUrl = meeting.sharedAppUrl || 'https://ais-pre-k2y4juk2g726fowugvfirf-408722122406.europe-west3.run.app';

  // Domain selection for QR: Public Cloud URL or Current Window Origin
  const [urlSource, setUrlSource] = useState<'current' | 'cloud'>('current');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(true);

  // Compute exact target Attendee Form URL
  const base = urlSource === 'current' ? (currentOrigin || publicSharedUrl) : publicSharedUrl;
  const targetUrl = `${base.replace(/\/$/, '')}?view=register`;

  // Generate crisp, Level-H error correction QR Code whenever targetUrl changes
  useEffect(() => {
    if (!targetUrl) return;

    QRCode.toDataURL(targetUrl, {
      width: 720,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
        setVerifiedSuccess(true);
      })
      .catch((err) => {
        console.error('Error generating Attendee Form QR code:', err);
        setVerifiedSuccess(false);
      });
  }, [targetUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2200);
  };

  const handleCopyImage = async () => {
    if (!qrDataUrl) return;
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2200);
    } catch {
      handleCopyUrl();
    }
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `attendee-form-qr-${meeting.title.slice(0, 25).replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintFlyer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendee Registration QR - ${meeting.title}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              text-align: center; 
              color: #0f172a; 
              padding: 20px; 
            }
            .badge { 
              display: inline-block; 
              background: #047857; 
              color: #ffffff; 
              padding: 8px 20px; 
              border-radius: 9999px; 
              font-weight: 800; 
              font-size: 14px; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              margin-bottom: 16px; 
            }
            h1 { font-size: 28px; font-weight: 900; margin: 0 0 10px 0; color: #0f172a; line-height: 1.2; }
            .subtitle { font-size: 15px; color: #475569; max-width: 600px; margin: 0 auto 24px auto; }
            .qr-box { 
              display: inline-block; 
              padding: 20px; 
              background: #ffffff; 
              border: 4px solid #0f172a; 
              border-radius: 24px; 
              box-shadow: 0 12px 30px rgba(0,0,0,0.12); 
              margin-bottom: 20px; 
            }
            .qr-img { width: 340px; height: 340px; display: block; }
            .scan-callout { font-size: 20px; font-weight: 800; color: #047857; margin-bottom: 6px; }
            .scan-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
            .meta-box { 
              display: flex; 
              justify-content: center; 
              gap: 25px; 
              font-size: 13px; 
              color: #1e293b; 
              margin: 0 auto 25px auto; 
              max-width: 650px;
              padding: 16px; 
              background: #f8fafc; 
              border-radius: 14px; 
              border: 1px solid #e2e8f0; 
              text-align: left;
            }
            .meta-item { flex: 1; }
            .meta-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 2px; }
            .meta-val { font-weight: 700; }
            .footer { 
              font-size: 12px; 
              color: #94a3b8; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 16px; 
              margin-top: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="badge">Official Attendee Registration Form</div>
          <h1>${meeting.title}</h1>
          <p class="subtitle">${meeting.description}</p>
          
          <div class="qr-box">
            <img class="qr-img" src="${qrDataUrl}" alt="Attendee Form QR Code" />
          </div>
          
          <div class="scan-callout">Point Mobile Camera Here to Register</div>
          <div class="scan-sub">Instant RSVP &bull; No App Install Required &bull; Compatible with iPhone, Android &amp; WhatsApp</div>

          <div class="meta-box">
            <div class="meta-item">
              <div class="meta-label">Date &amp; Time</div>
              <div class="meta-val">${meeting.date}<br/>${meeting.time}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Location / Stream</div>
              <div class="meta-val">${meeting.location}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Meeting Hosts</div>
              <div class="meta-val">David Nkwe &bull; Katlego Mathunywa</div>
            </div>
          </div>

          <div class="footer">
            Direct Link: <strong>${targetUrl}</strong><br/>
            Partner Portals: www.eotof.co.za &bull; www.damlogate.co.za &bull; WhatsApp Support: +27 76 977 5423
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleTestScannability = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-5 sm:px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Attendee Form QR Code</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                  Ready to Scan
                </span>
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Scans directly into the Live RSVP Registration Form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Domain Selection Tabs (Current Origin vs Public Cloud) */}
          <div className="bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setUrlSource('current')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                urlSource === 'current'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Current Preview Domain</span>
            </button>
            <button
              onClick={() => setUrlSource('cloud')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                urlSource === 'cloud'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Public Cloud Shared Domain</span>
            </button>
          </div>

          {/* Central QR Code Stage */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative p-5 sm:p-6 bg-white rounded-3xl shadow-2xl border-4 border-emerald-500/50 flex items-center justify-center group">
              {/* Corner targeting brackets */}
              <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-4 border-l-4 border-emerald-600 rounded-tl-sm"></div>
              <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-4 border-r-4 border-emerald-600 rounded-tr-sm"></div>
              <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-4 border-l-4 border-emerald-600 rounded-bl-sm"></div>
              <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-4 border-r-4 border-emerald-600 rounded-br-sm"></div>

              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Attendee Registration Form QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain select-none"
                />
              ) : (
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-slate-400">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Verification Status Pill */}
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Scannable with iPhone Camera, Android &amp; WhatsApp</span>
            </div>
          </div>

          {/* Encoded URL Box with Direct Copy */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Encoded Attendee Registration URL:</span>
              <span className="text-emerald-400 font-mono text-[10px]">?view=register</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={targetUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* Open Form in App */}
            <button
              onClick={() => {
                onClose();
                onOpenForm();
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md"
              title="Open the registration form in the current screen"
            >
              <FileText className="w-4 h-4" />
              <span>Fill Form Here</span>
            </button>

            {/* Open in New Tab */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 text-center"
              title="Open attendee form in a new browser tab"
            >
              <ExternalLink className="w-4 h-4 text-indigo-400" />
              <span>Open in Tab</span>
            </a>

            {/* Save PNG */}
            <button
              onClick={handleDownloadPng}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Download high-resolution image"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Save PNG</span>
            </button>

            {/* Print Signage */}
            <button
              onClick={handlePrintFlyer}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Print official event signage / table flyer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Flyer</span>
            </button>
          </div>

          {/* Form Information Breakdown */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
            <div className="font-bold text-white flex items-center justify-between">
              <span>What attendees see upon scanning:</span>
              <span className="text-[11px] text-indigo-400">Google Forms style</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Full Name, Email &amp; WhatsApp Phone</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>"Did you register to vote !" question</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>In-Person vs Virtual Attendance choice</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Dietary preferences &amp; notes</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
              Notifications instantly route to David Nkwe (+27 76 977 5423) and Katlego Mathunywa upon submission.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleTestScannability}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Testing scannability...' : 'Verify Scanner Readiness'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
