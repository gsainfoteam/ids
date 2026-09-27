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
  'Node',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
  'getComputedStyle',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, StrictMode, useState } = await import('react');
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
const trigger = () => host.querySelector('[role=combobox]');
const field = () => host.querySelector('[data-date-field]');
const popup = () => host.querySelector('[role=dialog]');
const day = (key) => host.querySelector(`[data-calendar-day="${key}"]`);
const clear = () => host.querySelector('[data-temporal-clear]');
const formData = () => new window.FormData(host.querySelector('form'));
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
const d = (day, month = 9) => new Date(2026, month - 1, day);
const keyOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

test('SSR: format tokens, Intl formats, Field labelling and ISO local-date FormData', () => {
  for (const [format, locale, expected] of [
    [undefined, undefined, '2026. 09. 15.'],
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
    const combobox = doc.querySelector('[role=combobox]');
    assert.equal(combobox.textContent.includes(expected), true, `${format} → ${expected}`);
    assert.equal(doc.querySelector('label').htmlFor, combobox.id);
    assert.equal(combobox.getAttribute('aria-required'), 'true');
    assert.equal(combobox.getAttribute('aria-haspopup'), 'dialog');
    assert.equal(new doc.defaultView.FormData(doc.querySelector('form')).get('date'), '2026-09-15');
    assert.equal(doc.querySelector('button button'), null);
  }
  const empty = new JSDOM(renderToString(h(DateField, { name: 'date' }))).window.document;
  assert.equal(empty.querySelector('[role=combobox]').textContent, '날짜 선택');
  assert.ok(empty.querySelector('[data-date-field]').hasAttribute('data-empty'));
  assert.ok(empty.querySelector('[data-placeholder]'));
  assert.throws(() => renderToString(h(DateField, { format: 'YYYY-MM-DD' })), /unsupported format/);
  assert.throws(
    () => renderToString(h(DateField, { format: "yyyy 'unfinished" })),
    /unclosed quote/,
  );
  assert.throws(
    () => renderToString(h(DateField, { selectionMode: 'range', value: d(1) })),
    /range requires/,
  );
  assert.throws(
    () => renderToString(h(DateField, { format: { timeStyle: 'short' } })),
    /local date/,
  );
});

test('ArrowDown opens on the focused day, limits apply, a pick closes and Clear empties', async () => {
  const changes = [];
  await render(
    h(DateField, {
      today: d(15),
      format: 'yyyy-MM-dd',
      min: d(10),
      max: d(20),
      disabled: (date) => date.getDate() === 16,
      onValueChange: (v) => changes.push(v),
    }),
  );
  await key(trigger(), 'ArrowDown');
  assert.equal(trigger().getAttribute('aria-expanded'), 'true');
  assert.equal(trigger().getAttribute('aria-controls'), popup().id);
  assert.ok(field().hasAttribute('data-open'));
  assert.equal(document.activeElement, day('2026-09-15'));
  await click(day('2026-09-16'));
  assert.deepEqual(changes, []);
  await click(day('2026-09-18'));
  assert.deepEqual(changes.map(keyOf), ['2026-09-18']);
  assert.equal(popup(), null);
  assert.equal(document.activeElement, trigger());
  assert.match(trigger().textContent, /2026-09-18/);
  await click(clear());
  assert.deepEqual(changes.slice(1), [null]);
  assert.equal(document.activeElement, trigger());
  assert.equal(clear(), null, 'Clear only shows while there is a value');
});

test('picking the day that is already chosen closes without reporting a change', async () => {
  const changes = [];
  await render(
    h(DateField, { defaultValue: d(18), today: d(15), onValueChange: (v) => changes.push(v) }),
  );
  await click(trigger());
  assert.equal(document.activeElement, day('2026-09-18'));
  await click(day('2026-09-18'));
  assert.equal(popup(), null);
  assert.deepEqual(changes, []);
});

test('StrictMode opens on the active day; custom content keeps the close button to focus', async () => {
  await render(h(StrictMode, null, h(DateField, { today: d(15) })));
  await click(trigger());
  assert.equal(document.activeElement === day('2026-09-15'), true);
  await key(document.activeElement, 'Escape');
  assert.equal(popup(), null);
  assert.equal(document.activeElement, trigger());
  await render(
    h(StrictMode, null, h(DateField, null, h(DateField.Content, null, 'Custom content'))),
  );
  await click(trigger());
  assert.equal(popup().textContent.includes('Custom content'), true);
  assert.equal(document.activeElement?.getAttribute('aria-label'), '닫기');
  assert.equal(popup().getAttribute('aria-label'), '날짜 선택');
});

test('range stays open, a half-picked range is missing from FormData and fails required', async () => {
  let value;
  await render(
    h(
      'form',
      null,
      h(DateField, {
        selectionMode: 'range',
        today: d(15),
        name: 'trip',
        required: true,
        format: 'yyyy-MM-dd',
        monthsToShow: 2,
        onValueChange: (v) => (value = v),
      }),
    ),
  );
  assert.equal(trigger().textContent.includes('기간 선택'), true);
  await click(trigger());
  assert.equal(popup().getAttribute('aria-label'), '기간 선택');
  await click(day('2026-09-18'));
  assert.equal(value.end, null);
  assert.match(trigger().textContent, /2026-09-18 – …/);
  assert.equal(formData().get('trip'), null);
  assert.equal(host.querySelector('[data-form-value-validator]').validity.valueMissing, true);
  await click(day('2026-09-10'));
  assert.equal(keyOf(value.start), '2026-09-10');
  assert.equal(keyOf(value.end), '2026-09-18');
  assert.ok(popup(), 'a range stays open to adjust');
  assert.match(trigger().textContent, /2026-09-10 – 2026-09-18/);
  await key(day('2026-09-10'), 'Escape');
  assert.equal(popup(), null);
  assert.equal(formData().get('trip'), '2026-09-10/2026-09-18');
  assert.equal(host.querySelector('[data-form-value-validator]').validity.valueMissing, false);
});

test('multiple toggles, repeats FormData entries, and readOnly/disabled block editing', async () => {
  const view = (p) =>
    h('form', null, h(DateField, { selectionMode: 'multiple', today: d(15), name: 'dates', ...p }));
  await render(view({}));
  await click(trigger());
  await click(day('2026-09-15'));
  await click(day('2026-09-16'));
  await click(day('2026-09-17'));
  await click(day('2026-09-15'));
  assert.deepEqual(formData().getAll('dates'), ['2026-09-16', '2026-09-17']);
  await key(day('2026-09-16'), 'Escape');
  assert.equal(trigger().textContent.includes('2026. 09. 16., 2026. 09. 17.'), true);
  await click(trigger());
  await click(day('2026-09-18'));
  assert.equal(trigger().textContent.includes('2026. 09. 16., 2026. 09. 17., +1'), true);
  await key(day('2026-09-18'), 'Escape');
  await render(view({ value: [d(20)], readOnly: true }));
  await click(trigger());
  assert.equal(popup(), null);
  assert.equal(clear().disabled, true);
  assert.ok(field().hasAttribute('data-readonly'));
  assert.equal(trigger().getAttribute('aria-readonly'), 'true');
  assert.deepEqual(formData().getAll('dates'), ['2026-09-20']);
  await render(view({ value: [d(20)], disabled: true }));
  assert.equal(trigger().disabled, true);
  assert.deepEqual([...formData()], []);
});

test('native reset restores the default without reporting it, and a cancelled reset does nothing', async () => {
  const changes = [];
  await render(
    h(
      'form',
      null,
      h(
        DateField,
        {
          name: 'day',
          defaultValue: d(15),
          format: 'yyyy-MM-dd',
          onValueChange: (v) => changes.push(v),
        },
        h(DateField.Trigger, { asChild: true }, h('button', null, h(DateField.Value))),
        h(DateField.Clear),
      ),
    ),
  );
  await click(trigger());
  await click(day('2026-09-18'));
  assert.deepEqual(changes.map(keyOf), ['2026-09-18']);
  const form = host.querySelector('form');
  form.addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await act(async () => form.reset());
  assert.equal(formData().get('day'), '2026-09-18');
  await act(async () => {
    form.reset();
    await Promise.resolve();
  });
  assert.equal(formData().get('day'), '2026-09-15');
  assert.match(trigger().textContent, /2026-09-15/);
  assert.equal(changes.length, 1);
});

test('required blocks the submit until a date is picked and hands the browser focus to the trigger', async () => {
  await render(
    h('form', null, h(DateField, { name: 'day', required: true, today: d(15) }), h('button')),
  );
  const form = host.querySelector('form');
  const validator = host.querySelector('[data-form-value-validator]');
  assert.ok(validator);
  assert.equal(validator.validity.valueMissing, true);
  assert.equal(form.checkValidity(), false);
  await act(async () => validator.focus());
  assert.equal(document.activeElement, trigger(), 'the browser focus lands on the trigger');
  await click(trigger());
  await click(day('2026-09-18'));
  assert.equal(form.checkValidity(), true);
  await render(
    h('form', null, h(DateField, { name: 'day', required: true, disabled: true, today: d(15) })),
  );
  assert.equal(
    host.querySelector('form').checkValidity(),
    true,
    'a disabled field is not required',
  );
});

test('open is controllable and onBlur waits until focus leaves the field and its popup', async () => {
  const opens = [];
  let blurs = 0;
  function App() {
    const [open, setOpen] = useState(false);
    return h(
      'div',
      null,
      h(DateField, {
        today: d(15),
        open,
        onOpenChange: (next) => {
          opens.push(next);
          setOpen(next);
        },
        onBlur: () => blurs++,
      }),
      h('button', { id: 'outside' }, 'outside'),
    );
  }
  await render(h(App));
  await click(trigger());
  assert.deepEqual(opens, [true]);
  assert.ok(popup());
  assert.equal(blurs, 0, 'moving into the popup is not a blur');
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement, day('2026-09-16'));
  await act(async () => {
    const outside = host.querySelector('#outside');
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    outside.focus();
  });
  assert.deepEqual(opens, [true, false]);
  assert.equal(popup(), null);
  assert.equal(blurs, 1);
});

