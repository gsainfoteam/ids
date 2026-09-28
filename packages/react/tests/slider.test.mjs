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
  'HTMLInputElement',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
  'FocusEvent',
  'getComputedStyle',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, Slider } = await import('../dist/index.js');

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

const slider = () => host.querySelector('[data-slider]');
const thumbs = () => [...host.querySelectorAll('[role=slider]')];
const now = () => thumbs().map((thumb) => Number(thumb.getAttribute('aria-valuenow')));

async function key(target, name, init = {}) {
  await act(async () => {
    target.focus();
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }),
    );
  });
}
async function release(target, name) {
  await act(async () => {
    target.dispatchEvent(new KeyboardEvent('keyup', { key: name, bubbles: true }));
  });
}

function giveTrackA200pxBox() {
  const track = slider().querySelector('[data-orientation]:not([data-slider])') ?? slider();
  track.getBoundingClientRect = () => ({
    left: 0,
    right: 200,
    top: 0,
    bottom: 200,
    width: 200,
    height: 200,
    x: 0,
    y: 0,
  });
}
async function pointer(type, { x = 0, y = 0, id = 1, button = 0 } = {}) {
  await act(async () => {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button,
    });
    Object.defineProperty(event, 'pointerId', { value: id });
    Object.defineProperty(event, 'pointerType', { value: 'mouse' });
    slider().dispatchEvent(event);
  });
}

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

test('SSR: a single thumb carries the name and value, the root carries the Field id', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { size: 'tiny', invalid: true },
          h(Field.Label, null, 'Volume'),
          h(Field.Description, null, 'Loudness'),
          h(Slider, { name: 'volume', defaultValue: 30, formatLabel: (value) => `${value}%` }),
        ),
      ),
    ),
  ).window.document;
  const root = doc.querySelector('[data-slider]');
  const thumb = doc.querySelector('[role=slider]');
  assert.equal(doc.querySelector('label').htmlFor, root.id);
  assert.equal(root.hasAttribute('role'), false);
  assert.equal(thumb.getAttribute('aria-labelledby'), doc.querySelector('label').id);
  assert.equal(doc.getElementById(thumb.getAttribute('aria-describedby')).textContent, 'Loudness');
  assert.equal(thumb.getAttribute('aria-valuenow'), '30');
  assert.equal(thumb.getAttribute('aria-valuetext'), '30%');
  assert.equal(thumb.getAttribute('aria-invalid'), 'true');
  assert.equal(root.dataset.size, 'tiny');
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [['volume', '30']],
  );
});

test('SSR: a range is a labelled group whose thumbs bound each other', () => {
  const doc = new JSDOM(
    renderToString(
      h(Slider, {
        selectionMode: 'range',
        'aria-label': 'Price',
        name: 'price',
        defaultValue: [20, 70],
        step: 5,
        minStepsBetweenThumbs: 2,
      }),
    ),
  ).window.document;
  const root = doc.querySelector('[data-slider]');
  assert.equal(root.getAttribute('role'), 'group');
  assert.equal(root.getAttribute('aria-label'), 'Price');
  const [start, end] = doc.querySelectorAll('[role=slider]');
  assert.deepEqual(
    [start.getAttribute('aria-label'), end.getAttribute('aria-label')],
    ['시작', '끝'],
  );
  assert.equal(start.getAttribute('aria-valuemax'), '60', 'end minus two steps');
  assert.equal(end.getAttribute('aria-valuemin'), '30');
  assert.deepEqual(
    [...doc.querySelectorAll('input[type=hidden]')].map((input) => [input.name, input.value]),
    [
      ['price', '20'],
      ['price', '70'],
    ],
  );
});

test('keyboard follows the APG slider keys and commits once per key sequence', async () => {
  const changes = [];
  const commits = [];
  await render(
    h(Slider, {
      'aria-label': 'Volume',
      defaultValue: 50,
      onValueChange: (value) => changes.push(value),
      onValueCommit: (value) => commits.push(value),
    }),
  );
  const [thumb] = thumbs();
  await key(thumb, 'ArrowRight');
  await key(thumb, 'ArrowRight');
  await key(thumb, 'ArrowUp');
  assert.deepEqual(now(), [53]);
  assert.deepEqual(commits, [], 'nothing is committed while the key is held');
  await release(thumb, 'ArrowUp');
  assert.deepEqual(commits, [53]);
  await key(thumb, 'ArrowDown');
  await key(thumb, 'ArrowLeft');
  await key(thumb, 'PageDown');
  await key(thumb, 'ArrowRight', { shiftKey: true });
  assert.deepEqual(now(), [51]);
  await key(thumb, 'End');
  assert.deepEqual(now(), [100]);
  await key(thumb, 'Home');
  assert.deepEqual(now(), [0]);
  await act(async () => thumb.blur());
  assert.deepEqual(commits, [53, 0], 'leaving the thumb commits the pending keys');
  assert.equal(changes.at(-1), 0);
  const event = new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true, cancelable: true });
  await act(async () => thumb.dispatchEvent(event));
  assert.equal(event.defaultPrevented, true, 'a handled key does not scroll the page');
});

