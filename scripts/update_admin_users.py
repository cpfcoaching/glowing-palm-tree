#!/usr/bin/env python3
"""
update_admin_users.py
Updates admin user access across firestore.rules and src/App.tsx
Allowlist:
- christophefoulon@gmail.com
- breakingintocyber@gmail.com
- chris@cpf-coaching.com
"""

import os

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"

# 1. Update firestore.rules
rules_path = os.path.join(APP_DIR, "firestore.rules")
with open(rules_path, "r", encoding="utf-8") as f:
    rules = f.read()

old_rules_admin = """    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'christophefoulon@gmail.com' && 
             request.auth.token.email_verified == true;
    }"""

new_rules_admin = """    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in ['christophefoulon@gmail.com', 'breakingintocyber@gmail.com', 'chris@cpf-coaching.com'] && 
             request.auth.token.email_verified == true;
    }"""

if old_rules_admin in rules:
    rules = rules.replace(old_rules_admin, new_rules_admin)
    with open(rules_path, "w", encoding="utf-8") as f:
        f.write(rules)
    print("✓ Updated firestore.rules with all 3 admin emails.")
else:
    print("Notice: firestore.rules check string did not match exactly.")

# 2. Update src/App.tsx
app_path = os.path.join(APP_DIR, "src/App.tsx")
with open(app_path, "r", encoding="utf-8") as f:
    app_code = f.read()

# Add ADMIN_EMAILS constant before isAdmin
old_admin_line = "  const isAdmin = user && (user.email === 'christophefoulon@gmail.com' || user.uid === 'demo_user' || isDemoMode);"

new_admin_line = """  export const ADMIN_EMAILS = [
    'christophefoulon@gmail.com',
    'breakingintocyber@gmail.com',
    'chris@cpf-coaching.com'
  ];

  const isAdmin = user && (ADMIN_EMAILS.includes(user.email || '') || user.uid === 'demo_user' || isDemoMode);"""

# In case we can't export inside component, define outside or without export
clean_admin_line = """  const ADMIN_EMAILS = [
    'christophefoulon@gmail.com',
    'breakingintocyber@gmail.com',
    'chris@cpf-coaching.com'
  ];

  const isAdmin = user && (ADMIN_EMAILS.includes(user.email || '') || user.uid === 'demo_user' || isDemoMode);"""

if old_admin_line in app_code:
    app_code = app_code.replace(old_admin_line, clean_admin_line)
    with open(app_path, "w", encoding="utf-8") as f:
        f.write(app_code)
    print("✓ Updated src/App.tsx with all 3 admin emails.")
else:
    print("Notice: src/App.tsx old_admin_line did not match.")

print("Admin user configuration updated.")
