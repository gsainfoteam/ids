import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  useEffect,
  useId,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import { isNotNil } from 'es-toolkit';

import { CREATE, useChipField } from './use-chip-field';
import { FieldPopup, useDrawerPresentation } from '../../../internal/field-popup';
import { FieldPopupSearch } from '../../../internal/field-popup/search';
import { fieldTrigger, type FieldTriggerVariant } from '../../../internal/field-surface';
import { FormValue } from '../../../internal/form-value';
import { listStyles } from '../../../internal/list-styles';
import { messages } from '../../../internal/messages';
import { resolveState } from '../../../internal/state-props';
import {
  flattenFragments,
  invariant,
  isNodeFromAnyWindow,
  keepFocusWhereItIs,
  mergeProps,
  mergeRefs,
  part,
  tv,
} from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Chip } from '../../data/chip';
import { Slot } from '../../utility/slot';
import { useFieldSize } from '../field/context';
import { collectOptions, slotChildren, type SelectOption } from '../select/select-options';

import type { ChipValidateResult } from './chip-values';
import type { IdsSize } from '../../../tokens/types';

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

type InputAttributes = Omit<ComponentProps<'input'>, 'children'>;

type Context = {
  field: Omit<ReturnType<typeof useChipField>, 'rootRef' | 'inputRef' | 'drawerInputRef'>;
  inputRef: RefObject<HTMLInputElement | null>;
  drawerInputRef: RefObject<HTMLInputElement | null>;
  options: SelectOption[];
  state: ChipFieldState;
  maxCount: number | undefined;
  drawer: boolean;
  inputProps: ChipFieldInputProps;
  inputDefaults: InputAttributes;
  comboboxWiring: InputAttributes;
  listLabel: { 'aria-label'?: string; 'aria-labelledby'?: string };
  removeLabel: (label: string) => string;
  size: IdsSize;
  styles: ReturnType<typeof ChipField.Style>;
};

const ChipContext = createContext<Context | null>(null);
const ItemContext = createContext<ChipFieldItemState | null>(null);

function useChip(name: string) {
  const context = use(ChipContext);
  invariant(context, `\`<ChipField.${name}>\` must be used inside \`<ChipField>\`.`);
  return context;
}

const isType = (type: unknown) => (node: ReactNode) => isValidElement(node) && node.type === type;

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
          input: items[inputIndex] as ReactElement<ChipField.Input.Props>,
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

