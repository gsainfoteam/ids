export const DOCUMENT_COLORS = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'danger',
] as const;

export type DocumentColor = (typeof DOCUMENT_COLORS)[number];

export const isDocumentColor = (value: unknown): value is DocumentColor =>
  DOCUMENT_COLORS.includes(value as DocumentColor);
