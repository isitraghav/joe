#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# 0) Check if port 7860 is busy
echo "?? Checking if http://127.0.0.1:7860 is already in use..."
if ss -ltn | grep -q ':7860'; then
  echo "?? Port 7860 is already in use, skipping YOLO setup."
else
  echo "?? Starting YOLO setup in background..."
  (cd yolo && ./setup.sh) &
fi

# 1) Loop the main app logic
while true; do
  echo "?? Starting index.js"
  if sudo node index.js; then
    echo "? index.js completed successfully."
  else
    echo "? index.js failed with exit code $? � aborting loop." >&2
    exit 1
  fi

  echo "?? Running servo.js with sudo"
  if sudo node servo.js; then
    echo "? servo.js completed successfully."
  else
    echo "? servo.js failed with exit code $? � aborting loop." >&2
    exit 1
  fi

  # Optional pause between runs
  # sleep 2
done
