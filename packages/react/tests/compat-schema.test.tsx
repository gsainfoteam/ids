import type { ReactElement } from 'react';

import { useForm as useConformForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDate } from '@internationalized/date';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { z } from 'zod';

import {
  Button,
  Checkbox,
  DateField,
  Field as PlainField,
  FileField,
  NumberField,
  Select,
  TextField,
} from '../src';
import { Field } from '../src/react-hook-form';

type Values = {
  name: string;
  seats: number | null;
  fruit: string | null;
  agree: boolean;
  date: CalendarDate | null;
  resume: File | null;
};

type Key = keyof Values;

const today = new CalendarDate(2026, 9, 15);
const resume = new File(['body'], 'resume.pdf', { type: 'application/pdf', lastModified: 1 });

const messages = {
  name: 'Enter a name',
  seats: 'Enter the seats',
  fruit: 'Pick a fruit',
  agree: 'Accept the terms',
  date: 'Pick a date',
  resume: 'Attach a resume',
} satisfies Record<Key, string>;

const empty: Values = {
  name: '',
  seats: null,
  fruit: null,
  agree: false,
  date: null,
  resume: null,
};

const valid: Values = {
  name: 'Ada',
  seats: 3,
  fruit: 'cherry',
  agree: true,
  date: new CalendarDate(2026, 9, 18),
  resume,
};

const filled = <T,>(value: T | null) => value !== null;

const zodSchema = z.object({
  name: z.string().trim().min(1, messages.name),
  seats: z.number().nullable().refine(filled, messages.seats),
  fruit: z.string().nullable().refine(filled, messages.fruit),
  agree: z.literal(true, { error: messages.agree }),
  date: z.instanceof(CalendarDate).nullable().refine(filled, messages.date),
  resume: z.instanceof(File).nullable().refine(filled, messages.resume),
});

const valibotSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, messages.name)),
  seats: v.pipe(v.nullable(v.number()), v.check(filled, messages.seats)),
  fruit: v.pipe(v.nullable(v.string()), v.check(filled, messages.fruit)),
  agree: v.literal(true, messages.agree),
  date: v.pipe(v.nullable(v.instance(CalendarDate)), v.check(filled, messages.date)),
  resume: v.pipe(v.nullable(v.instance(File)), v.check(filled, messages.resume)),
});

const resolvers: { library: string; resolver: () => Resolver<Values> }[] = [
  { library: 'zod (zodResolver)', resolver: () => zodResolver(zodSchema) as Resolver<Values> },
  {
    library: 'valibot (standardSchemaResolver)',
    resolver: () => standardSchemaResolver(valibotSchema) as Resolver<Values>,
  },
];

const labelOf = {
  name: 'Name',
  seats: 'Seats',
  fruit: 'Fruit',
  agree: 'Agree',
  date: 'Date',
  resume: 'Resume',
} satisfies Record<Key, string>;

const labelled = (role: Parameters<typeof page.getByRole>[0], key: Key) =>
  page.getByRole(role, { name: labelOf[key], exact: true });
const calendarDay = (key: string) =>
  page.elementLocator(document.querySelector(`[data-calendar-day="${key}"]`)!);
const fileInput = () => document.querySelector<HTMLInputElement>('input[type=file]')!;

type Control = {
  control: string;
  key: Key;
  draw: () => ReactElement;
  fill: () => Promise<void>;
  takesFocus: () => Locator;
};

