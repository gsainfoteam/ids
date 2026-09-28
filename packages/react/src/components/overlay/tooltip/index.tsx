import {
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { createPortal } from 'react-dom';

import { useTooltip, type UseTooltipOptions } from './use-tooltip';
import { PortalRootContext, type AnchoredSide } from '../../../internal/overlay';
import { invariant, mergeProps, mergeRefs, part, tv } from '../../../utils';

export { TooltipDelayGroup } from './delay-group';

type Context = {
  tooltip: ReturnType<typeof useTooltip>;
  styles: ReturnType<typeof Tooltip.Style>;
};

const TooltipContext = createContext<Context | null>(null);

function useTooltipContext(part: string) {
  const context = use(TooltipContext);
  invariant(context, `${part} must be rendered inside Tooltip.`);
  return context;
}

const ARROW_HALF = 4;

const ARROW_EDGE: Record<AnchoredSide, AnchoredSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const joinIds = (...ids: Array<unknown>) =>
  ids.filter((id) => typeof id === 'string' && id !== '').join(' ') || undefined;

export function Tooltip({ content, arrow = false, children, ...options }: Tooltip.Props) {
  const tooltip = useTooltip(options);
  const shorthand = content !== undefined;
  return (
    <TooltipContext value={{ tooltip, styles: Tooltip.Style() }}>
      {shorthand ? (
        <>
          <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
          <Tooltip.Content>
            {content}
            {arrow && <Tooltip.Arrow />}
          </Tooltip.Content>
        </>
      ) : (
        children
      )}
    </TooltipContext>
  );
}

function TooltipPopup({ className, style, ref, children, ...props }: Tooltip.Content.Props) {
  const { tooltip, styles } = useTooltipContext('Tooltip.Content');
  const portalRoot = use(PortalRootContext);
  const popup = (
    <div
      {...tooltip.floatingProps}
      {...props}
      ref={mergeRefs(ref, tooltip.setContent)}
      popover="manual"
      data-tooltip-content=""
      data-side={tooltip.side}
      data-align={tooltip.align}
      data-open={tooltip.open ? '' : undefined}
      data-instant={tooltip.instant ? '' : undefined}
      data-ending-style={tooltip.ending ? '' : undefined}
      className={styles.content({ className })}
      style={{ ...tooltip.floatingStyles, ...style }}
    >
      {children}
    </div>
  );
  return portalRoot ? createPortal(popup, portalRoot) : popup;
}

export namespace Tooltip {
  export type Side = AnchoredSide;

  export type Props = UseTooltipOptions & {
    content?: ReactNode;
    arrow?: boolean;
    children?: ReactNode;
  };

  export function Trigger({ asChild, children, ...props }: Trigger.Props) {
    const { tooltip } = useTooltipContext('Tooltip.Trigger');
    const reference = tooltip.getReferenceProps({
      onPointerDown: (event: PointerEvent<HTMLElement>) =>
        tooltip.closeByTriggerPress(event.nativeEvent),
    });
    const ownDescription =
      asChild && isValidElement<ComponentProps<'button'>>(children)
        ? children.props['aria-describedby']
        : props['aria-describedby'];
    return part(
      asChild ? 'span' : 'button',
      asChild,
      children,
      mergeProps(props, {
        ...reference,
        ref: tooltip.setTrigger,
        type: asChild ? undefined : 'button',
        'aria-describedby': joinIds(ownDescription, reference['aria-describedby']),
        'data-popup-open': tooltip.open ? '' : undefined,
      }),
    );
  }
  export namespace Trigger {
    export type Props = ComponentProps<'button'> & { asChild?: boolean };
  }

  export function Content(props: Content.Props) {
    const { tooltip } = useTooltipContext('Tooltip.Content');
    if (!tooltip.mounted) return null;
    return <TooltipPopup {...props} />;
  }
  export namespace Content {
    export type Props = ComponentProps<'div'>;
  }

  export function Arrow({ className, style, ...props }: Arrow.Props) {
    const { tooltip, styles } = useTooltipContext('Tooltip.Arrow');
    const { arrowPosition, side, setArrow } = tooltip;
    const placed: CSSProperties = {
      left: arrowPosition?.x,
      top: arrowPosition?.y,
      [ARROW_EDGE[side]]: -ARROW_HALF,
    };
    return (
      <span
        aria-hidden="true"
        {...props}
        ref={setArrow}
        data-tooltip-arrow=""
        className={styles.arrow({ className })}
        style={{ ...placed, ...style }}
      />
    );
  }
  export namespace Arrow {
    export type Props = Omit<ComponentProps<'span'>, 'children'>;
  }

  export const Style = tv({
    slots: {
      content: [
        'pointer-events-none fixed z-50 m-0 w-max max-w-xs overflow-visible border-0',
        'rounded-standard px-2.5 py-1.5 text-start text-caption-c1-medium break-keep [overflow-wrap:anywhere]',
        'bg-(--ids-color-on-surface) text-(--ids-color-surface) shadow-md',
        'transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
        'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
        'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
        'data-instant:transition-none motion-reduce:transition-none',
      ],
      arrow: 'absolute size-2 rotate-45 bg-inherit',
    },
  });
}
