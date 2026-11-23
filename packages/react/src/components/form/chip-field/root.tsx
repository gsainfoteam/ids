'use client';

import { isValidElement, useId, type ComponentProps, type FocusEvent, type ReactNode } from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';

import { ChipContext, useInternalChip, type InputAttributes } from './context';
import { useInternalChipField } from './hooks/use-chip-field';
import { useInternalChipFieldItemsWarning } from './hooks/use-chip-field-items-warning';
import { chipOptionsIn, isForeignComponent, splitChildren } from './lib/chip-children';
import { ChipContent } from './parts/content';
import { ChipInput } from './parts/input';
import { chipFieldStyle } from './style';
import { FieldPopup, useInternalDrawerPresentation } from '../../../internal/field-popup';
import { resolveState } from '../../../internal/lib/state-props';
import { FormValue } from '../../../internal/parts/form-value';
import { type FieldTriggerVariant } from '../../../internal/surfaces/lib/field-surface';
import { useInternalTranslate } from '../../../internal/translate';
import { invariant, isNodeFromAnyWindow } from '../../../utils';
import { Chip } from '../../data/chip';
import { useFieldSize } from '../field/context';

import type { ChipField } from '.';

export type ChipFieldVariant = FieldTriggerVariant;

export type ChipFieldState = {
  open: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  full: boolean;
  empty: boolean;
};

export type ChipFieldItemState = { selected: boolean; highlighted: boolean; disabled: boolean };

type ChipSubmissionProps = 'name' | 'form' | 'required';

export type ChipFieldInputProps = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | ChipSubmissionProps
  | 'children'
  | 'className'
  | 'style'
  | 'color'
  | 'disabled'
>;

const cancelChipFocusMove = (event: Chip.RemoveEvent) => event.preventDefault();

function Adornments({ items, className }: { items: ReactNode[]; className: string }) {
  return items.map((item, index) => (
    <span
      key={(isValidElement(item) && item.key) || index}
      data-chip-field-adornment=""
      className={className}
    >
      {item}
    </span>
  ));
}

