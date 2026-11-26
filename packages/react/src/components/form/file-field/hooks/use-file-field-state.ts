'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
} from 'react';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { useInternalFormReset } from '../../../../hooks/use-form-reset';
import { parseAccept, receiveFiles, type FileFieldRejection } from '../lib/file-rules';

export type FileFieldValue = File | File[] | null;

type FileFieldStateOptions = {
  multiple: boolean;
  value: FileFieldValue | undefined;
  defaultValue: FileFieldValue | undefined;
  onValueChange?: (value: FileFieldValue) => void;
  accept: string | undefined;
  maxSize: number | undefined;
  maxCount: number | undefined;
  onReject?: (rejections: FileFieldRejection[]) => void;
  name: string | undefined;
  form: string | undefined;
  disabled: boolean;
  readOnly: boolean;
};

const carriesFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');

const allowRepickingSameFile = (picker: HTMLInputElement) => {
  picker.value = '';
};

export function useInternalFileFieldState({
  multiple,
  value,
  defaultValue,
  onValueChange,
  accept,
  maxSize,
  maxCount,
  onReject,
  name,
  form,
  disabled,
  readOnly,
}: FileFieldStateOptions) {
  const empty = multiple ? [] : null;
  const [current, setValue] = useControllableState<FileFieldValue>({
    value,
    defaultValue: defaultValue ?? empty,
    onValueChange,
  });
  const files = useMemo(
    () => (Array.isArray(current) ? current : current ? [current] : []),
    [current],
  );
  const tokens = parseAccept(accept);
  const blocked = disabled || readOnly;
  const [rejections, setRejections] = useState<FileFieldRejection[]>([]);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const rootRef = useRef<HTMLElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<number | 'trigger' | null>(null);

  const emit = (next: File[]) => setValue(multiple ? next : (next[0] ?? null));

  const receive = (incoming: File[]) => {
    if (blocked || !incoming.length) return;
    const { next, rejected } = receiveFiles({
      incoming,
      current: files,
      multiple,
      tokens,
      maxSize,
      maxCount,
    });
    setRejections(rejected);
    if (rejected.length) onReject?.(rejected);
    if (next.length) emit(next);
  };

  const clear = () => {
    if (blocked) return;
    setRejections([]);
    emit([]);
    if (pickerRef.current) pickerRef.current.value = '';
    triggerRef.current?.focus({ preventScroll: true });
  };

  const remove = (file: File) => {
    const index = files.indexOf(file);
    if (blocked || index < 0) return;
    setRejections([]);
    emit(files.filter((_, at) => at !== index));
    pendingFocus.current = index < files.length - 1 ? index : index > 0 ? index - 1 : 'trigger';
  };

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const buttons = rootRef.current?.querySelectorAll<HTMLElement>('[data-file-field-remove]');
    const next = target === 'trigger' ? null : buttons?.[Math.min(target, buttons.length - 1)];
    (next ?? triggerRef.current)?.focus({ preventScroll: true });
  });

  useEffect(() => {
    const input = pickerRef.current;
    const owner = input?.form;
    if (!input || !owner || !name) return;
    const appendCurrentFiles = (event: Event) => {
      if (input.matches(':disabled')) return;
      for (const file of files) (event as FormDataEvent).formData.append(name, file, file.name);
    };
    owner.addEventListener('formdata', appendCurrentFiles);
    return () => owner.removeEventListener('formdata', appendCurrentFiles);
  }, [files, name, form]);

  useInternalFormReset(pickerRef, () => {
    setValue(defaultValue ?? empty, { silent: true });
    setRejections([]);
    setDragging(false);
    dragDepth.current = 0;
  });

  const handlers = {
    onDragEnter: (event: DragEvent<HTMLElement>) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      dragDepth.current += 1;
      if (!blocked) setDragging(true);
    },
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = blocked ? 'none' : 'copy';
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (!carriesFiles(event)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      dragDepth.current = 0;
      setDragging(false);
      if (!carriesFiles(event)) return;
      event.preventDefault();
      receive(Array.from(event.dataTransfer.files));
    },
    onPaste: (event: ClipboardEvent<HTMLElement>) => {
      const pasted = Array.from(event.clipboardData?.files ?? []);
      if (blocked || !pasted.length) return;
      event.preventDefault();
      receive(pasted);
    },
    onInputChange: (event: ChangeEvent<HTMLInputElement>) => {
      receive(Array.from(event.currentTarget.files ?? []));
      allowRepickingSameFile(event.currentTarget);
    },
  };

  return {
    state: { value: current, files, rejections, dragging, blocked, tokens },
    rootRef,
    pickerRef,
    triggerRef,
    actions: {
      clear,
      remove,
      openPicker: () => {
        if (!blocked) pickerRef.current?.click();
      },
    },
    handlers,
  };
}
