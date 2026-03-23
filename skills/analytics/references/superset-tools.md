# Superset MCP — Справочник инструментов

URL: `superset.dev.larixon.com`

## Дашборды (4 инструмента)

### superset_dashboard_list
Список всех дашбордов с фильтрацией, сортировкой и пагинацией.
- `columns`, `keys`, `order_column`, `order_direction`, `page`, `select_columns`, `filters` — все опциональные

### superset_dashboard_get_by_id
Детали конкретного дашборда.
- `dashboard_id` (int, обязательный)

### superset_dashboard_update
Обновление дашборда (метаданные, json_metadata, position_json).
- `dashboard_id` (int, обязательный)
- `payload` (DashboardUpdatePayload, обязательный)
- Рекомендация: сначала вызвать `get_by_id` чтобы понять формат

### superset_dashboard_patch_position
Частичное обновление layout дашборда через JSON Patch.
- `dashboard_id` (int, обязательный)
- `patch` (List[JsonPatch], обязательный)

## Графики / Charts (4 инструмента)

### superset_chart_list
Список всех чартов с фильтрацией.
- Те же параметры что у dashboard_list

### superset_chart_get_by_id
Детали конкретного чарта (включая params — конфигурацию визуализации).
- `chart_id` (int, обязательный)

### superset_chart_update
Обновление параметров чарта.
- `chart_id` (int, обязательный)
- `payload` (ChartUpdatePayload, обязательный)
- Рекомендация: сначала вызвать `get_by_id`

### superset_chart_delete
Удаление чарта.
- `chart_id` (int, обязательный)

## Базы данных (3 инструмента)

### superset_database_list
Список всех подключённых баз данных.

### superset_database_get_by_id
Детали конкретной базы (connection string, параметры).
- `database_id` (int, обязательный)

### superset_database_validate_sql
Проверка SQL-запроса на валидность без выполнения.
- `database_id` (int, обязательный)
- `sql` (str, обязательный)
- `schema` (str, опциональный)

## Датасеты (7 инструментов)

### superset_dataset_list
Список всех датасетов с фильтрацией.

### superset_dataset_get_by_id
Структура датасета: колонки, метрики, SQL (если виртуальный).
- `dataset_id` (int, обязательный)

### superset_dataset_create
Создание нового датасета.
- `table_name`, `database_id` — обязательные
- `sql` — для виртуальных датасетов (основанных на SQL-запросе)

### superset_dataset_update
Обновление существующего датасета.
- `dataset_id` (int, обязательный)
- `payload` (DatasetUpdatePayload)

### superset_dataset_sql_search_replace
Поиск и замена в SQL виртуального датасета. Валидирует новый SQL перед сохранением.
- `dataset_id`, `search`, `replace` — все обязательные

### superset_dataset_delete_column
Удаление колонки из датасета.
- `dataset_id`, `column_id` — обязательные

### superset_dataset_delete_metric
Удаление метрики из датасета.
- `dataset_id`, `metric_id` — обязательные

## SQL Lab (1 инструмент)

### superset_sqllab_execute_query
Выполнение произвольного SQL-запроса.
- `database_id` (int, обязательный) — к какой базе обращаться
- `sql` (str, обязательный) — SQL-запрос
- `db_schema` (str, опциональный) — схема базы
- `query_limit` (int, по умолчанию 100) — лимит строк

Это самый мощный инструмент — позволяет выполнить **любой** SQL к любой подключённой базе.

## Типичные сценарии

1. **Разведка**: `database_list` → `dataset_list` → `dataset_get_by_id` (посмотреть колонки)
2. **Простой запрос**: `sqllab_execute_query` с нужным SQL
3. **Управление**: `chart_list` → `chart_update` / `dashboard_update`
