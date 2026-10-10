import re
import os

workspace_dir = '/Volumes/Crucial X9 Pro For Mac/GDriveSync/Antigravity'

# 1. Clean EXECUTIVE_UI_OPTIMIZATIONS_BLUEPRINT.html
exec_path = os.path.join(workspace_dir, 'EXECUTIVE_UI_OPTIMIZATIONS_BLUEPRINT.html')
with open(exec_path, 'r', encoding='utf-8') as f:
    exec_content = f.read()

# Replace .floating-dock backdrop-filter with solid high-contrast glass background to resolve Safari warning
exec_content = re.sub(
    r'\.floating-dock\s*\{[^}]+\}',
    '''.floating-dock {
    background: #0f172a;
    border: 1px solid rgba(56, 189, 248, 0.4);
    box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    border-radius: 12px;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
  }''',
    exec_content
)

# Extract and map inline styles to utility classes
utility_classes = {
    'text-right': 'text-align: right;',
    'header-meta': 'font-size: 12px; color: var(--text-dim); margin-top: 6px;',
    'text-red-bold': 'color: #f87171; font-weight: 700;',
    'grid-2-col': 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;',
    'kpi-feedback': 'display: none; margin-top: 10px; background: #0f172a; padding: 10px; border-radius: 6px; border-left: 3px solid #38bdf8; font-size: 11.5px; color: #cbd5e1;',
    'state-verified': 'background: #091e14; border: 1px solid #10b981; border-radius: 8px; padding: 12px; margin-bottom: 10px;',
    'state-warning': 'background: #241208; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px;',
    'flex-between': 'display: flex; justify-content: space-between; align-items: center;',
    'flex-center-gap8': 'display: flex; align-items: center; gap: 8px;',
    'flex-center-gap10': 'display: flex; align-items: center; gap: 10px;',
    'flex-gap8': 'display: flex; gap: 8px;',
    'icon-large': 'font-size: 16px;',
    'card-title-white': 'font-weight: 700; color: #fff; font-size: 12.5px;',
    'card-title-small': 'font-weight: 700; color: #fff; font-size: 12px;',
    'text-verified-green': 'font-size: 11px; color: #34d399; font-weight: 600;',
    'text-warning-amber': 'font-size: 11px; color: #fbbf24; font-weight: 600;',
    'btn-reauth': 'background: #f59e0b; color: #000; font-weight: 700; border: none;',
    'badge-count-blue': 'background: #0284c7; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px;',
    'btn-apply-green': 'background: #10b981; color: #042f1a; font-weight: 800; border: none;',
    'btn-clear': 'background: transparent; border: none; color: #94a3b8;',
    'text-muted-12': 'font-size: 12px; color: #94a3b8;',
    'text-dim-11': 'font-size: 11px; color: #64748b;',
    'search-palette': 'background: #080c16; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 12px;',
    'search-header': 'display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 8px;',
    'kbd-esc': 'margin-left: auto; background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #94a3b8;',
    'search-body': 'color: #64748b; font-size: 11px; line-height: 1.6;',
    'text-emerald': 'color: #10b981;',
    'text-amber': 'color: #f59e0b;',
    'text-amber-bright': 'color: #fbbf24;',
    'text-blue': 'color: #38bdf8;',
    'text-mono-white': 'color: #fff; font-family: var(--font-mono);',
    'status-waiting': 'font-size: 11px; font-weight: 700; color: #10b981;',
    'pill-amber': 'background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.4);',
    'audit-note': 'font-size: 11px; color: #94a3b8; text-align: center; margin-top: 8px;',
    'mb-32': 'margin-bottom: 32px;',
    'td-subtext': 'font-size: 11.5px; color: var(--text-muted);'
}

# Add utility classes to <style>
css_additions = "\n  /* Utility classes to avoid inline styles */\n"
for cname, cprops in utility_classes.items():
    css_additions += f"  .{cname} {{ {cprops} }}\n"

exec_content = exec_content.replace('</style>', css_additions + '</style>')

