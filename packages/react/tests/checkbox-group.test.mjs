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
const { Checkbox, CheckboxGroup, Field } = await import('../dist/index.js');

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

const skills = ['js', 'ts', 'py'];
const items = ({ Item }) =>
  skills.map((skill) => h(Item, { key: skill, value: skill, 'aria-label': skill }));
const box = (value) => host.querySelector(`input[value="${value}"]`);
const all = () => host.querySelector('input:not([value])');
const click = (node) => act(async () => node.click());

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('SSR: a labelled group of native checkboxes sharing one name', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { required: true, size: 'tiny' },
          h(Field.Label, null, 'Skills'),
          h(
            CheckboxGroup,
            { name: 'skills', defaultValue: ['js', 'py'], orientation: 'horizontal' },
            items,
          ),
        ),
      ),
    ),
  ).window.document;
  const group = doc.querySelector('[role=group]');
  assert.equal(doc.querySelector('label').htmlFor, group.id);
  assert.equal(group.getAttribute('aria-labelledby'), doc.querySelector('label').id);
  assert.equal(group.hasAttribute('aria-required'), false, 'a group takes no aria-required');
  assert.equal(group.dataset.orientation, 'horizontal');
  const boxes = [...doc.querySelectorAll('input[type=checkbox]')];
  assert.deepEqual(
    boxes.map((input) => [input.name, input.checked, input.required]),
    [
      ['skills', true, false],
      ['skills', false, false],
      ['skills', true, false],
    ],
    'required means at least one, so no single checkbox is required',
  );
  assert.ok(boxes.every((input) => input.closest('[data-checkbox]').dataset.size === 'tiny'));
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [
      ['skills', 'js'],
      ['skills', 'py'],
    ],
  );
});

test('select-all follows the enabled items, skips disabled ones and lists what it controls', async () => {
  const changes = [];
  await render(
    h(
      CheckboxGroup,
      {
        'aria-label': 'Skills',
        defaultValue: ['js', 'rs'],
        onValueChange: (next) => changes.push(next),
      },
      ({ All, Item }) => [
        h(All, { key: 'all', 'aria-label': 'All' }),
        ...skills.map((skill) => h(Item, { key: skill, value: skill, 'aria-label': skill })),
        h(Item, { key: 'rs', value: 'rs', 'aria-label': 'rs', disabled: true }),
      ],
    ),
  );
  assert.equal(all().indeterminate, true);
  assert.deepEqual(
    all().getAttribute('aria-controls').split(' '),
    skills.map((skill) => box(skill).id),
  );
  await click(all());
  assert.equal(all().checked, true);
  assert.deepEqual(changes.at(-1), ['js', 'rs', 'ts', 'py']);
  await click(all());
  assert.equal(all().checked, false);
  assert.equal(all().indeterminate, false);
  assert.deepEqual(changes.at(-1), ['rs'], 'the disabled item keeps its value');
  await click(box('ts'));
  assert.equal(all().indeterminate, true);
});

test('value: uncontrolled appends in click order, controlled follows the parent, readOnly holds', async () => {
  const changes = [];
  await render(
    h(
      CheckboxGroup,
      { 'aria-label': 'Skills', onValueChange: (next) => changes.push(next) },
      items,
    ),
  );
  await click(box('py'));
  await click(box('js'));
  await click(box('py'));
  assert.deepEqual(changes, [['py'], ['py', 'js'], ['js']]);
  let set;
  function Parent() {
    const [value, setValue] = useState(['ts']);
    set = setValue;
    return h(CheckboxGroup, { 'aria-label': 'Skills', value, onValueChange: () => {} }, items);
  }
  await render(h('div', { key: 'parent' }, h(Parent)));
  await click(box('js'));
  assert.equal(box('js').checked, false, 'a parent that does not follow keeps its value');
  await act(async () => set(['js']));
  assert.equal(box('js').checked, true);
  assert.equal(box('ts').checked, false);
  await render(
    h(
      'div',
      { key: 'readonly' },
      h(CheckboxGroup, { 'aria-label': 'Skills', readOnly: true, defaultValue: ['ts'] }, items),
    ),
  );
  await click(box('js'));
  assert.equal(box('js').checked, false);
  assert.equal(box('js').getAttribute('aria-readonly'), 'true');
});

