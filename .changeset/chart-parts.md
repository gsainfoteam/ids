---
'@gsainfoteam/ids-react': major
---

Chart drops `tooltip`, `legend`, `ratio` and `locale`, and `Chart.Tooltip` drops `hideLabel`. Chart no longer adds a tooltip or a legend by itself: place `Chart.Tooltip` and `Chart.Legend` inside the Recharts chart to draw them. The graph box is no longer an AspectRatio: it is 16:9 when the `<figure>` has no height, and fills what the caption leaves when Chart gets a height (`className="h-72"`, `className="aspect-square"`) or sits in an AspectRatio. Tooltip and table numbers follow the IdsProvider `locale`, then `ko-KR`. The tooltip draws its label row only when Recharts passes a label (not for a Pie), and calls `labelFormatter` only then. `data-chart-frame` stays on the graph box, which no longer carries `data-aspect-ratio`.

```tsx
<Chart config={config} className="h-72">
  <Chart.Title>주간 방문</Chart.Title>
  <BarChart data={rows}>
    <XAxis dataKey="day" />
    <Bar dataKey="web" />
    <Chart.Tooltip />
    <Chart.Legend />
  </BarChart>
</Chart>
```
