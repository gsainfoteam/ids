'use client';

import {
  useId,
  type ComponentProps,
  type CSSProperties,
  type DragEvent,
  type DragEventHandler,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { FileClear } from './clear';
import { FileContext } from './context';
import {
  describeLimits,
  fileKey,
  formatBytes,
  isFile,
  isValidAccept,
  type FileFieldRejection,
} from './file-rules';
import { isType } from './is-type';
import { FileList } from './list';
import { fileFieldStyle } from './style';
import { FileTrigger } from './trigger';
import { useFileField, type FileFieldValue } from './use-file-field';
import { FormValue } from '../../../internal/form-value';
import { resolveState } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import { flattenFragments, invariant, mergeRefs } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type FileFieldAppearance = 'field' | 'dropzone';
export type FileFieldVariant = 'outline' | 'soft' | 'ghost';

export type FileFieldState = {
  appearance: FileFieldAppearance;
  dragging: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  empty: boolean;
  multiple: boolean;
};

export type FileFieldItemState = { file: File; index: number };

type ButtonProps = 'onClick' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'ref';

type BaseProps = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'multiple'
  | 'onDrop'
  | 'onDragOver'
  | 'onDragEnter'
  | 'onDragLeave'
  | 'className'
  | 'style'
  | 'children'
  | 'placeholder'
  | ButtonProps
> &
  Pick<ComponentProps<'button'>, ButtonProps> & {
    appearance?: FileFieldAppearance;
    variant?: FileFieldVariant;
    size?: IdsSize;
    invalid?: boolean;
    maxSize?: number;
    maxCount?: number;
    onReject?: (rejections: FileFieldRejection[]) => void;
    onDrop?: DragEventHandler<HTMLDivElement>;
    onDragOver?: DragEventHandler<HTMLDivElement>;
    placeholder?: ReactNode;
    className?: string | ((state: FileFieldState) => string | undefined);
    style?: CSSProperties;
    children?: ReactNode;
  };

export type FileFieldProps = BaseProps &
  (
    | {
        multiple?: false;
        value?: File | null;
        defaultValue?: File | null;
        onValueChange?: (value: File | null) => void;
      }
    | {
        multiple: true;
        value?: File[];
        defaultValue?: File[];
        onValueChange?: (value: File[]) => void;
      }
  );

const joinIds = (...ids: Array<string | undefined | false>) =>
  ids.filter(Boolean).join(' ') || undefined;

export function FileFieldRoot(props: FileFieldProps) {
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
    children,
    className,
    style,
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
  const styles = fileFieldStyle({ appearance, variant, size: resolvedSize });

  const triggerProps = {
    // eslint-disable-next-line react-hooks/refs
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
    'data-field-input': appearance === 'field' ? '' : undefined,
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

  const nodes = flattenFragments(children);
  const triggers = nodes.filter(isType(FileTrigger));
  invariant(
    !nodes.length || triggers.length === 1,
    'FileField: explicit children require exactly one Trigger.',
  );
  const controls = nodes.filter((node) => isType(FileTrigger)(node) || isType(FileClear)(node));
  const others = nodes.filter((node) => !controls.includes(node));
  const composed = nodes.length
    ? { controls, others }
    : appearance === 'dropzone'
      ? { controls: [<FileTrigger key="trigger" />], others: [<FileList key="list" />] }
      : {
          controls: [<FileTrigger key="trigger" />, <FileClear key="clear" />],
          others: multiple ? [<FileList key="list" />] : [],
        };

  return (
    <FileContext
      value={{
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
      }}
    >
      <div
        ref={rootRef}
        data-file-field=""
        data-appearance={appearance}
        data-dragging={s.dragging ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-invalid={showsInvalid ? '' : undefined}
        data-required={required ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
        style={style}
        onDragEnter={handlers.onDragEnter}
        onDragLeave={handlers.onDragLeave}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          onDragOver?.(event);
          if (!event.defaultPrevented) handlers.onDragOver(event);
        }}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          onDrop?.(event);
          if (event.defaultPrevented) handlers.onDragLeave(event);
          else handlers.onDrop(event);
        }}
        onPaste={handlers.onPaste}
      >
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
        {appearance === 'field' ? (
          <div
            data-file-field-control=""
            data-invalid={showsInvalid ? '' : undefined}
            data-disabled={disabled ? '' : undefined}
            className={styles.control()}
          >
            {composed.controls}
          </div>
        ) : (
          composed.controls
        )}
        {composed.others}
        {announcesRequired && (
          <span id={requiredId} hidden>
            {t('fileField.required')}
          </span>
        )}
        {s.rejections.length > 0 && (
          <div id={errorId} role="alert" className={styles.rejections()}>
            {s.rejections.map(({ file, reason }) => (
              <div key={fileKey(file)}>
                {file.name}:{' '}
                {reason === 'type'
                  ? t('fileField.rejectType')
                  : reason === 'size'
                    ? t('fileField.rejectSize', { max: formatBytes(maxSize ?? 0) })
                    : t('fileField.rejectCount', { max: multiple ? (maxCount ?? 0) : 1 })}
              </div>
            ))}
          </div>
        )}
        <FormValue
          form={form}
          value={s.files.map((file) => file.name)}
          required={required && !readOnly}
          disabled={disabled}
          anchor={triggerRef}
        />
      </div>
    </FileContext>
  );
}
