'use client';

import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { ItemContext, useSelectContext } from './context';
import { isType } from './is-type';
import { SelectItemIndicator } from './item-indicator';
import { resolveState } from '../../../internal/state-props';
import { flattenFragments, keepFocusWhereItIs, mergeProps, part } from '../../../utils';

import type { SelectItemState } from '.';

export type SelectItemProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
  value: string;
  label?: string;
  searchValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  className?: string | ((state: SelectItemState) => string | undefined);
  children?: ReactNode | ((state: SelectItemState) => ReactNode);
};

export function SelectItem({
  value,
  label: _label,
  searchValue: _searchValue,
  disabled = false,
  asChild,
  children,
  className,
  ...props
}: SelectItemProps) {
  const c = useSelectContext('Select.Item');
  const { state: s, ids } = c.select;
  if (!s.visible.some((option) => option.value === value)) return null;

  const state: SelectItemState = {
    selected: s.selected.includes(value),
    highlighted: s.activeValue === value,
    disabled,
  };
  const content = typeof children === 'function' ? children(state) : children;
  const withIndicator = (nodes: ReactNode) => (
    <>
      {nodes}
      {!flattenFragments(nodes).some(isType(SelectItemIndicator)) && <SelectItemIndicator />}
    </>
  );

  return (
    <ItemContext value={state}>
      {part(
        'div',
        asChild,
        asChild && isValidElement<{ children?: ReactNode }>(content)
          ? cloneElement(content, {}, withIndicator(content.props.children))
          : withIndicator(content),
        mergeProps(props, {
          id: ids.option(value),
          role: 'option',
          'aria-selected': state.selected,
          'aria-disabled': disabled || undefined,
          'data-selected': state.selected ? '' : undefined,
          'data-highlighted': state.highlighted ? '' : undefined,
          'data-disabled': disabled ? '' : undefined,
          className: c.styles.item({ className: resolveState(className, state) }),
          onPointerDown: keepFocusWhereItIs,
          onPointerMove: (event: PointerEvent) => {
            if (event.pointerType === 'mouse' && !disabled && !state.highlighted)
              c.select.actions.highlight(value);
          },
          onClick: () => {
            if (!disabled) c.select.actions.choose(value);
          },
        }),
      )}
    </ItemContext>
  );
}

SelectItem.displayName = 'Select.Item';
