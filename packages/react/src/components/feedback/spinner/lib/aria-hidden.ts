import type { Spinner } from '..';

export function hiddenFromScreenReaders(ariaHidden: Spinner.Props['aria-hidden']) {
  if (ariaHidden === undefined) return undefined;
  return ariaHidden === true || ariaHidden === 'true';
}
