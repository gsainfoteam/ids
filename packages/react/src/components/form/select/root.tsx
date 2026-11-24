'use client';

import {
  useRef,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { SelectContext } from './context';
import { useInternalSelect, type SelectValue as SelectSelection } from './hooks/use-select';
import { useInternalSelectItemsWarning } from './hooks/use-select-items-warning';
import {
  holdsASearchField,
  isForeignComponent,
  selectOptionsIn,
  splitSelectChildren,
} from './lib/select-children';
import { SelectContent } from './parts/content';
import { SelectTrigger } from './parts/trigger';
import { selectStyle } from './style';
import { FieldPopup, useInternalDrawerPresentation } from '../../../internal/field-popup';
import { resolveState } from '../../../internal/lib/state-props';
import { FormValue } from '../../../internal/parts/form-value';
import { type FieldTriggerVariant } from '../../../internal/surfaces/lib/field-surface';
import { useInternalTranslate } from '../../../internal/translate';
import { invariant, isNodeFromAnyWindow, mergeProps, mergeRefs } from '../../../utils';
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

export function SelectRoot(props: SelectProps) {
  const t = useInternalTranslate();

  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    placeholder,
    variant = 'outline',
    size,
    invalid,
    readOnly = false,
    required = false,
    disabled = false,
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

  const { triggers, clears, contents, rest, mobileVariant } = splitSelectChildren(children);
  const options = selectOptionsIn(children);

  const popupNodes = contents.length ? contents : rest;
  useInternalSelectItemsWarning(!options.length && popupNodes.some(isForeignComponent));
  const searchable = holdsASearchField(popupNodes);

  const drawer = useInternalDrawerPresentation(mobileVariant);
  const select = useInternalSelect({
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
    : { 'aria-label': native['aria-label'] ?? t('common.options') };

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
          label={native['aria-label'] ?? t('common.options')}
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
