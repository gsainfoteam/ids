'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Dialog } from '.';
import type { dialogStyle } from './style';
import type { useDialog } from './use-dialog';

type DialogContextValue = {
  dialog: ReturnType<typeof useDialog>;
  role: Dialog.Role;
  dismissible: boolean;
  hideClose: boolean;
  overlay: Dialog.Overlay.Props | undefined;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof dialogStyle>;
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(part: string) {
  const context = use(DialogContext);
  invariant(context, `${part} must be rendered inside Dialog.`);
  return context;
}
