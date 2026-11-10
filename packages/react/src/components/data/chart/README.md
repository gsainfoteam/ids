# Chart

Recharts 차트를 IDS 의 색, 글꼴, 툴팁, 범례로 그리는 틀입니다. 그래프는 Recharts 가 그리고, Chart 는 계열 색, 크기, 이름표, 스크린 리더용 표를 맡습니다.

- **별도 진입점.** `@gsainfoteam/ids-react/chart` 에서 가져옵니다. `recharts` 는 선택 peer 라 차트를 쓰는 앱만 설치합니다.
- **색은 토큰에서.** `config` 의 키마다 `--chart-<key>` 변수를 만들고, 막대·선·면에 `fill`/`stroke` 를 그 변수로 칠합니다. 라이트와 다크에서 같은 코드가 맞는 색을 냅니다.
- **기본이 붙습니다.** 차트 안에 Tooltip, Legend 가 없으면 IDS 의 것을 넣습니다.
- **읽을 수 있습니다.** 그래프는 `role="img"` 로 제목을 이름 삼고, 같은 데이터를 화면에 보이지 않는 표로 한 번 더 그립니다.
- **서버에서도 자리를 지킵니다.** `ratio` 로 높이를 잡고, 폭을 재기 전에는 같은 크기의 빈 칸만 그립니다.

```bash
pnpm add recharts react-is
```

```tsx
import { Chart } from '@gsainfoteam/ids-react/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const config = {
  web: { label: '웹' },
  app: { label: '앱' },
} satisfies Chart.Config;

<Chart config={config} ratio={16 / 9}>
  <Chart.Title>주간 방문</Chart.Title>
  <Chart.Description>웹과 앱으로 들어온 방문 수입니다.</Chart.Description>
  <BarChart data={rows}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" />
    <Bar dataKey="web" radius={4} />
    <Bar dataKey="app" radius={4} />
  </BarChart>
</Chart>;
```

## 구성

| 부분       | 그리는 것                                          | HTML                                  |
| ---------- | -------------------------------------------------- | ------------------------------------- |
| 루트       | `Chart`                                            | `<figure>`                            |
| 제목, 설명 | `Chart.Title`, `Chart.Description`                 | 하나의 `<figcaption>` 안              |
| 비율       | AspectRatio                                        | `<div>`                               |
| 그래프     | Recharts 차트                                      | `<svg role="img" aria-labelledby>`    |
| 툴팁       | `Chart.Tooltip`                                    | `<dl>` (계열 이름 `dt`, 값 `dd`)      |
| 범례       | `Chart.Legend`                                     | `<ul>`                                |
| 표         | `Chart.Table` (Table)                              | `<table>`                             |

- 모든 파트는 선택입니다. 제목이 없으면 그래프 이름은 `chart.label` 문구("차트")입니다.

## 계열 색

```tsx
const config = {
  income: { label: '수입', color: 'success' },   // 토큰 이름
  spending: { label: '지출', color: 'danger' },
  members: { label: '회원' },                     // 생략하면 키 순서대로 chart-1 부터
} satisfies Chart.Config;
```

- `color` 를 생략하면 config 에 적힌 순서대로 `chart-1` ~ `chart-5` 를 쓰고, 여섯 번째 키부터 다시 `chart-1` 입니다.
- `color` 는 `chart-1` ~ `chart-5`, `primary`, `accent`, `success`, `warning`, `danger`, `info`, `on-muted` 중 하나입니다.
- 계열 변수는 `--chart-<key>` 입니다. `--color-*` 는 Tailwind 테마 변수 이름공간이라 `primary` 같은 키가 겹칩니다. 키는 CSS 변수 이름에 들어가므로 영문, 숫자, `-`, `_` 로 씁니다.
- Chart 가 칠하는 것은 Chart 의 차트 바로 아래에 둔 `Bar`(`fill`), `Line`(`stroke`), `Area`·`Radar`(`stroke`, `fill`), `Scatter`(`fill`) 중 `dataKey` 가 config 에 있는 것입니다. `fill` 이나 `stroke` 를 직접 주면 그 값이 이깁니다. label 이 글자면 `name` 도 채웁니다.
- `Area` 의 면은 계열 색 40% 에서 투명으로 내려가는 그라디언트입니다. Chart 가 차트 안에 `<linearGradient>` 를 넣고 `fill` 을 `url(#…)` 로 칠합니다. `fill` 을 직접 주면 그라디언트를 넣지 않고, `fillOpacity` 는 그라디언트 위에 곱해집니다.
- 데이터 행에 `fill` 이 있으면 Recharts 가 막대를 그 값으로 칠합니다. 원을 위해 `fill` 을 넣은 행을 막대 차트에 그대로 쓰지 않습니다.
- 원(`Pie`), `RadialBar`, `Funnel` 은 행마다 색이 다르므로 데이터에 `fill: 'var(--chart-<key>)'` 를 적습니다.

