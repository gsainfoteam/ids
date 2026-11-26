import { type ComponentProps, type ComponentType, type CSSProperties, type ReactNode } from 'react';

import { type FieldSurfaceVariant } from '../../surfaces/lib/field-surface';

import type { IdsSize } from '../../../tokens/types';
import type { AccessibleName } from '../../lib/accessible-name';
import type { TemporalChange, TemporalFieldState } from '../hooks/use-temporal-field';

export type TemporalFieldProps<V> = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'className' | 'style' | 'disabled' | 'children'
> & {
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: FieldSurfaceVariant;
  size?: IdsSize;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: ComponentProps<'input'>['autoComplete'];
  className?: string | ((state: TemporalFieldState<V>) => string | undefined);
  style?: CSSProperties | ((state: TemporalFieldState<V>) => CSSProperties | undefined);
  children?: ReactNode;
};

export type TemporalMessages = {
  clear: string;
  close: string;
  open?: string;
};

export type TemporalPickerApi<V> = {
  value: V;
  change: TemporalChange<V>;
  close: (restoreFocus: boolean) => void;
  size: IdsSize;
  name: AccessibleName;
};

export type TemporalPicker<V> = (api: TemporalPickerApi<V>) => ReactNode;

export type TemporalConfig<V> = {
  kind: 'date' | 'time' | 'date-time';
  empty: V;
  isEmpty: (value: V) => boolean;
  isSame: (a: V, b: V) => boolean;
  display: (value: V) => string;
  serialize: (value: V) => string | string[];
  messages: TemporalMessages;
  icon: ComponentType<ComponentProps<'svg'>>;
  picker: TemporalPicker<V>;
  preferredWidth?: number;
  initialFocusSelector: string;
  parse?: (text: string) => V | undefined;
  inputHint?: string;
  pickerParts?: ReadonlySet<unknown>;
};
