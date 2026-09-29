'use client';

import {
  isValidElement,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { SelectClear, type SelectClearProps } from './clear';
import { SelectContent, type SelectContentProps } from './content';
import { SelectContext } from './context';
import { SelectEmpty, type SelectEmptyProps } from './empty';
import { OPTION_KINDS, SelectGroup, type SelectGroupProps } from './group';
import { SelectIcon, type SelectIconProps } from './icon';
import { isType } from './is-type';
import { SelectItem, type SelectItemProps } from './item';
import { SelectItemIndicator, type SelectItemIndicatorProps } from './item-indicator';
import { SelectSearchField, type SelectSearchFieldProps } from './search-field';
import { collectOptions, slotChildren } from './select-options';
import { SelectSeparator, type SelectSeparatorProps } from './separator';
import { selectStyle } from './style';
import { SelectTrigger, type SelectTriggerProps } from './trigger';
import { useSelect, type SelectValue as SelectSelection } from './use-select';
import { SelectValue, type SelectValueProps } from './value';
import { FieldPopup, useDrawerPresentation } from '../../../internal/field-popup';
import { type FieldTriggerVariant } from '../../../internal/field-surface';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { resolveState } from '../../../internal/state-props';
import {
  flattenFragments,
  invariant,
  isNodeFromAnyWindow,
  mergeProps,
  mergeRefs,
} from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type SelectVariant = FieldTriggerVariant;

export type SelectState = {
  open: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  placeholder: boolean;
  multiple: boolean;
};

export type SelectItemState = { selected: boolean; highlighted: boolean; disabled: boolean };

export type SelectValueState = {
  value: SelectSelection;
  labels: string[];
  placeholder: boolean;
};

type NativeTriggerProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'className' | 'style' | 'children' | 'type'
>;

type BaseProps = NativeTriggerProps & {
  placeholder?: string;
  variant?: SelectVariant;
  size?: IdsSize;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mobileVariant?: 'popover' | 'drawer';
  className?: string | ((state: SelectState) => string | undefined);
  style?: CSSProperties;
  children?: ReactNode;
};

export type SelectProps = BaseProps &
  (
    | {
        selectionMode?: 'single';
        value?: string | null;
        defaultValue?: string | null;
        onValueChange?: (value: string | null) => void;
      }
    | {
        selectionMode: 'multiple';
        value?: string[];
        defaultValue?: string[];
        onValueChange?: (value: string[]) => void;
      }
  );

const PARTS = new Set<unknown>([
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectClear,
  SelectContent,
  SelectSearchField,
  SelectItem,
  SelectItemIndicator,
  SelectGroup,
  SelectSeparator,
  SelectEmpty,
]);

const isForeignComponent = (node: ReactNode): boolean =>
  isValidElement<SelectContentProps>(node) &&
  (node.type === SelectContent
    ? flattenFragments(slotChildren(node.props.children, node.props.asChild)).some(
        isForeignComponent,
      )
    : typeof node.type === 'function' && !PARTS.has(node.type));

export function Select(props: SelectProps) {
  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    placeholder = messages.select.placeholder,
    variant = 'outline',
    size,
    invalid,
    readOnly = false,
    required = false,
    disabled = false,
    mobileVariant,
    name,
    form,
    className,
    style,
    children,
    ref: forwardedRef,
    onBlur,
    ...native
  } = props;
  const multiple = selectionMode === 'multiple';

  const nodes = flattenFragments(children);
  const triggers = nodes.filter(isType(SelectTrigger));
  const clears = nodes.filter(isType(SelectClear));
  const contents = nodes.filter(isType(SelectContent));
  invariant(
    triggers.length <= 1 && clears.length <= 1 && contents.length <= 1,
    'Select accepts at most one Trigger, Clear and Content.',
  );
  const rest = nodes.filter(
    (node) => !triggers.includes(node) && !clears.includes(node) && !contents.includes(node),
  );
  invariant(
    !contents.length || !rest.some((node) => isValidElement(node)),
    'Select takes its options either inside Select.Content or directly, not both.',
  );

  const options = collectOptions(children, OPTION_KINDS);
  invariant(
    options.every((option) => typeof option.value === 'string'),
    'Select.Item: value is required.',
  );
  invariant(
    new Set(options.map((option) => option.value)).size === options.length,
    'Select: duplicate Item value.',
  );

  const popupNodes = contents.length ? contents : rest;
  const hidesItems = !options.length && popupNodes.some(isForeignComponent);
  useEffect(() => {
    if (isDevelopment && hidesItems)
      console.warn(
        '[IDS] Select found no Select.Item. Items are read from the children of Select, Select.Content and Select.Group, and from Fragments, but not from inside other components.',
      );
  }, [hidesItems]);
  const searchable = popupNodes.some((node) =>
    isValidElement<SelectContentProps>(node) && node.type === SelectContent
      ? flattenFragments(slotChildren(node.props.children, node.props.asChild)).some(
          isType(SelectSearchField),
        )
      : isType(SelectSearchField)(node),
  );

  const drawer = useDrawerPresentation(mobileVariant);
  const select = useSelect({
    multiple,
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: SelectSelection) => void) | undefined,
    open,
    defaultOpen,
    onOpenChange,
    options,
    disabled,
    readOnly,
    drawer,
    searchable,
  });
  const { state: s, ids } = select;
  invariant(
    multiple ? Array.isArray(s.value) : s.value === null || typeof s.value === 'string',
    'Select: multiple requires string[]; single requires string | null.',
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = selectStyle({ variant, size: resolvedSize });
  const ariaInvalid = native['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const state: SelectState = {
    open: s.open,
    disabled,
    readOnly,
    invalid: isInvalid,
    required,
    placeholder: s.selected.length === 0,
    multiple,
  };

  const popupSelector = `[data-select-popup="${ids.base}"]`;
  const triggerProps = mergeProps(native as Record<string, unknown>, {
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(select.triggerRef, forwardedRef),
    id: native.id ?? `${ids.base}-trigger`,
    type: 'button',
    form,
    disabled,
    role: 'combobox',
    'aria-haspopup': 'listbox',
    'aria-expanded': s.open,
    'aria-controls': s.open ? ids.listbox : undefined,
    'aria-activedescendant':
      s.open && s.focusOwner === 'trigger' && s.activeValue !== undefined
        ? ids.option(s.activeValue)
        : undefined,
    'aria-invalid': ariaInvalid,
    'aria-required': native['aria-required'] ?? (required || undefined),
    'aria-readonly': readOnly || undefined,
    'data-field-input': '',
    'data-popup-open': s.open ? '' : undefined,
    'data-placeholder': state.placeholder ? '' : undefined,
    'data-readonly': readOnly ? '' : undefined,
    onClick: () => select.actions.toggle(),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => select.onKeyDown(event, 'trigger'),
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      const next = event.relatedTarget;
      const movingIntoPopup =
        isNodeFromAnyWindow(next) && (next as Element).closest?.(popupSelector);
      if (movingIntoPopup) return;
      onBlur?.(event);
    },
  });

  const listLabel = native['aria-labelledby']
    ? { 'aria-labelledby': native['aria-labelledby'] }
    : { 'aria-label': native['aria-label'] ?? messages.select.listbox };

  return (
    <SelectContext
      value={{
        select,
        options,
        state,
        placeholder,
        triggerProps,
        listLabel,
        size: resolvedSize,
        styles,
      }}
    >
      <div
        ref={rootRef}
        data-select=""
        data-size={resolvedSize}
        data-variant={variant}
        data-open={s.open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        data-required={required ? '' : undefined}
        data-placeholder={state.placeholder ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
        style={style}
      >
        {triggers.length ? triggers : <SelectTrigger />}
        {clears}
        <FormValue
          name={name}
          form={form}
          value={s.selected}
          required={required && !readOnly}
          disabled={disabled}
          anchor={select.triggerRef}
        />
      </div>
      {s.open && (
        <FieldPopup
          anchor={rootRef}
          onClose={select.actions.close}
          mobileVariant={mobileVariant}
          label={native['aria-label'] ?? messages.select.listbox}
          aria-labelledby={drawer ? native['aria-labelledby'] : undefined}
          data-select-popup={ids.base}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (
              isNodeFromAnyWindow(next) &&
              (event.currentTarget.contains(next) || next === select.triggerRef.current)
            )
              return;
            onBlur?.(event as unknown as FocusEvent<HTMLButtonElement>);
          }}
        >
          {contents.length ? contents : <SelectContent>{rest}</SelectContent>}
        </FieldPopup>
      )}
    </SelectContext>
  );
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
