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

// Numbers arrive as tel: links, with a "(0)" trunk marker after the country code, in
// full-width digits, or with dots, brackets and spaces.
function tidy(raw: string) {
  return raw
    .normalize('NFKC')
    .replace(/^\s*tel:/i, '')
    .replace(/\(0\)/g, '');
}

export function digitsOf(raw: string) {
  return parseIncompletePhoneNumber(tidy(raw));
}

// A pasted "00 44 20 …" uses the international prefix most of the world dials. It becomes
// "+44 20 …" only when that is a valid number, because some countries (Korea: 001, 002) put a
// carrier code after the 00 that AsYouType already understands.
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

// What the user typed, read in the selected country: national digits, or a number that starts
// with + in any country. The value is E.164 ("+821012345678"), or what was typed of it.
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
  // With a country select beside the input, the calling code lives in the select, so an
  // international number reads nationally once its country is known.
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

// How a stored value reads when nobody is typing it. Only a complete number is rewritten; a
// partial one keeps the as-you-type grouping.
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

// A value that is not E.164 yet (a national number from older data or a form default) is read
// in the selected country.
export function toE164(value: string, country: CountryCode) {
  if (value === '' || value.startsWith('+')) return value;
  return readPhone(value, country, 'auto', false).value;
}

// The country a value belongs to. A chosen country that shares the value's calling code (US and
// Canada share +1) is kept rather than second-guessed.
export function countryOf(value: string, chosen: CountryCode) {
  if (!value.startsWith('+') || value.startsWith(`+${getCountryCallingCode(chosen)}`))
    return chosen;
  const typer = new AsYouType();
  typer.input(value);
  return detect(typer) ?? chosen;
}

// Keeps the national digits and swaps the calling code.
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

const optionsCache = new Map<string, CountryOption[]>();

// Every supported region with its name in the given locale, sorted by that name, so "미국",
// "US" and "+1" all find the United States.
export function countryOptions(locale: string) {
  const cached = optionsCache.get(locale);
  if (cached) return cached;
  let names: Intl.DisplayNames | undefined;
  try {
    names = new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    names = undefined;
  }
  const collator = new Intl.Collator(locale);
  const options = getCountries()
    .map((code) => ({
      code,
      name: names?.of(code) ?? code,
      callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
  optionsCache.set(locale, options);
  return options;
}
