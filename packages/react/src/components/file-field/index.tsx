import {
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';
import { flattenParts, part } from '../field-popup';
import { iconSquare } from '../icon-square';

import type { IdsSize } from '../../tokens/types';

type ButtonEvents = 'ref' | 'onClick' | 'onBlur' | 'onFocus' | 'onKeyDown';
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
  | ButtonEvents
> &
  Pick<ComponentProps<'button'>, ButtonEvents> & {
    variant?: 'outline' | 'dropzone';
    size?: IdsSize;
    invalid?: boolean;
    maxSize?: number;
    maxCount?: number;
    onReject?: (rejections: FileFieldRejection[]) => void;
    onDrop?: React.DragEventHandler<HTMLDivElement>;
    onDragOver?: React.DragEventHandler<HTMLDivElement>;
  };
export type FileFieldRejection = { file: File; reason: 'type' | 'size' | 'count' };
export type FileFieldProps = BaseProps &
  (
    | {
        multiple?: false;
        value?: File | null;
        defaultValue?: File | null;
        onChange?: (value: File | null) => void;
      }
    | { multiple: true; value?: File[]; defaultValue?: File[]; onChange?: (value: File[]) => void }
  );
type BoxProps = ComponentProps<'div'> & { asChild?: boolean };
type ContextValue = {
  styles: ReturnType<typeof FileField.Style>;
  files: File[];
  blocked: boolean;
  hasErrors: boolean;
  placeholder: string;
  triggerProps: ComponentProps<'button'>;
  remove: (file: File) => void;
  clear: () => void;
};
const Context = createContext<ContextValue | null>(null);
function useFile() {
  const c = useContext(Context);
  invariant(c, 'FileField parts must be inside FileField.');
  return c;
}
function FileTrigger({ asChild, children, ...props }: FileField.TriggerProps) {
  const c = useFile();
  invariant(
    !flattenParts(children).some(
      (n) =>
        isValidElement(n) && (n.type === FileClear || n.type === FileList || n.type === FileItem),
    ),
    'FileField: Clear/List/Item must be siblings of Trigger.',
  );
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <PlusIcon aria-hidden="true" />
        <FileValue />
      </>
    ),
    mergeProps(props, { ...c.triggerProps }),
  );
}
function FileValue({ asChild, children, placeholder, ...props }: FileField.ValueProps) {
  const c = useFile();
  return part(
    'span',
    asChild,
    children ??
      (c.files.length
        ? `${c.files
            .slice(0, 2)
            .map((f) => f.name)
            .join(', ')}${c.files.length > 2 ? `, +${c.files.length - 2}` : ''}`
        : (placeholder ?? c.placeholder)),
    mergeProps({ className: c.styles.value() }, props),
  );
}
function FileClear({
  asChild,
  children = <XMarkIcon aria-hidden="true" />,
  ...props
}: FileField.ClearProps) {
  const c = useFile();
  if (!c.files.length && !c.hasErrors) return null;
  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      type: 'button',
      'aria-label': props['aria-label'] ?? '파일 모두 지우기',
      disabled: c.blocked,
      className: c.styles.clear(),
      onClick: c.clear,
    }),
  );
}
function FileItem({ file, asChild, children, ...props }: FileField.ItemProps) {
  const c = useFile();
  return part(
    'div',
    asChild,
    children ?? (
      <>
        <span className={c.styles.itemName()} title={file.name}>
          {file.name}
        </span>
        <span className={c.styles.itemSize()}>{file.size.toLocaleString()} B</span>
        <button
          type="button"
          aria-label={`${file.name} 삭제`}
          disabled={c.blocked}
          onClick={() => c.remove(file)}
          className={c.styles.itemRemove()}
        >
          <XMarkIcon aria-hidden="true" />
        </button>
      </>
    ),
    mergeProps(
      {
        className: c.styles.item(),
        role: 'listitem',
      },
      props,
    ),
  );
}
function FileList({ asChild, children, ...props }: BoxProps) {
  const c = useFile();
  if (!c.files.length) return null;
  return part(
    'div',
    asChild,
    children ?? c.files.map((file, index) => <FileItem key={index} file={file} />),
    mergeProps({ role: 'list', 'aria-label': '선택 파일', className: c.styles.list() }, props),
  );
}
const isFile = (file: unknown): file is File =>
  !!file &&
  typeof file === 'object' &&
  'name' in file &&
  typeof file.name === 'string' &&
  'size' in file &&
  typeof file.size === 'number' &&
  'slice' in file &&
  typeof file.slice === 'function';
