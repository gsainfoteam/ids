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
const { Field, Radio, RadioGroup } = await import('../dist/index.js');

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

const plans = ['free', 'pro', 'team'];
const items = ({ Item }) =>
  plans.map((plan) => h(Item, { key: plan, value: plan, 'aria-label': plan }));
const group = () => host.querySelector('[role=radiogroup]');
const radio = (value) => host.querySelector(`input[value="${value}"]`);
const stateOf = (value) => radio(value).closest('[data-radio]').dataset.state;
const click = (value) => act(async () => radio(value).click());

test('SSR: a radiogroup root labelled by Field, radios sharing one name and the group settings', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { size: 'tiny', required: true, invalid: true },
          h(Field.Label, null, 'Plan'),
          h(Field.Description, null, 'Change it any time'),
          h(RadioGroup, { name: 'plan', defaultValue: 'pro', orientation: 'horizontal' }, items),
        ),
      ),
    ),
  ).window.document;
  const root = doc.querySelector('[role=radiogroup]');
  const label = doc.querySelector('label');
  assert.equal(label.htmlFor, root.id, 'the id stays on the group');
  assert.equal(root.getAttribute('aria-labelledby'), label.id);
  assert.equal(
    doc.getElementById(root.getAttribute('aria-describedby')).textContent,
    'Change it any time',
  );
  assert.equal(root.getAttribute('aria-orientation'), 'horizontal');
  assert.equal(root.getAttribute('aria-required'), 'true');
  assert.equal(root.getAttribute('aria-invalid'), 'true');
  const radios = [...doc.querySelectorAll('input[type=radio]')];
  assert.deepEqual(
    radios.map((input) => [input.name, input.required, input.checked]),
    [
      ['plan', true, false],
      ['plan', true, true],
      ['plan', true, false],
    ],
  );
  assert.ok(radios.every((input) => input.closest('[data-radio]').dataset.size === 'tiny'));
  assert.ok(radios.every((input) => input.closest('[data-radio]').hasAttribute('data-invalid')));
  assert.deepEqual([...new doc.defaultView.FormData(doc.querySelector('form'))], [['plan', 'pro']]);
});

test('uncontrolled selection, controlled parent value, and no echo of outside changes', async () => {
  const changes = [];
  await render(
    h(RadioGroup, { 'aria-label': 'Plan', onValueChange: (next) => changes.push(next) }, items),
  );
  assert.equal(stateOf('free'), 'unchecked', 'nothing is selected without a default');
  await click('team');
  assert.equal(stateOf('team'), 'checked');
  await click('pro');
  assert.equal(stateOf('team'), 'unchecked');
  assert.deepEqual(changes, ['team', 'pro']);
  let set;
  function Parent() {
    const [value, setValue] = useState('free');
    set = setValue;
    return h(
      RadioGroup,
      { 'aria-label': 'Plan', value, onValueChange: (next) => changes.push(next) },
      items,
    );
  }
  await render(h('div', { key: 'parent' }, h(Parent)));
  await click('pro');
  assert.equal(radio('free').checked, true, 'a parent that does not follow keeps its value');
  assert.equal(stateOf('pro'), 'unchecked');
  await act(async () => set('team'));
  assert.equal(stateOf('team'), 'checked');
  assert.deepEqual(changes, ['team', 'pro', 'pro']);
});

test('readOnly keeps the value, disabled turns every radio off, an item can opt out alone', async () => {
  const changes = [];
  await render(
    h(
      RadioGroup,
      {
        'aria-label': 'Plan',
        readOnly: true,
        defaultValue: 'free',
        onValueChange: (next) => changes.push(next),
      },
      items,
    ),
  );
  assert.equal(group().getAttribute('aria-readonly'), 'true');
  await click('pro');
  assert.equal(radio('free').checked, true);
  assert.equal(stateOf('pro'), 'unchecked');
  assert.deepEqual(changes, []);
  await render(
    h('div', { key: 'disabled' }, h(RadioGroup, { 'aria-label': 'Plan', disabled: true }, items)),
  );
  assert.ok(plans.every((plan) => radio(plan).disabled));
  await render(
    h(
      'div',
      { key: 'item' },
      h(RadioGroup, { 'aria-label': 'Plan' }, ({ Item }) => [
        h(Item, { key: 'free', value: 'free', 'aria-label': 'free' }),
        h(Item, { key: 'pro', value: 'pro', 'aria-label': 'pro', disabled: true }),
      ]),
    ),
  );
  assert.deepEqual([radio('free').disabled, radio('pro').disabled], [false, true]);
});

