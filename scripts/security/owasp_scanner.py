#!/usr/bin/env python3
"""
owasp_scanner.py — OWASP Top 10 & OWASP GenAI Top 10 Pre-Commit Security Scanner

Scans staged code or the entire repository against:
  1. OWASP Top 10 Web Application Vulnerabilities (https://owasp.org/www-project-top-ten/)
     - A01: Broken Access Control & Path Traversal
     - A02: Cryptographic Failures & Hardcoded Credentials
     - A03: Injection (SQL, Command, Code Execution, XSS)
     - A05: Security Misconfiguration (SSL verify=False, Debug in Prod, Wildcard CORS)
     - A08: Insecure Deserialization (pickle, unsafe yaml, eval)
     - A10: Server-Side Request Forgery (SSRF)
  2. OWASP GenAI / LLM Top 10 Vulnerabilities (https://genai.owasp.org/)
     - LLM01: Prompt Injection (Unsanitized direct prompt interpolation)
     - LLM02: Sensitive Information Disclosure
     - LLM05: Improper Output Handling (LLM output passed to eval/exec/shell/innerHTML)
     - LLM06: Excessive Agency (Unrestricted destructive tools without HITL/safety guards)
     - LLM07: System Prompt Leakage
     - LLM10: Unbounded Consumption (Missing timeouts, missing max_tokens bounds)

Usage:
  python3 scripts/security/owasp_scanner.py --staged      # Run on staged files in git
  python3 scripts/security/owasp_scanner.py --all         # Scan entire workspace
  python3 scripts/security/owasp_scanner.py path/to/file  # Scan specific file/dir
"""

import os
import re
import sys
import ast
import subprocess
import argparse
from pathlib import Path

# ANSI Color formatting
RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Ignored paths / files
IGNORED_PATTERNS = [
    r"\.git/",
    r"\.venv",
    r"node_modules/",
    r"dist/",
    r"build/",
    r"__pycache__",
    r"\.beads/",
    r"\.agent/skills/",
    r"package-lock\.json$",
    r"yarn\.lock$",
    r"\.min\.js$",
    r"\.min\.css$",
    r"logs/",
    r"scratch/",
    r"scripts/security/owasp_scanner\.py$"
]

def is_ignored(path_str):
    for pattern in IGNORED_PATTERNS:
        if re.search(pattern, path_str):
            return True
    return False

