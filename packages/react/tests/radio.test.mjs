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
const { Field, Radio } = await import('../dist/index.js');

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

const radio = (value) => host.querySelector(`input[value="${value}"]`);
const stateOf = (value) => radio(value).closest('[data-radio]').dataset.state;
const click = (value) => act(async () => radio(value).click());

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('SSR: a native radio in a drawn circle, labelled by Field', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        Field,
        { size: 'tiny', invalid: true },
        h(Field.Label, null, 'Express'),
        h(Radio, { name: 'shipping', value: 'express', defaultChecked: true }),
      ),
    ),
  ).window.document;
  const input = doc.querySelector('input');
  assert.equal(input.type, 'radio');
  assert.equal(input.name, 'shipping');
  assert.equal(input.checked, true);
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.equal(doc.querySelector('label').htmlFor, input.id);
  const circle = input.closest('[data-radio]');
  assert.equal(circle.dataset.state, 'checked');
  assert.equal(circle.dataset.size, 'tiny');
  assert.ok(circle.hasAttribute('data-invalid'));
  assert.equal(circle.querySelector('[aria-hidden=true]').dataset.state, 'checked');
  assert.ok(
    input.classList.contains('rounded-[inherit]'),
    'the input takes the corners drawn on the circle, so a restyled shape answers everywhere',
  );
});

test('uncontrolled radios sharing a name: choosing one un-marks its groupmate', async () => {
  const changes = [];
  const track = (value) => (next) => changes.push(`${value}:${next}`);
  await render(
    h(
      'form',
      null,
      h(Radio, { name: 'ship', value: 'a', defaultChecked: true, onCheckedChange: track('a') }),
      h(Radio, { name: 'ship', value: 'b', onCheckedChange: track('b') }),
      h(Radio, { name: 'other', value: 'c', defaultChecked: true }),
    ),
  );
  await click('b');
  assert.equal(stateOf('b'), 'checked');
  assert.equal(stateOf('a'), 'unchecked');
  assert.equal(stateOf('c'), 'checked', 'another group is left alone');
  assert.deepEqual(changes, ['b:true', 'a:false']);
  const form = host.querySelector('form');
  assert.deepEqual(
    [...new window.FormData(form)],
    [
      ['ship', 'b'],
      ['other', 'c'],
    ],
  );
  await act(async () => {
    form.reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.equal(stateOf('a'), 'checked');
  assert.equal(stateOf('b'), 'unchecked');
  assert.deepEqual(changes, ['b:true', 'a:false'], 'a reset reports nothing');
  await click('b');
  assert.equal(stateOf('b'), 'checked', 'the radio checked before the reset can be chosen again');
  assert.equal(stateOf('a'), 'unchecked');
  assert.deepEqual(changes, ['b:true', 'a:false', 'b:true', 'a:false']);
});

test('controlled: the parent decides, and readOnly never selects', async () => {
  const changes = [];
  function Parent({ follow }) {
    const [checked, setChecked] = useState(false);
    return h(Radio, {
      value: 'x',
      'aria-label': 'X',
      checked,
      onCheckedChange: (next) => {
        changes.push(next);
        if (follow) setChecked(next);
      },
    });
  }
  await render(h(Parent, { follow: false }));
  await click('x');
  assert.equal(radio('x').checked, false);
  assert.equal(stateOf('x'), 'unchecked');
  await render(h('div', { key: 'follow' }, h(Parent, { follow: true })));
  await click('x');
  assert.equal(stateOf('x'), 'checked');
  assert.deepEqual(changes, [true, true]);
  await render(
    h('div', { key: 'readonly' }, [
      h(Radio, {
        key: 'r',
        value: 'r',
        'aria-label': 'R',
        readOnly: true,
        onCheckedChange: () => changes.push('readonly'),
      }),
    ]),
  );
  await click('r');
  assert.equal(radio('r').checked, false);
  assert.equal(stateOf('r'), 'unchecked');
  assert.deepEqual(changes, [true, true]);
});

test('react-hook-form register() on each radio: default, click and setValue show', async () => {
  const { useForm } = await import('react-hook-form');
  let methods;
  function App() {
    methods = useForm({ defaultValues: { plan: 'free' } });
    return h(
      'div',
      null,
      h(Radio, { ...methods.register('plan'), value: 'free', 'aria-label': 'Free' }),
      h(Radio, { ...methods.register('plan'), value: 'pro', 'aria-label': 'Pro' }),
    );
  }
  await render(h(App));
  assert.equal(stateOf('free'), 'checked');
  await click('pro');
  assert.equal(methods.getValues('plan'), 'pro');
  assert.equal(stateOf('free'), 'unchecked');
  await act(async () => {
    methods.setValue('plan', 'free');
    await Promise.resolve();
  });
  assert.equal(stateOf('free'), 'checked');
  assert.equal(stateOf('pro'), 'unchecked');
});

test('Radio.Indicator: asChild, state functions and misuse', async () => {
  await render(
    h(
      Radio,
      { value: 'star', 'aria-label': 'Star', className: (state) => (state.checked ? 'on' : 'off') },
      h(Radio.Indicator, { asChild: true }, h('svg', { 'data-star': '' })),
    ),
  );
  const star = host.querySelector('[data-star]');
  assert.equal(star.getAttribute('aria-hidden'), 'true');
  assert.equal(star.dataset.state, 'unchecked');
  assert.ok(host.querySelector('[data-radio]').className.includes('off'));
  await click('star');
  assert.equal(star.dataset.state, 'checked');
  assert.ok(host.querySelector('[data-radio]').className.includes('on'));
  assert.throws(() => renderToString(h(Radio.Indicator)), /inside Radio/);
  assert.throws(
    () => renderToString(h(Radio, { checked: true, defaultChecked: true, onCheckedChange() {} })),
    /not both/,
  );
});
