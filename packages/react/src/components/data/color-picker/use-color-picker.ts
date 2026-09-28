import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import { clamp, noop } from 'es-toolkit';

import {
  hsvaToRgba,
  parseColor,
  parseColorInput,
  rgbaToHsva,
  sameColor,
  serializeColor,
  type ColorFormat,
  type HSVA,
  type Rgb,
} from './color';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { keyHandler, withModifiers } from '../../../internal/keys';

export type ColorChannel = 'saturation' | 'brightness' | 'hue' | 'alpha';

type EyeDropperConstructor = new () => {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
};

const eyeDropperOf = (view: unknown) =>
  (view as { EyeDropper?: EyeDropperConstructor } | undefined)?.EyeDropper;

async function readScreenColor(EyeDropper: EyeDropperConstructor) {
  const { sRGBHex } = await new EyeDropper().open();
  return parseColor(sRGBHex);
}

const noSubscription = () => noop;

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

  const [held, setHeld] = useState<HSVA>(() => (parsed ? rgbaToHsva(parsed) : START));
  const changedFromOutside = parsed && !sameColor(hsvaToRgba(held), parsed);
  const color = changedFromOutside ? rgbaToHsva(parsed, held) : held;
  const rgba = hsvaToRgba(color);
  const text = parsed ? serializeColor(parsed, format, alpha) : value;

  const commit = (next: HSVA) => {
    if (blocked) return;
    const kept = alpha ? next : { ...next, a: 1 };
    setHeld(kept);
    setValue(serializeColor(hsvaToRgba(kept), format, alpha));
  };
  const update = (patch: Partial<HSVA>) => commit({ ...color, ...patch });
  const commitRgba = (next: Rgb) => commit(rgbaToHsva(next, color));

  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const areaFromPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    update({
      s: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      v: 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1),
    });
  };

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
    const change = (patch: Partial<HSVA>) => () => update(patch);

    keyHandler(
      withModifiers({
        ArrowLeft: change({ s: clamp(color.s - step, 0, 1) }),
        ArrowRight: change({ s: clamp(color.s + step, 0, 1) }),
        ArrowUp: change({ v: clamp(color.v + step, 0, 1) }),
        ArrowDown: change({ v: clamp(color.v - step, 0, 1) }),
        PageUp: change({ v: clamp(color.v + 0.1, 0, 1) }),
        PageDown: change({ v: clamp(color.v - 0.1, 0, 1) }),
        Home: change({ s: 0 }),
        End: change({ s: 1 }),
      }),
    )(event);
  };

  const setChannel = (channel: ColorChannel, n: number) =>
    update(
      channel === 'saturation'
        ? { s: n / 100 }
        : channel === 'brightness'
          ? { v: n / 100 }
          : channel === 'hue'
            ? { h: n }
            : { a: n / 100 },
    );

  const onChannelChange = (channel: ColorChannel, event: ChangeEvent<HTMLInputElement>) => {
    const n = Number(event.currentTarget.value);
    if (Number.isFinite(n)) setChannel(channel, n);
  };

  const tryCommitDraft = () => {
    if (draft === null) return true;
    if (draft.trim() === '') {
      if (!blocked) setValue('');
      setDraft(null);
      return true;
    }
    const next = parseColorInput(draft);
    if (!next) return false;
    commitRgba(alpha ? next : { ...next, alpha: 1 });
    setDraft(null);
    return true;
  };

  const input = {
    value: draft ?? text,
    invalid: draft !== null ? draft.trim() !== '' && !parseColorInput(draft) : !!value && !parsed,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setDraft(event.currentTarget.value),
    onBlur: () => {
      if (!tryCommitDraft()) setDraft(null);
    },
    onKeyDown: keyHandler(
      withModifiers({
        Enter: () => {
          tryCommitDraft();
        },
        Escape: () => {
          if (draft === null) return false;
          setDraft(null);
        },
      }),
    ),
  };

  const pickFromScreen = async () => {
    const EyeDropper = eyeDropperOf(window);
    if (!EyeDropper || blocked) return;
    const picked = await readScreenColor(EyeDropper).catch(() => null);
    if (picked) commitRgba({ ...picked, alpha: color.a });
  };

  const copy = async () => {
    if (!value || !parsed || typeof navigator.clipboard?.writeText !== 'function') return;
    const written = await navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );
    if (!written) return;
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_FOR);
  };

  const isCurrent = (swatch: string) => {
    const candidate = parseColor(swatch);
    return (
      !!candidate && !!parsed && sameColor(alpha ? candidate : { ...candidate, alpha: 1 }, parsed)
    );
  };
  const chooseSwatch = (swatch: string) => {
    const next = parseColor(swatch);
    if (next) commitRgba(alpha ? next : { ...next, alpha: 1 });
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
    actions: { setChannel, onChannelChange, pickFromScreen, copy, isCurrent, chooseSwatch },
  };
}
