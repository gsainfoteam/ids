'use client';

import { useInternalLabelling } from '../../../../internal/hooks/use-labelling';
import {
  useInternalSurface,
  type UseSurfaceOptions,
} from '../../../../internal/hooks/use-surface';

export function useInternalCard<E extends HTMLElement>(options: UseSurfaceOptions<E>) {
  return {
    ...useInternalSurface<E>(options),
    ...useInternalLabelling(options.interactive && !options.titleIsTheButton),
  };
}
