import {
  use,
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type Ref,
  type RefCallback,
} from 'react';

import { mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { FieldLabelContext, FieldSizeContext } from '../../form/field/context';

// Anything a label can stand for. A native input, select, textarea or button is labelled by the
// browser itself; the ARIA widgets are not, so the label does that part by hand.
const CONTROL = [
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'button',
  '[role="slider"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="radiogroup"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="spinbutton"]',
  '[role="textbox"]',
  '[contenteditable="true"]',
].join(',');

const TOGGLES = '[role="checkbox"],[role="switch"],[role="radio"]';
const WATCHED = ['disabled', 'required', 'aria-disabled', 'aria-required', 'data-disabled'];
const DISABLED = 1;
const REQUIRED = 2;

// The control a click and a name have to be forwarded to, when the browser will not do it.
function customControl(label: HTMLLabelElement, htmlFor: string | undefined) {
  if (label.control) return null;
  const target = htmlFor ? label.ownerDocument.getElementById(htmlFor) : label;
  if (!target) return null;
  if (target !== label && target.matches(CONTROL)) return target;
  const inner = target.querySelector<HTMLElement>(CONTROL);
  if (inner) return inner;
  return target !== label && target.tabIndex >= 0 ? target : null;
}

function controlOf(label: HTMLLabelElement | null, htmlFor: string | undefined) {
  if (!label) return null;
  return label.control ?? customControl(label, htmlFor);
}

function readState(control: HTMLElement | null) {
  if (!control) return 0;
  const disabled =
    control.matches(':disabled') ||
    control.getAttribute('aria-disabled') === 'true' ||
    control.hasAttribute('data-disabled');
  const required =
    (control as HTMLInputElement).required === true ||
    control.getAttribute('aria-required') === 'true';
  return (disabled ? DISABLED : 0) | (required ? REQUIRED : 0);
}

export type UseLabelOptions = {
  id: string | undefined;
  htmlFor: string | undefined;
  disabled: boolean | undefined;
  required: boolean | undefined;
  ref: Ref<HTMLLabelElement> | undefined;
};

export function useLabel({ id, htmlFor, disabled, required, ref }: UseLabelOptions) {
  const generatedId = useId();
  const labelId = id ?? generatedId;
  const [node, setNode] = useState<HTMLLabelElement | null>(null);
  const mergedRef: RefCallback<HTMLLabelElement> = useCallback(
    (element: HTMLLabelElement | null) => mergeRefs(setNode, ref)(element),
    [ref],
  );

  // The label mirrors its control, so `disabled` or `required` set on the input shows here too,
  // and follows it when it changes later. A label given both has nothing to mirror, so it keeps
  // no observer on the control.
  const mirroring = disabled === undefined || required === undefined;
  const subscribe = useCallback(
    (notify: () => void) => {
      const control = mirroring ? controlOf(node, htmlFor) : null;
      if (!control) return () => {};
      const observer = new MutationObserver(notify);
      observer.observe(control, { attributes: true, attributeFilter: WATCHED });
      return () => observer.disconnect();
    },
    [node, htmlFor, mirroring],
  );
  const mirrored = useSyncExternalStore(
    subscribe,
    () => (mirroring ? readState(controlOf(node, htmlFor)) : 0),
    () => 0,
  );

  const fieldLabel = use(FieldLabelContext);

  // A div with role="slider" is not labelable, so htmlFor would name nothing. The label names it
  // by reference instead and hands the attribute back when it goes away.
  useEffect(() => {
    if (!node || fieldLabel) return;
    const control = customControl(node, htmlFor);
    if (!control || control.hasAttribute('aria-labelledby') || control.hasAttribute('aria-label'))
      return;
    control.setAttribute('aria-labelledby', labelId);
    return () => {
      if (control.getAttribute('aria-labelledby') === labelId)
        control.removeAttribute('aria-labelledby');
    };
  }, [node, htmlFor, labelId, fieldLabel]);

  const insideField = use(FieldSizeContext) !== undefined;
  useEffect(() => {
    if (!isDevelopment || !node || fieldLabel) return;
    const control = controlOf(node, htmlFor);
    // A label wrapping its own control, such as an option of a CheckboxGroup, names that control
    // rather than the field, so only a label standing apart from its control is taken for a
    // misplaced Field.Label.
    if (insideField && !(control && node.contains(control)))
      console.warn('[IDS] Label: inside a Field, use Field.Label instead.');
    else if (!control)
      console.warn('[IDS] Label: it is not linked to a control. Wrap the control or set htmlFor.');
  }, [node, htmlFor, insideField, fieldLabel]);

  const state = {
    disabled: disabled ?? (mirrored & DISABLED) !== 0,
    required: required ?? (mirrored & REQUIRED) !== 0,
  };

  // The browser moves focus for native controls on its own; this covers the rest the same way,
  // and toggles a checkbox-like widget as a native label would.
  const onLabelClick = (event: MouseEvent<HTMLLabelElement>) => {
    if (event.defaultPrevented || !node || state.disabled) return;
    const control = customControl(node, htmlFor);
    if (!control || control.contains(event.target as Node)) return;
    control.focus();
    if (control.matches(TOGGLES)) control.click();
  };

  return { labelId, labelRef: mergedRef, state, onLabelClick };
}
