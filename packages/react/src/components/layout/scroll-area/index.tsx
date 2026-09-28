import {
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  use,
  useCallback,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useScrollArea } from './use-scroll-area';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { flattenFragments, invariant, mergeProps, mergeRefs, part, tv } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Axis, Placement } from './geometry';
import type { IdsSize } from '../../../tokens/types';

type AreaContext = {
  area: ReturnType<typeof useScrollArea>;
  variant: ScrollArea.Variant;
  size: IdsSize;
  scrolls: ScrollArea.Orientation;
  placements: Record<Axis, Placement>;
};

type DeclaredBar = {
  node: ReactElement<ScrollArea.ScrollbarProps>;
  axis: Axis;
  placement: Placement;
};

const ScrollAreaContext = createContext<AreaContext | null>(null);
const PlacementContext = createContext<Placement>('end');
const ScrollbarContext = createContext<Axis | null>(null);

const AXES: Record<ScrollArea.Orientation, Axis[]> = {
  vertical: ['y'],
  horizontal: ['x'],
  both: ['y', 'x'],
};

const axisOf = (orientation: ScrollArea.ScrollbarOrientation | undefined): Axis =>
  orientation === 'horizontal' ? 'x' : 'y';

const orientationOf = (axis: Axis): ScrollArea.ScrollbarOrientation =>
  axis === 'x' ? 'horizontal' : 'vertical';

const scrollsAlong = (axes: Record<Axis, boolean>): ScrollArea.Orientation => {
  if (axes.x && axes.y) return 'both';
  return axes.x ? 'horizontal' : 'vertical';
};

const isType =
  <P,>(type: unknown) =>
  (node: ReactNode): node is ReactElement<P> =>
    isValidElement(node) && node.type === type;

function arrange(children: ReactNode, orientation: ScrollArea.Orientation) {
  const nodes = flattenFragments(children);
  const isBar = isType<ScrollArea.ScrollbarProps>(ScrollAreaScrollbar);
  const isCorner = isType<ScrollArea.CornerProps>(ScrollAreaCorner);

  const content = nodes.filter((node) => !isBar(node) && !isCorner(node));
  const viewports = content.filter(isType<ScrollArea.ViewportProps>(ScrollAreaViewport));
  invariant(viewports.length <= 1, '`<ScrollArea>` accepts at most one `<ScrollArea.Viewport>`.');
  invariant(
    !viewports.length || content.length === 1,
    '`<ScrollArea>` takes its content either inside `<ScrollArea.Viewport>` or directly, not both.',
  );

  const contentAt = content.length ? nodes.indexOf(content[0]) : nodes.length;
  const declared: DeclaredBar[] = nodes.filter(isBar).map((node) => ({
    node,
    axis: axisOf(node.props.orientation),
    placement: nodes.indexOf(node) < contentAt ? 'start' : 'end',
  }));
  const missing: DeclaredBar[] = AXES[orientation]
    .filter((axis) => !declared.some((bar) => bar.axis === axis))
    .map((axis) => ({
      node: <ScrollAreaScrollbar key={`scrollbar-${axis}`} orientation={orientationOf(axis)} />,
      axis,
      placement: 'end',
    }));
  const bars = [...declared, ...missing];

  const lastOn = (axis: Axis) => bars.filter((bar) => bar.axis === axis).at(-1);
  const axes = { x: !!lastOn('x'), y: !!lastOn('y') };
  const corners = nodes.filter(isCorner);

  return {
    viewport: viewports[0],
    content,
    bars,
    axes,
    corners: corners.length || !axes.x || !axes.y ? corners : [<ScrollAreaCorner key="corner" />],
    placements: { x: lastOn('x')?.placement ?? 'end', y: lastOn('y')?.placement ?? 'end' },
    repeated: (['y', 'x'] as const).filter(
      (axis) => declared.filter((bar) => bar.axis === axis).length > 1,
    ),
  };
}

