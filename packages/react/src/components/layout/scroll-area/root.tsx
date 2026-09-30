'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  type ReactElement,
  type ReactNode,
} from 'react';

import { PlacementContext, ScrollAreaContext } from './context';
import { ScrollAreaCorner } from './corner';
import { axisOf, fadedAlong, orientationOf } from './orientation';
import { ScrollAreaScrollbar } from './scrollbar';
import { scrollAreaStyle } from './style';
import { useScrollArea } from './use-scroll-area';
import { ScrollAreaViewport } from './viewport';
import { resolveState } from '../../../internal/state-props';
import { elementTypeOf, flattenFragments, invariant, mergeProps, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { ScrollArea } from '.';
import type { Axis, Placement } from './geometry';

type DeclaredBar = {
  node: ReactElement<ScrollArea.ScrollbarProps>;
  axis: Axis;
  placement: Placement;
};

const AXES: Record<ScrollArea.Orientation, Axis[]> = {
  vertical: ['y'],
  horizontal: ['x'],
  both: ['y', 'x'],
};

const scrollsAlong = (axes: Record<Axis, boolean>): ScrollArea.Orientation => {
  if (axes.x && axes.y) return 'both';
  return axes.x ? 'horizontal' : 'vertical';
};

const isType =
  <P,>(type: unknown) =>
  (node: ReactNode): node is ReactElement<P> =>
    isValidElement(node) && elementTypeOf(node) === type;

function arrange(children: ReactNode, orientation: ScrollArea.Orientation | undefined) {
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
  const barsDeclaredOnly = orientation === undefined && declared.length > 0;
  const wanted = barsDeclaredOnly ? [] : AXES[orientation ?? 'vertical'];

  const missing: DeclaredBar[] = wanted
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

export function ScrollAreaRoot({
  variant = 'hover',
  size = 'standard',
  orientation,
  fade = false,
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

  const scrolls = scrollsAlong(layout.axes);

  const state: ScrollArea.State = {
    variant,
    size,
    orientation: scrolls,
    overflowX: area.overflow.x,
    overflowY: area.overflow.y,
    hovering: area.hovering,
    scrolling: area.scrolling,
    dragging: area.dragging !== null,
  };
  const styles = scrollAreaStyle({ size });

  const placeBar = (bar: DeclaredBar) => (
    <PlacementContext key={String(bar.node.key)} value={bar.placement}>
      {bar.node}
    </PlacementContext>
  );

  const faded = fadedAlong(fade, scrolls);

  const structure = (
    <ScrollAreaContext
      value={{ area, variant, size, scrolls, faded, placements: layout.placements }}
    >
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
    'data-orientation': scrolls,
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