test('focus on the root goes to the checked radio, else the first enabled one', async () => {
  let ref;
  await render(
    h(
      RadioGroup,
      {
        'aria-label': 'Plan',
        ref: (node) => {
          ref = node;
        },
      },
      ({ Item }) => [
        h(Item, { key: 'free', value: 'free', 'aria-label': 'free', disabled: true }),
        h(Item, { key: 'pro', value: 'pro', 'aria-label': 'pro' }),
        h(Item, { key: 'team', value: 'team', 'aria-label': 'team' }),
      ],
    ),
  );
  assert.equal(ref, group(), 'ref is the stable root');
  await act(async () => ref.focus());
  assert.equal(document.activeElement, radio('pro'));
  await click('team');
  await act(async () => ref.focus());
  assert.equal(document.activeElement, radio('team'));
});

test('native form: required, FormData, and reset back to defaultValue without a report', async () => {
  const changes = [];
  await render(
    h(
      'form',
      null,
      h(
        RadioGroup,
        {
          'aria-label': 'Plan',
          name: 'plan',
          required: true,
          defaultValue: 'free',
          onValueChange: (next) => changes.push(next),
        },
        items,
      ),
    ),
  );
  const form = host.querySelector('form');
  assert.ok(plans.every((plan) => radio(plan).required));
  await click('team');
  assert.deepEqual([...new window.FormData(form)], [['plan', 'team']]);
  await act(async () => {
    form.reset();
    await Promise.resolve();
  });
  assert.equal(stateOf('free'), 'checked');
  assert.equal(radio('free').checked, true);
  assert.equal(radio('team').checked, false);
  assert.deepEqual([...new window.FormData(form)], [['plan', 'free']]);
  assert.deepEqual(changes, ['team']);
});

test('plain Radio children join the group; size and variant fan out to them', async () => {
  const changes = [];
  await render(
    h(
      RadioGroup,
      {
        'aria-label': 'Size',
        size: 'tiny',
        variant: 'soft',
        onValueChange: (next) => changes.push(next),
      },
      h(Radio, { value: 's', 'aria-label': 'S' }),
      h(Radio, { value: 'm', 'aria-label': 'M', size: 'standard' }),
    ),
  );
  const [small, medium] = [...host.querySelectorAll('[data-radio]')];
  assert.equal(small.dataset.size, 'tiny');
  assert.equal(small.dataset.variant, 'soft');
  assert.equal(medium.dataset.size, 'standard', 'an explicit item size wins');
  assert.equal(radio('s').name, radio('m').name);
  await click('m');
  assert.deepEqual(changes, ['m']);
  assert.throws(
    () =>
      renderToString(h(RadioGroup, { 'aria-label': 'x' }, h(Radio, { 'aria-label': 'no value' }))),
    /needs a `value`/,
  );
});

test('react-hook-form controlMode="value": error focus, selection and reset', async () => {
  const { Field: RhfField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, submitted;
  function App() {
    methods = useForm({ defaultValues: { plan: '' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { noValidate: true, onSubmit: methods.handleSubmit((values) => (submitted = values)) },
        h(
          RhfField,
          { name: 'plan', controlMode: 'value', registerOptions: { required: 'Pick one' } },
          h(RhfField.Label, null, 'Plan'),
          h(RadioGroup, null, items),
          h(RhfField.Error),
        ),
      ),
    );
  }
  await render(h(App));
  const submit = () =>
    act(async () => {
      host
        .querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  await submit();
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Pick one');
  assert.equal(document.activeElement, radio('free'), 'the group hands focus to its first radio');
  await click('pro');
  assert.equal(methods.getValues('plan'), 'pro');
  await submit();
  assert.deepEqual(submitted, { plan: 'pro' });
  await act(async () => methods.reset({ plan: 'team' }));
  assert.equal(stateOf('team'), 'checked');
});