const controls: Control[] = [
  {
    control: 'TextField',
    key: 'name',
    draw: () => (
      <Field name="name">
        <Field.Label>{labelOf.name}</Field.Label>
        <TextField />
        <Field.Error />
      </Field>
    ),
    fill: () => userEvent.fill(labelled('textbox', 'name'), '  Ada  '),
    takesFocus: () => labelled('textbox', 'name'),
  },
  {
    control: 'NumberField',
    key: 'seats',
    draw: () => (
      <Field name="seats" controlMode="value">
        <Field.Label>{labelOf.seats}</Field.Label>
        <NumberField />
        <Field.Error />
      </Field>
    ),
    fill: () => userEvent.fill(labelled('spinbutton', 'seats'), '3'),
    takesFocus: () => labelled('spinbutton', 'seats'),
  },
  {
    control: 'Select',
    key: 'fruit',
    draw: () => (
      <Field name="fruit" controlMode="value">
        <Field.Label>{labelOf.fruit}</Field.Label>
        <Select>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="cherry">Cherry</Select.Item>
        </Select>
        <Field.Error />
      </Field>
    ),
    fill: async () => {
      await userEvent.click(labelled('combobox', 'fruit'));
      await userEvent.click(page.getByRole('option', { name: 'Cherry' }));
    },
    takesFocus: () => labelled('combobox', 'fruit'),
  },
  {
    control: 'Checkbox',
    key: 'agree',
    draw: () => (
      <Field name="agree" controlMode="checked">
        <Field.Label>{labelOf.agree}</Field.Label>
        <Checkbox />
        <Field.Error />
      </Field>
    ),
    fill: () => userEvent.click(labelled('checkbox', 'agree')),
    takesFocus: () => labelled('checkbox', 'agree'),
  },
  {
    control: 'DateField',
    key: 'date',
    draw: () => (
      <Field name="date" controlMode="value">
        <Field.Label>{labelOf.date}</Field.Label>
        <DateField>
          <DateField.Calendar today={today} />
        </DateField>
        <Field.Error />
      </Field>
    ),
    fill: async () => {
      await userEvent.click(labelled('combobox', 'date'));
      await userEvent.click(calendarDay('2026-09-18'));
    },
    takesFocus: () => labelled('combobox', 'date'),
  },
  {
    control: 'FileField',
    key: 'resume',
    draw: () => (
      <Field name="resume" controlMode="value">
        <Field.Label>{labelOf.resume}</Field.Label>
        <FileField />
        <Field.Error />
      </Field>
    ),
    fill: () => userEvent.upload(fileInput(), [resume]),
    takesFocus: () => labelled('button', 'resume'),
  },
];

