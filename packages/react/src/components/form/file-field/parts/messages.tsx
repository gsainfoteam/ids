'use client';

import type { ReactNode, RefObject } from 'react';

import { FormValue } from '../../../../internal/parts/form-value';
import { FileRejectionContext } from '../context';
import { fileKey, type FileFieldRejection } from '../lib/file-rules';

export type FileMessagesProps = {
  errorId: string;
  rejections: FileFieldRejection[];
  rejectionPart: ReactNode;
  rejectionsClassName: string;
  form: string | undefined;
  fileNames: string[];
  required: boolean;
  disabled: boolean;
  anchor: RefObject<HTMLButtonElement | null>;
};

export function FileMessages({
  errorId,
  rejections,
  rejectionPart,
  rejectionsClassName,
  form,
  fileNames,
  required,
  disabled,
  anchor,
}: FileMessagesProps) {
  return (
    <>
      {rejections.length > 0 && (
        <div id={errorId} role="alert">
          <ul className={rejectionsClassName}>
            {rejections.map((rejection) => (
              <FileRejectionContext key={fileKey(rejection.file)} value={rejection}>
                {rejectionPart}
              </FileRejectionContext>
            ))}
          </ul>
        </div>
      )}
      <FormValue
        form={form}
        value={fileNames}
        required={required}
        disabled={disabled}
        anchor={anchor}
      />
    </>
  );
}
