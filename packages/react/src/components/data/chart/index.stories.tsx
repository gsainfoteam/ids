import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { expect, waitFor, type userEvent as storyUserEvent } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Chart } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const VISITS = [
  { day: '월', web: 1240, app: 860 },
  { day: '화', web: 1380, app: 920 },
  { day: '수', web: 1120, app: 1040 },
  { day: '목', web: 1460, app: 980 },
  { day: '금', web: 1590, app: 1210 },
  { day: '토', web: 820, app: 1330 },
  { day: '일', web: 760, app: 1270 },
];

const VISITS_CONFIG = {
  web: { label: '웹' },
  app: { label: '앱' },
} satisfies Chart.Config;

const SERVICES = [
  { service: 'ziggle', label: 'Ziggle', visits: 4820 },
  { service: 'gistory', label: 'GIStory', visits: 3110 },
  { service: 'shuttle', label: '셔틀', visits: 2640 },
  { service: 'cafeteria', label: '학식', visits: 2290 },
  { service: 'carpool', label: '카풀', visits: 940 },
];

const SERVICES_CONFIG = {
  ziggle: { label: 'Ziggle' },
  gistory: { label: 'GIStory' },
  shuttle: { label: '셔틀' },
  cafeteria: { label: '학식' },
  carpool: { label: '카풀' },
} satisfies Chart.Config;

const SERVICE_TOTALS = [
  { week: '이번 주', ...Object.fromEntries(SERVICES.map((row) => [row.service, row.visits])) },
];

const SERVICE_VISITS_CONFIG = { visits: { label: '방문' } } satisfies Chart.Config;

const SHARES = SERVICES.map((row) => ({ ...row, fill: `var(--chart-${row.service})` }));

const SURVEY = [
  { topic: '맛', score: 4.1 },
  { topic: '가격', score: 3.2 },
  { topic: '양', score: 3.8 },
  { topic: '대기', score: 2.6 },
  { topic: '위생', score: 4.4 },
];

const SURVEY_CONFIG = { score: { label: '평균 점수', color: 'chart-3' } } satisfies Chart.Config;

const pointAtTheMiddle = (user: ReturnType<typeof storyUserEvent.setup>, target: Element) => {
  const box = target.getBoundingClientRect();
  return user.pointer({
    target,
    coords: { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 },
  });
};

const tooltipText = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-chart-tooltip]')?.textContent ?? '';

const meta = {
  title: 'Data/Chart',
  component: Chart,
  tags: ['autodocs'],
  argTypes: {
    ratio: { control: { type: 'number', min: 0.5, step: 0.1 } },
    tooltip: { control: 'boolean' },
    legend: { control: 'boolean' },
  },
  args: { config: VISITS_CONFIG, ratio: 16 / 9, tooltip: true, legend: true },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-full max-w-xl">
      <Chart {...args}>
        <Chart.Title>주간 방문</Chart.Title>
        <Chart.Description>웹과 앱으로 들어온 방문 수입니다.</Chart.Description>
        <BarChart data={VISITS}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <Bar dataKey="web" radius={4} />
          <Bar dataKey="app" radius={4} />
        </BarChart>
      </Chart>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Types"
        description="막대, 선, 면, 원, 방사형 모두 같은 config 로 색과 이름을 받습니다."
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Chart config={VISITS_CONFIG} className="w-80">
            <Chart.Title>Bar</Chart.Title>
            <BarChart data={VISITS}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <Bar dataKey="web" radius={4} />
              <Bar dataKey="app" radius={4} />
            </BarChart>
          </Chart>
          <Chart config={VISITS_CONFIG} className="w-80">
            <Chart.Title>Line</Chart.Title>
            <LineChart data={VISITS} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <Line dataKey="web" type="monotone" strokeWidth={2} />
              <Line dataKey="app" type="monotone" strokeWidth={2} />
            </LineChart>
          </Chart>
          <Chart config={VISITS_CONFIG} className="w-80">
            <Chart.Title>Area</Chart.Title>
            <AreaChart data={VISITS} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <Area dataKey="web" type="monotone" fillOpacity={0.3} stackId="visits" />
              <Area dataKey="app" type="monotone" fillOpacity={0.3} stackId="visits" />
            </AreaChart>
          </Chart>
          <Chart config={SERVICES_CONFIG} ratio={1} className="w-80">
            <Chart.Title>Pie</Chart.Title>
            <PieChart>
              <Pie data={SHARES} dataKey="visits" nameKey="service" innerRadius="45%" />
            </PieChart>
          </Chart>
          <Chart config={SURVEY_CONFIG} ratio={1} className="w-80" legend={false}>
            <Chart.Title>Radar</Chart.Title>
            <RadarChart data={SURVEY}>
              <PolarGrid />
              <PolarAngleAxis dataKey="topic" />
              <Radar dataKey="score" fillOpacity={0.4} />
            </RadarChart>
          </Chart>
          <Chart config={SERVICE_VISITS_CONFIG} className="w-80" legend={false}>
            <Chart.Title>Vertical bar</Chart.Title>
            <BarChart data={SERVICES} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={64} />
              <Bar dataKey="visits" radius={4} />
            </BarChart>
          </Chart>
        </div>
      </Showcase.Section>
      <Showcase.Section
        title="Series colors"
        description="color 를 생략하면 키 순서대로 chart-1 부터 chart-5 를 씁니다."
      >
        <Chart config={SERVICES_CONFIG} className="w-full max-w-xl" tooltip={false}>
          <BarChart data={SERVICE_TOTALS}>
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <Bar dataKey="ziggle" radius={4} />
            <Bar dataKey="gistory" radius={4} />
            <Bar dataKey="shuttle" radius={4} />
            <Bar dataKey="cafeteria" radius={4} />
            <Bar dataKey="carpool" radius={4} />
          </BarChart>
        </Chart>
      </Showcase.Section>
      <Showcase.Section
        title="Indicator"
        description="Tooltip 과 Legend 가 계열 앞에 두는 표시입니다."
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {(['dot', 'line', 'dashed'] as const).map((indicator) => (
            <Chart key={indicator} config={VISITS_CONFIG} className="w-72">
              <Chart.Title>{indicator}</Chart.Title>
              <BarChart data={VISITS}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <Bar dataKey="web" radius={4} />
                <Bar dataKey="app" radius={4} />
                <Chart.Tooltip indicator={indicator} defaultIndex={2} active />
                <Chart.Legend indicator={indicator} />
              </BarChart>
            </Chart>
          ))}
        </div>
      </Showcase.Section>
      <Showcase.Section
        title="Table"
        description="Chart.Table 을 두면 같은 데이터를 표로 보여 줍니다."
      >
        <Chart config={VISITS_CONFIG} className="w-full max-w-xl" ratio={2}>
          <Chart.Title>주간 방문</Chart.Title>
          <LineChart data={VISITS} margin={{ left: 12, right: 12 }}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <Line dataKey="web" strokeWidth={2} />
            <Line dataKey="app" strokeWidth={2} />
          </LineChart>
          <Chart.Table size="tiny" />
        </Chart>
      </Showcase.Section>
    </Showcase>
  ),
};

