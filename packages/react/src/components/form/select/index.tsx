import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';

import { collectOptions, slotChildren, type SelectOption } from './select-options';
import { useSelect, type SelectValue } from './use-select';
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
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps, mergeRefs, tv } from '../../../utils';
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
  value: SelectValue;
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

type Context = {
  select: ReturnType<typeof useSelect>;
  options: SelectOption[];
  state: SelectState;
  placeholder: string;
  triggerProps: Record<string, unknown>;
  listLabel: { 'aria-label'?: string; 'aria-labelledby'?: string };
  styles: ReturnType<typeof Select.Style>;
};

const SelectContext = createContext<Context | null>(null);
const ItemContext = createContext<SelectItemState | null>(null);

function useSelectContext(part: string) {
  const context = use(SelectContext);
  invariant(context, `${part} must be rendered inside Select.`);
  return context;
}

const isType = (type: unknown) => (node: ReactNode) => isValidElement(node) && node.type === type;

const isForeignComponent = (node: ReactNode): boolean =>
  isValidElement<Select.ContentProps>(node) &&
  (node.type === SelectContent
    ? flattenParts(slotChildren(node.props.children, node.props.asChild)).some(isForeignComponent)
    : typeof node.type === 'function' && !PARTS.has(node.type));

// Duck-typed rather than `instanceof Node`, which fails across frames.
const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && 'nodeType' in value;

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

  const nodes = flattenParts(children);
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
    if (import.meta.env.DEV && hidesItems)
      console.warn(
        '[IDS] Select found no Select.Item. Items are read from the children of Select, Select.Content and Select.Group, and from Fragments, but not from inside other components.',
      );
  }, [hidesItems]);
  const searchable = popupNodes.some((node) =>
    isValidElement<Select.ContentProps>(node) && node.type === SelectContent
      ? flattenParts(slotChildren(node.props.children, node.props.asChild)).some(
          isType(SelectSearchField),
        )
      : isType(SelectSearchField)(node),
  );

  const drawer = useDrawerPresentation(mobileVariant);
  const select = useSelect({
    multiple,
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: SelectValue) => void) | undefined,
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
  const styles = Select.Style({ variant, size: resolvedSize });
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
    // mergeRefs only composes the refs into a callback; nothing reads them during render.
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
    // Moving into the popup is not leaving the field.
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      const next = event.relatedTarget;
      if (isNode(next) && (next as Element).closest?.(popupSelector)) return;
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
              isNode(next) &&
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

function SelectTrigger({ asChild, children, className, ...props }: Select.TriggerProps) {
  const c = useSelectContext('Select.Trigger');
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <SelectValue />
        <SelectIcon />
      </>
    ),
    mergeProps(props, {
      ...c.triggerProps,
      className: c.styles.trigger({ className: resolveState(className, c.state) }),
    }),
  );
}

function SelectValue({ asChild, children, placeholder, className, ...props }: Select.ValueProps) {
  const c = useSelectContext('Select.Value');
  const labels = c.select.state.selected.map(
    (value) => c.options.find((option) => option.value === value)?.label ?? value,
  );
  const state: SelectValueState = {
    value: c.select.state.value,
    labels,
    placeholder: labels.length === 0,
  };
  // Two labels read comfortably in a trigger; the rest become a count that never truncates.
  const shown = labels.length > 2 ? labels.slice(0, 2) : labels;
  const content =
    typeof children === 'function'
      ? children(state)
      : (children ?? (
          <>
            <span className={c.styles.valueText()}>
              {state.placeholder ? (placeholder ?? c.placeholder) : shown.join(', ')}
            </span>
            {labels.length > shown.length && (
              <span className={c.styles.more()}>
                {messages.select.more(labels.length - shown.length)}
              </span>
            )}
          </>
        ));
  return part(
    'span',
    asChild,
    content,
    mergeProps(props, {
      'data-select-value': '',
      'data-placeholder': state.placeholder ? '' : undefined,
      className: c.styles.value({ className }),
    }),
  );
}

function SelectIcon({ asChild, children, className, ...props }: Select.IconProps) {
  const c = useSelectContext('Select.Icon');
  return part(
    'span',
    asChild,
    children ?? <ChevronDownIcon />,
    mergeProps(props, { 'aria-hidden': true, className: c.styles.icon({ className }) }),
  );
}

function SelectClear({ asChild, children, className, ...props }: Select.ClearProps) {
  const c = useSelectContext('Select.Clear');
  if (!c.select.state.selected.length || c.state.readOnly) return null;
  return part(
    'button',
    asChild,
    children ?? <XMarkIcon aria-hidden="true" />,
    mergeProps(props, {
      type: 'button',
      'aria-label': props['aria-label'] ?? messages.select.clear,
      disabled: c.state.disabled,
      'data-select-clear': '',
      className: c.styles.clear({ className }),
      onClick: c.select.actions.clear,
    }),
  );
}

