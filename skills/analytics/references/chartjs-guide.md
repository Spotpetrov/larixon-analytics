# Chart.js — Генерация интерактивных графиков

## Общий принцип

Claude создаёт HTML-файл с Chart.js, сохраняет его и предлагает открыть в браузере. Графики интерактивные: hover показывает значения, можно масштабировать.

## Шаблон HTML

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>{{TITLE}}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
    .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 18px; color: #1a1a2e; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
    canvas { width: 100% !important; }
  </style>
</head>
<body>
  <div class="container">
    <h1>{{TITLE}}</h1>
    <div class="subtitle">{{SUBTITLE}} · Источник: {{SOURCE}}</div>
    <canvas id="chart"></canvas>
  </div>
  <script>
    new Chart(document.getElementById('chart'), {{CHART_CONFIG}});
  </script>
</body>
</html>
```

## Когда предлагать график

**Всегда предлагай**, если в ответе:
- Таблица с 3+ строками данных
- Временной ряд (даты + значения)
- Сравнение категорий
- Распределение или доли

Если данные — одно число или короткий список (1-2 строки), график не нужен.

## Типы графиков

### line — линейный
Для: временных рядов, трендов, динамики.
```javascript
{
  type: 'line',
  data: {
    labels: ['01.03', '02.03', '03.03', '04.03'],
    datasets: [{
      label: 'Пользователи',
      data: [120, 145, 132, 168],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.3
    }]
  },
  options: { responsive: true, plugins: { legend: { display: true } } }
}
```

### bar — столбчатый
Для: сравнения категорий, рейтингов, топ-N.
```javascript
{
  type: 'bar',
  data: {
    labels: ['Organic', 'Direct', 'Referral', 'Social'],
    datasets: [{
      label: 'Пользователи',
      data: [3200, 1800, 950, 420],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    }]
  },
  options: { responsive: true, indexAxis: 'x' }
}
```

### pie / doughnut — круговой
Для: долей от целого, распределения.
```javascript
{
  type: 'doughnut',
  data: {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [{
      data: [58, 35, 7],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
    }]
  },
  options: { responsive: true }
}
```

### radar — лепестковый
Для: сравнения нескольких метрик по категориям.

### scatter — точечный
Для: корреляций, зависимостей между двумя величинами.

## Цветовая палитра

Основные цвета для графиков:
```
#3b82f6  — синий (primary)
#10b981  — зелёный
#f59e0b  — жёлтый
#ef4444  — красный
#8b5cf6  — фиолетовый
#06b6d4  — бирюзовый
#f97316  — оранжевый
#ec4899  — розовый
```

## Правила

1. Заголовок графика — краткий, описательный
2. Подзаголовок — период и источник данных
3. Подписи осей — только если неочевидно
4. Легенда — только если > 1 dataset
5. Файл сохранять как `chart-{описание}.html` в текущей директории
6. После создания предложить: *«График сохранён в `chart-xxx.html`. Открыть в браузере?»*