# Replace inline styles in HTML tags
replacements = [
    ('style="text-align: right;"', 'class="text-right"'),
    ('style="font-size: 12px; color: var(--text-dim); margin-top: 6px;"', 'class="header-meta"'),
    ('style="color:#f87171;font-weight:700;"', 'class="text-red-bold"'),
    ('style="font-weight:700; color:#fff; font-size:12px;"', 'class="card-title-small"'),
    ('style="font-size:11px; color:#64748b;"', 'class="text-dim-11"'),
    ('style="background:rgba(245,158,11,0.15); color:#fbbf24; border-color:rgba(245,158,11,0.4);"', 'class="pill-issues pill-amber"'),
    ('style="color:#fbbf24;"', 'class="text-amber-bright"'),
    ('style="font-size:11px; color:#94a3b8; text-align:center; margin-top:8px;"', 'class="audit-note"'),
    ('style="font-size:11px; font-weight:700; color:#10b981;"', 'class="status-waiting"'),
    ('style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;"', 'class="grid-2-col"'),
    ('style="color:#10b981;"', 'class="text-emerald"'),
    ('style="color:#f59e0b;"', 'class="text-amber"'),
    ('style="display:none; margin-top:10px; background:#0f172a; padding:10px; border-radius:6px; border-left:3px solid #38bdf8; font-size:11.5px; color:#cbd5e1;"', 'class="kpi-feedback"'),
    ('style="background:#091e14; border:1px solid #10b981; border-radius:8px; padding:12px; margin-bottom:10px;"', 'class="state-verified"'),
    ('style="display:flex; justify-content:space-between; align-items:center;"', 'class="flex-between"'),
    ('style="display:flex; align-items:center; gap:8px;"', 'class="flex-center-gap8"'),
    ('style="font-size:16px;"', 'class="icon-large"'),
    ('style="font-weight:700; color:#fff; font-size:12.5px;"', 'class="card-title-white"'),
    ('style="font-size:11px; color:#34d399; font-weight:600;"', 'class="text-verified-green"'),
    ('style="background:#241208; border:1px solid #f59e0b; border-radius:8px; padding:12px;"', 'class="state-warning"'),
    ('style="font-size:11px; color:#fbbf24; font-weight:600;"', 'class="text-warning-amber"'),
    ('style="background:#f59e0b; color:#000; font-weight:700; border:none;"', 'class="sim-btn btn-reauth"'),
    ('style="display:flex; align-items:center; gap:10px;"', 'class="flex-center-gap10"'),
    ('style="background:#0284c7; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px;"', 'class="badge-count-blue"'),
    ('style="font-size:12px; color:#94a3b8;"', 'class="text-muted-12"'),
    ('style="display:flex; gap:8px;"', 'class="flex-gap8"'),
    ('style="background:#10b981; color:#042f1a; font-weight:800; border:none;"', 'class="sim-btn btn-apply-green"'),
    ('style="background:transparent; border:none; color:#94a3b8;"', 'class="sim-btn btn-clear"'),
    ('style="background:#080c16; border:1px solid #1e293b; border-radius:8px; padding:12px; font-size:12px;"', 'class="search-palette"'),
    ('style="display:flex; align-items:center; gap:8px; border-bottom:1px solid #1e293b; padding-bottom:8px; margin-bottom:8px;"', 'class="search-header"'),
    ('style="color:#38bdf8;"', 'class="text-blue"'),
    ('style="color:#fff; font-family:var(--font-mono);"', 'class="text-mono-white"'),
    ('style="margin-left:auto; background:#1e293b; padding:2px 6px; border-radius:4px; font-size:10px; color:#94a3b8;"', 'class="kbd-esc"'),
    ('style="color:#64748b; font-size:11px; line-height:1.6;"', 'class="search-body"'),
    ('style="margin-bottom:32px;"', 'class="card mb-32"'),
    ('style="font-size:11.5px; color:var(--text-muted);"', 'class="td-subtext"')
]

for old, new in replacements:
    exec_content = exec_content.replace(old, new)

with open(exec_path, 'w', encoding='utf-8') as f:
    f.write(exec_content)

print("Cleaned EXECUTIVE_UI_OPTIMIZATIONS_BLUEPRINT.html")

# 2. Clean RECOMMENDED_UI_OPTIMIZATIONS_BLUEPRINT.html
rec_path = os.path.join(workspace_dir, 'RECOMMENDED_UI_OPTIMIZATIONS_BLUEPRINT.html')
with open(rec_path, 'r', encoding='utf-8') as f:
    rec_content = f.read()

rec_utility = """
  /* Utility classes */
  .text-right { text-align: right; }
  .header-meta { font-size: 12px; color: var(--text-dim); margin-top: 6px; }
  .text-red-bold { color: #f87171; font-weight: 700; }
  .tooltip-label { color: #94a3b8; margin-bottom: 4px; }
  .tooltip-card { background: #0f172a; padding: 6px 10px; border-radius: 4px; border-left: 2px solid #ef4444; }
  .mt-4 { margin-top: 4px; }
  .td-subtext { font-size: 11px; color: var(--text-muted); }
"""
rec_content = rec_content.replace('</style>', rec_utility + '</style>')

rec_replacements = [
    ('style="text-align: right;"', 'class="text-right"'),
    ('style="font-size: 12px; color: var(--text-dim); margin-top: 6px;"', 'class="header-meta"'),
    ('style="color:#f87171; font-weight:700;"', 'class="text-red-bold"'),
    ('style="color: #94a3b8; margin-bottom: 4px;"', 'class="tooltip-label"'),
    ('style="background:#0f172a; padding:6px 10px; border-radius:4px; border-left: 2px solid #ef4444;"', 'class="tooltip-card"'),
    ('style="margin-top:4px;"', 'class="wf-row mt-4"'),
    ('style="font-size:11px;color:var(--text-muted)"', 'class="td-subtext"')
]

for old, new in rec_replacements:
    rec_content = rec_content.replace(old, new)

with open(rec_path, 'r', encoding='utf-8') as f:
    f.write(rec_content)

print("Cleaned RECOMMENDED_UI_OPTIMIZATIONS_BLUEPRINT.html")
