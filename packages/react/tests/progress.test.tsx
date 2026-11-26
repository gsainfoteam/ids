import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Progress } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const bar = (doc: Document) => doc.querySelector<HTMLElement>('[role="progressbar"]')!;

test('linear: the track is the progressbar and the Label names it', () => {
  const doc = html(
    <Progress value={65}>
      <Progress.Label>Uploading</Progress.Label>
      <Progress.Value />
    </Progress>,
  );
  const progressbar = bar(doc);
  expect(progressbar.hasAttribute('data-progress-track')).toBe(true);
  expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
  expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
  expect(progressbar.getAttribute('aria-valuenow')).toBe('65');
  expect(progressbar.getAttribute('aria-valuetext')).toBe('65%');
  const label = doc.getElementById(progressbar.getAttribute('aria-labelledby')!);
  expect(label?.textContent).toBe('Uploading');
  const value = doc.querySelector('[data-progress-value]')!;
  expect(value.textContent).toBe('65%');
  expect(value.getAttribute('aria-hidden')).toBe('true');
  const indicator = doc.querySelector('[data-progress-indicator]')!;
  expect(indicator.getAttribute('style')).toMatch(/--progress-ratio:\s*0\.65/);
});

test('aria-label wins over the Label, and id goes to the progressbar', () => {
  const doc = html(
    <Progress value={1} aria-label="Named" id="p">
      <Progress.Label>Label</Progress.Label>
    </Progress>,
  );
  expect(bar(doc).getAttribute('aria-label')).toBe('Named');
  expect(bar(doc).hasAttribute('aria-labelledby')).toBe(false);
  expect(bar(doc).id).toBe('p');
});

test('out-of-range values are clamped instead of thrown, percent rounds down', () => {
  const over = html(
    <Progress value={120} aria-label="x">
      <Progress.Value />
    </Progress>,
  );
  expect(bar(over).getAttribute('aria-valuenow')).toBe('100');
  expect(over.querySelector('[data-progress]')!.hasAttribute('data-complete')).toBe(true);
  const under = html(<Progress value={-3} aria-label="x" />);
  expect(bar(under).getAttribute('aria-valuenow')).toBe('0');
  const almost = html(
    <Progress value={99.6} aria-label="x">
      <Progress.Value />
    </Progress>,
  );
  expect(bar(almost).getAttribute('aria-valuetext')).toBe('99%');
  expect(almost.querySelector('[data-progress]')!.hasAttribute('data-complete')).toBe(false);
});

test('no value, null, NaN or a bad max draw without a value', () => {
  const cases: Progress.Props[] = [
    {},
    { value: NaN },
    { value: 3, max: 0 },
    { value: null },
  ];
  for (const props of cases) {
    const doc = html(
      <Progress aria-label="x" {...props}>
        <Progress.Value />
      </Progress>,
    );
    expect(bar(doc).hasAttribute('aria-valuenow')).toBe(false);
    expect(bar(doc).hasAttribute('aria-valuetext')).toBe(false);
    expect(doc.querySelector('[data-progress]')!.hasAttribute('data-indeterminate')).toBe(true);
    expect(doc.querySelector('[data-progress-value]')!.textContent).toBe('');
    expect(doc.querySelector('[data-progress-indicator]')!.className).toMatch(
      /animate-progress-slide/,
    );
  }
});

test('getValueLabel feeds both aria-valuetext and the visible value', () => {
  const doc = html(
    <Progress value={3} max={8} getValueLabel={(value, max) => `${value} of ${max} files`}>
      <Progress.Label>Sync</Progress.Label>
      <Progress.Value />
    </Progress>,
  );
  expect(bar(doc).getAttribute('aria-valuetext')).toBe('3 of 8 files');
  expect(doc.querySelector('[data-progress-value]')!.textContent).toBe('3 of 8 files');
});

test('children before a Track sit above the bar and after it below', () => {
  const doc = html(
    <Progress value={30}>
      <Progress.Label>Profile</Progress.Label>
      <Progress.Track className="h-3" />
      <Progress.Value>{(state) => `${state.value}/${state.max}`}</Progress.Value>
    </Progress>,
  );
  const root = doc.querySelector('[data-progress]')!;
  const [header, track, footer] = Array.from(root.children);
  expect(header!.textContent).toBe('Profile');
  expect(track!.hasAttribute('data-progress-track')).toBe(true);
  expect(track!.className).toMatch(/h-3/);
  expect(footer!.textContent).toBe('30/100');
});

test('a top-level Indicator goes inside the default track', () => {
  const doc = html(
    <Progress value={50} aria-label="x">
      <Progress.Indicator className="custom" />
    </Progress>,
  );
  const indicator = doc.querySelector('[data-progress-indicator]')!;
  expect(indicator.parentElement!.hasAttribute('data-progress-track')).toBe(true);
  expect(indicator.className).toMatch(/custom/);
  expect(doc.querySelectorAll('[data-progress-indicator]')).toHaveLength(1);
});

test('className and style can read the state', () => {
  const seen: Progress.State[] = [];
  const doc = html(
    <Progress
      value={100}
      aria-label="x"
      className={(state) => (state.complete ? 'done' : 'busy')}
      style={(state) => {
        seen.push(state);
        return { opacity: state.complete ? 0.5 : 1 };
      }}
    />,
  );
  const root = doc.querySelector<HTMLElement>('[data-progress]')!;
  expect(root.className).toMatch(/done/);
  expect(root.style.opacity).toBe('0.5');
  expect(seen[0]!.percent).toBe(100);
  expect(seen[0]!.valueLabel).toBe('100%');
});

test('asChild parts render the given element', () => {
  const doc = html(
    <Progress value={10}>
      <Progress.Label asChild>
        <h3>Title</h3>
      </Progress.Label>
      <Progress.Indicator asChild>
        <span className="gradient" />
      </Progress.Indicator>
    </Progress>,
  );
  const heading = doc.querySelector('h3')!;
  expect(bar(doc).getAttribute('aria-labelledby')).toBe(heading.id);
  expect(doc.querySelector('span.gradient[data-progress-indicator]')).not.toBeNull();
});
