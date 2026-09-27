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
  'FocusEvent',
  'getComputedStyle',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { de } = await import('date-fns/locale/de');
const { arEG } = await import('date-fns/locale/ar-EG');
const { es } = await import('react-day-picker/locale');
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
const ssr = (props) => new JSDOM(renderToString(h(Calendar, props))).window.document;
const day = (key) => host.querySelector(`[data-calendar-day="${key}"]`);
const button = (name) => host.querySelector(`[aria-label="${name}"]`);
const focused = () => document.activeElement.dataset.calendarDay;
async function click(node) {
  await act(async () => node.click());
}
async function focus(node) {
  await act(async () => node.focus());
}
async function key(node, key, options = {}) {
  await act(async () =>
    node.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }),
    ),
  );
}
// React derives mouseenter and mouseleave from mouseover and mouseout.
async function hover(node) {
  await act(async () =>
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: null })),
  );
}
async function leave(node) {
  await act(async () =>
    node.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })),
  );
}
async function select(node, value) {
  await act(async () => {
    node.value = value;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
const d = (y, m, day) => new Date(y, m - 1, day);
const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

test('SSR: Korean by default, two months without duplicate dates, one tab stop', () => {
  const doc = ssr({ defaultMonth: d(2024, 2, 1), today: d(2024, 2, 29), monthsToShow: 2 });
  const grids = doc.querySelectorAll('[role=grid]');
  assert.equal(grids.length, 2);
  assert.equal(grids[0].getAttribute('aria-label'), '2024년 2월');
  assert.equal(doc.querySelector('[data-calendar]').getAttribute('aria-label'), '달력');
  assert.equal(doc.querySelector('[data-calendar]').getAttribute('lang'), 'ko');
  assert.equal(doc.querySelector('th').textContent, '일');
  assert.equal(doc.querySelector('th').getAttribute('aria-label'), '일요일');
  const today = doc.querySelector('[data-calendar-day][data-today]');
  assert.equal(today.textContent, '29');
  assert.equal(today.getAttribute('aria-label'), '오늘, 2024년 2월 29일 목요일');
  const keys = [...doc.querySelectorAll('[data-calendar-day]')].map((n) => n.dataset.calendarDay);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(doc.querySelectorAll('[data-calendar-day][tabindex="0"]').length, 1);
  assert.equal(doc.querySelectorAll('[aria-label="이전 달"]').length, 1);
  assert.equal(doc.querySelectorAll('[aria-label="다음 달"]').length, 1);
  assert.deepEqual(
    [...doc.querySelectorAll('[role=status]')].map((n) => n.textContent),
    ['2024년 2월', '2024년 3월'],
  );
});

test('a tag or a date-fns Locale drives names, the first weekday and the day labels', () => {
  const first = (props) => ssr({ today: d(2026, 9, 15), ...props }).querySelector('th');
  assert.equal(first({ locale: 'en-US' }).textContent, 'Su');
  assert.equal(first({ locale: de }).getAttribute('aria-label'), 'Montag');
  assert.equal(first({ weekStartsOn: 1 }).getAttribute('aria-label'), '월요일');
  const arabic = ssr({ locale: arEG, numerals: 'arab', today: d(2026, 9, 15) });
  assert.equal(arabic.querySelector('[data-calendar-day="2026-09-15"]').textContent, '١٥');
  assert.equal(
    ssr({ locale: 'en-US', today: d(2026, 9, 14) })
      .querySelector('[data-calendar-day="2026-09-15"]')
      .getAttribute('aria-label'),
    'Tuesday, September 15th, 2026',
  );
  assert.throws(() => ssr({ locale: 'de-DE' }), /no built-in date-fns locale/);
});

test('a locale from react-day-picker/locale keeps its own translated labels', () => {
  const doc = ssr({ locale: es, today: d(2026, 9, 15) });
  assert.ok(doc.querySelector('[aria-label="Ir al mes anterior"]'));
  assert.equal(doc.querySelector('[role=grid]').getAttribute('aria-label'), 'septiembre 2026');
});

test('diagnostics for mismatched values, limits and parts outside the calendar', () => {
  assert.throws(() => ssr({ selectionMode: 'range', value: d(2026, 1, 1) }), /range requires/);
  assert.throws(() => ssr({ min: d(2026, 2, 1), max: d(2026, 1, 1) }), /min <= max/);
  assert.throws(() => ssr({ monthsToShow: 0 }), /monthsToShow/);
  assert.throws(() => ssr({ weekStartsOn: 7 }), /weekStartsOn/);
  assert.throws(() => renderToString(h(Calendar.DayButton, {})), /inside Calendar/);
});

test('keyboard: month ends clamp, Home and End follow the week start, Shift jumps', async () => {
  await render(
    h(Calendar, {
      defaultValue: d(2024, 1, 31),
      today: d(2024, 1, 1),
      autoFocus: true,
      weekStartsOn: 1,
    }),
  );
  assert.equal(focused(), '2024-01-31');
  await key(document.activeElement, 'PageDown');
  assert.equal(focused(), '2024-02-29');
  await key(document.activeElement, 'PageDown', { shiftKey: true });
  assert.equal(focused(), '2025-02-28');
  await key(document.activeElement, 'PageUp', { shiftKey: true });
  assert.equal(focused(), '2024-02-28');
  await key(document.activeElement, 'PageDown', { shiftKey: true });
  await key(document.activeElement, 'Home');
  assert.equal(focused(), '2025-02-24');
  await key(document.activeElement, 'End');
  assert.equal(focused(), '2025-03-02');
  for (let i = 0; i < 8; i++) await key(document.activeElement, 'ArrowRight');
  assert.equal(focused(), '2025-03-10');
  await key(document.activeElement, 'ArrowUp');
  assert.equal(focused(), '2025-03-03');
  await key(document.activeElement, 'ArrowRight', { shiftKey: true });
  assert.equal(focused(), '2025-04-03');
  await key(document.activeElement, 'ArrowDown', { shiftKey: true });
  assert.equal(focused(), '2026-04-03');
});

test('an inherited right-to-left direction swaps the horizontal arrows', async () => {
  await render(
    h(
      'div',
      { dir: 'rtl' },
      h(Calendar, { defaultValue: d(2026, 9, 15), today: d(2026, 9, 15), autoFocus: true }),
    ),
  );
  assert.equal(host.querySelector('[data-calendar]').getAttribute('dir'), 'rtl');
  await key(document.activeElement, 'ArrowLeft');
  assert.equal(focused(), '2026-09-16');
  await key(document.activeElement, 'ArrowRight');
  await key(document.activeElement, 'ArrowRight');
  assert.equal(focused(), '2026-09-14');
});

test('single: blocked days refuse, the value is local midnight, a re-click is no change', async () => {
  const changes = [];
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      min: d(2026, 9, 10),
      max: d(2026, 9, 20),
      disabled: (date) => date.getDate() === 16,
      onValueChange: (next) => changes.push(next),
    }),
  );
  assert.equal(day('2026-09-09').disabled, true);
  assert.equal(day('2026-09-16').disabled, true);
  assert.ok(day('2026-09-16').hasAttribute('data-disabled'));
  await click(day('2026-09-09'));
  await click(day('2026-09-16'));
  assert.deepEqual(changes, []);
  await click(day('2026-09-18'));
  assert.deepEqual(changes.map(dateKey), ['2026-09-18']);
  assert.equal(changes[0].getHours(), 0);
  await click(day('2026-09-18'));
  assert.equal(changes.length, 1, 'picking the selected day again is not a change');
  assert.equal(document.activeElement, day('2026-09-18'));
  await key(document.activeElement, 'ArrowLeft');
  await key(document.activeElement, 'ArrowLeft');
  assert.equal(focused(), '2026-09-15', 'the keyboard steps over a blocked day');
  assert.ok(day('2026-09-18').hasAttribute('data-selected'));
  assert.ok(day('2026-09-15').hasAttribute('data-today'));
  assert.equal(day('2026-09-18').getAttribute('aria-label'), '2026년 9월 18일 금요일, 선택됨');
});

