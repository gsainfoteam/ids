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
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'getComputedStyle',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Rating, Field } = await import('../dist/index.js');
const { Field: RhfField } = await import('../dist/react-hook-form.js');
const { useForm, FormProvider } = await import('react-hook-form');
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
const radio = (score) => host.querySelector(`[data-rating-value="${score}"]`);
const checked = () => Number(host.querySelector('[aria-checked=true]').dataset.ratingValue);
const group = () => host.querySelector('[data-rating]');
async function key(key) {
  await act(async () =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    ),
  );
}
async function click(score) {
  await act(async () => radio(score).click());
}

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('half-step SSR: one tabbable option, the Field label and id stay on the group', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        Field,
        { invalid: true, size: 'tiny' },
        h(Field.Label, null, '평점'),
        h(Rating, { defaultValue: 2.5, step: 0.5 }),
        h(Field.Error, null, '오류'),
      ),
    ),
  ).window.document;
  const groupNode = doc.querySelector('[role=radiogroup]');
  assert.equal(doc.querySelectorAll('[role=radio]').length, 11);
  assert.equal(doc.querySelectorAll('[tabindex="0"]').length, 1);
  const selected = doc.querySelector('[aria-checked=true]');
  assert.equal(selected.dataset.ratingValue, '2.5');
  assert.equal(doc.querySelector('label').htmlFor, groupNode.id, 'the id does not move');
  assert.equal(groupNode.getAttribute('aria-labelledby'), doc.querySelector('label').id);
  assert.equal(selected.getAttribute('aria-invalid'), 'true');
  assert.equal(doc.getElementById(selected.getAttribute('aria-describedby')).textContent, '오류');
  assert.equal(groupNode.dataset.size, 'tiny');
});

test('keyboard moves by half-step, clamps boundaries, clears and keeps focus', async () => {
  const values = [];
  await render(h(Rating, { step: 0.5, onValueChange: (v) => values.push(v) }));
  radio(0).focus();
  await key('ArrowRight');
  assert.equal(checked(), 0.5);
  assert.equal(document.activeElement, radio(0.5));
  await key('End');
  await key('ArrowRight');
  assert.equal(checked(), 5);
  await key('Home');
  await key('ArrowLeft');
  assert.equal(checked(), 0);
  await key('3');
  assert.equal(checked(), 3);
  assert.deepEqual(values, [0.5, 5, 0, 3]);
  await render(h(Rating, { step: 0.5, style: { direction: 'rtl' } }));
  radio(3).focus();
  await key('ArrowLeft');
  assert.equal(checked(), 3.5);
});

test('hover previews without changing the value; half clicks commit once', async () => {
  const values = [],
    previews = [];
  await render(
    h(Rating, {
      defaultValue: 1,
      step: 0.5,
      onValueChange: (v) => values.push(v),
      onHover: (v) => previews.push(v),
    }),
  );
  await act(async () => {
    const event = new MouseEvent('pointerover', { bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: 'mouse' });
    radio(2.5).dispatchEvent(event);
  });
  assert.equal(host.querySelectorAll('[data-state=full]').length, 2);
  assert.equal(host.querySelector('[data-state=half]') !== null, true);
  assert.ok(group().hasAttribute('data-previewing'));
  assert.equal(checked(), 1);
  assert.deepEqual(values, []);
  await click(2.5);
  await click(2.5);
  assert.deepEqual(values, [2.5]);
  assert.deepEqual(previews, [2.5, null]);
});

test('controlled changes respect the owner; outside updates do not echo', async () => {
  const values = [];
  let update;
  function Demo() {
    const [value, set] = useState(2);
    update = set;
    return h(Rating, { value, onValueChange: (v) => values.push(v) });
  }
  await render(h(Demo));
  await click(4);
  assert.equal(checked(), 2);
  assert.deepEqual(values, [4]);
  await act(async () => update(3));
  assert.equal(checked(), 3);
  assert.deepEqual(values, [4]);
});

test('readOnly, disabled and display-only block changes; display-only reads as one image', async () => {
  for (const prop of ['readOnly', 'disabled']) {
    await render(
      h(Rating, { [prop]: true, value: 2, onValueChange: () => assert.fail('blocked') }),
    );
    await click(4);
    radio(2).focus();
    await key('End');
    assert.equal(checked(), 2);
  }
  await render(h(Rating, { selectionMode: 'none', value: 3, 'aria-label': '상품' }));
  assert.equal(host.querySelectorAll('button').length, 0);
  assert.match(host.querySelector('[role=img]').getAttribute('aria-label'), /상품.*3점/);
  assert.equal(host.querySelector('input'), null, 'nothing to submit');
});