```tsx
const shares = rows.map((row) => ({ ...row, fill: `var(--chart-${row.service})` }));

<Chart config={servicesConfig} ratio={1}>
  <PieChart>
    <Pie data={shares} dataKey="visits" nameKey="service" />
  </PieChart>
</Chart>;
```

### 계열 토큰

| 토큰      | 라이트       | 다크         |
| --------- | ------------ | ------------ |
| `chart-1` | blue 600     | blue 400     |
| `chart-2` | amber 600    | amber 400    |
| `chart-3` | teal 600     | teal 400     |
| `chart-4` | rose 600     | rose 400     |
| `chart-5` | violet 600   | violet 400   |

- 브랜드 색(`data-color`)을 따르지 않는 고정 팔레트입니다. 브랜드 색 계열이 필요하면 `color: 'primary'` 를 줍니다.
- 다섯 색 모두 바탕(`surface`)과 3:1 이상입니다(그래픽 대비 기준).
- 이웃한 두 색은 CIEDE2000 색차 25 이상으로 떨어져 있습니다. `tests/tokens-contrast.test.ts` 가 두 규칙을 라이트와 다크에서 확인합니다.
- 계열을 더할 때도 같은 두 규칙을 지킵니다. 둘이 같은 색 계열로 보이면 순서를 바꿔 이웃하지 않게 합니다.

## Tooltip 과 Legend

```tsx
<Chart config={config}>                              {/* 없으면 기본이 붙는다 */}
  <BarChart data={rows}>…</BarChart>
</Chart>

<Chart config={config}>
  <BarChart data={rows}>
    <Bar dataKey="web" />
    <Chart.Tooltip indicator="line" formatter={(value) => `${value}회`} />
    <Chart.Legend content={<VisitLegend />} />      {/* 통째로 바꾸기 */}
  </BarChart>
</Chart>

<Chart config={config} tooltip={false} legend={false}>…</Chart>   {/* 끄기 */}
```

- 기본은 차트 안에 `Chart.Tooltip`/`Chart.Legend` 나 Recharts `Tooltip`/`Legend` 가 없을 때만 붙습니다. Server Component 가 넘긴 차트도 같은 방법으로 찾습니다.
- Recharts `Tooltip` 을 그대로 쓰면 흰 바탕에 값을 계열 색으로 씁니다. 다크 모드에서는 대비가 모자라므로 `contentStyle` 에 `var(--ids-color-surface)`, `itemStyle` 에 `var(--ids-color-on-surface)` 를 줍니다.
- 두 파트는 Recharts `Tooltip`/`Legend` 의 속성을 그대로 받고, 더해서 `indicator`(`'dot' | 'line' | 'dashed'`)를 받습니다.
- `Chart.Tooltip` 의 `formatter(value, name, item, index, payload)` 와 `labelFormatter(label, payload)` 는 Recharts 와 같습니다. `[값, 이름]` 배열을 돌려주면 이름도 바꿉니다. `hideLabel` 은 맨 위 항목 이름을 숨깁니다.
- `Chart.Legend` 의 `formatter(label, item, index)` 는 config 의 label 을 받아 바꿉니다.
- `content` 를 주면 IDS 의 내용 대신 그것을 그립니다. `Chart.TooltipContent`, `Chart.LegendContent` 를 감싸 일부만 바꿀 수도 있습니다.
- IDS 툴팁 내용은 Card 로 그리고, 가리킨 지점 옆에 IDS 오버레이(`popover`, `useAnchored`)로 띄웁니다. top layer 에 올라가므로 `overflow: hidden` 인 Card 나 ScrollArea 안에서도 잘리지 않고, 화면 끝에서는 반대쪽으로 넘어갑니다.
- 숫자는 `locale` → IdsProvider `locale` → `ko-KR` 순으로 정한 언어로 씁니다(`1,590`).

## 표

