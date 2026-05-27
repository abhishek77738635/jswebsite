#!/usr/bin/env bash
# One-time setup: this folder → your personal GitHub (local git config only here).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d .git ]; then
  git init -b main
  echo "Initialized git repo in: $ROOT"
fi

echo ""
echo "Personal Git identity (saved only in this folder, not global):"
read -r -p "Your name: " GIT_NAME
read -r -p "Your email (GitHub noreply or real): " GIT_EMAIL
git config --local user.name "$GIT_NAME"
git config --local user.email "$GIT_EMAIL"

echo ""
read -r -p "GitHub username: " GH_USER
read -r -p "Repository name [js-website]: " REPO
REPO="${REPO:-js-website}"

REMOTE="https://github.com/${GH_USER}/${REPO}.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"

echo ""
echo "Done. This folder is linked to: $REMOTE"
echo ""
echo "Next steps:"
echo "  1. Create the repo (empty, no README): https://github.com/new?name=${REPO}"
echo "  2. Stage and push:"
echo "       git add -A"
echo "       git status          # confirm .env and serviceAccountKey.json are NOT listed"
echo "       git commit -m \"Initial commit\""
echo "       git push -u origin main"
echo ""
echo "Or with GitHub CLI: gh auth login && gh repo create ${REPO} --private --source=. --push"
