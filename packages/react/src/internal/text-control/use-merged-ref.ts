import { useCallback, useRef, type Ref, type RefCallback, type RefObject } from 'react';

import { mergeRefs } from '../../utils';

export function useMergedRef<T>(
  inputRef: RefObject<T | null>,
  childRef: Ref<T> | undefined,
  rootRef: Ref<T> | undefined,
  ownRef: Ref<T> | undefined,
  check?: (node: T) => void,
): RefCallback<T> {
  const detach = useRef<(() => void) | null>(null);
  return useCallback(
    (node: T | null) => {
      if (node === null) {
        detach.current?.();
        detach.current = null;
        return;
      }
      if (check) check(node);
      const cleanup = mergeRefs(inputRef, childRef, rootRef, ownRef)(node);
      const run = () => {
        if (detach.current !== run) return;
        detach.current = null;
        cleanup?.();
      };
      detach.current = run;
      return run;
    },
    [inputRef, childRef, rootRef, ownRef, check],
  );
}
