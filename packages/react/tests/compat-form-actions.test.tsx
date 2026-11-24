import { useActionState, type ReactElement } from 'react';

import { CalendarDate } from '@internationalized/date';
import { useFormStatus } from 'react-dom';
import { describe, expect, test, vi } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  Button,
  Checkbox,
  CheckboxGroup,
  ChipField,
  DateField,
  Field,
  FileField,
  NumberField,
  RadioGroup,
  Rating,
  Select,
  Slider,
  Switch,
  TextField,
} from '../src';

const NAME = 'answer';
const LABEL = 'Answer';
const FORM_LABEL = 'Compat form';

type Spec = {
  control: string;
  draw: () => ReactElement;
  defaults: string[];
  edit: () => Promise<void>;
  edited: string[];
  showsDefault: () => Promise<void>;
  marksInvalid: () => Locator;
};

const file = (name: string) =>
  new File(['body'], name, { type: 'application/pdf', lastModified: 1 });
const describeEntry = ([key, value]: [string, FormDataEntryValue]) =>
  `${key}=${value instanceof File ? `file:${value.name}` : value}`;
const answersIn = (data: FormData) => [...data].filter(([key]) => key === NAME).map(describeEntry);
const expected = (values: string[]) => values.map((value) => `${NAME}=${value}`);
const formElement = () => page.getByRole('form', { name: FORM_LABEL }).element() as HTMLFormElement;
const answersOnScreen = () => answersIn(new FormData(formElement()));
const picker = () => formElement().querySelector<HTMLInputElement>('input[type=file]')!;
const labelled = (role: Parameters<typeof page.getByRole>[0]) =>
  page.getByRole(role, { name: LABEL, exact: true });
const calendarDay = (key: string) =>
  page.elementLocator(document.querySelector(`[data-calendar-day="${key}"]`)!);
const replaceText = async (locator: Locator, text: string) => {
  await userEvent.fill(locator, text);
  (locator.element() as HTMLElement).blur();
};

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

const fruits = (
  <>
    <Select.Item value="apple">Apple</Select.Item>
    <Select.Item value="banana">Banana</Select.Item>
    <Select.Item value="cherry">Cherry</Select.Item>
  </>
);
const letters = ['a', 'b', 'c'];
const today = new CalendarDate(2026, 9, 15);

