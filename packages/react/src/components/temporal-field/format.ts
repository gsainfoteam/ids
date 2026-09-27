import { invariant } from '../../utils';
import { dateFormatter } from '../date-field/format';
import {
  periodLabel,
  resolveTimeFormat,
  type TimeFormat,
  type TimePrecision,
} from '../time-picker/time';
export function temporalFormatter(
  format: string | undefined,
  locale: string,
  precision: TimePrecision,
  hourCycle: TimeFormat | undefined,
  withDate: boolean,
): (date: Date) => string {
  if (format === undefined || format === '12h' || format === '24h') {
    const cycle = resolveTimeFormat(hourCycle ?? (format as TimeFormat | undefined), locale);
    const formatter = new Intl.DateTimeFormat(locale, {
      ...(withDate ? ({ year: 'numeric', month: '2-digit', day: '2-digit' } as const) : {}),
      hour: '2-digit',
      ...(precision !== 'hour' ? ({ minute: '2-digit' } as const) : {}),
      ...(precision === 'second' ? ({ second: '2-digit' } as const) : {}),
      hour12: cycle === '12h',
      calendar: 'gregory',
    });
    return (d) => formatter.format(d);
  }
  const parts: ((d: Date) => string)[] = [];
  for (let i = 0; i < format.length; ) {
    if (format[i] === "'") {
      let end = i + 1;
      if (format[end] === "'") {
        parts.push(() => "'");
        i += 2;
        continue;
      }
      let literal = '';
      let closed = false;
      while (end < format.length) {
        if (format[end] === "'") {
          if (format[end + 1] === "'") {
            literal += "'";
            end += 2;
            continue;
          }
          end++;
          closed = true;
          break;
        }
        literal += format[end++];
      }
      invariant(closed, 'TimeField: unclosed format quote.');
      parts.push(() => literal);
      i = end;
      continue;
    }
    const token = format
      .slice(i)
      .match(/^(yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE|HH|H|hh|h|mm|m|ss|s|a)/)?.[0];
    if (token) {
      if ('yMdE'.includes(token[0])) {
        invariant(withDate, 'TimeField: date tokens require DateTimeField.');
        parts.push(dateFormatter(token, locale));
      } else
        parts.push((d) => {
          if (token === 'a') return periodLabel(d.getHours() < 12 ? 0 : 1, locale);
          const n =
            token[0] === 'H'
              ? d.getHours()
              : token[0] === 'h'
                ? d.getHours() % 12 || 12
                : token[0] === 'm'
                  ? d.getMinutes()
                  : d.getSeconds();
          return String(n).padStart(token.length, '0');
        });
      i += token.length;
    } else {
      invariant(!/[A-Za-z]/.test(format[i]), 'TimeField: unsupported format token.');
      const char = format[i++];
      parts.push(() => char);
    }
  }
  invariant(format.length > 0, 'TimeField: format cannot be empty.');
  return (d) => parts.map((p) => p(d)).join('');
}
