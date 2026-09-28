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
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'CompositionEvent',
  'FocusEvent',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, Fragment, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { TelField, Field } = await import('../dist/index.js');
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
const input = () => host.querySelector('[type=tel]');
const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('SSR native input, Field label/ARIA and canonical FormData', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { invalid: true, required: true },
          h(Field.Label, null, 'Phone'),
          h(TelField, {
            name: 'phone',
            defaultCountry: 'KR',
            format: 'international',
            defaultValue: '01012345678',
          }),
        ),
      ),
    ),
  ).window.document;
  const node = doc.querySelector('[type=tel]');
  assert.equal(node.id, doc.querySelector('label').htmlFor);
  assert.equal(node.autocomplete, 'tel');
  assert.equal(node.inputMode, 'tel');
  assert.equal(node.getAttribute('aria-invalid'), 'true');
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [['phone', '+821012345678']],
  );
});
test('invalid structures fail clearly', () => {
  for (const [node, message] of [
    [h(TelField, null, h(TelField.Input), h(TelField.Input)), /at most one `<TelField.Input/],
    [
      h(TelField, null, h(TelField.CountrySelect), h(TelField.CountrySelect)),
      /at most one `<TelField.CountrySelect/,
    ],
    [h(TelField.Input), /must be used inside `<TelField>`/],
    [h(TelField, null, h(TelField.Input, { asChild: true }, h('textarea'))), /asChild>` requires/],
    [h(TelField, null, h(TelField.Input, null, 'text')), /takes no children/],
  ])
    assert.throws(() => renderToString(node), message);
});
test('Input values win over root values, but root and Input handlers both run', async () => {
  const events = [];
  let last;
  await render(
    h(
      TelField,
      {
        id: 'root-id',
        placeholder: 'root',
        onBlur: () => events.push('root'),
        onValueChange: (v) => (last = v),
      },
      h(TelField.Input, {
        placeholder: 'input',
        onBlur: () => events.push('input'),
        onChange: () => events.push('input-change'),
      }),
    ),
  );
  assert.equal(input().id, 'root-id');
  assert.equal(input().placeholder, 'input');
  assert.ok('telFieldInput' in input().dataset);
  await type(input(), '01012345678');
  assert.deepEqual(events, ['input-change']);
  assert.equal(input().value, '010-1234-5678');
  assert.equal(last, '+821012345678', 'the value is E.164 whatever the display');
  await act(() => input().dispatchEvent(new window.FocusEvent('focusout', { bubbles: true })));
  assert.deepEqual(events, ['input-change', 'root', 'input']);
});
test('children without an Input become leading adornments before an auto-inserted Input', async () => {
  await render(
    h(TelField, { 'aria-label': 'Phone' }, h(TelField.CountrySelect), h('span', null, 'Tel')),
  );
  const shell = host.querySelector('[data-tel-field]');
  assert.deepEqual(
    Array.from(shell.children, (el) =>
      'telFieldAdornment' in el.dataset ? el.textContent : el.tagName,
    ),
    ['DIV', 'Tel', 'INPUT'],
  );
  assert.ok(shell.firstElementChild.matches('[data-select]'));
  const trigger = shell.querySelector('[role=combobox]');
  assert.equal(trigger.querySelector('[data-select-value]').textContent, 'KR +82');
  assert.equal(trigger.lastElementChild.getAttribute('aria-hidden'), 'true', 'the Select.Icon');
  assert.equal(input().getAttribute('aria-label'), 'Phone');
  await type(input(), '01012345678');
  assert.equal(input().value, '010-1234-5678');
});
test('sentinel inside a Fragment splits leading and trailing adornments', async () => {
  await render(
    h(
      TelField,
      null,
      h(Fragment, null, h('span', null, 'Lead'), h(TelField.Input), h('span', null, 'Trail')),
    ),
  );
  assert.deepEqual(
    Array.from(host.querySelector('[data-tel-field]').children, (el) =>
      'telFieldAdornment' in el.dataset ? el.textContent : el.tagName,
    ),
    ['Lead', 'INPUT', 'Trail'],
  );
});
test('asChild merges props and ref into the child input and keeps formatting', async () => {
  let node;
  const changes = [];
  await render(
    h(
      TelField,
      {
        name: 'tel',
        onBlur: () => changes.push('root'),
        ref: (value) => {
          node = value;
        },
      },
      h(
        TelField.Input,
        { asChild: true },
        h('input', {
          spellCheck: false,
          onChange: () => changes.push('child'),
          onBlur: () => changes.push('child-blur'),
        }),
      ),
    ),
  );
  assert.equal(node, input());
  assert.equal(input().getAttribute('spellcheck'), 'false');
  assert.ok('telFieldInput' in input().dataset);
  await type(input(), '01012345678');
  assert.equal(input().value, '010-1234-5678');
  await act(() => input().dispatchEvent(new window.FocusEvent('focusout', { bubbles: true })));
  assert.deepEqual(changes, ['child', 'child-blur', 'root']);
});
test('progressive formatting, separator deletion, caret, raw mode and IME', async () => {
  let changes = [];
  await render(h(TelField, { onValueChange: (v) => changes.push(v) }));
  await type(input(), '01012345678');
  assert.equal(input().value, '010-1234-5678');
  assert.equal(changes.at(-1), '+821012345678');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
      input(),
      '0101234-5678',
    );
    input().setSelectionRange(3, 3);
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.notEqual(input().value, '010-1234-5678');
  assert.ok(input().selectionStart < input().value.length);
  await render(h(TelField, { format: 'none', onValueChange: (v) => changes.push(v) }));
  await type(input(), 'call me 123');
  assert.equal(input().value, 'call me 123');
  await type(input(), 'call m 123');
  assert.equal(input().value, 'call m 123');
  await render(h(TelField, { onValueChange: (v) => changes.push(v) }));
  await act(() =>
    input().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })),
  );
  const before = changes.length;
  await type(input(), '０１０１２３４５６７８');
  assert.equal(changes.length, before);
  await act(() => input().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
  assert.equal(changes.at(-1), '+821012345678');
});
test('CountrySelect emits international values, searches country, disables and resets', async () => {
  let last;
  const view = (disabled = false) =>
    h(
      'form',
      null,
      h(
        TelField,
        { name: 'tel', defaultCountry: 'KR', disabled, onValueChange: (v) => (last = v) },
        h(TelField.CountrySelect),
        h(TelField.Input),
      ),
    );
  await render(view());
  await type(input(), '01012345678');
  assert.equal(last, '+821012345678');
  await act(() => host.querySelector('button').click());
  await type(host.querySelector('[role=combobox][type=text]'), 'US');
  await act(() => host.querySelector('[role=option]').click());
  assert.equal(last, '+11012345678');
  assert.ok(host.querySelector('button').textContent.includes('US +1'));
  await act(async () => {
    host.querySelector('form').reset();
    await resetSettles();
  });
  assert.equal(input().value, '');
  assert.ok(host.querySelector('button').textContent.includes('KR +82'));
  await render(view(true));
  assert.equal(input().disabled, true);
  assert.equal(host.querySelector('button').disabled, true);
});
test('RHF controlled value, validation/focus, setValue/reset and disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { phone: '' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'phone',
            controlMode: 'value',
            registerOptions: { required: 'Required' },
            disabled,
          },
          h(F.Label, null, 'Phone'),
          h(TelField, { format: 'international' }),
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
  assert.equal(document.activeElement === input(), true);
  await type(input(), '01012345678');
  await submit();
  assert.equal(result.phone, '+821012345678');
  await act(async () => methods.setValue('phone', '+12025550123'));
  assert.equal(input().value, '+1 202 555 0123');
  await act(async () => methods.reset());
  assert.equal(input().value, '');
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.phone, undefined);
});

const hidden = () => host.querySelector('input[type=hidden]');
async function paste(text) {
  let event;
  await act(async () => {
    input().focus();
    event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    input().dispatchEvent(event);
  });
  return event;
}

test('the value is E.164 in and out; national values are read in the country', async () => {
  const changes = [];
  function App() {
    const [value, setValue] = useState('010-1234-5678');
    return h(
      'form',
      null,
      h(TelField, {
        name: 'phone',
        value,
        onValueChange: (next) => {
          changes.push(next);
          setValue(next);
        },
      }),
    );
  }
  await render(h(App));
  assert.equal(input().value, '010-1234-5678');
  assert.equal(hidden().value, '+821012345678');
  assert.deepEqual(changes, [], 'reading a national value does not report a change');
  await type(input(), '+12025550123');
  assert.equal(changes.at(-1), '+12025550123');
  assert.equal(input().value, '+1 202 555 0123');
});

test('a number typed with + beside a country select switches the country', async () => {
  let last;
  await render(
    h(
      TelField,
      { defaultCountry: 'KR', onValueChange: (v) => (last = v) },
      h(TelField.CountrySelect),
      h(TelField.Input),
    ),
  );
  await type(input(), '+12025550123');
  assert.equal(last, '+12025550123');
  assert.ok(host.querySelector('button').textContent.includes('US +1'));
  assert.equal(input().value, '(202) 555-0123', 'the code lives in the select');
});

test('paste: tel: links, (0) trunk markers and 00 prefixes replace the entry', async () => {
  let last;
  await render(h(TelField, { defaultCountry: 'KR', onValueChange: (v) => (last = v) }));
  await type(input(), '010');
  let event = await paste('tel:+82-10-1234-5678');
  assert.equal(event.defaultPrevented, true);
  assert.equal(last, '+821012345678');
  event = await paste('+44 (0)20 7946 0958');
  assert.equal(last, '+442079460958');
  event = await paste('0044 20 7946 0958');
  assert.equal(last, '+442079460958');
  await type(input(), '');
  event = await paste('1234');
  assert.equal(event.defaultPrevented, false, 'a partial number pastes where the caret is');
});

test('an incomplete number fails native validation and Field.Error says so', async () => {
  await render(
    h(
      'form',
      null,
      h(Field, null, h(Field.Label, null, 'Phone'), h(TelField, { name: 'phone' }), h(Field.Error)),
    ),
  );
  assert.equal(input().validity.valid, true, 'empty is left to required');
  await type(input(), '010123');
  assert.equal(input().validity.customError, true);
  await act(async () => host.querySelector('form').checkValidity());
  assert.equal(
    host.querySelector('[data-field-part=error]').textContent,
    '올바른 전화번호를 입력하세요.',
  );
  await type(input(), '01012345678');
  assert.equal(input().validity.valid, true);
  assert.equal(host.querySelector('[data-field-part=error]'), null);
});

test('format="international" settles a complete number when the field is left', async () => {
  await render(h(TelField, { format: 'international', defaultCountry: 'KR' }));
  await act(async () => input().focus());
  await type(input(), '01012345678');
  assert.equal(input().value, '010-1234-5678', 'typing keeps the national grouping');
  await act(async () => input().blur());
  assert.equal(input().value, '+82 10 1234 5678');
});

test('country names come from Intl in the given locale and are searchable', async () => {
  await render(h(TelField, { locale: 'ko-KR' }, h(TelField.CountrySelect), h(TelField.Input)));
  assert.equal(host.querySelector('button').getAttribute('aria-label'), '국가');
  await act(() => host.querySelector('button').click());
  const search = host.querySelector('[role=combobox][type=text]');
  assert.equal(search.placeholder, '국가 또는 국가 번호 검색');
  await type(search, '미국');
  const options = [...host.querySelectorAll('[role=option]')].map((el) => el.textContent);
  assert.ok(options.includes('미국+1'), options.join('|'));
});

test('a Clear part and Escape empty the number', async () => {
  let last;
  await render(
    h(
      TelField,
      { defaultValue: '+821012345678', onValueChange: (v) => (last = v) },
      h(TelField.Input),
      h(TelField.Clear),
    ),
  );
  assert.equal(host.querySelector('[data-tel-field]').hasAttribute('data-filled'), true);
  await act(async () => host.querySelector('[data-text-control-clear]').click());
  assert.equal(last, '');
  assert.equal(input().value, '');
});

test('a partial number is reported as far as it goes, and a shared calling code keeps the chosen country', async () => {
  let last;
  await render(h(TelField, { defaultCountry: 'KR', onValueChange: (v) => (last = v) }));
  await type(input(), '010123');
  assert.equal(input().value, '010-123');
  assert.equal(last, '+8210123');
  await render(
    h(
      TelField,
      { key: 'ca', defaultCountry: 'CA', defaultValue: '+12025550123' },
      h(TelField.CountrySelect),
      h(TelField.Input),
    ),
  );
  assert.ok(host.querySelector('button').textContent.includes('CA +1'));
  await render(
    h(
      TelField,
      { key: 'kr', defaultCountry: 'KR', defaultValue: '+12025550123' },
      h(TelField.CountrySelect),
      h(TelField.Input),
    ),
  );
  assert.ok(
    host.querySelector('button').textContent.includes('US +1'),
    'another code reads its country',
  );
  assert.equal(input().value, '(202) 555-0123');
});

test('without a country select a foreign number reads internationally, a national value nationally', async () => {
  await render(h(TelField, { defaultCountry: 'KR', defaultValue: '+12025550123' }));
  assert.equal(input().value, '+1 202 555 0123');
  await render(h(TelField, { key: 'partial', defaultCountry: 'KR', defaultValue: '010-1234' }));
  assert.equal(input().value, '010-1234', 'an incomplete national value keeps its form');
  await render(
    h(TelField, { key: 'controlled', defaultCountry: 'KR', value: '010-1234', onValueChange() {} }),
  );
  assert.equal(input().value, '010-1234');
});
