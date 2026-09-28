import type { CSSProperties, MouseEvent, ReactNode } from 'react';

import { messages } from '../../../internal/messages';
import { createExternalStore } from '../../../internal/overlay/external-store';

import type { StatusColorScheme } from '../../../internal/status-palette';

export const DEFAULT_DURATION = 4000;

export type ToastId = string | number;

export type ToastAction = {
  label: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export type ToastOptions = {
  id?: ToastId;
  description?: ReactNode;
  duration?: number;
  action?: ToastAction;
  colorScheme?: StatusColorScheme;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onDismiss?: (toast: ToastRecord) => void;
  onAutoClose?: (toast: ToastRecord) => void;
};

export type ToastRecord = Omit<ToastOptions, 'id' | 'colorScheme' | 'duration'> & {
  id: ToastId;
  message: ReactNode;
  colorScheme: StatusColorScheme;
  duration: number;
  loading: boolean;
  dismissed: boolean;
  version: number;
};

export type ToastPromiseMessages<T> = Omit<ToastOptions, 'colorScheme'> & {
  loading?: ReactNode;
  success?: ReactNode | ((value: T) => ReactNode);
  error?: ReactNode | ((reason: unknown) => ReactNode);
};

export type DismissCause = 'auto' | 'user';

export const toastRecords = createExternalStore<readonly ToastRecord[]>([]);

let created = 0;

type Kind = { colorScheme: StatusColorScheme; loading: boolean; duration: number };

const kinds = {
  show: { colorScheme: 'neutral', loading: false, duration: DEFAULT_DURATION },
  info: { colorScheme: 'info', loading: false, duration: DEFAULT_DURATION },
  success: { colorScheme: 'success', loading: false, duration: DEFAULT_DURATION },
  warning: { colorScheme: 'warning', loading: false, duration: DEFAULT_DURATION },
  error: { colorScheme: 'danger', loading: false, duration: DEFAULT_DURATION },
  loading: { colorScheme: 'neutral', loading: true, duration: Infinity },
} satisfies Record<string, Kind>;

function create(kind: Kind, message: ReactNode, { id, ...options }: ToastOptions = {}) {
  const key = id ?? ++created;
  const records = toastRecords.get();
  const existing = records.find((record) => record.id === key);
  const next: ToastRecord = {
    ...existing,
    ...kind,
    ...options,
    id: key,
    message,
    colorScheme: options.colorScheme ?? kind.colorScheme,
    duration: options.duration ?? kind.duration,
    dismissed: false,
    version: (existing?.version ?? 0) + 1,
  };
  toastRecords.set(
    existing ? records.map((record) => (record.id === key ? next : record)) : [next, ...records],
  );
  return key;
}

export function dismissToast(id: ToastId, cause: DismissCause) {
  const records = toastRecords.get();
  const record = records.find((candidate) => candidate.id === id);
  if (!record || record.dismissed) return;
  if (!someToasterIsMounted())
    toastRecords.set(records.filter((candidate) => candidate !== record));
  else
    toastRecords.set(
      records.map((candidate) =>
        candidate === record ? { ...record, dismissed: true } : candidate,
      ),
    );
  if (cause === 'auto') record.onAutoClose?.(record);
  else record.onDismiss?.(record);
}

export function removeToast(id: ToastId) {
  const records = toastRecords.get();
  if (records.some((record) => record.id === id && record.dismissed))
    toastRecords.set(records.filter((record) => record.id !== id));
}

function dismiss(id?: ToastId) {
  if (id !== undefined) dismissToast(id, 'user');
  else dismissAll();
}

function dismissAll() {
  for (const record of toastRecords.get()) dismissToast(record.id, 'user');
}

function resolveMessage<V>(message: ReactNode | ((value: V) => ReactNode), value: V) {
  return typeof message === 'function' ? message(value) : message;
}

function promise<T>(
  task: Promise<T> | (() => Promise<T>),
  { loading, success, error, ...options }: ToastPromiseMessages<T>,
) {
  const id = create(kinds.loading, loading ?? messages.toast.loading, options);
  const settleOptions = { ...options, id };
  void (typeof task === 'function' ? task() : task).then(
    (value) => {
      if (success === undefined) dismiss(id);
      else create(kinds.success, resolveMessage(success, value), settleOptions);
    },
    (reason: unknown) => {
      if (error === undefined) dismiss(id);
      else create(kinds.error, resolveMessage(error, reason), settleOptions);
    },
  );
  return id;
}

type ToastFunction = (message: ReactNode, options?: ToastOptions) => ToastId;

const creatorOf =
  (kind: Kind): ToastFunction =>
  (message, options) =>
    create(kind, message, options);

const show = creatorOf(kinds.show);

export const toast = Object.assign(show, {
  show,
  info: creatorOf(kinds.info),
  success: creatorOf(kinds.success),
  warning: creatorOf(kinds.warning),
  error: creatorOf(kinds.error),
  loading: ((message = messages.toast.loading, options) =>
    create(kinds.loading, message, options)) as (
    message?: ReactNode,
    options?: ToastOptions,
  ) => ToastId,
  promise,
  dismiss,
  dismissAll,
});

type ToasterHost = { host: symbol; explicit: boolean };

export const toasterHosts = createExternalStore<readonly ToasterHost[]>([]);

function someToasterIsMounted() {
  return toasterHosts.get().length > 0;
}

export function electedToaster(hosts: readonly ToasterHost[]) {
  return (hosts.find((entry) => entry.explicit) ?? hosts[0])?.host;
}

export function registerToaster(host: symbol, explicit: boolean) {
  toasterHosts.set([...toasterHosts.get(), { host, explicit }]);
  return () => {
    toasterHosts.set(toasterHosts.get().filter((entry) => entry.host !== host));
    queueMicrotask(() => {
      const remountedInTheSameTask = someToasterIsMounted();
      const records = toastRecords.get();
      const nothingLeftToAnimateThem = !remountedInTheSameTask && records.some((r) => r.dismissed);
      if (nothingLeftToAnimateThem) toastRecords.set(records.filter((record) => !record.dismissed));
    });
  };
}
