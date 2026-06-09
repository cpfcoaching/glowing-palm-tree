import csv
import os
from collections import Counter
from datetime import datetime

base_dir = "/Volumes/Crucial X9 Pro For Mac/Library/OpenBrain/Takeout/Complete_LinkedInDataExport_06-07-2026.zip"

def parse_date_connections(d_str):
    try:
        return datetime.strptime(d_str, "%d %b %Y")
    except:
        return None

def parse_date_iso(d_str):
    try:
        return datetime.strptime(d_str, "%Y-%m-%d %H:%M:%S")
    except:
        return None

# 1. Connections
june_connections_count = 0
top_companies = Counter()
top_positions = Counter()
try:
    with open(os.path.join(base_dir, "Connections.csv"), "r", encoding="utf-8") as f:
        # Skip 3 lines
        next(f); next(f); next(f)
        reader = csv.DictReader(f)
        for row in reader:
            d = parse_date_connections(row.get('Connected On', ''))
            if d and d.month == 6 and d.year == 2026:
                june_connections_count += 1
                if row.get('Company'): top_companies[row['Company']] += 1
                if row.get('Position'): top_positions[row['Position']] += 1
except Exception as e:
    print("Error reading connections:", e)

# 2. Comments
june_comments_count = 0
try:
    with open(os.path.join(base_dir, "Comments_11344877.csv"), "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = parse_date_iso(row.get('Date', ''))
            if d and d.month == 6 and d.year == 2026:
                june_comments_count += 1
except Exception as e:
    print("Error reading comments:", e)

# 3. Reactions
june_reactions_count = 0
top_reaction_types = Counter()
try:
    with open(os.path.join(base_dir, "Reactions_11344877.csv"), "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = parse_date_iso(row.get('Date', ''))
            if d and d.month == 6 and d.year == 2026:
                june_reactions_count += 1
                if row.get('Type'): top_reaction_types[row['Type']] += 1
except Exception as e:
    print("Error reading reactions:", e)

# 4. Shares (Posts)
june_shares_count = 0
try:
    with open(os.path.join(base_dir, "Shares_11344877.csv"), "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = parse_date_iso(row.get('Date', ''))
            if d and d.month == 6 and d.year == 2026:
                june_shares_count += 1
except Exception as e:
    print("Error reading shares:", e)

html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn June 2026 Analysis</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f3f2ef;
            color: #000000e6;
            margin: 0;
            padding: 20px;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
        }}
        .header {{
            background-color: #ffffff;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 0 0 1px #00000014, 0 2px 3px #00000014;
            margin-bottom: 24px;
        }}
        h1 {{
            font-size: 24px;
            margin: 0 0 8px 0;
            color: #0a66c2;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }}
        .card {{
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 0 1px #00000014, 0 2px 3px #00000014;
            text-align: center;
        }}
        .card h2 {{
            font-size: 36px;
            margin: 0;
            color: #0a66c2;
        }}
        .card p {{
            font-size: 14px;
            margin: 8px 0 0 0;
            color: #00000099;
            font-weight: 600;
            text-transform: uppercase;
        }}
        .lists-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }}
        .list-card {{
            background-color: #ffffff;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 0 0 1px #00000014, 0 2px 3px #00000014;
        }}
        .list-card h3 {{
            margin-top: 0;
            border-bottom: 1px solid #00000014;
            padding-bottom: 12px;
            font-size: 18px;
        }}
        ul {{
            list-style: none;
            padding: 0;
            margin: 0;
        }}
        li {{
            padding: 8px 0;
            border-bottom: 1px solid #f3f2ef;
            display: flex;
            justify-content: space-between;
        }}
        li:last-child {{
            border-bottom: none;
        }}
        .val {{
            font-weight: 600;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>LinkedIn Activity Dashboard</h1>
            <p style="margin:0; color:#00000099;">Data Period: June 1, 2026 - Present</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>{june_connections_count}</h2>
                <p>New Connections</p>
            </div>
            <div class="card">
                <h2>{june_shares_count}</h2>
                <p>Posts Shared</p>
            </div>
            <div class="card">
                <h2>{june_reactions_count}</h2>
                <p>Reactions Given</p>
            </div>
            <div class="card">
                <h2>{june_comments_count}</h2>
                <p>Comments Made</p>
            </div>
        </div>

        <div class="lists-grid">
            <div class="list-card">
                <h3>Top Companies (New Connections)</h3>
                <ul>
                    {''.join([f"<li><span>{k}</span><span class='val'>{v}</span></li>" for k, v in top_companies.most_common(5)])}
                </ul>
            </div>
            <div class="list-card">
                <h3>Top Positions (New Connections)</h3>
                <ul>
                    {''.join([f"<li><span>{k}</span><span class='val'>{v}</span></li>" for k, v in top_positions.most_common(5)])}
                </ul>
            </div>
            <div class="list-card">
                <h3>Reactions Breakdown</h3>
                <ul>
                    {''.join([f"<li><span>{k}</span><span class='val'>{v}</span></li>" for k, v in top_reaction_types.most_common(5)])}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
"""

output_path = "/Users/MacAttack/.gemini/antigravity-ide/brain/959a190d-b31c-43b0-a003-c307d9dcb246/linkedin_june_2026_analysis.html"
with open(output_path, "w") as f:
    f.write(html_content)

print(f"Dashboard successfully generated at: {output_path}")
