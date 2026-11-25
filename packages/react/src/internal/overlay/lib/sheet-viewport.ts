export type PopupPresentation = 'popover' | 'drawer';

export const DRAWER_BELOW = 640;
export const SMALL_SCREEN = `(max-width: ${DRAWER_BELOW - 0.02}px)`;

export function coveredByKeyboard(win: Window) {
  const visual = win.visualViewport;
  return visual ? Math.max(0, win.innerHeight - visual.height - visual.offsetTop) : 0;
}

export function visibleHeight(win: Window) {
  return win.visualViewport?.height ?? win.innerHeight;
}

export function onViewportChange(win: Window, change: () => void) {
  win.addEventListener('resize', change);
  win.visualViewport?.addEventListener('resize', change);
  win.visualViewport?.addEventListener('scroll', change);

  return () => {
    win.removeEventListener('resize', change);
    win.visualViewport?.removeEventListener('resize', change);
    win.visualViewport?.removeEventListener('scroll', change);
  };
}
