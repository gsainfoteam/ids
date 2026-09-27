import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Event', 'MouseEvent'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Checkbox, Field } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
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

const input = (index = 0) => host.querySelectorAll('input[type=checkbox]')[index];
const box = (index = 0) => input(index).closest('[data-checkbox]');
const click = (node = input()) => act(async () => node.click());

test('SSR: one native checkbox carries the form and ARIA props, the box carries the state', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { size: 'tiny', invalid: true, required: true },
          h(Field.Label, null, 'Terms'),
          h(Checkbox, { name: 'terms', value: 'yes', defaultChecked: true }),
          h(Field.Error, null, 'Required'),
        ),
        h(Checkbox, { 'aria-label': 'Mixed', defaultChecked: 'indeterminate' }),
      ),
    ),
  ).window.document;
  const [terms, mixed] = doc.querySelectorAll('input');
  assert.equal(terms.type, 'checkbox');
  assert.equal(terms.checked, true);
  assert.equal(terms.required, true);
  assert.equal(terms.getAttribute('aria-invalid'), 'true');
  assert.equal(doc.querySelector('label').htmlFor, terms.id);
  assert.equal(doc.getElementById(terms.getAttribute('aria-describedby')).textContent, 'Required');
  const termsBox = terms.closest('[data-checkbox]');
  assert.equal(termsBox.dataset.state, 'checked');
  assert.equal(termsBox.dataset.size, 'tiny');
  assert.ok(termsBox.hasAttribute('data-invalid'));
  assert.ok(termsBox.hasAttribute('data-required'));
  assert.equal(termsBox.querySelector('[data-state] svg') !== null, true, 'a check glyph is drawn');
  assert.equal(mixed.closest('[data-checkbox]').dataset.state, 'indeterminate');
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [['terms', 'yes']],
  );
});

test('uncontrolled: a click toggles, indeterminate turns checked, onCheckedChange gets booleans', async () => {
  const changes = [];
  await render(
    h(Checkbox, {
      'aria-label': 'Mixed',
      defaultChecked: 'indeterminate',
      onCheckedChange: (next) => changes.push(next),
    }),
  );
  assert.equal(input().indeterminate, true);
  assert.equal(input().checked, false);
  await click();
  assert.equal(input().indeterminate, false);
  assert.equal(input().checked, true);
  assert.equal(box().dataset.state, 'checked');
  await click();
  assert.equal(box().dataset.state, 'unchecked');
  assert.deepEqual(changes, [true, false]);
});

test('controlled: a parent that keeps the mixed state keeps it after a click', async () => {
  const changes = [];
  await render(
    h(Checkbox, {
      'aria-label': 'Fixed',
      checked: 'indeterminate',
      onCheckedChange: (next) => changes.push(next),
    }),
  );
  await click();
  assert.deepEqual(changes, [true]);
  assert.equal(input().indeterminate, true, 'the flag the browser cleared is restored');
  assert.equal(input().checked, false);
  assert.equal(box().dataset.state, 'indeterminate');
  let set;
  function Parent() {
    const [checked, setChecked] = useState(false);
    set = setChecked;
    return h(Checkbox, { 'aria-label': 'Parent', checked, onCheckedChange: setChecked });
  }
  await render(h('div', { key: 'parent' }, h(Parent)));
  await act(async () => set('indeterminate'));
  assert.equal(input().indeterminate, true);
  await click();
  assert.equal(input().indeterminate, false);
  assert.equal(box().dataset.state, 'checked');
});

test('readOnly and a prevented click leave the value alone and report nothing', async () => {
  const changes = [];
  const events = [];
  await render(
    h(Checkbox, {
      'aria-label': 'Locked',
      readOnly: true,
      defaultChecked: true,
      onCheckedChange: (next) => changes.push(next),
      onChange: () => events.push('change'),
    }),
  );
  assert.equal(input().getAttribute('aria-readonly'), 'true');
  assert.equal(input().hasAttribute('readonly'), false, 'readonly is not valid on a checkbox');
  await click();
  assert.equal(input().checked, true);
  assert.equal(box().dataset.state, 'checked');
  await render(
    h('div', { key: 'veto' }, [
      h(Checkbox, {
        key: 'veto',
        'aria-label': 'Veto',
        onClick: (event) => event.preventDefault(),
        onCheckedChange: (next) => changes.push(next),
      }),
    ]),
  );
  await click();
  assert.equal(input().checked, false);
  assert.equal(box().dataset.state, 'unchecked');
  assert.deepEqual(changes, []);
  assert.deepEqual(events, []);
});

