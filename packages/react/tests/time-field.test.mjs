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
const { de } = await import('date-fns/locale/de');
const { TimeField } = await import('../dist/index.js');

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
const clear = () => host.querySelector('[data-temporal-clear]');
const d = (day = 15, hour = 9, minute = 30, second = 0) =>
  new Date(2026, 8, day, hour, minute, second);

test('SSR: display follows format, hourCycle and the date-fns locale; FormData follows precision', () => {
  const html = (props) =>
    new JSDOM(renderToString(h('form', null, h(TimeField, { name: 'at', ...props })))).window
      .document;
  const text = (props) =>
    html({ defaultValue: at, ...props }).querySelector('[role=combobox]').textContent;
  const at = d(15, 14, 5, 9);
  assert.equal(text({}), '오후 2:05', 'Korean expects a 12-hour clock, as CLDR does');
  assert.equal(text({ format: '12h' }), '오후 2:05', 'Korean puts the period first');
  assert.equal(text({ precision: 'second' }), '오후 2:05:09');
  assert.equal(text({ locale: 'en-US' }), '2:05 PM');
  assert.equal(text({ locale: 'en-US', format: '24h' }), '14:05');
  assert.equal(text({ locale: de }), '14:05');
  assert.equal(text({ format: 'HH:mm' }), '14:05');
  assert.equal(text({ format: 'a h:mm', locale: 'en-US' }), 'PM 2:05');
  assert.equal(text({ format: "HH'h' mm'm'" }), '14h 05m');
  assert.equal(
    text({ format: '24h', hourCycle: '12h', locale: 'en-US' }),
    '2:05 PM',
    'hourCycle wins over the 24h shorthand',
  );
  assert.equal(text({ format: (date) => `${date.getHours()}시` }), '14시');
  const form = (props) => {
    const doc = html({ defaultValue: at, ...props });
    return new doc.defaultView.FormData(doc.querySelector('form')).get('at');
  };
  assert.equal(form({ precision: 'hour' }), '14');
  assert.equal(form({}), '14:05');
  assert.equal(form({ precision: 'second' }), '14:05:09');
  const empty = html({});
  assert.equal(empty.querySelector('[role=combobox]').textContent, '시간 선택');
  assert.equal(new empty.defaultView.FormData(empty.querySelector('form')).get('at'), null);
  assert.throws(() => text({ format: 'HH:mm j' }), /unescaped latin alphabet/);
  assert.throws(() => text({ locale: 'de-DE' }), /no built-in date-fns locale/);
});

test('StrictMode: ArrowDown focuses the first column, picks stay open, Escape and Clear', async () => {
  const changes = [];
  await render(
    h(
      StrictMode,
      null,
      h(TimeField, {
        defaultValue: d(),
        format: 'HH:mm',
        hourCycle: '24h',
        onValueChange: (v) => changes.push(v),
      }),
    ),
  );
  await key(trigger(), 'ArrowDown');
  assert.equal(document.activeElement === column('hour'), true);
  await click(option('hour', 14));
  await click(option('minute', 45));
  assert.deepEqual(
    changes.map((v) => [v.getHours(), v.getMinutes()]),
    [
      [14, 30],
      [14, 45],
    ],
  );
  assert.ok(popup(), 'the popup stays open while the time is adjusted');
  await key(column('minute'), 'Escape');
  assert.equal(popup(), null);
  assert.equal(document.activeElement === trigger(), true);
  assert.match(trigger().textContent, /14:45/);
  await click(clear());
  assert.equal(changes.at(-1), null);
  assert.equal(trigger().textContent, '시간 선택');
});

test('Delete inside the picker clears the field too', async () => {
  const changes = [];
  await render(
    h(TimeField, { defaultValue: d(), hourCycle: '24h', onValueChange: (v) => changes.push(v) }),
  );
  await click(trigger());
  await key(column('hour'), 'Delete');
  assert.deepEqual(changes, [null]);
  assert.equal(host.querySelector('[aria-selected=true]'), null);
});

test('an empty field builds the picked time on referenceDate', async () => {
  let value;
  await render(
    h(TimeField, {
      hourCycle: '24h',
      referenceDate: new Date(2030, 0, 2),
      onValueChange: (v) => (value = v),
    }),
  );
  await click(trigger());
  await click(option('hour', 8));
  assert.deepEqual(
    [value.getFullYear(), value.getMonth(), value.getDate(), value.getHours()],
    [2030, 0, 2, 8],
  );
});

test('custom parts, readOnly, and a native onClick that prevents opening', async () => {
  await render(
    h(
      TimeField,
      { defaultValue: d(), readOnly: true },
      h(TimeField.Trigger, { asChild: true }, h('button', null, h(TimeField.Value))),
      h(TimeField.Clear),
    ),
  );
  await click(trigger());
  assert.equal(popup(), null);
  assert.equal(clear().disabled, true);
  await render(h(TimeField, { onClick: (e) => e.preventDefault() }));
  await click(trigger());
  assert.equal(popup(), null);
  await render(h(TimeField, null, h(TimeField.Content, null, 'Custom time controls')));
  await click(trigger());
  assert.equal(popup().textContent.includes('Custom time controls'), true);
  assert.equal(document.activeElement?.getAttribute('aria-label'), '닫기');
  assert.equal(popup().getAttribute('aria-label'), '시간 선택');
});

test('required and native reset go through the hidden form value', async () => {
  const changes = [];
  await render(
    h(
      'form',
      null,
      h(TimeField, {
        name: 'at',
        required: true,
        hourCycle: '24h',
        onValueChange: (v) => changes.push(v),
      }),
    ),
  );
  const form = host.querySelector('form');
  assert.equal(form.checkValidity(), false);
  await click(trigger());
  await click(option('hour', 7));
  assert.equal(form.checkValidity(), true);
  assert.equal(new window.FormData(form).get('at'), '07:00');
  await act(async () => {
    form.reset();
    await Promise.resolve();
  });
  assert.equal(new window.FormData(form).get('at'), null);
  assert.equal(popup(), null, 'a reset also closes the popup');
  assert.equal(changes.length, 1, 'the reset is not reported as a change');
});
