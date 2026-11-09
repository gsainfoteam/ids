import { tv } from '../../../utils';

export const promptInputStyle = tv({
  slots: {
    root: 'group/prompt-input grid w-full min-w-0 gap-2',
    textArea: [
      'transition-shadow duration-(--ids-motion-fast) motion-reduce:transition-none',
      'group-data-dragging/prompt-input:inset-ring-(--ids-color-primary)',
    ],
    attachments: 'w-full py-0.5',
    submit: 'ms-auto!',
  },
});
