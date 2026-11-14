import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, IdsProvider } from '../src';
import { Chart } from '../src/chart';

const ROWS = [
  { day: '월', web: 1240, app: 860 },
  { day: '화', web: 1380, app: 920 },
  { day: '수', web: 1120, app: 1040 },
];

const CONFIG = { web: { label: '웹' }, app: { label: '앱' } } satisfies Chart.Config;

const visits = (props: Partial<Chart.Props> = {}, inside: ReactNode = null) => (
  <IdsProvider>
    <div style={{ width: 400 }}>
      <Chart config={CONFIG} {...props}>
        <Chart.Title>방문</Chart.Title>
        <BarChart data={ROWS}>
          <XAxis dataKey="day" />
          <Bar dataKey="web" />
          <Bar dataKey="app" />
          {inside}
        </BarChart>
      </Chart>
    </div>
  </IdsProvider>
);

const pointAt = (element: Element, x: number, y: number) =>
  userEvent.hover(element, { position: { x, y } });

test('the server HTML holds the caption and an empty box of the ratio, with no svg', () => {
  const html = new DOMParser().parseFromString(renderToString(visits({ ratio: 2 })), 'text/html');
  const figure = html.querySelector<HTMLElement>('figure[data-chart]')!;
  const frame = figure.querySelector<HTMLElement>('[data-chart-frame]')!;

  expect(figure.querySelector('figcaption')?.textContent).toBe('방문');
  expect(frame.getAttribute('style')).toMatch(/aspect-ratio:\s*2/);
  expect(frame.querySelector('svg')).toBeNull();
  expect(figure.style.getPropertyValue('--chart-web')).toBe('var(--ids-color-chart-1)');
  expect(figure.style.getPropertyValue('--chart-app')).toBe('var(--ids-color-chart-2)');
});

test('the graph fills the measured box and takes the title as its name', async () => {
  const screen = await render(visits());
  const graph = screen.getByRole('img', { name: '방문' });

  await expect.element(graph).toBeInTheDocument();
  const frame = document.querySelector('[data-chart-frame]')!.getBoundingClientRect();
  expect(graph.element().getAttribute('width')).toBe(String(Math.floor(frame.width)));
  expect(graph.element().getAttribute('height')).toBe(String(Math.floor(frame.height)));
  expect(Math.round(frame.width / frame.height)).toBe(2);
});

test('the graph follows the width of its parent', async () => {
  const screen = await render(visits());
  const graph = screen.getByRole('img', { name: '방문' });
  await expect.element(graph).toHaveAttribute('width', '400');

  (document.querySelector('[data-chart]')!.parentElement as HTMLElement).style.width = '240px';

  await expect.element(graph).toHaveAttribute('width', '240');
});

test('without a title the graph is named by the catalog and described by the description', async () => {
  const screen = await render(
    <IdsProvider>
      <div style={{ width: 400 }}>
        <Chart config={CONFIG}>
          <Chart.Description>최근 사흘</Chart.Description>
          <BarChart data={ROWS}>
            <XAxis dataKey="day" />
            <Bar dataKey="web" />
          </BarChart>
        </Chart>
      </div>
    </IdsProvider>,
  );

  await expect
    .element(screen.getByRole('img', { name: '차트' }))
    .toHaveAccessibleDescription('최근 사흘');
});

test('series take the config colors in order, wrapping after chart-5, and an own fill wins', async () => {
  const keys = ['a', 'b', 'c', 'd', 'e', 'f'];
  const config = Object.fromEntries(keys.map((key) => [key, { label: key }]));
  await render(
    <IdsProvider>
      <div style={{ width: 400 }}>
        <Chart config={{ ...config, b: { label: 'b', color: 'danger' } }}>
          <BarChart data={[{ name: 'x', a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }]}>
            <XAxis dataKey="name" />
            <Bar dataKey="a" />
            <Bar dataKey="b" fill="var(--ids-color-muted)" />
          </BarChart>
        </Chart>
      </div>
    </IdsProvider>,
  );
  const figure = document.querySelector<HTMLElement>('[data-chart]')!;

  expect(figure.style.getPropertyValue('--chart-b')).toBe('var(--ids-color-danger)');
  expect(figure.style.getPropertyValue('--chart-e')).toBe('var(--ids-color-chart-5)');
  expect(figure.style.getPropertyValue('--chart-f')).toBe('var(--ids-color-chart-1)');
  await expect
    .poll(() =>
      [...document.querySelectorAll('.recharts-bar-rectangle path')].map((bar) =>
        bar.getAttribute('fill'),
      ),
    )
    .toEqual(['var(--chart-a)', 'var(--ids-color-muted)']);
});

test('lines are stroked with their series variable', async () => {
  await render(
    <IdsProvider>
      <div style={{ width: 400 }}>
        <Chart config={CONFIG}>
          <LineChart data={ROWS}>
            <XAxis dataKey="day" />
            <Line dataKey="web" />
          </LineChart>
        </Chart>
      </div>
    </IdsProvider>,
  );

  await expect
    .poll(() => document.querySelector('.recharts-line-curve')?.getAttribute('stroke'))
    .toBe('var(--chart-web)');
});

