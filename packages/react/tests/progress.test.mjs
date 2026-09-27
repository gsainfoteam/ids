import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { Progress } = await import('../dist/index.js');

const html = (node) => new JSDOM(renderToString(node)).window.document;
const bar = (doc) => doc.querySelector('[role="progressbar"]');

test('linear: the track is the progressbar and the Label names it', () => {
  const doc = html(
    h(Progress, { value: 65 }, h(Progress.Label, null, 'Uploading'), h(Progress.Value)),
  );
  const progressbar = bar(doc);
  assert.ok(progressbar.hasAttribute('data-progress-track'));
  assert.equal(progressbar.getAttribute('aria-valuemin'), '0');
  assert.equal(progressbar.getAttribute('aria-valuemax'), '100');
  assert.equal(progressbar.getAttribute('aria-valuenow'), '65');
  assert.equal(progressbar.getAttribute('aria-valuetext'), '65%');
  const label = doc.getElementById(progressbar.getAttribute('aria-labelledby'));
  assert.equal(label.textContent, 'Uploading');
  const value = doc.querySelector('[data-progress-value]');
  assert.equal(value.textContent, '65%');
  assert.equal(value.getAttribute('aria-hidden'), 'true');
  const indicator = doc.querySelector('[data-progress-indicator]');
  assert.match(indicator.getAttribute('style'), /--progress-ratio:\s*0\.65/);
});

test('aria-label wins over the Label, and id goes to the progressbar', () => {
  const doc = html(
    h(Progress, { value: 1, 'aria-label': 'Named', id: 'p' }, h(Progress.Label, null, 'Label')),
  );
  assert.equal(bar(doc).getAttribute('aria-label'), 'Named');
  assert.equal(bar(doc).hasAttribute('aria-labelledby'), false);
  assert.equal(bar(doc).id, 'p');
});

test('out-of-range values are clamped instead of thrown, percent rounds down', () => {
  const over = html(h(Progress, { value: 120, 'aria-label': 'x' }, h(Progress.Value)));
  assert.equal(bar(over).getAttribute('aria-valuenow'), '100');
  assert.ok(over.querySelector('[data-progress]').hasAttribute('data-complete'));
  const under = html(h(Progress, { value: -3, 'aria-label': 'x' }));
  assert.equal(bar(under).getAttribute('aria-valuenow'), '0');
  const almost = html(h(Progress, { value: 99.6, 'aria-label': 'x' }, h(Progress.Value)));
  assert.equal(bar(almost).getAttribute('aria-valuetext'), '99%');
  assert.equal(almost.querySelector('[data-progress]').hasAttribute('data-complete'), false);
});

test('no value, NaN, a bad max or indeterminate draw without a value', () => {
  for (const props of [
    {},
    { value: NaN },
    { value: 3, max: 0 },
    { value: 3, indeterminate: true },
  ]) {
    const doc = html(h(Progress, { 'aria-label': 'x', ...props }, h(Progress.Value)));
    assert.equal(bar(doc).hasAttribute('aria-valuenow'), false);
    assert.equal(bar(doc).hasAttribute('aria-valuetext'), false);
    assert.ok(doc.querySelector('[data-progress]').hasAttribute('data-indeterminate'));
    assert.equal(doc.querySelector('[data-progress-value]').textContent, '');
    assert.match(
      doc.querySelector('[data-progress-indicator]').className,
      /animate-progress-slide/,
    );
  }
});

test('getValueLabel feeds both aria-valuetext and the visible value', () => {
  const doc = html(
    h(
      Progress,
      { value: 3, max: 8, getValueLabel: (value, max) => `${value} of ${max} files` },
      h(Progress.Label, null, 'Sync'),
      h(Progress.Value),
    ),
  );
  assert.equal(bar(doc).getAttribute('aria-valuetext'), '3 of 8 files');
  assert.equal(doc.querySelector('[data-progress-value]').textContent, '3 of 8 files');
});

test('children before a Track sit above the bar and after it below', () => {
  const doc = html(
    h(
      Progress,
      { value: 30 },
      h(Progress.Label, null, 'Profile'),
      h(Progress.Track, { className: 'h-3' }),
      h(Progress.Value, null, (state) => `${state.value}/${state.max}`),
    ),
  );
  const root = doc.querySelector('[data-progress]');
  const [header, track, footer] = [...root.children];
  assert.equal(header.textContent, 'Profile');
  assert.ok(track.hasAttribute('data-progress-track'));
  assert.match(track.className, /h-3/);
  assert.equal(footer.textContent, '30/100');
});

test('a top-level Indicator goes inside the default track', () => {
  const doc = html(
    h(Progress, { value: 50, 'aria-label': 'x' }, h(Progress.Indicator, { className: 'custom' })),
  );
  const indicator = doc.querySelector('[data-progress-indicator]');
  assert.ok(indicator.parentElement.hasAttribute('data-progress-track'));
  assert.match(indicator.className, /custom/);
  assert.equal(doc.querySelectorAll('[data-progress-indicator]').length, 1);
});

test('circular: an svg progressbar, center content inside, the Label beside it', () => {
  const doc = html(
    h(
      Progress,
      { shape: 'circular', value: 40 },
      h('svg', { id: 'icon' }),
      h(Progress.Label, null, 'Downloading'),
      h(Progress.Track, { className: 'text-red-100' }),
    ),
  );
  const progressbar = bar(doc);
  assert.equal(progressbar.querySelectorAll('circle').length, 2);
  assert.match(
    progressbar.querySelector('[data-progress-track]').getAttribute('class'),
    /text-red-100/,
  );
  assert.ok(progressbar.querySelector('#icon'), 'other children render in the center');
  const label = doc.querySelector('[data-progress-label]');
  assert.equal(progressbar.contains(label), false);
  assert.equal(progressbar.getAttribute('aria-labelledby'), label.id);
  const arc = progressbar.querySelector('[data-progress-indicator]');
  const dash = Number(arc.getAttribute('stroke-dasharray'));
  assert.ok(Math.abs(Number(arc.getAttribute('stroke-dashoffset')) - dash * 0.6) < 0.001);
});

test('className and style can read the state', () => {
  const seen = [];
  const doc = html(
    h(Progress, {
      value: 100,
      'aria-label': 'x',
      className: (state) => (state.complete ? 'done' : 'busy'),
      style: (state) => {
        seen.push(state);
        return { opacity: state.complete ? 0.5 : 1 };
      },
    }),
  );
  const root = doc.querySelector('[data-progress]');
  assert.match(root.className, /done/);
  assert.equal(root.style.opacity, '0.5');
  assert.equal(seen[0].percent, 100);
  assert.equal(seen[0].valueLabel, '100%');
});

test('asChild parts render the given element', () => {
  const doc = html(
    h(
      Progress,
      { value: 10 },
      h(Progress.Label, { asChild: true }, h('h3', null, 'Title')),
      h(Progress.Indicator, { asChild: true }, h('span', { className: 'gradient' })),
    ),
  );
  const heading = doc.querySelector('h3');
  assert.equal(bar(doc).getAttribute('aria-labelledby'), heading.id);
  assert.ok(doc.querySelector('span.gradient[data-progress-indicator]'));
});
