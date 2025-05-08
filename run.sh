#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# 0) Ensure YOLO is always restarted if port 7860 is busy
echo "🔍 Checking YOLO port (7860)..."
if ss -ltnp | grep -q ':7860'; then
  echo "⚠️ Port 7860 is in use. Killing existing process..."
  # get PID(s) listening on 7860 and kill them
  ss -ltnp | awk '/:7860/ { gsub(/.*pid=/,""); gsub(/,.*/,""); print $0 }' | xargs -r sudo kill -9
  echo "▶️ Restarting YOLO..."
  (cd yolo && ./setup.sh) &
else
  echo "✅ Port 7860 free. Starting YOLO..."
  (cd yolo && ./setup.sh) &
fi

# 1) Main loop
while true; do
  echo "🚀 Running index.js..."
  # capture both stdout+stderr
  if output=$(sudo node index.js 2>&1); then
    echo "$output"
    echo "✔️ index.js succeeded."
  else
    rc=$?
    echo "$output"
    echo "❌ index.js failed (exit code $rc). Aborting." >&2
    exit $rc
  fi

  # 2) Decide which servo to run based on detection output
  if printf "%s" "$output" | grep -qP 'none'; then
    echo "ℹ️ Detected “none” → running servo_small_step..."
    if sudo node servo_small_step; then
      echo "✔️ servo_small_step completed."
    else
      echo "❌ servo_small_step failed. Aborting." >&2
      exit 1
    fi
  else
    echo "ℹ️ Detection present → running servo..."
    if sudo node servo; then
      echo "✔️ servo completed."
    else
      echo "❌ servo failed. Aborting." >&2
      exit 1
    fi
  fi

  # Optional delay between iterations
  # sleep 2
done
