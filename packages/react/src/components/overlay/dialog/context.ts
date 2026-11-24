'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Dialog } from '.';
import type { useInternalDialog } from './hooks/use-dialog';
import type { dialogStyle } from './style';

type DialogContextValue = {
  dialog: ReturnType<typeof useInternalDialog>;
  role: Dialog.Role;
  dismissible: boolean;
  overlay: Dialog.Overlay.Props | undefined;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof dialogStyle>;
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useInternalDialogContext(part: string) {
  const context = use(DialogContext);
  invariant(context, `${part} must be rendered inside Dialog.`);
  return context;
}
