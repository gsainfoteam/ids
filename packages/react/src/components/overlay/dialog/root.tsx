'use client';

import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { DialogContext } from './context';
import { useInternalDialog } from './hooks/use-dialog';
import { useInternalDialogLabelling } from './hooks/use-dialog-labelling';
import { DialogOverlay, type DialogOverlayProps } from './parts/overlay';
import { dialogStyle } from './style';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Dialog } from '.';

const isOverlay = (node: ReactNode): node is ReactElement<DialogOverlayProps> =>
  isValidElement(node) && elementTypeOf(node) === DialogOverlay;

export function DialogRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  dismissible = true,
  role = 'dialog',
  children,
}: Dialog.Props) {
  const dialog = useInternalDialog({
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    dismissible,
  });

  const labelling = useInternalDialogLabelling();

  const parts = flattenFragments(children);
  const overlay = parts.find(isOverlay);

  return (
    <DialogContext
      value={{
        dialog,
        role,
        dismissible,
        overlay: overlay?.props,
        ...labelling,
        styles: dialogStyle(),
      }}
    >
      {parts.filter((node) => node !== overlay)}
    </DialogContext>
  );
}
