'use client';

import { use, useEffect, useState, type FocusEvent, type ReactNode, type RefCallback } from 'react';

import { useDraggable, useDroppable } from '@dnd-kit/core';

import { swallowTheSpaceKeyupThatWouldPress } from '../../../../internal/lib/drag-surface';
import { keyHandler } from '../../../../internal/lib/keys';
import { mergeRefs } from '../../../../utils';
import { SidebarFoldedContext, type SidebarSortableValue } from '../context';

type DragFrameOptions = {
  dragKey: string;
  sortable: SidebarSortableValue;
  preview: ReactNode;
};

const pressSpace = (action: () => void) => () => {
  swallowTheSpaceKeyupThatWouldPress();
  action();
};

export function useInternalSidebarDragFrame({ dragKey, sortable, preview }: DragFrameOptions) {
  const folded = use(SidebarFoldedContext);
  const drag = useDraggable({ id: dragKey, disabled: folded });
  const dropZone = useDroppable({ id: dragKey, disabled: folded });
  const [element, setElement] = useState<HTMLElement | null>(null);
  const ref: RefCallback<HTMLDivElement> = mergeRefs(
    drag.setNodeRef,
    dropZone.setNodeRef,
    setElement,
  );
  const drop = sortable.drop?.key === dragKey ? sortable.drop.position : undefined;
  const grabbed = sortable.grabbed === dragKey;
  const { register } = sortable;

  useEffect(() => {
    if (element) return register(dragKey, { element, preview, folded });
  }, [register, dragKey, element, preview, folded]);

  const onKeyDownCapture = keyHandler<HTMLDivElement>(
    grabbed
      ? {
          ArrowUp: () => sortable.step(-1),
          ArrowDown: () => sortable.step(1),
          Enter: () => sortable.release(),
          Space: pressSpace(sortable.release),
          Escape: () => sortable.cancel(),
        }
      : { Space: pressSpace(() => sortable.grab(dragKey)) },
  );

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (grabbed && !event.currentTarget.contains(event.relatedTarget)) sortable.cancel();
  };

  return {
    ref,
    listeners: drag.listeners,
    dragging: drag.isDragging || grabbed,
    drop,
    onKeyDownCapture,
    onBlur,
  };
}
