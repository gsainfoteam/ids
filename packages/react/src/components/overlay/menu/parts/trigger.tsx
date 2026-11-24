'use client';

import {
  cloneElement,
  isValidElement,
  use,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { ChevronRightIcon } from '@heroicons/react/16/solid';

import { CommandTrigger } from './command';
import { buttonTypeFor, mergeProps, mergeRefs, part } from '../../../../utils';
import {
  CommandContext,
  MenuContext,
  useInternalContentContext,
  useInternalMenuContext,
} from '../context';
import { useInternalMenuItem } from '../hooks/use-menu-item';
import { menuStyle } from '../style';

import type { Menu } from '..';

export function MenuTrigger(props: Menu.TriggerProps) {
  const palette = use(CommandContext);
  const menu = use(MenuContext);

  if (palette) return <CommandTrigger {...props} />;
  if (menu?.level.nested) return <NestedMenuTrigger {...props} />;

  return <RootMenuTrigger {...props} />;
}

MenuTrigger.displayName = 'Menu.Trigger';

function RootMenuTrigger({
  asChild,
  textValue: _textValue,
  children,
  ...props
}: Menu.TriggerProps) {
  const { root, triggerType } = useInternalMenuContext('Menu.Trigger');

  const state = {
    ref: root.setTrigger,
    'data-popup-open': root.open ? '' : undefined,
  };

  if (triggerType === 'contextmenu')
    return part(
      'div',
      asChild,
      children,
      mergeProps(props, {
        ...state,
        onContextMenu: (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          root.openAt(event.nativeEvent);
        },
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
          const plainPress = event.button === 0 && !event.ctrlKey;
          const pressedInMenu = !!root.content?.contains(event.target as Node);

          if (root.open && plainPress && !pressedInMenu) root.setOpen(false, event.nativeEvent);
        },
      }),
    );

  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      ...root.getReferenceProps(),
      ...state,
      id: props.id ?? root.ids.trigger,
      type: buttonTypeFor(asChild, children),
      'aria-haspopup': 'menu',
      'aria-expanded': root.open,
      'aria-controls': root.open ? root.ids.content : undefined,
    }),
  );
}

function NestedMenuTrigger({
  disabled = false,
  textValue,
  asChild,
  className,
  children,
  ...props
}: Menu.TriggerProps) {
  const { level } = useInternalMenuContext('Menu.Trigger');
  const parent = useInternalContentContext('Menu.Trigger');
  const item = useInternalMenuItem(parent, {
    disabled,
    textValue,
    activatesOnKeys: false,
    keepsHighlightOnLeave: level.open,
  });

  const styles = menuStyle();
  const withChevron = (nodes: ReactNode) => (
    <>
      {nodes}
      <ChevronRightIcon aria-hidden="true" className={styles.chevron()} />
    </>
  );

  return part(
    'div',
    asChild,
    asChild && isValidElement<{ children?: ReactNode }>(children)
      ? cloneElement(children, {}, withChevron(children.props.children))
      : withChevron(children),
    mergeProps(mergeProps(props, disabled ? {} : level.getReferenceProps()), {
      ...item.props,
      ref: mergeRefs(item.props.ref, level.setTrigger),
      id: props.id ?? level.ids.trigger,
      role: 'menuitem',
      'aria-haspopup': 'menu',
      'aria-expanded': level.open,
      'aria-controls': level.open ? level.ids.content : undefined,
      'data-popup-open': level.open ? '' : undefined,
      'data-menu-nested-trigger': '',
      className: styles.item({ className }),
    }),
  );
}
