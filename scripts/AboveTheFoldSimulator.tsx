/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Copy,
  Check,
  RotateCcw,
  Wand2,
  ChevronDown,
  ChevronUp,
  Youtube
} from 'lucide-react';

export type SimulatorDeviceMode = 'desktop' | 'mobile';

export interface AboveTheFoldSimulatorProps {
  initialDescription?: string;
  videoTitle?: string;
  channelName?: string;
  channelThumbnail?: string;
  channelSubscribers?: string;
  ctaMarker?: string;
  compact?: boolean;
  onApplyDescription?: (desc: string) => void;
  showApplyButton?: boolean;
}

const PRESET_TEMPLATES = [
  {
    id: 'cpf-advisory',
    name: 'CPF Strategy Consultation (Optimal)',
    badge: '100% Visible',
    badgeColor: 'emerald',
    text: `👉 Book a Cyber Strategy Consultation: https://cpf-coaching.com\n\nIn this session, Christophe Foulon breaks down executive cybersecurity strategies, CISO roadmaps, and career pivots for technical leaders.`
  },
  {
    id: 'bic-book',
    name: 'Breaking Into Cyber Guide (Optimal)',
    badge: '100% Visible',
    badgeColor: 'emerald',
    text: `👉 Get the Breaking Into Cybersecurity Guide: https://cpf-coaching.com/book\n\nDiscover how mid-market leaders insulate infrastructure and hear stories from top cyber professionals transitioning into the field.`
  },
  {
    id: 'buried-trap',
    name: 'Buried Link Trap (Below Fold)',
    badge: '88% CTR Loss',
    badgeColor: 'red',
    text: `Welcome back to the channel! Make sure to like, comment, and subscribe.\nCheck out our merch and social media links below.\nTwitter: @breakingintocyber\nInstagram: @cpfcoaching\n👉 Book consultation: https://cpf-coaching.com`
  }
];

