'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { Select } from '../../select';
import { useInternalTelContext } from '../context';
import { callingCodeOf, countryOptions, type CountryCode } from '../lib/phone';

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
  const t = useInternalTranslate();

  const { field, state, locale, styles } = useInternalTelContext('CountrySelect');
  return (
    <Select
      value={field.country}
      onValueChange={(next) => {
        if (typeof next === 'string') field.changeCountry(next as CountryCode);
      }}
      aria-label={ariaLabel ?? t('telField.country')}
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
        <Select.SearchField placeholder={searchPlaceholder ?? t('telField.countrySearch')} />
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
