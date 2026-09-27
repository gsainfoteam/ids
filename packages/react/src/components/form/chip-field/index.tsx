import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  useEffect,
  useId,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { isNotNil } from 'es-toolkit';

import { CREATE, useChipField } from './use-chip-field';
import {
  FieldPopup,
  fieldListbox,
  fieldTrigger,
  flattenParts,
  part,
  resolveState,
  useDrawerPresentation,
  type FieldTriggerVariant,
} from '../../../internal/field-popup';
import { FieldPopupSearch } from '../../../internal/field-popup/search';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { flattenFragments, invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
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

// `name`, `form` and `required` describe the submitted chips, not the typed query, so they
// stay on the root: a named query input would submit the half-typed search text.
export type ChipFieldInputProps = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'name'
  | 'form'
  | 'required'
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
  control: InputAttributes;
  listLabel: { 'aria-label'?: string; 'aria-labelledby'?: string };
  removeLabel: (label: string) => string;
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
  // react-hook-form's value binding passes a native onChange as well as onValueChange. The chips
  // are reported through onValueChange, so an onChange here must not reach the search input,
  // where it would record the typed text as the field's value.
  const { onChange: _nativeChange, ...inputProps } = rootInputProps as ChipFieldInputProps & {
    onChange?: unknown;
  };
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

  // The sentinel's own props win over the root's, so container state is derived from the
  // merged result, not from the root props alone.
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
  const styles = ChipField.Style({ variant, size: useFieldSize(size) ?? 'standard' });

  const inputDefaults: InputAttributes = {
    placeholder: messages.chipField.placeholder,
    autoComplete: 'off',
    'aria-invalid': isInvalid || undefined,
    'aria-required': required || undefined,
  };
  const control: InputAttributes & Record<`data-${string}`, string> = {
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
        control,
        listLabel,
        removeLabel,
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
        {/* A field that only creates values, like a list of addresses, has nothing to open. */}
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
        >
          {popup}
        </FieldPopup>
      )}
    </ChipContext>
  );
}

// A chip is focused through its remove button, which is out of the Tab order: the arrow keys
// reach it from the input, so Tab still leaves the field in one step.
function Chips() {
  const c = useChip('Chips');
  return c.field.state.selected.map((item) => {
    const option = c.options.find((candidate) => candidate.value === item);
    const label = option?.label ?? item;
    const removable = !c.field.state.blocked && !option?.disabled;
    return (
      <span
        key={item}
        data-chip-field-chip=""
        data-disabled={option?.disabled ? '' : undefined}
        className={c.styles.chip()}
      >
        <span className={c.styles.chipLabel()}>{label}</span>
        {removable && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={c.removeLabel(label)}
            data-chip-field-remove={item}
            data-field-input=""
            className={c.styles.chipRemove()}
            onClick={(event) => c.field.handlers.onChipClick(item, event.currentTarget)}
            onKeyDown={(event) => c.field.handlers.onChipKeyDown(event, item)}
          >
            <XMarkIcon aria-hidden="true" />
          </button>
        )}
      </span>
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
    // Input values win over the root's, and handlers compose so Field and react-hook-form
    // wiring on the root still runs. The combobox wiring is merged last: its handlers run
    // after the user's (skipped if they preventDefault) and its ARIA state cannot be replaced.
    ...mergeProps(mergeProps(c.inputDefaults, mergeProps(c.inputProps, rest)), c.control),
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

// On a small screen the list opens as a modal sheet, which the field's own input sits behind,
// so the sheet carries a search field of its own bound to the same query.
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
  const nodes = flattenParts(slotChildren(children, asChild));
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
      {!flattenParts(nodes).some(isType(ChipItemIndicator)) && <ChipItemIndicator />}
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
          onPointerDown: (event: PointerEvent) => event.preventDefault(),
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
      onPointerDown: (event: PointerEvent) => event.preventDefault(),
      onPointerMove: (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && !error) actions.highlight(CREATE);
      },
      onClick: actions.create,
    }),
  );
}

// These stay mounted as live regions, so the change is announced when the list empties or the
// limit is reached.
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
  return flattenParts(node).some(
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
    // Checks a value typed or pasted as a new chip: true (or nothing) accepts it, false rejects
    // it with the default message, a string rejects it with that message.
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
    // Shown on the chip; the item's text by default.
    label?: string;
    // Matched by the search text; the label by default.
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
    // `onChange` here observes the typed search text; the selected chips are the root's.
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
      // A chip is a neutral pill like Chip; the theme color only marks the one focused from the
      // keyboard.
      chip: [
        'inline-flex max-w-full min-w-0 items-center gap-0.5 rounded-full bg-(--ids-color-muted)',
        'text-(--ids-color-on-surface) data-disabled:opacity-60',
        'transition-[color,background-color] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'has-[[data-chip-field-remove]:focus-visible]:bg-(--ids-color-primary)/15',
        'has-[[data-chip-field-remove]:focus-visible]:text-(--ids-color-primary)',
      ],
      chipLabel: 'truncate',
      // The glyph is small, so an invisible margin widens what a finger can hit.
      chipRemove: [
        'relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none',
        'text-(--ids-color-on-muted) hover:bg-(--ids-color-on-surface)/10 hover:text-(--ids-color-on-surface)',
        'after:absolute after:-inset-1',
      ],
      input: [
        'min-w-20 flex-1 bg-transparent py-1 outline-none',
        'placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
      ],
      icon: 'shrink-0 cursor-pointer text-(--ids-color-on-muted)',
      listbox: fieldListbox.list,
      item: fieldListbox.option,
      indicator: fieldListbox.indicator,
      group: 'flex flex-col',
      groupHeading: fieldListbox.heading,
      create: [fieldListbox.option, 'data-invalid:text-(--ids-color-danger)'],
      empty: [fieldListbox.empty, 'not-data-empty:sr-only'],
      limit: [
        'px-2.5 pt-1.5 pb-1 text-caption-c1-regular text-(--ids-color-on-muted)',
        'not-data-full:sr-only',
      ],
    },
    variants: {
      // On the muted fill of `soft` a muted chip would vanish, so it takes the surface instead.
      variant: {
        outline: { root: fieldTrigger.variant.outline },
        soft: { root: fieldTrigger.variant.soft, chip: 'bg-(--ids-color-surface)' },
        ghost: { root: fieldTrigger.variant.ghost },
      } satisfies Record<ChipFieldVariant, object>,
      // The shell grows with wrapped chips, so the control height is a floor, not a height.
      size: {
        standard: {
          root: [fieldTrigger.size.standard, 'h-auto min-h-(--ids-size-control-standard)'],
          adornment: [
            'gap-1',
            'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
          ],
          chip: 'h-6 ps-2.5 pe-2.5 text-caption-c1-medium has-[button]:pe-1',
          chipRemove: 'size-4 [&_svg]:size-3',
          icon: fieldTrigger.icon.standard,
        },
        tiny: {
          root: [fieldTrigger.size.tiny, 'h-auto min-h-(--ids-size-control-tiny)'],
          adornment: [
            'gap-0.5',
            'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
          ],
          chip: 'h-5 ps-2 pe-2 text-caption-c2-medium has-[button]:pe-0.5',
          chipRemove: 'size-3.5 [&_svg]:size-2.5',
          icon: fieldTrigger.icon.tiny,
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}

export type ChipFieldProps = ChipField.Props;
