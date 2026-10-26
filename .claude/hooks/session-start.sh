#!/bin/bash
# Installs the HyperFrames CLI (HTML-to-video) and its render browser in Claude Code cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

HYPERFRAMES_VERSION="0.8.203"

if [ "$(hyperframes --version 2>/dev/null || true)" != "$HYPERFRAMES_VERSION" ]; then
  npm install -g "hyperframes@${HYPERFRAMES_VERSION}" --no-fund --no-audit
fi

# Chrome Headless Shell is required for `hyperframes render`; ensure is a no-op once cached.
(cd /tmp && hyperframes browser ensure >/dev/null)
