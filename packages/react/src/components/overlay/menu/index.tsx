import { type ComponentProps, type ReactNode } from 'react';

import { MenuCheckboxItem } from './checkbox-item';
import { CommandEmpty, CommandSearch } from './command';
import { MenuContent } from './content';
import { MenuGroup } from './group';
import { MenuItemIndicator, type MenuItemIndicatorProps } from './indicator';
import { MenuItem } from './item';
import { MenuLabel } from './label';
import { MenuRadioGroup } from './radio-group';
import { MenuRadioItem } from './radio-item';
import { MenuRoot } from './root';
import { MenuSeparator } from './separator';
import { MenuShortcut } from './shortcut';
import { menuStyle } from './style';
import { MenuTrigger } from './trigger';
import { type MenuTriggerType } from './use-menu';
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
