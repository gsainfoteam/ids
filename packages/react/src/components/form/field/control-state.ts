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

const isAction = (control: Control) =>
  control.tagName === 'INPUT' && ACTION_TYPES.has(control.type);

function isInPopupOf(root: Element, control: Control) {
  const popup = control.closest('[data-field-popup]');
  return popup !== null && root.contains(popup);
}

function controlsIn(root: Element) {
  return Array.from(root.querySelectorAll<Control>('input, textarea, select')).filter(
    (control) => !isAction(control) && !isInPopupOf(root, control),
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

export function validatesNatively(root: Element) {
  const form = controlsIn(root)[0]?.form;
  return !form?.noValidate;
}

export function formOf(root: Element) {
  return controlsIn(root)[0]?.form ?? null;
}
