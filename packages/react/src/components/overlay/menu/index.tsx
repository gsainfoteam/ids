'use client';

import { use, useEffect, type ComponentProps, type ReactNode } from 'react';

import { MenuCheckboxItem } from './checkbox-item';
import { CommandEmpty, CommandMenu, CommandNestedMenu, CommandSearch } from './command';
import { MenuContent } from './content';
import { CommandContext, ContentContext, MenuContext, useMenuContext } from './context';
import { MenuGroup } from './group';
import { MenuItemIndicator, type MenuItemIndicatorProps } from './indicator';
import { MenuItem } from './item';
import { MenuLabel } from './label';
import { MenuRadioGroup } from './radio-group';
import { MenuRadioItem } from './radio-item';
import { MenuSeparator } from './separator';
import { MenuShortcut } from './shortcut';
import { menuStyle } from './style';
import { MenuTrigger } from './trigger';
import { useMenuLevel, type MenuLevel, type MenuTriggerType } from './use-menu';
import {
  FloatingNode,
  FloatingTree,
  type AnchoredAlign,
  type AnchoredSide,
} from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';

import type { Divider } from '../../layout/divider';
import type { Kbd } from '../../typography/kbd';
import type { Hotkey } from '@tanstack/react-hotkeys';

export function Menu({ triggerType, ...props }: Menu.Props) {
  const parent = use(ContentContext);
  const palette = use(CommandContext);

  if (palette) return <CommandNestedMenu />;
  if (parent) return <NestedMenu {...props} triggerType={triggerType} parent={parent} />;
  if (triggerType === 'command') return <CommandMenu {...props} />;

  return (
    <FloatingTree>
      <RootMenu {...props} triggerType={triggerType ?? 'click'} />
    </FloatingTree>
  );
}

type RootMenuProps = Omit<Menu.Props, 'triggerType'> & { triggerType: MenuTriggerType };

function RootMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  triggerType,
  children,
}: RootMenuProps) {
  const root = useMenuLevel({ open, defaultOpen, onOpenChange, parentOpen: null, triggerType });

  return (
    <MenuContext value={{ level: root, root, triggerType }}>
      <FloatingNode id={root.nodeId}>{children}</FloatingNode>
    </MenuContext>
  );
}

type NestedMenuProps = Menu.Props & { parent: MenuLevel };

function NestedMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  triggerType: ignoredTriggerType,
  hotkey: ignoredHotkey,
  parent,
  children,
}: NestedMenuProps) {
  const { root, triggerType } = useMenuContext('Menu');
  const level = useMenuLevel({
    open,
    defaultOpen,
    onOpenChange,
    parentOpen: parent.open,
    triggerType,
  });

  const setsRootOnlyProps = ignoredTriggerType !== undefined || ignoredHotkey !== undefined;

  useEffect(() => {
    if (isDevelopment && setsRootOnlyProps)
      console.warn(
        '[IDS] Menu: triggerType and hotkey apply only to the outermost Menu. A Menu inside Menu.Content is a submenu and ignores them.',
      );
  }, [setsRootOnlyProps]);

  return (
    <MenuContext value={{ level, root, triggerType }}>
      <FloatingNode id={level.nodeId}>{children}</FloatingNode>
    </MenuContext>
  );
}

export namespace Menu {
  export type TriggerType = MenuTriggerType | 'command';
  export type Side = AnchoredSide;
  export type Align = AnchoredAlign;
  export type SelectEvent = Event;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerType?: TriggerType;
    hotkey?: Hotkey;
    children?: ReactNode;
  };

  type ItemBaseProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
    onSelect?: (event: SelectEvent) => void;
  };

  export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean; textValue?: string };
  export type ContentProps = ComponentProps<'div'> & {
    side?: Side;
    align?: Align;
    sideOffset?: number;
    alignOffset?: number;
  };
  export type ItemProps = ItemBaseProps;
  export type CheckboxItemProps = Omit<ItemBaseProps, 'defaultChecked'> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  };
  export type RadioGroupProps = Omit<ComponentProps<'div'>, 'defaultValue'> & {
    value?: string;
    onValueChange?: (value: string) => void;
    asChild?: boolean;
  };
  export type RadioItemProps = ItemBaseProps & { value: string };
  export type ItemIndicatorProps = MenuItemIndicatorProps;
  export type GroupProps = ComponentProps<'div'> & { asChild?: boolean };
  export type LabelProps = ComponentProps<'div'> & { asChild?: boolean };
  export type SeparatorProps = Omit<
    Divider.Props,
    'orientation' | 'align' | 'decorative' | 'asChild' | 'children' | 'className'
  > & { className?: string };
  export type ShortcutProps = Omit<Kbd.Props, 'className'> & { className?: string };
  export type SearchProps = Omit<
    ComponentProps<'input'>,
    'size' | 'color' | 'value' | 'defaultValue'
  >;
  export type EmptyProps = ComponentProps<'div'> & { asChild?: boolean };

  export const Trigger = MenuTrigger;
  export const Content = MenuContent;
  export const Item = MenuItem;
  export const CheckboxItem = MenuCheckboxItem;
  export const RadioGroup = MenuRadioGroup;
  export const RadioItem = MenuRadioItem;
  export const ItemIndicator = MenuItemIndicator;
  export const Group = MenuGroup;
  export const Label = MenuLabel;
  export const Separator = MenuSeparator;
  export const Shortcut = MenuShortcut;
  export const Search = CommandSearch;
  export const Empty = CommandEmpty;

  export const Style = menuStyle;
}
