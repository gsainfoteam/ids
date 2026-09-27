import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import {
  clamp,
  hsvaToRgba,
  parseColor,
  parseColorInput,
  rgbaToHsva,
  sameColor,
  serializeColor,
  type ColorFormat,
  type HSVA,
  type RGBA,
} from './color';
import { useControllableState } from '../../../hooks/use-controllable-state';

export type ColorChannel = 'saturation' | 'brightness' | 'hue' | 'alpha';

type EyeDropperConstructor = new () => {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
};

// Chromium only; elsewhere the button is not rendered at all.
const eyeDropperOf = (view: unknown) =>
  (view as { EyeDropper?: EyeDropperConstructor } | undefined)?.EyeDropper;

const noSubscription = () => () => {};

// Read after hydration, so the server and the first client render agree on "unsupported".
export function useEyeDropperSupport() {
  return useSyncExternalStore(
    noSubscription,
    () => !!eyeDropperOf(window),
    () => false,
  );
}

export function useClipboardSupport() {
  return useSyncExternalStore(
    noSubscription,
    () => typeof navigator.clipboard?.writeText === 'function',
    () => false,
  );
}

// What the controls show before there is a value: a saturated red, so the area has color.
const START: HSVA = { h: 0, s: 1, v: 1, a: 1 };
const COPIED_FOR = 1500;

export type UseColorPickerOptions = {
  value: string | undefined;
  defaultValue: string | undefined;
  onValueChange?: (value: string) => void;
  format: ColorFormat;
  alpha: boolean;
  disabled: boolean;
  readOnly: boolean;
};