```tsx
<Chart config={config}>
  <LineChart data={rows}>
    <XAxis dataKey="day" name="요일" />
    <Line dataKey="web" />
  </LineChart>
  <Chart.Table size="tiny" />           {/* 두면 표가 보인다 */}
</Chart>
```

- `Chart.Table` 이 없으면 같은 표를 `sr-only` 로 그립니다. 스크린 리더는 그래프의 이름을 듣고 표로 값을 읽습니다.
- 행은 차트(원이면 `Pie`)의 `data` 이고, 열은 계열의 `dataKey` 입니다. 첫 열은 축(`XAxis`, `YAxis`, `PolarAngleAxis`)의 `dataKey`, 원이면 `nameKey` 입니다.
- 첫 열 머리글은 그 축의 `name` 이고, 없으면 키 이름입니다. 계열 머리글과 첫 열의 값은 config 의 label 이 있으면 label 입니다.
- `Chart.Table` 은 Table 의 속성(`variant`, `size`, `striped` …)을 받고, 제목(`Chart.Title`)을 이름으로 씁니다.

## 크기

- 폭은 부모를 채우고 높이는 `ratio`(가로 ÷ 세로, 기본 `16 / 9`)로 정합니다. 상자는 AspectRatio 입니다.
- Chart 가 상자를 재서 차트에 `width`, `height` 를 넘깁니다. 차트에 `ResponsiveContainer` 나 `responsive` 를 두지 않습니다.
- 서버 HTML 과 첫 렌더는 같은 크기의 빈 상자입니다. 폭이 0 인 svg 를 그리지 않으므로 하이드레이션이 어긋나지 않고 레이아웃도 밀리지 않습니다.

## 속성

| 속성                       | 기본 / 동작                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `config`                   | 필수. 키마다 `{ label, color? }`                            |
| `ratio`                    | `16 / 9`                                                    |
| `tooltip` / `legend`       | `true`. 차트 안에 없을 때 기본을 붙일지                     |
| `locale`                   | IdsProvider `locale`, 없으면 `ko-KR`                        |
| `className` / `style` / 그 외 | `<figure>` 로 간다                                       |

| 파트                | 받는 것                                                        |
| ------------------- | -------------------------------------------------------------- |
| `Chart.Title`       | `div` 속성. 그래프와 표의 이름이 된다                          |
| `Chart.Description` | `p` 속성. 그래프의 설명이 된다                                 |
| `Chart.Tooltip`     | Recharts `Tooltip` 속성, `indicator`, `hideLabel`              |
| `Chart.Legend`      | Recharts `Legend` 속성, `indicator`, `formatter`               |
| `Chart.Table`       | Table 속성                                                     |

| 데이터 속성                  | 붙는 곳                    |
| ---------------------------- | -------------------------- |
| `data-chart`                 | `<figure>`                 |
| `data-chart-frame`           | 비율 상자                  |
| `data-chart-tooltip`         | 툴팁 내용                  |
| `data-chart-legend`          | 범례 `<ul>`                |
| `data-chart-indicator`       | 표시 기호. 값은 모양       |
| `data-chart-table`           | 표                         |

## 알아둘 것

- Chart 는 차트를 바로 아래 자식으로 둘 때만 안을 봅니다. 차트를 앱의 컴포넌트로 감싸면 기본 Tooltip·Legend·표와 계열 색을 넣지 못하고, 개발 모드에서 경고합니다. 그때는 감싼 컴포넌트 안에 `Chart.Tooltip`, `Chart.Legend` 를 두고 `Chart.Table` 을 Chart 바로 아래에 둡니다. 감싼 컴포넌트는 받은 `width`, `height` 를 차트에 넘겨야 합니다.
- 알아보는 차트는 `BarChart`, `LineChart`, `AreaChart`, `ComposedChart`, `PieChart`, `RadarChart`, `RadialBarChart`, `ScatterChart`, `FunnelChart` 입니다.
- 움직임 줄이기를 켠 사용자에게는 Recharts 가 애니메이션을 끕니다(`isAnimationActive` 기본값 `'auto'`).
- 그래프는 Recharts 의 키보드 탐색을 그대로 씁니다. Tab 으로 들어가 화살표 키로 항목을 옮기면 툴팁이 따라갑니다.
- 축 이름처럼 SVG 글자를 재야 하는 기능은 넣지 않았습니다. 필요해지면 Pretext 를 다시 봅니다.
