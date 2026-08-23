#!/usr/bin/env bash
# manage_automation.sh — ACE Unified Management CLI

set -euo pipefail

WORKSPACE_DIR="/Volumes/Crucial X9 Pro For Mac/GDriveSync/Antigravity"
YOUTUBE_DIR="$WORKSPACE_DIR/YouTubeSEOMaximizer"
SPOTIFY_DIR="/Volumes/Crucial X9 Pro For Mac/Tools/spotify-creators-uploader"
PYTHON_FAST="$YOUTUBE_DIR/.venv_fast/bin/python"

usage() {
  echo "==================================================================="
  echo "           ACE UNIFIED AUTOMATION MANAGEMENT CLI                   "
  echo "==================================================================="
  echo "Usage: ./manage_automation.sh [command]"
  echo ""
  echo "Commands:"
  echo "  status       Show live running processes, PIDs, and latest logs"
  echo "  run-now      Trigger immediate full ecosystem synchronization cycle"
  echo "  start-daemon Launch the continuous background growth daemon"
  echo "  stop-daemon  Stop any running background growth daemons"
  echo "  logs         Tail the master orchestrator execution log"
  echo "  install-launchagent Setup native macOS LaunchAgent (every 6h, surviving reboots/sleep)"
  echo "  uninstall-launchagent Remove the native macOS LaunchAgent"
  echo "  status-launchagent    Check status of macOS LaunchAgent"
  echo "  install-cron Setup a 6-hour crontab check on macOS"
  echo "==================================================================="
  exit 1
}

cmd="${1:-status}"
PLIST_NAME="com.cpfcoaching.ace.growth.orchestrator.plist"
USER_LAUNCHAGENTS="$HOME/Library/LaunchAgents"

case "$cmd" in
  status)
    echo "🔍 Checking Running ACE Daemons & Background Services..."
    echo "-------------------------------------------------------------------"
    pgrep -fl "autonomous_growth_daemon" || echo "• YouTube Growth Daemon: Not running"
    pgrep -fl "master_ecosystem_orchestrator" || echo "• Master Orchestrator: Not running"
    pgrep -fl "dashboard.py" || echo "• Local Dashboard: Not running"
    echo "-------------------------------------------------------------------"
    echo "📋 Latest Multi-Channel Log Output:"
    if [ -f "$YOUTUBE_DIR/autonomous_growth.log" ]; then
      tail -n 12 "$YOUTUBE_DIR/autonomous_growth.log"
    fi
    ;;

  run-now)
    echo "🚀 Triggering Immediate ACE Full Ecosystem Cycle..."
    "$PYTHON_FAST" "$WORKSPACE_DIR/master_ecosystem_orchestrator.py" --run-now
    ;;

  start-daemon)
    echo "▶️ Launching Background Daemon (6-hour interval)..."
    nohup "$PYTHON_FAST" "$WORKSPACE_DIR/master_ecosystem_orchestrator.py" --daemon --interval 360 >> "$WORKSPACE_DIR/master_orchestrator.log" 2>&1 &
    echo "✅ Master Orchestrator running with PID $!"
    ;;

  stop-daemon)
    echo "⏹️ Stopping any running ACE growth daemons..."
    pkill -f "master_ecosystem_orchestrator.py" 2>/dev/null || true
    pkill -f "autonomous_growth_daemon.py" 2>/dev/null || true
    echo "✅ Background daemons stopped."
    ;;

  logs)
    tail -f "$WORKSPACE_DIR/master_orchestrator.log"
    ;;

  install-launchagent)
    echo "⏰ Installing native macOS LaunchAgent ($PLIST_NAME)..."
    mkdir -p "$USER_LAUNCHAGENTS"
    mkdir -p "$WORKSPACE_DIR/logs"
    cp -f "$WORKSPACE_DIR/$PLIST_NAME" "$USER_LAUNCHAGENTS/$PLIST_NAME"
    launchctl unload "$USER_LAUNCHAGENTS/$PLIST_NAME" 2>/dev/null || true
    launchctl load "$USER_LAUNCHAGENTS/$PLIST_NAME"
    echo "✅ LaunchAgent installed and loaded into launchd!"
    echo "   • Runs every 6 hours (21,600s) + on system wake/login"
    echo "   • Plist: $USER_LAUNCHAGENTS/$PLIST_NAME"
    echo "   • Logs: $WORKSPACE_DIR/logs/"
    ;;

  uninstall-launchagent)
    echo "🗑️ Removing macOS LaunchAgent..."
    if [ -f "$USER_LAUNCHAGENTS/$PLIST_NAME" ]; then
      launchctl unload "$USER_LAUNCHAGENTS/$PLIST_NAME" 2>/dev/null || true
      rm -f "$USER_LAUNCHAGENTS/$PLIST_NAME"
      echo "✅ LaunchAgent unloaded and removed."
    else
      echo "LaunchAgent not currently installed."
    fi
    ;;

  status-launchagent)
    echo "🔍 Checking LaunchAgent status in launchd..."
    launchctl list | grep "com.cpfcoaching" || echo "• No com.cpfcoaching LaunchAgents currently loaded."
    if [ -f "$WORKSPACE_DIR/logs/launchagent_stdout.log" ]; then
      echo "📋 Recent LaunchAgent Output:"
      tail -n 10 "$WORKSPACE_DIR/logs/launchagent_stdout.log"
    fi
    ;;

  install-cron)
    echo "⏰ Installing user crontab entry for automated execution..."
    CRON_CMD="0 */6 * * * $PYTHON_FAST $WORKSPACE_DIR/master_ecosystem_orchestrator.py --run-now >> $WORKSPACE_DIR/master_orchestrator.log 2>&1"
    (crontab -l 2>/dev/null | grep -v "master_ecosystem_orchestrator.py"; echo "$CRON_CMD") | crontab -
    echo "✅ Crontab entry installed (runs every 6 hours):"
    crontab -l | grep "master_ecosystem_orchestrator"
    ;;

  *)
    usage
    ;;
esac
