import { useState } from 'react';

import { converter } from 'culori';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ColorPicker } from '../src';
import { skipWithoutCdp } from './engines';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const slider = (name: string) => page.getByRole('slider', { name });
const textInput = () => page.getByRole('textbox', { name: '색상 값' });

function tracked(props: ColorPicker.Props = {}) {
  const changes: string[] = [];
  const node = <ColorPicker {...props} onValueChange={(value) => changes.push(value)} />;
  return { changes, node };
}

function recordKeys(target: HTMLElement) {
  const keys: Array<[string, boolean]> = [];
  target.addEventListener('keydown', (event) => keys.push([event.key, event.defaultPrevented]));
  return keys;
}

const ONE_HUE_STEP = 1;

function degreesInAPixelAndAStep(track: Element, thumb: Element) {
  return (
    360 / (track.getBoundingClientRect().width - thumb.getBoundingClientRect().width) + ONE_HUE_STEP
  );
}

const A_PIXEL_AND_A_HEX_STEP = (length: number) => 1 / length + 1 / 255;

const hsv = converter('hsv');

function whereTheThumbSits(track: HTMLElement, thumb: HTMLElement, value: number, max: number) {
  const { width, height } = track.getBoundingClientRect();
  const size = thumb.getBoundingClientRect().width;
  return { x: size / 2 + ((width - size) * value) / max, y: height / 2 };
}

async function acceptClipboardWritePrompt() {
  const session = cdp();
  const { targetInfo } = await session.send('Target.getTargetInfo');
  const { browserContextId } = targetInfo;
  await session.send('Browser.grantPermissions', {
    permissions: ['clipboardSanitizedWrite'],
    browserContextId,
  });
  return () => session.send('Browser.resetPermissions', { browserContextId });
}

test('SSR: one group with an area of two sliders, a hue slider, a text input and a palette', () => {
  const doc = parse(
    renderToString(
      <ColorPicker defaultValue="#3B82F6" swatches={['#3B82F6', 'nonsense', '#22C55E']} />,
    ),
  );
  const group = doc.querySelector('[data-color-picker]')!;
  expect(group.getAttribute('role')).toBe('group');
  expect(group.getAttribute('aria-label')).toBe('색상 선택');
  const [saturation, brightness] = doc.querySelectorAll('[data-color-picker-area] input');
  expect(saturation!.getAttribute('aria-label')).toBe('채도');
  expect(saturation!.getAttribute('aria-roledescription')).toBe('2D 슬라이더');
  expect(saturation!.getAttribute('aria-valuetext')).toBe('채도 76%, 밝기 96%');
  expect(brightness!.getAttribute('aria-orientation')).toBe('vertical');
  expect(brightness!.getAttribute('aria-valuetext')).toBe('채도 76%, 밝기 96%');
  expect(doc.querySelector('[data-color-picker-area]')!.getAttribute('dir')).toBe('ltr');
  expect(doc.querySelector('[data-color-picker-hue]')!.getAttribute('dir')).toBe('ltr');
  expect(brightness!.getAttribute('tabindex')).toBe('-1');
  const hue = doc.querySelector('[data-color-picker-hue] [role=slider]')!;
  expect(hue.getAttribute('aria-label')).toBe('색조');
  expect(hue.getAttribute('aria-valuetext')).toBe('217도');
  expect(
    ['aria-valuemin', 'aria-valuemax', 'aria-valuenow'].map((name) => hue.getAttribute(name)),
  ).toEqual(['0', '360', '217']);
  expect(
    doc.querySelector('[data-color-picker-hue] input'),
    'the thumb is not an input',
  ).toBeNull();
  expect(doc.querySelector('[aria-label="투명도"]'), 'no alpha slider without alpha').toBeNull();
  const input = doc.querySelector<HTMLInputElement>('[data-color-picker-input]')!;
  expect(input.value).toBe('#3B82F6');
  expect(input.type).toBe('text');
  expect(input.closest<HTMLElement>('[data-text-field]')!.dataset.size, 'a TextField box').toBe(
    'standard',
  );
  const palette = doc.querySelector('[role=radiogroup]')!;
  expect(palette.getAttribute('aria-label')).toBe('팔레트');
  const radios = [...palette.querySelectorAll<HTMLInputElement>('input[type=radio]')];
  expect(radios, 'an unreadable swatch is skipped').toHaveLength(2);
  expect(radios.map((radio) => [radio.value, radio.checked])).toEqual([
    ['#3B82F6', true],
    ['#22C55E', false],
  ]);
  expect(radios[0]!.name, 'one native radio group').toBe(radios[1]!.name);
  expect(doc.querySelector('[data-color-picker-eyedropper]')).toBeNull();
  expect(doc.querySelector('[data-color-picker-copy]')).toBeNull();
});

