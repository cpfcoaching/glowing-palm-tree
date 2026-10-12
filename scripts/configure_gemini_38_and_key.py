#!/usr/bin/env python3
"""
configure_gemini_38_and_key.py
1. Restores model to 'gemini-3.8-flash' in src/lib/gemini.ts and functions/src/lib/llm.ts.
2. Checks localStorage and sessionStorage for user_gemini_api_key so real Gemini 3.8 calls execute.
3. Adds Gemini API Key configuration card in Settings.tsx.
"""

import os

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"

# 1. Update src/lib/gemini.ts
gemini_path = os.path.join(APP_DIR, "src/lib/gemini.ts")
with open(gemini_path, "r", encoding="utf-8") as f:
    gemini_code = f.read()

# Update model to gemini-3.8-flash and expand API key lookup
old_key_lookup = "  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;"
new_key_lookup = """  const apiKey = (typeof window !== 'undefined' ? (localStorage.getItem('user_gemini_api_key') || sessionStorage.getItem('user_gemini_api_key')) : null) || 
                 (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                 (window as any)?.__GEMINI_API_KEY__;"""

gemini_code = gemini_code.replace(old_key_lookup, new_key_lookup)
gemini_code = gemini_code.replace("model: 'gemini-2.5-flash'", "model: 'gemini-3.8-flash'")
gemini_code = gemini_code.replace("Optimized with Gemini 2.5 Flash", "Optimized with Gemini 3.8 Flash")

with open(gemini_path, "w", encoding="utf-8") as f:
    f.write(gemini_code)
print("✓ Configured gemini-3.8-flash and dynamic API key resolution in src/lib/gemini.ts")

# 2. Update functions/src/lib/llm.ts
llm_path = os.path.join(APP_DIR, "functions/src/lib/llm.ts")
if os.path.exists(llm_path):
    with open(llm_path, "r", encoding="utf-8") as f:
        llm_code = f.read()
    llm_code = llm_code.replace('"gemini-2.5-flash"', '"gemini-3.8-flash"')
    with open(llm_path, "w", encoding="utf-8") as f:
        f.write(llm_code)
    print("✓ Set default model to gemini-3.8-flash in functions/src/lib/llm.ts")

# 3. Add Gemini API Key input in Settings.tsx
settings_path = os.path.join(APP_DIR, "src/components/Settings.tsx")
with open(settings_path, "r", encoding="utf-8") as f:
    settings_code = f.read()

# Add geminiApiKey state
if "const [geminiApiKey, setGeminiApiKey] = useState" not in settings_code:
    old_state = "  const [saving, setSaving] = useState(false);"
    new_state = """  const [saving, setSaving] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('user_gemini_api_key') || '';
  });"""
    settings_code = settings_code.replace(old_state, new_state)

# Save geminiApiKey to localStorage in handleSave
if "localStorage.setItem('user_gemini_api_key'" not in settings_code:
    old_save = """    try {
      await updateDoc(doc(db, path), {"""
    new_save = """    try {
      if (geminiApiKey) {
        localStorage.setItem('user_gemini_api_key', geminiApiKey.trim());
      } else {
        localStorage.removeItem('user_gemini_api_key');
      }
      await updateDoc(doc(db, path), {
        geminiApiKey: geminiApiKey.trim(),"""
    settings_code = settings_code.replace(old_save, new_save)

# Add Gemini UI section right above Throttling & API Budgets
gemini_ui_section = """          {/* Section: Gemini 3.8 Flash AI Model Settings */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 space-y-4" id="section-gemini-ai">
            <div className="flex items-center justify-between border-b border-brand-border/45 pb-3">
              <div>
                <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">
                  Google Gemini 3.8 Flash AI Engine
                </h3>
                <p className="text-[11px] text-brand-text-muted mt-0.5">
                  Production high-velocity reasoning engine for chapter breakdown and title hooks.
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                Active: gemini-3.8-flash
              </span>
            </div>

            <div className="space-y-2" id="input-group-gemini-key">
              <label htmlFor="gemini-key-input" className="text-xs font-semibold text-white block">
                Google AI Studio API Key (Optional / Self-Hosted)
              </label>
              <input
                id="gemini-key-input"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use system default)"
                className="w-full bg-brand-surface-2 text-white border border-brand-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-primary placeholder:text-brand-text-muted/60"
              />
              <p className="text-[10px] text-brand-text-muted leading-relaxed">
                Enter your Google AI Studio API key to power real-time metadata re-writes with Gemini 3.8 Flash. If not provided, the platform uses deterministic high-CTR optimization heuristics.
              </p>
            </div>
          </div>

"""

if 'id="section-gemini-ai"' not in settings_code:
    settings_code = settings_code.replace(
        '          {/* Section 2: Quota and budget sliders */}',
        gemini_ui_section + '          {/* Section 2: Quota and budget sliders */}'
    )

with open(settings_path, "w", encoding="utf-8") as f:
    f.write(settings_code)

print("✓ Added Gemini 3.8 Flash key configuration to Settings.tsx")
