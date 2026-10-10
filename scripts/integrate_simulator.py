#!/usr/bin/env python3
import sys

# 1. Update FeaturesHub.tsx
features_path = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1/src/components/FeaturesHub.tsx"
with open(features_path, 'r', encoding='utf-8') as f:
    features_content = f.read()

# Add import
if "import AboveTheFoldSimulator from './AboveTheFoldSimulator';" not in features_content:
    features_content = features_content.replace(
        "import SeoLogo from './SeoLogo';",
        "import SeoLogo from './SeoLogo';\nimport AboveTheFoldSimulator from './AboveTheFoldSimulator';"
    )

# Add simulator section before aeo-readiness-calculator
sim_section = '''        {/* Interactive Above-The-Fold YouTube Description Simulator */}
        {(activeCategory === 'all' || activeCategory === 'seo' || activeCategory === 'cta') && (
          <section id="features-above-the-fold-simulator" className="space-y-3">
            <AboveTheFoldSimulator
              videoTitle={activeChannel ? `How to Maximize Authority & Conversions | ${activeChannel.title}` : undefined}
              channelName={activeChannel?.title || 'Breaking Into Cybersecurity'}
              channelThumbnail={activeChannel?.thumbnail}
              channelSubscribers={activeChannel?.subscriberCount ? `${activeChannel.subscriberCount} subscribers` : undefined}
              ctaMarker="https://cpf-coaching.com"
              compact={false}
            />
          </section>
        )}

        {/* Interactive AEO & SEO Readiness Audit Widget */}'''

if 'id="features-above-the-fold-simulator"' not in features_content:
    features_content = features_content.replace(
        '        {/* Interactive AEO & SEO Readiness Audit Widget */}',
        sim_section
    )

with open(features_path, 'w', encoding='utf-8') as f:
    f.write(features_content)
print("Updated FeaturesHub.tsx successfully.")

# 2. Update Videos.tsx
videos_path = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1/src/components/Videos.tsx"
with open(videos_path, 'r', encoding='utf-8') as f:
    videos_content = f.read()

# Add import
if "import AboveTheFoldSimulator from './AboveTheFoldSimulator';" not in videos_content:
    videos_content = videos_content.replace(
        "import ThumbnailStudioModal from './ThumbnailStudioModal';",
        "import ThumbnailStudioModal from './ThumbnailStudioModal';\nimport AboveTheFoldSimulator from './AboveTheFoldSimulator';"
    )

# Add descViewMode state
if "const [descViewMode, setDescViewMode]" not in videos_content:
    videos_content = videos_content.replace(
        "  // Suggestion drawer state\n  const [activeSuggestionVideo, setActiveSuggestionVideo] = useState<Video | null>(null);",
        "  // Suggestion drawer state\n  const [activeSuggestionVideo, setActiveSuggestionVideo] = useState<Video | null>(null);\n  const [descViewMode, setDescViewMode] = useState<'simulator' | 'raw'>('simulator');"
    )

# Replace suggestion-block-desc
old_desc_block = '''                    {/* SUGGESTION 3: DESCRIPTION TEXT */}
                    {loadedSuggestion.description && (
                      <div className="space-y-3 bg-brand-surface-2/40 border border-brand-border rounded-xl p-5" id="suggestion-block-desc">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" id="suggestion-desc-header">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-brand-primary-bright" aria-hidden="true" />
                            <span>Description Architecture</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApplySuggestion({ descOnly: true })}
                              disabled={isApplyingSuggestion}
                              className="text-xs text-brand-primary-bright hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              <span>Apply Description</span>
                            </button>
                            <span className="text-brand-border">|</span>
                            <button
                              onClick={() => handleCopy(loadedSuggestion.description, 'description')}
                              className="text-xs text-brand-text-muted hover:text-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                              id="btn-copy-desc"
                            >
                              {copiedField === 'description' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-brand-primary-bright" aria-hidden="true" />
                                  <span className="text-brand-primary-bright">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Copy draft</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Structural Pillars Indicator */}
                        <div className="flex flex-wrap gap-1.5 py-1">
                          <span className="text-[10px] font-mono font-semibold bg-brand-primary/10 text-brand-primary-bright border border-brand-primary/25 px-2 py-0.5 rounded">
                            ✓ 150-Char Booking CTA
                          </span>
                          <span className="text-[10px] font-mono font-semibold bg-brand-surface-2 text-white border border-brand-border px-2 py-0.5 rounded">
                            ✓ Core Concepts Timeline
                          </span>
                          <span className="text-[10px] font-mono font-semibold bg-brand-accent/10 text-brand-accent border border-brand-accent/25 px-2 py-0.5 rounded">
                            ✓ Like, Subscribe, Share CTA
                          </span>
                        </div>

                        <div className="p-4 bg-black/50 border border-brand-border rounded-lg text-xs text-brand-text leading-relaxed font-mono whitespace-pre-wrap max-h-80 overflow-y-auto selection:bg-brand-primary selection:text-black" id="proposed-desc-preview">
                          {loadedSuggestion.description}
                        </div>
                      </div>
                    )}'''

