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
const { createElement: h, act, StrictMode } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { DateField, Field } = await import('../dist/index.js');
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
const trigger = () => host.querySelector('[role=combobox]');
const day = (key) => host.querySelector(`[data-calendar-day="${key}"]`);
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
const d = (day) => new Date(2026, 8, day);
const keyOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
test('SSR format tokens, Intl format, Field ARIA and ISO local-date serialization', () => {
  for (const [format, locale, expected] of [
    ['yyyy-MM-dd', 'ko-KR', '2026-09-15'],
    ['yyyy년 M월 d일', 'ko-KR', '2026년 9월 15일'],
    ["EEE, MMM d 'at home'", 'en-US', 'Tue, Sep 15 at home'],
    [{ dateStyle: 'long' }, 'en-US', 'September 15, 2026'],
  ]) {
    const doc = new JSDOM(
      renderToString(
        h(
          'form',
          null,
          h(
            Field,
            { required: true },
            h(Field.Label, null, 'Date'),
            h(DateField, { name: 'date', defaultValue: d(15), format, locale }),
          ),
        ),
      ),
    ).window.document;
    assert.equal(doc.querySelector('[role=combobox]').textContent.includes(expected), true);
    assert.equal(doc.querySelector('label').htmlFor, doc.querySelector('[role=combobox]').id);
    assert.equal(doc.querySelector('[role=combobox]').getAttribute('aria-required'), 'true');
    assert.equal(new doc.defaultView.FormData(doc.querySelector('form')).get('date'), '2026-09-15');
    assert.equal(doc.querySelector('button button'), null);
  }
  assert.throws(() => renderToString(h(DateField, { format: 'YYYY-MM-DD' })), /unsupported format/);
  assert.throws(
    () => renderToString(h(DateField, { format: "yyyy 'unfinished" })),
    /unclosed quote/,
  );
});
test('keyboard opens focused calendar, date limits apply, single closes and Clear restores focus', async () => {
  let value;
  await render(
    h(DateField, {
      today: d(15),
      format: 'yyyy-MM-dd',
      min: d(10),
      max: d(20),
      disabled: (date) => date.getDate() === 16,
      onChange: (v) => (value = v),
    }),
  );
  await key(trigger(), 'ArrowDown');
  assert.equal(document.activeElement, day('2026-09-15'));
  await click(day('2026-09-16'));
  assert.equal(value, undefined);
  await click(day('2026-09-18'));
  assert.equal(keyOf(value), '2026-09-18');
  assert.equal(host.querySelector('[role=dialog]'), null);
  assert.equal(document.activeElement, trigger());
  assert.match(trigger().textContent, /2026-09-18/);
  await click(host.querySelector('[aria-label="날짜 지우기"]'));
  assert.equal(value, null);
  assert.equal(document.activeElement, trigger());
});
test('StrictMode popup opens on its active day and custom content retains a focus fallback', async () => {
  await render(h(StrictMode, null, h(DateField, { today: d(15) })));
  await click(trigger());
  assert.equal(document.activeElement === day('2026-09-15'), true);
  await key(document.activeElement, 'Escape');
  await render(
    h(StrictMode, null, h(DateField, null, h(DateField.Content, null, 'Custom content'))),
  );
  await click(trigger());
  assert.equal(document.activeElement?.getAttribute('aria-label'), '날짜 선택 닫기');
});
test('range stays open, serializes partial/full values and Escape preserves selection', async () => {
  let value;
  await render(
    h(
      'form',
      null,
      h(DateField, {
        selectionMode: 'range',
        today: d(15),
        name: 'trip',
        format: 'yyyy-MM-dd',
        monthsToShow: 2,
        onChange: (v) => (value = v),
      }),
    ),
  );
  await click(trigger());
  await click(day('2026-09-18'));
  assert.equal(value.end, null);
  assert.equal(new window.FormData(host.querySelector('form')).get('trip'), '2026-09-18/');
  await click(day('2026-09-10'));
  assert.equal(keyOf(value.start), '2026-09-10');
  assert.equal(keyOf(value.end), '2026-09-18');
  assert.ok(host.querySelector('[role=dialog]'));
  await key(day('2026-09-10'), 'Escape');
  assert.equal(host.querySelector('[role=dialog]'), null);
  assert.equal(
    new window.FormData(host.querySelector('form')).get('trip'),
    '2026-09-10/2026-09-18',
  );
});
test('multiple toggles, repeated native values, controlled updates, disabled and readonly', async () => {
  const view = (p) =>
    h('form', null, h(DateField, { selectionMode: 'multiple', today: d(15), name: 'dates', ...p }));
  await render(view({}));
  await click(trigger());
  await click(day('2026-09-15'));
  await click(day('2026-09-16'));
  await click(day('2026-09-15'));
  assert.deepEqual(new window.FormData(host.querySelector('form')).getAll('dates'), ['2026-09-16']);
  await key(day('2026-09-16'), 'Escape');
  await render(view({ value: [d(20)], readOnly: true }));
  await click(trigger());
  assert.equal(host.querySelector('[role=dialog]'), null);
  assert.equal(host.querySelector('[aria-label="날짜 지우기"]').disabled, true);
  assert.deepEqual(new window.FormData(host.querySelector('form')).getAll('dates'), ['2026-09-20']);
  await render(view({ value: [d(20)], disabled: true }));
  assert.equal(trigger().disabled, true);
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], []);
});
test('native reset and prevented reset, composed trigger/value and custom content', async () => {
  await render(
    h(
      'form',
      null,
      h(
        DateField,
        { name: 'day', defaultValue: d(15), format: 'yyyy-MM-dd' },
        h(DateField.Trigger, { asChild: true }, h('button', null, h(DateField.Value))),
        h(DateField.Clear),
      ),
    ),
  );
  await click(trigger());
  await click(day('2026-09-18'));
  host.querySelector('form').addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await act(async () => host.querySelector('form').reset());
  assert.equal(host.querySelector('[type=hidden]').value, '2026-09-18');
  await act(async () => host.querySelector('form').reset());
  assert.equal(host.querySelector('[type=hidden]').value, '2026-09-15');
});
test('RHF required validation, trigger focus, Date value, reset and disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { date: null } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'date',
            controlMode: 'value',
            disabled,
            registerOptions: { required: 'Required' },
          },
          h(F.Label, null, 'Date'),
          h(DateField, { today: d(15), format: 'yyyy-MM-dd' }),
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
  assert.equal(document.activeElement, trigger());
  await click(trigger());
  await click(day('2026-09-18'));
  await submit();
  assert.equal(keyOf(result.date), '2026-09-18');
  await act(async () => methods.reset());
  assert.equal(host.querySelector('[type=hidden]').value, '');
  await act(async () => methods.setValue('date', d(20)));
  assert.match(trigger().textContent, /2026-09-20/);
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.date, undefined);
});

test('popup width is anchored to the whole field and ignores descendant scrolls', async () => {
  const { DateTimeField } = await import('../dist/index.js');
  const original = HTMLElement.prototype.getBoundingClientRect;
  let reads = 0;
  HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.hasAttribute('data-field-popup')) return { height: 300 };
    reads++;
    return {
      left: 40,
      top: 100,
      bottom: 144,
      width:
        this.hasAttribute('data-date-field') || this.hasAttribute('data-temporal-field')
          ? 700
          : 664,
    };
  };
  try {
    for (const component of [
      h(DateField, { selectionMode: 'multiple', today: d(15) }),
      h(DateTimeField, { today: d(15) }),
    ]) {
      await render(component);
      await click(trigger());
      const popup = host.querySelector('[role=dialog]');
      assert.equal(popup.style.width, '700px');
      const before = reads;
      await act(() =>
        popup.firstElementChild.dispatchEvent(new Event('scroll', { bubbles: false })),
      );
      assert.equal(reads, before);
      await key(popup, 'Escape');
    }
  } finally {
    HTMLElement.prototype.getBoundingClientRect = original;
  }
});
