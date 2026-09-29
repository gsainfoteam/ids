import { SelectClear, type SelectClearProps } from './clear';
import { SelectContent, type SelectContentProps } from './content';
import { SelectEmpty, type SelectEmptyProps } from './empty';
import { SelectGroup, type SelectGroupProps } from './group';
import { SelectIcon, type SelectIconProps } from './icon';
import { SelectItem, type SelectItemProps } from './item';
import { SelectItemIndicator, type SelectItemIndicatorProps } from './item-indicator';
import {
  SelectRoot,
  type SelectVariant,
  type SelectState,
  type SelectItemState,
  type SelectValueState,
  type SelectProps,
} from './root';
import { SelectSearchField, type SelectSearchFieldProps } from './search-field';
import { SelectSeparator, type SelectSeparatorProps } from './separator';
import { selectStyle } from './style';
import { SelectTrigger, type SelectTriggerProps } from './trigger';
import { SelectValue, type SelectValueProps } from './value';

export function Select(props: SelectProps) {
  return <SelectRoot {...props} />;
}

export namespace Select {
  export type Props = SelectProps;
  export type State = SelectState;
  export type Variant = SelectVariant;
  export type ItemState = SelectItemState;
  export type ValueState = SelectValueState;

  export type TriggerProps = SelectTriggerProps;
  export type ValueProps = SelectValueProps;
  export type IconProps = SelectIconProps;
  export type ClearProps = SelectClearProps;
  export type ContentProps = SelectContentProps;
  export type SearchFieldProps = SelectSearchFieldProps;
  export type ItemProps = SelectItemProps;
  export type ItemIndicatorProps = SelectItemIndicatorProps;
  export type GroupProps = SelectGroupProps;
  export type SeparatorProps = SelectSeparatorProps;
  export type EmptyProps = SelectEmptyProps;

  export const Trigger = SelectTrigger;
  export const Value = SelectValue;
  export const Icon = SelectIcon;
  export const Clear = SelectClear;
  export const Content = SelectContent;
  export const SearchField = SelectSearchField;
  export const Item = SelectItem;
  export const ItemIndicator = SelectItemIndicator;
  export const Group = SelectGroup;
  export const Separator = SelectSeparator;
  export const Empty = SelectEmpty;

  export const Style = selectStyle;
}

export type {
  SelectVariant,
  SelectState,
  SelectItemState,
  SelectValueState,
  SelectProps,
} from './root';