export default function AboveTheFoldSimulator({
  initialDescription = '',
  videoTitle = 'How CISOs Can Secure AI Pipeline Deployments | CPF Coaching',
  channelName = 'Breaking Into Cybersecurity',
  channelThumbnail = 'https://yt3.ggpht.com/7d5_aLcVB9UPEGSWbgivRd4PO-V4iqlzdSYyaC48NO4Y7JkbWNTTlqfxPg5GyluZ_Jk9u-6R2Dg=s800-c-k-c0x00ffffff-no-rj',
  channelSubscribers = '2.03K subscribers',
  ctaMarker = 'https://cpf-coaching.com',
  compact = false,
  onApplyDescription,
  showApplyButton = false
}: AboveTheFoldSimulatorProps) {
  const defaultText = initialDescription || PRESET_TEMPLATES[0].text;
  const [descriptionText, setDescriptionText] = useState<string>(defaultText);
  const [deviceMode, setDeviceMode] = useState<SimulatorDeviceMode>('desktop');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(!compact);

  // Sync if initialDescription prop changes from parent
  useEffect(() => {
    if (initialDescription) {
      setDescriptionText(initialDescription);
    }
  }, [initialDescription]);

  // Constraints: Desktop shows 3 lines (~170 chars); Mobile shows 2 lines (~105 chars)
  const maxLinesAllowed = deviceMode === 'desktop' ? 3 : 2;
  const maxCharsAllowed = deviceMode === 'desktop' ? 170 : 105;

  // Split lines & analyze truncation position
  const analysis = useMemo(() => {
    const rawLines = descriptionText.split('\n');
    const totalLines = rawLines.length;
    const totalChars = descriptionText.length;

    // Detect URL or specific CTA marker
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urlMatches = descriptionText.match(urlRegex) || [];
    const hasCtaMarker = descriptionText.toLowerCase().includes(ctaMarker.toLowerCase());
    const primaryUrl = hasCtaMarker ? ctaMarker : (urlMatches[0] || null);

    // Find line index and char offset where primary URL begins
    let ctaLineIndex = -1;
    let ctaCharOffset = -1;

    if (primaryUrl) {
      ctaCharOffset = descriptionText.indexOf(primaryUrl);
      let cumulativeLength = 0;
      for (let i = 0; i < rawLines.length; i++) {
        cumulativeLength += rawLines[i].length + 1; // +1 for newline
        if (ctaCharOffset < cumulativeLength) {
          ctaLineIndex = i + 1; // 1-indexed
          break;
        }
      }
    }

    // Fold split logic
    const visibleLines: string[] = [];
    const hiddenLines: string[] = [];
    let countedChars = 0;
    let foldReached = false;

    rawLines.forEach((line, index) => {
      if (foldReached) {
        hiddenLines.push(line);
      } else {
        countedChars += line.length;
        if (index < maxLinesAllowed && countedChars <= maxCharsAllowed) {
          visibleLines.push(line);
        } else if (index < maxLinesAllowed && visibleLines.length === 0) {
          visibleLines.push(line);
        } else {
          foldReached = true;
          hiddenLines.push(line);
        }
      }
    });

    const isVisibleDesktop = ctaLineIndex > 0 && ctaLineIndex <= 3 && ctaCharOffset <= 170;
    const isVisibleMobile = ctaLineIndex > 0 && ctaLineIndex <= 2 && ctaCharOffset <= 105;
    
    let status: 'optimal' | 'warning_mobile' | 'critical';
    if (isVisibleDesktop && isVisibleMobile) {
      status = 'optimal';
    } else if (isVisibleDesktop && !isVisibleMobile) {
      status = 'warning_mobile';
    } else {
      status = 'critical';
    }

    return {
      totalLines,
      totalChars,
      primaryUrl,
      hasCtaMarker,
      ctaLineIndex,
      ctaCharOffset,
      visibleLines,
      hiddenLines,
      isVisibleDesktop,
      isVisibleMobile,
      status
    };
  }, [descriptionText, deviceMode, maxLinesAllowed, maxCharsAllowed, ctaMarker]);

  const handleCopy = () => {
    navigator.clipboard.writeText(descriptionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFormatToTop = () => {
    const marker = ctaMarker || 'https://cpf-coaching.com';
    const lines = descriptionText.split('\n');
    const ctaLine = lines.find(l => l.includes(marker));
    const nonCtaLines = lines.filter(l => !l.includes(marker)).join('\n').trim();

    const formattedCta = ctaLine || `👉 Book a Cyber Strategy Consultation: ${marker}`;
    const newText = `${formattedCta}\n\n${nonCtaLines}`;
    setDescriptionText(newText);
  };

  const renderFormattedLine = (line: string, isDimmed: boolean = false) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = line.split(urlPattern);

    return (
      <div className={`leading-relaxed text-[13px] ${isDimmed ? 'text-neutral-500' : 'text-neutral-200'}`}>
        {parts.map((part, i) => {
          if (part.match(urlPattern)) {
            const isTargetCta = part.toLowerCase().includes(ctaMarker.toLowerCase());
            return (
              <span
                key={i}
                className={`font-semibold underline ${
                  isDimmed 
                    ? 'text-blue-500/60' 
                    : isTargetCta 
                      ? 'text-[#3ea6ff] font-bold decoration-[#3ea6ff]' 
                      : 'text-[#3ea6ff]'
                }`}
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div
      className="bg-brand-surface border border-brand-border rounded-2xl p-5 md:p-6 shadow-2xl space-y-5"
      id="above-the-fold-simulator"
    >
      {/* Header and Device Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/10 border border-red-500/30 text-red-400">
              <Youtube className="w-4 h-4" />
            </span>
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <span>Above-The-Fold YouTube Description Simulator</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/30 text-brand-primary-bright">
                AEO / SEO Conversion Lab
              </span>
            </h3>
          </div>
          <p className="text-xs text-brand-text-muted">
            Test line truncation across YouTube viewports. 88% of viewers never click &ldquo;...more&rdquo;.
          </p>
        </div>

        {/* Device Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-brand-bg/80 p-1 rounded-xl border border-brand-border shrink-0" id="device-mode-selector">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-brand-primary text-black shadow-md font-bold'
                : 'text-brand-text-muted hover:text-white'
            }`}
            id="btn-simulator-desktop"
            title="Desktop YouTube Viewport: 3 Visible Lines"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (3 Lines)</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-brand-primary text-black shadow-md font-bold'
                : 'text-brand-text-muted hover:text-white'
            }`}
            id="btn-simulator-mobile"
            title="Mobile App Viewport: 2 Visible Lines"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App (2 Lines)</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2" id="preset-selector-bar">
        <span className="text-[11px] font-mono text-brand-text-muted uppercase tracking-wider">Presets:</span>
        {PRESET_TEMPLATES.map(p => (
          <button
            key={p.id}
            onClick={() => setDescriptionText(p.text)}
            className={`px-2.5 py-1 rounded-lg text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
              descriptionText === p.text
                ? 'bg-brand-surface-2 border-brand-primary text-white font-semibold'
                : 'bg-brand-bg/60 border-brand-border text-brand-text-muted hover:text-white hover:border-brand-border/80'
            }`}
            id={`btn-preset-${p.id}`}
          >
            <span>{p.name}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                p.badgeColor === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {p.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Conversion & Visibility Audit Alert Box */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          analysis.status === 'optimal'
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
            : analysis.status === 'warning_mobile'
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
            : 'bg-red-950/20 border-red-500/40 text-red-200'
        }`}
        id="audit-status-banner"
      >
        <div className="flex items-start gap-3">
          {analysis.status === 'optimal' ? (
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${analysis.status === 'warning_mobile' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-red-500/20 border border-red-500/40 text-red-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm tracking-tight text-white">
                {analysis.status === 'optimal'
                  ? '🟢 Optimal: CTA Link Visible Above The Fold'
                  : analysis.status === 'warning_mobile'
                  ? '🟡 Warning: Visible on Desktop, Hidden on Mobile'
                  : '🔴 Critical Conversion Defect: CTA Below The Fold'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-black/40">
                {analysis.status === 'optimal'
                  ? '5.2x CTR Velocity'
                  : analysis.status === 'warning_mobile'
                  ? '3.1x Desktop / 0x Mobile'
                  : '-88% CTR Drop'}
              </span>
            </div>
            <p className="text-xs text-brand-text-muted leading-relaxed">
              {analysis.status === 'optimal'
                ? `Booking link is placed on Line ${analysis.ctaLineIndex} (${analysis.ctaCharOffset} chars), guaranteeing 100% viewport reach on both desktop and mobile app before any clicks.`
                : analysis.status === 'warning_mobile'
                ? `Link is on Line ${analysis.ctaLineIndex}. Desktop viewers see it, but mobile viewers (65%+ of YouTube traffic) will miss it because mobile cuts off after 2 lines.`
                : `Booking link is on Line ${analysis.ctaLineIndex > 0 ? analysis.ctaLineIndex : 'NOT FOUND'}. 88% of viewers will NEVER see this link because it is hidden beneath the "...more" fold.`}
            </p>
          </div>
        </div>

        {/* Action Button: Auto-Format to Top */}
        {analysis.status !== 'optimal' && (
          <button
            onClick={handleAutoFormatToTop}
            className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-bright text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/20 shrink-0 cursor-pointer transition-all"
            id="btn-auto-format-cta"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Move CTA to Line 1 (1-Click Fix)</span>
          </button>
        )}
      </div>

      {/* Main Simulation Stage: YouTube Watch Box Mockup */}
      <div className="space-y-3" id="simulation-stage">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-brand-primary-bright" />
            <span>YouTube Watch Page Viewport ({deviceMode === 'desktop' ? 'Desktop 1440px / 3 Lines' : 'Mobile App 390px / 2 Lines'})</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-brand-text-muted">
              {analysis.totalChars} chars • {analysis.totalLines} lines
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-brand-text-muted hover:text-white px-2 py-0.5 rounded bg-brand-surface-2 border border-brand-border flex items-center gap-1 transition-colors cursor-pointer"
              id="btn-copy-simulator-desc"
              title="Copy Description"
            >
              {copied ? <Check className="w-3 h-3 text-brand-primary-bright" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* The YouTube Container */}
        <div
          className={`mx-auto bg-[#0f0f0f] border border-[#272727] rounded-xl p-4 md:p-5 text-[#f1f1f1] font-sans shadow-2xl transition-all ${
            deviceMode === 'mobile' ? 'max-w-md' : 'w-full'
          }`}
          id="yt-mock-viewport"
        >
          {/* Channel and Video Title Header */}
          <div className="pb-3 border-b border-[#272727] space-y-2">
            <h4 className="text-sm md:text-base font-semibold text-white leading-snug line-clamp-2">
              {videoTitle}
            </h4>
            <div className="flex items-center gap-2.5">
              <img
                src={channelThumbnail}
                alt={channelName}
                className="w-7 h-7 rounded-full object-cover border border-[#333]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <p className="text-xs font-medium text-white">{channelName}</p>
                <p className="text-[10px] text-neutral-400 font-mono">{channelSubscribers}</p>
              </div>
            </div>
          </div>

          {/* YouTube Description Box */}
          <div className="mt-3 bg-[#212121] rounded-lg p-3.5 text-xs text-neutral-200 space-y-2 relative" id="yt-description-box">
            <div className="text-[11px] text-neutral-400 font-medium">
              4.8K views • 3 days ago • #cybersecurity #ciso
            </div>

            {/* Simulated Content */}
            <div className="space-y-1.5" id="yt-fold-container">
              {isExpanded ? (
                // Fully expanded view
                <div className="space-y-1.5 whitespace-pre-wrap">
                  {descriptionText.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {renderFormattedLine(line, false)}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                // Collapsed view with visual Fold Marker
                <>
                  {/* Above the Fold Lines */}
                  <div className="space-y-1" id="yt-visible-zone">
                    {analysis.visibleLines.map((line, idx) => (
                      <React.Fragment key={idx}>
                        {renderFormattedLine(line, false)}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Visual Dashed Truncation Fold Marker */}
                  {analysis.hiddenLines.length > 0 && (
                    <div className="relative my-3 pt-2 pb-1" id="yt-fold-marker-line">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t-2 border-dashed border-red-500/80 animate-pulse" />
                      </div>
                      <div className="relative flex justify-end">
                        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md border border-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>YouTube Truncation Fold (...more)</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Below the Fold Lines (Dimmed/Ghosted Preview) */}
                  {analysis.hiddenLines.length > 0 && (
                    <div className="space-y-1 opacity-40 select-none pointer-events-none" id="yt-hidden-zone" aria-hidden="true">
                      {analysis.hiddenLines.slice(0, 3).map((line, idx) => (
                        <React.Fragment key={idx}>
                          {renderFormattedLine(line, true)}
                        </React.Fragment>
                      ))}
                      {analysis.hiddenLines.length > 3 && (
                        <p className="text-[11px] text-neutral-500 italic">
                          ... +{analysis.hiddenLines.length - 3} more lines hidden below fold
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Expand / Collapse Button */}
            {analysis.hiddenLines.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                id="btn-toggle-yt-more"
              >
                <span>{isExpanded ? 'Show less' : '...more'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Textarea & Editor Controls */}
      <div className="pt-2 border-t border-brand-border/60 space-y-3">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="text-xs font-semibold text-brand-text hover:text-white flex items-center gap-1.5 cursor-pointer"
            id="btn-toggle-editor"
          >
            <span>{showEditor ? 'Collapse Live Description Editor' : 'Open Live Description Editor'}</span>
            {showEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDescriptionText(PRESET_TEMPLATES[0].text)}
              className="text-xs text-brand-text-muted hover:text-brand-primary flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset to Default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            {showApplyButton && onApplyDescription && (
              <button
                onClick={() => onApplyDescription(descriptionText)}
                className="px-3.5 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-bright text-black font-bold text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer"
                id="btn-apply-simulator-desc"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply This Description</span>
              </button>
            )}
          </div>
        </div>

        {showEditor && (
          <div className="space-y-2">
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              rows={5}
              placeholder="Paste or type your video description here to test the above-the-fold visibility..."
              className="w-full p-3.5 bg-black/60 border border-brand-border focus:border-brand-primary rounded-xl text-xs font-mono text-white placeholder-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all resize-y leading-relaxed"
              id="textarea-simulator-input"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-brand-text-muted">
              <span>
                💡 Recommendation: Place booking link within the first 120 characters on Line 1.
              </span>
              <span className="font-mono text-brand-primary-bright">
                {descriptionText.length} characters • {descriptionText.split('\n').length} lines
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
