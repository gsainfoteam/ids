import { type CSSProperties, type ReactNode } from 'react';

import { ChipContent, type ChipContentProps } from './content';
import { ChipCreate, type ChipCreateProps } from './create';
import { ChipEmpty, type ChipEmptyProps } from './empty';
import { ChipGroup, type ChipGroupProps } from './group';
import { ChipInput, type ChipInputProps } from './input';
import { ChipItem, type ChipItemProps } from './item';
import { ChipItemIndicator, type ChipItemIndicatorProps } from './item-indicator';
import { ChipLimit, type ChipLimitProps } from './limit';
import {
  ChipFieldRoot,
  type ChipFieldVariant,
  type ChipFieldState,
  type ChipFieldItemState,
  type ChipFieldInputProps,
} from './root';
import { chipFieldStyle } from './style';

import type { ChipValidateResult } from './chip-values';
import type { IdsSize } from '../../../tokens/types';

export function ChipField(props: ChipField.Props) {
  return <ChipFieldRoot {...props} />;
}

export namespace ChipField {
  export type Props = ChipFieldInputProps & {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    creatable?: boolean;
    onCreate?: (value: string) => void;
    validate?: (value: string) => ChipValidateResult;
    maxCount?: number;
    variant?: ChipFieldVariant;
    size?: IdsSize;
    invalid?: boolean;
    mobileVariant?: 'popover' | 'drawer';
    name?: string;
    form?: string;
    required?: boolean;
    disabled?: boolean;
    removeLabel?: (label: string) => string;
    children?: ReactNode;
    className?: string | ((state: ChipFieldState) => string | undefined);
    style?: CSSProperties;
  };
  export type State = ChipFieldState;
  export type ItemState = ChipFieldItemState;
  export type Variant = ChipFieldVariant;

  export type ContentProps = ChipContentProps;
  export type ItemProps = ChipItemProps;
  export type IndicatorProps = ChipItemIndicatorProps;
  export type GroupProps = ChipGroupProps;
  export type CreateProps = ChipCreateProps;
  export type EmptyProps = ChipEmptyProps;
  export type LimitProps = ChipLimitProps;

  export const Input = ChipInput;
  export namespace Input {
    export type Props = ChipInputProps;
  }

  export const Content = ChipContent;
  export const Item = ChipItem;
  export const ItemIndicator = ChipItemIndicator;
  export const Group = ChipGroup;
  export const Create = ChipCreate;
  export const Empty = ChipEmpty;
  export const Limit = ChipLimit;

  export const Style = chipFieldStyle;
}

export type {
  ChipFieldVariant,
  ChipFieldState,
  ChipFieldItemState,
  ChipFieldInputProps,
} from './root';

export type ChipFieldProps = ChipField.Props;
