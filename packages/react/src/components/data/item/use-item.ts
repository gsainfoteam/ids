'use client';

import { useLabelling, useSurface, type UseSurfaceOptions } from '../../../internal/surface';

export function useItem<E extends HTMLElement>({
  selected,
  current,
  ...options
}: UseSurfaceOptions<E> & { selected: boolean | undefined; current: boolean }) {
  const surface = useSurface<E>(options);
  const { labelling, register } = useLabelling(options.interactive);
  const pressed =
    options.interactive && !options.asChild && selected !== undefined && !current
      ? { 'aria-pressed': selected }
      : {};
  return { ...surface, labelling: { ...labelling, ...pressed }, register };
}
