import type { CalloutKind } from './schema/callout';
import type { IdsMessageKey } from '../../../internal/messages';

export const CALLOUT_TITLE = {
  info: 'richText.calloutInfo',
  success: 'richText.calloutSuccess',
  warning: 'richText.calloutWarning',
  danger: 'richText.calloutDanger',
} as const satisfies Record<CalloutKind, IdsMessageKey>;
