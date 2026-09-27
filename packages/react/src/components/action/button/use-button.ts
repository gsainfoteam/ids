import {
  cloneElement,
  createContext,
  createElement,
  Fragment,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { useInteractiveProps } from '../../../hooks/use-interactive';
import { usePressable } from '../../../internal/pressable';
import { cn, invariant, mergeProps, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

export const ButtonNestingContext = createContext<string | null>(null);

export type ButtonKind = 'button' | 'link' | 'element' | 'component';

type Consumed =
  | 'asChild'
  | 'focusableWhenDisabled'
  | 'disabled'
  | 'type'
  | 'ref'
  | 'onClick'
  | 'children';

type ResolvedButtonProps = {
  asChild?: boolean;
  focusableWhenDisabled?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ref?: Ref<HTMLElement>;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  children?: ReactNode;
  [key: string]: unknown;
};

export type ButtonView = {
  className?: string;
  style?: CSSProperties;
  role?: string;
  tabIndex?: number;
  [key: string]: unknown;
};

type ChildProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  type?: string;
  role?: string;
  tabIndex?: number;
  ref?: Ref<HTMLElement>;
  [key: string]: unknown;
};

type Options = {
  checkContent?: boolean;
};

function kindOf(element: ReactElement | undefined): ButtonKind {
  if (!element || element.type === 'button') return 'button';
  if (element.type === 'a') return 'link';
  return typeof element.type === 'string' ? 'element' : 'component';
}

const isActivationKey = (key: string) => key === 'Enter' || key === ' ';

function blockActivation(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export function useButton<P extends object>(props: P, name: string, options: Options = {}) {
  const {
    state,
    handlers,
    dataProps,
    props: resolved,
  } = useInteractiveProps<HTMLElement, P>(props);
  const {
    asChild = false,
    focusableWhenDisabled = false,
    disabled = false,
    type,
    ref,
    onClick,
    children,
    ...rest
  } = resolved as ResolvedButtonProps;

  const element = asChild && isValidElement<ChildProps>(children) ? children : undefined;
  invariant(
    !asChild || (element !== undefined && element.type !== Fragment),
    `${name}: asChild needs exactly one element child that forwards its props and ref.`,
  );
  const kind = kindOf(element);
  const { ref: childRef, children: childContent, ...childProps }: ChildProps = element?.props ?? {};

  const nativeDisabled = disabled && kind === 'button' && !focusableWhenDisabled;
  const softDisabled = disabled && !nativeDisabled;

  const parent = use(ButtonNestingContext);
  const nodeRef = useRef<HTMLElement>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs<HTMLElement>(nodeRef, ref, childRef)(node),
    [ref, childRef],
  );

  useEffect(() => {
    if (isDevelopment && parent !== null)
      console.warn(
        `[IDS] ${name}: a button cannot sit inside ${parent}. Place them side by side, or group them with ButtonGroup.`,
      );
  }, [name, parent]);

  const warnedContent = useRef(false);
  useEffect(() => {
    const node = nodeRef.current;
    if (!isDevelopment || !options.checkContent || warnedContent.current || !node) return;
    if (node.textContent?.trim()) return;
    warnedContent.current = true;
    console.warn(
      node.querySelector('svg')
        ? `[IDS] ${name}: this button shows only an icon. Use IconButton, which keeps it square and names it from the icon.`
        : `[IDS] ${name}: children are empty. Use IconButton for a button that shows only an icon.`,
    );
  });

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (softDisabled && isActivationKey(event.key)) return blockActivation(event);
    handlers.onKeyDown(event);
  };

  const press = usePressable<HTMLElement>({
    enabled: kind === 'element',
    disabled: softDisabled,
    onClick: softDisabled ? blockActivation : onClick,
    onKeyDown,
    onKeyUp: handlers.onKeyUp,
    onBlur: handlers.onBlur,
  });

  const content: ReactNode = element ? childContent : children;

  function render(view: ButtonView, inner: ReactNode = content) {
    const control: Record<string, unknown> = {
      ...dataProps,
      ...handlers,
      onClick: press.onClick,
      onKeyDown: press.onKeyDown,
      onKeyUp: press.onKeyUp,
      onBlur: press.onBlur,
      ref: mergedRef,
    };
    if (kind === 'button' || (kind === 'component' && type !== undefined))
      control.type = type ?? childProps.type ?? 'button';
    if (nativeDisabled) control.disabled = true;
    if (softDisabled) control['aria-disabled'] = true;
    if (kind === 'element') {
      control.role = view.role ?? childProps.role ?? 'button';
      control.tabIndex = view.tabIndex ?? childProps.tabIndex ?? 0;
    }
    if (softDisabled && !focusableWhenDisabled) control.tabIndex = -1;

    const nested = createElement(ButtonNestingContext, { value: name }, inner);
    if (!element) return createElement('button', { ...view, ...control }, nested);

    const merged: Record<string, unknown> = mergeProps(childProps, { ...view, ...control });
    merged.className = cn(view.className, childProps.className);
    merged.style = { ...view.style, ...childProps.style };
    if (softDisabled) {
      const keyDown = merged.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined;
      merged.onClick = blockActivation;
      merged.onKeyDown = (event: KeyboardEvent<HTMLElement>) =>
        isActivationKey(event.key) ? blockActivation(event) : keyDown?.(event);
      if (kind === 'link') {
        merged.href = undefined;
        merged.role = merged.role ?? 'link';
      }
    }
    return cloneElement(element, merged, nested);
  }

  return {
    state,
    props: rest as Omit<typeof resolved, Consumed>,
    kind,
    element,
    content,
    nodeRef,
    render,
  };
}
