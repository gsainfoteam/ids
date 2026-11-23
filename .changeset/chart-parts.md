---
'@gsainfoteam/ids-react': major
---

Chart drops `tooltip`, `legend`, `ratio` and `locale`, and `Chart.Tooltip` drops `hideLabel`. Chart no longer adds a tooltip or a legend by itself: place `Chart.Tooltip` and `Chart.Legend` inside the Recharts chart to draw them. The graph box is no longer an AspectRatio: it is 16:9 when the parent gives no height, and fills what the caption leaves when the parent gives one (`<div className="h-72">`, an `<AspectRatio>`). Tooltip and table numbers follow the IdsProvider `locale`, then `ko-KR`. The tooltip draws its label row only when Recharts passes a label (not for a Pie), and calls `labelFormatter` only then.

```tsx
<div className="h-72">
  <Chart config={config}>
    <Chart.Title>주간 방문</Chart.Title>
    <BarChart data={rows}>
      <XAxis dataKey="day" />
      <Bar dataKey="web" />
      <Chart.Tooltip />
      <Chart.Legend />
    </BarChart>
  </Chart>
</div>
```