test('required means at least one, with its own message, and reset restores the default', async () => {
  const changes = [];
  await render(
    h(
      'form',
      null,
      h(
        CheckboxGroup,
        {
          'aria-label': 'Skills',
          name: 'skills',
          required: true,
          defaultValue: ['ts'],
          onValueChange: (next) => changes.push(next),
        },
        items,
      ),
    ),
  );
  const validator = () => host.querySelector('[data-form-value-validator]');
  assert.equal(validator().checkValidity(), true);
  await click(box('ts'));
  assert.equal(validator().checkValidity(), false);
  assert.equal(validator().validationMessage, '하나 이상 선택하세요.');
  assert.equal(host.querySelector('form').checkValidity(), false);
  await act(async () => {
    host.querySelector('form').reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.equal(box('ts').checked, true);
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], [['skills', 'ts']]);
  assert.deepEqual(changes, [[]], 'a reset is not reported');
  await render(
    h(
      'div',
      { key: 'custom' },
      h(
        CheckboxGroup,
        { 'aria-label': 'Skills', required: true, requiredMessage: 'Pick one' },
        items,
      ),
    ),
  );
  assert.equal(validator().validationMessage, 'Pick one');
  await render(
    h(
      'div',
      { key: 'readonly' },
      h(CheckboxGroup, { 'aria-label': 'Skills', required: true, readOnly: true }, items),
    ),
  );
  assert.equal(validator(), null, 'a read-only group is not validated');
});

test('focus on the root goes to the first checked box, else the first enabled one', async () => {
  let ref;
  await render(
    h(CheckboxGroup, { 'aria-label': 'Skills', ref: (node) => (ref = node) }, ({ Item }) => [
      h(Item, { key: 'js', value: 'js', 'aria-label': 'js', disabled: true }),
      h(Item, { key: 'ts', value: 'ts', 'aria-label': 'ts' }),
      h(Item, { key: 'py', value: 'py', 'aria-label': 'py' }),
    ]),
  );
  await act(async () => ref.focus());
  assert.equal(document.activeElement, box('ts'));
  await click(box('py'));
  await act(async () => ref.focus());
  assert.equal(document.activeElement, box('py'));
});

test('plain Checkbox children and CheckboxGroup.All join the group', async () => {
  const changes = [];
  await render(
    h(
      CheckboxGroup,
      { 'aria-label': 'Alerts', size: 'tiny', onValueChange: (next) => changes.push(next) },
      h(CheckboxGroup.All, { 'aria-label': 'All' }),
      h(Checkbox, { value: 'mail', 'aria-label': 'mail' }),
      h(Checkbox, { value: 'push', 'aria-label': 'push' }),
      h(Checkbox, { 'aria-label': 'unrelated' }),
    ),
  );
  await click(all());
  assert.deepEqual(changes, [['mail', 'push']]);
  assert.equal(box('mail').closest('[data-checkbox]').dataset.size, 'tiny');
  const unrelated = host.querySelector('[aria-label=unrelated]');
  assert.equal(unrelated.checked, false, 'a checkbox without a value is not an option');
  assert.throws(
    () =>
      renderToString(
        h(CheckboxGroup, { 'aria-label': 'x' }, h(Checkbox, { value: 'a', checked: true })),
      ),
    /checked by the group/,
  );
});

test('react-hook-form controlMode="value": array value, error focus, reset', async () => {
  const { Field: RhfField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, submitted;
  function App() {
    methods = useForm({ defaultValues: { skills: [] } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { noValidate: true, onSubmit: methods.handleSubmit((values) => (submitted = values)) },
        h(
          RhfField,
          {
            name: 'skills',
            controlMode: 'value',
            registerOptions: { validate: (value) => value.length > 0 || 'Pick one' },
          },
          h(RhfField.Label, null, 'Skills'),
          h(CheckboxGroup, null, items),
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
  assert.equal(document.activeElement, box('js'));
  await click(box('py'));
  await click(box('js'));
  assert.deepEqual(
    methods.getValues('skills'),
    ['py', 'js'],
    'bubbling checkbox events are ignored',
  );
  await submit();
  assert.deepEqual(submitted, { skills: ['py', 'js'] });
  await act(async () => methods.reset({ skills: ['ts'] }));
  assert.equal(box('ts').checked, true);
  assert.equal(box('py').checked, false);
});