test('right-to-left flips the horizontal arrows only; vertical sliders go up', async () => {
  await render(h(Slider, { 'aria-label': 'RTL', defaultValue: 50, style: { direction: 'rtl' } }));
  await key(thumbs()[0], 'ArrowRight');
  assert.deepEqual(now(), [49]);
  await key(thumbs()[0], 'ArrowUp');
  assert.deepEqual(now(), [50]);
  await render(
    h(
      'div',
      { key: 'vertical' },
      h(Slider, { 'aria-label': 'V', orientation: 'vertical', defaultValue: 10 }),
    ),
  );
  assert.equal(thumbs()[0].getAttribute('aria-orientation'), 'vertical');
  await key(thumbs()[0], 'ArrowUp');
  await key(thumbs()[0], 'ArrowRight');
  assert.deepEqual(now(), [12]);
});

test('range thumbs never cross and keep minStepsBetweenThumbs apart', async () => {
  const changes = [];
  await render(
    h(Slider, {
      selectionMode: 'range',
      'aria-label': 'Price',
      defaultValue: [40, 50],
      step: 5,
      minStepsBetweenThumbs: 1,
      onValueChange: (value) => changes.push(value),
    }),
  );
  const [start, end] = thumbs();
  await key(start, 'End');
  assert.deepEqual(now(), [45, 50]);
  await key(end, 'Home');
  assert.deepEqual(now(), [45, 50], 'already as close as allowed');
  assert.deepEqual(changes, [[45, 50]]);
  assert.ok(Array.isArray(changes[0]), 'a range reports a [start, end] tuple');
});

test('pointer: a press moves the nearest thumb, a drag follows, the release commits once', async () => {
  const changes = [];
  const commits = [];
  await render(
    h(Slider, {
      'aria-label': 'Volume',
      defaultValue: 10,
      onValueChange: (value) => changes.push(value),
      onValueCommit: (value) => commits.push(value),
    }),
  );
  giveTrackA200pxBox();
  await pointer('pointerdown', { x: 100 });
  assert.deepEqual(now(), [50]);
  assert.equal(document.activeElement, thumbs()[0], 'the moved thumb takes focus');
  assert.ok(slider().hasAttribute('data-dragging'));
  await pointer('pointermove', { x: 150 });
  await pointer('pointermove', { x: 400 });
  assert.deepEqual(now(), [100], 'a drag past the end stops at max');
  assert.deepEqual(commits, []);
  await pointer('pointerup', { x: 400 });
  assert.deepEqual(commits, [100]);
  assert.deepEqual(changes, [50, 75, 100]);
  assert.equal(slider().hasAttribute('data-dragging'), false);
  await pointer('pointerdown', { x: 100, button: 2 });
  assert.deepEqual(now(), [100], 'a secondary button does nothing');
});

test('pointer: stacked range thumbs split by the direction of the first move', async () => {
  await render(
    h(Slider, { selectionMode: 'range', 'aria-label': 'Stack', defaultValue: [50, 50] }),
  );
  giveTrackA200pxBox();
  await pointer('pointerdown', { x: 100 });
  await pointer('pointermove', { x: 60 });
  assert.deepEqual(now(), [30, 50], 'moving down takes the lower thumb');
  await pointer('pointerup', { x: 60 });
  await pointer('pointerdown', { x: 60 });
  await pointer('pointerup', { x: 60 });
  await pointer('pointerdown', { x: 180 });
  assert.deepEqual(now(), [30, 90], 'a press past both thumbs takes the nearer one');
});

test('pointer: the thumb width, right-to-left and vertical tracks map to the drawn position', async () => {
  await render(
    h(Slider, { 'aria-label': 'Inset', defaultValue: 0, style: { '--slider-thumb': '20px' } }),
  );
  giveTrackA200pxBox();
  await pointer('pointerdown', { x: 10 });
  assert.deepEqual(now(), [0], 'half a thumb in from the start is the minimum');
  await pointer('pointermove', { x: 100 });
  assert.deepEqual(now(), [50]);
  await pointer('pointermove', { x: 190 });
  assert.deepEqual(now(), [100]);
  await pointer('pointerup', { x: 190 });
  await render(
    h('div', { key: 'rtl' }, h(Slider, { 'aria-label': 'RTL', style: { direction: 'rtl' } })),
  );
  giveTrackA200pxBox();
  await pointer('pointerdown', { x: 50 });
  assert.deepEqual(now(), [75]);
  await pointer('pointerup', { x: 50 });
  await render(
    h('div', { key: 'vertical' }, h(Slider, { 'aria-label': 'V', orientation: 'vertical' })),
  );
  giveTrackA200pxBox();
  await pointer('pointerdown', { y: 40 });
  assert.deepEqual(now(), [80]);
});

