'use client';

import {
  useId,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ColorFieldClear } from './clear';
import { ColorFieldContent, type ColorFieldContentProps } from './content';
import { ColorFieldContext } from './context';
import { isType } from './is-type';
import { colorFieldStyle } from './style';
import { ColorFieldTrigger } from './trigger';
import { useColorField } from './use-color-field';
import { FieldPopup, FieldPopupHeader, useDrawerPresentation } from '../../../internal/field-popup';
import { FormValue } from '../../../internal/form-value';
import { resolveState } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import {
  containsElementOfType,
  flattenFragments,
  invariant,
  isNodeFromAnyWindow,
  mergeProps,
  mergeRefs,
} from '../../../utils';
import { ColorPickerAlphaSlider } from '../../data/color-picker/alpha-slider';
import { useFieldSize } from '../field/context';

import type { FieldTriggerVariant } from '../../../internal/surfaces/field-surface';
import type { IdsSize } from '../../../tokens/types';
import type { ColorFormat } from '../../data/color-picker/color';

export type ColorFieldVariant = FieldTriggerVariant;

export type ColorFieldState = {
  open: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  empty: boolean;
};

export type ColorFieldProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'className' | 'style' | 'children' | 'type'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  variant?: ColorFieldVariant;
  size?: IdsSize;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string | ((state: ColorFieldState) => string | undefined);
  style?: CSSProperties;
  children?: ReactNode;
};

const ALPHA_SLIDER = new Set<unknown>([ColorPickerAlphaSlider]);

const FIRST_CONTROL = [
  '[data-color-picker] input:not([type=radio]):not([tabindex="-1"])',
  '[data-color-picker] [role=slider]:not([tabindex="-1"])',
  '[data-color-picker] [role=radiogroup]',
].join(', ');

export function ColorFieldRoot({
  value,
  defaultValue,
  onValueChange,
  format = 'hex',
  variant = 'outline',
  size,
  invalid,
  readOnly = false,
  required = false,
  disabled = false,
  placeholder,
  open,
  defaultOpen,
  onOpenChange,
  name,
  form,
  className,
  style,
  children,
  ref: forwardedRef,
  onBlur,
  ...native
}: ColorFieldProps) {
  const t = useTranslate();

  const nodes = flattenFragments(children);
  const triggers = nodes.filter(isType(ColorFieldTrigger));
  const clears = nodes.filter(isType(ColorFieldClear));
  const contents = nodes.filter(isType(ColorFieldContent));
  invariant(
    triggers.length <= 1 && contents.length <= 1 && clears.length <= 1,
    'ColorField accepts one Trigger, Content and Clear.',
  );
  const content = contents[0] as ReactElement<ColorFieldContentProps> | undefined;
  const alpha = containsElementOfType(content?.props.children, ALPHA_SLIDER);
  const mobileVariant = content?.props.mobileVariant;

  const { rootRef, triggerRef, ...field } = useColorField({
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    format,
    alpha,
    disabled,
    readOnly,
  });
  const { state: s, actions } = field;
  const drawer = useDrawerPresentation(mobileVariant);
  const popupId = `ids-color-${useId()}`;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = colorFieldStyle({ variant, size: resolvedSize });

  const ariaInvalid = native['aria-invalid'] ?? invalid ?? (s.invalid || undefined);
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const state: ColorFieldState = {
    open: s.open,
    disabled,
    readOnly,
    invalid: isInvalid,
    required,
    empty: !s.value,
  };

  const popupSelector = `[data-color-field-popup="${popupId}"]`;
  const triggerId = native.id ?? `${popupId}-trigger`;
  const valueId = `${popupId}-value`;
  const labelThenValue = native['aria-labelledby']
    ? `${native['aria-labelledby']} ${valueId}`
    : native['aria-label']
      ? `${triggerId} ${valueId}`
      : undefined;
  const triggerProps = mergeProps(native as Record<string, unknown>, {
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(triggerRef, forwardedRef),
    id: triggerId,
    'aria-labelledby': labelThenValue,
    type: 'button',
    role: 'combobox',
    form,
    disabled,
    'aria-haspopup': 'dialog',
    'aria-expanded': s.open,
    'aria-controls': s.open ? popupId : undefined,
    'aria-invalid': ariaInvalid,
    'aria-required': native['aria-required'] ?? (required || undefined),
    'aria-readonly': readOnly || undefined,
    'data-field-input': '',
    'data-placeholder': state.empty ? '' : undefined,
    'data-readonly': readOnly ? '' : undefined,
    onClick: actions.toggle,
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => actions.onTriggerKeyDown(event),
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      const next = event.relatedTarget;
      const movingIntoPopup =
        isNodeFromAnyWindow(next) && (next as Element).closest?.(popupSelector);
      if (movingIntoPopup) return;
      onBlur?.(event);
    },
  });

  return (
    <ColorFieldContext
      value={{
        field,
        state,
        placeholder,
        triggerProps,
        valueId,
        picker: {
          value: s.text,
          onValueChange: actions.change,
          format,
          alpha,
          size: resolvedSize,
          disabled,
          readOnly,
        },
        size: resolvedSize,
        styles,
      }}
    >
      <div
        ref={rootRef}
        data-color-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-open={s.open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        data-required={required ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
        style={style}
      >
        {triggers.length ? triggers : <ColorFieldTrigger />}
        {clears.length ? clears : <ColorFieldClear />}
        <FormValue
          name={name}
          form={form}
          value={s.text}
          required={required && !readOnly}
          disabled={disabled}
          anchor={triggerRef}
        />
      </div>
      {s.open && (
        <FieldPopup
          anchor={rootRef}
          onClose={actions.close}
          mobileVariant={mobileVariant}
          preferredWidth={resolvedSize === 'tiny' ? 248 : 280}
          initialFocusSelector={FIRST_CONTROL}
          role="dialog"
          id={popupId}
          aria-labelledby={native['aria-labelledby']}
          aria-label={native['aria-labelledby'] ? undefined : native['aria-label']}
          data-color-field-popup={popupId}
          className={styles.popup()}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (
              isNodeFromAnyWindow(next) &&
              (event.currentTarget.contains(next) || next === triggerRef.current)
            )
              return;
            onBlur?.(event as unknown as FocusEvent<HTMLButtonElement>);
          }}
        >
          {drawer && (
            <FieldPopupHeader closeLabel={t('common.close')} onClose={() => actions.close(true)} />
          )}
          {contents.length ? contents : <ColorFieldContent />}
        </FieldPopup>
      )}
    </ColorFieldContext>
  );
}