test('the area takes arrows for both axes, Shift for bigger steps, Home and End', async () => {
  const state = tracked({ defaultValue: '#FF0000' });
  const screen = await render(state.node);
  const keys = recordKeys(screen.container);
  const area = slider('채도');
  await userEvent.keyboard('{Tab}');
  await expect.element(area).toHaveFocus();
  await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
  expect(keys.at(-1)).toEqual(['ArrowDown', true]);
  expect(state.changes).toEqual(['#E60000']);
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(area).toHaveAttribute('aria-valuetext', '채도 99%, 밝기 90%');
  await userEvent.keyboard('{Home}');
  expect(state.changes.at(-1)).toBe('#E6E6E6');
  slider('밝기').element().focus();
  await userEvent.keyboard('{PageDown}');
  expect(state.changes.at(-1), 'PageDown works from the vertical input too').toBe('#CCCCCC');
});

test('black and grays keep the hue and saturation the user dragged through', async () => {
  const state = tracked({ defaultValue: '#0000FF' });
  await render(state.node);
  await userEvent.keyboard('{Tab}');
  await expect.element(slider('채도')).toHaveFocus();
  await userEvent.keyboard(`{Shift>}${'{ArrowDown}'.repeat(11)}{/Shift}`);
  expect(state.changes.at(-1)).toBe('#000000');
  await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
  expect(state.changes.at(-1), 'blue comes back, not red').toBe('#00001A');
});

test('hue and alpha are Sliders: keys, Shift and page steps, and a press on the track', async () => {
  const state = tracked({ defaultValue: '#FF000080', alpha: true, format: 'rgb' });
  const screen = await render(state.node);
  const hue = slider('색조');
  hue.element().focus();
  await userEvent.keyboard('{PageUp}');
  await expect.element(hue).toHaveAttribute('aria-valuetext', '10도');
  await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
  await expect
    .element(hue, { message: 'Shift moves ten degrees' })
    .toHaveAttribute('aria-valuetext', '20도');
  await userEvent.keyboard('{End}');
  await expect.element(hue).toHaveAttribute('aria-valuetext', '360도');
  const track = screen.container.querySelector<HTMLElement>(
    '[data-color-picker-hue] [data-orientation]:not([data-slider])',
  )!;
  await userEvent.click(track, {
    position: whereTheThumbSits(track, hue.element() as HTMLElement, 120, 360),
  });
  const pressedHue = Number(hue.element().getAttribute('aria-valuenow'));
  expect(Math.abs(pressedHue - 120)).toBeLessThanOrEqual(
    degreesInAPixelAndAStep(track, hue.element()),
  );
  await expect.element(hue, { message: 'a press focuses the thumb' }).toHaveFocus();
  const alpha = slider('투명도');
  alpha.element().focus();
  await userEvent.keyboard('{Home}');
  expect(state.changes.at(-1)).toMatch(/^rgba\(\d+, 255, \d+, 0\)$/);
  await expect.element(alpha).toHaveAttribute('aria-valuetext', '0%');
  await userEvent.keyboard('{PageUp}');
  expect(state.changes.at(-1)).toMatch(/^rgba\(\d+, 255, \d+, 0\.1\)$/);
});