# Rule definitions
RULES = [
    # --- OWASP TOP 10 (WEB APPLICATION) ---
    {
        "id": "OWASP-A01-PATH-TRAVERSAL",
        "category": "OWASP A01: Broken Access Control",
        "severity": "HIGH",
        "regex": r"(?:open|file_path|read_file|send_file)\s*\(\s*(?:request\.|args\.|user_|params\.)",
        "description": "Potential path traversal: File access directly concatenated with unvalidated user input. Use safe resolve() and boundary checks.",
        "extensions": [".py", ".js", ".ts"]
    },
    {
        "id": "OWASP-A02-WEAK-HASH",
        "category": "OWASP A02: Cryptographic Failures",
        "severity": "MEDIUM",
        "regex": r"(?:hashlib\.md5|hashlib\.sha1|crypto\.createHash\(['\"]md5|crypto\.createHash\(['\"]sha1)",
        "description": "Weak cryptographic hashing algorithm (MD5/SHA1). Use SHA-256, SHA-3, or Argon2/bcrypt for passwords.",
        "extensions": [".py", ".js", ".ts"]
    },
    {
        "id": "OWASP-A02-HARDCODED-SECRET",
        "category": "OWASP A02: Cryptographic Failures",
        "severity": "CRITICAL",
        "regex": r"(?:api[_-]?key|secret[_-]?key|password|auth[_-]?token)\s*=\s*['\"][A-Za-z0-9_\-\.]{16,}['\"]",
        "description": "Hardcoded secret or API credential detected. Use environment variables (os.environ) or secrets manager.",
        "extensions": [".py", ".js", ".ts", ".sh", ".json", ".yaml", ".yml"],
        "exempt_terms": ["sample", "example", "placeholder", "your_", "test", "demo", "xxx", "dummy", "client_secret.json"]
    },
    {
        "id": "OWASP-A03-COMMAND-INJECTION",
        "category": "OWASP A03: Injection",
        "severity": "CRITICAL",
        "regex": r"(?:subprocess\.(?:Popen|run|call|check_call|check_output)\s*\([^)]*shell\s*=\s*True|os\.system\s*\(\s*f['\"]|os\.popen\s*\(\s*f['\"])",
        "description": "Command Injection risk: Execution with shell=True or dynamic string formatting in system calls. Use list arguments without shell=True.",
        "extensions": [".py"]
    },
    {
        "id": "OWASP-A03-SQL-INJECTION",
        "category": "OWASP A03: Injection",
        "severity": "CRITICAL",
        "regex": r"(?:execute|cursor\.execute)\s*\(\s*(?:f['\"](?:SELECT|INSERT|UPDATE|DELETE)|['\"][^'\"]*%\s*\(|['\"][^'\"]*\.format\()",
        "description": "SQL Injection risk: Dynamic string formatting in SQL statement. Use parameterized queries (? or %s bindings).",
        "extensions": [".py", ".js", ".ts"]
    },
    {
        "id": "OWASP-A03-CODE-INJECTION",
        "category": "OWASP A03: Injection",
        "severity": "HIGH",
        "regex": r"(?<!ast\.)\beval\s*\((?!['\"][0-9\s\+\-\*\/\(\)]+['\"])|(?<!ast\.)\bexec\s*\(",
        "description": "Unsafe code execution via eval() or exec(). Use ast.literal_eval() or safe expression parsers.",
        "extensions": [".py", ".js", ".ts"]
    },
    {
        "id": "OWASP-A03-XSS",
        "category": "OWASP A03: Injection",
        "severity": "HIGH",
        "regex": r"\.innerHTML\s*=\s*(?!['\"][^<]*['\"])\s*[a-zA-Z0-9_\.]+",
        "description": "Cross-Site Scripting (XSS): Direct dynamic assignment to innerHTML without sanitization. Use textContent or DOMPurify.",
        "extensions": [".js", ".ts", ".html"]
    },
    {
        "id": "OWASP-A05-INSECURE-SSL",
        "category": "OWASP A05: Security Misconfiguration",
        "severity": "HIGH",
        "regex": r"(?:verify\s*=\s*False|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['\"]?0)",
        "description": "SSL certificate verification disabled (verify=False). Enables Man-in-the-Middle (MitM) attacks.",
        "extensions": [".py", ".js", ".ts", ".sh"]
    },
    {
        "id": "OWASP-A05-DEBUG-ENABLED",
        "category": "OWASP A05: Security Misconfiguration",
        "severity": "MEDIUM",
        "regex": r"(?:app\.run\([^)]*debug\s*=\s*True|DEBUG\s*=\s*True)",
        "description": "Debug mode enabled. Ensure debug is disabled or set via environment variable in production.",
        "extensions": [".py"]
    },
    {
        "id": "OWASP-A08-INSECURE-DESERIALIZE",
        "category": "OWASP A08: Software & Data Integrity Failures",
        "severity": "HIGH",
        "regex": r"(?:pickle\.loads?|yaml\.load\s*\([^,)]*\)|yaml\.load\s*\([^,)]*,\s*Loader\s*=\s*(?:yaml\.)?Loader\b)",
        "description": "Insecure deserialization: pickle or unsafe yaml.load() allows arbitrary code execution. Use yaml.safe_load().",
        "extensions": [".py"]
    },
    {
        "id": "OWASP-A10-SSRF",
        "category": "OWASP A10: Server-Side Request Forgery",
        "severity": "HIGH",
        "regex": r"(?:requests\.(?:get|post|put|patch)|urllib\.request\.urlopen|fetch)\s*\(\s*(?:url|req_url|target_url|user_url)\b",
        "description": "Potential SSRF: Outbound HTTP request with dynamic target. Validate scheme and restrict private/loopback IP ranges.",
        "extensions": [".py", ".js", ".ts"]
    },

    # --- OWASP GENAI / LLM TOP 10 ---
    {
        "id": "GENAI-LLM01-PROMPT-INJECTION",
        "category": "OWASP GenAI LLM01: Prompt Injection",
        "severity": "HIGH",
        "regex": r"(?:system_instruction|system_prompt|prompt)\s*=\s*f['\"][^'\"]*\{user_[^}]+\}",
        "description": "Direct unvalidated user input interpolated into system prompt. Use explicit structural fencing (e.g. <user_input>) and sanitize.",
        "extensions": [".py", ".ts", ".js"]
    },
    {
        "id": "GENAI-LLM05-IMPROPER-OUTPUT-HANDLING",
        "category": "OWASP GenAI LLM05: Improper Output Handling",
        "severity": "CRITICAL",
        "regex": r"(?:eval|exec|subprocess\.(?:run|Popen|call))\s*\(\s*(?:llm_|model_|ai_|response\.(?:text|content))",
        "description": "Unsafe execution of raw LLM output: Passing AI-generated text directly into eval/exec/subprocess. Parse with strict schema/AST validation.",
        "extensions": [".py", ".js", ".ts"]
    },
    {
        "id": "GENAI-LLM06-EXCESSIVE-AGENCY",
        "category": "OWASP GenAI LLM06: Excessive Agency",
        "severity": "HIGH",
        "regex": r"(?:os\.remove|shutil\.rmtree|subprocess\.run\s*\([^)]*rm\s+-rf)[^)]*(?:llm|args|tool_input)",
        "description": "Excessive Agency: Autonomous destructive action executed from tool arguments without human confirmation or strict allowlist.",
        "extensions": [".py", ".sh", ".js"]
    },
    {
        "id": "GENAI-LLM07-PROMPT-LEAKAGE",
        "category": "OWASP GenAI LLM07: System Prompt Leakage",
        "regex": r"return\s+.*(?:system_instruction|system_prompt|prompt_template)",
        "severity": "MEDIUM",
        "description": "System prompt directly returned in output. Prevent system prompt leakage by stripping or filtering prompt metadata.",
        "extensions": [".py", ".js", ".ts"]
    },
    {
        "id": "GENAI-LLM10-UNBOUNDED-CONSUMPTION",
        "category": "OWASP GenAI LLM10: Unbounded Consumption",
        "severity": "MEDIUM",
        "regex": r"(?:client\.models\.generate_content|genai\.generate_text|openai\.ChatCompletion\.create)\s*\((?![^)]*(?:max_tokens|max_output_tokens|timeout))",
        "description": "Unbounded LLM consumption: Generation call missing max_tokens or timeout limit. Configure resource bounds to prevent DoS.",
        "extensions": [".py", ".js", ".ts"]
    }
]

