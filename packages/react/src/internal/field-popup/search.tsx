import type { ComponentProps, ReactNode } from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';

import { fieldListbox } from './styles';
import { TextField } from '../../components/form/text-field';
import { cn } from '../../utils';

export type FieldPopupSearchProps = Omit<ComponentProps<'input'>, 'size' | 'color'> & {
  // The listbox the typed text filters, and the id of the option the keyboard is on in it.
  controls: string;
  activeDescendant: string | undefined;
  asChild?: boolean;
  children?: ReactNode;
};

// The search box at the top of a field popup's list, drawn by Select.SearchField and by
// ChipField's drawer. The combobox wiring goes on the Input, where TextField lets it win over the
// caller's props; the caller's handlers still run first.
export function FieldPopupSearch({
  controls,
  activeDescendant,
  asChild,
  children,
  className,
  style,
  ...props
}: FieldPopupSearchProps) {
  return (
    <TextField
      variant="ghost"
      size="standard"
      autoComplete="off"
      spellCheck={false}
      {...props}
      className={fieldListbox.searchRoot}
    >
      <MagnifyingGlassIcon aria-hidden="true" />
      <TextField.Input
        asChild={asChild}
        type="text"
        role="combobox"
        autoCorrect="off"
        autoCapitalize="none"
        aria-expanded
        aria-controls={controls}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
        data-popup-autofocus=""
        className={cn(fieldListbox.search, className)}
        style={style}
      >
        {asChild ? children : undefined}
      </TextField.Input>
    </TextField>
  );
}
