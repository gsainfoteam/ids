'use client';

import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';

import { normalizeProps, useMachine } from '@zag-js/react';
import { connect, machine, type PanelData } from '@zag-js/splitter';
import { isEqual } from 'es-toolkit';
import { flushSync } from 'react-dom';

import {
  fillSizes,
  handleRange,
  isCollapsed,
  keyTarget,
  moveHandle,
  type PanelConstraints,
} from './layout';
import { keyHandler } from '../../../internal/keys';
import {
  readingDirection,
  resizeKeyMap,
  separatorOrientation,
  separatorProps,
  type ResizeDelta,
  type UseResizeDragOptions,
} from '../../../internal/resize-handle';
import { useTranslate } from '../../../internal/translate';

export type SplitterOrientation = 'horizontal' | 'vertical';

export type SplitterPanelSpec = {
  id?: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
};

export type UseSplitterOptions = {
  id?: string;
  orientation: SplitterOrientation;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  panels: readonly SplitterPanelSpec[];
  handleIds: ReadonlyArray<string | undefined>;
};

type Gesture = { from: readonly number[]; reported: number[] | null };

type Drag = { from: readonly number[]; length: number };

const constraintsOf = (spec: SplitterPanelSpec): PanelConstraints => ({
  minSize: spec.minSize ?? 0,
  maxSize: spec.maxSize ?? 100,
  collapsible: spec.collapsible ?? false,
  collapsedSize: spec.collapsedSize ?? 0,
});

const zagPanelOf = (spec: SplitterPanelSpec, index: number): PanelData => ({
  id: String(index),
  minSize: spec.minSize,
  maxSize: spec.maxSize,
  collapsible: spec.collapsible,
  collapsedSize: spec.collapsedSize,
});

const triggerIdOf = (handle: number) => `${handle}:${handle + 1}` as const;

type StoredLayout = { count: number; initial: number[]; sizes: number[] };

function useLayout(
  value: number[] | undefined,
  defaultValue: number[] | undefined,
  panels: readonly SplitterPanelSpec[],
  onValueChange: ((value: number[]) => void) | undefined,
) {
  const count = panels.length;
  const resolveDefault = (): StoredLayout => {
    const initial = fillSizes(defaultValue ?? panels.map((panel) => panel.defaultSize), count);
    return { count, initial, sizes: initial };
  };
  const [stored, setStored] = useState(resolveDefault);

  let current = stored;
  if (stored.count !== count) {
    current = resolveDefault();
    setStored(current);
  }

  const change = (next: number[]) => {
    if (value === undefined) setStored((previous) => ({ ...previous, sizes: next }));
    onValueChange?.(next);
  };

  return {
    sizes: value === undefined ? current.sizes : fillSizes(value, count),
    initial: current.initial,
    change,
  };
}

