import { type ComponentProps } from 'react';

import { useDialogContext } from './context';

export type DialogOverlayProps = Omit<ComponentProps<'div'>, 'children'>;

export function DialogOverlay(_props: DialogOverlayProps) {
  useDialogContext('Dialog.Overlay');
  return null;
}

DialogOverlay.displayName = 'Dialog.Overlay';
