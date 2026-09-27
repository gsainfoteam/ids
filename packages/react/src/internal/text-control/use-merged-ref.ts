import { useCallback, useRef, type Ref, type RefCallback, type RefObject } from 'react';

import { mergeRefs } from '../../utils';

// mergeProps builds a new ref function on every render, and React detaches and re-attaches a
// ref whose function changed, so a consumer's ref callback would run on every keystroke. The
// refs are merged here from their own identities instead.
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
      // A wrapper written before React 19, such as react-textarea-autosize's composed ref, drops
      // the cleanup a ref returns and detaches by passing null instead; the cleanup runs then.
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
