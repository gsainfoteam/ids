import { tv } from '../../../utils';
import { stepPartsStyle } from '../../navigation/stepper/style';

export const timelineStyle = tv({
  extend: stepPartsStyle,
  compoundVariants: [
    { orientation: 'vertical', class: { separator: 'bottom-0' } },
    { orientation: 'vertical', size: 'standard', class: { separator: 'top-8' } },
    { orientation: 'vertical', size: 'tiny', class: { separator: 'top-6' } },
  ],
  defaultVariants: { orientation: 'vertical' },
});
