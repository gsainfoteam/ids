import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'CompositionEvent',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Calendar } = await import('../dist/index.js');
let root, host;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = undefined;
  host?.remove();
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(node));
}
async function type(node, value) {
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const day = (key) => host.querySelector(`[data-calendar-day="${key}"]`);
const editor = () => host.querySelector('[type=text]');
async function click(node) {
  await act(async () => node.click());
}
async function key(node, key, options = {}) {
  await act(async () =>
    node.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }),
    ),
  );
}
const d = (y, m, day) => new Date(y, m - 1, day);
const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
test('SSR grids, locale weekdays, two months without duplicate dates and diagnostics', () => {
  const doc = new JSDOM(
    renderToString(
      h(Calendar, {
        defaultMonth: d(2024, 2, 1),
        today: d(2024, 2, 29),
        monthsToShow: 2,
        locale: 'ko-KR',
        weekStartsOn: 1,
      }),
    ),
  ).window.document;
  assert.equal(doc.querySelectorAll('[role=grid]').length, 2);
  assert.equal(doc.querySelectorAll('[data-calendar-day="2024-02-29"]').length, 1);
  assert.equal(doc.querySelector('[aria-current=date]').textContent, '29');
  assert.equal(doc.querySelector('[role=columnheader]').textContent, '월');
  const keys = [...doc.querySelectorAll('[data-calendar-day]')].map((n) => n.dataset.calendarDay);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(doc.querySelectorAll('[data-calendar-day][tabindex="0"]').length, 1);
  assert.throws(
    () => renderToString(h(Calendar, { selectionMode: 'range', value: d(2026, 1, 1) })),
    /range requires/,
  );
  assert.throws(
    () => renderToString(h(Calendar, { min: d(2026, 2, 1), max: d(2026, 1, 1) })),
    /min <= max/,
  );
});
test('keyboard crosses months, clamps leap month/year and handles Home/End and DST days', async () => {
  await render(
    h(Calendar, {
      defaultValue: d(2024, 1, 31),
      today: d(2024, 1, 1),
      autoFocus: true,
      weekStartsOn: 1,
    }),
  );
  assert.equal(document.activeElement, day('2024-01-31'));
  await key(document.activeElement, 'PageDown');
  assert.equal(document.activeElement.dataset.calendarDay, '2024-02-29');
  await key(document.activeElement, 'PageDown', { shiftKey: true });
  assert.equal(document.activeElement.dataset.calendarDay, '2025-02-28');
  await key(document.activeElement, 'Home');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-02-24');
  await key(document.activeElement, 'End');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-03-02');
  for (let i = 0; i < 7; i++) await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-03-09');
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-03-10');
});
test('single selection ignores blocked dates, clones days, supports equal min/max', async () => {
  let value;
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      min: d(2026, 9, 10),
      max: d(2026, 9, 20),
      disabled: (date) => date.getDate() === 16,
      onChange: (next) => (value = next),
    }),
  );
  await click(day('2026-09-09'));
  assert.equal(value, undefined);
  await click(day('2026-09-16'));
  assert.equal(value, undefined);
  await click(day('2026-09-18'));
  assert.equal(dateKey(value), '2026-09-18');
  assert.equal(value.getHours(), 0);
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      min: d(2026, 9, 15),
      max: d(2026, 9, 15),
      onChange: (next) => (value = next),
    }),
  );
  await click(day('2026-09-15'));
  assert.equal(dateKey(value), '2026-09-15');
  assert.equal(host.querySelector('[aria-label="이전 달"]').disabled, true);
});
test('range exposes partial state, orders endpoints, restarts and multiple toggles by day', async () => {
  let value;
  await render(
    h(Calendar, {
      selectionMode: 'range',
      today: d(2026, 9, 15),
      onChange: (next) => (value = next),
    }),
  );
  await click(day('2026-09-20'));
  assert.equal(dateKey(value.start), '2026-09-20');
  assert.equal(value.end, null);
  await click(day('2026-09-10'));
  assert.equal(dateKey(value.start), '2026-09-10');
  assert.equal(dateKey(value.end), '2026-09-20');
  assert.equal(day('2026-09-15').parentElement.getAttribute('aria-selected'), 'true');
  await click(day('2026-09-23'));
  assert.equal(value.end, null);
  assert.equal(dateKey(value.start), '2026-09-23');
  await act(() => root.unmount());
  root = undefined;
  host.remove();
  await render(
    h(Calendar, {
      selectionMode: 'multiple',
      today: d(2026, 9, 15),
      onChange: (next) => (value = next),
    }),
  );
  await click(day('2026-09-15'));
  await click(day('2026-09-16'));
  assert.deepEqual(value.map(dateKey), ['2026-09-15', '2026-09-16']);
  await click(day('2026-09-15'));
  assert.deepEqual(value.map(dateKey), ['2026-09-16']);
});
test('readOnly/none allow browsing without changes; disabled blocks navigation and selection', async () => {
  let calls = 0;
  const props = { today: d(2026, 9, 15), onChange: () => calls++ };
  await render(h(Calendar, { ...props, readOnly: true }));
  await click(day('2026-09-15'));
  assert.equal(calls, 0);
  await click(host.querySelector('[aria-label="다음 달"]'));
  assert.ok(day('2026-10-15'));
  await render(h(Calendar, { ...props, selectionMode: 'none' }));
  await click(day('2026-10-15'));
  assert.equal(calls, 0);
  await render(h(Calendar, { ...props, disabled: true }));
  await key(day('2026-10-15'), 'PageDown');
  await click(day('2026-10-15'));
  assert.equal(calls, 0);
  assert.equal(host.querySelector('[aria-label="다음 달"]').disabled, true);
  assert.equal(host.querySelector('[data-calendar-day][tabindex="0"]'), null);
});
test('custom grid body and cell state, controlled month callback, contextual diagnostics', async () => {
  let month;
  await render(
    h(
      Calendar,
      { today: d(2026, 9, 15), month: d(2026, 9, 1), onMonthChange: (next) => (month = next) },
      h(Calendar.Header, null, h(Calendar.Navigation)),
      h(
        Calendar.Grid,
        null,
        h(Calendar.Grid.HeaderRow),
        h(Calendar.Grid.Body, null, (date) =>
          h(
            Calendar.Grid.Cell,
            { date },
            (state) => `${date.getDate()}${state.today ? ' today' : ''}`,
          ),
        ),
      ),
    ),
  );
  assert.equal(day('2026-09-15').textContent, '15 today');
  await click(host.querySelector('[aria-label="다음 달"]'));
  assert.equal(dateKey(month), '2026-10-01');
  assert.ok(day('2026-09-15'));
  assert.throws(
    () => renderToString(h(Calendar, null, h(Calendar.Grid.Cell, { date: d(2026, 9, 15) }))),
    /inside Calendar.Grid.Body/,
  );
});

test('selecting an outside-month day preserves focus for the next keyboard action', async () => {
  await render(
    h(Calendar, { selectionMode: 'range', defaultMonth: d(2026, 9, 1), today: d(2026, 9, 15) }),
  );
  await click(day('2026-10-01'));
  assert.equal(document.activeElement === day('2026-10-01'), true);
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.dataset.calendarDay, '2026-10-02');
});