export function ChipFieldRoot({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  onCreate,
  validate,
  maxCount,
  variant = 'outline',
  size,
  invalid,
  disabled,
  required = false,
  name,
  form,
  removeLabel: removeLabelProp,
  children,
  className,
  style,
  ...rootInputProps
}: ChipField.Props) {
  const t = useInternalTranslate();
  const removeLabel = removeLabelProp ?? ((label: string) => t('chipField.remove', { label }));

  const {
    onChange: _wouldRecordQueryAsValue,
    onBlur: onFieldBlur,
    ...inputProps
  } = rootInputProps as ChipFieldInputProps & { onChange?: unknown };
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    '`<ChipField>` `maxCount` must be a non-negative integer.',
  );
  const options = chipOptionsIn(children);
  const split = splitChildren(children);
  const { leading, trailing, mobileVariant } = split;
  const input = split.input ?? <ChipInput />;
  const popup = split.contents.length ? split.contents : <ChipContent>{split.loose}</ChipContent>;
  const creatable = onCreate !== undefined;

  const merged = { ...inputProps, ...input.props };
  const isDisabled = !!(input.props.disabled ?? disabled);
  const isReadOnly = !!merged.readOnly;
  const ariaInvalid = merged['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false';

  const drawer = useInternalDrawerPresentation(mobileVariant);
  const { rootRef, inputRef, drawerInputRef, ...field } = useInternalChipField({
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    options,
    creatable,
    onCreate,
    validate,
    maxCount,
    disabled: isDisabled,
    readOnly: isReadOnly,
    drawer,
  });
  const { state: s, ids, handlers } = field;
  const popupSelector = `[data-chip-field-popup="${ids.listbox}"]`;
  const staysInField = (next: EventTarget | null) =>
    isNodeFromAnyWindow(next) &&
    (!!rootRef.current?.contains(next) || !!(next as Element).closest?.(popupSelector));
  invariant(
    Array.isArray(s.selected) &&
      s.selected.every((item) => typeof item === 'string') &&
      new Set(s.selected).size === s.selected.length,
    '`<ChipField>` `value` must contain unique strings.',
  );
  useInternalChipFieldItemsWarning(!options.length && !creatable && isForeignComponent(popup));

  const fallbackId = useId();
  const state: ChipFieldState = {
    open: s.open,
    disabled: isDisabled,
    readOnly: isReadOnly,
    invalid: isInvalid,
    required,
    full: s.full,
    empty: s.selected.length === 0,
  };
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = chipFieldStyle({ variant, size: resolvedSize });

  const inputDefaults: InputAttributes = {
    placeholder: t('chipField.placeholder'),
    size: 1,
    autoComplete: 'off',
    'aria-invalid': isInvalid || undefined,
    'aria-required': required || undefined,
  };
  const comboboxWiring: InputAttributes & Record<`data-${string}`, string> = {
    'data-chip-field-input': '',
    'data-field-input': '',
    id: typeof merged.id === 'string' ? merged.id : `ids-chip-${fallbackId}-input`,
    form,
    type: 'text',
    role: 'combobox',
    value: s.query,
    disabled: isDisabled,
    'aria-expanded': s.open,
    'aria-controls': s.open ? ids.listbox : undefined,
    'aria-autocomplete': 'list',
    'aria-activedescendant':
      s.open && !drawer && s.activeCandidate !== undefined
        ? ids.option(s.activeCandidate)
        : undefined,
    onClick: () => field.actions.setOpen(true),
    onChange: handlers.onInputChange,
    onPaste: handlers.onPaste,
    onCompositionStart: handlers.onCompositionStart,
    onCompositionEnd: handlers.onCompositionEnd,
    onKeyDown: (event) => handlers.onInputKeyDown(event, 'field'),
    onBlur: (event) => {
      if (!staysInField(event.relatedTarget)) onFieldBlur?.(event);
    },
  };
  const labelledBy = merged['aria-labelledby'];
  const listLabel = labelledBy
    ? { 'aria-labelledby': labelledBy }
    : { 'aria-label': merged['aria-label'] ?? t('chipField.listbox') };

  return (
    <ChipContext
      value={{
        field,
        inputRef,
        drawerInputRef,
        options,
        state,
        maxCount,
        drawer,
        inputProps,
        inputDefaults,
        comboboxWiring,
        listLabel,
        removeLabel,
        size: resolvedSize,
        styles,
      }}
    >
      <div
        ref={rootRef}
        data-chip-field=""
        data-open={s.open ? '' : undefined}
        data-disabled={isDisabled ? '' : undefined}
        data-readonly={isReadOnly ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        data-required={required ? '' : undefined}
        data-full={s.full ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
        style={style}
        onClick={(event) => {
          if (s.blocked) return;
          const target = event.target as Element;
          if (target.closest('button, a, input, textarea, select, label')) return;
          if (s.open && target.closest('[data-chip-field-icon]')) {
            field.actions.close(true);
            return;
          }
          inputRef.current?.focus({ preventScroll: true });
          field.actions.setOpen(true);
        }}
      >
        <Adornments items={leading} className={styles.adornment()} />
        <div data-chip-field-values="" className={styles.values()}>
          <Chips />
          {input}
        </div>
        <Adornments items={trailing} className={styles.adornment()} />
        {options.length > 0 && (
          <ChevronDownIcon aria-hidden="true" data-chip-field-icon="" className={styles.icon()} />
        )}
        <FormValue
          name={name}
          form={form}
          value={s.selected}
          required={required && !isReadOnly}
          disabled={isDisabled}
          anchor={inputRef}
        />
      </div>
      {s.open && (
        <FieldPopup
          anchor={rootRef}
          onClose={field.actions.close}
          mobileVariant={mobileVariant}
          matchWidth
          label={merged['aria-label'] ?? t('chipField.listbox')}
          aria-labelledby={drawer ? labelledBy : undefined}
          data-chip-field-popup={ids.listbox}
          onBlur={(event) => {
            if (!staysInField(event.relatedTarget))
              onFieldBlur?.(event as unknown as FocusEvent<HTMLInputElement>);
          }}
        >
          {popup}
        </FieldPopup>
      )}
    </ChipContext>
  );
}

function Chips() {
  const c = useInternalChip('Chips');
  return c.field.state.selected.map((item) => {
    const option = c.options.find((candidate) => candidate.value === item);
    const label = option?.label ?? item;
    const removable = !c.field.state.blocked && !option?.disabled;
    return (
      <Chip
        key={item}
        size={c.size}
        disabled={option?.disabled}
        data-chip-field-chip=""
        className={c.styles.chip()}
        onRemove={
          removable
            ? (event) => {
                cancelChipFocusMove(event);
                c.field.handlers.onChipRemove(item);
              }
            : undefined
        }
      >
        {label}
        {removable && (
          <Chip.Close
            tabIndex={-1}
            aria-label={c.removeLabel(label)}
            data-chip-field-remove={item}
            data-field-input=""
            className={c.styles.chipRemove()}
            onKeyDown={(event) => c.field.handlers.onChipKeyDown(event, item)}
          />
        )}
      </Chip>
    );
  });
}