export function ScrollArea({
  variant = 'hover',
  size = 'standard',
  orientation = 'vertical',
  asChild = false,
  className,
  style,
  children,
  ref,
  ...props
}: ScrollArea.Props) {
  invariant(
    !asChild || (isValidElement(children) && children.type !== Fragment),
    '`<ScrollArea asChild>` requires one element to become the scroll area.',
  );

  const child = asChild ? (children as ReactElement<{ children?: ReactNode }>) : null;
  const layout = arrange(child ? child.props.children : children, orientation);
  const area = useScrollArea({ axes: layout.axes });

  const repeated = layout.repeated.map(orientationOf).join(', ');

  useEffect(() => {
    if (isDevelopment && repeated)
      console.warn(
        `[IDS] ScrollArea has more than one Scrollbar for the same orientation (${repeated}). Only the last one is laid out.`,
      );
  }, [repeated]);

  const state: ScrollArea.State = {
    variant,
    size,
    orientation,
    overflowX: area.overflow.x,
    overflowY: area.overflow.y,
    hovering: area.hovering,
    scrolling: area.scrolling,
    dragging: area.dragging !== null,
  };
  const scrolls = scrollsAlong(layout.axes);
  const styles = ScrollArea.Style({ size });

  const placeBar = (bar: DeclaredBar) => (
    <PlacementContext key={String(bar.node.key)} value={bar.placement}>
      {bar.node}
    </PlacementContext>
  );

  const structure = (
    <ScrollAreaContext value={{ area, variant, size, scrolls, placements: layout.placements }}>
      {layout.bars.filter((bar) => bar.placement === 'start').map(placeBar)}
      {layout.viewport ?? <ScrollAreaViewport key="viewport">{layout.content}</ScrollAreaViewport>}
      {layout.bars.filter((bar) => bar.placement === 'end').map(placeBar)}
      {layout.corners}
    </ScrollAreaContext>
  );

  const rootProps = mergeProps(props, {
    ...area.hoverProps,
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(ref, area.setRoot),
    'data-scroll-area': '',
    'data-variant': variant,
    'data-size': size,
    'data-orientation': orientation,
    'data-overflow-x': state.overflowX ? '' : undefined,
    'data-overflow-y': state.overflowY ? '' : undefined,
    'data-hovering': state.hovering ? '' : undefined,
    'data-scrolling': state.scrolling ? '' : undefined,
    'data-dragging': state.dragging ? '' : undefined,
    className: styles.root({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  });

  if (child) return cloneElement(child, mergeProps(rootProps, child.props), structure);
  return <div {...rootProps}>{structure}</div>;
}

function useAreaContext(part: string) {
  const context = use(ScrollAreaContext);

  useEffect(() => {
    if (isDevelopment && !context)
      console.warn(`[IDS] ${part} is drawn only inside <ScrollArea>; it renders nothing here.`);
  }, [context, part]);

  return context;
}

function ScrollAreaViewport({
  asChild = false,
  children,
  className,
  tabIndex,
  ref,
  ...props
}: ScrollArea.ViewportProps) {
  const c = use(ScrollAreaContext);
  invariant(c, '`<ScrollArea.Viewport>` must be used inside `<ScrollArea>`.');

  const { area } = c;
  const styles = ScrollArea.Style({ scrolls: c.scrolls });

  const own = {
    ...props,
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(ref, area.setViewport),
    tabIndex: tabIndex ?? (area.tabStop ? 0 : undefined),
    'data-scroll-area-viewport': '',
    'data-tab-stop': area.tabStop ? '' : undefined,
    className: styles.viewport({ className }),
  };

  if (!asChild) return <div {...own}>{children}</div>;

  invariant(
    isValidElement<Record<string, unknown>>(children) && children.type !== Fragment,
    '`<ScrollArea.Viewport asChild>` requires one element to become the scrolling element.',
  );
  return cloneElement(children, mergeProps(own, children.props));
}

function ScrollAreaScrollbar({
  orientation = 'vertical',
  children,
  className,
  ref,
  ...props
}: ScrollArea.ScrollbarProps) {
  const c = useAreaContext('ScrollArea.Scrollbar');
  const placement = use(PlacementContext);
  const axis = axisOf(orientation);
  const registerBar = c?.area.registerBar;

  const register = useCallback(
    (node: HTMLDivElement | null) =>
      node && registerBar ? registerBar(axis, node, placement) : undefined,
    [registerBar, axis, placement],
  );

  if (!c) return null;

  const { area, variant, size } = c;
  const overflowing = area.overflow[axis];
  const active = area.hovering || area.scrolling || area.dragging !== null;
  const visible = variant === 'always' || (overflowing && (variant === 'auto' || active));
  const styles = ScrollArea.Style({ variant, size, axis, placement });

  return (
    <div
      {...mergeProps(props, area.scrollbarProps(axis))}
      ref={mergeRefs(ref, register)}
      aria-hidden="true"
      data-scroll-area-scrollbar=""
      data-orientation={orientation}
      data-placement={placement}
      data-visible={visible ? '' : undefined}
      data-overflow={overflowing ? '' : undefined}
      data-dragging={area.dragging === axis ? '' : undefined}
      className={styles.scrollbar({ className })}
    >
      <ScrollbarContext value={axis}>{children ?? <ScrollAreaThumb />}</ScrollbarContext>
    </div>
  );
}

function ScrollAreaThumb({ asChild, children, className, ...props }: ScrollArea.ThumbProps) {
  const c = use(ScrollAreaContext);
  const axis = use(ScrollbarContext);

  useEffect(() => {
    if (isDevelopment && (!c || !axis))
      console.warn(
        '[IDS] ScrollArea.Thumb is drawn only inside <ScrollArea.Scrollbar>; it renders nothing here.',
      );
  }, [c, axis]);

  if (!c || !axis) return null;

  const styles = ScrollArea.Style({ variant: c.variant, size: c.size, axis });

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      'data-scroll-area-thumb': '',
      hidden: c.area.overflow[axis] ? undefined : true,
      className: styles.thumb({ className }),
    }),
  );
}

