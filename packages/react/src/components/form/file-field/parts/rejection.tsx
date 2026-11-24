'use client';

import { use, type ComponentProps, type ReactNode } from 'react';

import { invariant } from '../../../../utils';
import { FileRejectionContext } from '../context';

import type { FileFieldRejection } from '../lib/file-rules';

export type FileRejectionProps = Omit<ComponentProps<'li'>, 'children'> & {
  children?: ReactNode | ((rejection: FileFieldRejection) => ReactNode);
};

export function FileRejection({ children, ...props }: FileRejectionProps) {
  const rejection = use(FileRejectionContext);
  invariant(rejection, 'FileField.Rejection must be a direct child of FileField or FileDropzone.');

  return (
    <li {...props} data-file-field-rejection="" data-reason={rejection.reason}>
      {typeof children === 'function' ? children(rejection) : children}
    </li>
  );
}

FileRejection.displayName = 'FileField.Rejection';
