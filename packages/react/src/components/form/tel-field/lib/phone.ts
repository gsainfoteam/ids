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

const FOLD_FULL_WIDTH = 'NFKC';
const TEL_LINK_SCHEME = /^\s*tel:/i;
const TRUNK_PREFIX_IN_INTERNATIONAL_FORM = /\(0\)/g;

function tidy(raw: string) {
  return raw
    .normalize(FOLD_FULL_WIDTH)
    .replace(TEL_LINK_SCHEME, '')
    .replace(TRUNK_PREFIX_IN_INTERNATIONAL_FORM, '');
}

export function digitsOf(raw: string) {
  return parseIncompletePhoneNumber(tidy(raw));
}

export function inNationalForm(value: string) {
  return value !== '' && !value.startsWith('+');
}

export function normalizePasted(raw: string) {
  const digits = digitsOf(raw);
  if (!digits.startsWith('00')) return digits;
  const withPlus = `+${digits.slice(2)}`;
  const doubleZeroMeantPlus = isValidPhoneNumber(withPlus);
  return doubleZeroMeantPlus ? withPlus : digits;
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
  const callingCodeMovesToSelect = separateCountry && detected !== undefined;
  const national =
    callingCodeMovesToSelect && number && isValidPhoneNumber(number.number)
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
  if (!number || !isCompletePhone(number.number)) return formatted;
  const home = separateCountry || (format === 'auto' && number.country === country);
  return home ? number.formatNational() : number.formatInternational();
}

export function toE164(value: string, country: CountryCode) {
  if (!inNationalForm(value)) return value;
  return readPhone(value, country, 'auto', false).value;
}

export function countryOf(value: string, chosen: CountryCode) {
  if (!value.startsWith('+')) return chosen;
  const sameCallingCodeAsChosen = value.startsWith(`+${getCountryCallingCode(chosen)}`);
  if (sameCallingCodeAsChosen) return chosen;
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
