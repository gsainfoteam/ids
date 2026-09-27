import {
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { useCard } from './use-card';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { useRegisteredId } from '../../../internal/surface';
import { invariant, tv } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { InteractiveState } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export type CardVariant = 'outline' | 'soft' | 'ghost';

type Context = {
  styles: ReturnType<typeof Card.Style>;
  setTitleId: (id: string | undefined) => void;
  setDescriptionId: (id: string | undefined) => void;
};

const CardContext = createContext<Context | null>(null);

function useCardContext(part: string) {
  const context = use(CardContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Card>\`.`);
  return context;
}

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function Card({
  variant = 'outline',
  size = 'standard',
  interactive: interactiveProp,
  disabled = false,
  asChild = false,
  className,
  style,
  children,
  onClick,
  onKeyDown,
  onKeyUp,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onInteractionChange,
  ...rest
}: Card.Props) {
  const nativeControl =
    asChild && isValidElement(children) && (children.type === 'a' || children.type === 'button');
  const interactive = interactiveProp ?? (onClick != null || nativeControl);
  const { interaction, props, dataProps, labelling, register } = useCard<HTMLDivElement>({
    interactive,
    asChild,
    disabled,
    handlers: {
      onClick,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onInteractionChange,
    },
  });
  const state: Card.State = { ...interaction, interactive };
  const styles = Card.Style({ variant, size, interactive });
  const Root = asChild ? Slot : 'div';

  return (
    <CardContext value={{ styles, ...register }}>
      <Root
        {...rest}
        {...props}
        {...labelling}
        {...(asChild && disabled
          ? { 'aria-disabled': true, onClick: (event) => event.preventDefault() }
          : {})}
        data-card=""
        data-variant={variant}
        data-size={size}
        data-interactive={flag(interactive)}
        data-disabled={flag(disabled)}
        {...dataProps}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {resolveState(children, state)}
      </Root>
    </CardContext>
  );
}

function Part({
  asChild,
  kind,
  ...props
}: ComponentProps<'div'> & { asChild?: boolean; kind: string }) {
  const Root = asChild === true ? Slot : 'div';
  return <Root {...props} {...{ [`data-card-${kind}`]: '' }} />;
}

export namespace Card {
  export type Variant = CardVariant;

  export type State = InteractiveState & { interactive: boolean };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    variant?: CardVariant;
    size?: IdsSize;
    interactive?: boolean;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export type PartProps = ComponentProps<'div'> & { asChild?: boolean };

  export function Header({ className, ...props }: Header.Props) {
    const { styles } = useCardContext('Card.Header');
    return <Part {...props} kind="header" className={styles.header({ className })} />;
  }
  export namespace Header {
    export type Props = PartProps;
  }

  export function Title({ className, id, ...props }: Title.Props) {
    const { styles, setTitleId } = useCardContext('Card.Title');
    const titleId = useRegisteredId(setTitleId, id);
    return <Part {...props} id={titleId} kind="title" className={styles.title({ className })} />;
  }
  export namespace Title {
    export type Props = PartProps;
  }

  export function Description({ className, id, ...props }: Description.Props) {
    const { styles, setDescriptionId } = useCardContext('Card.Description');
    const descriptionId = useRegisteredId(setDescriptionId, id);
    return (
      <Part
        {...props}
        id={descriptionId}
        kind="description"
        className={styles.description({ className })}
      />
    );
  }
  export namespace Description {
    export type Props = PartProps;
  }

  export function Action({ className, ...props }: Action.Props) {
    const { styles } = useCardContext('Card.Action');
    return <Part {...props} kind="action" className={styles.action({ className })} />;
  }
  export namespace Action {
    export type Props = PartProps;
  }

  export function Content({ className, ...props }: Content.Props) {
    const { styles } = useCardContext('Card.Content');
    return <Part {...props} kind="content" className={styles.content({ className })} />;
  }
  export namespace Content {
    export type Props = PartProps;
  }

  export function Footer({ className, ...props }: Footer.Props) {
    const { styles } = useCardContext('Card.Footer');
    return <Part {...props} kind="footer" className={styles.footer({ className })} />;
  }
  export namespace Footer {
    export type Props = PartProps;
  }

  export function Media({ className, ...props }: Media.Props) {
    const { styles } = useCardContext('Card.Media');
    return <Part {...props} kind="media" className={styles.media({ className })} />;
  }
  export namespace Media {
    export type Props = PartProps;
  }

  export const Style = tv({
    slots: {
      root: [
        'relative isolate flex flex-col text-(--ids-color-on-surface)',
        '[--card-pad:var(--ids-concentric-pad)]',
      ],
      header: [
        'grid auto-rows-min items-start gap-1 border-(--ids-color-border)',
        'has-[[data-card-action]]:grid-cols-[minmax(0,1fr)_auto]',
        '[.border-b]:-mx-(--card-pad) [.border-b]:px-(--card-pad) [.border-b]:pb-(--card-gap)',
      ],
      title: '[overflow-wrap:anywhere]',
      description: 'text-(--ids-color-on-muted)',
      action: 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      content: 'flex-1 border-(--ids-color-border)',
      footer: [
        'flex items-center gap-2 border-(--ids-color-border)',
        '[.border-t]:-mx-(--card-pad) [.border-t]:px-(--card-pad) [.border-t]:pt-(--card-gap)',
      ],
      media: [
        'relative -mx-[calc(var(--card-pad)_-_var(--card-ring))] overflow-hidden',
        'first:-mt-[calc(var(--card-pad)_-_var(--card-ring))] first:rounded-t-[inherit]',
        'last:-mb-[calc(var(--card-pad)_-_var(--card-ring))] last:rounded-b-[inherit]',
        '[&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover',
      ],
    },
    variants: {
      variant: {
        outline: {
          root: 'bg-(--ids-color-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border) [--card-ring:1px]',
        },
        soft: { root: 'bg-(--ids-color-muted) [--card-ring:0px]' },
        ghost: { root: 'bg-transparent [--card-ring:0px]' },
      } satisfies Record<CardVariant, object>,
      size: {
        standard: {
          root: 'gap-4 concentric-p-4 text-body-b3-regular [--card-gap:--spacing(4)]',
          title: 'text-subtitle-s2-semibold',
          description: 'text-body-b3-regular',
        },
        tiny: {
          root: 'gap-3 concentric-p-3 text-caption-c1-regular [--card-gap:--spacing(3)]',
          title: 'text-body-b3-semibold',
          description: 'text-caption-c1-regular',
        },
      } satisfies Record<IdsSize, object>,
      interactive: {
        true: {
          root: [
            'cursor-pointer select-none focus-ring',
            'transition-[box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
            'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
            'before:rounded-[inherit] before:bg-(--ids-color-on-surface) before:opacity-0',
            'before:transition-opacity before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
            'data-hovered:before:opacity-4 data-active:before:opacity-8',
            'data-disabled:cursor-not-allowed data-disabled:opacity-50',
          ],
        },
        false: {},
      },
    },
    defaultVariants: { variant: 'outline', size: 'standard', interactive: false },
  });
}
