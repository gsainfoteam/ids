import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<html><body></body></html>', { pretendToBeVisual: true });
for (const k of [
  'window',
  'document',
  'HTMLElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
  'getComputedStyle',
])
  globalThis[k] = dom.window[k];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { de } = await import('date-fns/locale/de');
const { TimePicker } = await import('../dist/index.js');

let host, root;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  host?.remove();
  root = undefined;
});
async function render(el) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(() => root.render(el));
}
const col = (u) => host.querySelector(`[data-time-column="${u}"]`);
const option = (u, n) => col(u).querySelector(`[data-time-option="${n}"]`);
const click = (el) => act(() => el.click());
const key = (el, k, init = {}) =>
  act(() =>
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }),
    ),
  );
const d = (h, m = 0, s = 0) => new Date(2026, 8, 15, h, m, s);
const ssr = (props, ...children) =>
  new JSDOM(renderToString(h(TimePicker, props, ...children))).window.document;
const labels = (doc) =>
  [...doc.querySelectorAll('[role=listbox]')].map((n) => n.getAttribute('aria-label'));
const periods = (doc) =>
  [...doc.querySelectorAll('[data-time-column=period] [role=option]')].map((n) => n.textContent);

test('SSR: Korean names by default, the clock and periods from the date-fns locale, diagnostics', () => {
  const doc = ssr({ precision: 'second', step: 15 });
  assert.equal(doc.querySelector('[role=group]').getAttribute('aria-label'), '시간');
  assert.deepEqual(
    labels(doc),
    ['오전/오후', '시', '분', '초'],
    'Korean expects a 12-hour clock, as CLDR does',
  );
  assert.equal(doc.querySelector('[data-time-picker]').dataset.format, '12h');
  assert.equal(doc.querySelectorAll('[data-time-column=second] [role=option]').length, 4);
  assert.ok(doc.querySelector('[data-time-picker]').hasAttribute('data-empty'));
  assert.deepEqual(periods(ssr({ format: '12h' })), ['오전', '오후']);
  const english = ssr({ locale: 'en-US' });
  assert.equal(english.querySelector('[data-time-picker]').dataset.format, '12h');
  assert.deepEqual(periods(english), ['AM', 'PM']);
  assert.equal(ssr({ locale: de }).querySelector('[data-time-column=period]'), null);
  assert.throws(() => ssr({ locale: 'de-DE' }), /no built-in date-fns locale/);
  for (const props of [{ step: 0 }, { step: 15, precision: 'hour' }, { min: d(18), max: d(9) }])
    assert.throws(() => ssr(props));
  assert.throws(
    () => renderToString(h(TimePicker, { format: '24h' }, h(TimePicker.Period))),
    /Period requires/,
  );
  assert.throws(
    () =>
      renderToString(
        h(
          TimePicker,
          null,
          h(TimePicker.Column, { unit: 'hour' }),
          h(TimePicker.Column, { unit: 'hour' }),
        ),
      ),
    /duplicate/,
  );
  assert.throws(
    () =>
      renderToString(
        h(TimePicker, { precision: 'hour' }, h(TimePicker.Column, { unit: 'minute' })),
      ),
    /precision/,
  );
});

