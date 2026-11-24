'use client';

import { createContext, use, type ReactNode } from 'react';

import { invariant } from '../../../utils';

import type { FileFieldState } from '.';
import type { useInternalFileField } from './hooks/use-file-field';
import type { FileFieldRejection } from './lib/file-rules';
import type { FileFieldLimits } from './parts/limits';
import type { filePartsStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

type FileFieldContextValue = {
  owner: 'FileField' | 'FileDropzone';
  field: Omit<ReturnType<typeof useInternalFileField>, 'rootRef' | 'pickerRef' | 'triggerRef'>;
  state: FileFieldState;
  size: IdsSize;
  placeholder: ReactNode;
  limits: FileFieldLimits;
  limitsId: string;
  triggerProps: Record<string, unknown>;
  styles: ReturnType<typeof filePartsStyle>;
  triggerContent?: ReactNode;
};

export const FileContext = createContext<FileFieldContextValue | null>(null);
export const FileRowContext = createContext(false);
export const FileRejectionContext = createContext<FileFieldRejection | null>(null);

export function useInternalFile(part: string) {
  const context = use(FileContext);
  invariant(context, `${part} must be rendered inside FileField or FileDropzone.`);

  return context;
}
