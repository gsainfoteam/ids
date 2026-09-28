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
import { keyHandler, withModifiers } from '../../../internal/keys';
import { mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

const DIGIT = /^[0-9]$/;

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
    if (isDevelopment && (!Number.isFinite(raw) || raw < 0 || raw > max))
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

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;

    const root = event.currentTarget;
    const focusedScore = Number(
      (event.target as HTMLElement).getAttribute('data-rating-value') ?? current,
    );
    const rtl = getComputedStyle(root).direction === 'rtl';

    const rateAndFocus = (score: number) => {
      const next = normalize(score);
      choose(next);
      preview(null);
      root
        .querySelector<HTMLButtonElement>(`[data-rating-value="${next}"]`)
        ?.focus({ preventScroll: true });
    };

    const rateBy = (score: number) => () => rateAndFocus(score);

    const moved = keyHandler(
      withModifiers(
        {
          ArrowRight: rateBy(focusedScore + step),
          ArrowLeft: rateBy(focusedScore - step),
          ArrowUp: rateBy(focusedScore + step),
          ArrowDown: rateBy(focusedScore - step),
          Home: rateBy(0),
          End: rateBy(max),
        },
        ['Shift'],
      ),
      { dir: rtl ? 'rtl' : 'ltr' },
    )(event);

    const typedScore = DIGIT.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey;
    if (moved || !typedScore) return;

    event.preventDefault();
    rateAndFocus(Number(event.key));
  };

  const forwardRootFocusToChecked = (event: FocusEvent<HTMLDivElement>) => {
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
    forwardRootFocusToChecked,
  };
}
