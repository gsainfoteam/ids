'use client';

import {
  useInternalLabelling,
  useInternalSurface,
  type UseSurfaceOptions,
} from '../../../../internal/lib/surface';

export function useInternalCard<E extends HTMLElement>(options: UseSurfaceOptions<E>) {
  return {
    ...useInternalSurface<E>(options),
    ...useInternalLabelling(options.interactive && !options.titleIsTheButton),
  };
}
