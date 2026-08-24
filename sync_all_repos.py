#!/usr/bin/env python3
"""
sync_all_repos.py — Multi-Repository Auto-Synchronizer for Crucial Drive
"""

import os
import sys
import subprocess
from pathlib import Path

CRUCIAL = Path("/Volumes/Crucial X9 Pro For Mac")

env = os.environ.copy()
env["GIT_SSH_COMMAND"] = "ssh -o BatchMode=yes -o ConnectTimeout=4"
env["GIT_TERMINAL_PROMPT"] = "0"

KNOWN_ACTIVE_REPOS = [
    CRUCIAL / "GDriveSync" / "Antigravity",
    CRUCIAL / "GDriveSync" / "Antigravity" / "YouTubeSEOMaximizer",
    CRUCIAL / "Library" / "GAI-CPF-Agent-HUB-POC",
    CRUCIAL / "Library" / "JobHunter_CPF-Coaching",
    CRUCIAL / "Library" / "job-hunt-frontend",
    CRUCIAL / "Library" / "OpenBrain",
    CRUCIAL / "Library" / "prowler",
    CRUCIAL / "GDriveSync" / "Forwarded-Deployed-CISO",
    CRUCIAL / "GDriveSync" / "The Cybersecurity Advantage",
]

def sync_repo(repo_path):
    if not (repo_path / ".git").exists():
        return (str(repo_path), "-", "Skipped (Not a git repo)")
        
    rel_name = str(repo_path.relative_to(CRUCIAL)) if repo_path.is_relative_to(CRUCIAL) else str(repo_path)
    
    try:
        # Check remote
        rem_check = subprocess.run(["git", "remote"], cwd=repo_path, capture_output=True, text=True, env=env, timeout=5)
        if not rem_check.stdout.strip():
            return (rel_name, "-", "Local Only (No remote)")
            
        # Check branch
        br_check = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_path, capture_output=True, text=True, env=env, timeout=5)
        branch = br_check.stdout.strip() or "HEAD"
        
        # Check status
        st_check = subprocess.run(["git", "status", "--porcelain"], cwd=repo_path, capture_output=True, text=True, env=env, timeout=5)
        is_dirty = bool(st_check.stdout.strip())
        
        if is_dirty:
            return (rel_name, branch, "⚠️ Uncommitted local changes (Skipped pull)")
            
        fetch = subprocess.run(["git", "fetch", "--prune"], cwd=repo_path, capture_output=True, text=True, env=env, timeout=8)
        pull = subprocess.run(["git", "pull", "--rebase"], cwd=repo_path, capture_output=True, text=True, env=env, timeout=8)
        push = subprocess.run(["git", "push"], cwd=repo_path, capture_output=True, text=True, env=env, timeout=8)
        
        status_msg = "Up to date"
        if "Already up to date" not in pull.stdout and "Fast-forward" in pull.stdout:
            status_msg = "Pulled Updates"
        if "Everything up-to-date" not in push.stderr and "->" in push.stderr:
            status_msg = "Pushed Commits"
            
        return (rel_name, branch, f"✅ {status_msg}")
    except subprocess.TimeoutExpired:
        return (rel_name, "-", "⏱️ Remote Auth/Timeout Skipped")
    except Exception as e:
        return (rel_name, "-", f"❌ Error: {e}")

def main():
    print(f"\n🔄 Synchronizing All Primary Repositories across Crucial Drive...\n", flush=True)
    print(f"{'Repository':<58} | {'Branch':<12} | Status", flush=True)
    print("=" * 105, flush=True)
    
    for repo in KNOWN_ACTIVE_REPOS:
        if repo.exists():
            r, b, s = sync_repo(repo)
            print(f"{r:<58} | {b:<12} | {s}", flush=True)
            
    print("=" * 105, flush=True)

if __name__ == "__main__":
    main()