function ScrollAreaCorner({ className, ...props }: ScrollArea.CornerProps) {
  const c = useAreaContext('ScrollArea.Corner');

  if (!c) return null;

  const styles = ScrollArea.Style({
    variant: c.variant,
    vertical: c.placements.y,
    horizontal: c.placements.x,
  });

  return (
    <div
      {...props}
      aria-hidden="true"
      data-scroll-area-corner=""
      hidden={c.area.cornerShown ? undefined : true}
      className={styles.corner({ className })}
    />
  );
}

export namespace ScrollArea {
  export type Variant = 'auto' | 'always' | 'hover';
  export type Orientation = 'vertical' | 'horizontal' | 'both';
  export type ScrollbarOrientation = 'vertical' | 'horizontal';

  export type State = {
    variant: Variant;
    size: IdsSize;
    orientation: Orientation;
    overflowX: boolean;
    overflowY: boolean;
    hovering: boolean;
    scrolling: boolean;
    dragging: boolean;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style'> & {
    variant?: Variant;
    size?: IdsSize;
    orientation?: Orientation;
    asChild?: boolean;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
  };
  export type ViewportProps = ComponentProps<'div'> & { asChild?: boolean };
  export type ScrollbarProps = Omit<ComponentProps<'div'>, 'children'> & {
    orientation?: ScrollbarOrientation;
    children?: ReactNode;
  };
  export type ThumbProps = ComponentProps<'div'> & { asChild?: boolean };
  export type CornerProps = Omit<ComponentProps<'div'>, 'children'>;

  export const Viewport = ScrollAreaViewport;
  export const Scrollbar = ScrollAreaScrollbar;
  export const Thumb = ScrollAreaThumb;
  export const Corner = ScrollAreaCorner;