export function useSplitter({
  id,
  orientation,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  panels,
  handleIds,
}: UseSplitterOptions) {
  const t = useTranslate();
  const generatedId = useId();
  const baseId = id ?? `splitter-${generatedId}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const horizontal = orientation === 'horizontal';
  const handleLine = separatorOrientation(horizontal ? 'width' : 'height');
  const constraints = panels.map(constraintsOf);
  const layout = useLayout(value, defaultValue, panels, onValueChange);
  const { sizes } = layout;

  const renderBeforeTheNextEvent = (size: number[]) => {
    if (gesture.current) gesture.current.reported = size;
    flushSync(() => layout.change(size));
  };

  const service = useMachine(machine, {
    id: generatedId,
    ids: {
      root: baseId,
      panel: (panel) => panels[Number(panel)]?.id ?? `${baseId}-panel-${panel}`,
      resizeTrigger: (trigger) => {
        const handle = Number(trigger.split(':')[0]);
        return handleIds[handle] ?? `${baseId}-handle-${handle}`;
      },
    },
    orientation,
    panels: panels.map(zagPanelOf),
    size: sizes,
    onResize: ({ size }) => renderBeforeTheNextEvent(size),
  });
  const api = connect(service, normalizeProps);

  const collapsed = constraints.map((panel, index) => isCollapsed(panel, sizes[index] ?? 0));
  const panelProps = constraints.map((_, index) => api.getPanelProps({ id: String(index) }));

  const beginGesture = () => {
    gesture.current ??= { from: sizes, reported: null };
  };

  const endGesture = () => {
    const ended = gesture.current;
    gesture.current = null;
    if (ended?.reported && !isEqual(ended.reported, ended.from)) onValueCommit?.(ended.reported);
  };

  const settle = (change: () => void) => {
    beginGesture();
    change();
    queueMicrotask(endGesture);
  };

  const lengthThePanelsShare = () => {
    const root = rootRef.current;
    if (!root) return 0;
    return [...root.querySelectorAll<HTMLElement>(':scope > [data-splitter-panel]')].reduce(
      (total, element) => {
        const box = element.getBoundingClientRect();
        return total + (horizontal ? box.width : box.height);
      },
      0,
    );
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(null);
  };

  const putBack = (from: readonly number[]) => {
    const current = api.getSizes();
    const samePanels = current.length === from.length;
    if (samePanels && !isEqual(current, from)) api.setSizes([...from]);
  };

  const collapsibleAround = (handle: number) => {
    if (constraints[handle]?.collapsible) return handle;
    if (constraints[handle + 1]?.collapsible) return handle + 1;
    return null;
  };

  const togglePanel = (panel: number) => {
    const panelId = String(panel);
    if (isCollapsed(constraints[panel]!, api.getSizes()[panel] ?? 0)) api.expandPanel(panelId);
    else api.collapsePanel(panelId);
  };

  const resetLayout = () => api.setSizes([...layout.initial]);

  const moveHandleTo = (handle: number, from: readonly number[], target: number) => {
    const next = moveHandle(from, constraints, handle, target - from[handle]!);
    if (next) api.setSizes(next);
  };

  const onHandleKeyDown = (handle: number) => (event: KeyboardEvent<HTMLElement>) => {
    const length = lengthThePanelsShare();
    if (length <= 0) return;

    const range = handleRange(sizes, constraints, handle);
    const stepBy = (px: number) =>
      moveHandleTo(handle, sizes, keyTarget(sizes, constraints, handle, (px * 100) / length));
    const toggleNearest = () => {
      const panel = collapsibleAround(handle);
      if (panel === null) return false;
      togglePanel(panel);
    };

    const acted = keyHandler(
      {
        ...resizeKeyMap<HTMLElement>(
          handleLine,
          { value: range.now, min: range.min, max: range.max },
          (size) => moveHandleTo(handle, sizes, size),
          stepBy,
        ),
        Enter: toggleNearest,
      },
      readingDirection(event.currentTarget),
    )(event);
    if (acted) beginGesture();
  };

  const handle = (index: number) => {
    const {
      style: _zagInlineStyle,
      dir: _zagDefaultsToLtr,
      onPointerDown: _zagDragIgnoresRtl,
      onPointerUp: _zagDragEnd,
      onPointerOver: _zagHoverDelay,
      onPointerLeave: _zagHoverEnd,
      onKeyDown: _zagKeysMoveOnePercentWithAnyModifier,
      onBlur: zagBlur,
      ...attributes
    } = api.getResizeTriggerProps({ id: triggerIdOf(index) });
    const range = handleRange(sizes, constraints, index);
    const now = Math.round(range.now);
    const target = collapsibleAround(index);

    const moveBy = ({ inline, block }: ResizeDelta) => {
      const started = drag.current;
      if (!started || started.length <= 0) return;
      const px = horizontal ? inline : block;
      moveHandleTo(index, started.from, started.from[index]! + (px * 100) / started.length);
    };

    const dragOptions: UseResizeDragOptions = {
      axes: horizontal ? 'inline' : 'block',
      onStart: (element) => {
        element.focus({ preventScroll: true });
        drag.current = { from: sizes, length: lengthThePanelsShare() };
        setDragging(index);
        beginGesture();
      },
      onMove: moveBy,
      onEnd: (delta) => {
        settle(() => moveBy(delta));
        endDrag();
      },
      onCancel: () => {
        if (drag.current) putBack(drag.current.from);
        gesture.current = null;
        endDrag();
      },
      onReset: () => settle(resetLayout),
    };

    return {
      props: {
        ...attributes,
        ...separatorProps({
          orientation: handleLine,
          value: now,
          min: Math.round(range.min),
          max: Math.round(range.max),
          valueText: collapsed[index]
            ? t('splitter.collapsed')
            : t('splitter.value', { value: now }),
          controls: panelProps[index]?.id,
        }),
        'aria-label': t('splitter.handle'),
        'data-splitter-handle': '',
        onKeyDown: onHandleKeyDown(index),
        onKeyUp: endGesture,
        onBlur: (event: FocusEvent<HTMLElement>) => {
          zagBlur?.(event);
          endGesture();
        },
      },
      toggle:
        target === null
          ? null
          : {
              collapsed: collapsed[target] ?? false,
              before: target === index,
              label: collapsed[target] ? t('splitter.expand') : t('splitter.collapse'),
              controls: panelProps[target]?.id,
              onClick: () => settle(() => togglePanel(target)),
            },
      drag: dragOptions,
    };
  };

  const panel = (index: number) => {
    const { style: _zagFlexStyle, dir: _zagDefaultsToLtr, ...attributes } = panelProps[index]!;
    const size = sizes[index] ?? 0;

    return {
      props: {
        ...attributes,
        'data-splitter-panel': '',
        'data-collapsed': collapsed[index] ? '' : undefined,
        'data-dragging': dragging === null ? undefined : '',
        inert: size <= 0 || undefined,
      },
      size,
    };
  };

  const { style: _zagRootStyle, dir: _zagRootDir, ...rootAttributes } = api.getRootProps();

  return {
    rootRef,
    rootProps: {
      ...rootAttributes,
      'data-splitter': '',
      'data-dragging': dragging === null ? undefined : '',
    },
    sizes,
    dragging,
    panel,
    handle,
  };
}
