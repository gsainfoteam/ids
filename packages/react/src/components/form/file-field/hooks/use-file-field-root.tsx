'use client';

import { useCallback, useId, type DragEvent, type MouseEvent } from 'react';

import { FileRejectionContext } from '../context';
import { fileKey, isFile, isValidAccept } from '../lib/file-rules';
import { isType } from '../lib/is-type';
import { FileLimits, type FileFieldLimits } from '../parts/limits';
import { FileRejection } from '../parts/rejection';
import { filePartsStyle } from '../style';
import { useInternalFileField, type FileFieldValue } from './use-file-field';
import { FormValue } from '../../../../internal/parts/form-value';
import { flattenFragments, invariant, mergeRefs } from '../../../../utils';
import { useFieldSize } from '../../field/context';

import type { FileFieldProps, FileFieldState } from '../root';

export type FileFieldLook = 'field' | 'dropzone' | 'embedded';

const componentNameOf = (look: FileFieldLook): 'FileField' | 'FileDropzone' =>
  look === 'dropzone' ? 'FileDropzone' : 'FileField';

const joinIds = (...ids: Array<string | undefined | false>) =>
  ids.filter(Boolean).join(' ') || undefined;

export function useInternalFileFieldRoot(props: FileFieldProps, look: FileFieldLook) {
  const {
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    variant: _variant,
    size,
    invalid,
    maxSize,
    maxCount,
    onReject,
    placeholder,
    children,
    className: _className,
    style: _style,
    ref: forwardedRef,
    name,
    form,
    id: providedId,
    required = false,
    disabled = false,
    readOnly = false,
    onClick,
    onBlur,
    onFocus,
    onKeyDown,
    onDrop,
    onDragOver,
    autoFocus,
    tabIndex,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    'aria-required': _ariaRequired,
    ...native
  } = props;
  const owner = componentNameOf(look);
  invariant(
    maxSize === undefined || (Number.isFinite(maxSize) && maxSize >= 0),
    `${owner}: maxSize must be non-negative bytes.`,
  );
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    `${owner}: maxCount must be a non-negative integer.`,
  );

  const { rootRef, pickerRef, triggerRef, ...field } = useInternalFileField({
    multiple,
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: FileFieldValue) => void) | undefined,
    accept: native.accept,
    maxSize,
    maxCount,
    onReject,
    name,
    form,
    disabled,
    readOnly,
  });
  const { state: s, handlers } = field;
  invariant(
    multiple
      ? Array.isArray(s.value) && s.value.every(isFile)
      : s.value === null || isFile(s.value),
    `${owner}: single requires File | null; multiple requires File[].`,
  );
  invariant(isValidAccept(s.tokens), `${owner}: accept must contain MIME types or extensions.`);

  const setRoot = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
    },
    [rootRef],
  );

  const nodes = flattenFragments(children);
  const limitsParts = nodes.filter(isType(FileLimits));
  const rejectionPart = nodes.find(isType(FileRejection));
  const structure = nodes.filter((node) => !limitsParts.includes(node) && node !== rejectionPart);

  const uid = useId();
  const id = providedId ?? `ids-file-${uid}`;
  const errorId = `${id}-rejections`;
  const limitsId = `${id}-limits`;
  const limits: FileFieldLimits = {
    accept: s.tokens,
    maxSize,
    maxCount: multiple ? maxCount : undefined,
  };
  const listsRejections = !!rejectionPart && s.rejections.length > 0;
  const showsInvalid =
    s.rejections.length > 0 ? true : (ariaInvalid ?? invalid) === true || ariaInvalid === 'true';
  const state: FileFieldState = {
    dragging: s.dragging,
    disabled,
    readOnly,
    invalid: showsInvalid,
    required,
    empty: s.files.length === 0,
    multiple,
  };
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = filePartsStyle({ size: resolvedSize });

  const triggerProps = {
    ref: mergeRefs(triggerRef, forwardedRef),
    id,
    type: 'button',
    form,
    disabled,
    autoFocus,
    tabIndex,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': joinIds(
      ariaDescribedby,
      limitsParts.length > 0 && limitsId,
      listsRejections && errorId,
    ),
    'aria-invalid': s.rejections.length ? true : (ariaInvalid ?? (invalid || undefined)),
    'aria-disabled': readOnly || undefined,
    'data-field-input': look === 'field' ? '' : undefined,
    'data-dragging': s.dragging ? '' : undefined,
    'data-placeholder': state.empty ? '' : undefined,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) field.actions.openPicker();
    },
    onBlur,
    onFocus,
    onKeyDown,
  };

  const rootProps = {
    ref: setRoot,
    'data-dragging': s.dragging ? '' : undefined,
    ...(look !== 'embedded' && {
      'data-file-field': look === 'field' ? '' : undefined,
      'data-file-dropzone': look === 'dropzone' ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      'data-readonly': readOnly ? '' : undefined,
      'data-invalid': showsInvalid ? '' : undefined,
      'data-required': required ? '' : undefined,
      'data-empty': state.empty ? '' : undefined,
    }),
    onDragEnter: handlers.onDragEnter,
    onDragLeave: handlers.onDragLeave,
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      onDragOver?.(event);
      if (!event.defaultPrevented) handlers.onDragOver(event);
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      onDrop?.(event);
      if (event.defaultPrevented) handlers.onDragLeave(event);
      else handlers.onDrop(event);
    },
    onPaste: handlers.onPaste,
  };

  const picker = (
    <input
      {...native}
      ref={pickerRef}
      type="file"
      multiple={multiple}
      disabled={disabled}
      form={form}
      hidden
      tabIndex={-1}
      aria-hidden="true"
      onChange={handlers.onInputChange}
    />
  );

  const messages = (
    <>
      {listsRejections && (
        <div id={errorId} role="alert">
          <ul className={styles.rejections()}>
            {s.rejections.map((rejection) => (
              <FileRejectionContext key={fileKey(rejection.file)} value={rejection}>
                {rejectionPart}
              </FileRejectionContext>
            ))}
          </ul>
        </div>
      )}
      <FormValue
        form={form}
        value={s.files.map((file) => file.name)}
        required={required && !readOnly}
        disabled={disabled}
        anchor={triggerRef}
      />
    </>
  );

  return {
    context: {
      owner,
      field,
      state,
      size: resolvedSize,
      placeholder,
      limits,
      limitsId,
      triggerProps,
      styles,
    },
    rootProps,
    picker,
    messages,
    structure,
    limitsParts,
  };
}
