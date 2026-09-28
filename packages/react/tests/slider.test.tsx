import { useState, type CSSProperties } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { cdp, page, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, Slider } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

type Point = { x: number; y: number };

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const now = () =>
  page
    .getByRole('slider')
    .elements()
    .map((thumb) => Number(thumb.getAttribute('aria-valuenow')));
const rootOf = (thumb: Locator) => thumb.element().closest<HTMLElement>('[data-slider]')!;
const roomToDragPastTheEnd: CSSProperties = { width: 200 };

function drawnAt(thumb: Locator, fraction: number): Point {
  const node = thumb.element();
  const track = node.parentElement!.getBoundingClientRect();
  const { width, height } = node.getBoundingClientRect();
  if (node.getAttribute('aria-orientation') === 'vertical')
    return {
      x: track.left + track.width / 2,
      y: track.bottom - height / 2 - fraction * (track.height - height),
    };
  const fromStart = width / 2 + fraction * (track.width - width);
  const rtl = getComputedStyle(node).direction === 'rtl';
  return {
    x: rtl ? track.right - fromStart : track.left + fromStart,
    y: track.top + track.height / 2,
  };
}

function pastTheEnd(thumb: Locator): Point {
  const track = thumb.element().parentElement!.getBoundingClientRect();
  return { x: track.right + track.width / 2, y: track.top + track.height / 2 };
}

async function mouse(
  type: 'mousePressed' | 'mouseMoved' | 'mouseReleased',
  { x, y }: Point,
  button: 'left' | 'right' = 'left',
) {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    x: frame.left + x * scale,
    y: frame.top + y * scale,
    button,
    buttons: type === 'mouseReleased' ? 0 : button === 'left' ? 1 : 2,
    clickCount: 1,
  });
}
const press = (point: Point, button?: 'left' | 'right') => mouse('mousePressed', point, button);
const drag = (point: Point) => mouse('mouseMoved', point);
const release = (point: Point, button?: 'left' | 'right') => mouse('mouseReleased', point, button);

async function keydownPrevented(keys: string, key: string) {
  const prevented: boolean[] = [];
  const observe = (event: KeyboardEvent) => {
    if (event.key === key) prevented.push(event.defaultPrevented);
  };
  window.addEventListener('keydown', observe);
  try {
    await userEvent.keyboard(keys);
  } finally {
    window.removeEventListener('keydown', observe);
  }
  return prevented;
}

test('SSR: a single thumb carries the name and value, the root carries the Field id', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field size="tiny" invalid>
          <Field.Label>Volume</Field.Label>
          <Field.Description>Loudness</Field.Description>
          <Slider name="volume" defaultValue={30} formatLabel={(value) => `${value}%`} />
        </Field>
      </form>,
    ),
  );
  const root = doc.querySelector<HTMLElement>('[data-slider]')!;
  const thumb = doc.querySelector('[role=slider]')!;
  expect(doc.querySelector('label')!.htmlFor).toBe(root.id);
  expect(root.hasAttribute('role')).toBe(false);
  expect(thumb.getAttribute('aria-labelledby')).toBe(doc.querySelector('label')!.id);
  expect(doc.getElementById(thumb.getAttribute('aria-describedby')!)!.textContent).toBe('Loudness');
  expect(thumb.getAttribute('aria-valuenow')).toBe('30');
  expect(thumb.getAttribute('aria-valuetext')).toBe('30%');
  expect(thumb.getAttribute('aria-invalid')).toBe('true');
  expect(root.dataset.size).toBe('tiny');
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([['volume', '30']]);
});

test('SSR: a range is a labelled group whose thumbs bound each other', () => {
  const doc = parse(
    renderToString(
      <Slider
        selectionMode="range"
        aria-label="Price"
        name="price"
        defaultValue={[20, 70]}
        step={5}
        minStepsBetweenThumbs={2}
      />,
    ),
  );
  const root = doc.querySelector('[data-slider]')!;
  expect(root.getAttribute('role')).toBe('group');
  expect(root.getAttribute('aria-label')).toBe('Price');
  const [start, end] = doc.querySelectorAll('[role=slider]');
  expect([start.getAttribute('aria-label'), end.getAttribute('aria-label')]).toEqual([
    '시작',
    '끝',
  ]);
  expect(start.getAttribute('aria-valuemax'), 'end minus two steps').toBe('60');
  expect(end.getAttribute('aria-valuemin')).toBe('30');
  expect(
    [...doc.querySelectorAll<HTMLInputElement>('input[type=hidden]')].map((input) => [
      input.name,
      input.value,
    ]),
  ).toEqual([
    ['price', '20'],
    ['price', '70'],
  ]);
});