  export const Style = tv({
    slots: {
      root: 'relative flex min-h-0 min-w-0 flex-col [--scroll-area-gap:2px]',
      viewport: [
        'min-h-0 min-w-0 grow overscroll-none rounded-[inherit] outline-none',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'data-tab-stop:focus-ring',
      ],
      scrollbar: [
        'group/scrollbar absolute flex touch-none rounded-full select-none',
        'pointer-events-none opacity-0 data-visible:pointer-events-auto data-visible:opacity-100',
        'transition-[opacity,width,height,background-color] duration-(--ids-motion-fast) ease-out',
        'not-data-visible:delay-300 motion-reduce:transition-none',
      ],
      thumb: [
        'absolute rounded-full bg-(--ids-color-scrollbar-thumb)',
        'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
        'hover:bg-(--ids-color-scrollbar-thumb-hover)',
        'group-data-dragging/scrollbar:bg-(--ids-color-scrollbar-thumb-active)',
      ],
      corner: 'absolute size-(--scroll-area-thickness) rounded-full',
    },
    variants: {
      variant: {
        auto: {
          scrollbar:
            'hover:bg-(--ids-color-scrollbar-track) data-dragging:bg-(--ids-color-scrollbar-track)',
        },
        hover: {
          scrollbar:
            'hover:bg-(--ids-color-scrollbar-track) data-dragging:bg-(--ids-color-scrollbar-track)',
        },
        always: {
          scrollbar: 'bg-(--ids-color-scrollbar-track)',
          corner: 'bg-(--ids-color-scrollbar-track)',
        },
      } satisfies Record<Variant, object>,
      size: {
        standard: { root: '[--scroll-area-thickness:8px]' },
        tiny: { root: '[--scroll-area-thickness:6px]' },
      } satisfies Record<IdsSize, object>,
      scrolls: {
        vertical: { viewport: 'overflow-x-hidden overflow-y-auto' },
        horizontal: { viewport: 'overflow-x-auto overflow-y-hidden' },
        both: { viewport: 'overflow-auto' },
      } satisfies Record<Orientation, object>,
      axis: {
        y: {
          scrollbar: [
            'top-[var(--scroll-area-inset-start,var(--scroll-area-gap))]',
            'bottom-[var(--scroll-area-inset-end,var(--scroll-area-gap))]',
            'w-(--scroll-area-thickness) hover:w-[calc(var(--scroll-area-thickness)+2px)]',
            'data-dragging:w-[calc(var(--scroll-area-thickness)+2px)]',
          ],
          thumb:
            'inset-x-0 top-0 h-(--scroll-area-thumb-size) translate-y-(--scroll-area-thumb-offset)',
        },
        x: {
          scrollbar: [
            'start-[var(--scroll-area-inset-start,var(--scroll-area-gap))]',
            'end-[var(--scroll-area-inset-end,var(--scroll-area-gap))]',
            'h-(--scroll-area-thickness) hover:h-[calc(var(--scroll-area-thickness)+2px)]',
            'data-dragging:h-[calc(var(--scroll-area-thickness)+2px)]',
          ],
          thumb:
            'inset-y-0 start-0 w-(--scroll-area-thumb-size) translate-x-(--scroll-area-thumb-offset)',
        },
      } satisfies Record<Axis, object>,
      placement: { start: {}, end: {} } satisfies Record<Placement, object>,
      vertical: {
        start: { corner: 'start-(--scroll-area-gap)' },
        end: { corner: 'end-(--scroll-area-gap)' },
      } satisfies Record<Placement, object>,
      horizontal: {
        start: { corner: 'top-(--scroll-area-gap)' },
        end: { corner: 'bottom-(--scroll-area-gap)' },
      } satisfies Record<Placement, object>,
    },
    compoundVariants: [
      { axis: 'y', placement: 'end', class: { scrollbar: 'end-(--scroll-area-gap)' } },
      { axis: 'y', placement: 'start', class: { scrollbar: 'start-(--scroll-area-gap)' } },
      { axis: 'x', placement: 'end', class: { scrollbar: 'bottom-(--scroll-area-gap)' } },
      { axis: 'x', placement: 'start', class: { scrollbar: 'top-(--scroll-area-gap)' } },
    ],
    defaultVariants: {
      variant: 'hover',
      size: 'standard',
      scrolls: 'vertical',
      placement: 'end',
      vertical: 'end',
      horizontal: 'end',
    },
  });
}
