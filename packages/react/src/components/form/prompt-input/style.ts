import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const promptInputStyle = tv({
  slots: {
    root: 'group/prompt-input grid w-full min-w-0 gap-2',
    textArea: [
      'transition-shadow duration-(--ids-motion-fast) motion-reduce:transition-none',
      'group-data-dragging/prompt-input:inset-ring-(--ids-color-primary)',
    ],
    attachments: 'w-full py-0.5',
    submit: 'ms-auto!',
    tool: [
      'data-pressed:bg-(--control-soft) data-pressed:text-(--control-on-soft)',
      'data-pressed:inset-ring-transparent data-pressed:shadow-none',
    ],
  },
  variants: {
    size: {
      standard: {
        textArea: [
          'concentric-p-1.5 text-body-b2-regular',
          '[&_[data-text-area-bottom]_button]:h-9 [&_[data-text-area-bottom]_button]:min-w-9',
          '[&_[data-text-area-bottom]]:gap-2',
        ],
      },
      tiny: { textArea: ['concentric-p-1', '[&_[data-text-area-bottom]]:gap-1.5'] },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