test('keyboard follows the APG slider keys and commits once per key sequence', async () => {
  const changes: number[] = [];
  const commits: number[] = [];
  const screen = await render(
    <Slider
      aria-label="Volume"
      defaultValue={50}
      onValueChange={(value) => changes.push(value)}
      onValueCommit={(value) => commits.push(value)}
    />,
  );
  const thumb = screen.getByRole('slider', { name: 'Volume' });
  thumb.element().focus();
  await userEvent.keyboard('{ArrowRight>2}{ArrowUp>}');
  await expect.poll(now).toEqual([53]);
  expect(commits, 'nothing is committed while the key is held').toEqual([]);
  await userEvent.keyboard('{/ArrowUp}');
  expect(commits).toEqual([53]);
  await userEvent.keyboard('{/ArrowRight}');
  expect(commits).toEqual([53]);
  await userEvent.keyboard('{ArrowDown>}{ArrowLeft>}{PageDown>}{Shift>}{ArrowRight>}');
  await expect.poll(now).toEqual([51]);
  await userEvent.keyboard('{End>}');
  await expect.poll(now).toEqual([100]);
  await userEvent.keyboard('{Home>}');
  await expect.poll(now).toEqual([0]);
  thumb.element().blur();
  expect(commits, 'leaving the thumb commits the pending keys').toEqual([53, 0]);
  expect(changes.at(-1)).toBe(0);
  await userEvent.cleanup();
  thumb.element().focus();
  expect(
    await keydownPrevented('{PageUp}', 'PageUp'),
    'a handled key does not scroll the page',
  ).toEqual([true]);
});

test('right-to-left flips the horizontal arrows only; vertical sliders go up', async () => {
  const screen = await render(
    <Slider aria-label="RTL" defaultValue={50} style={{ direction: 'rtl' }} />,
  );
  screen.getByRole('slider', { name: 'RTL' }).element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(now).toEqual([49]);
  await userEvent.keyboard('{ArrowUp}');
  await expect.poll(now).toEqual([50]);
  await screen.rerender(
    <div key="vertical">
      <Slider aria-label="V" orientation="vertical" defaultValue={10} />
    </div>,
  );
  const vertical = screen.getByRole('slider', { name: 'V' });
  await expect.element(vertical).toHaveAttribute('aria-orientation', 'vertical');
  vertical.element().focus();
  await userEvent.keyboard('{ArrowUp}{ArrowRight}');
  await expect.poll(now).toEqual([12]);
});

test('range thumbs never cross and keep minStepsBetweenThumbs apart', async () => {
  const changes: Array<[number, number]> = [];
  const screen = await render(
    <Slider
      selectionMode="range"
      aria-label="Price"
      defaultValue={[40, 50]}
      step={5}
      minStepsBetweenThumbs={1}
      onValueChange={(value) => changes.push(value)}
    />,
  );
  screen.getByRole('slider', { name: '시작' }).element().focus();
  await userEvent.keyboard('{End}');
  await expect.poll(now).toEqual([45, 50]);
  screen.getByRole('slider', { name: '끝' }).element().focus();
  await userEvent.keyboard('{Home}');
  await expect.poll(now, { message: 'already as close as allowed' }).toEqual([45, 50]);
  expect(changes).toEqual([[45, 50]]);
  expect(Array.isArray(changes[0]), 'a range reports a [start, end] tuple').toBe(true);
});

test('pointer: a press moves the nearest thumb, a drag follows, the release commits once', async () => {
  const changes: number[] = [];
  const commits: number[] = [];
  const screen = await render(
    <Slider
      aria-label="Volume"
      defaultValue={10}
      style={roomToDragPastTheEnd}
      onValueChange={(value) => changes.push(value)}
      onValueCommit={(value) => commits.push(value)}
    />,
  );
  const thumb = screen.getByRole('slider', { name: 'Volume' });
  const beyond = pastTheEnd(thumb);
  await press(drawnAt(thumb, 0.5));
  await expect.poll(now).toEqual([50]);
  await expect.element(thumb, { message: 'the moved thumb takes focus' }).toHaveFocus();
  await expect.element(rootOf(thumb)).toHaveAttribute('data-dragging');
  await drag(drawnAt(thumb, 0.75));
  await expect.poll(now).toEqual([75]);
  await drag(beyond);
  await expect.poll(now, { message: 'a drag past the end stops at max' }).toEqual([100]);
  expect(commits).toEqual([]);
  await release(beyond);
  expect(commits).toEqual([100]);
  expect(changes).toEqual([50, 75, 100]);
  await expect.element(rootOf(thumb)).not.toHaveAttribute('data-dragging');
  await press(drawnAt(thumb, 0.5), 'right');
  await release(drawnAt(thumb, 0.5), 'right');
  expect(now(), 'a secondary button does nothing').toEqual([100]);
});

