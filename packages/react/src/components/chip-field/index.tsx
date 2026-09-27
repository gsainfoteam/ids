import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { isNotNil } from 'es-toolkit';

import { flattenFragments, invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';
import {
  FieldPopup,
  fieldListbox,
  fieldTrigger,
  flattenParts,
  part,
  revealPopupOption,
} from '../field-popup';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

type BoxProps = ComponentProps<'div'> & { asChild?: boolean };
type Option = { value: string; label: string; disabled?: boolean };

export type ChipFieldVariant = 'outline' | 'filled' | 'unstyled';

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
type ContextValue = {
  selected: string[];
  options: Option[];
  visible: Option[];
  active?: string;
  id: string;
  blocked: boolean;
  full: boolean;
  canCreate: boolean;
  query: string;
  inputProps: ChipFieldInputProps;
  inputDefaults: InputAttributes;
  control: InputAttributes & { 'data-chip-field-input': string };
  inputRef: RefObject<HTMLInputElement | null>;
  choose: (value: string) => void;
  remove: (value: string) => void;
  create: () => void;
  setActive: (value: string | null) => void;
  styles: ReturnType<typeof ChipField.Style>;
};
const Context = createContext<ContextValue | null>(null);
function useChip(name: string) {
  const c = useContext(Context);
  invariant(c, `\`<ChipField.${name}>\` must be used inside \`<ChipField>\`.`);
  return c;
}
function content(children: ReactNode, asChild?: boolean): ReactNode {
  return asChild && isValidElement<{ children?: ReactNode }>(children)
    ? children.props.children
    : children;
}
function label(children: ReactNode): string {
  return flattenParts(children)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? label(child.props.children)
          : '',
    )
    .join('');
}
function collect(children: ReactNode): Option[] {
  return flattenParts(children).flatMap((child) => {
    if (!isValidElement<ChipField.ItemProps>(child)) return [];
    if (child.type === ChipItem)
      return [
        {
          value: child.props.value,
          label: child.props.searchValue ?? label(child.props.children),
          disabled: child.props.disabled,
        },
      ];
    if (child.type === ChipGroup || child.type === ChipContent)
      return collect(content(child.props.children, child.props.asChild));
    return [];
  });
}
function isPopupPart(node: ReactNode) {
  return (
    isValidElement(node) &&
    (node.type === ChipContent ||
      node.type === ChipItem ||
      node.type === ChipGroup ||
      node.type === ChipCreate ||
      node.type === ChipEmpty)
  );
}
function splitChildren(children: ReactNode) {
  const nodes = flattenFragments(children);
  const popup = nodes.filter(isPopupPart);
  const contents = popup.filter((n) => isValidElement(n) && n.type === ChipContent);
  invariant(contents.length <= 1, '`<ChipField>` accepts at most one `<ChipField.Content>`.');
  invariant(
    contents.length === 0 || popup.length === 1,
    '`<ChipField>` takes options either inside `<ChipField.Content>` or directly, not both.',
  );

  const items = nodes.filter((n) => !isPopupPart(n));
  const inputIndexes = items
    .map((child, index) => (isValidElement(child) && child.type === ChipInput ? index : null))
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
function Chips({ c }: { c: ContextValue }) {
  return c.selected.map((value) => {
    const option = c.options.find((o) => o.value === value);
    const title = option?.label ?? value;
    return (
      <span key={value} data-chip-field-chip="" className={c.styles.chip()}>
        <span className={c.styles.chipLabel()}>{title}</span>
        <button
          type="button"
          disabled={c.blocked || option?.disabled}
          aria-label={`${title} 삭제`}
          className={c.styles.chipRemove()}
          onClick={() => c.remove(value)}
        >
          <XMarkIcon aria-hidden="true" className={c.styles.chipRemoveIcon()} />
        </button>
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
  const c = useContext(Context);
  invariant(c != null, '`<ChipField.Input>` must be used inside `<ChipField>`.');

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
      <Slot {...(props as Slot.Props)} ref={mergeRefs(c.inputRef, c.inputProps.ref, ref)}>
        {children}
      </Slot>
    );
  }
  invariant(children == null, '`<ChipField.Input>` renders the search text itself, not children.');
  return <input {...props} ref={mergeRefs(c.inputRef, c.inputProps.ref, ref)} />;
}
function ChipItem({
  value,
  searchValue: _searchValue,
  disabled,
  asChild,
  children,
  ...props
}: ChipField.ItemProps) {
  const c = useChip('Item');
  if (!c.visible.some((o) => o.value === value)) return null;
  const blocked = disabled || (c.full && !c.selected.includes(value));
  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      id: `${c.id}-option-${encodeURIComponent(value)}`,
      role: 'option',
      'aria-selected': c.selected.includes(value),
      'aria-disabled': blocked || undefined,
      'data-active': c.active === value ? '' : undefined,
      className: c.styles.item(),
      onPointerDown: (e: React.PointerEvent) => e.preventDefault(),
      onPointerMove: () => {
        if (!blocked) c.setActive(value);
      },
      onClick: () => {
        if (!blocked) c.choose(value);
      },
    }),
  );
}
function ChipGroup({ heading, asChild, children, ...props }: ChipField.GroupProps) {
  const c = useChip('Group'),
    id = useId();
  if (!collect(content(children, asChild)).some((o) => c.visible.some((v) => v.value === o.value)))
    return null;
  const nodes = (
    <>
      <div id={id} className={c.styles.groupHeading()}>
        {heading}
      </div>
      {content(children, asChild)}
    </>
  );
  return part(
    'div',
    asChild,
    asChild && isValidElement(children) ? cloneElement(children, {}, nodes) : nodes,
    { ...props, role: 'group', 'aria-labelledby': id },
  );
}
function ChipCreate({ asChild, children, ...props }: BoxProps) {
  const c = useChip('Create');
  if (!c.canCreate) return null;
  return part(
    'div',
    asChild,
    children ?? `“${c.query.trim()}” 추가`,
    mergeProps(props, {
      id: `${c.id}-create`,
      role: 'option',
      'aria-selected': false,
      'data-active': c.active === undefined ? '' : undefined,
      className: c.styles.item(),
      onPointerDown: (e: React.PointerEvent) => e.preventDefault(),
      onPointerMove: () => c.setActive(null),
      onClick: c.create,
    }),
  );
}
function ChipEmpty({ asChild, children = '검색 결과가 없습니다.', ...props }: BoxProps) {
  const c = useChip('Empty');
  return c.visible.length || c.canCreate
    ? null
    : part('div', asChild, children, {
        ...props,
        role: 'status',
        className: c.styles.empty({ className: props.className }),
      });
}
function ChipContent({ asChild, children, ...props }: BoxProps) {
  const c = useChip('Content');
  const nodes = flattenParts(content(children, asChild));
  const empty = nodes.filter((n) => isValidElement(n) && n.type === ChipEmpty);
  const items = nodes.filter((n) => !empty.includes(n));
  const list = (
    <>
      {items}
      {!items.some((n) => isValidElement(n) && n.type === ChipCreate) && <ChipCreate />}
    </>
  );
  return (
    <>
      {part(
        'div',
        asChild,
        asChild && isValidElement(children) ? cloneElement(children, {}, list) : list,
        { ...props, id: c.id, role: 'listbox', 'aria-label': '옵션', 'aria-multiselectable': true },
      )}
      {empty.length ? empty : <ChipEmpty />}
    </>
  );
}
export function ChipField({
  value,
  defaultValue = [],
  onChange,
  creatable = false,
  onCreate,
  maxCount,
  variant = 'outline',
  size,
  invalid,
  mobileVariant = 'drawer',
  disabled,
  children,
  className,
  style,
  name,
  form,
  required,
  ...inputProps
}: ChipField.Props) {
  const [stored, setStored] = useState(defaultValue),
    [query, setQuery] = useState(''),
    [open, setOpen] = useState(false),
    [active, setActive] = useState<string | null>();
  const selected = value === undefined ? stored : value;
  invariant(
    Array.isArray(selected) &&
      selected.every((v) => typeof v === 'string') &&
      new Set(selected).size === selected.length,
    '`<ChipField>` `value` must contain unique strings.',
  );
  invariant(
    !creatable || typeof onCreate === 'function',
    '`<ChipField>` with `creatable` requires `onCreate`.',
  );
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    '`<ChipField>` `maxCount` must be a non-negative integer.',
  );
  const options = collect(children);
  invariant(
    options.every((o) => typeof o.value === 'string'),
    '`<ChipField.Item>` `value` is required.',
  );
  invariant(
    new Set(options.map((o) => o.value)).size === options.length,
    '`<ChipField>` has a duplicate `<ChipField.Item>` value.',
  );
  const { leading, input, trailing, popup } = splitChildren(children);

  // The sentinel's own props win over the root's, so derive container state from the
  // merged result, not from the root props alone.
  const merged = { ...inputProps, ...input.props };
  const isDisabled = !!(input.props.disabled ?? disabled);
  const ariaInvalid = merged['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false';

  const inputRef = useRef<HTMLInputElement>(null),
    anchor = useRef<HTMLDivElement>(null),
    composing = useRef(false);
  const id = `ids-chip-${useId()}`;
  const styles = ChipField.Style({
    variant,
    size: useFieldSize(size) ?? 'standard',
    disabled: isDisabled,
  });
  const blocked = isDisabled || !!merged.readOnly,
    full = maxCount !== undefined && selected.length >= maxCount;
  const normalized = query.trim().toLocaleLowerCase();
  const visible = options.filter((o) => o.label.toLocaleLowerCase().includes(normalized));
  const enabled = visible.filter((o) => !o.disabled && (!full || selected.includes(o.value)));
  const canCreate =
    creatable &&
    !full &&
    !!normalized &&
    !options.some(
      (o) =>
        o.value.toLocaleLowerCase() === normalized || o.label.toLocaleLowerCase() === normalized,
    ) &&
    !selected.some((v) => v.toLocaleLowerCase() === normalized);
  const candidates: (string | undefined)[] = [
    ...enabled.map((o) => o.value),
    ...(canCreate ? [undefined] : []),
  ];
  // A null sentinel lets the creation row follow normal option navigation.
  const activeValue =
    active === null && canCreate
      ? undefined
      : typeof active === 'string' && enabled.some((o) => o.value === active)
        ? active
        : enabled[0]?.value;
  const close = useCallback((restore: boolean) => {
    setOpen(false);
    if (restore) inputRef.current?.focus({ preventScroll: true });
  }, []);
  useLayoutEffect(() => {
    const owner = inputRef.current?.form;
    if (!owner) return;
    let alive = true;
    const reset = (e: Event) =>
      queueMicrotask(() => {
        if (alive && !e.defaultPrevented) {
          if (value === undefined) setStored(defaultValue);
          setQuery('');
          close(false);
        }
      });
    owner.addEventListener('reset', reset);
    return () => {
      alive = false;
      owner.removeEventListener('reset', reset);
    };
  }, [value, defaultValue, form, close]);
  useLayoutEffect(() => {
    if (open && !blocked)
      revealPopupOption(
        inputRef.current?.ownerDocument.getElementById(
          activeValue === undefined
            ? `${id}-create`
            : `${id}-option-${encodeURIComponent(activeValue)}`,
        ),
      );
  }, [open, blocked, activeValue, id]);
  const emit = (next: string[]) => {
    if (value === undefined) setStored(next);
    onChange?.(next);
  };
  const remove = (next: string) => {
    if (blocked || options.find((o) => o.value === next)?.disabled) return;
    emit(selected.filter((v) => v !== next));
    inputRef.current?.focus({ preventScroll: true });
  };
  const choose = (next: string) => {
    if (blocked || options.find((o) => o.value === next)?.disabled) return;
    if (selected.includes(next)) remove(next);
    else if (!full) emit([...selected, next]);
    setQuery('');
    inputRef.current?.focus({ preventScroll: true });
  };
  const create = () => {
    if (blocked || !canCreate) return;
    const next = query.trim();
    onCreate?.(next);
    emit([...selected, next]);
    setQuery('');
    setActive(undefined);
    inputRef.current?.focus({ preventScroll: true });
  };
  const inputDefaults: InputAttributes = {
    placeholder: '항목 추가…',
    autoComplete: 'off',
    'aria-invalid': isInvalid || undefined,
    'aria-required': required,
  };
  const expanded = open && !blocked;
  const control: ContextValue['control'] = {
    'data-chip-field-input': '',
    id: typeof merged.id === 'string' ? merged.id : `${id}-input`,
    form,
    type: 'text',
    role: 'combobox',
    value: query,
    disabled: isDisabled,
    'aria-expanded': expanded,
    'aria-controls': expanded ? id : undefined,
    'aria-autocomplete': 'list',
    'aria-activedescendant':
      expanded && (activeValue !== undefined || canCreate)
        ? activeValue === undefined
          ? `${id}-create`
          : `${id}-option-${encodeURIComponent(activeValue)}`
        : undefined,
    onClick: () => {
      if (!blocked) setOpen(true);
    },
    onChange: (e) => {
      if (!blocked) {
        setQuery(e.target.value);
        setActive(undefined);
        setOpen(true);
      }
    },
    onCompositionStart: () => {
      composing.current = true;
    },
    onCompositionEnd: () => {
      composing.current = false;
    },
    onKeyDown: (e) => {
      if (blocked || composing.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key === 'Tab') {
        close(false);
        return;
      }
      if (e.key === 'Backspace' && !query) {
        if (selected.length) {
          e.preventDefault();
          remove(selected[selected.length - 1]);
        }
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (!candidates.length) return;
        const index = candidates.indexOf(activeValue);
        const next =
          candidates[
            (index + (e.key === 'ArrowDown' ? 1 : -1) + candidates.length) % candidates.length
          ];
        setActive(next ?? null);
        return;
      }
      if (e.key === 'Enter' || (e.key === ' ' && !query && !open)) {
        e.preventDefault();
        if (!open) setOpen(true);
        else if (activeValue !== undefined) choose(activeValue);
        else create();
      }
    },
  };
  const context: ContextValue = {
    selected,
    options,
    visible,
    active: activeValue,
    id,
    blocked,
    full,
    canCreate,
    query,
    inputProps,
    inputDefaults,
    control,
    inputRef,
    choose,
    remove,
    create,
    setActive,
    styles,
  };
  return (
    <Context.Provider value={context}>
      <div
        ref={anchor}
        data-chip-field=""
        data-disabled={isDisabled ? '' : undefined}
        aria-invalid={isInvalid || undefined}
        className={styles.root({ className })}
        style={style}
        onClick={(e) => {
          if (blocked) return;
          const target = e.target as HTMLElement;
          if (target.closest('button, a, input, textarea, select, label')) return;
          inputRef.current?.focus({ preventScroll: true });
          setOpen(true);
        }}
      >
        <Adornments items={leading} className={styles.adornment()} />
        <Chips c={context} />
        {input}
        <Adornments items={trailing} className={styles.adornment()} />
        <ChevronDownIcon aria-hidden="true" className={styles.icon()} />
      </div>
      {expanded && (
        <FieldPopup anchor={anchor} onClose={close} mobileVariant={mobileVariant}>
          {popup}
        </FieldPopup>
      )}
      {name &&
        selected.map((v) => (
          <input key={v} type="hidden" name={name} form={form} value={v} disabled={isDisabled} />
        ))}
    </Context.Provider>
  );
}
export namespace ChipField {
  export type Props = ChipFieldInputProps & {
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
    creatable?: boolean;
    onCreate?: (value: string) => void;
    maxCount?: number;
    variant?: ChipFieldVariant;
    size?: IdsSize;
    invalid?: boolean;
    mobileVariant?: 'popover' | 'drawer';
    name?: string;
    form?: string;
    required?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
  export type ItemProps = BoxProps & { value: string; searchValue?: string; disabled?: boolean };
  export type GroupProps = BoxProps & { heading: ReactNode };
  export const Input = ChipInput,
    Content = ChipContent,
    Item = ChipItem,
    Group = ChipGroup,
    Create = ChipCreate,
    Empty = ChipEmpty;
  export namespace Input {
    // `onChange` here observes the typed search text; the selected chips are the root's.
    export type Props = ChipFieldInputProps & {
      onChange?: ComponentProps<'input'>['onChange'];
      asChild?: boolean;
      children?: ReactNode;
      disabled?: boolean;
      className?: string;
      style?: CSSProperties;
    };
  }
  export const Style = tv({
    slots: {
      root: [
        ...fieldTrigger.base,
        'flex-wrap gap-1 py-1',
        // The utility only recognises TextField/TextArea inputs, so the shell rings for its
        // own Input here. Scoped to the Input so a focused chip button rings alone.
        'has-[[data-chip-field-input]:focus-visible]:ring-[3px] has-[[data-chip-field-input]:focus-visible]:ring-(--ids-color-primary)/40',
      ],
      adornment: [
        'inline-flex shrink-0 items-center empty:hidden',
        'not-has-[button]:text-(--ids-color-on-muted)',
        'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
        '[&_button]:p-0',
      ],
      chip: 'inline-flex max-w-full items-center gap-1 rounded-standard bg-(--ids-color-primary)/10',
      chipLabel: 'truncate',
      chipRemove:
        'shrink-0 cursor-pointer rounded-indicator px-0.5 focus-ring disabled:cursor-not-allowed disabled:opacity-50',
      chipRemoveIcon: 'mx-auto',
      input: [
        'min-w-20 flex-1 bg-transparent py-1 outline-none',
        'placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
      ],
      icon: 'shrink-0',
      item: fieldListbox.option,
      groupHeading: fieldListbox.heading,
      empty: fieldListbox.empty,
    },
    variants: {
      variant: {
        outline: { root: fieldTrigger.variant.outline },
        filled: {
          root: [
            fieldTrigger.variant.filled,
            'has-[[data-chip-field-input]:focus-visible]:bg-(--ids-color-primary)/15',
          ],
        },
        unstyled: { root: fieldTrigger.variant.unstyled },
      } satisfies Record<ChipFieldVariant, object>,
      // The shell grows with wrapped chips, so the control height is a floor, not a height.
      size: {
        standard: {
          root: [fieldTrigger.size.standard, 'h-auto min-h-(--ids-size-control-standard)'],
          adornment: [
            'gap-1',
            'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
          ],
          chip: 'px-2 py-0.5',
          chipRemoveIcon: fieldTrigger.icon.tiny,
          icon: fieldTrigger.icon.standard,
        },
        tiny: {
          root: [fieldTrigger.size.tiny, 'h-auto min-h-(--ids-size-control-tiny)'],
          adornment: [
            'gap-0.5',
            'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
          ],
          chip: 'px-1.5 py-px',
          chipRemoveIcon: 'size-3',
          icon: fieldTrigger.icon.tiny,
        },
      } satisfies Record<IdsSize, object>,
      // The shell is a div, so the trigger's `disabled:` classes never match it.
      disabled: {
        true: { root: 'cursor-not-allowed opacity-50' },
      },
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}
export type ChipFieldProps = ChipField.Props;
