export type FieldValidityKey = Exclude<keyof ValidityState, 'valid'>;

export type FieldValidity = {
  message: string;
  flags: Partial<Record<FieldValidityKey, true>>;
};

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const VALIDITY_KEYS: FieldValidityKey[] = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'tooLong',
  'tooShort',
  'rangeUnderflow',
  'rangeOverflow',
  'stepMismatch',
  'badInput',
  'customError',
];

const ACTION_TYPES = new Set(['button', 'submit', 'reset', 'image']);

function controlsIn(root: Element) {
  return Array.from(root.querySelectorAll<Control>('input, textarea, select')).filter(
    (control) => !(control.tagName === 'INPUT' && ACTION_TYPES.has(control.type)),
  );
}

function entryOf(control: Control) {
  if (control.tagName === 'INPUT') {
    const input = control as HTMLInputElement;
    if (input.type === 'checkbox' || input.type === 'radio')
      return input.checked ? input.value : '';
    if (input.type === 'file') return Array.from(input.files ?? [], (file) => file.name).join('\n');
  }
  if (control.tagName === 'SELECT' && (control as HTMLSelectElement).multiple)
    return Array.from(
      (control as HTMLSelectElement).selectedOptions,
      (option) => option.value,
    ).join('\n');
  return control.value;
}

// The field reads whatever its control renders: a native input, or the hidden inputs a custom
// control writes for FormData. FormValue's nameless validator only mirrors the value it guards,
// so it is left out.
export function readValue(root: Element) {
  const entries = controlsIn(root)
    .filter((control) => !control.hasAttribute('data-form-value-validator'))
    .map(entryOf);
  return { signature: entries.join('\u0000'), filled: entries.some((entry) => entry !== '') };
}

export function readValidity(root: Element): FieldValidity | null {
  for (const control of controlsIn(root)) {
    if (!control.willValidate || control.validity.valid) continue;
    const flags: FieldValidity['flags'] = {};
    for (const key of VALIDITY_KEYS) if (control.validity[key]) flags[key] = true;
    return { message: control.validationMessage, flags };
  }
  return null;
}

export function sameValidity(a: FieldValidity | null, b: FieldValidity | null) {
  if (a === b) return true;
  if (!a || !b || a.message !== b.message) return false;
  return VALIDITY_KEYS.every((key) => a.flags[key] === b.flags[key]);
}

// A form with noValidate asked the browser to stay out of validation, so the field does too.
export function validatesNatively(root: Element) {
  const form = controlsIn(root)[0]?.form;
  return !form?.noValidate;
}

export function formOf(root: Element) {
  return controlsIn(root)[0]?.form ?? null;
}