test('a direct write to input.checked (react-hook-form setValue) reaches state', async () => {
  const changes = [];
  await render(
    h(Checkbox, { 'aria-label': 'Agree', onCheckedChange: (next) => changes.push(next) }),
  );
  await act(async () => {
    input().checked = true;
    await Promise.resolve();
  });
  assert.equal(box().dataset.state, 'checked');
  assert.deepEqual(changes, [true]);
  await click();
  assert.deepEqual(changes, [true, false], 'React’s own writes are not reported back');
});

test('form reset: uncontrolled returns to defaultChecked, controlled keeps its parent value', async () => {
  const changes = [];
  await render(
    h(
      'form',
      null,
      h(Checkbox, {
        'aria-label': 'News',
        name: 'news',
        defaultChecked: 'indeterminate',
        onCheckedChange: (next) => changes.push(next),
      }),
      h(Checkbox, { 'aria-label': 'Held', name: 'held', checked: true, onCheckedChange() {} }),
    ),
  );
  const form = host.querySelector('form');
  await click(input(0));
  assert.deepEqual(
    [...new window.FormData(form)],
    [
      ['news', 'on'],
      ['held', 'on'],
    ],
  );
  await act(async () => {
    form.reset();
    await Promise.resolve();
  });
  assert.equal(box(0).dataset.state, 'indeterminate');
  assert.equal(input(0).indeterminate, true);
  assert.equal(input(0).checked, false);
  assert.equal(input(1).checked, true, 'the controlled box is written back to its value');
  assert.deepEqual([...new window.FormData(form)], [['held', 'on']]);
  assert.deepEqual(changes, [true], 'a reset is not an edit, like a native checkbox');
});

test('react-hook-form register(): error, click, setValue and reset all show on the box', async () => {
  const { Field: RhfField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods;
  function App() {
    methods = useForm({ defaultValues: { terms: false } });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        { name: 'terms', registerOptions: { required: 'Agree first' } },
        h(RhfField.Label, null, 'Terms'),
        h(Checkbox),
        h(RhfField.Error),
      ),
    );
  }
  await render(h(App));
  await act(async () => methods.trigger('terms', { shouldFocus: true }));
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Agree first');
  assert.equal(document.activeElement, input());
  assert.ok(box().hasAttribute('data-invalid'));
  await click();
  assert.equal(methods.getValues('terms'), true);
  await act(async () => {
    methods.setValue('terms', false);
    await Promise.resolve();
  });
  assert.equal(box().dataset.state, 'unchecked');
  await act(async () => {
    methods.reset({ terms: true });
    await Promise.resolve();
  });
  assert.equal(box().dataset.state, 'checked');
  assert.equal(input().checked, true);
});

test('react-hook-form controlMode="checked" binds onCheckedChange', async () => {
  const { Field: RhfField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods;
  function App() {
    methods = useForm({ defaultValues: { alerts: true } });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        { name: 'alerts', controlMode: 'checked' },
        h(RhfField.Label, null, 'Alerts'),
        h(Checkbox),
      ),
    );
  }
  await render(h(App));
  assert.equal(box().dataset.state, 'checked');
  await click();
  assert.equal(methods.getValues('alerts'), false);
  assert.equal(box().dataset.state, 'unchecked');
});

test('Indicator: default glyphs, asChild, state functions and misuse', async () => {
  await render(
    h(
      'div',
      null,
      h(Checkbox, { 'aria-label': 'Default', defaultChecked: 'indeterminate' }),
      h(
        Checkbox,
        {
          'aria-label': 'Custom',
          defaultChecked: true,
          className: (state) => (state.checked ? 'is-on' : 'is-off'),
          style: (state) => ({ opacity: state.checked ? 1 : 0.5 }),
        },
        h(Checkbox.Indicator, { asChild: true }, h('svg', { 'data-heart': '' })),
      ),
      h(
        Checkbox,
        { 'aria-label': 'Function' },
        h(Checkbox.Indicator, null, (state) => (state.checked ? 'on' : 'off')),
      ),
    ),
  );
  const glyph = box(0).querySelector('[aria-hidden=true]');
  assert.equal(glyph.dataset.state, 'indeterminate');
  assert.ok(glyph.querySelector('svg'));
  const heart = box(1).querySelector('[data-heart]');
  assert.equal(heart.getAttribute('aria-hidden'), 'true');
  assert.equal(heart.dataset.state, 'checked');
  assert.ok(box(1).className.includes('is-on'));
  assert.equal(box(1).style.opacity, '1');
  await click(input(1));
  assert.equal(heart.dataset.state, 'unchecked');
  assert.ok(box(1).className.includes('is-off'));
  assert.equal(box(2).textContent, 'off');
  await click(input(2));
  assert.equal(box(2).textContent, 'on');
  assert.throws(() => renderToString(h(Checkbox.Indicator)), /inside Checkbox/);
  assert.throws(
    () =>
      renderToString(h(Checkbox, { checked: true, defaultChecked: false, onCheckedChange() {} })),
    /not both/,
  );
});
