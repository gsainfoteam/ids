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

import { GRIP_HALO, GRIP_STROKE, GRIP_TARGET, gripArc, type GripArc, type ResizeBand } from './arc';
import { axisSeparatorProps, type ResizeAxis, type ResizeDimension } from './axis';
import { resizeGripStyle } from './style';
import { axisKeyMap, readingDirection, useAxesDrag, useCornerRadius } from './use-resize-axes';
import { invariant, mergeProps } from '../../utils';
import { keyHandler, type KeyMap } from '../keys';
import { useTranslate } from '../translate';

export type ResizeGripProps = Omit<ComponentProps<'div'>, 'children'> & {
  axes: readonly [ResizeAxis, ResizeAxis];
  corner: HTMLElement | null;
  band?: ResizeBand;
  disabled?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  asChild?: boolean;
  children?: ReactNode;
};

type Styles = ReturnType<typeof resizeGripStyle>;

const HALO_WIDTH = GRIP_STROKE + 2 * GRIP_HALO;

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

export function ResizeGrip({
  axes,
  corner,
  band = 'centered',
  disabled = false,
  onDraggingChange,
  asChild = false,
  className,
  style,
  children,
  ...props
}: ResizeGripProps) {
  const t = useTranslate();
  const custom = asChild || children != null;
  const radius = useCornerRadius(corner);
  const arc = radius === null || custom ? null : gripArc(radius, band);
  const drag = useAxesDrag(axes, { disabled, onDraggingChange });
  const [focusedAxis, setFocusedAxis] = useState<ResizeDimension>(axes[0].dimension);
  const separators = useRef(new Map<ResizeDimension, HTMLElement>());
  const styles = resizeGripStyle({ custom });

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