test('arrows browse without committing, Enter commits, the date is kept', async () => {
  let value;
  await render(
    h(TimePicker, {
      defaultValue: d(9, 15),
      format: '24h',
      step: 15,
      onValueChange: (v) => (value = v),
    }),
  );
  await act(() => col('hour').focus());
  await key(col('hour'), 'ArrowDown');
  assert.equal(value, undefined);
  assert.ok(option('hour', 10).hasAttribute('data-active'));
  assert.equal(col('hour').getAttribute('aria-activedescendant'), option('hour', 10).id);
  await key(col('hour'), 'Enter');
  assert.equal(value.getHours(), 10);
  assert.equal(value.getMinutes(), 15);
  assert.equal(value.getDate(), 15);
  await key(col('hour'), 'ArrowRight');
  assert.equal(document.activeElement === col('minute'), true);
  await key(col('minute'), 'End');
  await key(col('minute'), ' ');
  assert.equal(value.getMinutes(), 45);
  await key(col('minute'), 'Home');
  await key(col('minute'), 'Enter');
  assert.equal(value.getMinutes(), 0);
  await key(col('minute'), 'ArrowLeft');
  assert.equal(document.activeElement === col('hour'), true);
  await key(col('hour'), 'PageDown');
  assert.ok(option('hour', 15).hasAttribute('data-active'), 'PageDown moves five options');
  await key(col('hour'), 'PageUp');
  assert.ok(option('hour', 10).hasAttribute('data-active'));
});

test('picking the time that is already selected is not a change', async () => {
  const changes = [];
  await render(
    h(TimePicker, { defaultValue: d(9, 30), format: '24h', onValueChange: (v) => changes.push(v) }),
  );
  await click(option('hour', 9));
  await click(option('minute', 30));
  assert.deepEqual(changes, []);
});

test('typing digits jumps to the matching option and a repeated key cycles', async () => {
  let value;
  await render(
    h(TimePicker, { defaultValue: d(9), format: '24h', onValueChange: (v) => (value = v) }),
  );
  await act(() => col('hour').focus());
  await key(col('hour'), '1', { timeStamp: 1000 });
  assert.ok(option('hour', 10).hasAttribute('data-active'));
  await key(col('hour'), '4');
  assert.ok(option('hour', 14).hasAttribute('data-active'));
  await key(col('hour'), 'Enter');
  assert.equal(value.getHours(), 14);
  await act(() => col('minute').focus());
  await key(col('minute'), '4');
  assert.ok(option('minute', 4).hasAttribute('data-active'), '4 finds 04 first');
  await key(col('minute'), '5');
  assert.ok(option('minute', 45).hasAttribute('data-active'));
});

test('Delete and Backspace clear the value to null', async () => {
  const changes = [];
  await render(
    h(TimePicker, { defaultValue: d(9, 30), format: '24h', onValueChange: (v) => changes.push(v) }),
  );
  await act(() => col('minute').focus());
  await key(col('minute'), 'Delete');
  assert.deepEqual(changes, [null]);
  assert.equal(host.querySelector('[aria-selected=true]'), null);
  assert.ok(host.querySelector('[data-time-picker]').hasAttribute('data-empty'));
  await key(col('minute'), 'Backspace');
  assert.deepEqual(changes, [null], 'clearing an empty picker is not a change');
});

test('right-to-left pickers swap the column arrows', async () => {
  await render(h('div', { dir: 'rtl' }, h(TimePicker, { defaultValue: d(9), format: '24h' })));
  await act(() => col('hour').focus());
  await key(col('hour'), 'ArrowLeft');
  assert.equal(document.activeElement === col('minute'), true);
  await key(col('minute'), 'ArrowRight');
  assert.equal(document.activeElement === col('hour'), true);
});

test('a 12-hour column starts at 12', () => {
  const doc = new JSDOM(renderToString(h(TimePicker, { format: '12h', precision: 'hour' }))).window
    .document;
  assert.deepEqual(
    [...doc.querySelectorAll('[data-time-column=hour] [role=option]')].map((n) => n.textContent),
    ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
  );
});

test('12h noon/midnight and range-aware upper-unit selection', async () => {
  let value;
  await render(
    h(TimePicker, { defaultValue: d(0, 30), format: '12h', onValueChange: (v) => (value = v) }),
  );
  await click(option('period', 1));
  assert.equal(value.getHours(), 12);
  await click(option('period', 0));
  assert.equal(value.getHours(), 0);
  await render(
    h(TimePicker, {
      value: d(9, 30),
      format: '24h',
      step: 15,
      min: d(9, 30),
      max: d(10, 15),
      onValueChange: (v) => (value = v),
    }),
  );
  assert.equal(option('hour', 8).getAttribute('aria-disabled'), 'true');
  assert.ok(option('hour', 8).hasAttribute('data-disabled'));
  await click(option('hour', 10));
  assert.equal(value.getHours(), 10);
  assert.equal(value.getMinutes(), 15);
  assert.equal(option('minute', 15).getAttribute('aria-disabled'), 'true');
});

