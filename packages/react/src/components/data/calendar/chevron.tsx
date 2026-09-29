import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { type ChevronProps } from 'react-day-picker';

const chevrons = {
  left: ChevronLeftIcon,
  right: ChevronRightIcon,
  up: ChevronUpIcon,
  down: ChevronDownIcon,
};

export function Chevron({ orientation = 'left', className, style }: ChevronProps) {
  const Icon = chevrons[orientation];
  return <Icon aria-hidden="true" className={className} style={style} />;
}
