import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'Element',
  'Node',
  'getComputedStyle',
  'MutationObserver',
  'Document',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'CompositionEvent',
  'requestAnimationFrame',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { ChipField, Field } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = undefined;
  host?.remove();
  delete window.matchMedia;
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
async function paste(node, text) {
  let event;
  await act(async () => {
    node.focus();
    event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    node.dispatchEvent(event);
  });
  return event;
}
const trigger = () => host.querySelector('[data-chip-field-input]');
const listbox = () => host.querySelector('[role=listbox]');
const options = () => [...host.querySelectorAll('[role=option]')];
const chips = () => [...host.querySelectorAll('[data-chip-field-chip]')].map((c) => c.textContent);
const removeButton = (label) => host.querySelector(`[aria-label="${label} 삭제"]`);
async function click(node) {
  await act(async () => node.click());
}
async function key(node, key, options = {}) {
  let event;
  await act(async () => {
    event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
    node.dispatchEvent(event);
  });
  return event;
}
const items = () => [
  h(
    ChipField.Group,
    { heading: 'Languages', key: 'g' },
    h(ChipField.Item, { value: 'js' }, 'JavaScript'),
    h(ChipField.Item, { value: 'ts' }, 'TypeScript'),
  ),
  h(ChipField.Item, { value: 'no', disabled: true, key: 'no' }, 'Unavailable'),
];
function tracked(props = {}, children = items()) {
  const changes = [];
  const created = [];
  return {
    changes,
    created,
    node: h(
      ChipField,
      {
        'aria-label': 'Skills',
        ...props,
        onValueChange: (value) => changes.push(value),
        onCreate: (value) => created.push(value),
      },
      ...children,
    ),
  };
}

test('SSR: Field labelling, one hidden input per chip, required validator, no nested buttons', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { required: true },
          h(Field.Label, null, 'Skills'),
          h(ChipField, { name: 'skills', defaultValue: ['js', 'ts'] }, ...items()),
        ),
      ),
    ),
  ).window.document;
  const input = doc.querySelector('[role=combobox]');
  assert.equal(doc.querySelector('label').htmlFor, input.id);
  assert.equal(input.getAttribute('aria-required'), 'true');
  assert.equal(input.hasAttribute('name'), false, 'the typed query is never submitted');
  assert.deepEqual(new doc.defaultView.FormData(doc.querySelector('form')).getAll('skills'), [
    'js',
    'ts',
  ]);
  assert.equal(doc.querySelectorAll('[data-form-value-validator]').length, 1);
  assert.equal(doc.querySelector('button button'), null);
  const remove = doc.querySelector('[data-chip-field-remove]');
  assert.equal(remove.tabIndex, -1);
  assert.ok(remove.closest('[data-chip-field-chip]').hasAttribute('data-chip'), 'a chip is a Chip');
  assert.ok(remove.hasAttribute('data-chip-close'), 'removed through Chip.Close');
  assert.equal(remove.dataset.variant, 'ghost');
  assert.throws(
    () => renderToString(h(ChipField, null, h(ChipField.Item, null, 'Bad'))),
    /`value` is required/,
  );
});

test('search, groups, keyboard selection with a check, chip removal and maxCount', async () => {
  const state = tracked({ maxCount: 1 });
  await render(state.node);
  await type(trigger(), 'Type');
  assert.equal(options().length, 1);
  await key(trigger(), 'Enter');
  assert.deepEqual(state.changes.at(-1), ['ts']);
  assert.equal(trigger().value, '');
  assert.ok(listbox(), 'the list stays open for the next pick');
  const ts = options().find((option) => option.textContent === 'TypeScript');
  assert.ok(ts.querySelector('[data-chip-field-item-indicator]'), 'a chosen option has a check');
  const js = options().find((option) => option.textContent === 'JavaScript');
  assert.equal(js.getAttribute('aria-disabled'), 'true', 'full: other options are disabled');
  assert.equal(
    host.querySelector('[data-chip-field-limit]').textContent,
    '최대 1개까지 고를 수 있습니다.',
  );
  assert.ok(host.querySelector('[data-chip-field]').hasAttribute('data-full'));
  await key(trigger(), 'Escape');
  assert.equal(listbox(), null);
  await key(trigger(), 'Backspace');
  assert.deepEqual(state.changes.at(-1), []);
  await key(trigger(), 'ArrowDown');
  await key(trigger(), 'Enter');
  assert.deepEqual(state.changes.at(-1), ['js']);
  await click(removeButton('JavaScript'));
  assert.deepEqual(state.changes.at(-1), []);
  assert.equal(document.activeElement, trigger());
});

