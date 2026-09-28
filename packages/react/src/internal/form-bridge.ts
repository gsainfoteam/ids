import type { ChangeEvent, ReactElement, Ref } from 'react';

import { mergeRefs } from '../utils';

export type ControlMode = 'value' | 'checked';

type Props = Record<string, unknown>;
type Handler = (...args: unknown[]) => void;

function consumerFirstLibraryAlways(props: Props, binding: Props, key: string) {
  return (...args: unknown[]) => {
    (props[key] as Handler | undefined)?.(...args);
    (binding[key] as Handler | undefined)?.(...args);
  };
}

export function mergeBinding(props: Props, binding: Props) {
  const merged = { ...props, ...binding };
  for (const key of Object.keys(binding)) {
    if (/^on[A-Z]/.test(key)) merged[key] = consumerFirstLibraryAlways(props, binding, key);
  }
  merged.ref = mergeRefs(props.ref as Ref<HTMLElement>, binding.ref as Ref<HTMLElement>);
  return merged;
}

export function withoutDefaults({
  defaultValue: _value,
  defaultChecked: _checked,
  ...props
}: Props) {
  return props;
}

export function keepInputControlled(value: unknown, controlMode: ControlMode) {
  if (value !== undefined) return value;
  return controlMode === 'checked' ? false : '';
}

function isEvent(value: unknown) {
  return (
    typeof value === 'object' && value !== null && 'target' in value && 'currentTarget' in value
  );
}

function valueOfNativeChange(event: ChangeEvent<HTMLInputElement>, controlMode: ControlMode) {
  return controlMode === 'checked' ? event.currentTarget.checked : event.currentTarget.value;
}

export function valueReports(
  control: ReactElement,
  controlMode: ControlMode,
  report: (valueOrEvent: unknown) => void,
  { readsNativeEvents }: { readsNativeEvents: boolean },
) {
  const nativeElement = typeof control.type === 'string';
  if (nativeElement)
    return {
      onChange: readsNativeEvents
        ? report
        : (event: ChangeEvent<HTMLInputElement>) => report(valueOfNativeChange(event, controlMode)),
    };
  let reportedThisEdit = false;
  const reportOncePerEdit = (value: unknown) => {
    if (reportedThisEdit) return;
    reportedThisEdit = true;
    queueMicrotask(() => {
      reportedThisEdit = false;
    });
    report(value);
  };
  const reportValueNotForwardedEvent = (next: unknown) => {
    if (!isEvent(next)) reportOncePerEdit(next);
  };
  return {
    [controlMode === 'checked' ? 'onCheckedChange' : 'onValueChange']: reportOncePerEdit,
    onChange: reportValueNotForwardedEvent,
  };
}
