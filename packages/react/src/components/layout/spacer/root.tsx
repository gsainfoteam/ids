'use client';

import { useInternalSpacer } from './hooks/use-spacer';
import { spacerStyle } from './style';

import type { Spacer } from '.';

export function SpacerRoot({ className, ref, ...rest }: Spacer.Props) {
  const mergedRef = useInternalSpacer(ref);

  return (
    <span
      {...rest}
      ref={mergedRef}
      aria-hidden="true"
      data-spacer=""
      className={spacerStyle({ className })}
    />
  );
}
