'use client';

import { type ComponentProps } from 'react';

import { useInternalDialogContext } from '../context';

export type DialogOverlayProps = Omit<ComponentProps<'div'>, 'children'>;

export function DialogOverlay(_props: DialogOverlayProps) {
  useInternalDialogContext('Dialog.Overlay');
  return null;
}

DialogOverlay.displayName = 'Dialog.Overlay';