test('arrow keys walk the chips; Backspace and Delete remove and keep focus nearby', async () => {
  const state = tracked({ defaultValue: ['js', 'ts', 'x', 'y'] });
  await render(state.node);
  await act(async () => trigger().focus());
  const left = await key(trigger(), 'ArrowLeft');
  assert.equal(left.defaultPrevented, true);
  assert.equal(document.activeElement, removeButton('y'));
  assert.ok(
    removeButton('y').closest('[data-chip]').hasAttribute('data-focus-visible'),
    'the chip the arrows are on is marked',
  );
  await key(document.activeElement, 'ArrowLeft');
  await key(document.activeElement, 'ArrowLeft');
  assert.equal(document.activeElement, removeButton('TypeScript'));
  await key(document.activeElement, 'Backspace');
  assert.deepEqual(chips(), ['JavaScript', 'x', 'y']);
  assert.equal(document.activeElement, removeButton('JavaScript'), 'Backspace moves back');
  await key(document.activeElement, 'Delete');
  assert.deepEqual(chips(), ['x', 'y']);
  assert.equal(document.activeElement, removeButton('x'), 'Delete keeps the place');
  await key(document.activeElement, 'End');
  assert.equal(document.activeElement, trigger());
  await key(trigger(), 'ArrowLeft');
  await key(document.activeElement, 'Home');
  assert.equal(document.activeElement, removeButton('x'));
  await key(document.activeElement, 'ArrowRight');
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement, trigger(), 'past the last chip is the input');
  assert.equal(trigger().selectionStart, 0);
  await key(trigger(), 'ArrowLeft');
  await click(document.activeElement);
  assert.deepEqual(chips(), ['x']);
  assert.equal(document.activeElement, trigger(), 'clicking the last chip away returns to input');
  await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
  assert.equal(document.activeElement, trigger(), 'and Chip does not move it to the other chip');
  assert.deepEqual(state.changes.at(-1), ['x']);
  await key(trigger(), 'ArrowLeft');
  const typed = await key(document.activeElement, 'q');
  assert.equal(document.activeElement, trigger(), 'typing on a chip goes to the input');
  assert.equal(typed.defaultPrevented, false, 'so the browser still types the character');
});

test('the container opens the list; PageDown jumps; an outside value may exceed maxCount', async () => {
  await render(tracked({ value: ['js', 'ts', 'x'], maxCount: 2 }).node);
  assert.deepEqual(chips(), ['JavaScript', 'TypeScript', 'x'], 'an outside value is not cut');
  await act(async () => host.querySelector('[data-chip-field]').click());
  assert.equal(document.activeElement, trigger());
  assert.ok(listbox());
  await render(h('div', { key: 'pages' }, tracked().node));
  await key(trigger(), 'ArrowDown');
  await key(trigger(), 'PageDown');
  assert.equal(
    trigger().getAttribute('aria-activedescendant'),
    options().find((option) => option.textContent === 'TypeScript').id,
    'PageDown stops at the last enabled option',
  );
});

test('in a right-to-left field the arrows are mirrored', async () => {
  await render(tracked({ defaultValue: ['js', 'ts'], style: { direction: 'rtl' } }).node);
  await act(async () => trigger().focus());
  await key(trigger(), 'ArrowRight');
  assert.equal(document.activeElement, removeButton('TypeScript'));
  await key(document.activeElement, 'ArrowRight');
  assert.equal(document.activeElement, removeButton('JavaScript'));
  await key(document.activeElement, 'ArrowLeft');
  await key(document.activeElement, 'ArrowLeft');
  assert.equal(document.activeElement, trigger());
});

test('paste splits on commas and new lines, dedupes, and leaves what it cannot add', async () => {
  const state = tracked({ defaultValue: ['ts'] });
  await render(state.node);
  const event = await paste(trigger(), 'javascript, TYPESCRIPT\nUnavailable\tRust');
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(state.changes.at(-1), ['ts', 'js']);
  assert.equal(trigger().value, 'Unavailable, Rust', 'disabled and unknown values stay typed');
  const plain = await paste(trigger(), 'Java');
  assert.equal(plain.defaultPrevented, false, 'text without separators pastes normally');
});

