import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<html><body></body></html>', { pretendToBeVisual: true });
for (const k of ['window', 'document', 'HTMLElement', 'Event', 'KeyboardEvent', 'MouseEvent'])
  globalThis[k] = dom.window[k];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
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
const key = (el, k) =>
  act(() =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })),
  );
const d = (h, m = 0, s = 0) => new Date(2026, 8, 15, h, m, s);
test('SSR precision, locale, composition and diagnostics', () => {
  const html = renderToString(
    h(TimePicker, { precision: 'second', format: '12h', locale: 'ko-KR', step: 15 }),
  );
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('[role=listbox]').length, 4);
  assert.equal(doc.querySelectorAll('[data-time-column=second] [role=option]').length, 4);
  assert.equal(
    doc.querySelector('[data-time-column=period] [role=option]').textContent,
    new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', hour12: true })
      .formatToParts(new Date(2000, 0, 1))
      .find((p) => p.type === 'dayPeriod').value,
  );
  for (const props of [{ step: 0 }, { step: 15, precision: 'hour' }, { min: d(18), max: d(9) }])
    assert.throws(() => renderToString(h(TimePicker, props)));
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
test('navigation is separate from selection, moves across columns and preserves date', async () => {
  let value;
  await render(
    h(TimePicker, {
      defaultValue: d(9, 15),
      format: '24h',
      step: 15,
      onChange: (v) => (value = v),
    }),
  );
  await act(() => col('hour').focus());
  await key(col('hour'), 'ArrowDown');
  assert.equal(value, undefined);
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
});
test('12h noon/midnight and range-aware upper-unit selection', async () => {
  let value;
  await render(
    h(TimePicker, { defaultValue: d(0, 30), format: '12h', onChange: (v) => (value = v) }),
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
      onChange: (v) => (value = v),
    }),
  );
  assert.equal(option('hour', 8).getAttribute('aria-disabled'), 'true');
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
      onChange: (v) => (value = v),
      ...p,
    });
  await render(view({}));
  await click(option('hour', 10));
  assert.equal(value.getMinutes(), 0);
  assert.equal(value.getSeconds(), 0);
  assert.equal(option('hour', 9).getAttribute('aria-selected'), 'true');
  for (const p of [{ selectionMode: 'none' }, { readOnly: true }, { disabled: true }]) {
    value = undefined;
    await render(view(p));
    await click(option('hour', 10));
    assert.equal(value, undefined);
  }
  assert.equal(col('hour').tabIndex, -1);
});
test('wheel scroll selection and DST gaps do not emit normalized nonexistent hours', async () => {
  let value;
  await render(
    h(TimePicker, {
      defaultValue: d(9),
      format: '24h',
      variant: 'wheel',
      onChange: (v) => (value = v),
    }),
  );
  await act(() => {
    col('hour').dispatchEvent(new Event('wheel', { bubbles: true }));
    col('hour').scrollTop = 10 * 36;
    col('hour').dispatchEvent(new Event('scroll', { bubbles: true }));
    col('hour').dispatchEvent(new Event('scrollend', { bubbles: true }));
  });
  assert.equal(value.getHours(), 10);
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/New_York') {
    await render(
      h(TimePicker, {
        value: new Date(2026, 2, 8, 1, 30),
        format: '24h',
        onChange: (v) => (value = v),
      }),
    );
    assert.equal(option('hour', 2).getAttribute('aria-disabled'), 'true');
  }
});

test('empty 12h picker can enter an afternoon-only range', async () => {
  let value;
  await render(
    h(TimePicker, { format: '12h', min: d(14), max: d(18), onChange: (v) => (value = v) }),
  );
  assert.equal(option('period', 1).getAttribute('aria-disabled'), 'false');
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
      onChange: (v) => (emitted = v),
    }),
  );
  assert.equal(col('hour').getAttribute('aria-activedescendant'), option('hour', 9).id);
  assert.equal(option('minute', 30).getAttribute('aria-disabled'), 'false');
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
      onChange: (v) => (value = v),
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
      onChange: () => calls++,
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
