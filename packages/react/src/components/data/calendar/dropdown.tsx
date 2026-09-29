import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { type DropdownProps } from 'react-day-picker';

import { useCalendarContext } from './context';

export function Dropdown({ options, className, ...props }: DropdownProps) {
  const c = useCalendarContext('Calendar');
  const selected = options?.find((option) => option.value === props.value);
  return (
    <span data-disabled={props.disabled ? '' : undefined} className={c.styles.dropdownRoot()}>
      <select {...props} data-field-input="" className={c.styles.dropdown({ className })}>
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className={c.styles.dropdownLabel()}>
        {selected?.label}
        <ChevronDownIcon />
      </span>
    </span>
  );
}
