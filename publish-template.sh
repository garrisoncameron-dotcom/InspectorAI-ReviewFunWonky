#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: ./publish-template.sh git@github.com:garrisoncameron-dotcom/InspectorAI-ReviewFunWonky.git"
  exit 1
fi

git remote remove origin 2>/dev/null || true
git remote add origin "$1"
git branch -M main
git push -u origin main

echo "Then enable GitHub Pages from Settings > Pages > Deploy from a branch > main > /root."