test('creatable: trims, dedupes, ignores IME, validates, and commits on comma or Enter', async () => {
  const state = tracked({
    creatable: true,
    maxCount: 3,
    validate: (text) => text.length >= 2 || 'Too short',
  });
  await render(state.node);
  await type(trigger(), '  새 태그  ');
  await act(() =>
    trigger().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })),
  );
  await key(trigger(), 'Enter');
  assert.deepEqual(state.created, [], 'Enter while composing is ignored');
  await act(() =>
    trigger().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })),
  );
  await key(trigger(), 'Enter');
  assert.deepEqual(state.created, ['새 태그']);
  assert.deepEqual(state.changes.at(-1), ['새 태그']);
  await type(trigger(), '새 태그');
  assert.equal(host.querySelector('[data-chip-field-create]'), null, 'a duplicate is not offered');
  await type(trigger(), 'x');
  const create = host.querySelector('[data-chip-field-create]');
  assert.equal(create.textContent, 'Too short');
  assert.equal(create.getAttribute('aria-disabled'), 'true');
  await key(trigger(), 'Enter');
  assert.equal(state.created.length, 1, 'an invalid value is not created');
  await type(trigger(), '');
  const stray = await key(trigger(), ',');
  assert.equal(stray.defaultPrevented, true, 'a comma with nothing before it is not typed');
  await type(trigger(), 'Rust');
  const comma = await key(trigger(), ',');
  assert.equal(comma.defaultPrevented, true);
  assert.deepEqual(state.changes.at(-1), ['새 태그', 'Rust']);
  await type(trigger(), 'ＲＵＳＴ');
  assert.equal(
    host.querySelector('[data-chip-field-create]'),
    null,
    'a full-width spelling is the same value',
  );
  await type(trigger(), 'typescript');
  await key(trigger(), ',');
  assert.deepEqual(state.changes.at(-1), ['새 태그', 'Rust', 'ts'], 'an option matches by label');
  await type(trigger(), 'more');
  assert.equal(host.querySelector('[data-chip-field-create]'), null, 'no creating once full');
  await render(
    h('div', { key: 'false' }, tracked({ creatable: true, validate: () => false }).node),
  );
  await type(trigger(), 'anything');
  assert.equal(
    host.querySelector('[data-chip-field-create]').textContent,
    '추가할 수 없는 값입니다.',
    'false rejects with the default message',
  );
});

test('required is enforced natively; reset, prevented reset, read-only and disabled', async () => {
  const view = (props) =>
    h(
      'form',
      null,
      h(
        ChipField,
        { 'aria-label': 'Skills', name: 'skills', defaultValue: ['js'], ...props },
        h(ChipField.Input, { asChild: true }, h('input', { 'data-test': 'search' })),
        h(ChipField.Content, null, ...items()),
      ),
    );
  await render(view({ required: true }));
  const form = host.querySelector('form');
  await key(trigger(), 'Backspace');
  assert.equal(form.checkValidity(), false, 'no chips fails required');
  await act(() => host.querySelector('[data-form-value-validator]').focus());
  assert.equal(document.activeElement, trigger());
  form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await act(async () => {
    form.reset();
    await Promise.resolve();
  });
  assert.equal(host.querySelector('[type=hidden]'), null, 'a prevented reset changes nothing');
  await type(trigger(), 'half typed');
  await act(async () => {
    form.reset();
    await Promise.resolve();
  });
  assert.equal(host.querySelector('[type=hidden]').value, 'js');
  assert.equal(trigger().value, '', 'reset also clears the typed text');
  assert.equal(form.checkValidity(), true);
  await render(view({ readOnly: true, required: true }));
  await key(trigger(), 'Backspace');
  await click(trigger());
  assert.equal(listbox(), null);
  assert.equal(host.querySelector('[data-chip-field-remove]'), null, 'no remove buttons');
  assert.equal(host.querySelector('[type=hidden]').value, 'js');
  await render(view({ disabled: true }));
  assert.equal(trigger().disabled, true);
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], []);
});

test('open, defaultOpen and onOpenChange', async () => {
  const opens = [];
  await render(
    h(
      ChipField,
      { 'aria-label': 'Skills', defaultOpen: true, onOpenChange: (open) => opens.push(open) },
      ...items(),
    ),
  );
  assert.ok(listbox());
  await key(trigger(), 'Escape');
  assert.equal(listbox(), null);
  await type(trigger(), 'Java');
  assert.ok(listbox(), 'typing opens the list');
  await key(trigger(), 'Escape');
  assert.equal(trigger().value, 'Java');
  await key(trigger(), 'Escape');
  assert.equal(trigger().value, '', 'a second Escape clears the text');
  assert.deepEqual(opens, [false, true, false]);
});

