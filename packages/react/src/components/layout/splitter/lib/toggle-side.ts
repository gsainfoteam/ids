import type { SplitterToggleSide } from '../style';

export function sideLeftOpen(toggle: { collapsed: boolean; before: boolean }): SplitterToggleSide {
  if (!toggle.collapsed) return 'center';
  return toggle.before ? 'after' : 'before';
}
