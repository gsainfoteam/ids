import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { elementTypeOf, flattenFragments, invariant } from '../../../utils';
import { TemporalClear } from '../parts/clear';
import { TemporalContent } from '../parts/content';
import { TemporalInput } from '../parts/input';
import { TemporalTrigger } from '../parts/trigger';

export function pickerPart<P>(children: ReactNode, type: unknown): ReactElement<P> | undefined {
  for (const child of flattenFragments(children)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) continue;
    if (elementTypeOf(child) === type) return child as ReactElement<P>;
    if (elementTypeOf(child) === TemporalContent) {
      const inContent = pickerPart<P>(child.props.children, type);
      if (inContent) return inContent;
    }
  }
  return undefined;
}

export function splitTemporalChildren(
  children: ReactNode,
  pickerParts: ReadonlySet<unknown> | undefined,
  readsTypedText: boolean,
) {
  const parts = flattenFragments(children).filter(
    (n) => !(isValidElement(n) && pickerParts?.has(elementTypeOf(n))),
  );
  const contents = parts.filter((n) => isValidElement(n) && elementTypeOf(n) === TemporalContent);
  const shell = parts.filter((n) => !(isValidElement(n) && elementTypeOf(n) === TemporalContent));
  const count = (type: unknown) =>
    parts.filter((n) => isValidElement(n) && elementTypeOf(n) === type).length;
  invariant(
    count(TemporalTrigger) <= 1 &&
      contents.length <= 1 &&
      count(TemporalClear) <= 1 &&
      count(TemporalInput) <= 1,
    'A date or time field accepts at most one Trigger, Input, Content and Clear.',
  );
  const composed = shell.length > 0;
  const hasTrigger = count(TemporalTrigger) > 0;
  const hasInput = count(TemporalInput) > 0;
  invariant(!hasInput || readsTypedText, 'Input is only available on a field that reads typed text.');

  return {
    contents,
    shell,
    composed,
    hasTrigger,
    hasInput,
    hasClear: !composed || count(TemporalClear) > 0,
  };
}
