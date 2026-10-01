import { uniq } from 'es-toolkit';

import type { Translate } from '../../../internal/translate';

export type FileFieldRejection = { file: File; reason: 'type' | 'size' | 'count' };

const EXTENSION = /^\.[a-z0-9][a-z0-9._-]*$/;
const MIME = /^[a-z0-9!#$&^_.+-]+\/(?:[a-z0-9!#$&^_.+-]+|\*)$/;

export function parseAccept(accept: string | undefined) {
  return (accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

export function isValidAccept(tokens: string[]) {
  return tokens.every((token) => EXTENSION.test(token) || MIME.test(token));
}

export function acceptsFile(file: File, tokens: string[]) {
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) =>
    token.startsWith('.')
      ? name.endsWith(token)
      : token.endsWith('/*')
        ? type.startsWith(token.slice(0, -1))
        : type === token,
  );
}

export const isFile = (value: unknown): value is File =>
  !!value &&
  typeof value === 'object' &&
  'name' in value &&
  typeof value.name === 'string' &&
  'size' in value &&
  typeof value.size === 'number' &&
  'slice' in value &&
  typeof value.slice === 'function';

export const describeSameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified && a.type === b.type;

export const isImage = (file: File) => file.type.toLowerCase().startsWith('image/');

let nextKey = 0;
const keys = new WeakMap<File, string>();

export function fileKey(file: File) {
  let key = keys.get(file);
  if (!key) {
    key = `file-${++nextKey}`;
    keys.set(file, key);
  }
  return key;
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes: number) {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${UNITS[unit]}`;
}

const NAMED_KINDS = ['image', 'video', 'audio', 'text'] as const;

const isNamedKind = (kind: string): kind is (typeof NAMED_KINDS)[number] =>
  (NAMED_KINDS as readonly string[]).includes(kind);

function describeToken(token: string, t: Translate) {
  if (token.startsWith('.')) return token.slice(1).toUpperCase();
  const [kind, subtype] = token.split('/');
  if (subtype === '*') return isNamedKind(kind) ? t(`fileField.kinds.${kind}`) : kind;
  return subtype.replace(/^x-/, '').toUpperCase();
}

export function describeLimits(
  {
    tokens,
    maxSize,
    maxCount,
  }: {
    tokens: string[];
    maxSize?: number;
    maxCount?: number;
  },
  t: Translate,
) {
  const parts = [
    tokens.length ? uniq(tokens.map((token) => describeToken(token, t))).join(', ') : null,
    maxSize !== undefined ? t('fileField.limitSize', { max: formatBytes(maxSize) }) : null,
    maxCount !== undefined ? t('fileField.limitCount', { count: maxCount }) : null,
  ];
  return parts.filter(Boolean).join(' · ');
}

type ReceiveOptions = {
  incoming: File[];
  current: File[];
  multiple: boolean;
  tokens: string[];
  maxSize?: number;
  maxCount?: number;
};

export function receiveFiles({
  incoming,
  current,
  multiple,
  tokens,
  maxSize,
  maxCount,
}: ReceiveOptions) {
  const next = multiple ? [...current] : [];
  const rejected: FileFieldRejection[] = [];
  const limit = multiple ? (maxCount ?? Infinity) : 1;
  for (const file of incoming) {
    if (!acceptsFile(file, tokens)) rejected.push({ file, reason: 'type' });
    else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: 'size' });
    else if (multiple && next.some((kept) => describeSameFile(kept, file))) continue;
    else if (next.length >= limit) rejected.push({ file, reason: 'count' });
    else next.push(file);
  }
  return { next, rejected };
}
