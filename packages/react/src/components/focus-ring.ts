export const focusRing = {
  native: 'outline-none focus-visible:ring-[3px] focus-visible:ring-(--ids-color-primary)/40',
  data: 'outline-none data-focus-visible:ring-[3px] data-focus-visible:ring-(--ids-color-primary)/40',
  textField:
    'outline-none has-[[data-text-field]:focus-visible]:ring-[3px] has-[[data-text-field]:focus-visible]:ring-(--ids-color-primary)/40',
} as const;
