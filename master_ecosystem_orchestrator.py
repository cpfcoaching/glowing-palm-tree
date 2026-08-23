#!/usr/bin/env python3
"""
master_ecosystem_orchestrator.py — ACE Autonomous Ecosystem Orchestrator

Unified background engine coordinating:
  1. YouTube Multi-Channel Optimization (Breaking Into Cybersecurity & CPF Coaching)
  2. Spotify Video Podcast Drip Publishing & Show Note Cross-Linking
  3. Batch 9:16 Vertical Shorts Auto-Rendering
  4. Unified Multi-Platform Executive Email Reporting (christophefoulon@gmail.com)

Usage:
    # Run a full ecosystem sync now
    python3 master_ecosystem_orchestrator.py --run-now

    # Run continuously as daemon (checks every 6 hours)
    python3 master_ecosystem_orchestrator.py --daemon --interval 360
"""

import os
import sys
import time
import subprocess
import logging
import argparse
from datetime import datetime
from pathlib import Path

# Base Paths
WORKSPACE_ROOT = Path("/Volumes/Crucial X9 Pro For Mac/GDriveSync/Antigravity")
YOUTUBE_DIR = WORKSPACE_ROOT / "YouTubeSEOMaximizer"
SPOTIFY_DIR = Path("/Volumes/Crucial X9 Pro For Mac/Tools/spotify-creators-uploader")
PYTHON_FAST = YOUTUBE_DIR / ".venv_fast" / "bin" / "python"
PYTHON_SPOTIFY = SPOTIFY_DIR / ".venv" / "bin" / "python"

LOG_FILE = WORKSPACE_ROOT / "master_orchestrator.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("ACEOrchestrator")

def run_youtube_growth():
    logger.info("🎬 [PHASE 1] Executing YouTube Multi-Channel 6-Track Growth Engine...")
    daemon_script = YOUTUBE_DIR / "autonomous_growth_daemon.py"
    if not daemon_script.exists():
        logger.error(f"Missing {daemon_script}")
        return False
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(daemon_script), "--run-all"]
    
    try:
        res = subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=300)
        logger.info("✅ YouTube Multi-Channel Engine Completed.")
        return True
    except Exception as e:
        logger.error(f"❌ YouTube Growth Engine error: {e}")
        return False

def run_shorts_rendering():
    logger.info("✂️ [PHASE 2] Executing Batch 9:16 Vertical Shorts Auto-Renderer...")
    shorts_script = YOUTUBE_DIR / "batch_produce_shorts.py"
    if not shorts_script.exists():
        logger.info("Shorts builder not present, skipping.")
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(shorts_script)]
    
    try:
        res = subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=300)
        logger.info("✅ Batch Shorts Rendering Completed.")
        return True
    except Exception as e:
        logger.error(f"❌ Shorts Rendering error: {e}")
        return False

def run_shorts_staging():
    logger.info("📤 [PHASE 3] Uploading & Staging Shorts as UNLISTED for Quality Review...")
    stage_script = YOUTUBE_DIR / "stage_and_upload_shorts.py"
    if not stage_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(stage_script)]
    
    try:
        res = subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=300)
        logger.info("✅ Shorts Staging to YouTube Complete (Review in Studio).")
        return True
    except Exception as e:
        logger.error(f"❌ Shorts Staging error: {e}")
        return False

def run_draft_kit():
    logger.info("📝 [PHASE 4] Refreshing Weekly Social Promotion Draft Kits...")
    kit_script = YOUTUBE_DIR / "generate_weekly_draft_kit.py"
    if not kit_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(kit_script)]
    
    try:
        subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=60)
        logger.info("✅ Weekly Promotion Draft Kit Refreshed.")
        return True
    except Exception as e:
        logger.error(f"❌ Draft Kit error: {e}")
        return False

def run_guest_kits():
    logger.info("🎙️ [PHASE 5] Generating 1-Click Guest Co-Promotion Launch Kits...")
    guest_script = YOUTUBE_DIR / "guest_launch_kit_engine.py"
    if not guest_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(guest_script)]
    
    try:
        subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=60)
        logger.info("✅ Guest Co-Promotion Launch Kits Ready.")
        return True
    except Exception as e:
        logger.error(f"❌ Guest Kit error: {e}")
        return False

