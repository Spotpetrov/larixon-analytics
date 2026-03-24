#!/usr/bin/env node
// Auto-start PostHog wrangler proxy if not running, then connect mcp-remote.
// Assumes posthog-mcp is already cloned and deps installed (see setup-posthog.ps1).

const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const os = require("os");
const { existsSync } = require("fs");

const API_KEY = process.env.POSTHOG_API_KEY;
const BASE_URL = process.env.POSTHOG_BASE_URL || "https://posthog.larixon.com";
const MCP_DIR = process.env.POSTHOG_MCP_DIR || path.join(os.homedir(), "posthog-mcp");
const PORT = 8787;

if (!API_KEY) {
  process.stderr.write("[posthog] ERROR: POSTHOG_API_KEY not set\n");
  process.exit(1);
}

function log(msg) {
  process.stderr.write(`[posthog] ${msg}\n`);
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

function waitForPort(port, timeoutSec) {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    const check = async () => {
      if (await isPortOpen(port)) return resolve();
      elapsed += 2;
      if (elapsed >= timeoutSec) return reject(new Error(`Port ${port} not ready after ${timeoutSec}s`));
      setTimeout(check, 2000);
    };
    check();
  });
}

async function main() {
  // 1. Check if proxy already running
  if (await isPortOpen(PORT)) {
    log("Proxy already running.");
  } else {
    // 2. Verify posthog-mcp is installed
    const tsDir = path.join(MCP_DIR, "typescript");
    if (!existsSync(tsDir)) {
      log(`ERROR: posthog-mcp not found at ${MCP_DIR}`);
      log("Run the setup script first: scripts/setup-posthog.ps1");
      process.exit(1);
    }

    // 3. Start wrangler dev in background
    log("Starting wrangler proxy...");
    const wrangler = spawn("npx", ["wrangler", "dev", "--port", String(PORT)], {
      cwd: tsDir,
      env: { ...process.env, POSTHOG_BASE_URL: BASE_URL },
      stdio: "ignore",
      detached: true,
      shell: true,
    });
    wrangler.unref();

    // 4. Wait for proxy
    try {
      await waitForPort(PORT, 30);
      log("Proxy ready.");
    } catch (e) {
      log(`ERROR: ${e.message}`);
      process.exit(1);
    }
  }

  // 5. Run mcp-remote (bridges SSE to stdio for Claude Code)
  const remote = spawn(
    "npx",
    ["-y", "mcp-remote@latest", `http://localhost:${PORT}/mcp`, "--header", `Authorization:Bearer ${API_KEY}`],
    { stdio: ["pipe", "pipe", "inherit"], shell: true }
  );

  process.stdin.pipe(remote.stdin);
  remote.stdout.pipe(process.stdout);

  remote.on("exit", (code) => process.exit(code || 0));
  process.on("SIGTERM", () => remote.kill());
  process.on("SIGINT", () => remote.kill());
}

main().catch((e) => { log(`FATAL: ${e.message}`); process.exit(1); });
