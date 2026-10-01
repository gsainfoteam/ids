import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid';

export type StatusColorScheme = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const statusIcons = {
  neutral: InformationCircleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  danger: XCircleIcon,
} satisfies Record<StatusColorScheme, unknown>;

export const announcedAssertively: ReadonlySet<StatusColorScheme> = new Set(['warning', 'danger']);