test('state reaches className/style functions and data attributes', async () => {
  await render(
    h(DateField, {
      defaultValue: d(15),
      invalid: true,
      required: true,
      size: 'tiny',
      variant: 'soft',
      className: (state) => (state.empty ? 'is-empty' : 'has-date'),
      style: (state) => ({ opacity: state.invalid ? 0.9 : 1 }),
    }),
  );
  assert.ok(field().className.includes('has-date'));
  assert.equal(field().style.opacity, '0.9');
  assert.equal(field().dataset.size, 'tiny');
  assert.equal(field().dataset.variant, 'soft');
  assert.ok(field().hasAttribute('data-required'));
  assert.ok(field().hasAttribute('data-invalid'));
  assert.equal(trigger().getAttribute('aria-invalid'), 'true');
});

test('react-hook-form value mode: required error focus, Date value, reset and disabled omission', async () => {
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
        { noValidate: true, onSubmit: methods.handleSubmit((v) => (result = v)) },
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
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Required');
  assert.equal(trigger().getAttribute('aria-invalid'), 'true');
  await click(trigger());
  await click(day('2026-09-18'));
  await submit();
  assert.equal(keyOf(result.date), '2026-09-18');
  await act(async () => methods.reset());
  assert.equal(trigger().textContent.includes('날짜 선택'), true);
  await act(async () => methods.setValue('date', d(20)));
  assert.match(trigger().textContent, /2026-09-20/);
  await render(h(App, { disabled: true }));
  result = undefined;
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
      width: this.hasAttribute('data-temporal-field') ? 700 : 664,
    };
  };
  try {
    for (const component of [
      h(DateField, { selectionMode: 'multiple', today: d(15) }),
      h(DateTimeField, { today: d(15) }),
    ]) {
      await render(component);
      await click(trigger());
      assert.equal(popup().style.width, '700px');
      const before = reads;
      await act(() =>
        popup().firstElementChild.dispatchEvent(new Event('scroll', { bubbles: false })),
      );
      assert.equal(reads, before);
      await key(popup(), 'Escape');
    }
  } finally {
    HTMLElement.prototype.getBoundingClientRect = original;
  }
});