test('Rating.Item: one template for every star, indexed items for their own, all inert', async () => {
  await render(
    h(
      Rating,
      { max: 3, defaultValue: 2, 'aria-label': 'Glyphs' },
      h(Rating.Item, null, h('i', { 'data-glyph': 'fire' })),
      h(Rating.Item, {
        index: 1,
        className: (state) => `item-${state.fill}`,
        children: (state) => h('i', { 'data-glyph': `face-${state.itemValue}` }),
      }),
    ),
  );
  const glyphs = [...host.querySelectorAll('[data-rating-item]')].map(
    (item) => item.querySelector('[data-glyph]').dataset.glyph,
  );
  assert.deepEqual(glyphs, ['fire', 'face-2', 'fire']);
  assert.ok(host.querySelector('[inert] [data-glyph]'));
  assert.ok(host.querySelectorAll('[data-rating-item]')[1].className.includes('item-full'));
  assert.throws(
    () => renderToString(h(Rating, null, h(Rating.Item, null, 'a'), h(Rating.Item, null, 'b'))),
    /one Rating.Item without an index/,
  );
  assert.throws(() => renderToString(h(Rating, null, h('span'))), /Rating.Item elements/);
});

test('form: a hidden input only with a name and a score, required, reset without a report', async () => {
  const values = [];
  await render(
    h(
      'form',
      null,
      h(Rating, { name: 'score', defaultValue: 2, onValueChange: (v) => values.push(v) }),
      h(Rating, { 'aria-label': 'Nameless', defaultValue: 4 }),
    ),
  );
  const form = host.querySelector('form');
  await click(4);
  assert.deepEqual([...new dom.window.FormData(form)], [['score', '4']]);
  await act(async () => {
    form.reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.equal(checked(), 2);
  assert.deepEqual(values, [4]);
  radio(0).focus();
  await key('0');
  assert.deepEqual([...new dom.window.FormData(form)], [], 'no rating, no entry');
  form.addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await click(3);
  await act(async () => {
    form.reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.equal(checked(), 3, 'a cancelled reset changes nothing');
  await render(h('form', { key: 'required' }, h(Rating, { name: 'score', required: true })));
  const validator = host.querySelector('[data-form-value-validator]');
  assert.equal(validator.validationMessage, '점수를 선택하세요.');
  await click(1);
  assert.equal(host.querySelector('[data-form-value-validator]').checkValidity(), true);
  await render(
    h('form', { key: 'disabled' }, h(Rating, { name: 'score', disabled: true, defaultValue: 3 })),
  );
  assert.equal(new dom.window.FormData(host.querySelector('form')).has('score'), false);
});

test('ref and focus stay on the group, which hands focus to the checked option', async () => {
  let ref;
  await render(h(Rating, { defaultValue: 3, ref: (node) => (ref = node), id: 'rating' }));
  assert.equal(ref, group());
  assert.equal(group().id, 'rating');
  await click(4);
  assert.equal(group().id, 'rating', 'the id does not follow the checked option');
  await act(async () => ref.focus());
  assert.equal(document.activeElement, radio(4));
});

test('RHF stores numbers, focuses the checked option on error, marks blur, and resets', async () => {
  let methods;
  function Form() {
    methods = useForm({ defaultValues: { score: 0 }, mode: 'onBlur' });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        {
          name: 'score',
          controlMode: 'value',
          registerOptions: { min: { value: 1, message: '평점을 선택하세요' } },
        },
        h(RhfField.Label, null, '만족도'),
        h(Rating, { step: 0.5 }),
        h(RhfField.Error),
      ),
    );
  }
  await render(h(Form));
  await click(3.5);
  assert.equal(methods.getValues('score'), 3.5);
  await act(async () => methods.setError('score', { message: '오류' }, { shouldFocus: true }));
  assert.equal(document.activeElement, radio(3.5));
  await act(async () => document.activeElement.blur());
  assert.equal(methods.getFieldState('score').isTouched, true);
  await act(async () => methods.reset());
  assert.equal(checked(), 0);
  await act(async () => methods.handleSubmit(() => assert.fail('invalid'))());
  assert.equal(document.activeElement, radio(0));
});
