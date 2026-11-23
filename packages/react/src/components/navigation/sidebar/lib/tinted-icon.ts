import { cloneElement, isValidElement, type ReactNode } from 'react';

import { sidebarStyle, type SidebarIconColorScheme } from '../style';

export function tintedIcon(icon: ReactNode, colorScheme: SidebarIconColorScheme | undefined) {
  if (!colorScheme || colorScheme === 'neutral') return icon;
  if (!isValidElement<{ className?: string }>(icon)) return icon;
  return cloneElement(icon, {
    className: sidebarStyle({ iconColor: colorScheme }).icon({ className: icon.props.className }),
  });
}
