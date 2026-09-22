import { invariant } from '../../utils';

export type DateFieldFormat = string | Intl.DateTimeFormatOptions;
/** Small explicit token vocabulary; all other Latin letters must be quoted. */
export function dateFormatter(
  format: DateFieldFormat | undefined,
  locale: string,
): (date: Date) => string {
  if (typeof format !== 'string') {
    invariant(
      !format?.timeZone &&
        !format?.timeStyle &&
        !format?.hour &&
        !format?.minute &&
        !format?.second &&
        !format?.timeZoneName,
      'DateField: format must describe a local date, without time or timeZone.',
    );
    const formatter = new Intl.DateTimeFormat(locale, {
      ...(format ?? { year: 'numeric', month: '2-digit', day: '2-digit' }),
      calendar: 'gregory',
    });
    return (date) => formatter.format(date);
  }
  invariant(format.length > 0, 'DateField: format cannot be empty.');
  const parts: ((date: Date) => string)[] = [];
  const tokenPattern = /^(yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE)/;
  for (let i = 0; i < format.length; ) {
    if (format[i] === "'") {
      if (format[i + 1] === "'") {
        parts.push(() => "'");
        i += 2;
        continue;
      }
      let text = '';
      let closed = false;
      i++;
      while (i < format.length) {
        if (format[i] === "'") {
          if (format[i + 1] === "'") {
            text += "'";
            i += 2;
            continue;
          }
          i++;
          closed = true;
          break;
        }
        text += format[i++];
      }
      invariant(closed, 'DateField: format has an unclosed quote.');
      parts.push(() => text);
      continue;
    }
    const token = format.slice(i).match(tokenPattern)?.[0];
    if (token) {
      if (token === 'MMM' || token === 'MMMM' || token === 'EEE' || token === 'EEEE') {
        const formatter = new Intl.DateTimeFormat(locale, {
          calendar: 'gregory',
          ...(token[0] === 'M'
            ? { month: token === 'MMM' ? 'short' : 'long' }
            : { weekday: token === 'EEE' ? 'short' : 'long' }),
        });
        parts.push((date) => formatter.format(date));
      } else
        parts.push((date) => {
          const n =
            token[0] === 'y'
              ? date.getFullYear()
              : token[0] === 'M'
                ? date.getMonth() + 1
                : date.getDate();
          return token === 'yy'
            ? String(n % 100).padStart(2, '0')
            : token.length > 1
              ? String(n).padStart(token.length, '0')
              : String(n);
        });
      i += token.length;
    } else {
      invariant(
        !/[A-Za-z]/.test(format[i]),
        'DateField: unsupported format token; use yyyy/yy, MMMM/MMM/MM/M, dd/d, EEEE/EEE or quoted literals.',
      );
      const char = format[i++];
      parts.push(() => char);
    }
  }
  return (date) => parts.map((part) => part(date)).join('');
}