test('pressing on the area sets both axes from the pointer and focuses the area', async () => {
  const state = tracked({ defaultValue: '#FF0000' });
  const screen = await render(<div style={{ padding: 32 }}>{state.node}</div>);
  const area = screen.container.querySelector<HTMLElement>('[data-color-picker-area]')!;
  const { width, height } = area.getBoundingClientRect();
  const quarterIn = { x: width / 4, y: height / 4 };
  await userEvent.click(area, { position: quarterIn });
  expect(state.changes).toHaveLength(1);
  const pressed = hsv(state.changes[0]!)!;
  expect(Math.abs(pressed.s - 0.25), 'saturation 25%').toBeLessThanOrEqual(
    A_PIXEL_AND_A_HEX_STEP(width),
  );
  expect(Math.abs(pressed.v - 0.75), 'brightness 75%').toBeLessThanOrEqual(
    A_PIXEL_AND_A_HEX_STEP(height),
  );
  await expect.element(slider('채도')).toHaveFocus();
  await userEvent.dragAndDrop(area, area, {
    sourcePosition: quarterIn,
    targetPosition: { x: width + 16, y: -16 },
    force: true,
  });
  expect(state.changes.at(-1), 'a captured drag keeps updating').toBe('#FF0000');
});

test('typed text is a draft until Enter or blur; unreadable text is reverted', async () => {
  const state = tracked({ defaultValue: '#3B82F6' });
  const screen = await render(state.node);
  const keys = recordKeys(screen.container);
  const input = textInput();
  await userEvent.fill(input, '#12');
  expect(state.changes, 'nothing is committed while typing').toEqual([]);
  await userEvent.fill(input, '22c55e');
  await userEvent.keyboard('{Enter}');
  expect(keys.at(-1)).toEqual(['Enter', true]);
  expect(state.changes, 'hex without # is read').toEqual(['#22C55E']);
  await expect.element(input).toHaveValue('#22C55E');
  await userEvent.fill(input, 'nope');
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  expect(
    input.element().closest('[data-text-field]')!.hasAttribute('data-invalid'),
    'the TextField box',
  ).toBe(true);
  await userEvent.keyboard('{Enter}');
  await expect
    .element(input, { message: 'Enter keeps an unreadable draft so it can be fixed' })
    .toHaveValue('nope');
  await userEvent.keyboard('{Escape}');
  expect(keys.at(-1), 'the first Escape only drops the draft').toEqual(['Escape', true]);
  await expect.element(input).toHaveValue('#22C55E');
  await userEvent.keyboard('{Escape}');
  expect(keys.at(-1), 'with no draft Escape is left to the popup').toEqual(['Escape', false]);
  await userEvent.fill(input, 'rgb(255, 0, 0)');
  await userEvent.keyboard('{Tab}');
  expect(state.changes.at(-1), 'blur commits a readable draft').toBe('#FF0000');
  await userEvent.fill(input, 'still nope');
  await userEvent.keyboard('{Tab}');
  await expect.element(input, { message: 'blur drops an unreadable draft' }).toHaveValue('#FF0000');
  await userEvent.fill(input, 'rebeccapurple');
  await userEvent.keyboard('{Enter}');
  expect(state.changes.at(-1), 'a named color is read').toBe('#663399');
  await userEvent.fill(input, 'oklch(0.9 0.4 20)');
  await userEvent.keyboard('{Enter}');
  expect(state.changes.at(-1), 'a color outside sRGB is clipped into it').toBe('#FF0061');
  await userEvent.clear(input);
  await userEvent.keyboard('{Enter}');
  expect(state.changes.at(-1), 'an emptied field clears the value').toBe('');
});

