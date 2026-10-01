'use client';

import { useLabelling, useSurface, type UseSurfaceOptions } from '../../../internal/surface';

export function useItem<E extends HTMLElement>({
  selected,
  current,
  ...options
}: UseSurfaceOptions<E> & { selected: boolean | undefined; current: boolean }) {
  const surface = useSurface<E>(options);
  const { labelling, descriptionId, register } = useLabelling(
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
