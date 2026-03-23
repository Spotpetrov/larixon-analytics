# Google Analytics 4 MCP — Справочник инструментов

Property ID: `150790824`
Сервисный аккаунт: `analytics-mcp@larixon-analytics.iam.gserviceaccount.com`

## Инструменты

### getPageViews
Просмотры страниц за указанный период.
- Возвращает: дата, количество просмотров, URL страницы

### getActiveUsers
Активные пользователи за период.
- Возвращает: количество уникальных пользователей по дням

### getEvents
Список событий GA4 (клики, скроллы, конверсии, кастомные).
- Возвращает: название события, количество срабатываний

### runReport
Произвольный отчёт по любой комбинации метрик и измерений GA4.
- Самый мощный инструмент — позволяет строить любые отчёты

## Доступные метрики

- `activeUsers` — активные пользователи
- `newUsers` — новые пользователи
- `sessions` — сессии
- `screenPageViews` — просмотры страниц
- `averageSessionDuration` — средняя длительность сессии
- `bounceRate` — показатель отказов
- `engagedSessions` — вовлечённые сессии
- `eventCount` — количество событий
- `conversions` — конверсии
- `totalRevenue` — общий доход

## Доступные измерения (dimensions)

- `date` — дата
- `country` — страна
- `city` — город
- `language` — язык
- `deviceCategory` — тип устройства (desktop/mobile/tablet)
- `browser` — браузер
- `operatingSystem` — ОС
- `pagePath` — путь страницы
- `pageTitle` — заголовок страницы
- `sessionSource` — источник (google, direct, и т.д.)
- `sessionMedium` — канал (organic, cpc, referral)
- `sessionCampaignName` — рекламная кампания
- `eventName` — название события

## Типичные сценарии

### Трафик
```
runReport: метрики [activeUsers, sessions], измерения [date], период 30d
```

### Источники
```
runReport: метрики [activeUsers], измерения [sessionSource, sessionMedium], период 30d
```

### Топ страниц
```
runReport: метрики [screenPageViews], измерения [pagePath], период 7d, сортировка по просмотрам
```

### География
```
runReport: метрики [activeUsers], измерения [country], период 30d
```

### Устройства
```
runReport: метрики [activeUsers, sessions], измерения [deviceCategory, browser], период 30d
```