test('swatches are one RadioGroup: a click or Home and End choose, and no form sees them', async () => {
  const state = tracked({
    defaultValue: '#22C55E',
    swatches: ['#EF4444', { value: '#22C55E', label: 'Green' }, '#3B82F6'],
  });
  const screen = await render(<form>{state.node}</form>);
  const form = screen.container.querySelector('form')!;
  const radios = () => [
    ...screen.container.querySelectorAll<HTMLInputElement>('input[type=radio]'),
  ];
  const green = page.getByRole('radio', { name: 'Green' });
  await expect.element(green).toHaveAttribute('title', 'Green');
  await expect.element(green).toBeChecked();
  expect(radios().every((radio) => radio.form === null)).toBe(true);
  expect([...new FormData(form)]).toEqual([]);
  await userEvent.click(page.getByRole('radio', { name: '#3B82F6' }));
  expect(state.changes.at(-1)).toBe('#3B82F6');
  await expect.element(page.getByRole('radio', { name: '#3B82F6' })).toBeChecked();
  await userEvent.keyboard('{Home}');
  expect(state.changes.at(-1)).toBe('#EF4444');
  await expect.element(page.getByRole('radio', { name: '#EF4444' })).toHaveFocus();
  await userEvent.keyboard('{End}');
  expect(state.changes.at(-1)).toBe('#3B82F6');
  expect([...new FormData(form)]).toEqual([]);

  const readOnly = tracked({
    defaultValue: '#EF4444',
    readOnly: true,
    swatches: ['#EF4444', '#3B82F6'],
  });
  await screen.rerender(<div key="read-only">{readOnly.node}</div>);
  await userEvent.click(page.getByRole('radio', { name: '#3B82F6' }));
  await expect
    .element(page.getByRole('radio', { name: '#EF4444' }), {
      message: 'a read-only palette keeps its color',
    })
    .toBeChecked();
  expect(readOnly.changes).toEqual([]);
});

test('a Swatch on its own is a radio checked by the color it shows', async () => {
  const changes: string[] = [];
  await render(
    <ColorPicker defaultValue="#3B82F6" onValueChange={(value) => changes.push(value)}>
      <ColorPicker.Swatch value="#3B82F6" label="Blue" />
      <ColorPicker.Swatch value="#EF4444" label="Red" />
    </ColorPicker>,
  );
  const blue = page.getByRole('radio', { name: 'Blue' });
  const red = page.getByRole('radio', { name: 'Red' });
  await expect.element(blue).toBeChecked();
  await expect.element(red).not.toBeChecked();
  await userEvent.click(red);
  expect(changes).toEqual(['#EF4444']);
  await expect.element(blue).not.toBeChecked();
  await expect.element(red).toBeChecked();
});

test('eyedropper: shown only where the API exists; a cancelled pick changes nothing', async () => {
  try {
    vi.stubGlobal('EyeDropper', undefined);
    const without = await render(<ColorPicker defaultValue="#FFFFFF80" alpha />);
    expect(without.container.querySelector('[data-color-picker-eyedropper]')).toBeNull();
    await without.unmount();

    let next: { sRGBHex: string } | Error = { sRGBHex: '#123456' };
    const open = vi.fn(() =>
      next instanceof Error ? Promise.reject(next) : Promise.resolve(next),
    );
    vi.stubGlobal(
      'EyeDropper',
      class {
        open = open;
      },
    );
    const state = tracked({ defaultValue: '#FFFFFF80', alpha: true });
    await render(state.node);
    const button = page.getByRole('button', { name: '화면에서 색 고르기' });
    await expect.element(button).toHaveAttribute('data-variant', 'outline');
    await expect.element(button).toHaveAttribute('data-size', 'standard');
    await userEvent.click(button);
    await expect
      .poll(() => state.changes.at(-1), { message: 'the picked color keeps the alpha' })
      .toBe('#12345680');
    next = new Error('AbortError');
    await userEvent.click(button);
    await expect.poll(() => open.mock.settledResults.at(-1)?.type).toBe('rejected');
    expect(open).toHaveBeenCalledTimes(2);
    expect(state.changes).toHaveLength(1);
  } finally {
    vi.unstubAllGlobals();
  }
});