function SelectContent({ asChild, children, className, ...props }: Select.ContentProps) {
  const c = useSelectContext('Select.Content');
  const { state: s, ids } = c.select;
  const nodes = flattenParts(slotChildren(children, asChild));
  const search = nodes.filter(isType(SelectSearchField));
  const empty = nodes.filter(isType(SelectEmpty));
  const items = nodes.filter((node) => !search.includes(node) && !empty.includes(node));
  const owner = s.focusOwner === 'list';
  return (
    <>
      {search}
      {part(
        'div',
        asChild,
        asChild && isValidElement(children) ? cloneElement(children, {}, items) : items,
        mergeProps(props, {
          ...c.listLabel,
          id: ids.listbox,
          role: 'listbox',
          'aria-multiselectable': c.state.multiple || undefined,
          'aria-activedescendant':
            owner && s.activeValue !== undefined ? ids.option(s.activeValue) : undefined,
          tabIndex: owner ? 0 : undefined,
          'data-popup-autofocus': owner ? '' : undefined,
          onKeyDown: owner
            ? (event: KeyboardEvent<HTMLElement>) => c.select.onKeyDown(event, 'list')
            : undefined,
          className: c.styles.listbox({ className }),
        }),
      )}
      {empty.length ? empty : <SelectEmpty />}
    </>
  );
}

function SelectSearchField({
  asChild,
  children,
  className,
  placeholder,
  ...props
}: Select.SearchFieldProps) {
  const c = useSelectContext('Select.SearchField');
  const { state: s, ids } = c.select;
  return (
    <div data-select-search="" className={c.styles.searchRoot()}>
      <MagnifyingGlassIcon aria-hidden="true" />
      {part(
        'input',
        asChild,
        children,
        mergeProps(props as Record<string, unknown>, {
          type: 'text',
          role: 'combobox',
          autoComplete: props.autoComplete ?? 'off',
          autoCorrect: 'off',
          autoCapitalize: 'none',
          spellCheck: props.spellCheck ?? false,
          'aria-label': props['aria-label'] ?? messages.select.search,
          'aria-expanded': true,
          'aria-controls': ids.listbox,
          'aria-autocomplete': 'list',
          'aria-activedescendant':
            s.activeValue !== undefined ? ids.option(s.activeValue) : undefined,
          'data-popup-autofocus': '',
          value: s.query,
          placeholder: placeholder ?? messages.select.searchPlaceholder,
          className: c.styles.search({ className }),
          onChange: (event: ChangeEvent<HTMLInputElement>) =>
            c.select.actions.search(event.currentTarget.value),
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => c.select.onKeyDown(event, 'search'),
        }),
      )}
    </div>
  );
}

function SelectItem({
  value,
  label: _label,
  searchValue: _searchValue,
  disabled = false,
  asChild,
  children,
  className,
  ...props
}: Select.ItemProps) {
  const c = useSelectContext('Select.Item');
  const { state: s, ids } = c.select;
  if (!s.visible.some((option) => option.value === value)) return null;
  const state: SelectItemState = {
    selected: s.selected.includes(value),
    highlighted: s.activeValue === value,
    disabled,
  };
  const content = typeof children === 'function' ? children(state) : children;
  // Parts are optional: an item that does not place its own indicator gets one at its end.
  const withIndicator = (nodes: ReactNode) => (
    <>
      {nodes}
      {!flattenParts(nodes).some(isType(SelectItemIndicator)) && <SelectItemIndicator />}
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
          'aria-selected': state.selected,
          'aria-disabled': disabled || undefined,
          'data-selected': state.selected ? '' : undefined,
          'data-highlighted': state.highlighted ? '' : undefined,
          'data-disabled': disabled ? '' : undefined,
          className: c.styles.item({ className: resolveState(className, state) }),
          // Keeps focus on the trigger or search field while the list is clicked.
          onPointerDown: (event: PointerEvent) => event.preventDefault(),
          // Touch moves are scrolls, so only a mouse highlights by hovering.
          onPointerMove: (event: PointerEvent) => {
            if (event.pointerType === 'mouse' && !disabled && !state.highlighted)
              c.select.actions.highlight(value);
          },
          onClick: () => {
            if (!disabled) c.select.actions.choose(value);
          },
        }),
      )}
    </ItemContext>
  );
}

function SelectItemIndicator({
  asChild,
  children,
  className,
  ...props
}: Select.ItemIndicatorProps) {
  const c = useSelectContext('Select.ItemIndicator');
  const item = use(ItemContext);
  invariant(item, 'Select.ItemIndicator must be rendered inside Select.Item.');
  if (!item.selected) return null;
  return part(
    'span',
    asChild,
    children ?? <CheckIcon />,
    mergeProps(props, {
      'aria-hidden': true,
      'data-select-item-indicator': '',
      className: c.styles.indicator({ className }),
    }),
  );
}

function SelectGroup({ heading, asChild, children, className, ...props }: Select.GroupProps) {
  const c = useSelectContext('Select.Group');
  const headingId = useId();
  const inner = slotChildren(children, asChild);
  const visible = new Set(c.select.state.visible.map((option) => option.value));
  if (!collectOptions(inner, OPTION_KINDS).some((option) => visible.has(option.value))) return null;
  const content = (
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
    asChild && isValidElement(children) ? cloneElement(children, {}, content) : content,
    mergeProps(props, {
      role: 'group',
      'aria-labelledby': headingId,
      className: c.styles.group({ className }),
    }),
  );
}

