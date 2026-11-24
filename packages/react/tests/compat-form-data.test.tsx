import type { ReactElement } from 'react';

import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
import { describe, expect, onTestFinished, test, vi } from 'vitest';
import { page, server, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  Checkbox,
  CheckboxGroup,
  ChipField,
  ColorField,
  ColorPicker,
  DateField,
  DateTimeField,
  Field,
  FileDropzone,
  FileField,
  Input,
  NumberField,
  OTPField,
  PasswordField,
  PromptInput,
  Questionnaire,
  Radio,
  RadioGroup,
  Rating,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TelField,
  TextArea,
  TextField,
  TimeField,
  Toggle,
  ToggleGroup,
} from '../src';
import { Editor } from '../src/editor';

const NAME = 'answer';
const LABEL = 'Answer';
const FORM_ID = 'compat-form';

type Setup = { filled: boolean; required: boolean };

type Spec = {
  control: string;
  draw: (setup: Setup) => ReactElement;
  ownsForm?: boolean;
  unlabelled?: boolean;
  defaults: string[];
  edit: () => Promise<void>;
  edited: string[];
  showsDefault: () => Promise<void>;
  empty?: string[];
  takesFocus: (() => Locator) | null;
  blocksInItsSubmitHandler?: boolean;
};

const MOD = /Mac|iP(hone|[oa]d)/.test(navigator.platform) ? 'Meta' : 'Control';

const file = (name: string) =>
  new File(['body'], name, { type: 'application/pdf', lastModified: 1 });
const describeEntry = ([key, value]: [string, FormDataEntryValue]) =>
  `${key}=${value instanceof File ? `file:${value.name}` : value}`;
const entries = () =>
  [...new FormData(document.getElementById(FORM_ID) as HTMLFormElement)].map(describeEntry);
const expected = (values: string[]) => values.map((value) => `${NAME}=${value}`);
const picker = () => document.querySelector<HTMLInputElement>(`#${FORM_ID} input[type=file]`)!;
const labelled = (role: Parameters<typeof page.getByRole>[0]) =>
  page.getByRole(role, { name: LABEL, exact: true });
const namedFrom = (role: Parameters<typeof page.getByRole>[0]) =>
  page.getByRole(role, { name: new RegExp(`^${LABEL}( |$)`) });
const calendarDay = (key: string) =>
  page.elementLocator(document.querySelector(`[data-calendar-day="${key}"]`)!);
const timeOption = (unit: string, n: number) =>
  page.elementLocator(
    document.querySelector(`[role=dialog] [data-time-column="${unit}"] [data-time-option="${n}"]`)!,
  );
const replaceText = async (locator: Locator, text: string) => {
  await userEvent.fill(locator, text);
  (locator.element() as HTMLElement).blur();
};

const fruits = (
  <>
    <Select.Item value="apple">Apple</Select.Item>
    <Select.Item value="banana">Banana</Select.Item>
    <Select.Item value="cherry">Cherry</Select.Item>
  </>
);
const letters = ['a', 'b', 'c'];
const toggles = letters.map((value) => (
  <Toggle key={value} value={value}>
    {value.toUpperCase()}
  </Toggle>
));

