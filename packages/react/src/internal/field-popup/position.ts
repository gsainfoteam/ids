export type PopupSide = 'top' | 'bottom';
export type PopupAlign = 'start' | 'end';

export type PlacePopupOptions = {
  anchor: { top: number; bottom: number; left: number; right: number };
  width: number;
  // The popup's full content height, not the height it is currently clipped to.
  height: number;
  viewport: { width: number; height: number };
  side: PopupSide;
  align: PopupAlign;
  rtl: boolean;
  offset: number;
  margin: number;
  maxHeight: number;
  minHeight: number;
};

export type PopupPlacement = { top: number; left: number; maxHeight: number; side: PopupSide };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

// The popup keeps the side it is on while its content still fits there, so a list that shrinks
// or grows while the user filters it does not jump across the trigger. It flips only when the
// other side has more room, and then shrinks to the room that side has. A popup that fits on
// neither side is still kept on screen, overlapping the trigger if it must.
export function placePopup(options: PlacePopupOptions): PopupPlacement {
  const { anchor, viewport, offset, margin } = options;
  const room = (side: PopupSide) =>
    side === 'bottom'
      ? viewport.height - anchor.bottom - offset - margin
      : anchor.top - offset - margin;
  const wanted = Math.min(options.height, options.maxHeight);
  const other: PopupSide = options.side === 'bottom' ? 'top' : 'bottom';
  const side =
    room(options.side) >= wanted || room(options.side) >= room(other) ? options.side : other;
  const maxHeight = Math.max(
    Math.min(options.minHeight, wanted),
    Math.min(options.maxHeight, room(side)),
  );
  const height = Math.min(options.height, maxHeight);
  const top = side === 'bottom' ? anchor.bottom + offset : anchor.top - offset - height;
  // `start` follows the reading direction: the popup's right edge meets the trigger's in RTL.
  const alignLeft = (options.align === 'start') !== options.rtl;
  const left = alignLeft ? anchor.left : anchor.right - options.width;
  return {
    side,
    maxHeight,
    top: clamp(top, margin, viewport.height - margin - height),
    left: clamp(left, margin, viewport.width - margin - options.width),
  };
}