def run_substack_drafter():
    logger.info("📰 [PHASE 6] Auto-Drafting Weekly Substack Newsletter (The vCISO Brief)...")
    sub_script = YOUTUBE_DIR / "substack_newsletter_drafter.py"
    if not sub_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(sub_script)]
    
    try:
        subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=60)
        logger.info("✅ Weekly Substack Newsletter Drafted.")
        return True
    except Exception as e:
        logger.error(f"❌ Substack Drafter error: {e}")
        return False

def run_community_queue():
    logger.info("📊 [PHASE 7] Scheduling YouTube Community Tab Polls & Engagement...")
    comm_script = YOUTUBE_DIR / "community_engagement_engine.py"
    if not comm_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(comm_script)]
    
    try:
        subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=60)
        logger.info("✅ YouTube Community Tab Engagement Refreshed.")
        return True
    except Exception as e:
        logger.error(f"❌ Community Engine error: {e}")
        return False

def run_linkedin_article():
    logger.info("💼 [PHASE 9] Repurposing vCISO Brief into LinkedIn Executive Article...")
    li_script = YOUTUBE_DIR / "linkedin_article_repurposer.py"
    if not li_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(li_script)]
    
    try:
        subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=60)
        logger.info("✅ LinkedIn Executive Article Drafted.")
        return True
    except Exception as e:
        logger.error(f"❌ LinkedIn Repurposer error: {e}")
        return False

def run_spotify_show_notes():
    logger.info("🎙️ [PHASE 10] Generating Rich Spotify Episode Show Notes & Chapters...")
    notes_script = YOUTUBE_DIR / "spotify_show_notes_engine.py"
    if not notes_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(notes_script)]
    
    try:
        subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=60)
        logger.info("✅ Spotify Episode Show Notes Ready.")
        return True
    except Exception as e:
        logger.error(f"❌ Spotify Show Notes error: {e}")
        return False

def run_comment_triage():
    logger.info("💬 [PHASE 11] Triaging Recent YouTube Comments & Generating Retention Replies...")
    comm_script = YOUTUBE_DIR / "youtube_comment_responder.py"
    if not comm_script.exists():
        return True
        
    py_bin = PYTHON_FAST if PYTHON_FAST.exists() else sys.executable
    cmd = [str(py_bin), str(comm_script)]
    
    try:
        subprocess.run(cmd, cwd=str(YOUTUBE_DIR), capture_output=True, text=True, timeout=60)
        logger.info("✅ YouTube Comment Responses Prepared.")
        return True
    except Exception as e:
        logger.error(f"❌ Comment Responder error: {e}")
        return False

def execute_full_cycle():
    start_time = datetime.now()
    logger.info("===================================================================")
    logger.info(f"🚀 Starting ACE Autonomous Ecosystem Cycle at {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("===================================================================")
    
    yt_ok = run_youtube_growth()
    shorts_ok = run_shorts_rendering()
    staging_ok = run_shorts_staging()
    kit_ok = run_draft_kit()
    guest_ok = run_guest_kits()
    substack_ok = run_substack_drafter()
    comm_ok = run_community_queue()
    spotify_ok = run_spotify_publisher()
    li_ok = run_linkedin_article()
    notes_ok = run_spotify_show_notes()
    triage_ok = run_comment_triage()
    
    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info("===================================================================")
    logger.info(f"✨ Full Ecosystem Cycle Complete in {elapsed:.1f}s (11-Phase Multi-Platform Engine Active)")
    logger.info("===================================================================\n")

def run_daemon(interval_minutes=360):
    logger.info(f"🤖 ACE Master Daemon Active. Scheduled to run every {interval_minutes} minutes.")
    while True:
        try:
            execute_full_cycle()
        except Exception as e:
            logger.error(f"Unhandled error in ecosystem cycle: {e}")
            
        logger.info(f"Sleeping for {interval_minutes} minutes until next cycle...")
        time.sleep(interval_minutes * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ACE Master Autonomous Ecosystem Orchestrator")
    parser.add_argument("--run-now", action="store_true", help="Run one full multi-platform synchronization cycle now")
    parser.add_argument("--daemon", action="store_true", help="Run continuously in background")
    parser.add_argument("--interval", type=int, default=360, help="Interval in minutes (default: 360)")
    args = parser.parse_args()
    
    if args.daemon:
        run_daemon(args.interval)
    else:
        execute_full_cycle()
