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

  // A host element standing in for a button (asChild on a span or div) does what the browser does
  // for a native one: Enter clicks on key down, Space on key up, and a press that starts on a
  // control nested inside it stays with that control.
  const press = usePressable<HTMLElement>({
    enabled: kind === 'element',
    disabled: softDisabled,
    onClick: softDisabled ? blockActivation : onClick,
    onKeyDown,
    onKeyUp: handlers.onKeyUp,
    onBlur: handlers.onBlur,
  });

  // What the button shows: its children, or with asChild the child element's children. A component
  // that draws its own content (IconButton's icon) passes it to render instead.
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

    // The child's handlers run first and can cancel ours with preventDefault. Its className and
    // style come last so that an override written on the child wins over the component's style.
    const merged: Record<string, unknown> = mergeProps(childProps, { ...view, ...control });
    merged.className = cn(view.className, childProps.className);
    merged.style = { ...view.style, ...childProps.style };
    if (softDisabled) {
      // The child's own handlers are cut off too: a disabled link must not act on click or on
      // Enter and Space, whoever registered the handler.
      const keyDown = merged.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined;
      merged.onClick = blockActivation;
      merged.onKeyDown = (event: KeyboardEvent<HTMLElement>) =>
        isActivationKey(event.key) ? blockActivation(event) : keyDown?.(event);
      // A link without href is no longer a link, so its role is kept explicitly. A router
      // component keeps its href because it may require one; the blocked click stops it instead.
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
