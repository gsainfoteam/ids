import { coveredByKeyboard, visibleHeight, VIEWPORT_MARGIN } from '../../overlay';

const DRAWER_MAX_HEIGHT = 520;

export function placeSheet(popup: HTMLElement, win: Window) {
  Object.assign(popup.style, {
    top: 'auto',
    left: `${VIEWPORT_MARGIN}px`,
    right: `${VIEWPORT_MARGIN}px`,
    width: 'auto',
    bottom: `calc(max(${VIEWPORT_MARGIN}px, env(safe-area-inset-bottom)) + ${coveredByKeyboard(win)}px)`,
    maxHeight: `${Math.min(DRAWER_MAX_HEIGHT, visibleHeight(win) * 0.7)}px`,
  });
}
