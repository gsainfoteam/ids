'use client';

import { isValidElement, useState, type ReactElement, type ReactNode } from 'react';

import { DialogContext } from './context';
import { DialogOverlay, type DialogOverlayProps } from './overlay';
import { dialogStyle } from './style';
import { useDialog } from './use-dialog';
import { flattenFragments } from '../../../utils';

import type { Dialog } from '.';

const isOverlay = (node: ReactNode): node is ReactElement<DialogOverlayProps> =>
  isValidElement(node) && node.type === DialogOverlay;

export function DialogRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  dismissible = true,
  role = 'dialog',
  hideClose = false,
  children,
}: Dialog.Props) {
  const dialog = useDialog({ open, defaultOpen, onOpenChange, onOpenChangeComplete, dismissible });

  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  const parts = flattenFragments(children);
  const overlay = parts.find(isOverlay);

  return (
    <DialogContext
      value={{
        dialog,
        role,
        dismissible,
        hideClose,
        overlay: overlay?.props,
        titled,
        setTitled,
        described,
        setDescribed,
        styles: dialogStyle(),
      }}
    >
      {parts.filter((node) => node !== overlay)}
    </DialogContext>
  );
}