test('controlled values, none/readonly/disabled and hour precision', async () => {
  let value;
  const view = (p) =>
    h(TimePicker, {
      value: d(9, 37, 20),
      precision: 'hour',
      format: '24h',
      onValueChange: (v) => (value = v),
      ...p,
    });
  await render(view({}));
  await click(option('hour', 10));
  assert.equal(value.getMinutes(), 0);
  assert.equal(value.getSeconds(), 0);
  assert.equal(option('hour', 9).getAttribute('aria-selected'), 'true');
  assert.ok(option('hour', 9).hasAttribute('data-selected'));
  for (const p of [{ selectionMode: 'none' }, { readOnly: true }, { disabled: true }]) {
    value = undefined;
    await render(view(p));
    await click(option('hour', 10));
    await act(() => col('hour').focus());
    await key(col('hour'), 'Delete');
    assert.equal(value, undefined);
  }
  assert.equal(col('hour').tabIndex, -1);
  assert.ok(host.querySelector('[data-time-picker]').hasAttribute('data-disabled'));
});

test('an empty picker builds the time on referenceDate, or on today', async () => {
  let value;
  await render(
    h(TimePicker, {
      format: '24h',
      referenceDate: new Date(2030, 0, 2, 17, 45),
      onValueChange: (v) => (value = v),
    }),
  );
  await click(option('hour', 14));
  assert.deepEqual(
    [value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes()],
    [2030, 0, 2, 14, 0],
  );
  await render(h(TimePicker, { key: 'today', format: '24h', onValueChange: (v) => (value = v) }));
  await click(option('hour', 8));
  const today = new Date();
  assert.equal(value.toDateString(), today.toDateString());
});

test('wheel scroll selection and DST gaps do not emit normalized nonexistent hours', async () => {
  let value;
  await render(
    h(TimePicker, {
      defaultValue: d(9),
      format: '24h',
      variant: 'wheel',
      onValueChange: (v) => (value = v),
    }),
  );
  await act(() => {
    col('hour').dispatchEvent(new Event('wheel', { bubbles: true }));
    col('hour').scrollTop = 10 * 36;
    col('hour').dispatchEvent(new Event('scroll', { bubbles: true }));
    col('hour').dispatchEvent(new Event('scrollend', { bubbles: true }));
  });
  assert.equal(value.getHours(), 10);
  await act(async () => {
    col('hour').scrollTop = 14 * 36;
    col('hour').dispatchEvent(new Event('scroll', { bubbles: true }));
    col('hour').dispatchEvent(new Event('scrollend', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 200));
  });
  assert.equal(value.getHours(), 10, 'a scroll the user did not start commits nothing');
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/New_York') {
    await render(
      h(TimePicker, {
        value: new Date(2026, 2, 8, 1, 30),
        format: '24h',
        onValueChange: (v) => (value = v),
      }),
    );
    assert.equal(option('hour', 2).getAttribute('aria-disabled'), 'true');
  }
});

test('empty 12h picker can enter an afternoon-only range', async () => {
  let value;
  await render(
    h(TimePicker, { format: '12h', min: d(14), max: d(18), onValueChange: (v) => (value = v) }),
  );
  assert.equal(option('period', 1).getAttribute('aria-disabled'), null);
  await click(option('period', 1));
  assert.equal(value.getHours(), 14);
});

