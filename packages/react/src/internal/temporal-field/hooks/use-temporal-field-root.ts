'use client';

import { type KeyboardEvent, type MouseEvent } from 'react';

import { useInternalTemporalField } from './use-temporal-field';
import { useFieldSize } from '../../../components/form/field/context';
import { mergeRefs } from '../../../utils';
import { keyHandler, withModifiers } from '../../lib/keys';
import { splitTemporalChildren } from '../lib/children';
import { temporalFieldStyle } from '../style';

import type { TemporalContextValue } from '../context';
import type { TemporalConfig, TemporalFieldProps, TemporalPickerApi } from '../lib/types';

export type UseTemporalFieldRootOptions<V> = Omit<
  TemporalFieldProps<V>,
  'className' | 'style' | 'name'
> & {
  config: TemporalConfig<V>;
  variant: NonNullable<TemporalFieldProps<V>['variant']>;
  required: boolean;
  readOnly: boolean;
  disabled: boolean;
};

export function useInternalTemporalFieldRoot<V>({
  config,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  variant,
  size,
  invalid,
  required,
  readOnly,
  disabled,
  placeholder,
  form,
  children,
  ref,
  onBlur,
  ...native
}: UseTemporalFieldRootOptions<V>) {
  const ariaInvalid = native['aria-invalid'];
  const {
    state,
    input,
    blocked,
    popupId,
    controlRef,
    rootRef,
    change,
    clear,
    close,
    toggle,
    show,
    onBlur: handleBlur,
  } = useInternalTemporalField<V>({
    value,
    defaultValue: defaultValue ?? config.empty,
    onValueChange,
    empty: config.empty,
    isEmpty: config.isEmpty,
    isSame: config.isSame,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
    invalid: ariaInvalid === undefined ? invalid : ariaInvalid === true || ariaInvalid === 'true',
    required,
    display: config.display,
    parse: config.parse,
    onBlur,
  });
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const fieldName = native['aria-labelledby']
    ? { 'aria-labelledby': native['aria-labelledby'] }
    : { 'aria-label': native['aria-label'] ?? '' };
  const picker: TemporalPickerApi<V> = {
    value: state.value,
    change,
    close,
    size: resolvedSize,
    name: fieldName,
  };
  const styles = temporalFieldStyle({ variant, size: resolvedSize, disabled });
  const slots = splitTemporalChildren(children, config.pickerParts, !!config.parse);

  const control = {
    ...native,
    role: 'combobox',
    id: native.id ?? `${popupId}-trigger`,
    disabled,
    form,
    'data-field-input': '',
    'aria-haspopup': 'dialog',
    'aria-expanded': state.open,
    'aria-controls': state.open ? popupId : undefined,
    'aria-invalid': state.invalid || undefined,
    'aria-required': native['aria-required'] ?? (required || undefined),
    'aria-readonly': readOnly || undefined,

    ref: mergeRefs(controlRef, ref),
  };
  const trigger = slots.hasInput
    ? {
        type: 'button',
        tabIndex: -1,
        'aria-label': config.messages.open,
        'aria-haspopup': 'dialog',
        'aria-expanded': state.open,
        'aria-controls': state.open ? popupId : undefined,
        disabled: disabled || readOnly,
        onClick: toggle,
        onBlur: handleBlur,
      }
    : {
        ...control,
        type: 'button',
        className: styles.trigger(),
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          native.onClick?.(event);
          if (!event.defaultPrevented) toggle();
        },
        onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
          native.onKeyDown?.(event);
          keyHandler(
            withModifiers({
              ArrowDown: () => {
                show();
              },
            }),
          )(event);
        },
        onBlur: handleBlur,
      };
  const textBox = slots.hasInput
    ? {
        ...control,
        type: 'text',
        readOnly,
        autoComplete: native.autoComplete ?? 'off',
        spellCheck: false,
        placeholder: placeholder ?? config.inputHint,
        className: styles.input(),
        value: input.value,
        onChange: input.onChange,
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
          (native.onKeyDown as ((event: KeyboardEvent<HTMLInputElement>) => void) | undefined)?.(
            event,
          );
          input.onKeyDown(event);
        },
        onBlur: input.onBlur,
      }
    : undefined;

  const context: TemporalContextValue = {
    state,
    size: resolvedSize,
    hasClear: slots.hasClear,
    hasInput: slots.hasInput,
    input: textBox,
    blocked,
    clear,
    onBlur: handleBlur,
    trigger,
    text: state.empty ? (placeholder ?? '') : config.display(state.value),
    icon: config.icon,
    messages: config.messages,
    content: () => config.picker(picker),
    picker: picker as TemporalPickerApi<unknown>,
    popup: {
      id: popupId,
      name: fieldName,
      anchor: rootRef,
      preferredWidth: config.preferredWidth,
      initialFocusSelector: config.initialFocusSelector,
    },
    styles,
  };

  return { context, state, slots, resolvedSize, rootRef, controlRef, styles };
}
