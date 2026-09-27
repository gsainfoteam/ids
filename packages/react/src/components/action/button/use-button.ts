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
import { cn, invariant, mergeProps, mergeRefs } from '../../../utils';

// The name of the nearest enclosing button-like component. A button inside another one is invalid
// HTML, and the browser splits the outer button apart when it parses the markup.
export const ButtonNestingContext = createContext<string | null>(null);

// 'button' is a native <button>, 'link' an <a>, 'element' any other host element and 'component'
// a component whose rendered element is unknown until it mounts, usually a router Link.
export type ButtonKind = 'button' | 'link' | 'element' | 'component';

// Props the hook consumes; the rest are the component's own (variant, size, ...) and DOM props.
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
  // Button warns when it holds only an icon, which is what IconButton is for.
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

  // A native button takes the disabled attribute. Anything else, and a button that has to keep
  // focus while it is disabled (a submit button turning into its loading state), is only marked
  // aria-disabled and has its activation blocked here.
  const nativeDisabled = disabled && kind === 'button' && !focusableWhenDisabled;
  const softDisabled = disabled && !nativeDisabled;

  const parent = use(ButtonNestingContext);
  const nodeRef = useRef<HTMLElement>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => mergeRefs<HTMLElement>(nodeRef, ref, childRef)(node),
    [ref, childRef],
  );

  useEffect(() => {
    if (import.meta.env.DEV && parent !== null)
      console.warn(
        `[IDS] ${name}: a button cannot sit inside ${parent}. Place them side by side, or group them with ButtonGroup.`,
      );
  }, [name, parent]);

  const warnedContent = useRef(false);
  useEffect(() => {
    const node = nodeRef.current;
    if (!import.meta.env.DEV || !options.checkContent || warnedContent.current || !node) return;
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
    // A host element standing in for a button clicks on Enter at once and on Space when the key
    // is released, as a native button does, and Space must not scroll the page meanwhile.
    if (kind !== 'element' || event.defaultPrevented) return;
    if (event.key === 'Enter') event.currentTarget.click();
    if (event.key === ' ') event.preventDefault();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLElement>) => {
    handlers.onKeyUp(event);
    if (kind === 'element' && !softDisabled && event.key === ' ' && !event.defaultPrevented)
      event.currentTarget.click();
  };

  function render(view: ButtonView) {
    const control: Record<string, unknown> = {
      ...dataProps,
      ...handlers,
      onKeyDown,
      onKeyUp,
      onClick: softDisabled ? blockActivation : onClick,
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

    const content = createElement(
      ButtonNestingContext,
      { value: name },
      element ? childContent : children,
    );
    if (!element) return createElement('button', { ...view, ...control }, content);

    // The child's handlers run first and can cancel ours with preventDefault. Its className and
    // style come last so that an override written on the child wins over the component's style.
    const merged: Record<string, unknown> = mergeProps(childProps, { ...view, ...control });
    merged.className = cn(view.className, childProps.className);
    merged.style = { ...view.style, ...childProps.style };
    if (softDisabled) {
      merged.onClick = blockActivation;
      // A link without href is no longer a link, so its role is kept explicitly. A router
      // component keeps its href because it may require one; the blocked click stops it instead.
      if (kind === 'link') {
        merged.href = undefined;
        merged.role = merged.role ?? 'link';
      }
    }
    return cloneElement(element, merged, content);
  }

  return { state, props: rest as Omit<typeof resolved, Consumed>, kind, render };
}
