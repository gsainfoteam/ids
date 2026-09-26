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
  type ReactNode,
} from 'react';

import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';
import {
  FieldPopup,
  fieldListbox,
  fieldTrigger,
  flattenParts,
  part,
  revealPopupOption,
} from '../field-popup';

import type { IdsSize } from '../../tokens/types';

type BoxProps = ComponentProps<'div'> & { asChild?: boolean };
type Option = { value: string; label: string; disabled?: boolean };
export type ChipFieldProps = Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  creatable?: boolean;
  onCreate?: (value: string) => void;
  maxCount?: number;
  variant?: 'outline' | 'filled' | 'unstyled';
  size?: IdsSize;
  invalid?: boolean;
  mobileVariant?: 'popover' | 'drawer';
};
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
  inputProps: ComponentProps<'input'>;
  surfaceProps: ComponentProps<'div'>;
  choose: (value: string) => void;
  remove: (value: string) => void;
  create: () => void;
  setActive: (value: string | null) => void;
  styles: ReturnType<typeof ChipField.Style>;
};
const Context = createContext<ContextValue | null>(null);
function useChip() {
  const c = useContext(Context);
  invariant(c, 'ChipField parts must be inside ChipField.');
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
function ChipTrigger({ asChild, children, ...props }: BoxProps) {
  const c = useChip();
  return part(
    'div',
    asChild,
    children ?? (
      <>
        <ChipValue />
        <ChipSearch />
        <ChevronDownIcon aria-hidden="true" className={c.styles.icon()} />
      </>
    ),
    mergeProps(props, { ...c.surfaceProps }),
  );
}
function ChipValue({ asChild, children, ...props }: BoxProps) {
  const c = useChip();
  return part(
    'div',
    asChild,
    children ??
      c.selected.map((value) => {
        const option = c.options.find((o) => o.value === value);
        const title = option?.label ?? value;
        return (
          <span key={value} className={c.styles.chip()}>
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
      }),
    mergeProps({ className: 'contents' }, props),
  );
}
function ChipSearch({ asChild, children, ...props }: ChipField.SearchFieldProps) {
  const c = useChip();
  return part(
    'input',
    asChild,
    children,
    mergeProps(props, {
      ...c.inputProps,
      placeholder: c.inputProps.placeholder ?? props.placeholder ?? '항목 추가…',
    }),
  );
}
function ChipItem({
  value,
  searchValue: _searchValue,
  disabled,
  asChild,
  children,
  ...props
}: ChipField.ItemProps) {
  const c = useChip();
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
  const c = useChip(),
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
  const c = useChip();
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
  const c = useChip();
  return c.visible.length || c.canCreate
    ? null
    : part('div', asChild, children, {
        ...props,
        role: 'status',
        className: c.styles.empty({ className: props.className }),
      });
}
function ChipContent({ asChild, children, ...props }: BoxProps) {
  const c = useChip();
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
  children,
  className,
  style,
  ref: forwardedRef,
  name,
  form,
  required,
  ...native
}: ChipFieldProps) {
  const [stored, setStored] = useState(defaultValue),
    [query, setQuery] = useState(''),
    [open, setOpen] = useState(false),
    [active, setActive] = useState<string | null>();
  const selected = value === undefined ? stored : value;
  invariant(
    Array.isArray(selected) &&
      selected.every((v) => typeof v === 'string') &&
      new Set(selected).size === selected.length,
    'ChipField: value must contain unique strings.',
  );
  invariant(
    !creatable || typeof onCreate === 'function',
    'ChipField: creatable requires onCreate.',
  );
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    'ChipField: maxCount must be a non-negative integer.',
  );
  const options = collect(children);
  invariant(
    options.every((o) => typeof o.value === 'string'),
    'ChipField.Item: value is required.',
  );
  invariant(
    new Set(options.map((o) => o.value)).size === options.length,
    'ChipField: duplicate Item value.',
  );
  const input = useRef<HTMLInputElement>(null),
    anchor = useRef<HTMLDivElement>(null),
    composing = useRef(false);
  const id = `ids-chip-${useId()}`;
  const styles = ChipField.Style({
    variant,
    size: useFieldSize(size) ?? 'standard',
    disabled: !!native.disabled,
  });
  const blocked = !!native.disabled || !!native.readOnly,
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
    if (restore) input.current?.focus({ preventScroll: true });
  }, []);
  useLayoutEffect(() => {
    const owner = input.current?.form;
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
        input.current?.ownerDocument.getElementById(
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
    input.current?.focus({ preventScroll: true });
  };
  const choose = (next: string) => {
    if (blocked || options.find((o) => o.value === next)?.disabled) return;
    if (selected.includes(next)) remove(next);
    else if (!full) emit([...selected, next]);
    setQuery('');
    input.current?.focus({ preventScroll: true });
  };
  const create = () => {
    if (blocked || !canCreate) return;
    const next = query.trim();
    onCreate?.(next);
    emit([...selected, next]);
    setQuery('');
    setActive(undefined);
    input.current?.focus({ preventScroll: true });
  };
  const search = flattenParts(children).filter((n) => isValidElement(n) && n.type === ChipSearch);
  const explicit = flattenParts(children).filter(
    (n) => isValidElement(n) && n.type === ChipTrigger,
  );
  const contents = flattenParts(children).filter(
    (n) => isValidElement(n) && n.type === ChipContent,
  );
  invariant(
    search.length <= 1 && explicit.length <= 1 && contents.length <= 1,
    'ChipField: use at most one Trigger, SearchField and Content.',
  );
  const inputProps: ComponentProps<'input'> = {
    ...native,
    // mergeRefs only composes ref callbacks; it does not access current here.
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(input, forwardedRef),
    id: native.id ?? `${id}-input`,
    form,
    type: 'text',
    role: 'combobox',
    value: query,
    autoComplete: native.autoComplete ?? 'off',
    placeholder: native.placeholder,
    'aria-expanded': open && !blocked,
    'aria-controls': open && !blocked ? id : undefined,
    'aria-autocomplete': 'list',
    'aria-activedescendant':
      open && !blocked && (activeValue !== undefined || canCreate)
        ? activeValue === undefined
          ? `${id}-create`
          : `${id}-option-${encodeURIComponent(activeValue)}`
        : undefined,
    'aria-invalid': native['aria-invalid'] ?? invalid,
    'aria-required': native['aria-required'] ?? required,
    className: styles.search(),
    onClick: (e) => {
      native.onClick?.(e);
      if (!e.defaultPrevented && !blocked) setOpen(true);
    },
    onChange: (e) => {
      if (!blocked) {
        setQuery(e.target.value);
        setActive(undefined);
        setOpen(true);
      }
    },
    onCompositionStart: (e) => {
      composing.current = true;
      native.onCompositionStart?.(e);
    },
    onCompositionEnd: (e) => {
      composing.current = false;
      native.onCompositionEnd?.(e);
    },
    onKeyDown: (e) => {
      native.onKeyDown?.(e);
      if (
        e.defaultPrevented ||
        blocked ||
        composing.current ||
        e.nativeEvent.isComposing ||
        e.keyCode === 229
      )
        return;
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
  const surfaceProps: ComponentProps<'div'> = {
    ref: anchor,
    className: styles.trigger({ className }),
    style,
    'aria-invalid': invalid,
    'data-chip-field': '',
    onClick: (e) => {
      if (e.target === e.currentTarget && !blocked) {
        input.current?.focus({ preventScroll: true });
        setOpen(true);
      }
    },
  } as ComponentProps<'div'>;
  const others = flattenParts(children).filter(
    (n) => !explicit.includes(n) && !search.includes(n) && !contents.includes(n),
  );
  return (
    <Context.Provider
      value={{
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
        surfaceProps,
        choose,
        remove,
        create,
        setActive,
        styles,
      }}
    >
      {explicit.length ? (
        explicit
      ) : (
        <ChipTrigger>
          <ChipValue />
          {search.length ? search : <ChipSearch />}
          <ChevronDownIcon aria-hidden="true" className={styles.icon()} />
        </ChipTrigger>
      )}
      {open && !blocked && (
        <FieldPopup anchor={anchor} onClose={close} mobileVariant={mobileVariant}>
          {contents.length ? contents : <ChipContent>{others}</ChipContent>}
        </FieldPopup>
      )}
      {name &&
        selected.map((v) => (
          <input
            key={v}
            type="hidden"
            name={name}
            form={form}
            value={v}
            disabled={native.disabled}
          />
        ))}
    </Context.Provider>
  );
}
export namespace ChipField {
  export type Props = ChipFieldProps;
  export type ItemProps = BoxProps & { value: string; searchValue?: string; disabled?: boolean };
  export type GroupProps = BoxProps & { heading: ReactNode };
  export type SearchFieldProps = ComponentProps<'input'> & { asChild?: boolean };
  export const Trigger = ChipTrigger,
    Value = ChipValue,
    SearchField = ChipSearch,
    Content = ChipContent,
    Item = ChipItem,
    Group = ChipGroup,
    Create = ChipCreate,
    Empty = ChipEmpty;
  export const Style = tv({
    slots: {
      trigger: [
        ...fieldTrigger.base,
        'flex-wrap gap-1 py-1',
        // The utility only recognises TextField/TextArea inputs, so the shell rings for its
        // own search input here. Scoped to the input so a focused chip button rings alone.
        'has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-(--ids-color-primary)/40',
      ],
      chip: 'inline-flex max-w-full items-center gap-1 rounded-sm bg-(--ids-color-primary)/10',
      chipLabel: 'truncate',
      chipRemove:
        'shrink-0 cursor-pointer rounded-xs px-0.5 focus-ring disabled:cursor-not-allowed disabled:opacity-50',
      chipRemoveIcon: 'mx-auto',
      search: [
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
        outline: { trigger: fieldTrigger.variant.outline },
        filled: {
          trigger: [
            fieldTrigger.variant.filled,
            'has-[input:focus-visible]:bg-(--ids-color-primary)/15',
          ],
        },
        unstyled: { trigger: fieldTrigger.variant.unstyled },
      } satisfies Record<NonNullable<ChipFieldProps['variant']>, object>,
      // The shell grows with wrapped chips, so the control height is a floor, not a height.
      size: {
        standard: {
          trigger: [fieldTrigger.size.standard, 'h-auto min-h-(--ids-size-control-standard)'],
          chip: 'px-2 py-0.5',
          chipRemoveIcon: fieldTrigger.icon.tiny,
          icon: fieldTrigger.icon.standard,
        },
        tiny: {
          trigger: [fieldTrigger.size.tiny, 'h-auto min-h-(--ids-size-control-tiny)'],
          chip: 'px-1.5 py-px',
          chipRemoveIcon: 'size-3',
          icon: fieldTrigger.icon.tiny,
        },
      } satisfies Record<IdsSize, object>,
      // The shell is a div, so the trigger's `disabled:` classes never match it.
      disabled: {
        true: { trigger: 'cursor-not-allowed opacity-50' },
      },
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}
