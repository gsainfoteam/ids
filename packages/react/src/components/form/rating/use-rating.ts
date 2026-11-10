'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type Ref,
  type RefCallback,
} from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

const radiosOf = (root: HTMLElement) =>
  root.querySelectorAll<HTMLInputElement>('input[type=radio][data-rating-value]');

export const isCheckedScore = (score: number, current: number) => score > 0 && score === current;

export type UseRatingOptions = {
  value?: number;
  defaultValue: number;
  onValueChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max: number;
  step: 1 | 0.5;
  interactive: boolean;
  missingMessage: string | null;
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
  missingMessage,
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

  useEffect(() => {
    if (!rootRef.current) return;
    const message = missingMessage !== null && current === 0 ? missingMessage : '';
    for (const radio of radiosOf(rootRef.current)) radio.setCustomValidity(message);
  }, [missingMessage, current]);

  const putBrowserResetBackOnTheValue = (root: HTMLElement, restored: number) => {
    for (const radio of radiosOf(root))
      radio.checked = isCheckedScore(Number(radio.dataset.ratingValue), restored);
  };

  useFormReset(rootRef, () => {
    const restored = value === undefined ? normalize(defaultValue) : current;
    if (rootRef.current) putBrowserResetBackOnTheValue(rootRef.current, restored);
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

  const forwardRootFocusToChecked = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const radios = [...radiosOf(event.currentTarget)];
    (radios.find((radio) => radio.checked) ?? radios[0])?.focus();
  };

  const mergedRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );

  return {
    current,
    hover,
    displayed,
    rootRef: mergedRef,
    preview,
    choose,
    forwardRootFocusToChecked,
  };
}
