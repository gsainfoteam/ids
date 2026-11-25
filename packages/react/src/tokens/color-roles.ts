// GENERATED — do not edit manually

export const IDS_NEUTRAL_FAMILIES = ['neutral'] as const;

export const IDS_BRAND_FAMILIES = ['primary', 'secondary', 'tertiary'] as const;

export const IDS_STATUS_FAMILIES = ['success', 'warning', 'danger', 'info'] as const;

export const IDS_COLOR_FAMILIES = [
  'neutral',
  'primary',
  'secondary',
  'tertiary',
  'success',
  'warning',
  'danger',
  'info',
] as const;

export const IDS_FAMILY_SLOTS = [
  'bg-base',
  'bg-surface',
  'bg-block',
  'bg-{family}-soft',
  'bg-{family}-solid',
  'text-on-base',
  'text-on-surface',
  'text-on-block',
  'text-on-{family}-soft',
  'text-on-{family}-solid',
  'text-{family}',
  'text-{family}-strong',
  'border-{family}',
  'border-{family}-strong',
] as const;

export const IDS_NEUTRAL_ONLY_SLOTS = [
  'bg-base',
  'bg-surface',
  'bg-block',
  'text-on-base',
  'text-on-surface',
  'text-on-block',
] as const;

export const IDS_STATE_OPACITY = {
  hover: 0.06,
  press: 0.1,
  tintHover: 0.08,
  tintPress: 0.12,
  fillHover: 0.1,
  fillPress: 0.18,
} as const;

export const IDS_STATE_FILL_COLOR = '#000000';

export const IDS_NEUTRAL_SCALES = {
  light: [
    '#ffffff',
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#e5e5e5',
    '#d4d4d4',
    '#a3a3a3',
    '#525252',
    '#0a0a0a',
  ],
  dark: [
    '#0a0a0a',
    '#171717',
    '#1e1e1e',
    '#262626',
    '#2e2e2e',
    '#3a3a3a',
    '#737373',
    '#d4d4d4',
    '#fafafa',
  ],
} as const;

export const IDS_NEUTRAL_STEPS = {
  'bg-base': 1,
  'bg-surface': 2,
  'bg-block': 3,
  'bg-neutral-soft': 4,
  'bg-neutral-solid': 9,
  'border-neutral': 5,
  'border-neutral-strong': 6,
  'text-neutral': 8,
  'text-neutral-strong': 9,
} as const;
