import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const k of [
  'window',
  'Element',
  'Node',
  'getComputedStyle',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Node',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
  'getComputedStyle',
])
  globalThis[k] = dom.window[k];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, StrictMode } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { TimeField, DateTimeField, Field } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  root = undefined;
});
async function render(el) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(el));
}
const click = (el) => act(async () => el.click());
const key = (el, k) =>
  act(async () =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })),
  );
const trigger = () => host.querySelector('[role=combobox]');
const popup = () => host.querySelector('[role=dialog]');
const column = (u) => host.querySelector(`[data-time-column="${u}"]`);
const option = (u, n) => column(u).querySelector(`[data-time-option="${n}"]`);
const day = (n) => host.querySelector(`[data-calendar-day="2026-09-${n}"]`);
const d = (day = 15, hour = 9, minute = 30, second = 0) =>
  new Date(2026, 8, day, hour, minute, second);

test('SSR formatting, local serialization, Field ARIA and diagnostics for both clock fields', () => {
  for (const [Component, format, expected, model] of [
    [TimeField, 'HH:mm', '09:30', '09:30'],
    [DateTimeField, 'yyyy년 M월 d일 HH:mm', '2026년 9월 15일 09:30', '2026-09-15T09:30'],
  ]) {
    const doc = new JSDOM(
      renderToString(
        h(
          'form',
          null,
          h(
            Field,
            { required: true },
            h(Field.Label, null, 'When'),
            h(Component, { name: 'when', defaultValue: d(), format }),
          ),
        ),
      ),
    ).window.document;
    assert.match(doc.querySelector('[role=combobox]').textContent, new RegExp(expected));
    assert.equal(new doc.defaultView.FormData(doc.querySelector('form')).get('when'), model);
    assert.equal(doc.querySelector('label').htmlFor, doc.querySelector('[role=combobox]').id);
    assert.equal(doc.querySelector('[role=combobox]').getAttribute('aria-required'), 'true');
    assert.equal(doc.querySelector('button button'), null);
  }
  const shown = (props) =>
    new JSDOM(
      renderToString(h(DateTimeField, { defaultValue: d(15, 14, 5), ...props })),
    ).window.document.querySelector('[role=combobox]').textContent;
  assert.equal(shown({}), '2026.09.15 14:05', 'the locale short date and clock');
  assert.equal(shown({ locale: 'en-US' }), '09/15/2026 2:05 PM');
  assert.equal(shown({ hourCycle: '12h' }), '2026.09.15 오후 2:05');
  const empty = new JSDOM(renderToString(h(DateTimeField, {}))).window.document;
  assert.equal(empty.querySelector('[role=combobox]').textContent, '날짜와 시간 선택');
  assert.throws(() => renderToString(h(DateTimeField, { min: d(16), max: d(15) })), /min/);
  assert.equal(
    new JSDOM(
      renderToString(
        h(
          'form',
          null,
          h(DateTimeField, { name: 'at', defaultValue: d(15, 9, 30, 5), precision: 'second' }),
        ),
      ),
    ).window.document.querySelector('input[type=hidden]').value,
    '2026-09-15T09:30:05',
  );
});

test('both clock fields: prevented and real native reset, controlled empty, disabled omission', async () => {
  for (const Component of [TimeField, DateTimeField]) {
    await render(
      h(
        'form',
        null,
        h(Component, {
          key: Component.name,
          name: 'when',
          defaultValue: d(),
          hourCycle: '24h',
          today: d(),
        }),
      ),
    );
    await click(trigger());
    await click(option('hour', 10));
    await key(column('hour'), 'Escape');
    const form = host.querySelector('form');
    form.addEventListener('reset', (e) => e.preventDefault(), { once: true });
    await act(async () => form.reset());
    assert.match(host.querySelector('input[type=hidden]').value, /10:30/);
    await act(async () => {
      form.reset();
      await Promise.resolve();
    });
    assert.match(host.querySelector('input[type=hidden]').value, /09:30/);
    await render(h('form', null, h(Component, { name: 'when', value: d(), disabled: true })));
    assert.equal(new window.FormData(host.querySelector('form')).has('when'), false);
    await render(h(Component, { value: null }));
    assert.match(trigger().textContent, /선택/);
  }
});

