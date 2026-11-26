'use client';

import { useCallback, useState } from 'react';

import { isPressableElement } from '../../utils';

const RENDERS_A_CONTROL = 'a[href], button, [role="button"], [role="link"]';

export function useInternalPressableChild<E extends HTMLElement>(
  asChild: boolean,
  children: unknown,
) {
  const [rendersAControl, setRendersAControl] = useState(false);
  const readTheRenderedElement = useCallback(
    (node: E | null) => {
      if (asChild && node) setRendersAControl(node.matches(RENDERS_A_CONTROL));
    },
    [asChild],
  );

  return {
    pressable: asChild && (isPressableElement(children) || rendersAControl),
    ref: readTheRenderedElement,
  };
}
