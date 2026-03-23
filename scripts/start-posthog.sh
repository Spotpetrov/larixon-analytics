#!/bin/bash
# Auto-start PostHog MCP proxy (wrangler dev → localhost:8787 → posthog.larixon.com)
# and connect via mcp-remote as stdio MCP server for Claude Code.

set -e

POSTHOG_MCP_DIR="${POSTHOG_MCP_DIR:-$HOME/posthog-mcp}"
POSTHOG_BASE_URL="${POSTHOG_BASE_URL:-https://posthog.larixon.com}"
POSTHOG_API_KEY="${POSTHOG_API_KEY:?POSTHOG_API_KEY is required}"
PORT=8787

log() { echo "[posthog-mcp] $*" >&2; }

# 1. Clone and install if missing
if [ ! -d "$POSTHOG_MCP_DIR/typescript" ]; then
  log "First run: cloning posthog-mcp..."
  git clone --depth 1 https://github.com/PostHog/posthog-mcp.git "$POSTHOG_MCP_DIR"
  cd "$POSTHOG_MCP_DIR/typescript"
  log "Installing dependencies (this may take a minute)..."
  npx -y pnpm install
  npx -y pnpm approve-builds esbuild workerd 2>/dev/null || true
  log "Setup complete."
fi

# 2. Start wrangler dev if not already running on PORT
if ! curl -sf "http://localhost:$PORT/" > /dev/null 2>&1; then
  log "Starting wrangler dev on port $PORT..."
  cd "$POSTHOG_MCP_DIR/typescript"
  POSTHOG_BASE_URL="$POSTHOG_BASE_URL" npx wrangler dev --port "$PORT" > /dev/null 2>&1 &
  WRANGLER_PID=$!

  # Wait for port to become available (up to 30s)
  for i in $(seq 1 30); do
    if curl -sf "http://localhost:$PORT/" > /dev/null 2>&1; then
      log "Proxy ready (pid=$WRANGLER_PID)."
      break
    fi
    sleep 1
  done

  if ! curl -sf "http://localhost:$PORT/" > /dev/null 2>&1; then
    log "ERROR: wrangler did not start within 30s. Check $POSTHOG_MCP_DIR/typescript/"
    exit 1
  fi
else
  log "Proxy already running on port $PORT."
fi

# 3. Connect mcp-remote (stdio bridge to the local proxy)
exec npx -y mcp-remote@latest "http://localhost:$PORT/mcp" \
  --header "Authorization:Bearer $POSTHOG_API_KEY"