const specs: Spec[] = [
  {
    control: 'TextField',
    draw: () => <TextField name={NAME} defaultValue="hello" />,
    defaults: ['hello'],
    edit: () => replaceText(labelled('textbox'), 'changed'),
    edited: ['changed'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('hello'),
    marksInvalid: () => labelled('textbox'),
  },
  {
    control: 'NumberField',
    draw: () => <NumberField name={NAME} defaultValue={5} />,
    defaults: ['5'],
    edit: () => replaceText(labelled('spinbutton'), '12'),
    edited: ['12'],
    showsDefault: () => expect.element(labelled('spinbutton')).toHaveValue('5'),
    marksInvalid: () => labelled('spinbutton'),
  },
  {
    control: 'Select single',
    draw: () => (
      <Select name={NAME} defaultValue="apple">
        {fruits}
      </Select>
    ),
    defaults: ['apple'],
    edit: async () => {
      await userEvent.click(labelled('combobox'));
      await userEvent.click(page.getByRole('option', { name: 'Cherry' }));
    },
    edited: ['cherry'],
    showsDefault: () => expect.element(labelled('combobox')).toMatchTextContent('Apple'),
    marksInvalid: () => labelled('combobox'),
  },
  {
    control: 'Select multiple',
    draw: () => (
      <Select selectionMode="multiple" name={NAME} defaultValue={['apple', 'banana']}>
        {fruits}
      </Select>
    ),
    defaults: ['apple', 'banana'],
    edit: async () => {
      await userEvent.click(labelled('combobox'));
      await userEvent.click(page.getByRole('option', { name: 'Cherry' }));
      await userEvent.keyboard('{Escape}');
    },
    edited: ['apple', 'banana', 'cherry'],
    showsDefault: () => expect.element(labelled('combobox')).not.toMatchTextContent('Cherry'),
    marksInvalid: () => labelled('combobox'),
  },
  {
    control: 'Checkbox',
    draw: () => <Checkbox name={NAME} value="yes" />,
    defaults: [],
    edit: () => userEvent.click(labelled('checkbox')),
    edited: ['yes'],
    showsDefault: () => expect.element(labelled('checkbox')).not.toBeChecked(),
    marksInvalid: () => labelled('checkbox'),
  },
  {
    control: 'CheckboxGroup',
    draw: () => (
      <CheckboxGroup<string> name={NAME} defaultValue={['a', 'c']}>
        {({ Item }) =>
          letters.map((value) => <Item key={value} value={value} aria-label={value} />)
        }
      </CheckboxGroup>
    ),
    defaults: ['a', 'c'],
    edit: () => userEvent.click(page.getByRole('checkbox', { name: 'b' })),
    edited: ['a', 'b', 'c'],
    showsDefault: () => expect.element(page.getByRole('checkbox', { name: 'b' })).not.toBeChecked(),
    marksInvalid: () => page.getByRole('group', { name: LABEL }),
  },
  {
    control: 'RadioGroup',
    draw: () => (
      <RadioGroup<string> name={NAME} defaultValue="b">
        {({ Item }) =>
          letters.map((value) => <Item key={value} value={value} aria-label={value} />)
        }
      </RadioGroup>
    ),
    defaults: ['b'],
    edit: () => userEvent.click(page.getByRole('radio', { name: 'c' })),
    edited: ['c'],
    showsDefault: () => expect.element(page.getByRole('radio', { name: 'b' })).toBeChecked(),
    marksInvalid: () => page.getByRole('radiogroup', { name: LABEL }),
  },
  {
    control: 'Switch',
    draw: () => <Switch name={NAME} value="on" />,
    defaults: [],
    edit: () => userEvent.click(labelled('switch')),
    edited: ['on'],
    showsDefault: () => expect.element(labelled('switch')).not.toBeChecked(),
    marksInvalid: () => labelled('switch'),
  },
  {
    control: 'Slider',
    draw: () => <Slider name={NAME} defaultValue={30} />,
    defaults: ['30'],
    edit: async () => {
      (labelled('slider').element() as HTMLElement).focus();
      await userEvent.keyboard('{ArrowRight}');
    },
    edited: ['31'],
    showsDefault: () => expect.element(labelled('slider')).toHaveAttribute('aria-valuenow', '30'),
    marksInvalid: () => labelled('slider'),
  },
  {
    control: 'DateField',
    draw: () => (
      <DateField name={NAME} defaultValue={today}>
        <DateField.Calendar today={today} />
      </DateField>
    ),
    defaults: ['2026-09-15'],
    edit: async () => {
      await userEvent.click(labelled('combobox'));
      await userEvent.click(calendarDay('2026-09-18'));
    },
    edited: ['2026-09-18'],
    showsDefault: () => expect.element(labelled('combobox')).toMatchTextContent('2026. 09. 15.'),
    marksInvalid: () => labelled('combobox'),
  },
  {
    control: 'FileField',
    draw: () => <FileField name={NAME} />,
    defaults: [],
    edit: () => userEvent.upload(picker(), [file('report.pdf')]),
    edited: ['file:report.pdf'],
    showsDefault: () => expect.element(page.getByText('report.pdf')).not.toBeInTheDocument(),
    marksInvalid: () => labelled('button'),
  },
  {
    control: 'ChipField',
    draw: () => (
      <ChipField name={NAME} defaultValue={['js']}>
        <ChipField.Item value="js">JavaScript</ChipField.Item>
        <ChipField.Item value="ts">TypeScript</ChipField.Item>
      </ChipField>
    ),
    defaults: ['js'],
    edit: async () => {
      await userEvent.click(labelled('combobox'));
      await userEvent.click(page.getByRole('option', { name: 'TypeScript' }));
      await userEvent.keyboard('{Escape}');
    },
    edited: ['js', 'ts'],
    showsDefault: () => expect.element(page.getByText('TypeScript')).not.toBeInTheDocument(),
    marksInvalid: () => labelled('combobox'),
  },
  {
    control: 'Rating',
    draw: () => <Rating name={NAME} />,
    defaults: [],
    edit: () => userEvent.click(page.getByRole('radio', { name: '5점 만점에 4점' })),
    edited: ['4'],
    showsDefault: () =>
      expect.element(page.getByRole('radio', { name: '5점 만점에 4점' })).not.toBeChecked(),
    marksInvalid: () => page.getByRole('radio', { name: '5점 만점에 0점' }),
  },
];

function Send() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} focusableWhenDisabled aria-busy={pending}>
      {pending ? 'Sending' : 'Send'}
    </Button>
  );
}

function SendDisabledNatively() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending' : 'Send'}
    </Button>
  );
}

