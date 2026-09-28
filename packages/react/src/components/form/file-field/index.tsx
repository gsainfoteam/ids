import {
  createContext,
  isValidElement,
  use,
  useId,
  type ComponentProps,
  type CSSProperties,
  type DragEvent,
  type DragEventHandler,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ArrowUpTrayIcon, DocumentIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/16/solid';

import {
  describeLimits,
  fileKey,
  formatBytes,
  isFile,
  isValidAccept,
  type FileFieldRejection,
} from './file-rules';
import { useFileField, usePreviewUrl, type FileFieldValue } from './use-file-field';
import { fieldTrigger, fieldAction } from '../../../internal/field-surface';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { resolveState } from '../../../internal/state-props';
import { cn, flattenFragments, invariant, mergeProps, mergeRefs, part, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { Item } from '../../data/item';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { FileFieldRejection } from './file-rules';

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

type Context = {
  field: Omit<ReturnType<typeof useFileField>, 'rootRef' | 'pickerRef' | 'triggerRef'>;
  state: FileFieldState;
  size: IdsSize;
  placeholder: ReactNode;
  limits: string;
  limitsId: string;
  triggerProps: Record<string, unknown>;
  styles: ReturnType<typeof FileField.Style>;
};

const FileContext = createContext<Context | null>(null);
const FileRowContext = createContext(false);

function useFile(part: string) {
  const context = use(FileContext);
  invariant(context, `${part} must be rendered inside FileField.`);
  return context;
}

const isType = (type: unknown) => (node: ReactNode) => isValidElement(node) && node.type === type;

const joinIds = (...ids: Array<string | undefined | false>) =>
  ids.filter(Boolean).join(' ') || undefined;

const alreadyDimmedByField = cn('data-disabled:opacity-100');

export function FileField(props: FileFieldProps) {
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
  const limits = describeLimits({
    tokens: s.tokens,
    maxSize,
    maxCount: multiple ? maxCount : undefined,
  });
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
  const styles = FileField.Style({ appearance, variant, size: resolvedSize });

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
    ),
    'aria-invalid': s.rejections.length ? true : (ariaInvalid ?? (invalid || undefined)),
    'aria-required': ariaRequired ?? (required || undefined),
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
          (appearance === 'dropzone'
            ? messages.fileField.dropzone
            : messages.fileField.placeholder),
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
        {s.rejections.length > 0 && (
          <div id={errorId} role="alert" className={styles.rejections()}>
            {s.rejections.map(({ file, reason }) => (
              <div key={fileKey(file)}>
                {file.name}:{' '}
                {reason === 'type'
                  ? messages.fileField.rejectType
                  : reason === 'size'
                    ? messages.fileField.rejectSize(formatBytes(maxSize ?? 0))
                    : messages.fileField.rejectCount(multiple ? (maxCount ?? 0) : 1)}
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

function FileTrigger({ asChild, children, className, ...props }: FileField.TriggerProps) {
  const c = useFile('FileField.Trigger');
  invariant(
    !flattenFragments(children).some(
      (node) => isType(FileClear)(node) || isType(FileList)(node) || isType(FileItem)(node),
    ),
    'FileField: Clear/List/Item must be siblings of Trigger.',
  );
  const { files } = c.field.state;
  const content =
    c.state.appearance === 'dropzone' ? (
      <>
        <ArrowUpTrayIcon aria-hidden="true" className={c.styles.dropzoneIcon()} />
        <span className={c.styles.dropzoneTitle()}>
          {c.state.dragging ? messages.fileField.dropzoneActive : c.placeholder}
        </span>
        {c.limits && (
          <span id={c.limitsId} className={c.styles.dropzoneHint()}>
            {c.limits}
          </span>
        )}
      </>
    ) : (
      <>
        {!c.state.multiple && files[0] ? (
          <FilePreview file={files[0]} />
        ) : (
          <PaperClipIcon aria-hidden="true" className={c.styles.icon()} />
        )}
        <FileValue />
      </>
    );
  return part(
    'button',
    asChild,
    children ?? content,
    mergeProps(props, {
      ...c.triggerProps,
      className: c.styles.trigger({ className: resolveState(className, c.state) }),
    }),
  );
}

function FileValue({ asChild, children, placeholder, className, ...props }: FileField.ValueProps) {
  const c = useFile('FileField.Value');
  const { files } = c.field.state;
  const text =
    files.length === 0
      ? (placeholder ?? c.placeholder)
      : files.length === 1
        ? files[0].name
        : messages.fileField.count(files.length);
  return part(
    'span',
    asChild,
    children ?? text,
    mergeProps(props, {
      'data-placeholder': files.length ? undefined : '',
      title: files.length === 1 ? files[0].name : undefined,
      className: c.styles.value({ className }),
    }),
  );
}

type GhostButtonProps = Omit<ComponentProps<'button'>, 'children' | 'onClick'> & {
  asChild?: boolean;
  children?: ReactElement;
  size: IdsSize;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

function GhostButton({ asChild, children, ...props }: GhostButtonProps) {
  if (!asChild)
    return (
      <IconButton {...props} variant="ghost" icon={children ?? <XMarkIcon aria-hidden="true" />} />
    );
  invariant(isValidElement(children), 'FileField: asChild requires one button element.');
  return (
    <IconButton {...props} variant="ghost" asChild>
      {children}
    </IconButton>
  );
}

function FileClear({ className, onClick, ...props }: FileField.ClearProps) {
  const c = useFile('FileField.Clear');
  const { files, rejections } = c.field.state;
  if ((!files.length && !rejections.length) || c.state.readOnly) return null;
  return (
    <GhostButton
      {...props}
      aria-label={props['aria-label'] ?? messages.fileField.clear}
      disabled={c.state.disabled}
      data-file-field-clear=""
      size={c.size}
      className={c.styles.clear({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) c.field.actions.clear();
      }}
    />
  );
}

function FileList({ asChild, children, className, ...props }: FileField.ListProps) {
  const c = useFile('FileField.List');
  const { files } = c.field.state;
  if (!files.length) return null;
  const items =
    typeof children === 'function'
      ? children(files)
      : (children ?? files.map((file) => <FileItem key={fileKey(file)} file={file} />));
  const list = {
    'aria-label': props['aria-label'] ?? messages.fileField.list,
    className: c.styles.list({ className }),
  };
  if (asChild) return part('div', true, items, mergeProps(props, { ...list, role: 'list' }));
  return (
    <Item.Group {...props} {...list} size={c.size} dense>
      {items}
    </Item.Group>
  );
}

function FileItem({ file, asChild, children, className, ...props }: FileField.ItemProps) {
  const c = useFile('FileField.Item');
  const state: FileFieldItemState = { file, index: c.field.state.files.indexOf(file) };
  const content =
    typeof children === 'function'
      ? children(state)
      : (children ?? (
          <>
            <FilePreview file={file} />
            <Item.Content>
              <Item.Title truncate title={file.name}>
                {file.name}
              </Item.Title>
              <Item.Description className={c.styles.itemSize()}>
                {formatBytes(file.size)}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <FileRemove file={file} />
            </Item.Actions>
          </>
        ));
  return (
    <FileRowContext value>
      <Item
        {...props}
        asChild={asChild}
        variant="outline"
        size={c.size}
        dense
        data-file-field-item=""
        className={c.styles.item({ className })}
      >
        {content}
      </Item>
    </FileRowContext>
  );
}

function FileRemove({ file, className, onClick, ...props }: FileField.RemoveProps) {
  const c = useFile('FileField.Remove');
  if (c.state.readOnly) return null;
  return (
    <GhostButton
      {...props}
      aria-label={props['aria-label'] ?? messages.fileField.remove(file.name)}
      disabled={c.state.disabled}
      data-file-field-remove=""
      size={c.size}
      className={c.styles.itemRemove({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) c.field.actions.remove(file);
      }}
    />
  );
}

function FilePreview({ file, className, ...props }: FileField.PreviewProps) {
  const c = useFile('FileField.Preview');
  const inRow = use(FileRowContext);
  const url = usePreviewUrl(file);
  const glyph = url ? <img src={url} alt="" draggable={false} /> : <DocumentIcon />;
  if (!inRow)
    return (
      <span
        {...props}
        aria-hidden="true"
        data-file-field-preview=""
        className={c.styles.thumb({ className })}
      >
        {glyph}
      </span>
    );
  return (
    <Item.Media asChild variant="soft" className={c.styles.preview({ className })}>
      <span {...props} aria-hidden="true" data-file-field-preview="">
        {glyph}
      </span>
    </Item.Media>
  );
}

export namespace FileField {
  export type Props = FileFieldProps;
  export type State = FileFieldState;
  export type ItemState = FileFieldItemState;
  export type Appearance = FileFieldAppearance;
  export type Variant = FileFieldVariant;
  export type Rejection = FileFieldRejection;

  export type TriggerProps = Omit<ComponentProps<'button'>, 'className'> & {
    asChild?: boolean;
    className?: string | ((state: FileFieldState) => string | undefined);
  };
  export type ValueProps = Omit<ComponentProps<'span'>, 'placeholder'> & {
    asChild?: boolean;
    placeholder?: ReactNode;
  };
  export type ClearProps = Omit<ComponentProps<'button'>, 'children'> & {
    asChild?: boolean;
    children?: ReactElement;
  };
  export type ListProps = Omit<ComponentProps<'ul'>, 'children'> & {
    asChild?: boolean;
    children?: ReactNode | ((files: File[]) => ReactNode);
  };
  export type ItemProps = Omit<ComponentProps<'div'>, 'children'> & {
    file: File;
    asChild?: boolean;
    children?: ReactNode | ((state: FileFieldItemState) => ReactNode);
  };
  export type RemoveProps = Omit<ComponentProps<'button'>, 'children'> & {
    file: File;
    asChild?: boolean;
    children?: ReactElement;
  };
  export type PreviewProps = Omit<ComponentProps<'span'>, 'children'> & { file: File };

  export const Trigger = FileTrigger;
  export const Value = FileValue;
  export const Clear = FileClear;
  export const List = FileList;
  export const Item = FileItem;
  export const Remove = FileRemove;
  export const Preview = FilePreview;

  export const Style = tv({
    slots: {
      root: 'relative grid min-w-0 gap-2',
      control: ['relative', fieldTrigger.base],
      trigger: [
        'flex min-w-0 cursor-pointer touch-manipulation items-center text-start text-(--ids-color-on-surface)',
        'disabled:cursor-not-allowed aria-disabled:cursor-default',
      ],
      icon: 'shrink-0 text-(--ids-color-on-muted)',
      thumb: [
        'flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-indicator',
        'text-(--ids-color-on-muted) [&_img]:size-full [&_img]:object-cover [&_svg]:size-3.5',
      ],
      value: 'min-w-0 flex-1 truncate data-placeholder:text-(--ids-color-on-muted)',
      clear: [fieldAction.base, alreadyDimmedByField],
      dropzoneIcon: 'mb-1 size-6 text-(--ids-color-on-muted)',
      dropzoneTitle: 'font-medium break-keep text-balance',
      dropzoneHint: 'text-caption-c1-regular text-(--ids-color-on-muted) break-keep text-balance',
      list: 'flex flex-col gap-1',
      item: 'bg-(--ids-color-surface) dark:bg-(--ids-color-muted)/30',
      preview: 'text-(--ids-color-on-muted)',
      itemSize: 'text-caption-c1-regular',
      itemRemove: fieldAction.base,
      rejections: 'grid gap-0.5 wrap-anywhere text-(--ids-color-danger)',
    },
    variants: {
      appearance: {
        field: { trigger: 'h-full flex-1 self-stretch bg-transparent outline-none' },
        dropzone: {
          trigger: [
            'min-h-32 w-full flex-col justify-center gap-1 text-center concentric-p-4',
            'border border-dashed focus-ring',
            'transition-[color,background-color,border-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
            'data-dragging:border-(--ids-color-primary) data-dragging:bg-(--ids-color-primary)/5',
            'aria-invalid:border-(--ids-color-danger)',
            'disabled:opacity-50',
          ],
        },
      },
      variant: {
        outline: {},
        soft: {},
        ghost: {},
      } satisfies Record<FileFieldVariant, object>,
      size: {
        standard: {
          root: 'text-body-b3-regular',
          clear: fieldAction.unpadded.standard,
          itemRemove: 'size-7',
          icon: fieldTrigger.icon.standard,
          rejections: 'text-body-b3-regular',
        },
        tiny: {
          root: 'text-caption-c1-regular',
          clear: fieldAction.unpadded.tiny,
          itemRemove: 'size-6',
          icon: fieldTrigger.icon.tiny,
          rejections: 'text-caption-c1-regular',
        },
      } satisfies Record<IdsSize, object>,
    },
    compoundVariants: [
      { appearance: 'field', variant: 'outline', class: { control: fieldTrigger.variant.outline } },
      { appearance: 'field', variant: 'soft', class: { control: fieldTrigger.variant.soft } },
      { appearance: 'field', variant: 'ghost', class: { control: fieldTrigger.variant.ghost } },
      {
        appearance: 'field',
        size: 'standard',
        class: {
          control: 'h-(--ids-size-control-standard) rounded-standard',
          trigger: 'gap-2 px-3',
        },
      },
      {
        appearance: 'field',
        size: 'tiny',
        class: {
          control: 'h-(--ids-size-control-tiny) rounded-standard',
          trigger: 'gap-1.5 px-2.5',
        },
      },
      {
        appearance: 'dropzone',
        variant: 'outline',
        class: { trigger: 'border-(--ids-color-border) hover:bg-(--ids-color-muted)/50' },
      },
      {
        appearance: 'dropzone',
        variant: 'soft',
        class: {
          trigger: 'border-transparent bg-(--ids-color-muted) hover:bg-(--ids-color-muted)/70',
        },
      },
      {
        appearance: 'dropzone',
        variant: 'ghost',
        class: { trigger: 'border-transparent hover:bg-(--ids-color-muted)/50' },
      },
    ],
    defaultVariants: { appearance: 'field', variant: 'outline', size: 'standard' },
  });
}
