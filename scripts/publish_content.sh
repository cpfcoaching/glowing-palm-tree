#!/bin/bash

# publish_content.sh
# Wrapper to orchestrate content publishing to Buffer or Substack

set -e

print_usage() {
  echo "Usage: ./publish_content.sh [OPTIONS]"
  echo "Options:"
  echo "  --target [buffer|substack]   Target platform (required)"
  echo "  --file <path>                Path to markdown file containing content (required)"
  echo "  --profile <id>               Buffer Profile ID (or set BUFFER_PROFILE_ID env var)"
  echo "  --token <token>              Buffer Access Token (or set BUFFER_ACCESS_TOKEN env var)"
  echo "  --time <time>                Scheduled time (ISO) or 'now' (optional, default: now)"
  echo "  --dry-run                    Simulate the action without making API calls or browser actions"
  echo "  --headless                   Run Playwright in headless mode (optional for substack)"
  echo ""
}

TARGET=""
FILE=""
PROFILE="${BUFFER_PROFILE_ID:-}"
TOKEN="${BUFFER_ACCESS_TOKEN:-}"
TIME="now"
DRY_RUN=""
HEADLESS=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --target) TARGET="$2"; shift ;;
    --file) FILE="$2"; shift ;;
    --profile) PROFILE="$2"; shift ;;
    --token) TOKEN="$2"; shift ;;
    --time) TIME="$2"; shift ;;
    --dry-run) DRY_RUN="--dryRun"; ;;
    --headless) HEADLESS="--headless"; ;;
    -h|--help) print_usage; exit 0 ;;
    *) echo "Unknown parameter: $1"; print_usage; exit 1 ;;
  esac
  shift
done

if [ -z "$TARGET" ]; then
  echo "Error: --target is required."
  exit 1
fi

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Error: --file is required and must exist."
  exit 1
fi

# Basic parsing: read first line as title, rest as body
TITLE=$(head -n 1 "$FILE" | sed 's/^# //')
BODY=$(tail -n +3 "$FILE")

if [ "$TARGET" == "buffer" ]; then
  if [ -z "$PROFILE" ] || [ -z "$TOKEN" ]; then
    echo "Error: --profile and --token are required for buffer."
    exit 1
  fi
  echo "Publishing to Buffer..."
  node "$(dirname "$0")/buffer_publisher.js" --token "$TOKEN" --profiles "$PROFILE" --text "$BODY" --time "$TIME" $DRY_RUN

elif [ "$TARGET" == "substack" ]; then
  echo "Publishing to Substack..."
  node "$(dirname "$0")/substack_publisher.js" --title "$TITLE" --body "$BODY" $HEADLESS $DRY_RUN

else
  echo "Error: target must be 'buffer' or 'substack'."
  exit 1
fi
