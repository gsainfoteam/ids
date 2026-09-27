import {
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';

import { useAlert } from './use-alert';
import { messages } from '../../../internal/messages';
import { flattenFragments, invariant, mergeEventHandlers, mergeRefs, tv } from '../../../utils';
import { Slot } from '../../utility/slot';

type Context = {
  state: Alert.State;
  styles: ReturnType<typeof Alert.Style>;
  close: () => void;
};

const AlertContext = createContext<Context | null>(null);

function useAlertContext(part: string) {
  const context = use(AlertContext);
  invariant(context, `${part} must be rendered inside Alert.`);
  return context;
}

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

function isPart(node: ReactNode, part: unknown): node is ReactElement<Record<string, unknown>> {
  return isValidElement(node) && node.type === part;
}

// Warnings and errors interrupt; the rest wait until the reader is idle.
const ASSERTIVE = new Set<Alert.ColorScheme>(['warning', 'danger']);

// The glyph repeats the meaning of the color, so it does not rest on color alone.
const ICONS = {
  neutral: InformationCircleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  danger: XCircleIcon,
} satisfies Record<Alert.ColorScheme, unknown>;

export function Alert({
  colorScheme = 'info',
  variant = 'soft',
  open,
  defaultOpen = true,
  onOpenChange,
  role,
  'aria-live': ariaLive,
  onKeyDown,
  className,
  style,
  children,
  ref,
  ...rest
}: Alert.Props) {
  const nodes = flattenFragments(children);
  const icon = nodes.find((node) => isPart(node, Alert.Icon));
  const close = nodes.find((node) => isPart(node, Alert.Close));
  const body = nodes.filter((node) => node !== icon && node !== close);
  const dismissible = close !== undefined;
  const hasText = nodes.some(
    (node) => isPart(node, Alert.Title) || isPart(node, Alert.Description),
  );

  const {
    setNode,
    open: isOpen,
    mounted,
    ending,
    close: requestClose,
    onKeyDown: onAlertKeyDown,
  } = useAlert({ open, defaultOpen, onOpenChange, dismissible });
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(setNode, ref)(node),
    [setNode, ref],
  );

  useEffect(() => {
    if (import.meta.env.DEV && !hasText)
      console.warn('[IDS] Alert: give it an Alert.Title or an Alert.Description.');
  }, [hasText]);

  if (!mounted) return null;

  const showIcon = icon === undefined ? colorScheme !== 'neutral' : icon.props.hidden !== true;
  const state: Alert.State = {
    colorScheme,
    variant,
    open: isOpen,
    dismissible,
    ending,
  };
  const styles = Alert.Style({ colorScheme, variant, icon: showIcon, close: dismissible });
  const assertive = ASSERTIVE.has(colorScheme);

  return (
    <AlertContext value={{ state, styles, close: requestClose }}>
      <div
        role={role ?? (assertive ? 'alert' : 'status')}
        aria-live={
          ariaLive ?? (role === undefined ? (assertive ? 'assertive' : 'polite') : undefined)
        }
        {...rest}
        ref={mergedRef}
        onKeyDown={mergeEventHandlers(onKeyDown, onAlertKeyDown)}
        data-alert=""
        data-color-scheme={colorScheme}
        data-variant={variant}
        data-dismissible={dismissible ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        className={styles.root({ className: resolve(className, state) })}
        style={resolve(style, state)}
      >
        {showIcon && (icon ?? <Alert.Icon />)}
        <div className={styles.content()}>{body}</div>
        {close}
      </div>
    </AlertContext>
  );
}

export namespace Alert {
  export type ColorScheme = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  export type Variant = 'solid' | 'soft' | 'outline' | 'ghost';

  export type State = {
    colorScheme: ColorScheme;
    variant: Variant;
    open: boolean;
    dismissible: boolean;
    ending: boolean;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    colorScheme?: ColorScheme;
    variant?: Variant;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  type PartProps<E extends 'span' | 'div'> = Omit<ComponentProps<E>, 'className'> & {
    asChild?: boolean;
    className?: string | ((state: State) => string | undefined);
  };

  export function Icon({ asChild, className, children, hidden: _hidden, ...props }: Icon.Props) {
    const { state, styles } = useAlertContext('Alert.Icon');
    const Glyph = ICONS[state.colorScheme];
    const Root = asChild ? Slot : 'span';
    return (
      <Root
        aria-hidden="true"
        {...props}
        data-alert-icon=""
        className={styles.icon({ className: resolve(className, state) })}
      >
        {children ?? <Glyph />}
      </Root>
    );
  }
  export namespace Icon {
    export type Props = PartProps<'span'>;
  }

  export function Title({ asChild, className, ...props }: Title.Props) {
    const { state, styles } = useAlertContext('Alert.Title');
    const Root = asChild ? Slot : 'div';
    return (
      <Root
        {...props}
        data-alert-title=""
        className={styles.title({ className: resolve(className, state) })}
      />
    );
  }
  export namespace Title {
    export type Props = PartProps<'div'>;
  }

  export function Description({ asChild, className, ...props }: Description.Props) {
    const { state, styles } = useAlertContext('Alert.Description');
    const Root = asChild ? Slot : 'div';
    return (
      <Root
        {...props}
        data-alert-description=""
        className={styles.description({ className: resolve(className, state) })}
      />
    );
  }
  export namespace Description {
    export type Props = PartProps<'div'>;
  }

  export function Actions({ asChild, className, ...props }: Actions.Props) {
    const { state, styles } = useAlertContext('Alert.Actions');
    const Root = asChild ? Slot : 'div';
    return (
      <Root
        {...props}
        data-alert-actions=""
        className={styles.actions({ className: resolve(className, state) })}
      />
    );
  }
  export namespace Actions {
    export type Props = PartProps<'div'>;
  }

  // Calling preventDefault in onClick keeps the alert open.
  export function Close({ className, children, onClick, ...props }: Close.Props) {
    const { state, styles, close } = useAlertContext('Alert.Close');
    return (
      <button
        type="button"
        aria-label={messages.alert.close}
        {...props}
        onClick={mergeEventHandlers(onClick, (_event: MouseEvent<HTMLButtonElement>) => close())}
        data-alert-close=""
        className={styles.close({ className: resolve(className, state) })}
      >
        {children ?? <XMarkIcon />}
      </button>
    );
  }
  export namespace Close {
    export type Props = Omit<ComponentProps<'button'>, 'className' | 'type'> & {
      className?: string | ((state: State) => string | undefined);
    };
  }

  export const Style = tv({
    slots: {
      root: [
        'relative grid w-full items-start gap-x-3 concentric-p-3 px-4 text-body-b3-regular',
        'transition-[opacity,translate] duration-(--ids-motion-fast) ease-out motion-reduce:transition-none',
        'data-ending-style:-translate-y-1 data-ending-style:opacity-0',
      ],
      icon: [
        'flex h-[1lh] shrink-0 items-center text-(--alert-accent)',
        '[&_svg]:size-(--ids-size-icon-standard)',
      ],
      content: 'flex min-w-0 flex-col gap-0.5',
      title: 'text-body-b3-semibold text-(--alert-title)',
      description: 'text-(--alert-body) [&_ul]:list-disc [&_ul]:ps-5',
      actions: 'mt-2 flex flex-wrap items-center gap-2',
      close: [
        '-my-0.5 -me-1.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full',
        'text-(--alert-title) opacity-70 transition-[opacity,background-color] duration-(--ids-motion-fast)',
        'hover:bg-current/10 hover:opacity-100 focus-ring motion-reduce:transition-none',
        '[&_svg]:size-(--ids-size-icon-standard)',
      ],
    },
    variants: {
      // Meaning sets three colors; the variant decides where each one is painted.
      colorScheme: {
        neutral: {
          root: '[--alert-tint:var(--ids-color-on-surface)] [--alert-strong:var(--ids-color-on-surface)] [--alert-on:var(--ids-color-surface)]',
        },
        info: {
          root: '[--alert-tint:var(--ids-color-info)] [--alert-strong:var(--ids-color-info-strong)] [--alert-on:var(--ids-color-on-info)]',
        },
        success: {
          root: '[--alert-tint:var(--ids-color-success)] [--alert-strong:var(--ids-color-success-strong)] [--alert-on:var(--ids-color-on-success)]',
        },
        warning: {
          root: '[--alert-tint:var(--ids-color-warning)] [--alert-strong:var(--ids-color-warning-strong)] [--alert-on:var(--ids-color-on-warning)]',
        },
        danger: {
          root: '[--alert-tint:var(--ids-color-danger)] [--alert-strong:var(--ids-color-danger-strong)] [--alert-on:var(--ids-color-on-danger)]',
        },
      } satisfies Record<ColorScheme, object>,
      // Text on a tint uses the -strong tone, which keeps 4.5:1 where the plain status color
      // (warning yellow above all) would not.
      variant: {
        solid: {
          root: [
            'bg-(--alert-tint) text-(--alert-on)',
            '[--alert-accent:var(--alert-on)] [--alert-title:var(--alert-on)] [--alert-body:var(--alert-on)]',
          ],
        },
        soft: {
          root: [
            'bg-(--alert-tint)/10 text-(--ids-color-on-surface)',
            '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-on-surface)]',
          ],
        },
        outline: {
          root: [
            'bg-(--ids-color-surface) text-(--ids-color-on-surface) inset-ring-1 inset-ring-(--ids-color-border)',
            'dark:bg-(--ids-color-muted)/30',
            '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-on-muted)]',
          ],
        },
        ghost: {
          root: [
            'bg-transparent text-(--ids-color-on-surface)',
            '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-on-muted)]',
          ],
        },
      } satisfies Record<Variant, object>,
      icon: { true: {}, false: {} },
      close: { true: {}, false: {} },
    },
    compoundVariants: [
      { icon: false, close: false, class: { root: 'grid-cols-1' } },
      { icon: true, close: false, class: { root: 'grid-cols-[auto_minmax(0,1fr)]' } },
      { icon: false, close: true, class: { root: 'grid-cols-[minmax(0,1fr)_auto]' } },
      { icon: true, close: true, class: { root: 'grid-cols-[auto_minmax(0,1fr)_auto]' } },
    ],
    defaultVariants: { colorScheme: 'info', variant: 'soft', icon: false, close: false },
  });
}