test('pointer: stacked range thumbs split by the direction of the first move', async () => {
  const screen = await render(
    <Slider selectionMode="range" aria-label="Stack" defaultValue={[50, 50]} />,
  );
  const thumb = screen.getByRole('slider', { name: '시작' });
  await press(drawnAt(thumb, 0.5));
  await drag(drawnAt(thumb, 0.3));
  await expect.poll(now, { message: 'moving down takes the lower thumb' }).toEqual([30, 50]);
  await release(drawnAt(thumb, 0.3));
  await press(drawnAt(thumb, 0.3));
  await release(drawnAt(thumb, 0.3));
  await press(drawnAt(thumb, 0.9));
  await expect
    .poll(now, { message: 'a press past both thumbs takes the nearer one' })
    .toEqual([30, 90]);
  await release(drawnAt(thumb, 0.9));
});

test('pointer: the thumb width, right-to-left and vertical tracks map to the drawn position', async () => {
  const screen = await render(
    <Slider
      aria-label="Inset"
      defaultValue={0}
      style={{ '--slider-thumb': '20px' } as CSSProperties}
    />,
  );
  const inset = screen.getByRole('slider', { name: 'Inset' });
  await press(drawnAt(inset, 0));
  await expect.poll(now, { message: 'half a thumb in from the start is the minimum' }).toEqual([0]);
  await drag(drawnAt(inset, 0.5));
  await expect.poll(now).toEqual([50]);
  await drag(drawnAt(inset, 1));
  await expect.poll(now).toEqual([100]);
  await release(drawnAt(inset, 1));
  await screen.rerender(
    <div key="rtl">
      <Slider aria-label="RTL" style={{ direction: 'rtl' }} />
    </div>,
  );
  const rtl = screen.getByRole('slider', { name: 'RTL' });
  await press(drawnAt(rtl, 0.75));
  await expect.poll(now).toEqual([75]);
  await release(drawnAt(rtl, 0.75));
  await screen.rerender(
    <div key="vertical">
      <Slider aria-label="V" orientation="vertical" />
    </div>,
  );
  const vertical = screen.getByRole('slider', { name: 'V' });
  await press(drawnAt(vertical, 0.8));
  await expect.poll(now).toEqual([80]);
  await release(drawnAt(vertical, 0.8));
});

test('readOnly and disabled keep the value; readOnly still takes focus', async () => {
  const changes: number[] = [];
  const screen = await render(
    <Slider
      aria-label="Locked"
      readOnly
      defaultValue={30}
      onValueChange={(value) => changes.push(value)}
    />,
  );
  const locked = screen.getByRole('slider', { name: 'Locked' });
  await expect.element(locked).toHaveAttribute('aria-readonly', 'true');
  locked.element().focus();
  await userEvent.keyboard('{ArrowRight}');
  locked.element().blur();
  await press(drawnAt(locked, 0.9));
  await release(drawnAt(locked, 0.9));
  await expect.element(locked).toHaveFocus();
  expect(now()).toEqual([30]);
  await screen.rerender(
    <form key="disabled">
      <Slider aria-label="Off" name="off" disabled defaultValue={30} />
    </form>,
  );
  const off = screen.getByRole('slider', { name: 'Off' });
  await expect.element(off).toHaveAttribute('tabindex', '-1');
  await expect.element(off).toHaveAttribute('aria-disabled', 'true');
  await press(drawnAt(off, 0.9));
  await release(drawnAt(off, 0.9));
  expect(now()).toEqual([30]);
  expect(
    [...new FormData(screen.container.querySelector('form')!)],
    'a disabled slider is not submitted',
  ).toEqual([]);
  expect(changes).toEqual([]);
});

