// GENERATED — do not edit manually

export const IDS_NEUTRAL_FAMILIES = ['neutral'] as const;

export const IDS_BRAND_FAMILIES = ['primary', 'secondary', 'tertiary'] as const;

export const IDS_STATUS_FAMILIES = ['success', 'warning', 'danger', 'info'] as const;

export const IDS_COLOR_FAMILIES = ['neutral', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info'] as const;

export const IDS_FAMILY_SLOTS = ['bg-{family}-subtlest', 'bg-{family}-subtler', 'bg-{family}-subtle', 'bg-{family}', 'bg-{family}-bold', 'text-on-{family}-subtle', 'text-on-{family}', 'text-on-{family}-bold', 'text-{family}', 'text-{family}-bold', 'border-{family}'] as const;

export const IDS_NEUTRAL_ONLY_SLOTS = ['bg-{family}-subtlest', 'bg-{family}-bold', 'text-on-{family}-bold', 'text-{family}-bold'] as const;

export const IDS_STATE_OPACITY = {
  'hover': 0.06,
  'press': 0.1,
} as const;

export const IDS_NEUTRAL_PALETTE = {
  '0': '#ffffff',
  '50': '#fafafa',
  '100': '#f5f5f5',
  '200': '#e5e5e5',
  '300': '#d4d4d4',
  '400': '#a3a3a3',
  '500': '#737373',
  '600': '#525252',
  '700': '#404040',
  '800': '#262626',
  '900': '#171717',
  '950': '#0a0a0a',
} as const;

export const IDS_NEUTRAL_STEPS = {
  light: {
    'bg-neutral-subtlest': 0,
    'bg-neutral-subtler': 50,
    'bg-neutral-subtle': 100,
    'bg-neutral': 300,
    'bg-neutral-bold': 900,
    'text-on-neutral-subtle': 900,
    'text-on-neutral': 950,
    'text-on-neutral-bold': 0,
    'text-neutral': 600,
    'text-neutral-bold': 900,
    'border-neutral': 200,
  },
  dark: {
    'bg-neutral-subtlest': 950,
    'bg-neutral-subtler': 900,
    'bg-neutral-subtle': 800,
    'bg-neutral': 700,
    'bg-neutral-bold': 50,
    'text-on-neutral-subtle': 50,
    'text-on-neutral': 50,
    'text-on-neutral-bold': 950,
    'text-neutral': 300,
    'text-neutral-bold': 50,
    'border-neutral': 800,
  },
} as const;
