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
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, Switch } = await import('../dist/index.js');

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

const input = () => host.querySelector('input');
const track = () => host.querySelector('[data-switch]');
const thumb = () => track().querySelector('[aria-hidden=true]');
const click = () => act(async () => input().click());

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('SSR: a native checkbox with role="switch", labelled by Field, className on the track', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        Field,
        { size: 'tiny', variant: 'horizontal' },
        h(Field.Label, null, 'Dark mode'),
        h(Switch, { name: 'dark', defaultChecked: true, className: 'my-track' }),
        h(Field.Description, null, 'Applies at once'),
      ),
    ),
  ).window.document;
  const control = doc.querySelector('input');
  assert.equal(control.type, 'checkbox');
  assert.equal(control.getAttribute('role'), 'switch');
  assert.equal(control.checked, true);
  assert.equal(doc.querySelector('label').htmlFor, control.id);
  assert.equal(
    doc.getElementById(control.getAttribute('aria-describedby')).textContent,
    'Applies at once',
  );
  const root = doc.querySelector('[data-switch]');
  assert.ok(root.className.includes('my-track'));
  assert.ok(!control.className.includes('my-track'));
  assert.equal(root.dataset.state, 'checked');
  assert.equal(root.dataset.size, 'tiny');
  assert.equal(root.querySelector('[aria-hidden=true]').dataset.state, 'checked');
});

test('a click toggles and reports; readOnly and invalid are exposed', async () => {
  const changes = [];
  await render(
    h(Switch, { 'aria-label': 'Alerts', onCheckedChange: (next) => changes.push(next) }),
  );
  await click();
  assert.equal(track().dataset.state, 'checked');
  assert.equal(thumb().dataset.state, 'checked');
  await click();
  assert.deepEqual(changes, [true, false]);
  await render(
    h('div', { key: 'locked' }, [
      h(Switch, {
        key: 'locked',
        'aria-label': 'Locked',
        readOnly: true,
        invalid: true,
        defaultChecked: true,
        onCheckedChange: (next) => changes.push(next),
      }),
    ]),
  );
  await click();
  assert.equal(input().checked, true);
  assert.equal(input().getAttribute('aria-readonly'), 'true');
  assert.equal(input().getAttribute('aria-invalid'), 'true');
  assert.ok(track().hasAttribute('data-invalid'));
  assert.deepEqual(changes, [true, false]);
});

test('native form: name/value submit only when on, reset returns to defaultChecked silently', async () => {
  const changes = [];
  await render(
    h(
      'form',
      null,
      h(Switch, {
        'aria-label': 'Autosave',
        name: 'autosave',
        value: 'yes',
        defaultChecked: true,
        onCheckedChange: (next) => changes.push(next),
      }),
    ),
  );
  const form = host.querySelector('form');
  assert.deepEqual([...new window.FormData(form)], [['autosave', 'yes']]);
  await click();
  assert.deepEqual([...new window.FormData(form)], []);
  await act(async () => {
    form.reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.equal(track().dataset.state, 'checked');
  assert.equal(input().checked, true);
  assert.deepEqual(changes, [false]);
});

test('Switch.Thumb: asChild, state functions, and use outside Switch', async () => {
  await render(
    h(
      Switch,
      { 'aria-label': 'Theme', style: (state) => ({ opacity: state.checked ? 1 : 0.8 }) },
      h(
        Switch.Thumb,
        { asChild: true, className: (state) => (state.checked ? 'moon' : 'sun') },
        h('i', { 'data-glyph': '' }),
      ),
    ),
  );
  const glyph = host.querySelector('[data-glyph]');
  assert.equal(glyph.getAttribute('aria-hidden'), 'true');
  assert.ok(glyph.className.includes('sun'));
  assert.equal(track().style.opacity, '0.8');
  await click();
  assert.ok(glyph.className.includes('moon'));
  assert.equal(glyph.dataset.state, 'checked');
  assert.equal(track().style.opacity, '1');
  assert.throws(() => renderToString(h(Switch.Thumb)), /inside Switch/);
});

test('react-hook-form: register() and controlMode="checked" both drive the thumb', async () => {
  const { Field: RhfField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  for (const controlMode of ['native', 'checked']) {
    let methods;
    function App() {
      methods = useForm({ defaultValues: { autoSave: true } });
      return h(
        FormProvider,
        methods,
        h(
          RhfField,
          { name: 'autoSave', controlMode },
          h(RhfField.Label, null, 'Autosave'),
          h(Switch),
        ),
      );
    }
    await render(h('div', { key: controlMode }, h(App)));
    assert.equal(thumb().dataset.state, 'checked', `${controlMode}: the default shows at once`);
    await click();
    assert.equal(methods.getValues('autoSave'), false, controlMode);
    await act(async () => {
      methods.setValue('autoSave', true);
      await Promise.resolve();
    });
    assert.equal(thumb().dataset.state, 'checked', controlMode);
  }
});

test('react-hook-form register(): reset() after the user toggled shows on the thumb', async () => {
  const { Field: RhfField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods;
  function App() {
    methods = useForm({ defaultValues: { autoSave: true } });
    return h(
      FormProvider,
      methods,
      h(RhfField, { name: 'autoSave' }, h(RhfField.Label, null, 'Autosave'), h(Switch)),
    );
  }
  await render(h(App));
  await click();
  await act(async () => methods.handleSubmit(() => {})());
  await click();
  assert.equal(thumb().dataset.state, 'checked');
  await act(async () => {
    methods.reset({ autoSave: false });
    await Promise.resolve();
  });
  assert.equal(input().checked, false);
  assert.equal(thumb().dataset.state, 'unchecked');
});
