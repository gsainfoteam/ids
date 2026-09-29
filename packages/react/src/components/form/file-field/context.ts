import { createContext, use, type ReactNode } from 'react';

import { invariant } from '../../../utils';

import type { FileFieldState } from '.';
import type { fileFieldStyle } from './style';
import type { useFileField } from './use-file-field';
import type { IdsSize } from '../../../tokens/types';

type FileFieldContextValue = {
  field: Omit<ReturnType<typeof useFileField>, 'rootRef' | 'pickerRef' | 'triggerRef'>;
  state: FileFieldState;
  size: IdsSize;
  placeholder: ReactNode;
  limits: string;
  limitsId: string;
  triggerProps: Record<string, unknown>;
  styles: ReturnType<typeof fileFieldStyle>;
};

export const FileContext = createContext<FileFieldContextValue | null>(null);
export const FileRowContext = createContext(false);

export function useFile(part: string) {
  const context = use(FileContext);
  invariant(context, `${part} must be rendered inside FileField.`);

  return context;
}