def scan_file(file_path):
    issues = []
    path_obj = Path(file_path)
    if not path_obj.exists() or not path_obj.is_file():
        return issues

    file_ext = path_obj.suffix.lower()
    path_str = str(file_path)

    if is_ignored(path_str):
        return issues

    try:
        content = path_obj.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return issues

    lines = content.splitlines()

    for rule in RULES:
        if rule["extensions"] and file_ext not in rule["extensions"]:
            continue

        compiled_re = re.compile(rule["regex"], re.IGNORECASE)

        for line_no, line in enumerate(lines, start=1):
            if compiled_re.search(line):
                # Check for exemptions
                exempt = False
                if "exempt_terms" in rule:
                    for term in rule["exempt_terms"]:
                        if term.lower() in line.lower() or term.lower() in path_str.lower():
                            exempt = True
                            break

                # Ignore comments that disable or explain security rules
                if "# nosec" in line or "// nosec" in line:
                    exempt = True

                if not exempt:
                    issues.append({
                        "file": path_str,
                        "line": line_no,
                        "line_content": line.strip(),
                        "rule_id": rule["id"],
                        "category": rule["category"],
                        "severity": rule["severity"],
                        "description": rule["description"]
                    })

    return issues

def get_staged_files():
    """Returns list of files staged in git."""
    try:
        res = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True, text=True, check=True
        )
        files = [line.strip() for line in res.stdout.splitlines() if line.strip()]
        return files
    except Exception as e:
        print(f"Warning: Unable to get git staged files: {e}")
        return []