const specs: Spec[] = [
  {
    control: 'TextField',
    draw: ({ filled, required }) => (
      <TextField name={NAME} required={required} defaultValue={filled ? 'hello' : undefined} />
    ),
    defaults: ['hello'],
    edit: () => replaceText(labelled('textbox'), 'changed'),
    edited: ['changed'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('hello'),
    empty: [''],
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'Input',
    draw: ({ filled, required }) => (
      <Input
        type="email"
        name={NAME}
        required={required}
        defaultValue={filled ? 'a@example.com' : undefined}
      />
    ),
    defaults: ['a@example.com'],
    edit: () => replaceText(labelled('textbox'), 'b@example.com'),
    edited: ['b@example.com'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('a@example.com'),
    empty: [''],
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'TextArea',
    draw: ({ filled, required }) => (
      <TextArea name={NAME} required={required} defaultValue={filled ? 'first' : undefined} />
    ),
    defaults: ['first'],
    edit: () => replaceText(labelled('textbox'), 'second'),
    edited: ['second'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('first'),
    empty: [''],
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'PasswordField',
    draw: ({ filled, required }) => (
      <PasswordField name={NAME} required={required} defaultValue={filled ? 'secret' : undefined} />
    ),
    defaults: ['secret'],
    edit: () => replaceText(labelled('textbox'), 'changed'),
    edited: ['changed'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('secret'),
    empty: [''],
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'NumberField',
    draw: ({ filled, required }) => (
      <NumberField name={NAME} required={required} defaultValue={filled ? 5 : undefined} />
    ),
    defaults: ['5'],
    edit: () => replaceText(labelled('spinbutton'), '12'),
    edited: ['12'],
    showsDefault: () => expect.element(labelled('spinbutton')).toHaveValue('5'),
    takesFocus: () => labelled('spinbutton'),
  },
  {
    control: 'TelField',
    draw: ({ filled, required }) => (
      <TelField name={NAME} required={required} defaultValue={filled ? '01012345678' : undefined} />
    ),
    defaults: ['+821012345678'],
    edit: () => replaceText(labelled('textbox'), '01098765432'),
    edited: ['+821098765432'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('010-1234-5678'),
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'OTPField',
    draw: ({ filled, required }) => (
      <OTPField
        length={4}
        name={NAME}
        required={required}
        defaultValue={filled ? '12' : undefined}
      />
    ),
    defaults: ['12'],
    edit: async () => {
      await userEvent.click(labelled('textbox'));
      await userEvent.keyboard('34');
    },
    edited: ['1234'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('12'),
    empty: [''],
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'Checkbox',
    draw: ({ filled, required }) => (
      <Checkbox name={NAME} value="yes" required={required} defaultChecked={filled} />
    ),
    defaults: ['yes'],
    edit: () => userEvent.click(labelled('checkbox')),
    edited: [],
    showsDefault: () => expect.element(labelled('checkbox')).toBeChecked(),
    takesFocus: () => labelled('checkbox'),
  },
  {
    control: 'Switch',
    draw: ({ filled, required }) => (
      <Switch name={NAME} value="on" required={required} defaultChecked={filled} />
    ),
    defaults: ['on'],
    edit: () => userEvent.click(labelled('switch')),
    edited: [],
    showsDefault: () => expect.element(labelled('switch')).toBeChecked(),
    takesFocus: () => labelled('switch'),
  },
  {
    control: 'Radio',
    unlabelled: true,
    draw: ({ filled, required }) => (
      <div>
        <Radio name={NAME} value="a" aria-label="A" required={required} defaultChecked={filled} />
        <Radio name={NAME} value="b" aria-label="B" required={required} />
      </div>
    ),
    defaults: ['a'],
    edit: () => userEvent.click(page.getByRole('radio', { name: 'B' })),
    edited: ['b'],
    showsDefault: () => expect.element(page.getByRole('radio', { name: 'A' })).toBeChecked(),
    takesFocus: () => page.getByRole('radio', { name: 'A' }),
  },
  {
    control: 'RadioGroup',
    draw: ({ filled, required }) => (
      <RadioGroup<string> name={NAME} required={required} defaultValue={filled ? 'b' : undefined}>
        {({ Item }) =>
          letters.map((value) => <Item key={value} value={value} aria-label={value} />)
        }
      </RadioGroup>
    ),
    defaults: ['b'],
    edit: () => userEvent.click(page.getByRole('radio', { name: 'c' })),
    edited: ['c'],
    showsDefault: () => expect.element(page.getByRole('radio', { name: 'b' })).toBeChecked(),
    takesFocus: () => page.getByRole('radio', { name: 'a' }),
  },
  {
    control: 'CheckboxGroup',
    draw: ({ filled, required }) => (
      <CheckboxGroup<string>
        name={NAME}
        required={required}
        defaultValue={filled ? ['a', 'c'] : undefined}
      >
        {({ Item }) =>
          letters.map((value) => <Item key={value} value={value} aria-label={value} />)
        }
      </CheckboxGroup>
    ),
    defaults: ['a', 'c'],
    edit: () => userEvent.click(page.getByRole('checkbox', { name: 'b' })),
    edited: ['a', 'b', 'c'],
    showsDefault: async () => {
      await expect.element(page.getByRole('checkbox', { name: 'a' })).toBeChecked();
      await expect.element(page.getByRole('checkbox', { name: 'b' })).not.toBeChecked();
    },
    takesFocus: () => page.getByRole('checkbox', { name: 'a' }),
  },
  {
    control: 'SegmentedControl',
    draw: ({ filled, required }) => (
      <SegmentedControl<string>
        name={NAME}
        required={required}
        defaultValue={filled ? 'b' : undefined}
      >
        {({ Item }) =>
          letters.map((value) => (
            <Item key={value} value={value}>
              {value}
            </Item>
          ))
        }
      </SegmentedControl>
    ),
    defaults: ['b'],
    edit: () => userEvent.click(page.getByRole('radio', { name: 'c' })),
    edited: ['c'],
    showsDefault: () => expect.element(page.getByRole('radio', { name: 'b' })).toBeChecked(),
    takesFocus: () => page.getByRole('radio', { name: 'a' }),
  },
  {
    control: 'ToggleGroup single',
    draw: ({ filled, required }) => (
      <ToggleGroup name={NAME} required={required} defaultValue={filled ? 'b' : undefined}>
        {toggles}
      </ToggleGroup>
    ),
    defaults: ['b'],
    edit: () => userEvent.click(page.getByRole('radio', { name: 'C' })),
    edited: ['c'],
    showsDefault: () =>
      expect
        .element(page.getByRole('radio', { name: 'B' }))
        .toHaveAttribute('aria-checked', 'true'),
    takesFocus: () => page.getByRole('radio', { name: 'A' }),
  },
  {
    control: 'ToggleGroup multiple',
    draw: ({ filled, required }) => (
      <ToggleGroup
        selectionMode="multiple"
        name={NAME}
        required={required}
        defaultValue={filled ? ['a'] : undefined}
      >
        {toggles}
      </ToggleGroup>
    ),
    defaults: ['a'],
    edit: () => userEvent.click(page.getByRole('button', { name: 'C' })),
    edited: ['a', 'c'],
    showsDefault: () =>
      expect
        .element(page.getByRole('button', { name: 'C' }))
        .toHaveAttribute('aria-pressed', 'false'),
    takesFocus: () => page.getByRole('button', { name: 'A' }),
  },
  {
    control: 'Select single',
    draw: ({ filled, required }) => (
      <Select name={NAME} required={required} defaultValue={filled ? 'apple' : undefined}>
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
    takesFocus: () => labelled('combobox'),
  },
  {
    control: 'Select multiple',
    draw: ({ filled, required }) => (
      <Select
        selectionMode="multiple"
        name={NAME}
        required={required}
        defaultValue={filled ? ['apple', 'banana'] : undefined}
      >
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
    takesFocus: () => labelled('combobox'),
  },
  {
    control: 'ChipField',
    draw: ({ filled, required }) => (
      <ChipField name={NAME} required={required} defaultValue={filled ? ['js'] : undefined}>
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
    showsDefault: () =>
      expect.poll(() => document.querySelectorAll('[data-chip-field-chip]').length).toBe(1),
    takesFocus: () => labelled('combobox'),
  },
  {
    control: 'ColorField',
    draw: ({ filled, required }) => (
      <ColorField name={NAME} required={required} defaultValue={filled ? '#FF0000' : undefined}>
        <ColorField.Content>
          <ColorPicker.Swatches>
            <ColorPicker.Swatch value="#00FF00" />
          </ColorPicker.Swatches>
        </ColorField.Content>
      </ColorField>
    ),
    defaults: ['#FF0000'],
    edit: async () => {
      await userEvent.click(namedFrom('combobox'));
      await userEvent.click(page.getByRole('radio', { name: '#00FF00' }));
      await userEvent.keyboard('{Escape}');
    },
    edited: ['#00FF00'],
    showsDefault: () => expect.element(namedFrom('combobox')).toMatchTextContent('#FF0000'),
    takesFocus: () => namedFrom('combobox'),
  },
  {
    control: 'DateField',
    draw: ({ filled, required }) => (
      <DateField
        name={NAME}
        required={required}
        defaultValue={filled ? new CalendarDate(2026, 9, 15) : undefined}
      >
        <DateField.Calendar today={new CalendarDate(2026, 9, 15)} />
      </DateField>
    ),
    defaults: ['2026-09-15'],
    edit: async () => {
      await userEvent.click(labelled('combobox'));
      await userEvent.click(calendarDay('2026-09-18'));
    },
    edited: ['2026-09-18'],
    showsDefault: () => expect.element(labelled('combobox')).toMatchTextContent('2026. 09. 15.'),
    takesFocus: () => labelled('combobox'),
  },
  {
    control: 'TimeField',
    draw: ({ filled, required }) => (
      <TimeField
        name={NAME}
        hourCycle="24h"
        required={required}
        defaultValue={filled ? new Time(9, 30) : undefined}
      />
    ),
    defaults: ['09:30'],
    edit: async () => {
      await userEvent.click(labelled('combobox'));
      await userEvent.click(timeOption('hour', 14));
      await userEvent.keyboard('{Escape}');
    },
    edited: ['14:30'],
    showsDefault: () => expect.element(labelled('combobox')).toMatchTextContent('09:30'),
    takesFocus: () => labelled('combobox'),
  },
  {
    control: 'DateTimeField',
    draw: ({ filled, required }) => (
      <DateTimeField
        name={NAME}
        hourCycle="24h"
        required={required}
        defaultValue={filled ? new CalendarDateTime(2026, 9, 15, 9, 30) : undefined}
      >
        <DateTimeField.Calendar today={new CalendarDate(2026, 9, 15)} />
      </DateTimeField>
    ),
    defaults: ['2026-09-15T09:30'],
    edit: async () => {
      await userEvent.click(labelled('combobox'));
      await userEvent.click(calendarDay('2026-09-18'));
      await userEvent.keyboard('{Escape}');
    },
    edited: ['2026-09-18T09:30'],
    showsDefault: () =>
      expect.element(labelled('combobox')).toMatchTextContent('2026. 09. 15. 09:30'),
    takesFocus: () => labelled('combobox'),
  },
  {
    control: 'Slider',
    draw: ({ filled }) => <Slider name={NAME} defaultValue={filled ? 30 : undefined} />,
    defaults: ['30'],
    edit: async () => {
      (labelled('slider').element() as HTMLElement).focus();
      await userEvent.keyboard('{ArrowRight}');
    },
    edited: ['31'],
    showsDefault: () => expect.element(labelled('slider')).toHaveAttribute('aria-valuenow', '30'),
    takesFocus: null,
  },
  {
    control: 'Slider range',
    unlabelled: true,
    draw: ({ filled }) => (
      <Slider aria-label="Range" name={NAME} defaultValue={filled ? [20, 70] : [0, 100]} />
    ),
    defaults: ['20', '70'],
    edit: async () => {
      (page.getByRole('slider').first().element() as HTMLElement).focus();
      await userEvent.keyboard('{ArrowRight}');
    },
    edited: ['21', '70'],
    showsDefault: () =>
      expect.element(page.getByRole('slider').first()).toHaveAttribute('aria-valuenow', '20'),
    takesFocus: null,
  },
  {
    control: 'Rating',
    draw: ({ filled, required }) => (
      <Rating name={NAME} required={required} defaultValue={filled ? 2 : undefined} />
    ),
    defaults: ['2'],
    edit: () => userEvent.click(page.getByRole('radio', { name: '5점 만점에 4점' })),
    edited: ['4'],
    showsDefault: () =>
      expect.element(page.getByRole('radio', { name: '5점 만점에 2점' })).toBeChecked(),
    takesFocus: () => page.getByRole('radio', { name: '5점 만점에 0점' }),
  },
  {
    control: 'FileField',
    draw: ({ filled, required }) => (
      <FileField
        name={NAME}
        required={required}
        defaultValue={filled ? file('initial.pdf') : null}
      />
    ),
    defaults: ['file:initial.pdf'],
    edit: () => userEvent.upload(picker(), [file('other.pdf')]),
    edited: ['file:other.pdf'],
    showsDefault: () => expect.element(page.getByText('initial.pdf')).toBeVisible(),
    takesFocus: () => labelled('button'),
  },
  {
    control: 'FileDropzone',
    draw: ({ filled, required }) => (
      <FileDropzone
        multiple
        name={NAME}
        required={required}
        defaultValue={filled ? [file('initial.pdf')] : []}
      />
    ),
    defaults: ['file:initial.pdf'],
    edit: () => userEvent.upload(picker(), [file('other.pdf')]),
    edited: ['file:initial.pdf', 'file:other.pdf'],
    showsDefault: () => expect.element(page.getByText('other.pdf')).not.toBeInTheDocument(),
    takesFocus: () => labelled('button'),
  },
  {
    control: 'Editor',
    draw: ({ filled, required }) => (
      <Editor name={NAME} required={required} defaultValue={filled ? '<p>초안</p>' : undefined}>
        <Editor.Content />
      </Editor>
    ),
    defaults: ['<p>초안</p>'],
    edit: async () => {
      const content = labelled('textbox');
      await expect.element(content).toHaveAttribute('contenteditable', 'true');
      await userEvent.click(content);
      await userEvent.keyboard(`{${MOD}>}a{/${MOD}}`);
      await userEvent.keyboard('새 글');
    },
    edited: ['<p>새 글</p>'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveTextContent('초안'),
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'PromptInput',
    ownsForm: true,
    draw: ({ filled, required }) => (
      <PromptInput aria-label="메시지" id={FORM_ID} defaultValue={filled ? 'hi' : undefined}>
        <PromptInput.Input name={NAME} aria-label={LABEL} required={required} />
      </PromptInput>
    ),
    defaults: ['hi'],
    edit: () => userEvent.fill(labelled('textbox'), 'bye'),
    edited: ['bye'],
    showsDefault: () => expect.element(labelled('textbox')).toHaveValue('hi'),
    empty: [''],
    takesFocus: () => labelled('textbox'),
  },
  {
    control: 'Questionnaire',
    ownsForm: true,
    draw: ({ filled }) => (
      <Questionnaire id={FORM_ID} defaultValue={filled ? { [NAME]: 'casual' } : undefined}>
        <Questionnaire.Question name={NAME}>
          {LABEL}
          <Questionnaire.Option value="formal">Formal</Questionnaire.Option>
          <Questionnaire.Option value="casual">Casual</Questionnaire.Option>
        </Questionnaire.Question>
      </Questionnaire>
    ),
    defaults: ['casual'],
    edit: () => userEvent.click(page.getByRole('radio', { name: 'Formal' })),
    edited: ['formal'],
    showsDefault: () => expect.element(page.getByRole('radio', { name: 'Casual' })).toBeChecked(),
    takesFocus: null,
    blocksInItsSubmitHandler: true,
  },
];

function drawForm(spec: Spec, setup: Setup) {
  const control = spec.draw(setup);
  if (spec.ownsForm) {
    return (
      <div>
        {control}
        <button type="reset" form={FORM_ID}>
          Reset
        </button>
      </div>
    );
  }
  return (
    <form id={FORM_ID}>
      {spec.unlabelled ? (
        control
      ) : (
        <Field>
          <Field.Label>{LABEL}</Field.Label>
          {control}
        </Field>
      )}
      <button type="reset">Reset</button>
    </form>
  );
}

const formElement = () => document.getElementById(FORM_ID) as HTMLFormElement;

const PLAYWRIGHTS_FIREFOX_CLICK_LEAVES_SOME_FIELDS_UNRESET = server.browser === 'firefox';

async function pressReset() {
  const reset = page.getByRole('button', { name: 'Reset' });
  if (PLAYWRIGHTS_FIREFOX_CLICK_LEAVES_SOME_FIELDS_UNRESET) {
    (reset.element() as HTMLButtonElement).click();
    return;
  }
  await userEvent.click(reset);
}

function watchSubmitsTheBrowserWouldSend() {
  const submitted = vi.fn();
  const afterEveryReactHandler = (event: Event) => {
    if (!event.defaultPrevented) submitted();
    event.preventDefault();
  };
  document.addEventListener('submit', afterEveryReactHandler);
  onTestFinished(() => document.removeEventListener('submit', afterEveryReactHandler));
  return submitted;
}

describe.each(specs)('$control in a plain form', (spec) => {
  test('FormData holds the default, follows an edit, and the reset button restores both', async () => {
    await render(drawForm(spec, { filled: true, required: false }));

    await expect.poll(entries).toEqual(expected(spec.defaults));

    await spec.edit();

    await expect.poll(entries).toEqual(expected(spec.edited));

    await pressReset();

    await expect.poll(entries).toEqual(expected(spec.defaults));
    await spec.showsDefault();
  });

  test.runIf(spec.takesFocus !== null)(
    'required with no value submits nothing empty, blocks requestSubmit and focuses the control',
    async () => {
      await render(drawForm(spec, { filled: false, required: true }));
      const submitted = watchSubmitsTheBrowserWouldSend();

      expect(entries()).toEqual(expected(spec.empty ?? []));

      formElement().requestSubmit();

      expect(submitted).not.toHaveBeenCalled();
      expect(formElement().checkValidity()).toBe(false);
      await expect.element(spec.takesFocus!()).toHaveFocus();
    },
  );
});

describe.each(specs.filter((spec) => spec.blocksInItsSubmitHandler))(
  '$control with its own submit rules',
  (spec) => {
    test('an unanswered required question submits nothing, cancels requestSubmit and turns its submit button off', async () => {
      await render(drawForm(spec, { filled: false, required: true }));
      const submitted = watchSubmitsTheBrowserWouldSend();

      expect(entries()).toEqual(expected(spec.empty ?? []));

      formElement().requestSubmit();

      expect(submitted).not.toHaveBeenCalled();
      await expect
        .element(page.elementLocator(formElement().querySelector('button[type=submit]')!))
        .toBeDisabled();
    });
  },
);
