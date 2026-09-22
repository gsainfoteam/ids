import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';
import { IconButton } from '../icon-button';

import type { IdsSize } from '../../tokens/types';

type NativeProps = ComponentProps<'input'>;
export type PasswordFieldVariant = 'outline' | 'filled' | 'unstyled';
export type PasswordFieldProps = Omit<NativeProps, 'type' | 'size' | 'color' | 'children'> & {
  variant?: PasswordFieldVariant;
  size?: IdsSize;
  invalid?: boolean;
  hideVisibilityToggle?: boolean;
  children?: ReactNode;
};
type VisibilityContext = {
  visible: boolean;
  disabled: boolean;
  id: string;
  size: IdsSize;
  toggle: (pointer: boolean) => void;
};
const Context = createContext<VisibilityContext | null>(null);
function flatten(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child, index) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children, `${prefix}${index}:`)
      : [isValidElement(child) ? cloneElement(child, { key: `${prefix}${child.key}` }) : child],
  );
}
function PasswordInput(_props: PasswordField.InputProps): ReactNode {
  invariant(
    false,
    'PasswordField.Input must be a direct child of PasswordField (or inside a Fragment).',
  );
}
function PasswordVisibilityToggle({
  asChild,
  children,
  ...props
}: PasswordField.VisibilityToggleProps) {
  const context = useContext(Context);
  invariant(context, 'PasswordField.VisibilityToggle must be inside PasswordField.');
  const internal: Omit<NativeButtonProps, 'children'> = {
    type: 'button',
    disabled: context.disabled || props.disabled,
    'aria-label': context.visible ? '비밀번호 숨기기' : '비밀번호 표시',
    'aria-pressed': context.visible,
    'aria-controls': context.id,
    onPointerDown: (event) => {
      if (event.button === 0) event.preventDefault();
    },
    onClick: (event) => {
      if (!context.disabled && !props.disabled) context.toggle(event.detail > 0);
    },
  };
  if (asChild) {
    invariant(
      isValidElement<NativeButtonProps>(children) && children.type !== Fragment,
      'PasswordField.VisibilityToggle asChild requires one button or a component forwarding button props/ref.',
    );
    invariant(
      typeof children.type !== 'string' || children.type === 'button',
      'PasswordField.VisibilityToggle asChild must render a button.',
    );
    return cloneElement(
      children,
      mergeProps(mergeProps({ ...children.props }, props), { ...internal }),
    );
  }
  invariant(
    children == null,
    'PasswordField.VisibilityToggle supplies its own icon; use asChild to customize.',
  );
  return (
    <IconButton
      {...mergeProps(props, { ...internal })}
      size={context.size}
      variant="ghost"
      aria-label={internal['aria-label']!}
      className="size-7 min-w-0 shrink-0 p-1"
      icon={context.visible ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
    />
  );
}
type NativeButtonProps = ComponentProps<'button'>;

export function PasswordField({
  variant = 'outline',
  size,
  invalid,
  hideVisibilityToggle = false,
  children,
  className,
  style,
  ...rootProps
}: PasswordFieldProps) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const generatedId = useId();
  const [visible, setVisible] = useState(false);
  const parts = flatten(children);
  const sentinels = parts.filter((part) => isValidElement(part) && part.type === PasswordInput);
  invariant(sentinels.length <= 1, 'PasswordField: Input은 한 번만 명시할 수 있습니다.');
  invariant(
    parts.length === 0 || sentinels.length === 1,
    'PasswordField: children require one PasswordField.Input.',
  );
  const toggles = parts.filter(
    (part) => isValidElement(part) && part.type === PasswordVisibilityToggle,
  );
  invariant(toggles.length <= 1, 'PasswordField: VisibilityToggle must be declared at most once.');
  const sentinel = sentinels[0] as ReactElement<PasswordField.InputProps> | undefined;
  const { asChild, children: inputChild, ...inputProps } = sentinel?.props ?? {};
  let child: ReactElement<NativeProps> | undefined;
  if (asChild) {
    invariant(
      isValidElement<NativeProps>(inputChild) && inputChild.type !== Fragment,
      'PasswordField.Input asChild requires one input or a component forwarding input props/ref.',
    );
    invariant(
      typeof inputChild.type !== 'string' || inputChild.type === 'input',
      'PasswordField.Input asChild must render an input.',
    );
    child = inputChild;
  } else
    invariant(inputChild == null, 'PasswordField.Input does not accept children without asChild.');
  const native: NativeProps = mergeProps(mergeProps({ ...child?.props }, inputProps), rootProps);
  const id = native.id ?? `ids-password-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const selection = useRef<{
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none';
  } | null>(null);
  const ref = (node: HTMLInputElement | null) => {
    invariant(
      !node || node.tagName === 'INPUT',
      'PasswordField.Input asChild must forward its ref to an input.',
    );
    inputRef.current = node;
    const cleanup = mergeRefs(native.ref)(node);
    return () => {
      inputRef.current = null;
      cleanup?.();
    };
  };
  useLayoutEffect(() => {
    const node = inputRef.current;
    const saved = selection.current;
    if (node && saved) node.setSelectionRange(saved.start, saved.end, saved.direction);
    selection.current = null;
  }, [visible]);
  useEffect(() => {
    if (import.meta.env.DEV && !native.name)
      console.warn(
        '[IDS] PasswordField: name="password" 등을 명시하면 자동완성 매니저 호환성이 향상됩니다.',
      );
  }, [native.name]);
  useLayoutEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    let active = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (active && !event.defaultPrevented) setVisible(false);
      });
    form.addEventListener('reset', reset);
    return () => {
      active = false;
      form.removeEventListener('reset', reset);
    };
  }, [native.form]);
  const ariaInvalid = native['aria-invalid'] ?? invalid;
  // Only a name identifying a new password is a reliable local hint. Callers can override it.
  const nameLeaf = native.name
    ?.replaceAll('[', '.')
    .replaceAll(']', '.')
    .split('.')
    .filter(Boolean)
    .at(-1);
  const autoComplete =
    native.autoComplete ??
    (/^new[-_]?password$/i.test(nameLeaf ?? '') ? 'new-password' : 'current-password');
  const actual: NativeProps = {
    ...native,
    id,
    ref,
    type: visible ? 'text' : 'password',
    autoComplete,
    spellCheck: native.spellCheck ?? false,
    autoCapitalize: native.autoCapitalize ?? 'none',
    'aria-invalid': ariaInvalid,
    ...{ 'data-password-field-input': '', 'data-size': resolvedSize },
    className: inputStyle({ className: native.className }),
  };
  // cloneElement forwards a callback ref without reading ref.current.
  // eslint-disable-next-line react-hooks/refs
  const input = child ? cloneElement(child, actual) : <input {...actual} />;
  const inputIndex = sentinel ? parts.indexOf(sentinel) : -1;
  const lead = sentinel ? parts.slice(0, inputIndex) : [];
  const trail = sentinel ? parts.slice(inputIndex + 1) : [];
  const context: VisibilityContext = {
    visible,
    disabled: !!native.disabled,
    id,
    size: resolvedSize,
    toggle: (pointer) => {
      const node = inputRef.current;
      if (!node || native.disabled) return;
      if (pointer) node.focus({ preventScroll: true });
      selection.current =
        node.selectionStart == null || node.selectionEnd == null
          ? null
          : {
              start: node.selectionStart,
              end: node.selectionEnd,
              direction: node.selectionDirection ?? 'none',
            };
      setVisible((previous) => !previous);
    },
  };
  return (
    <Context.Provider value={context}>
      <div
        data-password-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-disabled={native.disabled ? '' : undefined}
        data-readonly={native.readOnly ? '' : undefined}
        data-invalid={
          ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false' ? '' : undefined
        }
        className={PasswordField.Style({ variant, size: resolvedSize, className })}
        style={style}
      >
        {lead.length > 0 && (
          <div data-password-field-part="lead" className="inline-flex shrink-0 items-center gap-1">
            {lead}
          </div>
        )}
        {input}
        {trail.length > 0 && (
          <div data-password-field-part="trail" className="inline-flex shrink-0 items-center gap-1">
            {trail}
          </div>
        )}
        {!hideVisibilityToggle && toggles.length === 0 && <PasswordVisibilityToggle />}
      </div>
    </Context.Provider>
  );
}
const inputStyle = tv({
  base: 'h-full w-full min-w-0 flex-1 border-0 bg-transparent text-inherit outline-none placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
});
export namespace PasswordField {
  export type Props = PasswordFieldProps;
  export type InputProps = Omit<NativeProps, 'type' | 'size'> & { asChild?: boolean };
  export type VisibilityToggleProps = NativeButtonProps & { asChild?: boolean };
  export const Input = PasswordInput;
  export const VisibilityToggle = PasswordVisibilityToggle;
  export const Style = tv({
    base: [
      'inline-flex w-full min-w-0 items-center gap-2 text-(--ids-color-on-surface)',
      '[--ids-password-field-danger:var(--ids-field-danger,#b42318)]',
      '[[data-mode=dark]_&]:[--ids-password-field-danger:var(--ids-field-danger,#fda29b)]',
      'data-disabled:cursor-not-allowed data-disabled:opacity-40',
      'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
      'has-[:focus-visible]:outline-(--ids-color-primary)',
    ],
    variants: {
      variant: {
        outline:
          'inset-ring-1 inset-ring-(--ids-color-outline) hover:inset-ring-(--ids-color-primary)',
        filled:
          'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent hover:bg-(--ids-color-primary)/15',
        unstyled: '',
      } satisfies Record<PasswordFieldVariant, string>,
      size: {
        standard: 'h-11 rounded-xl px-3 text-body-b2-regular',
        tiny: 'h-8 gap-1 rounded-lg px-2 text-body-b3-regular',
      } satisfies Record<IdsSize, string>,
    },
    compoundVariants: [
      {
        variant: ['outline', 'filled'],
        class:
          'data-invalid:inset-ring-1 data-invalid:inset-ring-(--ids-password-field-danger) data-invalid:has-[:focus-visible]:outline-(--ids-password-field-danger)',
      },
    ],
  });
}
