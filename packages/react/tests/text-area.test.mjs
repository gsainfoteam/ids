import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of [
  'window',
  'document',
  'HTMLElement',
  'HTMLTextAreaElement',
  'Event',
  'CompositionEvent',
  'FocusEvent',
  'MouseEvent',
])
  globalThis[name] = dom.window[name];
// react-textarea-autosize re-measures after a form reset on the next frame.
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, Fragment, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, TextArea } = await import('../dist/index.js');
const { Field: RhfField } = await import('../dist/react-hook-form.js');
const { useForm, FormProvider } = await import('react-hook-form');
let root;
let host;
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
const control = () => host.querySelector('textarea');
const shell = () => host.querySelector('[data-text-area]');
const counter = () => host.querySelector('[data-text-area-count]');
const live = () => host.querySelector('[data-text-area-bottom] [role=status]');
const has = (node, name) => node.hasAttribute(`data-${name}`);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function input(value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(
      control(),
      value,
    );
    control().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('SSR: Field labels/descriptions target the native textarea, not the surface', () => {
  const markup = renderToString(
    h(
      Field,
      { required: true, invalid: true, size: 'tiny' },
      h(Field.Label, null, 'Bio'),
      h(TextArea, { defaultValue: 'Initial', rows: 5 }),
      h(Field.Error, null, 'Invalid'),
    ),
  );
  const doc = new JSDOM(markup).window.document;
  const node = doc.querySelector('textarea');
  assert.equal(node.value, 'Initial');
  assert.equal(node.rows, 5);
  assert.equal(doc.querySelector('label').htmlFor, node.id);
  assert.equal(doc.getElementById(node.id), node);
  assert.equal(node.getAttribute('aria-invalid'), 'true');
  assert.equal(node.required, true);
  assert.equal(doc.querySelector('[data-text-area]').dataset.size, 'tiny');
  assert.equal(doc.getElementById(node.getAttribute('aria-describedby')).textContent, 'Invalid');
});
test('sentinel/Fragment order, root native props, asChild handlers and React 19 ref cleanup', async () => {
  let node;
  let cleaned = 0;
  const changes = [];
  await render(
    h(
      TextArea,
      {
        id: 'root-control',
        name: 'bio',
        maxLength: 200,
        onChange: () => changes.push('root'),
        ref: (value) => {
          node = value;
          return () => cleaned++;
        },
      },
      h(
        Fragment,
        null,
        h('button', { type: 'button' }, 'Toolbar'),
        h(
          TextArea.Input,
          { asChild: true, onChange: () => changes.push('input') },
          h('textarea', { id: 'child-id', onChange: () => changes.push('child') }),
        ),
        h('span', null, 'Counter'),
      ),
    ),
  );
  assert.equal(node, control());
  assert.equal(control().id, 'root-control');
  assert.equal(control().name, 'bio');
  assert.equal(control().maxLength, 200);
  assert.deepEqual(
    Array.from(host.querySelector('[data-text-area]').children, (el) =>
      'textAreaTop' in el.dataset ? 'top' : 'textAreaBottom' in el.dataset ? 'bottom' : el.tagName,
    ),
    ['top', 'TEXTAREA', 'bottom'],
  );
  assert.equal(host.querySelector('[data-text-area-top]').textContent, 'Toolbar');
  assert.equal(host.querySelector('[data-text-area-bottom]').textContent, 'Counter');
  await input('가나다');
  assert.deepEqual(changes, ['child', 'root', 'input']);
  assert.equal(control().value, '가나다');
  await act(async () => root.unmount());
  root = undefined;
  assert.equal(cleaned, 1);
});
test('native form data, composition events, readOnly/disabled and root resize handle', async () => {
  const events = [];
  await render(
    h(
      'form',
      null,
      h(TextArea, {
        name: 'message',
        defaultValue: '안녕',
        autoResize: false,
        resize: 'both',
        readOnly: true,
        onCompositionStart: () => events.push('start'),
        onCompositionEnd: () => events.push('end'),
      }),
    ),
  );
  assert.ok(host.querySelector('[data-text-area]').classList.contains('resize'));
  assert.equal(control().readOnly, true);
  assert.equal(new dom.window.FormData(host.querySelector('form')).get('message'), '안녕');
  await act(async () => {
    control().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    control().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '녕' }));
  });
  assert.deepEqual(events, ['start', 'end']);
  await render(h(Field, { disabled: true }, h(TextArea)));
  assert.equal(control().disabled, true);
  assert.ok(host.querySelector('[data-text-area]').classList.contains('resize-none'));
  await render(h(Field, { invalid: false }, h(TextArea, { invalid: true })));
  assert.equal(control().getAttribute('aria-invalid'), 'false');
  assert.equal(host.querySelector('[data-text-area]').dataset.invalid, undefined);
  await render(h(TextArea, { invalid: true }));
  assert.equal(control().getAttribute('aria-invalid'), 'true');
  assert.equal(host.querySelector('[data-text-area]').dataset.invalid, '');
});
test('invalid structures and row bounds fail clearly', () => {
  for (const node of [
    h(TextArea, null, h(TextArea.Input), h(TextArea.Input)),
    h(TextArea, { minRows: 0 }),
    h(TextArea, { minRows: 5, maxRows: 2 }),
    h(TextArea, { resize: 'both' }),
    h(TextArea, null, h(TextArea.Input, { asChild: true }, h('input'))),
  ])
    assert.throws(() => renderToString(node), /\[IDS\] `<TextArea/);
});

// Synthetic layout checks the sizing wiring and reset timing; real browser checks cover geometry.
// react-textarea-autosize measures a hidden copy of the textarea that takes the real one's
// padding and border, so each line is 20px high on every textarea.
Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
  configurable: true,
  get() {
    return Math.max(1, this.value.split('\n').length) * 20 + 16;
  },
});
function mockGeometry(node) {
  if (!node) return;
  node.style.lineHeight = '20px';
  node.style.padding = '8px';
  node.style.border = '1px solid';
  node.style.boxSizing = 'border-box';
}
test('autoResize grows, caps at maxRows, shrinks, follows controlled changes and hands style back', async () => {
  const view = (value, autoResize = true) =>
    h(TextArea, {
      autoResize,
      minRows: 2,
      maxRows: 4,
      value,
      onChange: () => {},
      children: h(TextArea.Input, {
        ref: mockGeometry,
        style: { height: '99px', overflowY: 'scroll' },
      }),
    });
  await render(view('a'));
  assert.equal(control().style.height, '58px');
  await render(view('a\nb\nc'));
  assert.equal(control().style.height, '78px');
  await render(view('a\nb\nc\nd\ne\nf'));
  assert.equal(control().style.height, '98px');
  await render(view('a'));
  assert.equal(control().style.height, '58px');
  await render(view('a', false));
  assert.equal(control().style.height, '99px');
  assert.equal(control().style.overflowY, 'scroll');
  assert.ok(host.querySelector('[data-text-area]').classList.contains('resize-y'));
});
test('native form reset resizes after defaultValue is restored', async () => {
  await render(
    h(
      'form',
      null,
      h(TextArea, {
        autoResize: true,
        minRows: 1,
        maxRows: 5,
        defaultValue: 'initial',
        children: h(TextArea.Input, { ref: mockGeometry }),
      }),
    ),
  );
  await input('1\n2\n3\n4');
  assert.equal(control().style.height, '98px');
  await act(async () => {
    host.querySelector('form').reset();
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  assert.equal(control().value, 'initial');
  assert.equal(control().style.height, '38px');
});
test('asChild with a component leaves the height to that component', async () => {
  function Own({ ref, ...props }) {
    return h('textarea', { ...props, ref, 'data-own': '' });
  }
  await render(
    h(TextArea, {
      minRows: 1,
      maxRows: 3,
      children: h(TextArea.Input, { asChild: true, ref: mockGeometry }, h(Own)),
    }),
  );
  await input('1\n2\n3\n4\n5');
  assert.ok(control().hasAttribute('data-own'));
  assert.equal(control().style.height, '');
  await render(
    h(TextArea, {
      minRows: 1,
      maxRows: 3,
      children: h(TextArea.Input, { asChild: true, ref: mockGeometry }, h('textarea')),
    }),
  );
  await input('1\n2\n3\n4\n5');
  assert.equal(control().style.height, '78px', 'a textarea child is still measured');
});
test('RHF native registration: required error/focus, value, disabled, reset resizes uncontrolled textarea', async () => {
  let methods;
  function App() {
    methods = useForm({ defaultValues: { bio: '' } });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        { name: 'bio', registerOptions: { required: 'Bio required' } },
        h(RhfField.Label, null, 'Bio'),
        h(TextArea, {
          autoResize: true,
          minRows: 1,
          maxRows: 5,
          children: h(TextArea.Input, { ref: mockGeometry }),
        }),
        h(RhfField.Error),
      ),
    );
  }
  await render(h(App));
  await act(async () => methods.trigger('bio', { shouldFocus: true }));
  assert.equal(control().getAttribute('aria-invalid'), 'true');
  assert.equal(document.activeElement, control());
  await input('1\n2\n3\n4');
  assert.equal(methods.getValues('bio'), '1\n2\n3\n4');
  assert.equal(control().style.height, '98px');
  await act(async () => methods.reset());
  assert.equal(control().value, '');
  assert.equal(control().style.height, '38px');
});

test('state on the shell, the textarea marked for focus-ring, onValueChange next to onChange', async () => {
  const events = [];
  await render(
    h(TextArea, {
      'aria-label': 'Bio',
      onChange: (event) => events.push(['change', event.target.value]),
      onValueChange: (value) => events.push(['value', value]),
    }),
  );
  assert.ok(has(control(), 'field-input'));
  assert.equal(has(shell(), 'filled'), false);
  await act(async () => control().focus());
  assert.ok(has(shell(), 'focused'));
  await input('hello');
  assert.ok(has(shell(), 'filled'));
  assert.deepEqual(events, [
    ['change', 'hello'],
    ['value', 'hello'],
  ]);
  await render(h(TextArea, { key: 'ro', 'aria-label': 'Bio', readOnly: true, invalid: true }));
  assert.ok(has(shell(), 'readonly'));
  assert.ok(has(shell(), 'invalid'));
});

test('Count shows the length against maxLength and joins the textarea description', async () => {
  await render(
    h(
      Field,
      null,
      h(Field.Label, null, 'Bio'),
      h(Field.Description, null, 'About you'),
      h(TextArea, { maxLength: 20 }, h(TextArea.Input), h(TextArea.Count)),
    ),
  );
  assert.equal(counter().textContent, '0 / 20');
  const describedBy = control().getAttribute('aria-describedby').split(' ');
  assert.deepEqual(
    describedBy.map((id) => document.getElementById(id).textContent),
    ['About you', '0 / 20'],
  );
  await input('012345678');
  assert.equal(counter().textContent, '9 / 20');
  assert.equal(has(counter(), 'near-limit'), false, 'eleven left is not near yet');
  await input('01234567890123');
  assert.ok(has(counter(), 'near-limit'), 'ten or fewer left counts as near the limit');
  assert.equal(live().textContent, '', 'nothing is spoken while typing');
  await act(async () => wait(700));
  assert.equal(live().textContent, '6자 남았습니다.');
  await input('01234567890123456789');
  assert.ok(has(counter(), 'at-limit'));
  await act(async () => wait(700));
  assert.equal(live().textContent, '글자 수 제한에 도달했습니다.');
  await input('0123');
  await act(async () => wait(50));
  assert.equal(live().textContent, '', 'dropping back below the threshold clears the region');
});

test('Count without maxLength, custom rendering, threshold and announcement', async () => {
  await render(h(TextArea, { 'aria-label': 'Note' }, h(TextArea.Input), h(TextArea.Count)));
  await input('abc');
  assert.equal(counter().textContent, '3');
  await render(
    h(
      TextArea,
      { key: 'custom', 'aria-label': 'Note', maxLength: 100 },
      h(TextArea.Input),
      h(TextArea.Count, {
        threshold: 97,
        announce: (state) => `left ${state.remaining}`,
        children: (state) => `${state.count}자`,
      }),
    ),
  );
  await input('abc');
  assert.equal(counter().textContent, '3자');
  assert.ok(has(counter(), 'near-limit'));
  await act(async () => wait(700));
  assert.equal(live().textContent, 'left 97');
});

test('Count follows a value written by code (react-hook-form setValue)', async () => {
  let methods;
  function App() {
    methods = useForm({ defaultValues: { bio: '' } });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        { name: 'bio', 'aria-label': 'Bio' },
        h(TextArea, { maxLength: 50 }, h(TextArea.Input), h(TextArea.Count)),
      ),
    );
  }
  await render(h(App));
  await act(async () => {
    methods.setValue('bio', 'written by code');
    await Promise.resolve();
  });
  assert.equal(counter().textContent, '15 / 50');
  let setOuter;
  function Controlled() {
    const [value, setValue] = useState('ab');
    setOuter = setValue;
    return h(
      TextArea,
      { 'aria-label': 'C', value, onValueChange: setValue },
      h(TextArea.Input),
      h(TextArea.Count),
    );
  }
  await render(h(Controlled, { key: 'controlled' }));
  assert.equal(counter().textContent, '2');
  await act(async () => setOuter('abcd'));
  assert.equal(counter().textContent, '4');
});
