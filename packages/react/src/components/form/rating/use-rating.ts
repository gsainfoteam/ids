import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
  type RefCallback,
} from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { mergeRefs } from '../../../utils';

export type UseRatingOptions = {
  value?: number;
  defaultValue: number;
  onValueChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max: number;
  step: 1 | 0.5;
  interactive: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function useRating({
  value,
  defaultValue,
  onValueChange,
  onHover,
  max,
  step,
  interactive,
  ref,
}: UseRatingOptions) {
  const normalize = (score: number) =>
    Math.round(Math.min(max, Math.max(0, Number.isFinite(score) ? score : 0)) / step) * step;
  const [raw, setRaw] = useControllableState({ value, defaultValue, onValueChange });
  const current = normalize(raw);
  const [hover, setHover] = useState<number | null>(null);
  const displayed = interactive ? (hover ?? current) : current;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (import.meta.env.DEV && (!Number.isFinite(raw) || raw < 0 || raw > max))
      console.warn('[IDS] Rating: value must be between 0 and max.');
  }, [raw, max]);

  useFormReset(rootRef, () => {
    if (value === undefined) setRaw(defaultValue, { silent: true });
    setHover(null);
  });

  const preview = (next: number | null) => {
    if (!interactive || next === hover) return;
    setHover(next);
    onHover?.(next);
  };

  const choose = (next: number) => {
    if (interactive) setRaw(normalize(next));
  };

  // Keys move from the focused option, which is also where focus follows, so a half step or a
  // digit never leaves focus on an option that is no longer checked.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || event.altKey || event.ctrlKey || event.metaKey) return;
    const root = event.currentTarget;
    const at = Number((event.target as HTMLElement).getAttribute('data-rating-value') ?? current);
    const rtl = getComputedStyle(root).direction === 'rtl';
    const targets: Record<string, number> = {
      ArrowRight: at + (rtl ? -step : step),
      ArrowLeft: at + (rtl ? step : -step),
      ArrowUp: at + step,
      ArrowDown: at - step,
      Home: 0,
      '0': 0,
      End: max,
    };
    let next = targets[event.key];
    if (next === undefined && /^[1-9]$/.test(event.key)) next = Number(event.key);
    if (next === undefined) return;
    event.preventDefault();
    next = normalize(next);
    choose(next);
    preview(null);
    root
      .querySelector<HTMLButtonElement>(`[data-rating-value="${next}"]`)
      ?.focus({ preventScroll: true });
  };

  // `ref` and a Field label's id point at the root; focus belongs on the checked option, which is
  // also the one Tab stops at.
  const focusChecked = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    event.currentTarget.querySelector<HTMLButtonElement>('[aria-checked=true]')?.focus();
  };

  const mergedRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );

  return {
    current,
    hover,
    displayed,
    anchorRef: rootRef,
    rootRef: mergedRef,
    preview,
    choose,
    onKeyDown,
    focusChecked,
  };
}
