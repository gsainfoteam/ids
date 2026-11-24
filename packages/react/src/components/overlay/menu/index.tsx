import { type ComponentProps, type ReactNode } from 'react';

import { type MenuTriggerType } from './hooks/use-menu';
import { MenuCheckboxItem } from './parts/checkbox-item';
import { CommandEmpty, CommandSearch } from './parts/command';
import { MenuContent } from './parts/content';
import { MenuGroup } from './parts/group';
import { MenuItemIndicator, type MenuItemIndicatorProps } from './parts/indicator';
import { MenuItem } from './parts/item';
import { MenuLabel } from './parts/label';
import { MenuRadioGroup } from './parts/radio-group';
import { MenuRadioItem } from './parts/radio-item';
import { MenuSeparator } from './parts/separator';
import { MenuShortcut } from './parts/shortcut';
import { MenuTrigger } from './parts/trigger';
import { MenuRoot } from './root';
import { menuStyle } from './style';
import { type AnchoredAlign, type AnchoredSide } from '../../../internal/overlay';

import type { Divider } from '../../layout/divider';
import type { Kbd } from '../../typography/kbd';
import type { Hotkey } from '@tanstack/react-hotkeys';

export function Menu(props: Menu.Props) {
  return <MenuRoot {...props} />;
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
    'orientation' | 'align' | 'aria-hidden' | 'asChild' | 'children' | 'className'
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
