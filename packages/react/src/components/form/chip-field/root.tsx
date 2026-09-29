'use client';

import {
  isValidElement,
  useEffect,
  useId,
  type ComponentProps,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { isNotNil } from 'es-toolkit';

import { ChipContent, type ChipContentProps } from './content';
import { ChipContext, useChip, type InputAttributes } from './context';
import { ChipCreate } from './create';
import { ChipEmpty } from './empty';
import { ChipGroup, OPTION_KINDS } from './group';
import { ChipInput, type ChipInputProps } from './input';
import { isType } from './is-type';
import { ChipItem } from './item';
import { ChipLimit } from './limit';
import { chipFieldStyle } from './style';
import { useChipField } from './use-chip-field';
import { FieldPopup, useDrawerPresentation } from '../../../internal/field-popup';
import { type FieldTriggerVariant } from '../../../internal/field-surface';
import { FormValue } from '../../../internal/form-value';
import { resolveState } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments, invariant, isNodeFromAnyWindow } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Chip } from '../../data/chip';
import { useFieldSize } from '../field/context';
import { collectOptions, slotChildren } from '../select/select-options';

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

const POPUP_PARTS: unknown[] = [ChipContent, ChipItem, ChipGroup, ChipCreate, ChipEmpty, ChipLimit];

function isForeignComponent(node: ReactNode): boolean {
  return flattenFragments(node).some(
    (child) =>
      isValidElement<ChipContentProps>(child) &&
      (elementTypeOf(child) === ChipContent
        ? isForeignComponent(slotChildren(child.props.children, child.props.asChild))
        : typeof elementTypeOf(child) === 'function' &&
          !POPUP_PARTS.includes(elementTypeOf(child))),
  );
}

const cancelChipFocusMove = (event: Chip.RemoveEvent) => event.preventDefault();

function isPopupPart(node: ReactNode) {
  return POPUP_PARTS.some((type) => isType(type)(node));
}

function splitChildren(children: ReactNode) {
  const nodes = flattenFragments(children);
  const popup = nodes.filter(isPopupPart);
  const contents = popup.filter(isType(ChipContent));
  invariant(contents.length <= 1, '`<ChipField>` accepts at most one `<ChipField.Content>`.');
  invariant(
    contents.length === 0 || popup.length === 1,
    '`<ChipField>` takes options either inside `<ChipField.Content>` or directly, not both.',
  );

  const items = nodes.filter((node) => !isPopupPart(node));
  const inputIndexes = items
    .map((child, index) => (isType(ChipInput)(child) ? index : null))
    .filter(isNotNil);
  invariant(inputIndexes.length <= 1, '`<ChipField>` accepts at most one `<ChipField.Input />`.');

  const inputIndex = inputIndexes[0];
  const adornments =
    inputIndex == null
      ? { leading: items, input: <ChipInput />, trailing: [] as ReactNode[] }
      : {
          leading: items.slice(0, inputIndex),
          input: items[inputIndex] as ReactElement<ChipInputProps>,
          trailing: items.slice(inputIndex + 1),
        };
  return { ...adornments, popup: contents.length ? contents : <ChipContent>{popup}</ChipContent> };
}

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
  creatable = false,
  onCreate,
  validate,
  maxCount,
  variant = 'outline',
  size,
  invalid,
  mobileVariant = 'drawer',
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
  const t = useTranslate();
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
  const options = collectOptions(children, OPTION_KINDS);
  invariant(
    options.every((option) => typeof option.value === 'string'),
    '`<ChipField.Item>` `value` is required.',
  );
  invariant(
    new Set(options.map((option) => option.value)).size === options.length,
    '`<ChipField>` has a duplicate `<ChipField.Item>` value.',
  );
  const { leading, input, trailing, popup } = splitChildren(children);

  const merged = { ...inputProps, ...input.props };
  const isDisabled = !!(input.props.disabled ?? disabled);
  const isReadOnly = !!merged.readOnly;
  const ariaInvalid = merged['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false';

  const drawer = useDrawerPresentation(mobileVariant);
  const { rootRef, inputRef, drawerInputRef, ...field } = useChipField({
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
  const hidesItems = !options.length && !creatable && isForeignComponent(popup);
  useEffect(() => {
    if (isDevelopment && hidesItems)
      console.warn(
        '[IDS] ChipField found no ChipField.Item. Items are read from the children of ChipField, ChipField.Content and ChipField.Group, and from Fragments, but not from inside other components.',
      );
  }, [hidesItems]);

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
        <Chips />
        {input}
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
  const c = useChip('Chips');
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
