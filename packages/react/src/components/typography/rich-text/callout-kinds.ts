import type { CalloutKind } from './schema/callout';
import type { IdsMessageKey } from '../../../internal/messages';
import type { StatusColorScheme } from '../../../internal/status-palette';

export const CALLOUT_SCHEME = {
  note: 'info',
  tip: 'success',
  important: 'primary',
  warning: 'warning',
  caution: 'danger',
} as const satisfies Record<CalloutKind, StatusColorScheme>;

export const CALLOUT_TITLE = {
  note: 'richText.calloutNote',
  tip: 'richText.calloutTip',
  important: 'richText.calloutImportant',
  warning: 'richText.calloutWarning',
  caution: 'richText.calloutCaution',
} as const satisfies Record<CalloutKind, IdsMessageKey>;
