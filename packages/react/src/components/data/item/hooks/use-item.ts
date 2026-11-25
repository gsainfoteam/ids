'use client';

import { useInternalLabelling } from '../../../../internal/hooks/use-labelling';
import {
  useInternalSurface,
  type UseSurfaceOptions,
} from '../../../../internal/hooks/use-surface';

export function useInternalItem<E extends HTMLElement>({
  selected,
  current,
  ...options
}: UseSurfaceOptions<E> & { selected: boolean | undefined; current: boolean }) {
  const surface = useInternalSurface<E>(options);
  const { labelling, descriptionId, register } = useInternalLabelling(
    options.interactive && !options.titleIsTheButton,
  );
  const reportsPressed =
    options.interactive && !options.asChild && selected !== undefined && !current;
  const pressed = reportsPressed && !options.titleIsTheButton ? { 'aria-pressed': selected } : {};
  const trigger =
    options.interactive && !options.asChild && options.titleIsTheButton
      ? {
          disabled: options.disabled,
          describedBy: descriptionId,
          pressed: reportsPressed ? selected : undefined,
        }
      : null;
  return { ...surface, labelling: { ...labelling, ...pressed }, trigger, register };
}
