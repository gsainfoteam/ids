import type { CalloutKind } from './schema/callout';
import type { IdsMessageKey } from '../../../internal/messages';

export const CALLOUT_TITLE = {
  info: 'common.status.info',
  success: 'common.status.success',
  warning: 'common.status.warning',
  danger: 'common.status.danger',
} as const satisfies Record<CalloutKind, IdsMessageKey>;