const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified && a.type === b.type;
function accepted(file: File, tokens: string[]) {
  return (
    !tokens.length ||
    tokens.some((token) =>
      token.startsWith('.')
        ? file.name.toLowerCase().endsWith(token)
        : token.endsWith('/*')
          ? file.type.toLowerCase().startsWith(token.slice(0, -1))
          : file.type.toLowerCase() === token,
    )
  );
}
export function FileField(props: FileFieldProps) {
  const {
    multiple = false,
    value,
    defaultValue,
    onChange: _onChange,
    variant = 'outline',
    size,
    invalid,
    maxSize,
    maxCount,
    onReject,
    children,
    className,
    style,
    ref: forwardedRef,
    name,
    form,
    id: providedId,
    required,
    disabled,
    readOnly,
    placeholder = '파일 선택 또는 드래그',
    onClick,
    onBlur,
    onFocus,
    onKeyDown,
    onDrop,
    onDragOver,
    ...native
  } = props;
  const [stored, setStored] = useState<File | File[] | null>(
    defaultValue ?? (multiple ? [] : null),
  );
  const current = value === undefined ? stored : value;
  invariant(
    multiple
      ? Array.isArray(current) && current.every(isFile)
      : current === null || isFile(current),
    'FileField: single requires File | null; multiple requires File[].',
  );
  invariant(
    maxSize === undefined || (Number.isFinite(maxSize) && maxSize >= 0),
    'FileField: maxSize must be non-negative bytes.',
  );
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    'FileField: maxCount must be a non-negative integer.',
  );
  const tokens = (native.accept ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  invariant(
    tokens.every(
      (t) =>
        /^\.[a-z0-9][a-z0-9._-]*$/.test(t) ||
        /^[a-z0-9!#$&^_.+-]+\/(?:[a-z0-9!#$&^_.+-]+|\*)$/.test(t),
    ),
    'FileField: accept must contain MIME types or extensions.',
  );
  const files = useMemo(
    () => (Array.isArray(current) ? current : current ? [current] : []),
    [current],
  );
  const [rejections, setRejections] = useState<FileFieldRejection[]>([]),
    [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const uid = useId(),
    id = providedId ?? `ids-file-${uid}`,
    errorId = `${id}-rejections`;
  const blocked = !!disabled || !!readOnly;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = FileField.Style({ variant, size: resolvedSize });
  useLayoutEffect(() => {
    const node = input.current,
      owner = node?.form;
    if (!node || !owner) return;
    let alive = true;
    // The picker is nameless: formdata always submits the actual model, including drops,
    // removals and controlled defaults, without attempting to assign a FileList.
    const formdata = (event: Event) => {
      if (name && !node.matches(':disabled'))
        for (const file of files) (event as FormDataEvent).formData.append(name, file, file.name);
    };
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (alive && !event.defaultPrevented) {
          if (value === undefined) setStored(defaultValue ?? (multiple ? [] : null));
          setRejections([]);
          setDragOver(false);
          node.value = '';
        }
      });
    owner.addEventListener('formdata', formdata);
    owner.addEventListener('reset', reset);
    return () => {
      alive = false;
      owner.removeEventListener('formdata', formdata);
      owner.removeEventListener('reset', reset);
    };
  }, [files, name, form, value, defaultValue, multiple]);
  const emit = (next: File[]) => {
    if (value === undefined) setStored(multiple ? next : (next[0] ?? null));
    if (props.multiple) props.onChange?.(next);
    else props.onChange?.(next[0] ?? null);
  };
  const receive = (incoming: File[]) => {
    if (blocked || input.current?.matches(':disabled') || !incoming.length) return;
    const next = multiple ? [...files] : [],
      rejected: FileFieldRejection[] = [];
    for (const file of incoming) {
      if (!accepted(file, tokens)) {
        rejected.push({ file, reason: 'type' });
        continue;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({ file, reason: 'size' });
        continue;
      }
      if (multiple && next.some((f) => sameFile(f, file))) continue;
      if (next.length >= (multiple ? (maxCount ?? Infinity) : 1)) {
        rejected.push({ file, reason: 'count' });
        continue;
      }
      next.push(file);
    }
    setRejections(rejected);
    if (rejected.length) onReject?.(rejected);
    if (next.length && (next.length !== files.length || next.some((f, i) => f !== files[i])))
      emit(next);
  };
  const clear = () => {
    if (blocked) return;
    setRejections([]);
    if (files.length) emit([]);
    if (input.current) input.current.value = '';
    trigger.current?.focus({ preventScroll: true });
  };
  const remove = (file: File) => {
    if (blocked) return;
    const index = files.indexOf(file);
    if (index < 0) return;
    setRejections([]);
    emit(files.filter((_, i) => i !== index));
    trigger.current?.focus({ preventScroll: true });
  };
  const triggerProps: ComponentProps<'button'> & { 'data-dragover'?: string } = {
    // mergeRefs composes callbacks without reading current during render.
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(trigger, forwardedRef),
    id,
    type: 'button',
    form,
    disabled,
    autoFocus: native.autoFocus,
    tabIndex: native.tabIndex,
    'aria-label': native['aria-label'],
    'aria-labelledby': native['aria-labelledby'],
    'aria-describedby':
      [native['aria-describedby'], rejections.length ? errorId : undefined]
        .filter(Boolean)
        .join(' ') || undefined,
    'aria-invalid': rejections.length ? true : (native['aria-invalid'] ?? invalid),
    'aria-required': native['aria-required'] ?? required,
    'aria-disabled': blocked || undefined,
    'data-dragover': dragOver && !blocked ? '' : undefined,
    className: styles.trigger(),
    onClick: (e) => {
      onClick?.(e);
      if (!e.defaultPrevented && !blocked) input.current?.click();
    },
    onBlur,
    onFocus,
    onKeyDown,
  };
  const parts = flattenParts(children);
  const triggers = parts.filter((n) => isValidElement(n) && n.type === FileTrigger);
  invariant(
    !parts.length || triggers.length === 1,
    'FileField: explicit children require exactly one Trigger.',
  );
  return (
    <Context.Provider
      value={{
        styles,
        files,
        blocked,
        hasErrors: !!rejections.length,
        placeholder,
        triggerProps,
        clear,
        remove,
      }}
    >
      <div
        className={styles.root({ className })}
        style={style}
        data-file-field=""
        data-dragover={dragOver && !blocked ? '' : undefined}
        onDragEnter={(e) => {
          if (!Array.from(e.dataTransfer.types).includes('Files')) return;
          e.preventDefault();
          if (!blocked) {
            setDragOver(true);
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setDragOver(false);
        }}
        onDragOver={(e) => {
          onDragOver?.(e);
          if (e.defaultPrevented) return;
          if (Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = blocked ? 'none' : 'copy';
          }
        }}
        onDrop={(e) => {
          onDrop?.(e);
          setDragOver(false);
          if (e.defaultPrevented) return;
          if (Array.from(e.dataTransfer.types).includes('Files')) {
            e.preventDefault();
            receive(Array.from(e.dataTransfer.files));
          }
        }}
      >
        <input
          {...native}
          ref={input}
          type="file"
          multiple={multiple}
          disabled={disabled}
          form={form}
          hidden
          tabIndex={-1}
          autoFocus={false}
          aria-hidden="true"
          onChange={(e) => {
            receive(Array.from(e.currentTarget.files ?? []));
            e.currentTarget.value = '';
          }}
        />
        {parts.length ? (
          parts
        ) : (
          <>
            <div className={styles.row()}>
              <FileTrigger />
              <FileClear />
            </div>
            {multiple && <FileList />}
          </>
        )}
        {!!rejections.length && (
          <div id={errorId} role="alert" className={styles.error()}>
            {rejections.map(({ file, reason }, index) => (
              <div key={index}>
                {file.name}:{' '}
                {reason === 'type'
                  ? '허용되지 않는 파일 형식입니다.'
                  : reason === 'size'
                    ? '파일 크기 제한을 초과했습니다.'
                    : '파일 개수 제한을 초과했습니다.'}
              </div>
            ))}
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
export namespace FileField {
  export type Props = FileFieldProps;
  export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };
  export type ValueProps = ComponentProps<'span'> & { asChild?: boolean; placeholder?: string };
  export type ClearProps = ComponentProps<'button'> & { asChild?: boolean };
  export type ItemProps = BoxProps & { file: File };
  export const Trigger = FileTrigger,
    Value = FileValue,
    List = FileList,
    Item = FileItem,
    Clear = FileClear;
  export const Style = tv({
    slots: {
      root: 'grid min-w-0 gap-2',
      row: 'flex min-w-0 items-center gap-1',
      trigger: [
        'flex w-full min-w-0 flex-1 touch-manipulation items-center text-left',
        'cursor-pointer bg-transparent text-(--ids-color-on-surface)',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'focus-ring data-dragover:bg-(--ids-color-primary)/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&_svg]:shrink-0',
      ],
      value: 'min-w-0 flex-1 truncate',
      clear: [
        iconSquare.base,
        'inline-flex cursor-pointer items-center justify-center rounded-md text-(--ids-color-on-muted)',
        'focus-ring disabled:cursor-not-allowed disabled:opacity-50',
      ],
      list: 'grid gap-1',
      item: 'flex min-w-0 items-center gap-2 rounded-md bg-(--ids-color-primary)/5 px-3 py-1',
      itemName: 'min-w-0 flex-1 truncate',
      itemSize: 'shrink-0 text-caption-c1-regular text-(--ids-color-on-muted)',
      itemRemove: [
        'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xs',
        'focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        '[&_svg]:size-(--ids-size-icon-tiny)',
      ],
      error: 'wrap-anywhere text-(--ids-color-danger)',
    },
    variants: {
      variant: {
        outline: {
          trigger: [
            'shadow-xs inset-ring-1 inset-ring-(--ids-color-outline)',
            'aria-invalid:inset-ring-(--ids-color-danger)',
          ],
        },
        dropzone: {
          trigger: [
            'min-h-32 justify-center rounded-lg p-6',
            'border border-dashed border-(--ids-color-outline)',
            'aria-invalid:border-(--ids-color-danger)',
          ],
        },
      },
      size: {
        standard: {
          trigger: 'gap-2 text-body-b3-regular [&_svg]:size-(--ids-size-icon-standard)',
          clear: iconSquare.size.standard,
          item: 'text-body-b3-regular',
          error: 'text-body-b3-regular',
        },
        tiny: {
          trigger: 'gap-1.5 text-caption-c1-regular [&_svg]:size-(--ids-size-icon-tiny)',
          clear: iconSquare.size.tiny,
          item: 'text-caption-c1-regular',
          error: 'text-caption-c1-regular',
        },
      } satisfies Record<IdsSize, object>,
    },
    compoundVariants: [
      {
        variant: 'outline',
        size: 'standard',
        class: { trigger: 'h-(--ids-size-control-standard) rounded-md px-3' },
      },
      {
        variant: 'outline',
        size: 'tiny',
        class: { trigger: 'h-(--ids-size-control-tiny) rounded-sm px-2' },
      },
    ],
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}
