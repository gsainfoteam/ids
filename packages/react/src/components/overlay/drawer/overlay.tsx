import { type ComponentProps } from 'react';

import { useDrawerContext } from './context';

export type DrawerOverlayProps = Omit<ComponentProps<'div'>, 'children'>;

export function DrawerOverlay(_props: DrawerOverlayProps) {
  useDrawerContext('Drawer.Overlay');
  return null;
}

DrawerOverlay.displayName = 'Drawer.Overlay';
