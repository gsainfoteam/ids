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
const day = (key) => host.querySelector(`[data-calendar-day="${key}"]`);
const button = (name) => host.querySelector(`[aria-label="${name}"]`);
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
// jsdom has no PointerEvent; React reads pointerType from whatever event arrives.
async function pointer(node, type) {
  await act(async () => {
    const event = new MouseEvent(type, { bubbles: true, relatedTarget: null });
    Object.defineProperty(event, 'pointerType', { value: 'mouse' });
    node.dispatchEvent(event);
  });
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

test('SSR: Korean names by default, two months without duplicate dates, one tab stop', () => {
  const doc = new JSDOM(
    renderToString(
      h(Calendar, { defaultMonth: d(2024, 2, 1), today: d(2024, 2, 29), monthsToShow: 2 }),
    ),
  ).window.document;
  assert.equal(doc.querySelectorAll('[role=grid]').length, 2);
  assert.equal(doc.querySelector('[role=grid]').getAttribute('aria-label'), '2024년 2월');
  assert.equal(doc.querySelector('[role=columnheader]').textContent, '일');
  assert.equal(doc.querySelector('[role=columnheader]').getAttribute('aria-label'), '일요일');
  assert.equal(doc.querySelector('[aria-current=date]').textContent, '29');
  assert.equal(
    doc.querySelector('[aria-current=date]').getAttribute('aria-label'),
    '2024년 2월 29일 목요일',
  );
  const keys = [...doc.querySelectorAll('[data-calendar-day]')].map((n) => n.dataset.calendarDay);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(doc.querySelectorAll('[data-calendar-day][tabindex="0"]').length, 1);
  assert.equal(doc.querySelectorAll('[data-calendar-nav=previous]').length, 1);
  assert.equal(doc.querySelectorAll('[data-calendar-nav=next]').length, 1);
  assert.equal(doc.querySelector('[aria-live=polite]').textContent, '2024년 2월~3월');
});

test('locale drives names and the first weekday; weekStartsOn overrides it', () => {
  const first = (props) =>
    new JSDOM(renderToString(h(Calendar, { today: d(2026, 9, 15), ...props }))).window.document;
  assert.equal(first({ locale: 'en-US' }).querySelector('[role=columnheader]').textContent, 'Sun');
  assert.equal(
    first({ locale: 'de-DE' }).querySelector('[role=columnheader]').getAttribute('aria-label'),
    'Montag',
  );
  assert.equal(
    first({ locale: 'ko-KR', weekStartsOn: 1 })
      .querySelector('[role=columnheader]')
      .getAttribute('aria-label'),
    '월요일',
  );
  assert.equal(
    first({ locale: 'ar-EG' }).querySelector('[data-calendar-day="2026-09-15"]').textContent,
    '١٥',
  );
  const arabic = first({ locale: 'ar-EG' }).querySelector('[role=columnheader]');
  assert.ok(Array.from(arabic.textContent).length <= 2, 'long weekday names use the narrow form');
  assert.equal(arabic.getAttribute('aria-label'), 'السبت');
  assert.equal(
    first({ locale: 'en-US' })
      .querySelector('[data-calendar-day="2026-09-15"]')
      .getAttribute('aria-label'),
    'Tuesday, September 15, 2026',
  );
});

test('without Intl week data the first weekday comes from the CLDR region table', () => {
  const own = Object.getOwnPropertyDescriptor(Intl.Locale.prototype, 'weekInfo');
  Object.defineProperty(Intl.Locale.prototype, 'weekInfo', {
    configurable: true,
    get: () => undefined,
  });
  try {
    const first = (locale) =>
      new JSDOM(renderToString(h(Calendar, { locale, today: d(2026, 9, 15) }))).window.document
        .querySelector('[role=columnheader]')
        .getAttribute('aria-label');
    assert.equal(first('de-DE'), 'Montag');
    assert.equal(first('ko-KR'), '일요일');
    assert.equal(first('en-US'), 'Sunday');
    assert.equal(first('ar-EG'), 'السبت');
  } finally {
    if (own) Object.defineProperty(Intl.Locale.prototype, 'weekInfo', own);
    else delete Intl.Locale.prototype.weekInfo;
  }
});

test('diagnostics for mismatched values, limits and parts outside their parents', () => {
  assert.throws(
    () => renderToString(h(Calendar, { selectionMode: 'range', value: d(2026, 1, 1) })),
    /range requires/,
  );
  assert.throws(
    () => renderToString(h(Calendar, { min: d(2026, 2, 1), max: d(2026, 1, 1) })),
    /min <= max/,
  );
  assert.throws(() => renderToString(h(Calendar, { monthsToShow: 0 })), /monthsToShow/);
  assert.throws(() => renderToString(h(Calendar, { weekStartsOn: 7 })), /weekStartsOn/);
  assert.throws(
    () => renderToString(h(Calendar, null, h(Calendar.Grid.Cell, { date: d(2026, 9, 15) }))),
    /inside Calendar.Grid.Body/,
  );
  assert.throws(() => renderToString(h(Calendar.Previous)), /inside Calendar/);
});

test('keyboard crosses months, clamps month ends and handles Home/End and DST days', async () => {
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
  await key(document.activeElement, 'PageUp', { shiftKey: true });
  assert.equal(document.activeElement.dataset.calendarDay, '2024-02-28');
  await key(document.activeElement, 'PageDown', { shiftKey: true });
  await key(document.activeElement, 'Home');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-02-24');
  await key(document.activeElement, 'End');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-03-02');
  for (let i = 0; i < 7; i++) await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-03-09');
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-03-10');
  await key(document.activeElement, 'ArrowUp');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-03-03');
  await key(document.activeElement, 'PageUp');
  assert.equal(document.activeElement.dataset.calendarDay, '2025-02-03');
});

test('right-to-left grids swap the horizontal arrows', async () => {
  await render(
    h(
      'div',
      { dir: 'rtl' },
      h(Calendar, { defaultValue: d(2026, 9, 15), today: d(2026, 9, 15), autoFocus: true }),
    ),
  );
  await key(document.activeElement, 'ArrowLeft');
  assert.equal(document.activeElement.dataset.calendarDay, '2026-09-16');
  await key(document.activeElement, 'ArrowRight');
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.dataset.calendarDay, '2026-09-14');
});