test('a DayPicker matcher blocks days, and equal min and max leave one day and no months', async () => {
  let value;
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      disabled: { dayOfWeek: [0, 6] },
      onValueChange: (next) => (value = next),
    }),
  );
  assert.equal(day('2026-09-19').disabled, true);
  assert.equal(day('2026-09-18').disabled, false);
  await render(
    h(Calendar, {
      key: 'one day',
      today: d(2026, 9, 15),
      min: d(2026, 9, 15),
      max: d(2026, 9, 15),
      onValueChange: (next) => (value = next),
    }),
  );
  await click(day('2026-09-15'));
  assert.equal(dateKey(value), '2026-09-15');
  const previous = button('이전 달');
  assert.equal(previous.getAttribute('aria-disabled'), 'true');
  await focus(previous);
  await click(previous);
  assert.equal(document.activeElement, previous);
  assert.ok(day('2026-09-15'));
});

test('range: a partial value, ordered ends, restart, and a preview under the pointer or focus', async () => {
  let value;
  await render(
    h(Calendar, {
      selectionMode: 'range',
      today: d(2026, 9, 15),
      onValueChange: (next) => (value = next),
    }),
  );
  await click(day('2026-09-20'));
  assert.equal(dateKey(value.start), '2026-09-20');
  assert.equal(value.end, null);
  await hover(day('2026-09-24'));
  for (const key of ['2026-09-21', '2026-09-22', '2026-09-24'])
    assert.ok(day(key).hasAttribute('data-range-preview'), key);
  assert.ok(!day('2026-09-20').hasAttribute('data-range-preview'), 'the start is already picked');
  assert.ok(!day('2026-09-25').hasAttribute('data-range-preview'));
  assert.match(day('2026-09-24').parentElement.className, /rounded-e-standard/);
  await key(document.activeElement, 'ArrowLeft');
  await key(document.activeElement, 'ArrowLeft');
  assert.equal(focused(), '2026-09-18');
  assert.ok(day('2026-09-18').hasAttribute('data-range-preview'), 'the keyboard takes over');
  assert.ok(!day('2026-09-24').hasAttribute('data-range-preview'));
  await hover(day('2026-09-22'));
  assert.ok(!day('2026-09-18').hasAttribute('data-range-preview'), 'then the pointer again');
  await leave(host.querySelector('[role=grid]'));
  assert.ok(day('2026-09-18').hasAttribute('data-range-preview'), 'back to the focused day');
  await click(day('2026-09-10'));
  assert.equal(dateKey(value.start), '2026-09-10');
  assert.equal(dateKey(value.end), '2026-09-20');
  assert.equal(day('2026-09-15').parentElement.getAttribute('aria-selected'), 'true');
  assert.ok(day('2026-09-15').hasAttribute('data-range-middle'));
  assert.ok(day('2026-09-10').hasAttribute('data-range-start'));
  assert.ok(day('2026-09-20').hasAttribute('data-range-end'));
  assert.equal(host.querySelector('[data-range-preview]'), null);
  await click(day('2026-09-23'));
  assert.equal(value.end, null);
  assert.equal(dateKey(value.start), '2026-09-23');
});

