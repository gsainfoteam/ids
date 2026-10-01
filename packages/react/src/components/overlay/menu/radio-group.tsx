'use client';

import { RadioContext } from './context';
import { MenuGroup } from './group';

import type { Menu } from '.';

export function MenuRadioGroup({ value, onValueChange, children, ...props }: Menu.RadioGroupProps) {
  const choose = (next: string) => {
    if (next !== value) onValueChange?.(next);
  };

  return (
    <RadioContext value={{ value, setValue: choose }}>
      <MenuGroup {...props}>{children}</MenuGroup>
    </RadioContext>
  );
}

MenuRadioGroup.displayName = 'Menu.RadioGroup';