test('areas fade from their series color to transparent, and an own fill wins', async () => {
  await render(
    <IdsProvider>
      <div style={{ width: 400 }}>
        <Chart config={CONFIG}>
          <AreaChart data={ROWS}>
            <XAxis dataKey="day" />
            <Area dataKey="web" />
            <Area dataKey="app" fill="var(--ids-color-muted)" />
          </AreaChart>
        </Chart>
      </div>
    </IdsProvider>,
  );

  await expect
    .poll(() =>
      [...document.querySelectorAll('.recharts-area-area')].map((area) =>
        area.getAttribute('fill'),
      ),
    )
    .toEqual([expect.stringMatching(/^url\(#.+-fade-web\)$/), 'var(--ids-color-muted)']);
  const fadeId = document.querySelector('.recharts-area-area')!.getAttribute('fill')!.slice(5, -1);
  const stops = [...document.getElementById(fadeId)!.querySelectorAll('stop')].map((stop) =>
    getComputedStyle(stop),
  );
  expect(stops.map((stop) => stop.stopOpacity)).toEqual(['0.4', '0']);
  expect(stops[0]!.stopColor).not.toBe('rgb(0, 0, 0)');
  expect(document.querySelectorAll('linearGradient')).toHaveLength(1);
});

test('the default tooltip lists each series in config order with its label and value', async () => {
  const screen = await render(visits());
  const graph = screen.getByRole('img', { name: '방문' });
  await expect.element(graph).toBeInTheDocument();

  await pointAt(graph.element(), 60, 100);

  await expect.poll(() => document.querySelector('[data-chart-tooltip] p')?.textContent).toBe('월');
  const terms = [...document.querySelectorAll('[data-chart-tooltip] dt')].map(
    (term) => term.textContent,
  );
  const values = [...document.querySelectorAll('[data-chart-tooltip] dd')].map(
    (value) => value.textContent,
  );
  expect(terms).toEqual(['웹', '앱']);
  expect(values).toEqual(['1,240', '860']);
});

test('the tooltip opens in the top layer beside the point, outside a clipping parent', async () => {
  const screen = await render(
    <IdsProvider>
      <div style={{ width: 400, overflow: 'hidden' }}>
        <Chart config={CONFIG}>
          <Chart.Title>방문</Chart.Title>
          <BarChart data={ROWS}>
            <XAxis dataKey="day" />
            <Bar dataKey="web" />
          </BarChart>
        </Chart>
      </div>
    </IdsProvider>,
  );
  const graph = screen.getByRole('img', { name: '방문' });
  await expect.element(graph).toBeInTheDocument();

  await pointAt(graph.element(), 60, 100);

  await expect
    .poll(() => document.querySelector('[data-chart-tooltip]')?.matches(':popover-open'))
    .toBe(true);
  const frame = document.querySelector('[data-chart-frame]')!.getBoundingClientRect();
  const box = document.querySelector('[data-chart-tooltip]')!.getBoundingClientRect();
  expect(box.left).toBeGreaterThan(frame.left);
  expect(box.top).toBeGreaterThanOrEqual(frame.top);
  expect(box.width).toBeGreaterThan(0);

  await pointAt(graph.element(), 300, 100);
  await expect
    .poll(() => document.querySelector('[data-chart-tooltip]')?.hasAttribute('data-gliding'))
    .toBe(true);
});

const tooltipLabel = () => document.querySelector('[data-chart-tooltip] p')?.textContent;

test('keys move the tooltip while the pointer rests on another datum, and moving the pointer takes it back', async () => {
  const screen = await render(
    <IdsProvider>
      <Button>앞</Button>
      {visits()}
    </IdsProvider>,
  );
  const graph = screen.getByRole('img', { name: '방문' });
  await expect.element(graph).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '앞' }));
  await pointAt(graph.element(), 300, 100);
  await expect.poll(tooltipLabel).toBe('수');

  await userEvent.keyboard('{Tab}');
  await expect.element(graph).toHaveFocus();
  await expect.poll(tooltipLabel).toBe('월');
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(tooltipLabel).toBe('화');

  await pointAt(graph.element(), 300, 110);
  await expect.poll(tooltipLabel).toBe('수');
  await userEvent.keyboard('{ArrowLeft}');
  await expect.poll(tooltipLabel).toBe('월');
});

test('focus that follows a click keeps the tooltip on the datum under the pointer', async () => {
  const screen = await render(
    <IdsProvider>
      <Button>앞</Button>
      {visits()}
    </IdsProvider>,
  );
  const graph = screen.getByRole('img', { name: '방문' });
  await expect.element(graph).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '앞' }));
  await pointAt(graph.element(), 300, 100);
  await expect.poll(tooltipLabel).toBe('수');

  graph.element().focus();

  await expect.element(graph).toHaveFocus();
  expect(graph.element().matches(':focus-visible')).toBe(false);
  expect(tooltipLabel()).toBe('수');
});