export function useColorPicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  format,
  alpha,
  disabled,
  readOnly,
}: UseColorPickerOptions) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onValueChange,
  });
  const parsed = parseColor(value);
  const blocked = disabled || readOnly;

  // The controls work in HSV, and the value only stores RGB. The last HSV color is held so a
  // gray or black value keeps the hue and saturation the user dragged through; it is replaced
  // only when the value moves to a different color from outside.
  const [held, setHeld] = useState<HSVA>(() => (parsed ? rgbaToHsva(parsed) : START));
  const color = parsed && !sameColor(hsvaToRgba(held), parsed) ? rgbaToHsva(parsed, held) : held;
  const rgba = hsvaToRgba(color);
  const text = parsed ? serializeColor(parsed, format, alpha) : value;

  const commit = (next: HSVA) => {
    if (blocked) return;
    const kept = alpha ? next : { ...next, a: 1 };
    setHeld(kept);
    setValue(serializeColor(hsvaToRgba(kept), format, alpha));
  };
  const update = (patch: Partial<HSVA>) => commit({ ...color, ...patch });
  const commitRgba = (next: RGBA) => commit(rgbaToHsva(next, color));

  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const areaFromPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    update({
      s: clamp((event.clientX - rect.left) / rect.width),
      v: 1 - clamp((event.clientY - rect.top) / rect.height),
    });
  };

  // The thumb stays inside the track, so the usable length is the track minus one thumb.
  const sliderFromPointer = (
    channel: 'hue' | 'alpha',
    thumb: number,
    event: PointerEvent<HTMLElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const usable = rect.width - thumb;
    if (usable <= 0) return;
    const ratio = clamp((event.clientX - rect.left - thumb / 2) / usable);
    update(channel === 'hue' ? { h: ratio * 360 } : { a: ratio });
  };

  // Dragging starts on press, captures the pointer so it continues outside the control, and
  // moves focus to the control's input so the arrow keys pick up where the pointer left off.
  const startDrag = (event: PointerEvent<HTMLElement>, move: () => void) => {
    if (blocked || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.currentTarget.querySelector('input')?.focus({ preventScroll: true });
    move();
  };
  const dragging = (event: PointerEvent<HTMLElement>) =>
    event.currentTarget.hasPointerCapture?.(event.pointerId) ?? false;

  const onAreaKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (blocked) return;
    const step = event.shiftKey ? 0.1 : 0.01;
    const patch: Partial<HSVA> | undefined = {
      ArrowLeft: { s: clamp(color.s - step) },
      ArrowRight: { s: clamp(color.s + step) },
      ArrowUp: { v: clamp(color.v + step) },
      ArrowDown: { v: clamp(color.v - step) },
      PageUp: { v: clamp(color.v + 0.1) },
      PageDown: { v: clamp(color.v - 0.1) },
      Home: { s: 0 },
      End: { s: 1 },
    }[event.key];
    if (!patch) return;
    event.preventDefault();
    update(patch);
  };

  const onSliderKeyDown = (channel: 'hue' | 'alpha', event: KeyboardEvent<HTMLInputElement>) => {
    if (blocked) return;
    const max = channel === 'hue' ? 360 : 1;
    const unit = (channel === 'hue' ? 1 : 0.01) * (event.shiftKey ? 10 : 1);
    const page = channel === 'hue' ? 10 : 0.1;
    const current = channel === 'hue' ? color.h : color.a;
    const next = {
      ArrowLeft: current - unit,
      ArrowDown: current - unit,
      ArrowRight: current + unit,
      ArrowUp: current + unit,
      PageDown: current - page,
      PageUp: current + page,
      Home: 0,
      End: max,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const bounded = clamp(next, 0, max);
    update(channel === 'hue' ? { h: bounded } : { a: bounded });
  };

  // Assistive technology changes a slider through the input's own value, not through keys.
  const onChannelChange = (channel: ColorChannel, event: ChangeEvent<HTMLInputElement>) => {
    const n = Number(event.currentTarget.value);
    if (!Number.isFinite(n)) return;
    update(
      channel === 'saturation'
        ? { s: n / 100 }
        : channel === 'brightness'
          ? { v: n / 100 }
          : channel === 'hue'
            ? { h: n }
            : { a: n / 100 },
    );
  };

  // Typed text stays a draft until Enter or blur, so the area does not jump through "#1",
  // "#12", "#123" while the user is still typing "#123456".
  const commitDraft = () => {
    if (draft === null) return true;
    if (draft.trim() === '') {
      if (!blocked) setValue('');
      setDraft(null);
      return true;
    }
    const next = parseColorInput(draft);
    if (!next) return false;
    commitRgba(alpha ? next : { ...next, a: 1 });
    setDraft(null);
    return true;
  };

  const input = {
    value: draft ?? text,
    invalid: draft !== null ? draft.trim() !== '' && !parseColorInput(draft) : !!value && !parsed,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setDraft(event.currentTarget.value),
    // An unreadable draft is dropped on blur, and the field shows the color it still has.
    onBlur: () => {
      if (!commitDraft()) setDraft(null);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        commitDraft();
      } else if (event.key === 'Escape' && draft !== null) {
        // The first Escape only throws the draft away; it does not close a surrounding popup.
        event.preventDefault();
        setDraft(null);
      }
    },
  };

  const pickFromScreen = async () => {
    const EyeDropper = eyeDropperOf(window);
    if (!EyeDropper || blocked) return;
    try {
      const { sRGBHex } = await new EyeDropper().open();
      const picked = parseColor(sRGBHex);
      if (picked) commitRgba({ ...picked, a: color.a });
    } catch {
      // Escape cancels the eyedropper by rejecting; there is nothing to undo.
    }
  };

  const copy = async () => {
    if (!value || !parsed || typeof navigator.clipboard?.writeText !== 'function') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), COPIED_FOR);
    } catch {
      // A denied clipboard permission leaves nothing to report beyond not showing "copied".
    }
  };

  const isCurrent = (swatch: string) => {
    const candidate = parseColor(swatch);
    return !!candidate && !!parsed && sameColor(alpha ? candidate : { ...candidate, a: 1 }, parsed);
  };
  const chooseSwatch = (swatch: string) => {
    const next = parseColor(swatch);
    if (next) commitRgba(alpha ? next : { ...next, a: 1 });
  };

  // Swatches are one radio group: the arrows move to the next swatch and choose it, wrapping at
  // the ends, Home and End jump, and Tab leaves the group in one step.
  const onSwatchesKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const radios = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=radio]:not(:disabled)'),
    );
    const index = radios.findIndex((radio) => radio === radio.ownerDocument.activeElement);
    if (index < 0) return;
    const rtl =
      event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget)
        .direction === 'rtl';
    const step = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: 1,
      ArrowUp: -1,
    }[event.key];
    const next =
      step !== undefined
        ? (index + step + radios.length) % radios.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? radios.length - 1
            : undefined;
    if (next === undefined) return;
    event.preventDefault();
    radios[next].focus();
    radios[next].click();
  };

  return {
    state: { value, parsed, color, rgba, text, blocked, copied },
    input,
    area: {
      onPointerDown: (event: PointerEvent<HTMLElement>) =>
        startDrag(event, () => areaFromPointer(event)),
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (dragging(event)) areaFromPointer(event);
      },
      onKeyDown: onAreaKeyDown,
    },
    slider: (channel: 'hue' | 'alpha', thumb: number) => ({
      onPointerDown: (event: PointerEvent<HTMLElement>) =>
        startDrag(event, () => sliderFromPointer(channel, thumb, event)),
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (dragging(event)) sliderFromPointer(channel, thumb, event);
      },
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => onSliderKeyDown(channel, event),
    }),
    actions: { onChannelChange, pickFromScreen, copy, isCurrent, chooseSwatch, onSwatchesKeyDown },
  };
}
