import { type ComponentProps, type ReactNode } from 'react';

import { useTelContext } from './context';
import { callingCodeOf, countryOptions, type CountryCode } from './phone';
import { messages } from '../../../internal/messages';
import { Select } from '../select';

export type TelFieldCountrySelectProps = Omit<ComponentProps<'button'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode;
  searchPlaceholder?: string;
};

export function TelFieldCountrySelect({
  asChild,
  children,
  className,
  searchPlaceholder,
  'aria-label': ariaLabel,
  ...props
}: TelFieldCountrySelectProps) {
  const { field, state, locale, styles } = useTelContext('CountrySelect');
  return (
    <Select
      value={field.country}
      onValueChange={(next) => {
        if (typeof next === 'string') field.changeCountry(next as CountryCode);
      }}
      aria-label={ariaLabel ?? messages.telField.country}
      disabled={state.disabled}
      readOnly={state.readOnly}
      size={state.size}
      variant="ghost"
      className={styles.country({ className })}
    >
      <Select.Trigger {...props} asChild={asChild} className={styles.countryTrigger()}>
        {asChild ? (
          children
        ) : (
          <>
            <Select.Value className={styles.countryValue()}>
              {field.country} +{callingCodeOf(field.country)}
            </Select.Value>
            <Select.Icon />
          </>
        )}
      </Select.Trigger>
      <Select.Content>
        <Select.SearchField placeholder={searchPlaceholder ?? messages.telField.countrySearch} />
        {countryOptions(locale).map((option) => (
          <Select.Item
            key={option.code}
            value={option.code}
            searchValue={`${option.name} ${option.code} +${option.callingCode}`}
          >
            <span className={styles.countryName()}>{option.name}</span>
            <span className={styles.countryCode()}>+{option.callingCode}</span>
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}

TelFieldCountrySelect.displayName = 'TelField.CountrySelect';
