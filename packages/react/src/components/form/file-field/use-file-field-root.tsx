'use client';

import { useCallback, useId, type DragEvent, type MouseEvent } from 'react';

import { describeLimits, fileKey, formatBytes, isFile, isValidAccept } from './file-rules';
import { fileFieldStyle } from './style';
import { useFileField, type FileFieldValue } from './use-file-field';
import { FormValue } from '../../../internal/form-value';
import { useTranslate } from '../../../internal/translate';
import { invariant, mergeRefs } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { FileFieldProps, FileFieldState } from './root';

export type FileFieldPlacement = 'standalone' | 'embedded';

const joinIds = (...ids: Array<string | undefined | false>) =>
  ids.filter(Boolean).join(' ') || undefined;

export function useFileFieldRoot(props: FileFieldProps, placement: FileFieldPlacement) {
  const t = useTranslate();

  const {
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    appearance = 'field',
    variant = 'outline',
    size,
    invalid,
    maxSize,
    maxCount,
    onReject,
    placeholder,
    children: _children,
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
    'aria-required': ariaRequired,
    ...native
  } = props;
  invariant(
    maxSize === undefined || (Number.isFinite(maxSize) && maxSize >= 0),
    'FileField: maxSize must be non-negative bytes.',
  );
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    'FileField: maxCount must be a non-negative integer.',
  );

  const { rootRef, pickerRef, triggerRef, ...field } = useFileField({
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
    'FileField: single requires File | null; multiple requires File[].',
  );
  invariant(isValidAccept(s.tokens), 'FileField: accept must contain MIME types or extensions.');

  const setRoot = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
    },
    [rootRef],
  );

  const uid = useId();
  const id = providedId ?? `ids-file-${uid}`;
  const errorId = `${id}-rejections`;
  const limitsId = `${id}-limits`;
  const requiredId = `${id}-required`;
  const announcesRequired =
    ariaRequired === undefined ? required : ariaRequired === true || ariaRequired === 'true';
  const limits = describeLimits(
    {
      tokens: s.tokens,
      maxSize,
      maxCount: multiple ? maxCount : undefined,
    },
    t,
  );
  const showsInvalid =
    s.rejections.length > 0 ? true : (ariaInvalid ?? invalid) === true || ariaInvalid === 'true';
  const state: FileFieldState = {
    appearance,
    dragging: s.dragging,
    disabled,
    readOnly,
    invalid: showsInvalid,
    required,
    empty: s.files.length === 0,
    multiple,
  };
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const embedded = placement === 'embedded';
  const styles = fileFieldStyle({
    appearance: embedded ? 'embedded' : appearance,
    variant,
    size: resolvedSize,
  });
  const triggerIsTheField = appearance === 'field' && !embedded;

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
      appearance === 'dropzone' && !!limits && limitsId,
      s.rejections.length > 0 && errorId,
      announcesRequired && requiredId,
    ),
    'aria-invalid': s.rejections.length ? true : (ariaInvalid ?? (invalid || undefined)),
    'aria-disabled': readOnly || undefined,
    'data-field-input': triggerIsTheField ? '' : undefined,
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
    'data-file-field': embedded ? undefined : '',
    'data-appearance': embedded ? undefined : appearance,
    'data-dragging': s.dragging ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    'data-readonly': readOnly ? '' : undefined,
    'data-invalid': showsInvalid ? '' : undefined,
    'data-required': required ? '' : undefined,
    'data-empty': state.empty ? '' : undefined,
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
      {announcesRequired && (
        <span id={requiredId} hidden>
          {t('fileField.required')}
        </span>
      )}
      {s.rejections.length > 0 && (
        <div id={errorId} role="alert">
          <ul className={styles.rejections()}>
            {s.rejections.map(({ file, reason }) => (
              <li key={fileKey(file)}>
                {file.name}:{' '}
                {reason === 'type'
                  ? t('fileField.rejectType')
                  : reason === 'size'
                    ? t('fileField.rejectSize', { max: formatBytes(maxSize ?? 0) })
                    : t('fileField.rejectCount', { max: multiple ? (maxCount ?? 0) : 1 })}
              </li>
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
      field,
      state,
      size: resolvedSize,
      placeholder:
        placeholder ??
        (appearance === 'dropzone' ? t('fileField.dropzone') : t('fileField.placeholder')),
      limits,
      limitsId,
      triggerProps,
      styles,
    },
    rootProps,
    picker,
    messages,
  };
}