test('copy writes the shown value and announces it', async (context) => {
  skipWithoutCdp(context);
  const revokeClipboardWrite = await acceptClipboardWritePrompt();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  try {
    const onClick = vi.fn();
    const screen = await render(
      <>
        <ColorPicker defaultValue="#3B82F6" format="hsl" size="tiny">
          <ColorPicker.Copy onClick={onClick} />
        </ColorPicker>
        <input aria-label="Paste target" />
      </>,
    );
    const button = page.getByRole('button', { name: '색상 값 복사' });
    await expect.element(button).toHaveAttribute('data-variant', 'outline');
    await expect.element(button).toHaveAttribute('data-size', 'tiny');
    await userEvent.click(button);
    expect(onClick, "the part's own onClick runs as well").toHaveBeenCalledOnce();
    await expect.element(page.getByRole('status')).toHaveTextContent('복사했습니다');
    const copied = page.elementLocator(screen.container.querySelector('[data-color-picker-copy]')!);
    await expect.element(copied).toHaveAttribute('aria-label', '복사했습니다');
    await expect.element(copied).toHaveAttribute('data-copied');
    const target = page.getByRole('textbox', { name: 'Paste target' });
    await userEvent.click(target);
    await userEvent.paste();
    await expect.element(target).toHaveValue('hsl(217.22, 91.22%, 59.8%)');
  } finally {
    vi.useRealTimers();
    await revokeClipboardWrite();
  }
});

function ControlledPicker({ onValueChange }: { onValueChange: (value: string) => void }) {
  const [value, setValue] = useState('#808080');
  return (
    <>
      <ColorPicker
        value={value}
        onValueChange={(next) => {
          onValueChange(next);
          setValue(next);
        }}
      />
      <button type="button" onClick={() => setValue('#00FF00')}>
        Outside
      </button>
    </>
  );
}

test('controlled, read-only and disabled', async () => {
  const changes: string[] = [];
  const screen = await render(<ControlledPicker onValueChange={(next) => changes.push(next)} />);
  await userEvent.click(page.getByRole('button', { name: 'Outside' }));
  await expect.element(textInput()).toHaveValue('#00FF00');
  expect(changes, 'an outside change is not echoed').toEqual([]);

  const readOnly = tracked({ defaultValue: '#FF0000', readOnly: true });
  await screen.rerender(readOnly.node);
  slider('채도').element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  slider('색조').element().focus();
  await userEvent.keyboard('{PageUp}');
  await expect.element(textInput()).toHaveAttribute('readonly');
  await expect.element(slider('채도')).toHaveAttribute('aria-valuetext', '채도 100%, 밝기 100%');
  await expect.element(slider('색조')).toHaveAttribute('aria-readonly', 'true');
  await expect.element(slider('색조')).toHaveAttribute('aria-valuetext', '0도');
  expect(readOnly.changes).toEqual([]);

  await screen.rerender(
    <div key="disabled">{tracked({ defaultValue: '#FF0000', disabled: true }).node}</div>,
  );
  await expect.element(slider('채도')).toHaveAttribute('disabled');
  await expect.element(slider('색조')).toHaveAttribute('aria-disabled', 'true');
  await expect.element(slider('색조')).toHaveAttribute('tabindex', '-1');
  await expect
    .element(page.elementLocator(screen.container.querySelector('[data-color-picker]')!))
    .toHaveAttribute('data-disabled');
});

test('composition renders only the parts it is given', async () => {
  const screen = await render(
    <ColorPicker defaultValue="#22C55E" swatches={['#22C55E']}>
      <ColorPicker.HueSlider />
      <ColorPicker.Input />
    </ColorPicker>,
  );
  expect(screen.container.querySelector('[data-color-picker-area]')).toBeNull();
  expect(screen.container.querySelector('[role=radiogroup]')).toBeNull();
  await expect.element(slider('색조')).toBeInTheDocument();
  await expect.element(textInput()).toBeInTheDocument();
});

test('with no value the controls start on a full red and the value stays empty', () => {
  const doc = parse(renderToString(<ColorPicker />));
  expect(doc.querySelector('[data-color-picker-area] input')!.getAttribute('aria-valuetext')).toBe(
    '채도 100%, 밝기 100%',
  );
  expect(doc.querySelector('[aria-label="색조"]')!.getAttribute('aria-valuetext')).toBe('0도');
  expect(doc.querySelector<HTMLInputElement>('[data-color-picker-input]')!.value).toBe('');
  expect(doc.querySelector('[data-color-picker]')!.hasAttribute('data-empty')).toBe(true);
});
