import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { ItemContext, useChip } from './context';
import { isType } from './is-type';
import { ChipItemIndicator } from './item-indicator';
import { resolveState } from '../../../internal/state-props';
import { flattenFragments, keepFocusWhereItIs, mergeProps, part } from '../../../utils';

import type { ChipFieldItemState } from '.';

export type ChipItemProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
  value: string;
  label?: string;
  searchValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  className?: string | ((state: ChipFieldItemState) => string | undefined);
  children?: ReactNode | ((state: ChipFieldItemState) => ReactNode);
};

export function ChipItem({
  value,
  label: _label,
  searchValue: _searchValue,
  disabled = false,
  asChild,
  children,
  className,
  ...props
}: ChipItemProps) {
  const c = useChip('Item');
  const { state: s, ids, actions } = c.field;
  if (!s.visible.some((option) => option.value === value)) return null;

  const selected = s.selected.includes(value);
  const state: ChipFieldItemState = {
    selected,
    highlighted: s.activeCandidate === value,
    disabled: disabled || (s.full && !selected),
  };
  const content = typeof children === 'function' ? children(state) : children;
  const withIndicator = (nodes: ReactNode) => (
    <>
      {nodes}
      {!flattenFragments(nodes).some(isType(ChipItemIndicator)) && <ChipItemIndicator />}
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
          'aria-selected': selected,
          'aria-disabled': state.disabled || undefined,
          'data-selected': selected ? '' : undefined,
          'data-highlighted': state.highlighted ? '' : undefined,
          'data-disabled': state.disabled ? '' : undefined,
          className: c.styles.item({ className: resolveState(className, state) }),
          onPointerDown: keepFocusWhereItIs,
          onPointerMove: (event: PointerEvent) => {
            if (event.pointerType === 'mouse' && !state.disabled && !state.highlighted)
              actions.highlight(value);
          },
          onClick: () => {
            if (!state.disabled) actions.toggle(value);
          },
        }),
      )}
    </ItemContext>
  );
}

ChipItem.displayName = 'ChipField.Item';