export function ChipField({
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
  removeLabel = messages.chipField.remove,
  children,
  className,
  style,
  ...rootInputProps
}: ChipField.Props) {
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
  const styles = ChipField.Style({ variant, size: resolvedSize });

  const inputDefaults: InputAttributes = {
    placeholder: messages.chipField.placeholder,
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
    : { 'aria-label': merged['aria-label'] ?? messages.chipField.listbox };

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
          label={merged['aria-label'] ?? messages.chipField.listbox}
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

function ChipInput({
  asChild,
  children,
  disabled: _disabled,
  className,
  style,
  ref,
  ...rest
}: ChipField.Input.Props) {
  const c = use(ChipContext);
  invariant(c != null, '`<ChipField.Input>` must be used inside `<ChipField>`.');
  const { inputRef } = c;

  const props = {
    ...mergeProps(mergeProps(c.inputDefaults, mergeProps(c.inputProps, rest)), c.comboboxWiring),
    className: c.styles.input({ className }),
    style,
  };

  if (asChild === true) {
    invariant(
      isValidElement(children) && (typeof children.type !== 'string' || children.type === 'input'),
      '`<ChipField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );
    return (
      <Slot {...(props as Slot.Props)} ref={mergeRefs(inputRef, c.inputProps.ref, ref)}>
        {children}
      </Slot>
    );
  }
  invariant(children == null, '`<ChipField.Input>` renders the search text itself, not children.');
  return <input {...props} ref={mergeRefs(inputRef, c.inputProps.ref, ref)} />;
}

function DrawerSearch() {
  const c = useChip('Content');
  const { drawerInputRef } = c;
  const { state: s, ids, handlers } = c.field;
  return (
    <FieldPopupSearch
      ref={drawerInputRef}
      aria-label={messages.chipField.search}
      data-chip-field-search=""
      value={s.query}
      placeholder={c.inputDefaults.placeholder}
      onChange={handlers.onInputChange}
      onPaste={handlers.onPaste}
      onCompositionStart={handlers.onCompositionStart}
      onCompositionEnd={handlers.onCompositionEnd}
      onKeyDown={(event) => handlers.onInputKeyDown(event, 'drawer')}
      controls={ids.listbox}
      activeDescendant={s.activeCandidate !== undefined ? ids.option(s.activeCandidate) : undefined}
    />
  );
}

function ChipContent({ asChild, children, className, ...props }: ChipField.ContentProps) {
  const c = useChip('Content');
  const nodes = flattenFragments(slotChildren(children, asChild));
  const empties = nodes.filter(isType(ChipEmpty));
  const limits = nodes.filter(isType(ChipLimit));
  const items = nodes.filter((node) => !empties.includes(node) && !limits.includes(node));
  const list = (
    <>
      {items}
      {!items.some(isType(ChipCreate)) && <ChipCreate />}
    </>
  );
  return (
    <>
      {c.drawer && <DrawerSearch />}
      {limits.length ? limits : <ChipLimit />}
      {part(
        'div',
        asChild,
        asChild && isValidElement(children) ? cloneElement(children, {}, list) : list,
        mergeProps(props, {
          ...c.listLabel,
          id: c.field.ids.listbox,
          role: 'listbox',
          'aria-multiselectable': true,
          className: c.styles.listbox({ className }),
        }),
      )}
      {empties.length ? empties : <ChipEmpty />}
    </>
  );
}

function ChipItem({
  value,
  label: _label,
  searchValue: _searchValue,
  disabled = false,
  asChild,
  children,
  className,
  ...props
}: ChipField.ItemProps) {
  const c = useChip('Item');
  const { state: s, ids, actions } = c.field;
  if (!s.visible.some((option) => option.value === value)) return null;
  const selected = s.selected.includes(value);
  const state: ChipFieldItemState = {
    selected,
    highlighted: s.activeCandidate === value,
    disabled: disabled || (s.full && !selected),
  };
  const content = typeof children === 'function' ? children(state) : children;
  const withIndicator = (nodes: ReactNode) => (
    <>
      {nodes}
      {!flattenFragments(nodes).some(isType(ChipItemIndicator)) && <ChipItemIndicator />}
    </>
  );
  return (
    <ItemContext value={state}>
      {part(
        'div',
        asChild,
        asChild && isValidElement<{ children?: ReactNode }>(content)
          ? cloneElement(content, {}, withIndicator(content.props.children))
          : withIndicator(content),
        mergeProps(props, {
          id: ids.option(value),
          role: 'option',
          'aria-selected': selected,
          'aria-disabled': state.disabled || undefined,
          'data-selected': selected ? '' : undefined,
          'data-highlighted': state.highlighted ? '' : undefined,
          'data-disabled': state.disabled ? '' : undefined,
          className: c.styles.item({ className: resolveState(className, state) }),
          onPointerDown: keepFocusWhereItIs,
          onPointerMove: (event: PointerEvent) => {
            if (event.pointerType === 'mouse' && !state.disabled && !state.highlighted)
              actions.highlight(value);
          },
          onClick: () => {
            if (!state.disabled) actions.toggle(value);
          },
        }),
      )}
    </ItemContext>
  );
}

function ChipItemIndicator({ asChild, children, className, ...props }: ChipField.IndicatorProps) {
  const c = useChip('ItemIndicator');
  const item = use(ItemContext);
  invariant(item, '`<ChipField.ItemIndicator>` must be used inside `<ChipField.Item>`.');
  if (!item.selected) return null;
  return part(
    'span',
    asChild,
    children ?? <CheckIcon />,
    mergeProps(props, {
      'aria-hidden': true,
      'data-chip-field-item-indicator': '',
      className: c.styles.indicator({ className }),
    }),
  );
}

function ChipGroup({ heading, asChild, children, className, ...props }: ChipField.GroupProps) {
  const c = useChip('Group');
  const headingId = useId();
  const inner = slotChildren(children, asChild);
  const visible = new Set(c.field.state.visible.map((option) => option.value));
  if (!collectOptions(inner, OPTION_KINDS).some((option) => visible.has(option.value))) return null;
  const nodes = (
    <>
      <div id={headingId} className={c.styles.groupHeading()}>
        {heading}
      </div>
      {inner}
    </>
  );
  return part(
    'div',
    asChild,
    asChild && isValidElement(children) ? cloneElement(children, {}, nodes) : nodes,
    mergeProps(props, {
      role: 'group',
      'aria-labelledby': headingId,
      className: c.styles.group({ className }),
    }),
  );
}

function ChipCreate({ asChild, children, className, ...props }: ChipField.CreateProps) {
  const c = useChip('Create');
  const { state: s, ids, actions } = c.field;
  if (!s.canCreate) return null;
  const error = s.createError;
  const content =
    error ??
    (typeof children === 'function'
      ? children(s.trimmed)
      : (children ?? messages.chipField.create(s.trimmed)));
  return part(
    'div',
    asChild,
    content,
    mergeProps(props, {
      id: ids.option(CREATE),
      role: 'option',
      'aria-selected': false,
      'aria-disabled': error ? true : undefined,
      'data-chip-field-create': '',
      'data-highlighted': s.activeCandidate === CREATE ? '' : undefined,
      'data-invalid': error ? '' : undefined,
      className: c.styles.create({ className }),
      onPointerDown: keepFocusWhereItIs,
      onPointerMove: (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && !error) actions.highlight(CREATE);
      },
      onClick: actions.create,
    }),
  );
}

function ChipEmpty({ asChild, children, className, ...props }: ChipField.EmptyProps) {
  const c = useChip('Empty');
  const none = c.field.state.visible.length === 0 && !c.field.state.canCreate;
  return part(
    'div',
    asChild,
    none ? (children ?? messages.chipField.empty) : null,
    mergeProps(props, {
      role: 'status',
      'data-chip-field-empty': '',
      'data-empty': none ? '' : undefined,
      className: c.styles.empty({ className }),
    }),
  );
}

function ChipLimit({ asChild, children, className, ...props }: ChipField.LimitProps) {
  const c = useChip('Limit');
  const full = c.field.state.full && c.maxCount !== undefined;
  return part(
    'div',
    asChild,
    full ? (children ?? messages.chipField.limit(c.maxCount ?? 0)) : null,
    mergeProps(props, {
      role: 'status',
      'data-chip-field-limit': '',
      'data-full': full ? '' : undefined,
      className: c.styles.limit({ className }),
    }),
  );
}

const OPTION_KINDS = { item: ChipItem, group: ChipGroup, content: ChipContent };
const POPUP_PARTS: unknown[] = [ChipContent, ChipItem, ChipGroup, ChipCreate, ChipEmpty, ChipLimit];

function isForeignComponent(node: ReactNode): boolean {
  return flattenFragments(node).some(
    (child) =>
      isValidElement<ChipField.ContentProps>(child) &&
      (child.type === ChipContent
        ? isForeignComponent(slotChildren(child.props.children, child.props.asChild))
        : typeof child.type === 'function' && !POPUP_PARTS.includes(child.type)),
  );
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

  type BoxProps = Omit<ComponentProps<'div'>, 'children'> & {
    asChild?: boolean;
    children?: ReactNode;
  };
  export type ContentProps = BoxProps;
  export type ItemProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
    value: string;
    label?: string;
    searchValue?: string;
    disabled?: boolean;
    asChild?: boolean;
    className?: string | ((state: ChipFieldItemState) => string | undefined);
    children?: ReactNode | ((state: ChipFieldItemState) => ReactNode);
  };
  export type IndicatorProps = ComponentProps<'span'> & { asChild?: boolean };
  export type GroupProps = BoxProps & { heading: ReactNode };
  export type CreateProps = Omit<ComponentProps<'div'>, 'children'> & {
    asChild?: boolean;
    children?: ReactNode | ((text: string) => ReactNode);
  };
  export type EmptyProps = BoxProps;
  export type LimitProps = BoxProps;

  export const Input = ChipInput;
  export const Content = ChipContent;
  export const Item = ChipItem;
  export const ItemIndicator = ChipItemIndicator;
  export const Group = ChipGroup;
  export const Create = ChipCreate;
  export const Empty = ChipEmpty;
  export const Limit = ChipLimit;

  export namespace Input {
    export type Props = ChipFieldInputProps & {
      onChange?: ComponentProps<'input'>['onChange'];
      onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
      asChild?: boolean;
      children?: ReactNode;
      disabled?: boolean;
      className?: string;
      style?: CSSProperties;
    };
  }

  export const Style = tv({
    slots: {
      root: ['relative', fieldTrigger.base, 'flex-wrap gap-1 py-1'],
      adornment: [
        'inline-flex shrink-0 items-center empty:hidden',
        'not-has-[button]:text-(--ids-color-on-muted)',
        'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
        '[&_button]:p-0',
      ],
      chip: [
        'max-w-full min-w-0 gap-0.5 data-disabled:opacity-60',
        'transition-[color,background-color] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'data-focus-visible:bg-(--ids-color-primary)/15 data-focus-visible:text-(--ids-color-primary)',
      ],
      chipRemove: 'relative ring-0! after:absolute after:-inset-1',
      input: [
        'min-w-20 flex-1 bg-transparent py-1 outline-none',
        'placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
      ],
      icon: 'shrink-0 cursor-pointer text-(--ids-color-on-muted)',
      listbox: listStyles.list,
      item: listStyles.option,
      indicator: listStyles.indicator,
      group: 'flex flex-col',
      groupHeading: listStyles.heading,
      create: [listStyles.option, 'data-invalid:text-(--ids-color-danger)'],
      empty: [listStyles.empty, 'not-data-empty:sr-only'],
      limit: [
        'px-2.5 pt-1.5 pb-1 text-caption-c1-regular text-(--ids-color-on-muted)',
        'not-data-full:sr-only',
      ],
    },
    variants: {
      variant: {
        outline: { root: fieldTrigger.variant.outline },
        soft: { root: fieldTrigger.variant.soft, chip: 'bg-(--ids-color-surface)' },
        ghost: { root: fieldTrigger.variant.ghost },
      } satisfies Record<ChipFieldVariant, object>,
      size: {
        standard: {
          root: [fieldTrigger.size.standard, 'h-auto min-h-(--ids-size-control-standard)'],
          adornment: [
            'gap-1',
            'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
          ],
          chip: 'h-6 px-2.5',
          chipRemove: '[&_svg]:size-3',
          icon: fieldTrigger.icon.standard,
        },
        tiny: {
          root: [fieldTrigger.size.tiny, 'h-auto min-h-(--ids-size-control-tiny)'],
          adornment: [
            'gap-0.5',
            'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
          ],
          chip: 'h-5 px-2',
          chipRemove: '[&_svg]:size-2.5',
          icon: fieldTrigger.icon.tiny,
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}

export type ChipFieldProps = ChipField.Props;