test('parts: none gives Trigger and Clear, given parts are drawn as given, Trigger is always there', async () => {
  await render(h(DateField, { defaultValue: d(15) }, h(DateField.Clear, { 'aria-label': 'Wipe' })));
  assert.ok(trigger(), 'a missing Trigger is filled in');
  assert.equal(clear().getAttribute('aria-label'), 'Wipe');
  await render(h(DateField, { key: 'bare', defaultValue: d(15) }, h(DateField.Trigger)));
  assert.equal(clear(), null, 'a composed field without Clear has none');
  assert.throws(
    () =>
      renderToString(
        h(DateField, { defaultValue: d(15) }, h(DateField.Trigger, null, h(DateField.Clear))),
      ),
    /sibling of Trigger/,
  );
});

test('the chevron gives way to Clear once there is a value', async () => {
  await render(h(DateField, { today: d(15) }));
  assert.equal(trigger().querySelectorAll('svg').length, 2, 'icon and chevron while empty');
  await click(trigger());
  await click(day('2026-09-18'));
  assert.equal(trigger().querySelectorAll('svg').length, 1, 'the icon alone beside Clear');
  assert.ok(clear());
  await render(h(DateField, { key: 'no-clear', defaultValue: d(15) }, h(DateField.Trigger)));
  assert.equal(trigger().querySelectorAll('svg').length, 2, 'no Clear, so the chevron stays');
});

test('every opening starts on the month of the chosen date', async () => {
  await render(h(DateField, { defaultValue: d(15), today: d(15) }));
  await click(trigger());
  await click(host.querySelector('[data-calendar-nav=next]'));
  assert.ok(day('2026-10-15'));
  await key(popup(), 'Escape');
  await click(trigger());
  assert.equal(document.activeElement, day('2026-09-15'));
});
