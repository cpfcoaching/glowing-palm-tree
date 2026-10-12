#!/usr/bin/env python3
import sys

videos_path = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1/src/components/Videos.tsx"
with open(videos_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Info to lucide-react imports if not present
if "Info," not in content and "Info " not in content:
    content = content.replace(
        "  Layers\n} from 'lucide-react';",
        "  Layers,\n  Info\n} from 'lucide-react';"
    )

# Replace Issues Cell
old_cell = '''                        {/* Issues Cell: Shows Red count if issues exist, Green 0 defects when verified */}
                        <td className="py-4 px-5 text-center">
                          {video.issueCount > 0 ? (
                            <span className="inline-block px-2.5 py-1 text-xs font-mono rounded font-bold bg-[#EF4444]/10 text-[#EF4444] border border-red-900/30" id={`issues-count-${video.videoId}`}>
                              {video.issueCount} {video.issueCount === 1 ? 'issue' : 'issues'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded font-bold bg-emerald-950/30 text-emerald-400 border border-emerald-900/40" id={`issues-count-${video.videoId}`}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>0 defects</span>
                            </span>
                          )}
                        </td>'''

new_cell = '''                        {/* Issues Cell: Defect Hover Micro-Card */}
                        <td className="py-4 px-5 text-center relative group/defect">
                          {video.issueCount > 0 ? (
                            <div className="relative inline-block" id={`defect-anchor-${video.videoId}`}>
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded font-bold bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-red-500/40 shadow-sm cursor-help transition-all"
                                id={`issues-count-${video.videoId}`}
                              >
                                <span>{video.issueCount} {video.issueCount === 1 ? 'issue' : 'issues'}</span>
                                <Info className="w-3 h-3 opacity-75" />
                              </span>

                              {/* Defect Popover Micro-Card */}
                              <div
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 bg-neutral-950/95 border border-red-500/30 rounded-xl shadow-2xl backdrop-blur-md opacity-0 pointer-events-none group-hover/defect:opacity-100 group-hover/defect:pointer-events-auto transition-all duration-200 z-50 text-left"
                                id={`defect-popover-${video.videoId}`}
                              >
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-border/60">
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                    <span>Detected Defects ({video.issueCount})</span>
                                  </span>
                                  <span className="text-[9px] font-mono text-neutral-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-800/30">
                                    AEO / SEO
                                  </span>
                                </div>
                                <ul className="space-y-1.5 text-xs text-neutral-200">
                                  {video.issues && video.issues.length > 0 ? (
                                    video.issues.map((issue, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                                        <span className="text-red-400 font-bold shrink-0">•</span>
                                        <span>{issue}</span>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-[11px] text-neutral-400">Issues detected in catalog audit.</li>
                                  )}
                                </ul>
                                <div className="mt-2.5 pt-2 border-t border-brand-border/40 text-[10px] text-brand-text-muted flex justify-between items-center">
                                  <span>Click row to expand full diff</span>
                                  <span className="text-brand-primary-bright font-semibold">1-Click Auto-Fix →</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative inline-block" id={`defect-anchor-${video.videoId}`}>
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded font-bold bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 shadow-sm cursor-help transition-all"
                                id={`issues-count-${video.videoId}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>0 defects</span>
                              </span>

                              {/* Clean Verified Popover Micro-Card */}
                              <div
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-neutral-950/95 border border-emerald-500/30 rounded-xl shadow-2xl backdrop-blur-md opacity-0 pointer-events-none group-hover/defect:opacity-100 group-hover/defect:pointer-events-auto transition-all duration-200 z-50 text-left"
                                id={`defect-popover-${video.videoId}`}
                              >
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>100% Verified Clean</span>
                                </div>
                                <p className="text-[11px] text-neutral-300 leading-relaxed">
                                  All SEO, AEO chapters, and 150-char CTA booking rules verified. Zero defects detected.
                                </p>
                              </div>
                            </div>
                          )}
                        </td>'''

if old_cell in content:
    content = content.replace(old_cell, new_cell)
    print("Replaced old_cell with new_cell successfully.")
else:
    print("ERROR: old_cell not found in content!")
    sys.exit(1)

with open(videos_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Videos.tsx with Defect Hover Micro-Cards successfully.")
