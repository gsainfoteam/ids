import type { KeyboardEvent } from 'react';

import { isComposingKey } from '../../../../internal/lib/keys';

const HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i;
const STAYS_ON_THIS_SITE = /^[/#?]/;

export function withProtocol(url: string) {
  return HAS_SCHEME.test(url) || STAYS_ON_THIS_SITE.test(url) ? url : `https://${url}`;
}

export const isPlainEnter = (event: KeyboardEvent) =>
  event.key === 'Enter' &&
  !isComposingKey(event.nativeEvent) &&
  !event.shiftKey &&
  !event.altKey &&
  !event.ctrlKey &&
  !event.metaKey;
