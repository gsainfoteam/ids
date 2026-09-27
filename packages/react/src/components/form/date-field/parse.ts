import { dateAt, dateFormat, validDate } from '../../data/calendar/date';

type Part = 'year' | 'month' | 'day';

// The order a locale writes a numeric date in: year-month-day for ko, month-day-year for en-US,
// day-month-year for de.
function localeOrder(locale: string): Part[] {
  return dateFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(dateAt(2026, 8, 15))
    .map((part) => part.type)
    .filter((type): type is Part => type === 'year' || type === 'month' || type === 'day');
}

function fromParts(parts: Record<Part, string>): Date | undefined {
  const month = Number(parts.month);
  const day = Number(parts.day);
  // A two-digit year is read in this century, the way people write 26 for 2026.
  const year = parts.year.length <= 2 ? 2000 + Number(parts.year) : Number(parts.year);
  if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1) return undefined;
  const date = dateAt(year, month - 1, day);
  return validDate(date) && date.getMonth() === month - 1 ? date : undefined;
}

// Reads a typed date: ISO and other year-first forms (2026-09-15, 2026. 9. 15., 2026년 9월 15일),
// the locale's own numeric order (9/15/2026 in en-US, 15.09.2026 in de), and bare digits
// (20260915, or 09152026 in en-US) as a phone number pad can type them. Month names are not read.
export function parseDateText(text: string, locale: string): Date | undefined {
  const normalized = text.normalize('NFKC').trim();
  if (!normalized) return undefined;
  const order = localeOrder(locale);
  const digits = normalized.replace(/\D/g, '');
  const groups = normalized.match(/\d+/g) ?? [];

  if (groups.length === 1 && (digits.length === 8 || digits.length === 6)) {
    const yearWidth = digits.length === 8 ? 4 : 2;
    const read = (sequence: Part[]) => {
      const parts = {} as Record<Part, string>;
      let at = 0;
      for (const part of sequence) {
        const width = part === 'year' ? yearWidth : 2;
        parts[part] = digits.slice(at, at + width);
        at += width;
      }
      return fromParts(parts);
    };
    // Eight digits are tried year-first before the locale order, so 20260915 reads the same in
    // every locale while 09152026 still reads as en-US.
    return (digits.length === 8 ? read(['year', 'month', 'day']) : undefined) ?? read(order);
  }

  if (groups.length !== 3) return undefined;
  const sequence: Part[] = groups[0].length >= 3 ? ['year', 'month', 'day'] : order;
  const parts = {} as Record<Part, string>;
  sequence.forEach((part, index) => (parts[part] = groups[index]));
  return fromParts(parts);
}

// What an empty date input shows: the locale's numeric order with letters for the digits,
// YYYY. MM. DD. in ko and MM/DD/YYYY in en-US.
export function dateInputHint(locale: string): string {
  return dateFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(dateAt(2026, 8, 15))
    .map((part) =>
      part.type === 'year'
        ? 'YYYY'
        : part.type === 'month'
          ? 'MM'
          : part.type === 'day'
            ? 'DD'
            : part.value,
    )
    .join('');
}
