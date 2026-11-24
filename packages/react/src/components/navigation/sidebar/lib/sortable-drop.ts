import type { SidebarDrop } from './tree';
import type { CollisionDetection } from '@dnd-kit/core';

export const ITEM_SELECTOR = '[data-sidebar-item]';

export type PendingMove = { key: string; items: readonly unknown[]; focus: boolean };

export const rowAtThePointerHeight: CollisionDetection = ({
  droppableContainers,
  droppableRects,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) return [];
  const rows = droppableContainers.flatMap((container) => {
    const rect = droppableRects.get(container.id);
    return rect ? [{ id: container.id, rect }] : [];
  });
  const left = Math.min(...rows.map(({ rect }) => rect.left));
  const right = Math.max(...rows.map(({ rect }) => rect.right));
  const { x, y } = pointerCoordinates;
  if (x < left || x > right) return [];
  const row = rows.find(({ rect }) => y >= rect.top && y < rect.bottom);
  return row ? [{ id: row.id }] : [];
};

export const sameDrop = (a: SidebarDrop | null, b: SidebarDrop | null) =>
  a?.key === b?.key && a?.position === b?.position;
