#!/usr/bin/env bash
# Antigravity startup auto-sync hook

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Fast non-blocking pull
(
  cd "$SCRIPT_DIR" && git pull --quiet origin main 2>/dev/null || true
) &

# Output valid empty JSON response for hook protocol
echo "{}"