test('the calendar keeps the clock time and the clock keeps the day', async () => {
  let value;
  await render(
    h(
      StrictMode,
      null,
      h(DateTimeField, {
        defaultValue: d(),
        today: d(),
        format: 'yyyy-MM-dd HH:mm',
        hourCycle: '24h',
        step: 15,
        onValueChange: (v) => (value = v),
      }),
    ),
  );
  await click(trigger());
  assert.equal(document.activeElement === day(15), true);
  await click(day(18));
  assert.deepEqual([value.getDate(), value.getHours(), value.getMinutes()], [18, 9, 30]);
  await click(option('hour', 14));
  assert.deepEqual([value.getDate(), value.getHours(), value.getMinutes()], [18, 14, 30]);
  assert.ok(popup(), 'the popup stays open for both halves');
  await key(column('hour'), 'Escape');
  assert.match(trigger().textContent, /2026-09-18 14:30/);
});

test('limits cover the whole moment: first and last day clamp the clock, blocked days skip', async () => {
  let value;
  await render(
    h(DateTimeField, {
      defaultValue: d(16, 12),
      today: d(),
      hourCycle: '24h',
      step: 15,
      min: d(15, 9, 35),
      max: d(18, 10, 20),
      disabled: (date) => date.getDate() === 17,
      onValueChange: (v) => (value = v),
    }),
  );
  await click(trigger());
  assert.ok(day(14).hasAttribute('data-disabled'));
  assert.ok(day(17).hasAttribute('data-disabled'));
  await click(day(18));
  assert.deepEqual([value.getHours(), value.getMinutes()], [10, 15]);
  assert.equal(option('hour', 11).getAttribute('aria-disabled'), 'true');
  await click(day(15));
  assert.equal(value.getMinutes(), 15);
  assert.equal(option('hour', 8).getAttribute('aria-disabled'), 'true');
  await click(option('hour', 9));
  assert.equal(value.getMinutes(), 45);
});

test('an empty field shows no time until one is picked, then builds it on today', async () => {
  let value;
  await render(
    h(DateTimeField, { today: d(20), hourCycle: '24h', onValueChange: (v) => (value = v) }),
  );
  await click(trigger());
  assert.equal(host.querySelector('[data-time-picker] [aria-selected=true]'), null);
  await click(option('hour', 14));
  assert.deepEqual([value.getDate(), value.getHours(), value.getMinutes()], [20, 14, 0]);
  await key(column('hour'), 'Delete');
  assert.equal(value, null, 'Delete in the clock clears the whole value');
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/New_York') {
    await key(column('hour'), 'Escape');
    await render(
      h(DateTimeField, {
        value: new Date(2026, 2, 7, 2, 30),
        today: new Date(2026, 2, 7),
        hourCycle: '24h',
        onValueChange: (v) => (value = v),
      }),
    );
    await click(trigger());
    await click(host.querySelector('[data-calendar-day="2026-03-08"]'));
    assert.notEqual(value.getHours(), 2);
  }
});

test('react-hook-form value mode for both clock fields: required focus, Date model, reset', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  for (const Component of [TimeField, DateTimeField]) {
    let methods, result;
    function App() {
      methods = useForm({ defaultValues: { when: null } });
      return h(
        FormProvider,
        methods,
        h(
          'form',
          { noValidate: true, onSubmit: methods.handleSubmit((v) => (result = v)) },
          h(
            F,
            { name: 'when', controlMode: 'value', registerOptions: { required: 'Required' } },
            h(F.Label, null, 'When'),
            h(Component, { today: d(), hourCycle: '24h' }),
            h(F.Error),
          ),
        ),
      );
    }
    await render(h(App));
    const submit = () =>
      act(async () =>
        host
          .querySelector('form')
          .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
      );
    await submit();
    assert.equal(document.activeElement === trigger(), true);
    await click(trigger());
    await click(option('hour', 10));
    await key(column('hour'), 'Escape');
    await submit();
    assert.ok(result.when instanceof Date);
    assert.equal(result.when.getHours(), 10);
    await act(async () => methods.reset());
    assert.equal(host.querySelector('input[type=hidden]'), null);
    assert.match(trigger().textContent, /선택/);
  }
});

test('a sub-second range with no representable time disables the day and the clock', async () => {
  const min = new Date(2026, 8, 15, 9, 30, 0, 1),
    max = new Date(2026, 8, 15, 9, 30, 0, 999);
  await render(h(DateTimeField, { today: d(), min, max, precision: 'second', hourCycle: '24h' }));
  await click(trigger());
  assert.ok(day(15).hasAttribute('data-disabled'));
  assert.equal(column('hour').getAttribute('aria-disabled'), 'true');
  assert.equal(popup().textContent.includes('고를 수 있는 날짜를 먼저 고르세요.'), true);
});
