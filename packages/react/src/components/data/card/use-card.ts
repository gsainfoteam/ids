'use client';

import { useLabelling, useSurface, type UseSurfaceOptions } from '../../../internal/surface';

export function useCard<E extends HTMLElement>(options: UseSurfaceOptions<E>) {
  return {
    ...useSurface<E>(options),
    ...useLabelling(options.interactive && !options.titleIsTheButton),
  };
}
