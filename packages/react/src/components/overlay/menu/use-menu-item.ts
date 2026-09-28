import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';

import { useListItem } from '../../../internal/overlay';
import { mergeProps } from '../../../utils';

import type { MenuLevel } from './use-menu';

export const MENU_SELECT_EVENT = 'ids-menu-select';

export type UseMenuItemOptions = {
  disabled: boolean;
  textValue?: string;
  activate?: (item: HTMLElement) => void;
  activatesOnKeys?: boolean;
  keepsHighlightOnLeave?: boolean;
};

export function selectItem(item: HTMLElement, onSelect: ((event: Event) => void) | undefined) {
  const event = new Event(MENU_SELECT_EVENT, { cancelable: true });
  if (onSelect) item.addEventListener(MENU_SELECT_EVENT, onSelect, { once: true });
  item.dispatchEvent(event);

  return !event.defaultPrevented;
}

export function useMenuItem(
  level: MenuLevel,
  {
    disabled,
    textValue,
    activate,
    activatesOnKeys = true,
    keepsHighlightOnLeave = false,
  }: UseMenuItemOptions,
) {
  const listItem = useListItem({ label: disabled ? null : textValue });
  const highlighted = level.activeIndex !== null && level.activeIndex === listItem.index;
  const { onPointerLeave, ...navigation } = disabled ? {} : level.getItemProps();

  const props = mergeProps(
    { ...navigation, onPointerLeave: keepsHighlightOnLeave ? undefined : onPointerLeave },
    {
      ref: listItem.ref,
      tabIndex: highlighted ? 0 : -1,
      'aria-disabled': disabled || undefined,
      'data-highlighted': highlighted ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (disabled && event.pointerType !== 'touch') level.clearHighlight();
      },
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (!disabled) activate?.(event.currentTarget);
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (!activatesOnKeys || event.target !== event.currentTarget) return;

        const space = event.key === ' ' && !level.typing.current;
        if (event.key !== 'Enter' && !space) return;

        event.preventDefault();
        if (!disabled) event.currentTarget.click();
      },
    },
  );

  return { highlighted, props };
}