test('single selection skips blocked days, reports local midnight and ignores a re-click', async () => {
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
  await click(day('2026-09-09'));
  await click(day('2026-09-16'));
  assert.deepEqual(changes, []);
  assert.equal(day('2026-09-16').getAttribute('aria-disabled'), 'true');
  await click(day('2026-09-18'));
  assert.deepEqual(changes.map(dateKey), ['2026-09-18']);
  assert.equal(changes[0].getHours(), 0);
  await click(day('2026-09-18'));
  assert.equal(changes.length, 1, 'picking the selected day again is not a change');
  await key(day('2026-09-18'), 'ArrowLeft');
  await key(document.activeElement, 'ArrowLeft');
  assert.equal(document.activeElement, day('2026-09-16'), 'the keyboard can rest on a blocked day');
  await key(document.activeElement, 'Enter');
  await click(document.activeElement);
  assert.equal(changes.length, 1);
  assert.ok(day('2026-09-18').hasAttribute('data-selected'));
  assert.ok(day('2026-09-15').hasAttribute('data-today'));
});

test('equal min and max; month buttons at a limit stay focusable and do nothing', async () => {
  let value;
  await render(
    h(Calendar, {
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
  assert.equal(previous.disabled, false);
  await act(async () => previous.focus());
  await click(previous);
  assert.equal(document.activeElement, previous);
  assert.ok(day('2026-09-15'));
});

test('range: partial value, ordered ends, restart, and a hover preview before the end', async () => {
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
  await pointer(day('2026-09-24'), 'pointerover');
  assert.ok(day('2026-09-22').hasAttribute('data-range-preview'));
  assert.ok(day('2026-09-24').hasAttribute('data-range-preview'));
  assert.equal(day('2026-09-24').parentElement.dataset.band, 'end');
  assert.equal(day('2026-09-20').parentElement.dataset.band, 'start');
  assert.ok(!day('2026-09-25').hasAttribute('data-range-preview'));
  await key(day('2026-09-20'), 'ArrowLeft');
  await key(document.activeElement, 'ArrowLeft');
  assert.ok(day('2026-09-18').hasAttribute('data-range-preview'), 'the keyboard takes over');
  assert.ok(!day('2026-09-24').hasAttribute('data-range-preview'));
  await pointer(day('2026-09-22'), 'pointerover');
  assert.ok(!day('2026-09-18').hasAttribute('data-range-preview'), 'then the pointer again');
  await pointer(host.querySelector('[role=grid]'), 'pointerout');
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
  await render(h(Calendar, { today: d(2026, 9, 15), selectionMode: 'none' }));
  await click(day('2026-10-15'));
  assert.equal(host.querySelector('[data-selected]'), null);
  await render(h(Calendar, { ...props, disabled: true }));
  await key(day('2026-10-15'), 'PageDown');
  await click(day('2026-10-15'));
  assert.equal(calls, 0);
  assert.equal(button('다음 달').getAttribute('aria-disabled'), 'true');
  assert.equal(host.querySelector('[data-calendar-day][tabindex="0"]'), null);
  assert.ok(host.querySelector('[data-calendar]').hasAttribute('data-disabled'));
});

test('caption dropdowns jump by month and year within min/max', async () => {
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
  const [month, year] = host.querySelectorAll('select');
  assert.equal(month.getAttribute('aria-label'), '월');
  assert.equal(year.getAttribute('aria-label'), '연도');
  assert.deepEqual(
    [...year.options].map((option) => option.value),
    ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  );
  assert.equal(year.options[0].textContent, '2020년');
  assert.equal(month.options[10].disabled, true, 'November 2026 is after max');
  await select(year, '2020');
  assert.equal(dateKey(months.at(-1)), '2020-09-01');
  assert.equal(month.options[1].disabled, true, 'February 2020 is before min');
  await select(month, '3');
  assert.equal(dateKey(months.at(-1)), '2020-04-01');
  assert.equal(host.querySelector('[role=grid]').getAttribute('aria-label'), '2020년 4월');
  assert.equal(host.querySelector('[aria-live=polite]').textContent, '2020년 4월');
  assert.equal(
    host.querySelector('[data-calendar-day][tabindex="0"]').dataset.calendarDay,
    '2020-04-15',
  );
});

test('without limits the year menu spans a century either side of today', async () => {
  await render(h(Calendar, { captionLayout: 'dropdown', today: d(2026, 9, 15) }));
  const year = host.querySelectorAll('select')[1];
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
  const selects = host.querySelectorAll('select');
  assert.equal(selects.length, 4);
  await select(selects[2], '0');
  assert.equal(dateKey(months.at(-1)), '2025-12-01');
  assert.equal(host.querySelectorAll('[role=grid]')[1].getAttribute('aria-label'), '2026년 1월');
});

test('composition: custom body, cell render functions, controlled month and a header of parts', async () => {
  let month;
  await render(
    h(
      Calendar,
      { today: d(2026, 9, 15), month: d(2026, 9, 1), onMonthChange: (next) => (month = next) },
      h(Calendar.Header, null, h(Calendar.Title), h(Calendar.Previous), h(Calendar.Next)),
      h(
        Calendar.Grid,
        null,
        h(Calendar.Grid.HeaderRow),
        h(Calendar.Grid.Body, null, (date) =>
          h(
            Calendar.Grid.Cell,
            {
              date,
              className: (state) => (state.today ? 'is-today' : undefined),
              style: (state) => (state.outsideMonth ? { opacity: 0.25 } : undefined),
            },
            (state) => `${date.getDate()}${state.today ? ' today' : ''}`,
          ),
        ),
      ),
    ),
  );
  assert.equal(day('2026-09-15').textContent, '15 today');
  assert.ok(day('2026-09-15').className.includes('is-today'));
  assert.equal(day('2026-10-01').style.opacity, '0.25');
  assert.equal(host.querySelector('[data-calendar] span').textContent, '2026년 9월');
  await click(button('다음 달'));
  assert.equal(dateKey(month), '2026-10-01');
  assert.ok(day('2026-09-15'), 'a controlled month waits for the parent');
});

test('parts render through asChild with their behaviour attached', async () => {
  let month;
  await render(
    h(
      Calendar,
      { today: d(2026, 9, 15), onMonthChange: (next) => (month = next) },
      h(
        Calendar.Header,
        { asChild: true },
        h(
          'nav',
          { className: 'custom-header' },
          h(Calendar.Title, { asChild: true }, h('h2')),
          h(Calendar.Next, { asChild: true }, h('button', { className: 'custom-next' }, 'Next')),
        ),
      ),
      h(Calendar.Grid),
    ),
  );
  assert.equal(host.querySelector('nav.custom-header h2').textContent, '2026년 9월');
  const next = host.querySelector('button.custom-next');
  assert.equal(next.getAttribute('aria-label'), '다음 달');
  await click(next);
  assert.equal(dateKey(month), '2026-10-01');
});

test('root className and style accept a function of the calendar state', async () => {
  await render(
    h(Calendar, {
      today: d(2026, 9, 15),
      defaultValue: d(2026, 9, 18),
      className: (state) => `month-${state.month.getMonth()}`,
      style: (state) => ({ outline: state.disabled ? '1px solid red' : undefined }),
    }),
  );
  assert.ok(host.querySelector('[data-calendar]').className.includes('month-8'));
  assert.equal(host.querySelector('[data-calendar]').style.outline, '');
});

test('several months: Previous only before the first grid, Next only after the last', async () => {
  await render(h(Calendar, { today: d(2026, 9, 15), monthsToShow: 3 }));
  const grids = host.querySelectorAll('[data-calendar-month]');
  assert.equal(grids.length, 3);
  assert.ok(grids[0].querySelector('[data-calendar-nav=previous]'));
  assert.equal(grids[0].querySelector('[data-calendar-nav=next]'), null);
  assert.ok(grids[2].querySelector('[data-calendar-nav=next]'));
  await click(button('다음 달'));
  assert.equal(host.querySelector('[aria-live=polite]').textContent, '2026년 10월~12월');
});

test('selecting an outside-month day moves the month and keeps focus for the keyboard', async () => {
  await render(
    h(Calendar, { selectionMode: 'range', defaultMonth: d(2026, 9, 1), today: d(2026, 9, 15) }),
  );
  await click(day('2026-10-01'));
  assert.equal(document.activeElement === day('2026-10-01'), true);
  assert.equal(host.querySelector('[role=grid]').getAttribute('aria-label'), '2026년 10월');
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement.dataset.calendarDay, '2026-10-02');
});
