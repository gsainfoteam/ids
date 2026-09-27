/** Move the decimal point without multiplication/division rounding artifacts. */
export function shiftDecimal(value: number, places: number): number {
  const [mantissa, exponent = '0'] = value.toString().split('e');
  return Number(`${mantissa}e${Number(exponent) + places}`);
}

/** Add the decimal representations of JS numbers without introducing 0.1 + 0.2 noise. */
export function addDecimal(left: number, right: number): number {
  const split = (value: number) => {
    const [mantissa, exponent = '0'] = value.toString().split('e');
    const fraction = mantissa.split('.')[1]?.length ?? 0;
    return { digits: BigInt(mantissa.replace('.', '')), scale: fraction - Number(exponent) };
  };
  const a = split(left);
  const b = split(right);
  const scale = Math.max(a.scale, b.scale);
  const sum = a.digits * 10n ** BigInt(scale - a.scale) + b.digits * 10n ** BigInt(scale - b.scale);
  return Number(`${sum}e${-scale}`);
}

export function clampNumber(value: number, min?: number, max?: number) {
  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));
}

export type ParsedNumber = { text: string; value: number | null };

/** Intl is a formatter, not a parser. Accept decimal input and known locale affixes only. */
export function createNumberFormat(locale: string, options?: Intl.NumberFormatOptions) {
  const format = new Intl.NumberFormat(locale, options ?? { maximumSignificantDigits: 21 });
  const decimalFormat = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 20,
    numberingSystem: options?.numberingSystem,
  });
  const parts = decimalFormat.formatToParts(-12345.6);
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const group = parts.find((part) => part.type === 'group')?.value;
  const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
  const digits = new Map<string, string>();
  const digitFormat = new Intl.NumberFormat(locale, {
    useGrouping: false,
    numberingSystem: options?.numberingSystem,
  });
  for (let digit = 0; digit < 10; digit++) digits.set(digitFormat.format(digit), String(digit));
  const affixes = new Set<string>();
  const percentSigns = new Set<string>(['%']);
  for (const sample of [-12345.6, -1, 0, 1, 2, 12345.6]) {
    for (const part of format.formatToParts(sample)) {
      if (part.type === 'currency' || part.type === 'unit') affixes.add(part.value);
      if (part.type === 'percentSign') percentSigns.add(part.value);
    }
  }
  const localize = (text: string) => text.replace('.', decimal);
  function edit(value: number | null): string {
    if (value == null) return '';
    // Expand exponent notation without rounding small values or imposing display precision.
    const [mantissa, exponent] = value.toString().split('e');
    if (exponent == null) return localize(mantissa);
    const negative = mantissa.startsWith('-');
    const [integer, fraction = ''] = mantissa.replace('-', '').split('.');
    const all = integer + fraction;
    const position = integer.length + Number(exponent);
    const expanded =
      position <= 0
        ? `0.${'0'.repeat(-position)}${all}`
        : position >= all.length
          ? all + '0'.repeat(position - all.length)
          : `${all.slice(0, position)}.${all.slice(position)}`;
    return localize(`${negative ? '-' : ''}${expanded}`);
  }
  function parse(raw: string): ParsedNumber | null {
    let text = raw
      .normalize('NFKC')
      .replace(/[\u061c\u200e\u200f]/g, '')
      .trim();
    for (const [glyph, digit] of digits) text = text.split(glyph).join(digit);
    text = text.split(minus).join('-').replace(/−/g, '-');
    let percent = false;
    for (const sign of percentSigns) {
      if (text.includes(sign)) {
        if (options?.style !== 'percent' || text.split(sign).length > 2) return null;
        percent = true;
        text = text.replace(sign, '');
      }
    }
    for (const affix of [...affixes].sort((a, b) => b.length - a.length))
      text = text.split(affix.normalize('NFKC')).join('');
    const accounting = /^\(.*\)$/.test(text.trim());
    if (accounting) text = `-${text.trim().slice(1, -1)}`;
    if (group) text = text.split(group.normalize('NFKC')).join('');
    text = text.replace(/\s/g, '');
    if (decimal !== '.') text = text.split(decimal).join('.');
    if (!/^[+-]?\d*(?:\.\d*)?$/.test(text)) return null;
    if (!/\d/.test(text)) return percent ? null : { text: localize(text), value: null };
    let value = Number(text);
    if (percent) value = shiftDecimal(value, -2);
    if (!Number.isFinite(value)) return null;
    if (Object.is(value, -0)) value = 0;
    return { text: percent ? edit(value) : localize(text), value };
  }
  return {
    format: (value: number | null) => (value == null ? '' : format.format(value)),
    edit,
    parse,
    allowsKey: (key: string) =>
      /^[0-9+\-−]$/.test(key) ||
      digits.has(key) ||
      key === decimal ||
      key === group ||
      (key === '.' && group !== '.'),
  };
}
