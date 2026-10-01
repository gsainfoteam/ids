import { useEffect } from 'react';

import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field } from '../src/react-hook-form';

type StepperProps = {
  id?: string;
  value?: number;
  onValueChange?: (value: number) => void;
  onBlur?: () => void;
  'aria-invalid'?: boolean;
};

function Stepper({
  id,
  value = 0,
  onValueChange,
  onBlur,
  'aria-invalid': ariaInvalid,
}: StepperProps) {
  return (
    <button
      id={id}
      type="button"
      aria-invalid={ariaInvalid}
      onBlur={onBlur}
      onClick={() => onValueChange?.(value + 1)}
    >
      {String(value)}
    </button>
  );
}

test('value mode binds onValueChange as well as onChange, and keeps the consumer handler', async () => {
  let methods!: UseFormReturn<{ count: number }>;
  const seen: number[] = [];
  function App() {
    const form = useForm({ defaultValues: { count: 1 } });
    useEffect(() => {
      methods = form;
    });
    return (
      <FormProvider {...form}>
        <Field name="count" controlMode="value">
          <Field.Label>Count</Field.Label>
          <Stepper onValueChange={(next) => seen.push(next)} />
        </Field>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const button = screen.getByRole('button', { name: 'Count' });
  await expect.element(button).toHaveTextContent('1');
  await userEvent.click(button);
  expect(methods.getValues('count')).toBe(2);
  await expect.element(button).toHaveTextContent('2');
  expect(seen).toEqual([2]);
  methods.setValue('count', 7);
  await expect.element(button).toHaveTextContent('7');
});
