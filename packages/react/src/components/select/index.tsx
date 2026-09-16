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
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

import { invariant, mergeProps, mergeRefs } from '../../utils';
import { useFieldSize } from '../field/context';
import {
  FieldPopup,
  fieldTriggerStyle,
  flattenParts,
  part,
  revealPopupOption,
} from '../field-popup';

import type { IdsSize } from '../../tokens/types';

export type SelectVariant = 'outline' | 'filled' | 'unstyled';
type BaseProps = Omit<ComponentProps<'button'>, 'value' | 'defaultValue' | 'onChange'> & {
  placeholder?: string;
  variant?: SelectVariant;
  size?: IdsSize;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  mobileVariant?: 'popover' | 'drawer';
};
export type SelectProps = BaseProps &
  (
    | {
        selectionMode?: 'single';
        value?: string | null;
        defaultValue?: string | null;
        onChange?: (value: string | null) => void;
      }
    | {
        selectionMode: 'multiple';
        value?: string[];
        defaultValue?: string[];
        onChange?: (value: string[]) => void;
      }
  );
type Option = { value: string; label: string; disabled?: boolean };
type BoxProps = ComponentProps<'div'> & { asChild?: boolean };
type ContextValue = {
  selected: string[];
  options: Option[];
  visible: Option[];
  active?: string;
  setActive: (value: string) => void;
  choose: (value: string) => void;
  query: string;
  search: (value: string) => void;
  id: string;
  open: boolean;
  placeholder: string;
  triggerProps: ComponentProps<'button'>;
  keydown: (event: KeyboardEvent<HTMLElement>) => void;
  multiple: boolean;
};
const Context = createContext<ContextValue | null>(null);
function useSelect() {
  const context = useContext(Context);
  invariant(context, 'Select parts must be inside Select.');
  return context;
}
function text(children: ReactNode): string {
  return flattenParts(children)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? text(child.props.children)
          : '',
    )
    .join('');
}
function slotChildren(children: ReactNode, asChild?: boolean): ReactNode {
  return asChild && isValidElement<{ children?: ReactNode }>(children)
    ? children.props.children
    : children;
}
function collect(children: ReactNode): Option[] {
  return flattenParts(children).flatMap((child) => {
    if (!isValidElement<Select.ItemProps & { heading?: ReactNode }>(child)) return [];
    if (child.type === SelectItem)
      return [
        {
          value: child.props.value,
          label: child.props.searchValue ?? text(child.props.children),
          disabled: child.props.disabled,
        },
      ];
    if (child.type === SelectGroup || child.type === SelectContent)
      return collect(slotChildren(child.props.children, child.props.asChild));
    return [];
  });
}
function SelectTrigger({ asChild, children, ...props }: Select.TriggerProps) {
  const c = useSelect();
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <SelectValue />
        <span aria-hidden="true" className="size-4 shrink-0">
          {c.open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </>
    ),
    mergeProps(props, { ...c.triggerProps }),
  );
}
function SelectValue({ asChild, children, placeholder, ...props }: Select.ValueProps) {
  const c = useSelect();
  const labels = c.selected.map(
    (value) => c.options.find((option) => option.value === value)?.label ?? value,
  );
  return part(
    'span',
    asChild,
    children ??
      (labels.length
        ? `${labels.slice(0, 2).join(', ')}${labels.length > 2 ? `, +${labels.length - 2}` : ''}`
        : (placeholder ?? c.placeholder)),
    mergeProps({ className: 'min-w-0 flex-1 truncate' }, props),
  );
}
function SelectItem({
  value,
  searchValue: _searchValue,
  disabled,
  asChild,
  children,
  ...props
}: Select.ItemProps) {
  const c = useSelect();
  if (!c.visible.some((option) => option.value === value)) return null;
  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      id: `${c.id}-option-${encodeURIComponent(value)}`,
      role: 'option',
      'aria-selected': c.selected.includes(value),
      'aria-disabled': disabled || undefined,
      'data-active': c.active === value ? '' : undefined,
      className:
        'flex cursor-default wrap-anywhere items-center rounded-lg px-3 py-2 data-active:bg-(--ids-color-primary)/15 aria-selected:font-semibold aria-disabled:opacity-40',
      onPointerDown: (e: React.PointerEvent) => e.preventDefault(),
      onPointerMove: () => {
        if (!disabled) c.setActive(value);
      },
      onClick: () => {
        if (!disabled) c.choose(value);
      },
    }),
  );
}
function SelectGroup({ heading, asChild, children, ...props }: Select.GroupProps) {
  const c = useSelect();
  const headingId = useId();
  if (
    !collect(slotChildren(children, asChild)).some((option) =>
      c.visible.some((item) => item.value === option.value),
    )
  )
    return null;
  const content = (
    <>
      <div id={headingId} className="px-3 py-2 text-xs text-(--ids-color-on-muted)">
        {heading}
      </div>
      {slotChildren(children, asChild)}
    </>
  );
  return part(
    'div',
    asChild,
    asChild && isValidElement(children) ? cloneElement(children, {}, content) : content,
    { ...props, role: 'group', 'aria-labelledby': headingId },
  );
}
function SelectSearch({ asChild, children, ...props }: Select.SearchFieldProps) {
  const c = useSelect();
  const defaults: ComponentProps<'input'> & { 'data-popup-autofocus': string } = {
    type: 'text',
    autoComplete: props.autoComplete ?? 'off',
    spellCheck: props.spellCheck ?? false,
    role: 'combobox',
    'aria-label': props['aria-label'] ?? '옵션 검색',
    'aria-expanded': true,
    'aria-controls': c.id,
    'aria-autocomplete': 'list',
    'aria-activedescendant':
      c.active !== undefined ? `${c.id}-option-${encodeURIComponent(c.active)}` : undefined,
    'data-popup-autofocus': '',
    value: c.query,
    placeholder: props.placeholder ?? '검색…',
    className:
      'mb-2 h-9 w-full rounded-lg border border-(--ids-color-outline) bg-transparent px-3 outline-(--ids-color-primary)',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => c.search(e.target.value),
    onKeyDown: c.keydown,
  };
  return part('input', asChild, children, mergeProps(props, { ...defaults }));
}
function SelectEmpty({ asChild, children = '검색 결과가 없습니다.', ...props }: BoxProps) {
  const c = useSelect();
  return c.visible.length
    ? null
    : part('div', asChild, children, {
        ...props,
        role: 'status',
        className: `p-3 text-sm ${props.className ?? ''}`,
      });
}
function SelectContent({ asChild, children, ...props }: BoxProps) {
  const c = useSelect();
  const parts = flattenParts(slotChildren(children, asChild));
  const search = parts.filter((child) => isValidElement(child) && child.type === SelectSearch);
  const empty = parts.filter((child) => isValidElement(child) && child.type === SelectEmpty);
  const items = parts.filter((child) => !search.includes(child) && !empty.includes(child));
  return (
    <>
      {search}
      {part(
        'div',
        asChild,
        asChild && isValidElement(children) ? cloneElement(children, {}, items) : items,
        {
          ...props,
          id: c.id,
          role: 'listbox',
          'aria-label': '옵션',
          'aria-multiselectable': c.multiple || undefined,
        },
      )}
      {empty.length ? empty : <SelectEmpty />}
    </>
  );
}
export function Select(props: SelectProps) {
  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onChange: _onChange,
    children,
    placeholder = '선택하세요',
    variant = 'outline',
    size,
    invalid,
    readOnly,
    required,
    mobileVariant,
    ref: forwardedRef,
    name,
    form,
    ...native
  } = props;
  const multiple = selectionMode === 'multiple';
  const [stored, setStored] = useState<string | string[] | null>(
    defaultValue ?? (multiple ? [] : null),
  );
  const current = value === undefined ? stored : value;
  invariant(
    multiple ? Array.isArray(current) : current === null || typeof current === 'string',
    'Select: multiple requires string[]; single requires string | null.',
  );
  const selected = Array.isArray(current) ? current : current === null ? [] : [current];
  const options = collect(children);
  invariant(
    options.every((option) => typeof option.value === 'string'),
    'Select.Item: value is required.',
  );
  invariant(
    new Set(options.map((option) => option.value)).size === options.length,
    'Select: duplicate Item value.',
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>();
  const trigger = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const id = `ids-select-${uid}`;
  const visible = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const enabled = visible.filter((option) => !option.disabled);
  const activeValue = enabled.some((option) => option.value === active)
    ? active
    : enabled[0]?.value;
  const blocked = !!native.disabled || !!readOnly;
  const close = useCallback(
    (restore: boolean) => {
      setOpen(false);
      if (restore) trigger.current?.focus({ preventScroll: true });
    },
    [setOpen],
  );
  useLayoutEffect(() => {
    const node = trigger.current;
    const owner = node?.form;
    if (!owner) return;
    let alive = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (alive && !event.defaultPrevented) {
          if (value === undefined) setStored(defaultValue ?? (multiple ? [] : null));
          close(false);
        }
      });
    owner.addEventListener('reset', reset);
    return () => {
      alive = false;
      owner.removeEventListener('reset', reset);
    };
  }, [value, defaultValue, multiple, form, close]);
  useLayoutEffect(() => {
    if (open && activeValue !== undefined)
      revealPopupOption(
        trigger.current?.ownerDocument.getElementById(
          `${id}-option-${encodeURIComponent(activeValue)}`,
        ),
      );
  }, [open, activeValue, id]);
  const begin = () => {
    if (!blocked) {
      setQuery('');
      setActive(selected[0] ?? options.find((option) => !option.disabled)?.value);
      setOpen(true);
    }
  };
  const choose = (next: string) => {
    if (blocked || options.find((option) => option.value === next)?.disabled) return;
    const result = multiple
      ? selected.includes(next)
        ? selected.filter((v) => v !== next)
        : [...selected, next]
      : next;
    if (value === undefined) setStored(result);
    if (props.selectionMode === 'multiple') props.onChange?.(result as string[]);
    else props.onChange?.(result as string);
    if (!multiple) close(true);
  };
  const typeahead = useRef({ text: '', time: 0 });
  const keydown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing || blocked) return;
    const searching = event.currentTarget.tagName === 'INPUT';
    if (event.key === 'Tab') {
      if (open) {
        trigger.current?.focus({ preventScroll: true });
        close(false);
      }
      return;
    }
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        close(true);
      }
      return;
    }
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) &&
      !(searching && ['Home', 'End'].includes(event.key))
    ) {
      event.preventDefault();
      if (!open) {
        begin();
        return;
      }
      const index = enabled.findIndex((option) => option.value === activeValue);
      setActive(
        enabled[
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? enabled.length - 1
              : (index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
        ]?.value,
      );
      return;
    }
    if (event.key === 'Enter' || (event.key === ' ' && !searching)) {
      event.preventDefault();
      if (!open) begin();
      else if (activeValue !== undefined) choose(activeValue);
      return;
    }
    if (!searching && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (!open) begin();
      const now = Date.now();
      const previous = now - typeahead.current.time < 600 ? typeahead.current.text : '';
      const next = previous + event.key.toLocaleLowerCase();
      typeahead.current = { text: next, time: now };
      const match = options.find(
        (option) => !option.disabled && option.label.toLocaleLowerCase().startsWith(next),
      );
      if (match) setActive(match.value);
    }
  };
  const triggerProps: ComponentProps<'button'> = {
    ...native,
    // mergeRefs creates a callback; it does not read current during render.
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(trigger, forwardedRef),
    id: native.id ?? `${id}-trigger`,
    type: 'button',
    form,
    role: 'combobox',
    'aria-expanded': open && !blocked,
    'aria-haspopup': 'listbox',
    'aria-controls': open && !blocked ? id : undefined,
    'aria-activedescendant':
      open && !blocked && activeValue !== undefined
        ? `${id}-option-${encodeURIComponent(activeValue)}`
        : undefined,
    'aria-invalid': native['aria-invalid'] ?? invalid,
    'aria-required': native['aria-required'] ?? required,
    'aria-readonly': readOnly,
    className: fieldTriggerStyle({
      variant,
      size: useFieldSize(size) ?? 'standard',
      className: native.className,
    }),
    onClick: (e) => {
      native.onClick?.(e);
      if (!e.defaultPrevented) {
        if (open) close(true);
        else begin();
      }
    },
    onKeyDown: (e) => {
      native.onKeyDown?.(e);
      keydown(e);
    },
    onBlur: (e) => {
      if (
        !e.relatedTarget ||
        !(e.relatedTarget as Element).closest?.(`[data-select-owner="${id}"]`)
      )
        native.onBlur?.(e);
    },
  };
  const parts = flattenParts(children);
  const explicit = parts.filter((child) => isValidElement(child) && child.type === SelectTrigger);
  const contents = parts.filter((child) => isValidElement(child) && child.type === SelectContent);
  invariant(
    explicit.length <= 1 && contents.length <= 1,
    'Select requires at most one Trigger and Content.',
  );
  return (
    <Context.Provider
      value={{
        selected,
        options,
        visible,
        active: activeValue,
        setActive,
        choose,
        query,
        search: (next) => {
          setQuery(next);
          setActive(undefined);
        },
        id,
        open: open && !blocked,
        placeholder,
        triggerProps,
        keydown,
        multiple,
      }}
    >
      {explicit.length ? explicit : <SelectTrigger />}
      {open && !blocked && (
        <FieldPopup
          anchor={trigger}
          mobileVariant={mobileVariant}
          onClose={close}
          data-select-owner={id}
          onBlur={(e) => {
            if (
              !e.currentTarget.contains(e.relatedTarget as Node) &&
              e.relatedTarget !== trigger.current
            )
              native.onBlur?.(e as unknown as React.FocusEvent<HTMLButtonElement>);
          }}
        >
          {contents.length ? (
            contents
          ) : (
            <SelectContent>{parts.filter((child) => !explicit.includes(child))}</SelectContent>
          )}
        </FieldPopup>
      )}
      {name &&
        selected.map((item, index) => (
          <input
            key={index}
            type="hidden"
            name={name}
            form={form}
            value={item}
            disabled={native.disabled}
          />
        ))}
    </Context.Provider>
  );
}
export namespace Select {
  export type Props = SelectProps;
  export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };
  export type ValueProps = ComponentProps<'span'> & { asChild?: boolean; placeholder?: string };
  export type ItemProps = BoxProps & { value: string; searchValue?: string; disabled?: boolean };
  export type GroupProps = BoxProps & { heading: ReactNode };
  export type SearchFieldProps = ComponentProps<'input'> & { asChild?: boolean };
  export const Trigger = SelectTrigger;
  export const Value = SelectValue;
  export const Content = SelectContent;
  export const Item = SelectItem;
  export const Group = SelectGroup;
  export const SearchField = SelectSearch;
  export const Empty = SelectEmpty;
  export const Style = fieldTriggerStyle;
}