test('multiple toggles by day and marks the grid multiselectable', async () => {
  let value;
  await render(
    h(Calendar, {
      selectionMode: 'multiple',
      today: d(2026, 9, 15),
      onValueChange: (next) => (value = next),
    }),
  );
  await click(day('2026-09-15'));
  await click(day('2026-09-16'));
  assert.deepEqual(value.map(dateKey), ['2026-09-15', '2026-09-16']);
  await click(day('2026-09-15'));
  assert.deepEqual(value.map(dateKey), ['2026-09-16']);
  assert.equal(host.querySelector('[role=grid]').getAttribute('aria-multiselectable'), 'true');
});

test('readOnly and none browse without changes; disabled blocks navigation and selection', async () => {
  let calls = 0;
  const props = { today: d(2026, 9, 15), onValueChange: () => calls++ };
  await render(h(Calendar, { ...props, readOnly: true }));
  await click(day('2026-09-15'));
  assert.equal(calls, 0);
  assert.equal(host.querySelector('[role=grid]').getAttribute('aria-readonly'), 'true');
  await click(button('다음 달'));
  assert.ok(day('2026-10-15'));
  await render(
    h(Calendar, {
      key: 'none',
      today: d(2026, 9, 15),
      selectionMode: 'none',
      value: d(2026, 9, 18),
    }),
  );
  assert.ok(day('2026-09-18').hasAttribute('data-selected'));
  await click(day('2026-09-20'));
  assert.ok(!day('2026-09-20').hasAttribute('data-selected'));
  await render(h(Calendar, { ...props, key: 'disabled', disabled: true }));
  await click(day('2026-09-15'));
  assert.equal(calls, 0);
  assert.equal(button('다음 달').getAttribute('aria-disabled'), 'true');
  assert.equal(host.querySelector('[data-calendar-day][tabindex="0"]'), null);
  assert.ok(host.querySelector('[data-calendar]').hasAttribute('data-disabled'));
});

test('caption dropdowns jump by year and month within min and max', async () => {
  const months = [];
  await render(
    h(Calendar, {
      captionLayout: 'dropdown',
      today: d(2026, 9, 15),
      min: d(2020, 3, 10),
      max: d(2026, 10, 5),
      onMonthChange: (next) => months.push(next),
    }),
  );
  const [year, month] = host.querySelectorAll('select');
  assert.equal(year.getAttribute('aria-label'), '연도', 'Korean puts the year first');
  assert.equal(month.getAttribute('aria-label'), '월');
  assert.ok(month.hasAttribute('data-field-input'));
  assert.deepEqual(
    [...year.options].map((option) => option.value),
    ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  );
  assert.equal(month.options[10].disabled, true, 'November 2026 is after max');
  await select(year, '2020');
  assert.equal(dateKey(months.at(-1)), '2020-09-01');
  assert.equal(month.options[1].disabled, true, 'February 2020 is before min');
  await select(month, '3');
  assert.equal(dateKey(months.at(-1)), '2020-04-01');
  assert.equal(host.querySelector('[role=grid]').getAttribute('aria-label'), '2020년 4월');
  assert.equal(host.querySelector('[role=status]').textContent, '2020년 4월');
});

