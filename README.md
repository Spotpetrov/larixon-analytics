# Larixon Analytics — плагин для Claude Code

Устанавливаешь плагин → получаешь доступ к аналитике прямо в чате Claude Code:

- **Google Analytics 4** — трафик, источники, аудитория
- **PostHog** — продуктовые события, воронки, фичфлаги (posthog.larixon.com)
- **Apache Superset** — SQL-запросы к базам данных, дашборды (superset.dev.larixon.com)
- **Интерактивные графики** — Chart.js визуализация любых данных

---

## Как получить плагин

**Вариант 1 — Архив (основной)**
Получи архив `larixon-analytics.zip` от коллеги и распакуй в любое место.

**Вариант 2 — GitHub (если есть доступ)**
```bash
git clone https://github.com/Spotpetrov/larixon-analytics.git
```
Репозиторий **private**. Чтобы получить доступ:
1. Зарегистрируйся на [github.com](https://github.com) (если нет аккаунта)
2. Попроси владельца добавить тебя: GitHub → Settings → Collaborators → Add people

---

## Установка

### 1. Проверь зависимости

| Зависимость | Проверить | Установить (если нет) |
|---|---|---|
| **Node.js 18+** | `node -v` | [nodejs.org](https://nodejs.org/) → скачать LTS |
| **Python 3.10+** | `python --version` | [python.org](https://www.python.org/downloads/) → скачать |
| **uv** | `uv --version` | `pip install uv` или `winget install astral-sh.uv` |
| **Git** | `git --version` | [git-scm.com](https://git-scm.com/downloads) → скачать |

### 2. Установи плагин

Открой **PowerShell** и выполни (замени путь на свой):

```powershell
Copy-Item -Path "C:\путь\к\larixon-analytics" -Destination "$env:USERPROFILE\.claude\plugins\marketplaces\larixon-analytics" -Recurse -Force
```

### 3. Установи PostHog прокси (один раз)

PostHog self-hosted требует локальный прокси. Запусти **один раз**:

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.claude\plugins\marketplaces\larixon-analytics\scripts\setup-posthog.ps1"
```

Это клонирует `posthog-mcp` и установит зависимости (1-2 минуты). После этого прокси будет **запускаться автоматически** при старте Claude Code.

### 4. Перезапусти Claude Code

Закрой и открой заново.

### 5. Проверь подключение

Выполни `/mcp` — должны быть видны серверы:
- `google-analytics` — **running**
- `superset` — **running**
- `posthog` — **running**

### 6. Попробуй

Напиши в чат:

```
Покажи активных пользователей за последнюю неделю
```

---

## Как пользоваться

Просто пиши на обычном языке:

### Трафик (GA4)
- «Сколько пользователей было на сайте за месяц?»
- «Топ-10 страниц по просмотрам»
- «Источники трафика за 30 дней»

### Продуктовая аналитика (PostHog)
- «Покажи тренд по $pageview за неделю»
- «Какие фичфлаги активны?»
- «Построй воронку регистрации»

### Базы данных (Superset)
- «Покажи все базы данных»
- «Выполни SELECT count(*) FROM orders»
- «Топ-10 клиентов по сумме заказов»

### Графики
- «Построй график посещений за месяц»
- «Круговая диаграмма источников трафика»

Claude сам определяет какую систему использовать и предлагает построить график когда это уместно.

---

## Как заменить credentials на свои

По умолчанию плагин работает с общими credentials команды. Рекомендуем заменить на личные — так в логах будет видно кто что запрашивал.

Credentials хранятся в файле `.mcp.json` внутри установленной папки плагина:
```
%USERPROFILE%\.claude\plugins\marketplaces\larixon-analytics\.mcp.json
```

Открой этот файл в любом текстовом редакторе и замени нужные значения.

### Google Analytics 4

GA4 использует **общий сервисный аккаунт** — для доступа к Larixon GA4 **менять ничего не нужно**.

Если хочешь подключить **свой** GA4 property (не Larixon):
1. Создай сервисный аккаунт в [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Включи **Google Analytics Data API** в проекте
3. Дай сервисному аккаунту доступ к нужному GA4 property (настройки GA4 → Управление доступом → добавь email сервисного аккаунта с ролью Viewer)
4. Скачай JSON-ключ сервисного аккаунта
5. В `.mcp.json` замени:
   - `GOOGLE_CLIENT_EMAIL` → email из JSON-ключа
   - `GOOGLE_PRIVATE_KEY` → приватный ключ из JSON-ключа
   - `GA_PROPERTY_ID` → ID нового GA4 property (GA4 → Администратор → Сведения о ресурсе)

### Apache Superset

1. Обратись к Виталию за личным аккаунтом на `superset.dev.larixon.com`
2. В `.mcp.json` замени:
   - `SUPERSET_USERNAME` → твой email
   - `SUPERSET_PASSWORD` → твой пароль

### PostHog

1. Залогинься на [posthog.larixon.com](https://posthog.larixon.com)
2. Перейди в **Settings** → **Personal API Keys** ([прямая ссылка](https://posthog.larixon.com/settings/user-api-keys))
3. Нажми **Create personal API key**
   - Имя: `claude-code`
   - Скоупы: выбери все доступные
4. Скопируй ключ (начинается с `phx_`, показывается только один раз!)
5. В `.mcp.json` замени значение `POSTHOG_API_KEY` на свой ключ

---

## FAQ

### Серверы показывают «error» в `/mcp`

Проверь что установлено всё необходимое:
```
node -v          # должно быть 18+
python --version # должно быть 3.10+
uv --version     # должно быть установлено
git --version    # должен быть установлен
```
Если чего-то нет — установи (см. таблицу в разделе «Установка») и перезапусти Claude Code.

### PostHog не работает

PostHog работает через локальный прокси (wrangler dev на `localhost:8787`). Прокси запускается автоматически. Проверь:
1. Установлен ли posthog-mcp? (`ls ~/posthog-mcp/typescript/package.json`). Если нет — запусти `scripts/setup-posthog.ps1`
2. Доступен ли `posthog.larixon.com` в браузере
3. Верный ли API-ключ в `.mcp.json` (`POSTHOG_API_KEY`, начинается с `phx_`)
4. Установлен ли Node.js 18+ (`node -v`)

### Ошибка «uvx not found»

```bash
pip install uv
```
Перезапусти терминал и Claude Code.

### Ошибка «npx not found»

Установи Node.js с [nodejs.org](https://nodejs.org/). Перезапусти терминал.

### Ошибка аутентификации Superset (401)

Пароль мог измениться. Обратись к Виталию или замени credentials в `.mcp.json` (см. раздел «Как заменить credentials»).

### Графики не строятся

Попроси Claude явно: «построй график по этим данным» или «визуализируй».

### Как обновить плагин

Получи новый архив (или `git pull`) и выполни команду установки из шага 2 заново. Перезапусти Claude Code.

### Как обновить MCP серверы

Автоматически — `npx -y` и `uvx` всегда используют последнюю версию при запуске.

### Можно ли использовать в нескольких проектах?

Да. Плагин устанавливается один раз в профиль Claude Code и работает во всех проектах.

### GitHub: как дать доступ коллеге

Владелец репозитория: GitHub → [Spotpetrov/larixon-analytics](https://github.com/Spotpetrov/larixon-analytics) → Settings → Collaborators → Add people → ввести GitHub username коллеги.