export const DefaultTooltipAndLegend: Story = {
  render: () => (
    <Chart config={VISITS_CONFIG} className="w-full max-w-xl">
      <Chart.Title>주간 방문</Chart.Title>
      <BarChart data={VISITS}>
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <Bar dataKey="web" radius={4} />
        <Bar dataKey="app" radius={4} />
      </BarChart>
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '차트 안에 Tooltip 이나 Legend 가 없으면 Chart 가 IDS 의 것을 붙입니다. 이름은 config 의 label, 색은 `--chart-<key>` 에서 옵니다. 숫자는 IdsProvider 의 locale 로 씁니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const legend = await waitFor(() => {
      const list = canvasElement.querySelector<HTMLElement>('[data-chart-legend]');
      expect(list).not.toBeNull();
      return list!;
    });
    await expect(legend.tagName).toBe('UL');
    await expect(legend).toHaveTextContent('웹앱');

    await pointAtTheMiddle(userEvent, await canvas.findByRole('img', { name: '주간 방문' }));
    await waitFor(() => expect(tooltipText(canvasElement)).toMatch(/웹[\d,]+/));
    await expect(tooltipText(canvasElement)).toMatch(/앱[\d,]+/);
    await expect(canvasElement.querySelector('[data-chart-tooltip] dl')).not.toBeNull();
  },
};

export const Keyboard: Story = {
  render: () => (
    <Chart config={VISITS_CONFIG} className="w-full max-w-xl">
      <Chart.Title>주간 방문</Chart.Title>
      <BarChart data={VISITS}>
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <Bar dataKey="web" radius={4} />
        <Bar dataKey="app" radius={4} />
      </BarChart>
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story: '그래프에 Tab 으로 들어가 화살표 키로 항목을 옮기면 툴팁이 따라갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const graph = await canvas.findByRole('img', { name: '주간 방문' });
    await userEvent.keyboard('{Tab}');
    await expect(graph).toHaveFocus();
    await waitFor(() => expect(tooltipText(canvasElement)).toMatch(/^월/));
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(tooltipText(canvasElement)).toMatch(/^화/));
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(tooltipText(canvasElement)).toMatch(/^월/));
  },
};

export const ScreenReaderTable: Story = {
  render: () => (
    <Chart config={VISITS_CONFIG} className="w-full max-w-xl">
      <Chart.Title>주간 방문</Chart.Title>
      <BarChart data={VISITS}>
        <XAxis dataKey="day" name="요일" tickLine={false} axisLine={false} />
        <Bar dataKey="web" radius={4} />
        <Bar dataKey="app" radius={4} />
      </BarChart>
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '그래프는 `role="img"` 로 제목을 이름 삼고, 같은 데이터를 화면에 보이지 않는 표로 한 번 더 그립니다. 첫 열 머리글은 축의 `name` 입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: '주간 방문' });
    await expect(table.closest('.sr-only')).not.toBeNull();
    await expect(canvas.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      '요일',
      '웹',
      '앱',
    ]);
    await expect(canvas.getByRole('rowheader', { name: '금' })).toBeInTheDocument();
    await expect(canvas.getByRole('cell', { name: '1,590' })).toBeInTheDocument();
  },
};

