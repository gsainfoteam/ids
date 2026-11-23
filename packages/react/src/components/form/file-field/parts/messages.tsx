'use client';

import type { RefObject } from 'react';

import { FormValue } from '../../../../internal/parts/form-value';
import { useInternalTranslate } from '../../../../internal/translate';
import { fileKey, formatBytes, type FileFieldRejection } from '../lib/file-rules';

export type FileMessagesProps = {
  announcesRequired: boolean;
  requiredId: string;
  errorId: string;
  rejections: FileFieldRejection[];
  rejectionsClassName: string;
  maxSize: number | undefined;
  maxFiles: number;
  form: string | undefined;
  fileNames: string[];
  required: boolean;
  disabled: boolean;
  anchor: RefObject<HTMLButtonElement | null>;
};

export function FileMessages({
  announcesRequired,
  requiredId,
  errorId,
  rejections,
  rejectionsClassName,
  maxSize,
  maxFiles,
  form,
  fileNames,
  required,
  disabled,
  anchor,
}: FileMessagesProps) {
  const t = useInternalTranslate();

  return (
    <>
      {announcesRequired && (
        <span id={requiredId} hidden>
          {t('fileField.required')}
        </span>
      )}
      {rejections.length > 0 && (
        <div id={errorId} role="alert">
          <ul className={rejectionsClassName}>
            {rejections.map(({ file, reason }) => (
              <li key={fileKey(file)}>
                {file.name}:{' '}
                {reason === 'type'
                  ? t('fileField.rejectType')
                  : reason === 'size'
                    ? t('fileField.rejectSize', { max: formatBytes(maxSize ?? 0) })
                    : t('fileField.rejectCount', { max: maxFiles })}
              </li>
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