// A listbox may only own options and groups, so the rule is drawn but hidden from the tree. It
// is left out while searching, where it would divide results that no longer belong together.
function SelectSeparator({ asChild, children, className, ...props }: Select.SeparatorProps) {
  const c = useSelectContext('Select.Separator');
  if (c.select.state.query) return null;
  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      'aria-hidden': true,
      'data-select-separator': '',
      className: c.styles.separator({ className }),
    }),
  );
}

// Stays mounted as a live region so "no results" is announced when a search empties the list.
function SelectEmpty({ asChild, children, className, ...props }: Select.EmptyProps) {
  const c = useSelectContext('Select.Empty');
  const none = c.select.state.visible.length === 0;
  return part(
    'div',
    asChild,
    none ? (children ?? messages.select.empty) : null,
    mergeProps(props, {
      role: 'status',
      'data-select-empty': '',
      'data-empty': none ? '' : undefined,
      className: c.styles.empty({ className }),
    }),
  );
}

const OPTION_KINDS = { item: SelectItem, group: SelectGroup, content: SelectContent };
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

export namespace Select {
  export type Props = SelectProps;
  export type State = SelectState;
  export type Variant = SelectVariant;
  export type ItemState = SelectItemState;
  export type ValueState = SelectValueState;

  type BoxProps = Omit<ComponentProps<'div'>, 'children'> & {
    asChild?: boolean;
    children?: ReactNode;
  };

  export type TriggerProps = Omit<ComponentProps<'button'>, 'className'> & {
    asChild?: boolean;
    className?: string | ((state: SelectState) => string | undefined);
  };
  export type ValueProps = Omit<ComponentProps<'span'>, 'children'> & {
    asChild?: boolean;
    placeholder?: string;
    children?: ReactNode | ((state: SelectValueState) => ReactNode);
  };
  export type IconProps = ComponentProps<'span'> & { asChild?: boolean };
  export type ClearProps = ComponentProps<'button'> & { asChild?: boolean };
  export type ContentProps = BoxProps;
  export type SearchFieldProps = ComponentProps<'input'> & { asChild?: boolean };
  export type ItemProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
    value: string;
    // Shown in the trigger and matched by typeahead; the item's text by default.
    label?: string;
    // Matched by the search field; the label by default.
    searchValue?: string;
    disabled?: boolean;
    asChild?: boolean;
    className?: string | ((state: SelectItemState) => string | undefined);
    children?: ReactNode | ((state: SelectItemState) => ReactNode);
  };
  export type ItemIndicatorProps = ComponentProps<'span'> & { asChild?: boolean };
  export type GroupProps = BoxProps & { heading: ReactNode };
  export type SeparatorProps = BoxProps;
  export type EmptyProps = BoxProps;

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

  export const Style = tv({
    slots: {
      // The trigger carries data-field-input, so focus-ring rings the whole field for it while
      // Clear keeps a ring of its own.
      root: ['relative', fieldTrigger.base],
      trigger: [
        'flex h-full min-w-0 flex-1 cursor-pointer items-center self-stretch bg-transparent text-start outline-none',
        'disabled:cursor-not-allowed data-readonly:cursor-default',
      ],
      value: 'flex min-w-0 flex-1 items-center gap-1 data-placeholder:text-(--ids-color-on-muted)',
      valueText: 'truncate',
      more: 'shrink-0 text-(--ids-color-on-muted)',
      icon: 'inline-flex shrink-0 text-(--ids-color-on-muted)',
      clear: [
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-standard',
        'text-(--ids-color-on-muted) hover:bg-(--ids-color-muted) hover:text-(--ids-color-on-surface)',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'focus-ring disabled:pointer-events-none',
      ],
      listbox: fieldListbox.list,
      searchRoot: fieldListbox.searchRoot,
      search: fieldListbox.search,
      item: fieldListbox.option,
      indicator: fieldListbox.indicator,
      group: 'flex flex-col',
      groupHeading: fieldListbox.heading,
      separator: fieldListbox.separator,
      empty: [fieldListbox.empty, 'not-data-empty:sr-only'],
    },
    variants: {
      variant: {
        outline: { root: fieldTrigger.variant.outline },
        soft: { root: fieldTrigger.variant.soft },
        ghost: { root: fieldTrigger.variant.ghost },
      } satisfies Record<SelectVariant, object>,
      size: {
        standard: {
          root: 'h-(--ids-size-control-standard) rounded-standard text-body-b3-regular',
          trigger: 'gap-2 px-3',
          icon: '[&_svg]:size-(--ids-size-icon-standard)',
          clear: 'me-1 size-7 [&_svg]:size-(--ids-size-icon-standard)',
        },
        tiny: {
          root: 'h-(--ids-size-control-tiny) rounded-standard text-caption-c1-regular',
          trigger: 'gap-1.5 px-2.5',
          icon: '[&_svg]:size-(--ids-size-icon-tiny)',
          clear: 'me-1 size-6 [&_svg]:size-(--ids-size-icon-tiny)',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}
