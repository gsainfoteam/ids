// GENERATED — do not edit manually

export const IDS_NEUTRAL_FAMILIES = ['neutral'] as const;

export const IDS_BRAND_FAMILIES = ['primary', 'secondary', 'tertiary'] as const;

export const IDS_STATUS_FAMILIES = ['success', 'warning', 'danger', 'info'] as const;

export const IDS_COLOR_FAMILIES = ['neutral', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info'] as const;

export const IDS_BASE_SLOTS = ['surface', 'on-surface'] as const;

export const IDS_FAMILY_SLOTS = ['bg-{family}', 'bg-{family}-hover', 'bg-{family}-active', 'bg-{family}-soft', 'bg-{family}-soft-hover', 'bg-{family}-soft-active', 'text-on-{family}', 'text-on-{family}-soft', 'text-{family}', 'border-{family}'] as const;

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
    'surface': 0,
    'on-surface': 900,
    'bg-neutral': 300,
    'bg-neutral-hover': 400,
    'bg-neutral-active': 500,
    'bg-neutral-soft': 100,
    'bg-neutral-soft-hover': 200,
    'bg-neutral-soft-active': 300,
    'text-on-neutral': 950,
    'text-on-neutral-soft': 900,
    'text-neutral': 600,
    'border-neutral': 200,
  },
  dark: {
    'surface': 950,
    'on-surface': 50,
    'bg-neutral': 700,
    'bg-neutral-hover': 600,
    'bg-neutral-active': 500,
    'bg-neutral-soft': 800,
    'bg-neutral-soft-hover': 700,
    'bg-neutral-soft-active': 600,
    'text-on-neutral': 50,
    'text-on-neutral-soft': 50,
    'text-neutral': 400,
    'border-neutral': 800,
  },
} as const;
