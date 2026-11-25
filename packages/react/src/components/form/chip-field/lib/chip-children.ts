import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { isNotNil } from 'es-toolkit';

import { isType } from './is-type';
import { elementTypeOf, flattenFragments, invariant } from '../../../../utils';
import { collectOptions, slotChildren } from '../../select/lib/select-options';
import { ChipContent, type ChipContentProps } from '../parts/content';
import { ChipCreate } from '../parts/create';
import { ChipEmpty } from '../parts/empty';
import { ChipGroup, OPTION_KINDS } from '../parts/group';
import { ChipInput, type ChipInputProps } from '../parts/input';
import { ChipItem } from '../parts/item';
import { ChipLimit } from '../parts/limit';

const POPUP_PARTS: unknown[] = [ChipContent, ChipItem, ChipGroup, ChipCreate, ChipEmpty, ChipLimit];

export function isForeignComponent(node: ReactNode): boolean {
  return flattenFragments(node).some(
    (child) =>
      isValidElement<ChipContentProps>(child) &&
      (elementTypeOf(child) === ChipContent
        ? isForeignComponent(slotChildren(child.props.children, child.props.asChild))
        : typeof elementTypeOf(child) === 'function' &&
          !POPUP_PARTS.includes(elementTypeOf(child))),
  );
}

function isPopupPart(node: ReactNode) {
  return POPUP_PARTS.some((type) => isType(type)(node));
}

export function splitChildren(children: ReactNode) {
  const nodes = flattenFragments(children);
  const popup = nodes.filter(isPopupPart);
  const contents = popup.filter(isType(ChipContent));
  invariant(contents.length <= 1, '`<ChipField>` accepts at most one `<ChipField.Content>`.');
  invariant(
    contents.length === 0 || popup.length === 1,
    '`<ChipField>` takes options either inside `<ChipField.Content>` or directly, not both.',
  );

  const items = nodes.filter((node) => !isPopupPart(node));
  const inputIndexes = items
    .map((child, index) => (isType(ChipInput)(child) ? index : null))
    .filter(isNotNil);
  invariant(inputIndexes.length <= 1, '`<ChipField>` accepts at most one `<ChipField.Input />`.');

  const inputIndex = inputIndexes[0];
  const adornments =
    inputIndex == null
      ? { leading: items, input: undefined, trailing: [] as ReactNode[] }
      : {
          leading: items.slice(0, inputIndex),
          input: items[inputIndex] as ReactElement<ChipInputProps>,
          trailing: items.slice(inputIndex + 1),
        };
  const content = contents[0] as ReactElement<ChipContentProps> | undefined;
  return {
    ...adornments,
    contents,
    loose: popup,
    mobileVariant: content?.props.mobileVariant ?? 'drawer',
  };
}

export function chipOptionsIn(children: ReactNode) {
  const options = collectOptions(children, OPTION_KINDS);
  invariant(
    options.every((option) => typeof option.value === 'string'),
    '`<ChipField.Item>` `value` is required.',
  );
  invariant(
    new Set(options.map((option) => option.value)).size === options.length,
    '`<ChipField>` has a duplicate `<ChipField.Item>` value.',
  );
  return options;
}