test('readOnly and disabled keep the value; readOnly still takes focus', async () => {
  const changes = [];
  await render(
    h(Slider, {
      'aria-label': 'Locked',
      readOnly: true,
      defaultValue: 30,
      onValueChange: (value) => changes.push(value),
    }),
  );
  giveTrackA200pxBox();
  assert.equal(thumbs()[0].getAttribute('aria-readonly'), 'true');
  await key(thumbs()[0], 'ArrowRight');
  await pointer('pointerdown', { x: 180 });
  assert.equal(document.activeElement, thumbs()[0]);
  assert.deepEqual(now(), [30]);
  await render(
    h(
      'form',
      { key: 'disabled' },
      h(Slider, { 'aria-label': 'Off', name: 'off', disabled: true, defaultValue: 30 }),
    ),
  );
  giveTrackA200pxBox();
  assert.equal(thumbs()[0].tabIndex, -1);
  assert.equal(thumbs()[0].getAttribute('aria-disabled'), 'true');
  await pointer('pointerdown', { x: 180 });
  assert.deepEqual(now(), [30]);
  assert.deepEqual(
    [...new window.FormData(host.querySelector('form'))],
    [],
    'a disabled slider is not submitted',
  );
  assert.deepEqual(changes, []);
});

test('controlled value, silent form reset and focus handed from the root to a thumb', async () => {
  let set;
  const changes = [];
  function Parent() {
    const [value, setValue] = useState([10, 20]);
    set = setValue;
    return h(Slider, {
      selectionMode: 'range',
      'aria-label': 'Range',
      value,
      onValueChange: (next) => changes.push(next),
    });
  }
  await render(h(Parent));
  await key(thumbs()[1], 'ArrowRight');
  assert.deepEqual(now(), [10, 20], 'a parent that does not follow keeps its value');
  await act(async () => set([30, 40]));
  assert.deepEqual(now(), [30, 40]);
  assert.deepEqual(changes, [[10, 21]]);
  let ref;
  const resets = [];
  await render(
    h(
      'form',
      { key: 'form' },
      h(Slider, {
        'aria-label': 'Volume',
        name: 'volume',
        defaultValue: 40,
        ref: (node) => (ref = node),
        onValueChange: (value) => resets.push(value),
      }),
    ),
  );
  await key(thumbs()[0], 'End');
  await act(async () => {
    host.querySelector('form').reset();
    await resetSettles();
    await Promise.resolve();
  });
  assert.deepEqual(now(), [40]);
  assert.deepEqual(resets, [100], 'the reset is not reported');
  assert.equal(host.querySelector('input[type=hidden]').value, '40');
  await act(async () => ref.focus());
  assert.equal(document.activeElement, thumbs()[0]);
});

test('parts: custom track, no range, thumb children and the value label switch', async () => {
  await render(
    h(
      Slider,
      { 'aria-label': 'Hue', defaultValue: 120, max: 360, valueLabel: 'never' },
      h(
        Slider.Track,
        { className: 'hue' },
        h(Slider.Thumb, null, (state) => h('b', { 'data-deg': '' }, `${state.thumbValue}deg`)),
      ),
    ),
  );
  assert.ok(host.querySelector('.hue'));
  assert.equal(
    host.querySelectorAll('[data-slider] [aria-hidden=true]').length,
    0,
    'no range, no label',
  );
  assert.equal(host.querySelector('[data-deg]').textContent, '120deg');
  await render(h('div', { key: 'label' }, h(Slider, { 'aria-label': 'L', defaultValue: 7 })));
  assert.equal(thumbs()[0].textContent, '7', 'the value label is drawn inside the thumb');
  assert.throws(() => renderToString(h(Slider.Thumb)), /inside Slider/);
  assert.throws(
    () =>
      renderToString(
        h(Slider, { 'aria-label': 'x' }, h(Slider.Track, null, h(Slider.Thumb, { index: 1 }))),
      ),
    /has no value/,
  );
});

test('invalid configuration throws', () => {
  assert.throws(() => renderToString(h(Slider, { min: 10, max: 10 })), /min/);
  assert.throws(() => renderToString(h(Slider, { step: 0 })), /step/);
  assert.throws(
    () => renderToString(h(Slider, { selectionMode: 'range', defaultValue: 5 })),
    /\[start, end\]/,
  );
  assert.throws(() => renderToString(h(Slider, { defaultValue: [1, 2] })), /number/);
});

test('react-hook-form controlMode="value": numbers in, error focus on the thumb', async () => {
  const { Field: RhfField } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods;
  function App() {
    methods = useForm({ defaultValues: { volume: 20 } });
    return h(
      FormProvider,
      methods,
      h(
        RhfField,
        {
          name: 'volume',
          controlMode: 'value',
          registerOptions: { min: { value: 30, message: 'Too quiet' } },
        },
        h(RhfField.Label, null, 'Volume'),
        h(Slider),
        h(RhfField.Error),
      ),
    );
  }
  await render(h(App));
  await key(thumbs()[0], 'PageUp');
  assert.equal(methods.getValues('volume'), 30);
  await act(async () =>
    methods.setError('volume', { message: 'Server says no' }, { shouldFocus: true }),
  );
  assert.equal(document.activeElement, thumbs()[0]);
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Server says no');
  await act(async () => methods.reset({ volume: 70 }));
  assert.deepEqual(now(), [70]);
});
