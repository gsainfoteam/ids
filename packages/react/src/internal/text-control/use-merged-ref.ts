import { useCallback, type Ref, type RefCallback, type RefObject } from 'react';

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
  return useCallback(
    (node: T | null) => {
      if (node && check) check(node);
      return mergeRefs(inputRef, childRef, rootRef, ownRef)(node);
    },
    [inputRef, childRef, rootRef, ownRef, check],
  );
}
