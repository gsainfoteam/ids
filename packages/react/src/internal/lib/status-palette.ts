import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid';

export type StatusColorScheme =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export const statusIcons = {
  neutral: InformationCircleIcon,
  primary: InformationCircleIcon,
  secondary: InformationCircleIcon,
  tertiary: InformationCircleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  danger: XCircleIcon,
} satisfies Record<StatusColorScheme, unknown>;

export const announcedAssertively: ReadonlySet<StatusColorScheme> = new Set(['warning', 'danger']);
