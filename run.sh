#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# 0) Run setup in background
echo "? Starting YOLO setup in background..."
(cd yolo && ./setup.sh) &

# 1) Loop the main app logic
while true; do
  echo "?? Starting index.js"
  if sudo node index.js; then
    echo "? index.js completed successfully."
  else
    echo "? index.js failed with exit code $? ? aborting loop." >&2
    exit 1
  fi

  echo "?? Running servo.js with sudo"
  if sudo node servo.js; then
    echo "? servo.js completed successfully."
  else
    echo "? servo.js failed with exit code $? ? aborting loop." >&2
    exit 1
  fi

  # Optional: Add sleep if you want a pause between loops
  # sleep 2
done