test('controlled value, silent form reset and focus handed from the root to a thumb', async () => {
  const changes: Array<[number, number]> = [];
  let setValue!: (next: [number, number]) => void;
  function Parent() {
    const [value, set] = useState<[number, number]>([10, 20]);
    setValue = set;
    return (
      <Slider
        selectionMode="range"
        aria-label="Range"
        value={value}
        onValueChange={(next) => changes.push(next)}
      />
    );
  }
  const screen = await render(<Parent />);
  screen.getByRole('slider', { name: '끝' }).element().focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(now(), 'a parent that does not follow keeps its value').toEqual([10, 20]);
  setValue([30, 40]);
  await expect.poll(now).toEqual([30, 40]);
  expect(changes).toEqual([[10, 21]]);
  let root: HTMLDivElement | null = null;
  const resets: number[] = [];
  await screen.rerender(
    <form key="form">
      <Slider
        aria-label="Volume"
        name="volume"
        defaultValue={40}
        ref={(node) => {
          root = node;
        }}
        onValueChange={(value) => resets.push(value)}
      />
      <button type="reset">Reset</button>
    </form>,
  );
  const volume = screen.getByRole('slider', { name: 'Volume' });
  volume.element().focus();
  await userEvent.keyboard('{End}');
  await expect.poll(now).toEqual([100]);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.poll(now).toEqual([40]);
  expect(resets, 'the reset is not reported').toEqual([100]);
  await expect
    .element(screen.container.querySelector<HTMLInputElement>('input[type=hidden]'))
    .toHaveValue('40');
  root!.focus();
  await expect.element(volume).toHaveFocus();
});

test('parts: custom track, no range, thumb children and the value label switch', async () => {
  const screen = await render(
    <Slider aria-label="Hue" defaultValue={120} max={360} valueLabel="never">
      <Slider.Track className="hue">
        <Slider.Thumb>{(state) => <b data-deg="">{`${state.thumbValue}deg`}</b>}</Slider.Thumb>
      </Slider.Track>
    </Slider>,
  );
  expect(screen.container.querySelector('.hue')).not.toBeNull();
  expect(
    screen.container.querySelectorAll('[data-slider] [aria-hidden=true]'),
    'no range, no label',
  ).toHaveLength(0);
  await expect
    .element(screen.container.querySelector<HTMLElement>('[data-deg]'))
    .toHaveTextContent('120deg');
  await screen.rerender(
    <div key="label">
      <Slider aria-label="L" defaultValue={7} />
    </div>,
  );
  await expect
    .element(screen.getByRole('slider', { name: 'L' }), {
      message: 'the value label is drawn inside the thumb',
    })
    .toHaveTextContent('7');
  expect(() => renderToString(<Slider.Thumb />)).toThrow(/inside Slider/);
  expect(() =>
    renderToString(
      <Slider aria-label="x">
        <Slider.Track>
          <Slider.Thumb index={1} />
        </Slider.Track>
      </Slider>,
    ),
  ).toThrow(/has no value/);
});

test('invalid configuration throws', () => {
  expect(() => renderToString(<Slider min={10} max={10} />)).toThrow(/min/);
  expect(() => renderToString(<Slider step={0} />)).toThrow(/step/);
  expect(() =>
    // @ts-expect-error -- a range takes a [start, end] tuple, not a number
    renderToString(<Slider selectionMode="range" defaultValue={5} />),
  ).toThrow(/\[start, end\]/);
  expect(() =>
    // @ts-expect-error -- a single slider takes a number, not a tuple
    renderToString(<Slider defaultValue={[1, 2]} />),
  ).toThrow(/number/);
});

test('react-hook-form controlMode="value": numbers in, error focus on the thumb', async () => {
  let methods!: UseFormReturn<{ volume: number }>;
  function App() {
    methods = useForm<{ volume: number }>({ defaultValues: { volume: 20 } });
    return (
      <FormProvider {...methods}>
        <RHFField
          name="volume"
          controlMode="value"
          registerOptions={{ min: { value: 30, message: 'Too quiet' } }}
        >
          <RHFField.Label>Volume</RHFField.Label>
          <Slider />
          <RHFField.Error />
        </RHFField>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const thumb = screen.getByRole('slider', { name: 'Volume' });
  thumb.element().focus();
  await userEvent.keyboard('{PageUp}');
  expect(methods.getValues('volume')).toBe(30);
  methods.setError('volume', { message: 'Server says no' }, { shouldFocus: true });
  await expect.element(thumb).toHaveFocus();
  await expect
    .element(screen.getByText('Server says no'))
    .toHaveAttribute('data-field-part', 'error');
  methods.reset({ volume: 70 });
  await expect.poll(now).toEqual([70]);
});