test('empty constrained picker starts on a valid draft without committing a value', async () => {
  let emitted;
  await render(
    h(TimePicker, {
      format: '24h',
      min: d(9, 30),
      max: d(18),
      step: 15,
      onValueChange: (v) => (emitted = v),
    }),
  );
  assert.equal(col('hour').getAttribute('aria-activedescendant'), option('hour', 9).id);
  assert.equal(option('minute', 30).getAttribute('aria-disabled'), null);
  assert.equal(host.querySelector('[aria-selected=true]'), null);
  assert.equal(emitted, undefined);
  await click(option('minute', 45));
  assert.equal(emitted.getHours(), 9);
});

test('column positioning ignores its page offset and keeps clicked time visible', async () => {
  await render(h(TimePicker, { defaultValue: d(9), format: '24h' }));
  const column = col('hour');
  Object.defineProperties(column, {
    offsetTop: { value: 900 },
    clientHeight: { value: 180 },
    scrollHeight: { value: 864 },
  });
  for (const child of column.children)
    Object.defineProperties(child, {
      offsetTop: { value: Number(child.dataset.timeOption) * 36 },
      offsetHeight: { value: 36 },
    });
  await click(option('hour', 10));
  assert.equal(column.scrollTop, 288);
});

test('wheel commits at both edges without requiring another scroll event', async () => {
  let value;
  await render(
    h(TimePicker, {
      defaultValue: d(9),
      format: '24h',
      variant: 'wheel',
      onValueChange: (v) => (value = v),
    }),
  );
  for (const hour of [23, 0]) {
    await act(() => {
      col('hour').dispatchEvent(new Event('wheel', { bubbles: true }));
      col('hour').scrollTop = hour * 36;
      col('hour').dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 200)));
    assert.equal(value?.getHours(), hour);
  }
});

test('pending wheel settlement respects a new readonly prop', async () => {
  let calls = 0;
  const view = (readOnly) =>
    h(TimePicker, {
      value: d(9),
      format: '24h',
      variant: 'wheel',
      readOnly,
      onValueChange: () => calls++,
    });
  await render(view(false));
  await act(() => {
    col('hour').dispatchEvent(new Event('wheel', { bubbles: true }));
    col('hour').scrollTop = 360;
    col('hour').dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await render(view(true));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 200)));
  assert.equal(calls, 0);
});

test('composition: header labels, option render functions and state-driven root props', async () => {
  await render(
    h(
      TimePicker,
      {
        defaultValue: d(9, 30),
        format: '24h',
        step: 30,
        className: (state) => (state.value ? 'has-value' : 'empty'),
        style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
      },
      h(TimePicker.Header),
      h(TimePicker.Column, { unit: 'hour' }, (o) => `${o.label}h${o.selected ? '*' : ''}`),
      h(TimePicker.Separator),
      h(TimePicker.Column, { unit: 'minute', 'aria-label': 'Minutes' }),
    ),
  );
  const root = host.querySelector('[data-time-picker]');
  assert.ok(root.className.includes('has-value'));
  assert.equal(root.style.opacity, '1');
  assert.equal(host.querySelector('[aria-hidden=true]').textContent, '시분');
  assert.equal(option('hour', 9).textContent, '09h*');
  assert.equal(col('minute').getAttribute('aria-label'), 'Minutes');
  assert.equal(host.querySelector('[data-time-picker] > span').textContent, ':');
});

test('a column rendered through asChild keeps its listbox role, options and keyboard', async () => {
  let value;
  await render(
    h(
      TimePicker,
      { defaultValue: d(9), format: '24h', precision: 'hour', onValueChange: (v) => (value = v) },
      h(TimePicker.Column, { unit: 'hour', asChild: true }, h('section', { className: 'custom' })),
    ),
  );
  const custom = host.querySelector('section.custom');
  assert.equal(custom.getAttribute('role'), 'listbox');
  assert.equal(custom.querySelectorAll('[role=option]').length, 24);
  await act(() => custom.focus());
  await key(custom, 'ArrowDown');
  await key(custom, 'Enter');
  assert.equal(value.getHours(), 10);
});