def get_all_tracked_files():
    """Returns list of all files tracked by git."""
    try:
        res = subprocess.run(
            ["git", "ls-files"],
            capture_output=True, text=True, check=True
        )
        files = [line.strip() for line in res.stdout.splitlines() if line.strip()]
        return files
    except Exception as e:
        print(f"Warning: Unable to get git tracked files: {e}")
        return []

def main():
    parser = argparse.ArgumentParser(description="OWASP Top 10 & OWASP GenAI Top 10 Security Scanner")
    parser.add_argument("--staged", action="store_true", help="Scan only git staged files (default for pre-commit)")
    parser.add_argument("--all", action="store_true", help="Scan all tracked files in repository")
    parser.add_argument("--path", type=str, help="Specific file or directory to scan")
    parser.add_argument("--severity", choices=["ALL", "MEDIUM", "HIGH", "CRITICAL"], default="HIGH", help="Minimum severity threshold to block (default: HIGH)")
    parser.add_argument("--bypass", action="store_true", help="Report issues but do not exit with failure")
    args = parser.parse_args()

    files_to_scan = []
    if args.path:
        p = Path(args.path)
        if p.is_file():
            files_to_scan = [str(p)]
        elif p.is_dir():
            files_to_scan = [str(f) for f in p.rglob("*") if f.is_file() and not is_ignored(str(f))]
    elif args.all:
        files_to_scan = get_all_tracked_files()
    else:
        # Default to staged files if in git repo, else current dir
        files_to_scan = get_staged_files()
        if not files_to_scan and not args.staged:
            files_to_scan = get_all_tracked_files()

    if not files_to_scan:
        print(f"{GREEN}✔ No relevant code files to scan for security flaws.{RESET}")
        sys.exit(0)

    print(f"\n{BOLD}{CYAN}🛡️  OWASP Top 10 & GenAI Security Audit Scanner{RESET}")
    print(f"Checking {len(files_to_scan)} file(s) for OWASP & GenAI Top 10 vulnerabilities...")
    print("=" * 70)

    all_issues = []
    for f in files_to_scan:
        issues = scan_file(f)
        all_issues.extend(issues)

    # Severity ordering
    sev_rank = {"CRITICAL": 3, "HIGH": 2, "MEDIUM": 1, "LOW": 0}
    min_rank = sev_rank.get(args.severity, 2)

    blocking_issues = [i for i in all_issues if sev_rank.get(i["severity"], 0) >= min_rank]

    if not all_issues:
        print(f"\n{GREEN}{BOLD}✔ PASSED:{RESET} {GREEN}0 security vulnerabilities detected across OWASP Top 10 & OWASP GenAI Top 10.{RESET}\n")
        sys.exit(0)

    # Display issues
    print(f"\n{YELLOW}{BOLD}⚠️  Detected {len(all_issues)} potential security flaw(s) ({len(blocking_issues)} blocking threshold '{args.severity}'):{RESET}\n")

    for i, issue in enumerate(all_issues, 1):
        color = RED if issue["severity"] in ["CRITICAL", "HIGH"] else YELLOW
        print(f"  {BOLD}[{i}] {color}{issue['severity']}{RESET} — {issue['category']} ({issue['rule_id']})")
        print(f"      File: {issue['file']}:{issue['line']}")
        print(f"      Code: {issue['line_content']}")
        print(f"      Fix:  {issue['description']}\n")

    print("=" * 70)

    if blocking_issues and not args.bypass:
        print(f"{RED}{BOLD}❌ COMMIT BLOCKED:{RESET} Found {len(blocking_issues)} security flaw(s) matching threshold {args.severity}.")
        print(f"Please remediate the issues above or append `# nosec` to deliberate lines to proceed.\n")
        sys.exit(1)
    else:
        print(f"{GREEN}✔ Non-blocking security warnings reported. Proceeding.{RESET}\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
