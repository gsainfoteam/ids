'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { flushSync } from 'react-dom';

import {
  GRIP_HALO,
  GRIP_STROKE,
  GRIP_TARGET,
  gripArc,
  type GripArc,
  type GripPlacement,
} from './arc';
import { axisSeparatorProps, type ResizeAxis, type ResizeDimension } from './axis';
import { resizeGripStyle } from './style';
import {
  axisKeyMap,
  readingDirection,
  useAxesDrag,
  useAxisSeparator,
  useCornerRadius,
  type AxesDragOptions,
} from './use-resize-axes';
import { invariant, mergeProps, part } from '../../utils';
import { keyHandler, type KeyMap } from '../keys';
import { useTranslate } from '../translate';

export type ResizeGripProps = Omit<ComponentProps<'div'>, 'children'> & {
  axes: readonly ResizeAxis[];
  corner: HTMLElement | null;
  placement: GripPlacement;
  disabled?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  asChild?: boolean;
  children?: ReactNode;
};

type GripProps = Omit<
  ResizeGripProps,
  'axes' | 'corner' | 'placement' | 'disabled' | 'onDraggingChange'
> & {
  drag: AxesDragOptions;
  arc: GripArc | null;
};

type Styles = ReturnType<typeof resizeGripStyle>;

const HALO_WIDTH = GRIP_STROKE + 2 * GRIP_HALO;

const isCustom = ({ asChild, children }: Pick<GripProps, 'asChild' | 'children'>) =>
  asChild === true || children != null;

function sized(style: CSSProperties | undefined, arc: GripArc | null) {
  return arc ? { ...style, width: arc.size, height: arc.size } : style;
}

function Arc({ arc, styles }: { arc: GripArc; styles: Styles }) {
  return (
    <svg
      aria-hidden="true"
      width={arc.view}
      height={arc.view}
      viewBox={`0 0 ${arc.view} ${arc.view}`}
      fill="none"
      className={styles.drawing()}
      style={{ top: -arc.bleed, left: -arc.bleed }}
    >
      <path
        d={arc.arc}
        strokeWidth={HALO_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-resize-grip-halo=""
        className={styles.halo()}
      />
      <path
        d={arc.arc}
        strokeWidth={GRIP_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-resize-grip-arc=""
        className={styles.arc()}
      />
      <path
        d={arc.target}
        stroke="transparent"
        strokeWidth={GRIP_TARGET}
        pointerEvents="stroke"
        data-resize-grip-target=""
        className={styles.target()}
      />
    </svg>
  );
}

function OneAxisGrip({
  axis,
  drag,
  arc,
  asChild = false,
  className,
  style,
  children,
  ...props
}: GripProps & { axis: ResizeAxis }) {
  const separator = useAxisSeparator(axis, drag);
  const styles = resizeGripStyle({
    axes: axis.dimension === 'width' ? 'inline' : 'block',
    custom: isCustom({ asChild, children }),
  });

  return part(
    'div',
    asChild,
    children ?? (arc && <Arc arc={arc} styles={styles} />),
    mergeProps(props, {
      ...separator,
      'aria-label': props['aria-label'] ?? separator['aria-label'],
      'data-resize-grip': '',
      className: styles.grip({ className }),
      style: sized(style, arc),
    }),
  );
}

function TwoAxisGrip({
  axes,
  drag: options,
  arc,
  asChild = false,
  className,
  style,
  children,
  ...props
}: GripProps & { axes: readonly ResizeAxis[] }) {
  const t = useTranslate();
  const drag = useAxesDrag(axes, options);
  const [focusedAxis, setFocusedAxis] = useState<ResizeDimension>(axes[0]!.dimension);
  const separators = useRef(new Map<ResizeDimension, HTMLElement>());
  const styles = resizeGripStyle({ axes: 'both', custom: isCustom({ asChild, children }) });
  const { disabled } = options;

  const resizeAndFocus = (axis: ResizeAxis) => (size: number) => {
    flushSync(() => {
      axis.resize(size);
      setFocusedAxis(axis.dimension);
    });
    separators.current.get(axis.dimension)?.focus();
  };

  const keysOn = (focused: ResizeAxis): KeyMap<HTMLElement> => ({
    ...Object.assign(
      {},
      ...axes
        .filter((axis) => axis !== focused)
        .map((axis) => axisKeyMap(axis, resizeAndFocus(axis))),
    ),
    ...axisKeyMap(focused, resizeAndFocus(focused)),
    Enter: () => {
      for (const axis of axes) axis.reset();
    },
  });

  const hiddenSeparators = axes.map((axis) => (
    <div
      key={axis.dimension}
      ref={(node) => {
        if (node) separators.current.set(axis.dimension, node);
        return () => {
          separators.current.delete(axis.dimension);
        };
      }}
      {...axisSeparatorProps(axis, t, disabled)}
      tabIndex={disabled ? undefined : axis.dimension === focusedAxis ? 0 : -1}
      className={styles.separator()}
      onFocus={() => setFocusedAxis(axis.dimension)}
      onKeyDown={(event) => {
        if (!disabled) keyHandler(keysOn(axis), readingDirection(event.currentTarget))(event);
      }}
    />
  ));

  const group = mergeProps(props, {
    ...drag.dragProps,
    role: 'group',
    'aria-label': props['aria-label'] ?? t('resizable.handle'),
    'aria-disabled': disabled || undefined,
    'data-resize-grip': '',
    'data-disabled': disabled ? '' : undefined,
    className: styles.grip({ className }),
    style: sized(style, arc),
  });

  if (!asChild)
    return (
      <div {...group}>
        {children ?? (arc && <Arc arc={arc} styles={styles} />)}
        {hiddenSeparators}
      </div>
    );

  invariant(
    isValidElement<{ children?: ReactNode }>(children) && children.type !== Fragment,
    '`asChild` on a resize grip requires one element to draw the grip.',
  );
  const drawn = children as ReactElement<{ children?: ReactNode }>;
  return cloneElement(
    drawn,
    mergeProps(drawn.props as Record<string, unknown>, group),
    drawn.props.children,
    ...hiddenSeparators,
  );
}

export function ResizeGrip({
  axes,
  corner,
  placement,
  disabled = false,
  onDraggingChange,
  ...props
}: ResizeGripProps) {
  const [first] = axes;
  invariant(first, 'A resize grip needs at least one axis to resize.');

  const radius = useCornerRadius(corner);
  const arc = radius === null || isCustom(props) ? null : gripArc(radius, placement);
  const drag = { disabled, onDraggingChange };

  if (axes.length === 1) return <OneAxisGrip {...props} axis={first} drag={drag} arc={arc} />;
  return <TwoAxisGrip {...props} axes={axes} drag={drag} arc={arc} />;
}