export const VisibleTable: Story = {
  render: () => (
    <Chart config={VISITS_CONFIG} className="w-full max-w-xl" ratio={2}>
      <Chart.Title>주간 방문</Chart.Title>
      <LineChart data={VISITS} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <Line dataKey="web" strokeWidth={2} />
        <Line dataKey="app" strokeWidth={2} />
      </LineChart>
      <Chart.Table size="tiny" />
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Chart.Table` 을 두면 기본 표 대신 그 표가 보입니다. Table 의 속성을 그대로 받습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const tables = canvas.getAllByRole('table');
    await expect(tables).toHaveLength(1);
    await expect(tables[0]!.closest('.sr-only')).toBeNull();
    await expect(tables[0]).toBeVisible();
  },
};

export const CustomTooltip: Story = {
  render: () => (
    <Chart config={VISITS_CONFIG} className="w-full max-w-xl">
      <Chart.Title>주간 방문</Chart.Title>
      <AreaChart data={VISITS} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <Area dataKey="web" type="monotone" fillOpacity={0.3} />
        <Area dataKey="app" type="monotone" fillOpacity={0.3} />
        <Chart.Tooltip
          indicator="line"
          labelFormatter={(label) => `${label}요일`}
          formatter={(value) => `${Number(value).toLocaleString('ko-KR')}회`}
        />
        <Chart.Legend indicator="line" formatter={(label) => <span>{label} 방문</span>} />
      </AreaChart>
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Chart.Tooltip 과 Chart.Legend 를 직접 두면 기본 대신 그것을 씁니다. `indicator`, `formatter` 로 바꾸고, `content` 로 통째로 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-chart-legend]')).toHaveTextContent(
        '웹 방문앱 방문',
      ),
    );
    await pointAtTheMiddle(userEvent, await canvas.findByRole('img', { name: '주간 방문' }));
    await waitFor(() => expect(tooltipText(canvasElement)).toContain('요일'));
    await expect(tooltipText(canvasElement)).toMatch(/[\d,]+회/);
    await expect(
      canvasElement.querySelectorAll('[data-chart-tooltip] [data-chart-indicator="line"]'),
    ).toHaveLength(2);
  },
};

export const RechartsTooltip: Story = {
  render: () => (
    <Chart config={VISITS_CONFIG} className="w-full max-w-xl" legend={false}>
      <Chart.Title>주간 방문</Chart.Title>
      <BarChart data={VISITS}>
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <Bar dataKey="web" radius={4} />
        <Tooltip
          cursor={false}
          contentStyle={{
            background: 'var(--ids-color-surface)',
            borderColor: 'var(--ids-color-border)',
          }}
          itemStyle={{ color: 'var(--ids-color-on-surface)' }}
        />
      </BarChart>
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Recharts 의 Tooltip 을 직접 두어도 Chart 는 기본을 더하지 않습니다. `legend={false}` 로 기본 Legend 를 끕니다. Recharts 의 기본 툴팁은 흰 바탕에 값을 계열 색으로 쓰므로, 다크 모드에서 읽히도록 `contentStyle` 과 `itemStyle` 에 IDS 색을 줍니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvasElement.querySelector('[data-chart-legend]')).toBeNull();
    await pointAtTheMiddle(userEvent, await canvas.findByRole('img', { name: '주간 방문' }));
    await waitFor(() =>
      expect(canvasElement.querySelector('.recharts-default-tooltip')).not.toBeNull(),
    );
    await expect(canvasElement.querySelector('[data-chart-tooltip]')).toBeNull();
  },
};

export const SeriesColors: Story = {
  render: () => (
    <Chart
      config={{
        income: { label: '수입', color: 'success' },
        spending: { label: '지출', color: 'danger' },
      }}
      className="w-full max-w-xl"
    >
      <Chart.Title>월별 회비</Chart.Title>
      <BarChart
        data={[
          { month: '3월', income: 420000, spending: 310000 },
          { month: '4월', income: 380000, spending: 450000 },
          { month: '5월', income: 510000, spending: 290000 },
        ]}
      >
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <Bar dataKey="income" radius={4} />
        <Bar dataKey="spending" radius={4} />
      </BarChart>
    </Chart>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`color` 에 IDS 색 토큰 이름을 주면 그 토큰을 씁니다. 계열은 `var(--chart-<key>)` 로 칠해지고, 막대·선·면에 `fill` 이나 `stroke` 를 직접 주면 그것이 이깁니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const figure = canvasElement.querySelector<HTMLElement>('[data-chart]')!;
    await expect(figure.style.getPropertyValue('--chart-income')).toBe('var(--ids-color-success)');
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-bar-rectangle path')?.getAttribute('fill'),
      ).toBe('var(--chart-income)'),
    );
  },
};
