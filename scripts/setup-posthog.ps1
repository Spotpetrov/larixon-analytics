# Одноразовая установка PostHog MCP прокси
# Запусти этот скрипт ОДИН раз после установки плагина

$mcpDir = Join-Path $env:USERPROFILE "posthog-mcp"

if (Test-Path (Join-Path $mcpDir "typescript\package.json")) {
    Write-Host "posthog-mcp уже установлен в $mcpDir" -ForegroundColor Green
    exit 0
}

Write-Host "Клонирую posthog-mcp..." -ForegroundColor Cyan
git clone --depth 1 https://github.com/PostHog/posthog-mcp.git $mcpDir
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка клонирования. Проверь доступ к github.com" -ForegroundColor Red
    exit 1
}

Write-Host "Устанавливаю зависимости (1-2 минуты)..." -ForegroundColor Cyan
Set-Location (Join-Path $mcpDir "typescript")
npx -y pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка установки зависимостей" -ForegroundColor Red
    exit 1
}

# Создаём .dev.vars для Cloudflare Workers env (self-hosted PostHog URL)
$devVarsPath = Join-Path $mcpDir "typescript\.dev.vars"
Set-Content -Path $devVarsPath -Value "POSTHOG_BASE_URL=https://posthog.larixon.com" -Encoding UTF8

Write-Host ""
Write-Host "Готово! PostHog MCP прокси установлен." -ForegroundColor Green
Write-Host "Перезапусти Claude Code — прокси запустится автоматически." -ForegroundColor Green