new_desc_block = '''                    {/* SUGGESTION 3: DESCRIPTION TEXT & ABOVE-THE-FOLD SIMULATOR */}
                    {loadedSuggestion.description && (
                      <div className="space-y-4 bg-brand-surface-2/40 border border-brand-border rounded-xl p-5" id="suggestion-block-desc">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" id="suggestion-desc-header">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-brand-primary-bright" aria-hidden="true" />
                            <span>Description Architecture &amp; Truncation Preview</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {/* Toggle between Simulator and Raw Text */}
                            <div className="flex items-center bg-brand-bg rounded-lg p-0.5 border border-brand-border text-[11px]" id="desc-view-mode-switch">
                              <button
                                onClick={() => setDescViewMode('simulator')}
                                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                                  descViewMode === 'simulator'
                                    ? 'bg-brand-surface-2 text-white font-semibold shadow-sm'
                                    : 'text-brand-text-muted hover:text-white'
                                }`}
                                id="btn-view-simulator"
                              >
                                Simulator View
                              </button>
                              <button
                                onClick={() => setDescViewMode('raw')}
                                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                                  descViewMode === 'raw'
                                    ? 'bg-brand-surface-2 text-white font-semibold shadow-sm'
                                    : 'text-brand-text-muted hover:text-white'
                                }`}
                                id="btn-view-raw"
                              >
                                Raw Text
                              </button>
                            </div>
                            <span className="text-brand-border">|</span>
                            <button
                              onClick={() => handleApplySuggestion({ descOnly: true })}
                              disabled={isApplyingSuggestion}
                              className="text-xs text-brand-primary-bright hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              <span>Apply Description</span>
                            </button>
                            <span className="text-brand-border">|</span>
                            <button
                              onClick={() => handleCopy(loadedSuggestion.description, 'description')}
                              className="text-xs text-brand-text-muted hover:text-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                              id="btn-copy-desc"
                            >
                              {copiedField === 'description' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-brand-primary-bright" aria-hidden="true" />
                                  <span className="text-brand-primary-bright">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Copy draft</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Structural Pillars Indicator */}
                        <div className="flex flex-wrap gap-1.5 py-1">
                          <span className="text-[10px] font-mono font-semibold bg-brand-primary/10 text-brand-primary-bright border border-brand-primary/25 px-2 py-0.5 rounded">
                            ✓ 150-Char Booking CTA
                          </span>
                          <span className="text-[10px] font-mono font-semibold bg-brand-surface-2 text-white border border-brand-border px-2 py-0.5 rounded">
                            ✓ Core Concepts Timeline
                          </span>
                          <span className="text-[10px] font-mono font-semibold bg-brand-accent/10 text-brand-accent border border-brand-accent/25 px-2 py-0.5 rounded">
                            ✓ Like, Subscribe, Share CTA
                          </span>
                        </div>

                        {descViewMode === 'simulator' ? (
                          <AboveTheFoldSimulator
                            initialDescription={loadedSuggestion.description}
                            videoTitle={loadedSuggestion.title || activeSuggestionVideo.title}
                            channelName={activeChannel?.title || 'YouTube Channel'}
                            channelThumbnail={activeSuggestionVideo.thumbnail || activeChannel?.thumbnail}
                            channelSubscribers={activeChannel?.subscriberCount ? `${activeChannel.subscriberCount} subscribers` : undefined}
                            ctaMarker="https://cpf-coaching.com"
                            compact={true}
                            showApplyButton={true}
                            onApplyDescription={(newDesc) => {
                              setLoadedSuggestion(prev => prev ? { ...prev, description: newDesc } : prev);
                              handleApplySuggestion({ descOnly: true });
                            }}
                          />
                        ) : (
                          <div className="p-4 bg-black/50 border border-brand-border rounded-lg text-xs text-brand-text leading-relaxed font-mono whitespace-pre-wrap max-h-80 overflow-y-auto selection:bg-brand-primary selection:text-black" id="proposed-desc-preview">
                            {loadedSuggestion.description}
                          </div>
                        )}
                      </div>
                    )}'''

if old_desc_block in videos_content:
    videos_content = videos_content.replace(old_desc_block, new_desc_block)
else:
    print("WARNING: old_desc_block not found exactly in Videos.tsx")

with open(videos_path, 'w', encoding='utf-8') as f:
    f.write(videos_content)
print("Updated Videos.tsx successfully.")