test('a locale on Chart formats the tooltip numbers', async () => {
  const screen = await render(visits({ locale: 'de-DE' }));
  const graph = screen.getByRole('img', { name: '방문' });
  await expect.element(graph).toBeInTheDocument();

  await pointAt(graph.element(), 60, 100);

  await expect
    .poll(() => document.querySelector('[data-chart-tooltip] dd')?.textContent)
    .toBe('1.240');
});

test('tooltip and legend turn off, and an own Recharts Tooltip replaces the default', async () => {
  const off = await render(visits({ tooltip: false, legend: false }));
  const graph = off.getByRole('img', { name: '방문' });
  await expect.element(graph).toBeInTheDocument();
  await pointAt(graph.element(), 60, 100);

  expect(document.querySelector('[data-chart-legend]')).toBeNull();
  expect(document.querySelector('.recharts-tooltip-wrapper')).toBeNull();
  await off.unmount();

  const own = await render(visits({}, <Tooltip />));
  const ownGraph = own.getByRole('img', { name: '방문' });
  await expect.element(ownGraph).toBeInTheDocument();
  await pointAt(ownGraph.element(), 60, 100);

  await expect.poll(() => document.querySelector('.recharts-default-tooltip')).not.toBeNull();
  expect(document.querySelectorAll('.recharts-tooltip-wrapper')).toHaveLength(1);
  expect(document.querySelector('[data-chart-tooltip]')).toBeNull();
});

test('the hidden table adds no Tab stop: Tab goes from the graph to the next control', async () => {
  const screen = await render(
    <IdsProvider>
      <Button>앞</Button>
      <div style={{ width: 400 }}>
        <Chart config={CONFIG}>
          <Chart.Title>방문</Chart.Title>
          <BarChart data={ROWS}>
            <XAxis dataKey="day" />
            <Bar dataKey="web" />
          </BarChart>
        </Chart>
      </div>
      <Button>뒤</Button>
    </IdsProvider>,
  );
  await expect.element(screen.getByRole('img', { name: '방문' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '앞' }));

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('img', { name: '방문' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '뒤' })).toHaveFocus();
});

test('a pie draws its table from the Pie data and names the rows by config', async () => {
  const screen = await render(
    <IdsProvider>
      <div style={{ width: 400 }}>
        <Chart config={{ chrome: { label: 'Chrome' }, safari: { label: 'Safari' } }}>
          <Chart.Title>브라우저</Chart.Title>
          <PieChart>
            <Pie
              data={[
                { browser: 'chrome', visitors: 275, fill: 'var(--chart-chrome)' },
                { browser: 'safari', visitors: 200, fill: 'var(--chart-safari)' },
              ]}
              dataKey="visitors"
              nameKey="browser"
            />
          </PieChart>
        </Chart>
      </div>
    </IdsProvider>,
  );
  const table = screen.getByRole('table', { name: '브라우저' });

  await expect.element(table.getByRole('rowheader', { name: 'Chrome' })).toBeInTheDocument();
  await expect.element(table.getByRole('cell', { name: '275' })).toBeInTheDocument();
  await expect
    .poll(() => document.querySelector('[data-chart-legend]')?.textContent)
    .toBe('ChromeSafari');
});

test('a vertical bar chart takes its rows from the category on the Y axis', async () => {
  const screen = await render(
    <IdsProvider>
      <div style={{ width: 400 }}>
        <Chart config={{ visits: { label: '방문' } }}>
          <Chart.Title>서비스</Chart.Title>
          <BarChart data={[{ service: 'Ziggle', visits: 12 }]} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="service" type="category" name="서비스 이름" />
            <Bar dataKey="visits" />
          </BarChart>
        </Chart>
      </div>
    </IdsProvider>,
  );
  const table = screen.getByRole('table', { name: '서비스' });

  await expect
    .element(table.getByRole('columnheader', { name: '서비스 이름' }))
    .toBeInTheDocument();
  await expect.element(table.getByRole('rowheader', { name: 'Ziggle' })).toBeInTheDocument();
});

test('a chart wrapped in an app component gets a development warning and keeps its size', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  function VisitsChart(props: { width?: number; height?: number }) {
    return (
      <BarChart data={ROWS} {...props}>
        <Bar dataKey="web" />
      </BarChart>
    );
  }

  const screen = await render(
    <IdsProvider>
      <div style={{ width: 400 }}>
        <Chart config={CONFIG}>
          <Chart.Title>방문</Chart.Title>
          <VisitsChart />
        </Chart>
      </div>
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('img', { name: '방문' })).toHaveAttribute('width', '400');
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Chart.Table'));
  expect(warn).toHaveBeenCalledTimes(1);
  expect(document.querySelector('table')).toBeNull();
  warn.mockRestore();
});

test('a direct Recharts chart gets no warning', async () => {
  const warn = vi.spyOn(console, 'warn');
  const screen = await render(visits());

  await expect.element(screen.getByRole('img', { name: '방문' })).toBeInTheDocument();
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test('parts outside Chart throw a clear error', () => {
  expect(() => renderToString(<Chart.Table />)).toThrow(
    '`<Chart.Table>` must be used inside `<Chart>`.',
  );
});
