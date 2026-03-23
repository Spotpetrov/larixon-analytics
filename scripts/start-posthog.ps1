# Auto-start PostHog MCP proxy (wrangler dev -> localhost:8787 -> posthog.larixon.com)
# and connect via mcp-remote as stdio MCP server for Claude Code.

$ErrorActionPreference = "Stop"

$PosthogMcpDir = if ($env:POSTHOG_MCP_DIR) { $env:POSTHOG_MCP_DIR } else { "$env:USERPROFILE\posthog-mcp" }
$PosthogBaseUrl = if ($env:POSTHOG_BASE_URL) { $env:POSTHOG_BASE_URL } else { "https://posthog.larixon.com" }
$PosthogApiKey = $env:POSTHOG_API_KEY
$Port = 8787

if (-not $PosthogApiKey) {
    Write-Error "POSTHOG_API_KEY is required"
    exit 1
}

function Log($msg) { Write-Host "[posthog-mcp] $msg" -ForegroundColor Cyan }

# 1. Clone and install if missing
if (-not (Test-Path "$PosthogMcpDir\typescript")) {
    Log "First run: cloning posthog-mcp..."
    git clone --depth 1 https://github.com/PostHog/posthog-mcp.git $PosthogMcpDir
    Set-Location "$PosthogMcpDir\typescript"
    Log "Installing dependencies (this may take a minute)..."
    npx -y pnpm install
    npx -y pnpm approve-builds esbuild workerd 2>$null
    Log "Setup complete."
}

# 2. Start wrangler dev if not already running
$proxyRunning = $false
try {
    $null = Invoke-WebRequest -Uri "http://localhost:$Port/" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $proxyRunning = $true
} catch {}

if (-not $proxyRunning) {
    Log "Starting wrangler dev on port $Port..."
    Set-Location "$PosthogMcpDir\typescript"
    $env:POSTHOG_BASE_URL = $PosthogBaseUrl
    Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "wrangler", "dev", "--port", $Port -WindowStyle Hidden

    # Wait for port (up to 30s)
    for ($i = 0; $i -lt 30; $i++) {
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:$Port/" -TimeoutSec 1 -ErrorAction SilentlyContinue
            Log "Proxy ready."
            break
        } catch {
            Start-Sleep -Seconds 1
        }
    }
} else {
    Log "Proxy already running on port $Port."
}

# 3. Connect mcp-remote (stdio bridge)
& npx -y "mcp-remote@latest" "http://localhost:$Port/mcp" --header "Authorization:Bearer $PosthogApiKey"