function RhfForm({
  resolver,
  defaultValues,
  onValid,
}: {
  resolver: Resolver<Values>;
  defaultValues: Values;
  onValid: (values: Values) => void;
}) {
  const methods = useForm<Values>({ resolver, defaultValues });

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(onValid)}>
        {controls.map(({ key, draw }) => (
          <div key={key}>{draw()}</div>
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}

const validUpTo = (index: number): Values => {
  const values = { ...empty };
  for (const { key } of controls.slice(0, index)) {
    Object.assign(values, { [key]: valid[key] });
  }
  return values;
};

describe.each(resolvers)('react-hook-form with $library', ({ resolver }) => {
  test.each(controls.map((control, index) => ({ ...control, index })))(
    '$control: its message shows in Field.Error and it takes focus as the first invalid field',
    async ({ key, index, takesFocus }) => {
      const onValid = vi.fn();
      await render(
        <RhfForm resolver={resolver()} defaultValues={validUpTo(index)} onValid={onValid} />,
      );

      await userEvent.click(page.getByRole('button', { name: 'Submit' }));

      await expect.element(page.getByText(messages[key], { exact: true })).toBeVisible();
      await expect.element(takesFocus()).toHaveFocus();
      await expect.element(takesFocus()).toHaveAttribute('aria-invalid', 'true');
      await expect.element(takesFocus()).toHaveAccessibleDescription(messages[key]);
      for (const later of controls.slice(index + 1)) {
        await expect.element(page.getByText(messages[later.key], { exact: true })).toBeVisible();
      }
      expect(onValid).not.toHaveBeenCalled();
    },
  );

  test('valid input submits the parsed values', async () => {
    const onValid = vi.fn();
    await render(<RhfForm resolver={resolver()} defaultValues={empty} onValid={onValid} />);

    for (const { fill } of controls) await fill();
    await userEvent.click(page.getByRole('button', { name: 'Submit' }));

    await expect.poll(() => onValid.mock.calls.length).toBe(1);
    const submitted = onValid.mock.calls[0]![0] as Values;
    expect(submitted).toEqual({ ...valid, resume: expect.any(File) });
    expect(submitted.date).toBeInstanceOf(CalendarDate);
    expect(submitted.resume?.name).toBe('resume.pdf');
  });
});

const conformSchema = z.object({
  name: z.string({ error: messages.name }).trim().min(1, messages.name),
  fruit: z.string({ error: messages.fruit }),
  agree: z.boolean({ error: messages.agree }),
  date: z.iso.date({ error: messages.date }),
});

type ConformValues = z.output<typeof conformSchema>;

function ConformForm({ onValid }: { onValid: (values: ConformValues) => void }) {
  const [form, fields] = useConformForm({
    onValidate: ({ formData }) => parseWithZod(formData, { schema: conformSchema }),
    onSubmit: (event, { submission }) => {
      event.preventDefault();
      if (submission?.status === 'success') onValid(submission.value);
    },
  });

  return (
    <form id={form.id} noValidate onSubmit={form.onSubmit}>
      <PlainField invalid={fields.name.errors !== undefined}>
        <PlainField.Label>{labelOf.name}</PlainField.Label>
        <TextField name={fields.name.name} />
        <PlainField.Error>{fields.name.errors?.[0]}</PlainField.Error>
      </PlainField>
      <PlainField invalid={fields.fruit.errors !== undefined}>
        <PlainField.Label>{labelOf.fruit}</PlainField.Label>
        <Select name={fields.fruit.name}>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="cherry">Cherry</Select.Item>
        </Select>
        <PlainField.Error>{fields.fruit.errors?.[0]}</PlainField.Error>
      </PlainField>
      <PlainField invalid={fields.agree.errors !== undefined}>
        <PlainField.Label>{labelOf.agree}</PlainField.Label>
        <Checkbox name={fields.agree.name} />
        <PlainField.Error>{fields.agree.errors?.[0]}</PlainField.Error>
      </PlainField>
      <PlainField invalid={fields.date.errors !== undefined}>
        <PlainField.Label>{labelOf.date}</PlainField.Label>
        <DateField name={fields.date.name}>
          <DateField.Calendar today={today} />
        </DateField>
        <PlainField.Error>{fields.date.errors?.[0]}</PlainField.Error>
      </PlainField>
      <Button type="submit">Submit</Button>
    </form>
  );
}

const conformControls = controls.filter(({ key }) =>
  (['name', 'fruit', 'agree', 'date'] as Key[]).includes(key),
);

describe('Conform with parseWithZod', () => {
  test.each(conformControls)(
    '$control: the client validation message shows in Field.Error and marks it invalid',
    async ({ key, takesFocus }) => {
      const onValid = vi.fn();
      await render(<ConformForm onValid={onValid} />);

      await userEvent.click(page.getByRole('button', { name: 'Submit' }));

      await expect.element(page.getByText(messages[key], { exact: true })).toBeVisible();
      await expect.element(takesFocus()).toHaveAttribute('aria-invalid', 'true');
      await expect.element(takesFocus()).toHaveAccessibleDescription(messages[key]);
      expect(onValid).not.toHaveBeenCalled();
    },
  );

  test('a valid submit reaches onSubmit with the parsed values', async () => {
    const onValid = vi.fn();
    await render(<ConformForm onValid={onValid} />);

    for (const { fill } of conformControls) await fill();
    await userEvent.click(page.getByRole('button', { name: 'Submit' }));

    await expect.poll(() => onValid.mock.calls.length).toBe(1);
    expect(onValid).toHaveBeenCalledWith({
      name: 'Ada',
      fruit: 'cherry',
      agree: true,
      date: '2026-09-18',
    });
  });
});
