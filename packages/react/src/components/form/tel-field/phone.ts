import { memoize } from 'es-toolkit';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  isValidPhoneNumber,
  parseIncompletePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js/min';

export type { CountryCode } from 'libphonenumber-js/min';
export type TelFieldFormat = 'auto' | 'international' | 'none';

export type ReadPhone = { value: string; text: string; country?: CountryCode };

function tidy(raw: string) {
  return raw
    .normalize('NFKC')
    .replace(/^\s*tel:/i, '')
    .replace(/\(0\)/g, '');
}

export function digitsOf(raw: string) {
  return parseIncompletePhoneNumber(tidy(raw));
}

export function normalizePasted(raw: string) {
  const digits = digitsOf(raw);
  if (digits.startsWith('00') && isValidPhoneNumber(`+${digits.slice(2)}`))
    return `+${digits.slice(2)}`;
  return digits;
}

function detect(typer: AsYouType) {
  const country = typer.getCountry();
  return country && isSupportedCountry(country) ? country : undefined;
}

export function readPhone(
  raw: string,
  country: CountryCode,
  format: TelFieldFormat,
  separateCountry: boolean,
): ReadPhone {
  const digits = digitsOf(raw);
  if (digits === '') return { value: '', text: format === 'none' ? raw : '' };
  const typer = new AsYouType(country);
  const formatted = typer.input(digits);
  const number = typer.getNumber();
  const value = number?.number ?? (digits.startsWith('+') ? digits : '');
  const detected = digits.startsWith('+') ? detect(typer) : undefined;
  const national =
    separateCountry && detected && number && isValidPhoneNumber(number.number)
      ? number.formatNational()
      : undefined;
  return {
    value,
    text: format === 'none' ? raw : (national ?? formatted),
    country: detected,
  };
}

export function presentPhone(
  value: string,
  country: CountryCode,
  format: TelFieldFormat,
  separateCountry: boolean,
) {
  if (value === '' || format === 'none') return value;
  const typer = new AsYouType(country);
  const formatted = typer.input(value);
  const number = typer.getNumber();
  if (!number || !isValidPhoneNumber(number.number)) return formatted;
  const home = separateCountry || (format === 'auto' && number.country === country);
  return home ? number.formatNational() : number.formatInternational();
}

export function toE164(value: string, country: CountryCode) {
  if (value === '' || value.startsWith('+')) return value;
  return readPhone(value, country, 'auto', false).value;
}

export function countryOf(value: string, chosen: CountryCode) {
  if (!value.startsWith('+') || value.startsWith(`+${getCountryCallingCode(chosen)}`))
    return chosen;
  const typer = new AsYouType();
  typer.input(value);
  return detect(typer) ?? chosen;
}

export function withCountry(value: string, from: CountryCode, to: CountryCode) {
  const typer = new AsYouType(from);
  typer.input(value);
  const national = typer.getNumber()?.nationalNumber ?? digitsOf(value).replace(/^\+\d*/, '');
  return national ? `+${getCountryCallingCode(to)}${national}` : '';
}

export function isCompletePhone(value: string) {
  return isValidPhoneNumber(value);
}

export function callingCodeOf(country: CountryCode) {
  return getCountryCallingCode(country);
}

export type CountryOption = { code: CountryCode; name: string; callingCode: string };

export const countryOptions = memoize((locale: string): CountryOption[] => {
  let names: Intl.DisplayNames | undefined;
  try {
    names = new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    names = undefined;
  }
  const collator = new Intl.Collator(locale);
  return getCountries()
    .map((code) => ({
      code,
      name: names?.of(code) ?? code,
      callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
});
