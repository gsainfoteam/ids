'use client';

import { type ComponentProps } from 'react';

import { useInternalDrawerContext } from '../context';

export type DrawerOverlayProps = Omit<ComponentProps<'div'>, 'children'>;

export function DrawerOverlay(_props: DrawerOverlayProps) {
  useInternalDrawerContext('Drawer.Overlay');
  return null;
}

DrawerOverlay.displayName = 'Drawer.Overlay';
