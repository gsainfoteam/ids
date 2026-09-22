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
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, Fragment } = await import('react');
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
  assert.equal(node.dataset.size, 'tiny');
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
    Array.from(
      host.querySelector('[data-text-area]').children,
      (el) => el.dataset.textAreaPart ?? el.tagName,
    ),
    ['top', 'TEXTAREA', 'bottom'],
  );
  await input('가나다');
  assert.deepEqual(changes, ['child', 'input', 'root']);
  assert.equal(control().value, '가나다');
  await act(async () => root.unmount());
  root = undefined;
  assert.equal(cleaned, 1);
});
test('native form data, composition events, readOnly/disabled and resize priority', async () => {
  const events = [];
  await render(
    h(
      'form',
      null,
      h(TextArea, {
        name: 'message',
        defaultValue: '안녕',
        resize: 'both',
        readOnly: true,
        onCompositionStart: () => events.push('start'),
        onCompositionEnd: () => events.push('end'),
      }),
    ),
  );
  assert.equal(control().style.resize, 'both');
  assert.equal(control().readOnly, true);
  assert.equal(new dom.window.FormData(host.querySelector('form')).get('message'), '안녕');
  await act(async () => {
    control().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    control().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '녕' }));
  });
  assert.deepEqual(events, ['start', 'end']);
  await render(h(Field, { disabled: true }, h(TextArea, { autoResize: true, resize: 'both' })));
  assert.equal(control().disabled, true);
  assert.equal(control().style.resize, 'none');
  await render(h(Field, { invalid: false }, h(TextArea, { invalid: true })));
  assert.equal(control().getAttribute('aria-invalid'), 'false');
});
test('invalid structures and row bounds fail clearly', () => {
  for (const node of [
    h(TextArea, null, h(TextArea.Input), h(TextArea.Input)),
    h(TextArea, null, h('span', null, 'No input')),
    h(TextArea, { minRows: 0 }),
    h(TextArea, { minRows: 5, maxRows: 2 }),
    h(TextArea, null, h(TextArea.Input, { asChild: true }, h('input'))),
  ])
    assert.throws(() => renderToString(node), /\[IDS\] TextArea/);
});

// Synthetic layout checks the sizing arithmetic and reset timing; real browser checks cover geometry.
function mockGeometry(node) {
  if (!node) return;
  node.style.lineHeight = '20px';
  node.style.padding = '8px';
  node.style.border = '1px solid';
  node.style.boxSizing = 'border-box';
  node.getClientRects = () => [{ width: 200 }];
  Object.defineProperty(node, 'scrollHeight', {
    configurable: true,
    get: () => Math.max(1, node.value.split('\n').length) * 20 + 16,
  });
}
test('autoResize grows, caps with overflow, shrinks, follows controlled changes and restores manual styles', async () => {
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
  assert.equal(control().style.overflowY, 'auto');
  await render(view('a'));
  assert.equal(control().style.height, '58px');
  assert.equal(control().style.overflowY, 'hidden');
  await render(view('a', false));
  assert.equal(control().style.height, '99px');
  assert.equal(control().style.overflowY, 'scroll');
  assert.equal(control().style.resize, 'vertical');
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
