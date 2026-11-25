import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { isType } from './is-type';
import { collectOptions, slotChildren } from './select-options';
import { elementTypeOf, flattenFragments, invariant } from '../../../../utils';
import { SelectClear } from '../parts/clear';
import { SelectContent, type SelectContentProps } from '../parts/content';
import { SelectEmpty } from '../parts/empty';
import { OPTION_KINDS, SelectGroup } from '../parts/group';
import { SelectIcon } from '../parts/icon';
import { SelectItem } from '../parts/item';
import { SelectItemIndicator } from '../parts/item-indicator';
import { SelectSearchField } from '../parts/search-field';
import { SelectSeparator } from '../parts/separator';
import { SelectTrigger } from '../parts/trigger';
import { SelectValue } from '../parts/value';

const PARTS = new Set<unknown>([
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectClear,
  SelectContent,
  SelectSearchField,
  SelectItem,
  SelectItemIndicator,
  SelectGroup,
  SelectSeparator,
  SelectEmpty,
]);

export const isForeignComponent = (node: ReactNode): boolean =>
  isValidElement<SelectContentProps>(node) &&
  (elementTypeOf(node) === SelectContent
    ? flattenFragments(slotChildren(node.props.children, node.props.asChild)).some(
        isForeignComponent,
      )
    : typeof elementTypeOf(node) === 'function' && !PARTS.has(elementTypeOf(node)));

export function splitSelectChildren(children: ReactNode) {
  const nodes = flattenFragments(children);
  const triggers = nodes.filter(isType(SelectTrigger));
  const clears = nodes.filter(isType(SelectClear));
  const contents = nodes.filter(isType(SelectContent));
  invariant(
    triggers.length <= 1 && clears.length <= 1 && contents.length <= 1,
    'Select accepts at most one Trigger, Clear and Content.',
  );
  const rest = nodes.filter(
    (node) => !triggers.includes(node) && !clears.includes(node) && !contents.includes(node),
  );
  invariant(
    !contents.length || !rest.some((node) => isValidElement(node)),
    'Select takes its options either inside Select.Content or directly, not both.',
  );

  return {
    triggers,
    clears,
    contents,
    rest,
    mobileVariant: (contents[0] as ReactElement<SelectContentProps> | undefined)?.props
      .mobileVariant,
  };
}

export function selectOptionsIn(children: ReactNode) {
  const options = collectOptions(children, OPTION_KINDS);
  invariant(
    options.every((option) => typeof option.value === 'string'),
    'Select.Item: value is required.',
  );
  invariant(
    new Set(options.map((option) => option.value)).size === options.length,
    'Select: duplicate Item value.',
  );
  return options;
}

export const holdsASearchField = (popupNodes: ReactNode[]) =>
  popupNodes.some((node) =>
    isValidElement<SelectContentProps>(node) && elementTypeOf(node) === SelectContent
      ? flattenFragments(slotChildren(node.props.children, node.props.asChild)).some(
          isType(SelectSearchField),
        )
      : isType(SelectSearchField)(node),
  );