test('without limits the year menu spans a century either side of today', async () => {
  await render(h(Calendar, { captionLayout: 'dropdown', today: d(2026, 9, 15) }));
  const year = host.querySelector('select[aria-label="연도"]');
  assert.equal(year.options[0].value, '1926');
  assert.equal(year.options[year.options.length - 1].value, '2126');
  assert.equal(year.value, '2026');
});

test('a month picked in the second caption lands in the second grid', async () => {
  const months = [];
  await render(
    h(Calendar, {
      captionLayout: 'dropdown',
      monthsToShow: 2,
      today: d(2026, 9, 15),
      onMonthChange: (next) => months.push(next),
    }),
  );
  const selects = host.querySelectorAll('select[aria-label="월"]');
  assert.equal(selects.length, 2);
  await select(selects[1], '0');
  assert.equal(dateKey(months.at(-1)), '2025-12-01');
  assert.equal(host.querySelectorAll('[role=grid]')[1].getAttribute('aria-label'), '2026년 1월');
});

test('several months: Previous before the first grid only, Next after the last only', async () => {
  await render(h(Calendar, { today: d(2026, 9, 15), monthsToShow: 3 }));
  const months = [...host.querySelectorAll('[role=grid]')].map((grid) => grid.parentElement);
  assert.equal(months.length, 3);
  assert.ok(months[0].querySelector('[aria-label="이전 달"]'));
  assert.equal(months[0].querySelector('[aria-label="다음 달"]'), null);
  assert.ok(months[2].querySelector('[aria-label="다음 달"]'));
  await click(button('다음 달'));
  assert.deepEqual(
    [...host.querySelectorAll('[role=status]')].map((n) => n.textContent),
    ['2026년 10월', '2026년 11월', '2026년 12월'],
  );
});

test('a controlled month waits for the parent', async () => {
  let month;
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      month: d(2026, 9, 1),
      onMonthChange: (next) => (month = next),
    }),
  );
  await click(button('다음 달'));
  assert.equal(dateKey(month), '2026-10-01');
  assert.ok(day('2026-09-15'));
});

function EventDay(props) {
  return h(
    Calendar.DayButton,
    props,
    props.children,
    props.modifiers.event && h('span', { 'data-event-dot': '' }),
  );
}

test('parts: a DayButton built on Calendar.DayButton, modifiers, formatters and a footer', async () => {
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      modifiers: { event: [d(2026, 9, 4), d(2026, 9, 22)] },
      modifiersClassNames: { event: 'has-event' },
      components: { DayButton: EventDay },
      formatters: { formatDay: (date) => `${date.getDate()}일` },
      footer: '일정 2개',
    }),
  );
  assert.ok(day('2026-09-04').querySelector('[data-event-dot]'));
  assert.equal(day('2026-09-05').querySelector('[data-event-dot]'), null);
  assert.ok(day('2026-09-22').parentElement.classList.contains('has-event'));
  assert.equal(day('2026-09-05').firstChild.textContent, '5일');
  assert.ok(day('2026-09-05').className.includes('rounded-standard'), 'the IDS look stays');
  const footer = [...host.querySelectorAll('[role=status]')].at(-1);
  assert.equal(footer.textContent, '일정 2개');
});

test('root className and style accept a function of the calendar state; native props reach it', async () => {
  let pressed;
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      defaultValue: d(2026, 9, 18),
      id: 'schedule',
      'aria-label': '일정',
      onKeyDown: (event) => (pressed = event.key),
      className: (state) => `month-${state.month.getMonth()}`,
      style: (state) => ({ outline: state.disabled ? '1px solid red' : undefined }),
    }),
  );
  const rootNode = host.querySelector('[data-calendar]');
  assert.ok(rootNode.className.includes('month-8'));
  assert.equal(rootNode.style.outline, '');
  assert.equal(rootNode.id, 'schedule');
  assert.equal(rootNode.getAttribute('aria-label'), '일정');
  await key(day('2026-09-18'), 'x');
  assert.equal(pressed, 'x');
});