test('drawer: the sheet has its own search field, and closing returns to the field', async () => {
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  const state = tracked({});
  await render(state.node);
  await click(trigger());
  const search = host.querySelector('input[data-chip-field-search]');
  assert.ok(search);
  assert.ok(search.closest('[data-text-field]'), 'the sheet search is a TextField');
  assert.equal(document.activeElement, search);
  assert.equal(host.querySelector('[data-field-popup]').getAttribute('aria-modal'), 'true');
  await type(search, 'Java');
  assert.equal(search.getAttribute('aria-activedescendant'), options()[0].id);
  await key(search, 'Enter');
  assert.deepEqual(state.changes.at(-1), ['js']);
  await key(search, 'Escape');
  assert.equal(listbox(), null);
  assert.equal(document.activeElement, trigger());
});

test('react-hook-form value mode binds onValueChange; errors focus, reset, disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { tags: [] } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'tags',
            controlMode: 'value',
            disabled,
            registerOptions: { validate: (v) => v.length > 0 || 'Required' },
          },
          h(F.Label, null, 'Tags'),
          h(ChipField, null, ...items()),
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
  await type(trigger(), 'Type');
  await key(trigger(), 'Enter');
  await key(trigger(), 'Escape');
  await submit();
  assert.deepEqual(result.tags, ['ts']);
  await act(async () => methods.reset());
  assert.equal(host.querySelector('[type=hidden]'), null);
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.tags, undefined);
});

test('Input values win over root values, but root and Input handlers both run', async () => {
  const keys = [];
  await render(
    h(
      ChipField,
      {
        id: 'root-id',
        placeholder: 'root',
        spellCheck: false,
        onKeyDown: () => keys.push('root'),
      },
      h(ChipField.Input, { placeholder: 'input', onKeyDown: () => keys.push('input') }),
      ...items(),
    ),
  );
  assert.equal(trigger().id, 'root-id');
  assert.equal(trigger().placeholder, 'input');
  assert.equal(trigger().getAttribute('spellcheck'), 'false');
  await key(trigger(), 'ArrowDown');
  assert.deepEqual(keys, ['root', 'input']);
  assert.notEqual(listbox(), null);
  assert.equal(trigger().getAttribute('aria-expanded'), 'true');
});

const layout = () =>
  Array.from(host.querySelector('[data-chip-field]').children, (el) =>
    'chipFieldAdornment' in el.dataset
      ? el.textContent
      : 'chipFieldChip' in el.dataset
        ? 'CHIP'
        : el.tagName.toUpperCase(),
  );

test('without an Input, leading children come before the chips and the Input is appended', async () => {
  await render(
    h(
      ChipField,
      { 'aria-label': 'Tags', defaultValue: ['js'] },
      h('span', { key: 'a' }, 'Lead'),
      ...items(),
    ),
  );
  assert.deepEqual(layout(), ['Lead', 'CHIP', 'INPUT', 'SVG']);
  assert.equal(trigger().tagName, 'INPUT');
});

test('Input inside a Fragment splits leading and trailing adornments', async () => {
  await render(
    h(
      ChipField,
      { 'aria-label': 'Tags', defaultValue: ['js'] },
      h(Fragment, null, h('span', null, 'Lead'), h(ChipField.Input), h('span', null, 'Trail')),
      ...items(),
    ),
  );
  assert.deepEqual(layout(), ['Lead', 'CHIP', 'INPUT', 'Trail', 'SVG']);
});

test('a field that only creates values has no chevron', async () => {
  await render(h(ChipField, { 'aria-label': 'Emails', creatable: true }));
  assert.deepEqual(layout(), ['INPUT']);
});

test('asChild merges props, handlers and ref into the child input', async () => {
  let node;
  const keys = [];
  await render(
    h(
      ChipField,
      {
        'aria-label': 'Tags',
        onKeyDown: () => keys.push('root'),
        ref: (value) => {
          node = value;
        },
      },
      h(
        ChipField.Input,
        { asChild: true },
        h('input', { spellCheck: false, onKeyDown: () => keys.push('child') }),
      ),
      ...items(),
    ),
  );
  assert.equal(node, trigger());
  assert.equal(trigger().getAttribute('spellcheck'), 'false');
  assert.ok('chipFieldInput' in trigger().dataset);
  await type(trigger(), 'Type');
  await key(trigger(), 'Enter');
  assert.deepEqual(keys, ['child', 'root']);
  assert.ok(removeButton('TypeScript'));
});

test('invalid structures fail clearly', () => {
  for (const node of [
    h(ChipField, null, h(ChipField.Input), h(ChipField.Input)),
    h(ChipField, null, h(ChipField.Input, { asChild: true }, h('textarea'))),
    h(ChipField, null, h(ChipField.Input, null, 'text')),
    h(ChipField.Input),
    h(ChipField, null, h(ChipField.Content), h(ChipField.Item, { value: 'x' }, 'X')),
  ])
    assert.throws(() => renderToString(node), /\[IDS\] `<ChipField/);
});
