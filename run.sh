#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# 1) Run your main app
echo "? Starting index.js?"
if sudo node index.js; then
  echo "? index.js completed successfully."
else
  echo "? index.js failed with exit code $?. Aborting." >&2
  exit 1
fi

# 2) Now invoke the servo script as sudo
echo "? Running servo.js with sudo?"
if sudo node servo.js; then
  echo "? servo.js completed successfully."
else
  echo "? servo.js failed with exit code $?."
  exit 1
fi
