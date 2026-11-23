import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CircularProgress } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const bar = (doc: Document) => doc.querySelector<HTMLElement>('[role="progressbar"]')!;

test('an svg progressbar, center content inside, the Label beside it', () => {
  const doc = html(
    <CircularProgress value={40}>
      <svg id="icon" />
      <CircularProgress.Label>Downloading</CircularProgress.Label>
      <CircularProgress.Track className="text-red-100" />
    </CircularProgress>,
  );
  const progressbar = bar(doc);
  expect(progressbar.querySelectorAll('circle')).toHaveLength(2);
  expect(
    progressbar.querySelector('[data-circular-progress-track]')!.getAttribute('class'),
  ).toMatch(/text-red-100/);
  expect(progressbar.querySelector('#icon'), 'other children render in the center').not.toBeNull();
  const label = doc.querySelector('[data-circular-progress-label]')!;
  expect(progressbar.contains(label)).toBe(false);
  expect(progressbar.getAttribute('aria-labelledby')).toBe(label.id);
  expect(progressbar.getAttribute('aria-valuenow')).toBe('40');
  expect(progressbar.getAttribute('aria-valuetext')).toBe('40%');
  const arc = progressbar.querySelector('[data-circular-progress-indicator]')!;
  const dash = Number(arc.getAttribute('stroke-dasharray'));
  expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(dash * 0.6, 3);
});

test('the Value sits in the center and is hidden from screen readers', () => {
  const doc = html(
    <CircularProgress value={3} max={8} getValueLabel={(value, max) => `${value}/${max}`}>
      <CircularProgress.Value />
    </CircularProgress>,
  );
  const value = bar(doc).querySelector('[data-circular-progress-value]')!;
  expect(value.textContent).toBe('3/8');
  expect(value.getAttribute('aria-hidden')).toBe('true');
  expect(bar(doc).getAttribute('aria-valuetext')).toBe('3/8');
});

test('without a value it spins a quarter arc and drops aria-valuenow', () => {
  const doc = html(<CircularProgress aria-label="Waiting" />);
  const root = doc.querySelector('[data-circular-progress]')!;
  expect(root.hasAttribute('data-indeterminate')).toBe(true);
  expect(bar(doc).hasAttribute('aria-valuenow')).toBe(false);
  expect(bar(doc).querySelector('svg')!.getAttribute('class')).toMatch(/animate-spin/);
  const arc = bar(doc).querySelector('[data-circular-progress-indicator]')!;
  const dash = Number(arc.getAttribute('stroke-dasharray'));
  expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(dash * 0.75, 3);
});

test('a clamped full value marks the root complete', () => {
  const doc = html(<CircularProgress value={120} aria-label="Done" colorScheme="success" />);
  const root = doc.querySelector('[data-circular-progress]')!;
  expect(root.hasAttribute('data-complete')).toBe(true);
  expect(root.className).toMatch(/scheme-success/);
  expect(bar(doc).getAttribute('aria-valuenow')).toBe('100');
});

test('aria-label wins over the Label, and id goes to the progressbar', () => {
  const doc = html(
    <CircularProgress value={1} aria-label="Named" id="p">
      <CircularProgress.Label>Label</CircularProgress.Label>
    </CircularProgress>,
  );
  expect(bar(doc).getAttribute('aria-label')).toBe('Named');
  expect(bar(doc).hasAttribute('aria-labelledby')).toBe(false);
  expect(bar(doc).id).toBe('p');
});

test('className and the parts read the state', () => {
  const doc = html(
    <CircularProgress
      value={100}
      aria-label="x"
      className={(state) => (state.complete ? 'done' : 'busy')}
    >
      <CircularProgress.Indicator className={(state) => `at-${state.percent}`} />
    </CircularProgress>,
  );
  expect(doc.querySelector('[data-circular-progress]')!.className).toMatch(/done/);
  expect(doc.querySelector('[data-circular-progress-indicator]')!.getAttribute('class')).toMatch(
    /at-100/,
  );
});

test('its parts carry their public names', () => {
  expect(CircularProgress.Label.displayName).toBe('CircularProgress.Label');
  expect(CircularProgress.Value.displayName).toBe('CircularProgress.Value');
  expect(CircularProgress.Track.displayName).toBe('CircularProgress.Track');
  expect(CircularProgress.Indicator.displayName).toBe('CircularProgress.Indicator');
});
