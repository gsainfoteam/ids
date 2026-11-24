import { useEffect } from 'react';

import { createFormHook, createFormHookContexts, useForm } from '@tanstack/react-form';
import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  LABEL,
  REQUIRED,
  controls,
  fieldOf,
  isEmptyAnswer,
  plainOf,
  type Check,
  type ControlSpec,
} from './compat-controls';
import { testTheme } from './theme';
import { IdsProvider } from '../src';
import { Field } from '../src/tanstack-form';

type Values = { answer: unknown };

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { Field },
  formComponents: {},
});

const requiredAnswer = ({ value }: { value: unknown }) =>
  isEmptyAnswer(value) ? REQUIRED : undefined;

const useAnswerForm = (defaultValue: unknown) =>
  useForm({ defaultValues: { answer: defaultValue } as Values, onSubmit: () => {} });
const useAppAnswerForm = (defaultValue: unknown) =>
  useAppForm({ defaultValues: { answer: defaultValue } as Values, onSubmit: () => {} });

type Api = ReturnType<typeof useAnswerForm> | ReturnType<typeof useAppAnswerForm>;
type Form = Api;
type Handle = { form?: Form };

const testFor = (spec: ControlSpec, check: Check, title: string) => {
  const reason = spec.open?.[check];
  return reason
    ? test.fails(`${title} [open: ${reason}]`, run(spec, check))
    : test(title, run(spec, check));
};

function States({ dirty, isDefault }: { dirty: boolean; isDefault: boolean }) {
  return (
    <>
      <output data-testid="dirty">{String(dirty)}</output>
      <output data-testid="default">{String(isDefault)}</output>
    </>
  );
}

function BoundForm({
  spec,
  defaultValue,
  validated = false,
  onForm,
}: {
  spec: ControlSpec;
  defaultValue: unknown;
  validated?: boolean;
  onForm: (form: Form) => void;
}) {
  const form = useAnswerForm(defaultValue);
  useEffect(() => {
    onForm(form);
  });
  return (
    <IdsProvider theme={testTheme}>
      <form.Field name="answer" validators={validated ? { onSubmit: requiredAnswer } : undefined}>
        {(field) => (
          <>
            <Field field={field} controlMode={spec.valueProp}>
              <Field.Label>{LABEL}</Field.Label>
              {spec.control()}
              <Field.Error />
            </Field>
            <States dirty={field.state.meta.isDirty} isDefault={field.state.meta.isDefaultValue} />
          </>
        )}
      </form.Field>
    </IdsProvider>
  );
}

function AppFieldForm({ spec, onForm }: { spec: ControlSpec; onForm: (form: Form) => void }) {
  const form = useAppAnswerForm(spec.defaultValue);
  useEffect(() => {
    onForm(form);
  });
  return (
    <IdsProvider theme={testTheme}>
      <form.AppField name="answer">
        {(field) => (
          <field.Field controlMode={spec.valueProp}>
            <Field.Label>{LABEL}</Field.Label>
            {spec.control()}
          </field.Field>
        )}
      </form.AppField>
    </IdsProvider>
  );
}

function run(spec: ControlSpec, check: Check) {
  return async () => {
    const handle: Handle = {};
    const keep = (form: Form) => {
      handle.form = form;
    };
    const answer = () => plainOf(spec, handle.form!.state.values.answer);

    if (check === 'tanstack-field' || check === 'tanstack-app-field') {
      const screen = await render(
        check === 'tanstack-field' ? (
          <BoundForm spec={spec} defaultValue={spec.defaultValue} onForm={keep} />
        ) : (
          <AppFieldForm spec={spec} onForm={keep} />
        ),
      );
      await spec.shows(screen, spec.defaultValue);

      await spec.edit(screen);

      await expect.poll(answer).toEqual(plainOf(spec, spec.edited));
      await spec.shows(screen, spec.edited);
    }

    if (check === 'tanstack-reset') {
      const screen = await render(
        <BoundForm spec={spec} defaultValue={spec.defaultValue} onForm={keep} />,
      );
      await spec.edit(screen);
      await expect.poll(answer).toEqual(plainOf(spec, spec.edited));

      handle.form!.reset();

      await spec.shows(screen, spec.defaultValue);
      expect(answer()).toEqual(plainOf(spec, spec.defaultValue));
    }

    if (check === 'tanstack-dirty') {
      const screen = await render(
        <BoundForm spec={spec} defaultValue={spec.defaultValue} onForm={keep} />,
      );
      await spec.shows(screen, spec.defaultValue);
      await expect.element(page.getByTestId('dirty')).toHaveTextContent('false');
      await expect.element(page.getByTestId('default')).toHaveTextContent('true');
      await expect.element(fieldOf(screen)).not.toHaveAttribute('data-dirty');

      await spec.edit(screen);

      await expect.element(page.getByTestId('dirty')).toHaveTextContent('true');
      await expect.element(page.getByTestId('default')).toHaveTextContent('false');
      await expect.element(fieldOf(screen)).toHaveAttribute('data-dirty');

      handle.form!.reset();

      await expect.element(page.getByTestId('dirty')).toHaveTextContent('false');
      await expect.element(page.getByTestId('default')).toHaveTextContent('true');
      await expect.element(fieldOf(screen)).not.toHaveAttribute('data-dirty');
    }

    if (check === 'tanstack-error') {
      const screen = await render(
        <BoundForm spec={spec} defaultValue={spec.emptyValue} validated onForm={keep} />,
      );
      await expect.element(fieldOf(screen)).not.toHaveAttribute('data-invalid');

      await handle.form!.handleSubmit();

      await expect.element(screen.getByText(REQUIRED)).toBeVisible();
      await expect.element(fieldOf(screen)).toHaveAttribute('data-invalid');
      expect(handle.form!.state.isValid).toBe(false);
    }
  };
}

describe.each(controls)('$name with TanStack Form', (spec) => {
  testFor(spec, 'tanstack-field', 'Field from /tanstack-form: the edit reaches form.state.values');
  testFor(spec, 'tanstack-app-field', 'form.AppField: field.Field binds with no field prop');
  testFor(spec, 'tanstack-reset', 'form.reset() shows the default again');
  testFor(spec, 'tanstack-dirty', 'isDirty and isDefaultValue follow the edit and the reset');
  testFor(spec, 'tanstack-error', 'a submit validator error shows on the field');
});
