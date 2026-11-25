import type { SidebarControls } from '../context';
import type { SidebarCollapsibleMode, SidebarPanelState } from '../style';

export function panelStateOf(
  controls: SidebarControls,
  collapsible: SidebarCollapsibleMode | false,
): SidebarPanelState {
  if (!controls.collapsed) return 'expanded';
  return collapsible === 'icon' ? 'rail' : 'hidden';
}