describe.each(specs)('$control in a React 19 form action', (spec) => {
  test('the action gets the edited value as FormData and the reset after it shows the default', async () => {
    const action = vi.fn(async (data: FormData) => {
      void data;
    });
    await render(
      <form aria-label={FORM_LABEL} action={action}>
        <Field>
          <Field.Label>{LABEL}</Field.Label>
          {spec.draw()}
        </Field>
        <Send />
      </form>,
    );

    await expect.poll(answersOnScreen).toEqual(expected(spec.defaults));

    await spec.edit();
    await userEvent.click(page.getByRole('button', { name: 'Send' }));

    await expect.poll(() => action.mock.calls.length).toBe(1);
    expect(answersIn(action.mock.calls[0]![0])).toEqual(expected(spec.edited));

    await expect.poll(answersOnScreen).toEqual(expected(spec.defaults));
    await spec.showsDefault();
  });

  test('a useActionState error shows in Field.Error and marks the control invalid', async () => {
    const rejected = 'The server rejected this answer';
    function Form() {
      const [state, action] = useActionState(
        async (_previous: string | null, data: FormData) =>
          answersIn(data).length > 0 ? rejected : null,
        null,
      );

      return (
        <form aria-label={FORM_LABEL} action={action}>
          <Field invalid={state !== null}>
            <Field.Label>{LABEL}</Field.Label>
            {spec.draw()}
            <Field.Error>{state}</Field.Error>
          </Field>
          <Send />
        </form>
      );
    }
    await render(<Form />);

    await expect.element(page.getByText(rejected)).not.toBeInTheDocument();

    await spec.edit();
    await userEvent.click(page.getByRole('button', { name: 'Send' }));

    await expect.element(page.getByText(rejected)).toBeVisible();
    await expect.element(spec.marksInvalid()).toHaveAttribute('aria-invalid', 'true');
    await expect.element(spec.marksInvalid()).toHaveAccessibleDescription(rejected);
  });
});

test('useFormStatus reads pending while the action runs, then the form resets', async () => {
  const held = deferred();
  const action = vi.fn(() => held.promise);
  await render(
    <form aria-label={FORM_LABEL} action={action}>
      <Field>
        <Field.Label>{LABEL}</Field.Label>
        <TextField name={NAME} defaultValue="hello" />
      </Field>
      <Send />
    </form>,
  );

  await replaceText(labelled('textbox'), 'changed');
  await userEvent.click(page.getByRole('button', { name: 'Send' }));

  await expect.element(page.getByRole('button', { name: 'Sending' })).toBeDisabled();
  await expect.element(labelled('textbox')).toHaveValue('changed');
  expect(action).toHaveBeenCalledOnce();

  held.resolve();

  await expect.element(page.getByRole('button', { name: 'Send' })).toBeEnabled();
  await expect.element(labelled('textbox')).toHaveValue('hello');
});

test('useFormStatus stays pending after the browser blurs the Button it natively disables', async () => {
  const held = deferred();
  await render(
    <form aria-label={FORM_LABEL} action={() => held.promise}>
      <SendDisabledNatively />
    </form>,
  );
  const button = page.getByRole('button');

  await userEvent.click(button);

  await expect.element(button).not.toHaveFocus();
  await expect.element(button).toHaveAccessibleName('Sending');
  await expect.element(button).toBeDisabled();

  held.resolve();

  await expect.element(button).toHaveAccessibleName('Send');
  await expect.element(button).toBeEnabled();
  await expect.element(button).not.toHaveAttribute('data-focused');
});

test('a Button submitted from the keyboard stays pending and its focus ring leaves with the focus', async () => {
  const held = deferred();
  await render(
    <>
      <form aria-label={FORM_LABEL} action={() => held.promise}>
        <SendDisabledNatively />
      </form>
      <Button disabled>Idle</Button>
      <p>Elsewhere</p>
    </>,
  );
  const button = page.getByRole('button', { name: /^Send/ });
  const shadowOf = (name: string) =>
    getComputedStyle(page.getByRole('button', { name }).element()).boxShadow;

  await userEvent.keyboard('{Tab}');
  await expect.element(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');

  await expect.element(button).toHaveAccessibleName('Sending');
  await expect.element(button).toBeDisabled();

  await userEvent.click(page.getByText('Elsewhere'));

  await expect.element(button).not.toHaveFocus();
  await expect.element(button).toHaveAccessibleName('Sending');
  expect(shadowOf('Sending')).toBe(shadowOf('Idle'));

  held.resolve();

  await expect.element(button).toHaveAccessibleName('Send');
  await expect.element(button).not.toHaveAttribute('data-focus-visible');
});
