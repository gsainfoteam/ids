import { cloneElement, useEffect, type ReactElement } from 'react';

import {
  Controller,
  FormProvider,
  useForm,
  type ControllerRenderProps,
  type RegisterOptions,
  type UseFormReturn,
} from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  LABEL,
  REQUIRED,
  controls,
  fieldOf,
  plainOf,
  type Check,
  type ControlSpec,
} from './compat-controls';
import { testTheme } from './theme';
import { Field as PlainField, IdsProvider } from '../src';
import { Field } from '../src/react-hook-form';

type Values = { answer: unknown };
type Form = UseFormReturn<Values>;
type Handle = { form?: Form };

const testFor = (spec: ControlSpec, check: Check, title: string) => {
  const reason = spec.open?.[check];
  return reason
    ? test.fails(`${title} [open: ${reason}]`, run(spec, check))
    : test(title, run(spec, check));
};

const blurEverything = () => (document.activeElement as HTMLElement | null)?.blur();

function BridgedForm({
  spec,
  defaultValue,
  rules,
  onForm,
}: {
  spec: ControlSpec;
  defaultValue: unknown;
  rules?: RegisterOptions;
  onForm: (form: Form) => void;
}) {
  const form = useForm<Values>({ defaultValues: { answer: defaultValue } });
  useEffect(() => {
    onForm(form);
  });
  const modeProps =
    spec.rhfMode === 'native'
      ? { registerOptions: rules }
      : { controlMode: spec.rhfMode, registerOptions: rules };
  return (
    <IdsProvider theme={testTheme}>
      <FormProvider {...form}>
        <Field name="answer" {...(modeProps as { registerOptions?: RegisterOptions })}>
          <Field.Label>{LABEL}</Field.Label>
          {spec.control()}
          <Field.Error />
        </Field>
        <output data-testid="dirty">{String(form.formState.isDirty)}</output>
      </FormProvider>
    </IdsProvider>
  );
}

function wired(spec: ControlSpec, field: ControllerRenderProps<Values, 'answer'>) {
  const callback = spec.valueProp === 'checked' ? 'onCheckedChange' : 'onValueChange';
  return {
    [spec.valueProp]: field.value,
    [callback]: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    name: field.name,
  };
}

function ControllerForm({ spec, onForm }: { spec: ControlSpec; onForm: (form: Form) => void }) {
  const form = useForm<Values>({ defaultValues: { answer: spec.defaultValue } });
  useEffect(() => {
    onForm(form);
  });
  return (
    <IdsProvider theme={testTheme}>
      <Controller
        control={form.control}
        name="answer"
        render={({ field }) => (
          <PlainField>
            <PlainField.Label>{LABEL}</PlainField.Label>
            {cloneElement(
              spec.control() as ReactElement<Record<string, unknown>>,
              wired(spec, field),
            )}
          </PlainField>
        )}
      />
    </IdsProvider>
  );
}

const dirty = () => page.getByTestId('dirty');

function run(spec: ControlSpec, check: Check) {
  return async () => {
    const handle: Handle = {};
    const keep = (form: Form) => {
      handle.form = form;
    };
    const answer = () => plainOf(spec, handle.form!.getValues('answer'));

    if (check === 'rhf-field') {
      const screen = await render(
        <BridgedForm spec={spec} defaultValue={spec.defaultValue} onForm={keep} />,
      );
      await spec.shows(screen, spec.defaultValue);

      await spec.edit(screen);

      await expect.poll(answer).toEqual(plainOf(spec, spec.edited));
      await spec.shows(screen, spec.edited);
    }

    if (check === 'rhf-controller') {
      const screen = await render(<ControllerForm spec={spec} onForm={keep} />);
      await spec.shows(screen, spec.defaultValue);

      await spec.edit(screen);

      await expect.poll(answer).toEqual(plainOf(spec, spec.edited));
      await spec.shows(screen, spec.edited);

      blurEverything();
      handle.form!.setFocus('answer');

      await expect.element(spec.focusTarget(screen, spec.edited)).toHaveFocus();
    }

    if (check === 'rhf-reset') {
      const screen = await render(
        <BridgedForm spec={spec} defaultValue={spec.defaultValue} onForm={keep} />,
      );
      await spec.edit(screen);
      await expect.poll(answer).toEqual(plainOf(spec, spec.edited));

      handle.form!.reset();

      await spec.shows(screen, spec.defaultValue);
      expect(answer()).toEqual(plainOf(spec, spec.defaultValue));

      handle.form!.reset({ answer: spec.otherValue });

      await spec.shows(screen, spec.otherValue);
      expect(answer()).toEqual(plainOf(spec, spec.otherValue));
    }

    if (check === 'rhf-focus-error') {
      const onValid = vi.fn();
      const screen = await render(
        <BridgedForm
          spec={spec}
          defaultValue={spec.emptyValue}
          rules={spec.rule ?? { required: REQUIRED }}
          onForm={keep}
        />,
      );
      blurEverything();

      await handle.form!.handleSubmit(onValid)();

      expect(onValid).not.toHaveBeenCalled();
      await expect.element(screen.getByText(REQUIRED)).toBeVisible();
      await expect.element(fieldOf(screen)).toHaveAttribute('data-invalid');
      await expect.element(spec.focusTarget(screen, spec.emptyValue)).toHaveFocus();
    }

    if (check === 'rhf-dirty') {
      const screen = await render(
        <BridgedForm spec={spec} defaultValue={spec.defaultValue} onForm={keep} />,
      );
      await spec.shows(screen, spec.defaultValue);
      await expect.element(dirty()).toHaveTextContent('false');

      await spec.edit(screen);

      await expect.element(dirty()).toHaveTextContent('true');

      handle.form!.reset();

      await expect.element(dirty()).toHaveTextContent('false');
    }
  };
}

describe.each(controls)('$name with react-hook-form', (spec) => {
  testFor(spec, 'rhf-field', 'Field from /react-hook-form: the edit reaches getValues');
  testFor(
    spec,
    'rhf-controller',
    'Controller with no IDS bridge: the edit reaches getValues and setFocus focuses the control',
  );
  testFor(spec, 'rhf-reset', 'reset() shows the default and reset(other) shows the other value');
  testFor(spec, 'rhf-focus-error', 'a submit with an empty required value focuses the control');
  testFor(spec, 'rhf-dirty', 'isDirty turns true after the edit and false after reset()');
});
