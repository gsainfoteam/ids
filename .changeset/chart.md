---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
---

Add `Chart` on the new `@gsainfoteam/ids-react/chart` entry. It wraps a Recharts chart in a
`<figure>`: `config` names each series and gives it a `--chart-<key>` color, Chart sizes the chart
to an AspectRatio box (`ratio`, `16 / 9` by default) and paints `Bar`, `Line`, `Area`, `Radar` and
`Scatter` with their series color. Without a Tooltip or Legend in the chart it adds IDS ones
(`<dl>` and `<ul>`, `indicator` dot, line or dashed); `tooltip={false}` and `legend={false}` turn
them off. The graph is `role="img"` named by `Chart.Title`, and the same data is drawn as a screen
reader table, or as a visible one with `Chart.Table`. `recharts` is an optional peer, so apps
without charts do not install it.

Add the series colors `chart-1` to `chart-5` (`--ids-color-chart-1`, `bg-chart-1`): blue, amber,
teal, rose and violet, step 600 in light and 400 in dark. Each reaches 3:1 on `surface` and
neighbours stay apart by a CIEDE2000 difference of at least 25.
