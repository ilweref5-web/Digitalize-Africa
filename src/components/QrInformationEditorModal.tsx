import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Save, 
  QrCode as QrIcon, 
  Globe, 
  FileText, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Layers, 
  Sparkles, 
  Palette, 
  Eye, 
  Copy,
  Info,
  ShieldCheck
} from 'lucide-react';
import { MeetingConfig, QrCodeConfig, QrTargetMode } from '../types';

interface QrInformationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingConfig;
  onSaveQrConfig: (config: QrCodeConfig) => Promise<void>;
  onOpenMobileSimulator: () => void;
}

export const QrInformationEditorModal: React.FC<QrInformationEditorModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSaveQrConfig,
  onOpenMobileSimulator,
}) => {
  const [config, setConfig] = useState<QrCodeConfig>(() => meeting.qrConfig || {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Instant RSVP & Partner Portals',
    customUrl: '',
    googleFormsUrl: meeting.googleFormsUrl || 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
    eotofUrl: meeting.eotofUrl || 'https://www.eotof.co.za',
    damlogateUrl: meeting.damlogateUrl || 'https://www.damlogate.co.za',
    showEotofLink: true,
    showDamlogateLink: true,
    additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    errorCorrectionLevel: 'H',
  });

  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');
  const [resolvedEncodedUrl, setResolvedEncodedUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Compute what URL is encoded into the QR code based on selected mode
  const getEncodedUrl = (cfg: QrCodeConfig): string => {
    const origin = window.location.origin;
    if (cfg.mode === 'registration_hub') {
      const url = new URL(origin);
      url.searchParams.set('view', 'register');
      return url.toString();
    } else if (cfg.mode === 'google_form_direct') {
      return cfg.googleFormsUrl || `${origin}?view=register`;
    } else if (cfg.mode === 'portal_links') {
      const url = new URL(origin);
      url.searchParams.set('view', 'portals');
      return url.toString();
    } else if (cfg.mode === 'custom_url') {
      return cfg.customUrl || origin;
    }
    return `${origin}?view=register`;
  };

  // Re-generate live preview QR code whenever config changes
  useEffect(() => {
    const encoded = getEncodedUrl(config);
    setResolvedEncodedUrl(encoded);

    QRCode.toDataURL(encoded, {
      width: 400,
      margin: 2,
      color: {
        dark: config.fgColor || '#0f172a',
        light: config.bgColor || '#ffffff',
      },
      errorCorrectionLevel: config.errorCorrectionLevel || 'H',
    }).then(setPreviewQrUrl).catch(console.error);
  }, [config]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveQrConfig(config);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resolvedEncodedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                QR Code Information &amp; Content Editor
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
                  Desktop Screen Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Customize destination links, partner portals (eotof.co.za &amp; damlogate.co.za), and displayed metadata.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (7 cols) */}
          <form id="qr-editor-form" onSubmit={handleSave} className="lg:col-span-7 space-y-5">
            {/* 1. Destination Mode Selection */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                QR Destination &amp; Scan Behavior
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Mode 1 */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'registration_hub'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="registration_hub"
                      checked={config.mode === 'registration_hub'}
                      onChange={() => setConfig({ ...config, mode: 'registration_hub' })}
                      className="text-indigo-600"
                    />
                    <span className="font-bold text-white">Full Registration Hub</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Google Form RSVP + Instant buttons for www.eotof.co.za &amp; www.damlogate.co.za
                  </p>
                </label>

                {/* Mode 2 */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'google_form_direct'
                    ? 'bg-purple-950/60 border-purple-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="google_form_direct"
                      checked={config.mode === 'google_form_direct'}
                      onChange={() => setConfig({ ...config, mode: 'google_form_direct' })}
                      className="text-purple-600"
                    />
                    <span className="font-bold text-white">Direct Google Form</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Opens external or dedicated Google Form URL directly on phone camera scan
                  </p>
                </label>

                {/* Mode 3 */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'portal_links'
                    ? 'bg-blue-950/60 border-blue-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="portal_links"
                      checked={config.mode === 'portal_links'}
                      onChange={() => setConfig({ ...config, mode: 'portal_links' })}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-white">Partner Portals Hub</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Direct landing page focusing on www.eotof.co.za &amp; www.damlogate.co.za
                  </p>
                </label>

                {/* Mode 4 */}
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  config.mode === 'custom_url'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="qrMode"
                      value="custom_url"
                      checked={config.mode === 'custom_url'}
                      onChange={() => setConfig({ ...config, mode: 'custom_url' })}
                      className="text-emerald-600"
                    />
                    <span className="font-bold text-white">Custom Target URL</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Directly encode any custom link into the QR code
                  </p>
                </label>
              </div>
            </div>

            {/* If Google Form Direct or Custom URL selected */}
            {config.mode === 'google_form_direct' && (
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Google Form Destination Link
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  value={config.googleFormsUrl}
                  onChange={(e) => setConfig({ ...config, googleFormsUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-purple-500/40 text-white font-mono focus:outline-none focus:border-purple-400"
                />
                <p className="text-[11px] text-purple-300/80">
                  Tip: Standard form collects Full Name, Email, and Attendance Confirmation (Yes/No).
                </p>
              </div>
            )}

            {config.mode === 'custom_url' && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Custom URL To Encode
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.example.com"
                  value={config.customUrl}
                  onChange={(e) => setConfig({ ...config, customUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            {/* 2. Partner Websites (www.eotof.co.za and www.damlogate.co.za) */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Shared Partner Portals (Cell Phone Accessible)
                </label>
                <span className="text-[10px] text-slate-400">Scanners will get these portals</span>
              </div>

              {/* Portal 1: www.eotof.co.za */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Portal 1: EOTOF</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showEotofLink}
                      onChange={(e) => setConfig({ ...config, showEotofLink: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Visible in mobile scan hub</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.eotofUrl}
                    onChange={(e) => setConfig({ ...config, eotofUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <a
                    href={config.eotofUrl.startsWith('http') ? config.eotofUrl : `https://${config.eotofUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
                    title="Open www.eotof.co.za"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Portal 2: www.damlogate.co.za */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Portal 2: Damlogate</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showDamlogateLink}
                      onChange={(e) => setConfig({ ...config, showDamlogateLink: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Visible in mobile scan hub</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.damlogateUrl}
                    onChange={(e) => setConfig({ ...config, damlogateUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <a
                    href={config.damlogateUrl.startsWith('http') ? config.damlogateUrl : `https://${config.damlogateUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
                    title="Open www.damlogate.co.za"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Text Visible on Desktop Screen Around QR */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Text Visible on Desktop Screen Around QR
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Header Title</label>
                  <input
                    type="text"
                    value={config.qrTitle}
                    onChange={(e) => setConfig({ ...config, qrTitle: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Top Badge Text</label>
                  <input
                    type="text"
                    value={config.badgeText}
                    onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Subtitle / Scan Instructions</label>
                <input
                  type="text"
                  value={config.qrSubtitle}
                  onChange={(e) => setConfig({ ...config, qrSubtitle: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bottom Notice</label>
                <input
                  type="text"
                  value={config.additionalInfo}
                  onChange={(e) => setConfig({ ...config, additionalInfo: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 4. Scanning Reliability & Appearance */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-400" />
                Screen Scanning Optimization
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Error Correction</label>
                  <select
                    value={config.errorCorrectionLevel}
                    onChange={(e) => setConfig({ ...config, errorCorrectionLevel: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none"
                  >
                    <option value="H">High (30% redundancy - Best for desktop screens)</option>
                    <option value="Q">Quartile (25% redundancy)</option>
                    <option value="M">Medium (15% redundancy)</option>
                    <option value="L">Low (7% redundancy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">QR Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.fgColor}
                      onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-slate-300 text-[11px]">{config.fgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Right Column: Live QR Code Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="p-5 rounded-2xl bg-slate-850 border border-slate-750 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-3">
                <Eye className="w-4 h-4" />
                <span>Live Desktop Screen Preview</span>
              </div>

              {/* The Rendered QR Code */}
              <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/40 my-2">
                {/* Targeting corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-600"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-600"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-600"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-600"></div>

                {previewQrUrl ? (
                  <img
                    src={previewQrUrl}
                    alt="Preview QR Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain select-none"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Cell Phone Compatibility Badge */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compatible with all cell phone cameras</span>
              </div>

              {/* Encoded URL display & copy */}
              <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Encoded Link:</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-white font-mono break-all line-clamp-2">
                  {resolvedEncodedUrl}
                </p>
              </div>

              {/* Mobile Scan Simulator test button */}
              <button
                type="button"
                onClick={onOpenMobileSimulator}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test Phone Scan Experience</span>
              </button>
            </div>

            {/* Quick summary of what scanner receives */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
              <span className="font-bold text-white block text-[11px] uppercase tracking-wider">
                What Cell Phone Scanners Get:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Google Form Meeting Registration (Name, Email, Attendance Yes/No)</span>
                </li>
                {config.showEotofLink && (
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Direct portal access to <strong>www.eotof.co.za</strong></span>
                  </li>
                )}
                {config.showDamlogateLink && (
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Direct portal access to <strong>www.damlogate.co.za</strong></span>
                  </li>
                )}
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Automated alerts sent to Dave &amp; Kenny upon submission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-400 hidden sm:block">
            Changes immediately update the desktop screen QR code.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="qr-editor-form"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved &amp; Updated!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save QR Code Information</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
