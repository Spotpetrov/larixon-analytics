#!/usr/bin/env node
// Auto-start PostHog MCP proxy (wrangler dev → localhost:8787 → posthog.larixon.com)
// and connect via mcp-remote as stdio MCP server for Claude Code.

const { spawn, execSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");

const API_KEY = process.env.POSTHOG_API_KEY;
const BASE_URL = process.env.POSTHOG_BASE_URL || "https://posthog.larixon.com";
const MCP_DIR = process.env.POSTHOG_MCP_DIR || path.join(os.homedir(), "posthog-mcp");
const PORT = 8787;

if (!API_KEY) {
  process.stderr.write("[posthog-mcp] ERROR: POSTHOG_API_KEY is required\n");
  process.exit(1);
}

function log(msg) {
  process.stderr.write(`[posthog-mcp] ${msg}\n`);
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForPort(port, timeoutSec = 60) {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    const interval = setInterval(async () => {
      if (await isPortOpen(port)) {
        clearInterval(interval);
        resolve(true);
      }
      elapsed += 2;
      if (elapsed >= timeoutSec) {
        clearInterval(interval);
        reject(new Error(`Port ${port} did not open within ${timeoutSec}s`));
      }
    }, 2000);
  });
}

function runCommand(cmd, args, options = {}) {
  const isWin = process.platform === "win32";
  if (isWin) {
    return execSync(`${cmd} ${args.join(" ")}`, {
      stdio: "inherit",
      ...options,
      shell: true,
    });
  }
  return execSync(cmd, {
    stdio: "inherit",
    ...options,
    shell: true,
  });
}

async function main() {
  // 1. Check if proxy already running
  if (await isPortOpen(PORT)) {
    log(`Proxy already running on port ${PORT}.`);
  } else {
    // 2. Clone posthog-mcp if missing
    const tsDir = path.join(MCP_DIR, "typescript");
    if (!existsSync(tsDir)) {
      log("First run: cloning posthog-mcp...");
      execSync(`git clone --depth 1 https://github.com/PostHog/posthog-mcp.git "${MCP_DIR}"`, {
        stdio: "inherit",
        shell: true,
      });
      log("Installing dependencies (this may take 1-2 minutes)...");
      execSync("npx -y pnpm install", { cwd: tsDir, stdio: "inherit", shell: true });
      execSync("npx -y pnpm approve-builds esbuild workerd", {
        cwd: tsDir,
        stdio: "ignore",
        shell: true,
      }).toString?.();
      log("Setup complete.");
    }

    // 3. Start wrangler dev in background
    log(`Starting wrangler dev on port ${PORT}...`);
    const tsDir2 = path.join(MCP_DIR, "typescript");
    const wrangler = spawn("npx", ["wrangler", "dev", "--port", String(PORT)], {
      cwd: tsDir2,
      env: { ...process.env, POSTHOG_BASE_URL: BASE_URL },
      stdio: "ignore",
      detached: true,
      shell: true,
    });
    wrangler.unref();

    // 4. Wait for proxy to be ready
    try {
      await waitForPort(PORT, 60);
      log("Proxy ready.");
    } catch (e) {
      log(`ERROR: ${e.message}. Check ${tsDir2}`);
      process.exit(1);
    }
  }

  // 5. Run mcp-remote — pipes stdio to Claude Code
  const remote = spawn(
    "npx",
    ["-y", "mcp-remote@latest", `http://localhost:${PORT}/mcp`, "--header", `Authorization:Bearer ${API_KEY}`],
    {
      stdio: ["pipe", "pipe", "inherit"],
      shell: true,
    }
  );

  // Pipe stdin/stdout between Claude Code and mcp-remote
  process.stdin.pipe(remote.stdin);
  remote.stdout.pipe(process.stdout);

  remote.on("exit", (code) => process.exit(code || 0));
  process.on("SIGTERM", () => remote.kill());
  process.on("SIGINT", () => remote.kill());
}

main().catch((e) => {
  log(`FATAL: ${e.message}`);
  process.exit(1);
});
