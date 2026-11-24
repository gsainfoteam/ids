import { type ReactElement } from 'react';

import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
import { expect } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';

import {
  Checkbox,
  CheckboxGroup,
  ChipField,
  ColorField,
  ColorPicker,
  DataTable,
  DateField,
  DateTimeField,
  FileDropzone,
  FileField,
  Input,
  Label,
  NumberField,
  OTPField,
  PasswordField,
  PromptInput,
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
  useDataTable,
} from '../src';
import { Editor } from '../src/editor';

import type { RegisterOptions } from 'react-hook-form';
import type { RenderResult } from 'vitest-browser-react';

export type Screen = RenderResult;
export type RhfMode = 'native' | 'value' | 'checked';
export type ValueProp = 'value' | 'checked';
export type Check =
  | 'rhf-field'
  | 'rhf-controller'
  | 'rhf-reset'
  | 'rhf-focus-error'
  | 'rhf-dirty'
  | 'tanstack-field'
  | 'tanstack-app-field'
  | 'tanstack-reset'
  | 'tanstack-dirty'
  | 'tanstack-error';

export type ControlSpec = {
  name: string;
  rhfMode: RhfMode;
  valueProp: ValueProp;
  control: () => ReactElement;
  defaultValue: unknown;
  otherValue: unknown;
  emptyValue: unknown;
  edit: (screen: Screen) => Promise<void>;
  edited: unknown;
  shows: (screen: Screen, value: unknown) => Promise<void>;
  focusTarget: (screen: Screen, value: unknown) => Locator;
  rule?: RegisterOptions;
  plain?: (value: unknown) => unknown;
  open?: Partial<Record<Check, string>>;
};

export const LABEL = 'Answer';
export const REQUIRED = 'Required';

export function isEmptyAnswer(value: unknown) {
  if (value === null || value === undefined || value === '' || value === false || value === 0)
    return true;
  if (Array.isArray(value)) return value.length === 0;
  if (Object.getPrototypeOf(value) === Object.prototype) return Object.keys(value).length === 0;
  return false;
}

export const notEmpty = (value: unknown) => (isEmptyAnswer(value) ? REQUIRED : true);

export const fieldOf = (screen: Screen) =>
  screen.container.querySelector<HTMLElement>('[data-field]')!;
const inField = (screen: Screen, selector: string) =>
  page.elementLocator(fieldOf(screen).querySelector<HTMLElement>(selector)!);
const textbox = (screen: Screen) => screen.getByRole('textbox', { name: LABEL });
const spinbutton = (screen: Screen) => screen.getByRole('spinbutton', { name: LABEL });
const combobox = (screen: Screen) =>
  screen.getByRole('combobox', { name: new RegExp(`^${LABEL}`) });
const temporalTrigger = (screen: Screen) => inField(screen, '[role=combobox]');
const colorTrigger = (screen: Screen) => inField(screen, 'button[aria-haspopup]');
const hiddenValues = (screen: Screen) =>
  [...fieldOf(screen).querySelectorAll<HTMLInputElement>('input[type=hidden]')].map(
    (input) => input.value,
  );

const file = (name: string) =>
  new File(['hello'], name, { type: 'application/pdf', lastModified: 1 });
const fileName = (value: unknown) => (value instanceof File ? value.name : value);
const asString = (value: unknown) => (value == null ? value : String(value));
const twoDigits = (value: number) => String(value).padStart(2, '0');

const day = (key: string) =>
  page.elementLocator(document.querySelector<HTMLElement>(`[data-calendar-day="${key}"]`)!);
const hourOption = (hour: number) =>
  page.elementLocator(
    document.querySelector<HTMLElement>(
      `[role=dialog] [data-time-column="hour"] [data-time-option="${hour}"]`,
    )!,
  );
const TODAY = new CalendarDate(2026, 9, 15);

async function shownText(screen: Screen, value: unknown) {
  await expect.element(textbox(screen)).toHaveValue(String(value ?? ''));
}

async function showsFile(screen: Screen, value: unknown) {
  const name = fileName(value);
  if (typeof name === 'string') await expect.element(screen.getByText(name)).toBeVisible();
  else await expect.poll(() => fieldOf(screen).textContent).not.toMatch(/\.pdf/);
}

async function showsChecked(box: Locator, checked: boolean) {
  if (checked) await expect.element(box).toBeChecked();
  else await expect.element(box).not.toBeChecked();
}

const uploadInto = (screen: Screen, name: string) =>
  userEvent.upload(
    page.elementLocator(fieldOf(screen).querySelector('input[type=file]')!),
    file(name),
  );

const nativeText = (name: string, control: () => ReactElement): ControlSpec => ({
  name,
  rhfMode: 'native',
  valueProp: 'value',
  control,
  defaultValue: 'ids',
  otherValue: 'gist',
  emptyValue: '',
  edit: (screen) => userEvent.fill(textbox(screen), 'infoteam'),
  edited: 'infoteam',
  shows: shownText,
  focusTarget: textbox,
});

type Person = { id: string; name: string };
const PEOPLE: Person[] = [
  { id: 'ada', name: 'Ada' },
  { id: 'grace', name: 'Grace' },
  { id: 'ken', name: 'Ken' },
];
const person = DataTable.createColumnHelper<Person>();
const columns = person.columns([person.accessor('name', { header: 'Name' })]);
const idOf = (row: Person) => row.id;
const nameOf = (row: Person) => row.name;

function PeopleTable(props: Omit<DataTable.Props<Person>, 'table'>) {
  const table = useDataTable({
    data: PEOPLE,
    columns,
    getRowId: idOf,
    getRowLabel: nameOf,
    selection: {},
  });
  return <DataTable table={table} {...props} />;
}

const rowBox = (screen: Screen, name: string) =>
  screen.getByRole('checkbox', { name: new RegExp(`^${name}\\b`) });

const FRUITS: Record<string, string> = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry' };
const LETTERS: Record<string, string> = { a: 'Alpha', b: 'Beta', c: 'Gamma' };
const PERIODS: Record<string, string> = { day: 'Day', week: 'Week', month: 'Month' };
const ALIGNS: Record<string, string> = { left: 'Left', center: 'Center', right: 'Right' };

const EDITOR_HAS_NO_REF =
  'Editor takes no ref and no onBlur, so react-hook-form cannot focus it or mark it touched';
const DATA_TABLE_HAS_NO_REF =
  'DataTable takes no ref and no onBlur, and its root hands no focus() to a row checkbox';
const PROMPT_INPUT_IS_A_FORM =
  'PromptInput renders its own <form>, so Field names and binds the form and not its textarea';

export const controls: ControlSpec[] = [
  {
    name: 'Checkbox',
    rhfMode: 'native',
    valueProp: 'checked',
    control: () => <Checkbox />,
    defaultValue: true,
    otherValue: true,
    emptyValue: false,
    edit: (screen) => userEvent.click(screen.getByRole('checkbox', { name: LABEL })),
    edited: false,
    shows: (screen, value) =>
      showsChecked(screen.getByRole('checkbox', { name: LABEL }), Boolean(value)),
    focusTarget: (screen) => screen.getByRole('checkbox', { name: LABEL }),
  },
  {
    name: 'CheckboxGroup',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <CheckboxGroup>
        {({ Item }) => (
          <>
            <Label>
              <Item value="a" />
              Alpha
            </Label>
            <Label>
              <Item value="b" />
              Beta
            </Label>
            <Label>
              <Item value="c" />
              Gamma
            </Label>
          </>
        )}
      </CheckboxGroup>
    ),
    defaultValue: ['a'],
    otherValue: ['c'],
    emptyValue: [],
    edit: (screen) => userEvent.click(screen.getByRole('checkbox', { name: 'Beta' })),
    edited: ['a', 'b'],
    shows: async (screen, value) => {
      for (const [item, name] of Object.entries(LETTERS))
        await showsChecked(
          screen.getByRole('checkbox', { name }),
          (value as string[]).includes(item),
        );
    },
    focusTarget: (screen, value) =>
      screen.getByRole('checkbox', { name: LETTERS[(value as string[])[0] ?? 'a'] }),
  },
  {
    name: 'ChipField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <ChipField>
        <ChipField.Item value="js">JavaScript</ChipField.Item>
        <ChipField.Item value="ts">TypeScript</ChipField.Item>
      </ChipField>
    ),
    defaultValue: ['js'],
    otherValue: ['ts'],
    emptyValue: [],
    edit: async (screen) => {
      await userEvent.fill(combobox(screen), 'Type');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Escape}');
    },
    edited: ['js', 'ts'],
    shows: async (screen, value) => {
      await expect.poll(() => hiddenValues(screen)).toEqual(value);
    },
    focusTarget: combobox,
  },
  {
    name: 'ColorField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <ColorField>
        <ColorField.Content>
          <ColorPicker.Swatches>
            <ColorPicker.Swatch value="#FF0000" />
            <ColorPicker.Swatch value="#0000FF" />
          </ColorPicker.Swatches>
        </ColorField.Content>
      </ColorField>
    ),
    defaultValue: '#00FF00',
    otherValue: '#0000FF',
    emptyValue: '',
    edit: async (screen) => {
      await userEvent.click(colorTrigger(screen));
      await userEvent.click(page.getByRole('radio', { name: '#FF0000' }));
      await userEvent.keyboard('{Escape}');
    },
    edited: '#FF0000',
    shows: async (screen, value) => {
      await expect.element(colorTrigger(screen)).toMatchTextContent(String(value));
    },
    focusTarget: colorTrigger,
  },
  {
    name: 'DateField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <DateField>
        <DateField.Calendar today={TODAY} />
      </DateField>
    ),
    defaultValue: new CalendarDate(2026, 9, 15),
    otherValue: new CalendarDate(2026, 9, 20),
    emptyValue: null,
    edit: async (screen) => {
      await userEvent.click(temporalTrigger(screen));
      await userEvent.click(day('2026-09-18'));
    },
    edited: new CalendarDate(2026, 9, 18),
    shows: async (screen, value) => {
      const date = value as CalendarDate;
      await expect.poll(() => hiddenValues(screen)).toEqual([date.toString()]);
      await expect
        .element(temporalTrigger(screen))
        .toMatchTextContent(`${twoDigits(date.month)}. ${twoDigits(date.day)}.`);
    },
    focusTarget: temporalTrigger,
    plain: asString,
  },
  {
    name: 'DateTimeField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <DateTimeField hourCycle="24h">
        <DateTimeField.Calendar today={TODAY} />
      </DateTimeField>
    ),
    defaultValue: new CalendarDateTime(2026, 9, 15, 9, 30),
    otherValue: new CalendarDateTime(2026, 9, 20, 14, 30),
    emptyValue: null,
    edit: async (screen) => {
      await userEvent.click(temporalTrigger(screen));
      await userEvent.click(hourOption(10));
      await userEvent.keyboard('{Escape}');
    },
    edited: new CalendarDateTime(2026, 9, 15, 10, 30),
    shows: async (screen, value) => {
      const time = value as CalendarDateTime;
      await expect.poll(() => hiddenValues(screen)).toEqual([time.toString().slice(0, 16)]);
      await expect
        .element(temporalTrigger(screen))
        .toMatchTextContent(`${twoDigits(time.hour)}:${twoDigits(time.minute)}`);
    },
    focusTarget: temporalTrigger,
    plain: asString,
  },
  {
    name: 'Editor',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <Editor>
        <Editor.Content />
      </Editor>
    ),
    defaultValue: '<p>draft</p>',
    otherValue: '<p>other</p>',
    emptyValue: '',
    edit: async (screen) => {
      const body = textbox(screen);
      await expect.element(body).toHaveAttribute('contenteditable', 'true');
      await userEvent.click(body);
      await userEvent.keyboard('{End} more');
    },
    edited: '<p>draft more</p>',
    shows: async (screen, value) => {
      const body = textbox(screen);
      await expect.element(body).toHaveAttribute('contenteditable', 'true');
      await expect.element(body).toHaveTextContent(String(value).replace(/<[^>]+>/g, ''));
    },
    focusTarget: textbox,
    open: {
      'rhf-controller': EDITOR_HAS_NO_REF,
      'rhf-focus-error': EDITOR_HAS_NO_REF,
    },
  },
  {
    name: 'FileDropzone',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <FileDropzone />,
    defaultValue: null,
    otherValue: file('other.pdf'),
    emptyValue: null,
    edit: (screen) => uploadInto(screen, 'resume.pdf'),
    edited: file('resume.pdf'),
    shows: showsFile,
    focusTarget: (screen) => screen.getByRole('button', { name: LABEL, exact: true }),
    plain: fileName,
  },
  {
    name: 'FileField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <FileField />,
    defaultValue: null,
    otherValue: file('other.pdf'),
    emptyValue: null,
    edit: (screen) => uploadInto(screen, 'resume.pdf'),
    edited: file('resume.pdf'),
    shows: showsFile,
    focusTarget: (screen) => screen.getByRole('button', { name: LABEL, exact: true }),
    plain: fileName,
  },
  nativeText('Input', () => <Input />),
  {
    name: 'NumberField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <NumberField />,
    defaultValue: 5,
    otherValue: 7,
    emptyValue: null,
    edit: async (screen) => {
      await userEvent.fill(spinbutton(screen), '42');
      await userEvent.keyboard('{Tab}');
    },
    edited: 42,
    shows: async (screen, value) => {
      await expect.element(spinbutton(screen)).toHaveValue(value == null ? '' : String(value));
    },
    focusTarget: spinbutton,
  },
  {
    name: 'OTPField',
    rhfMode: 'native',
    valueProp: 'value',
    control: () => <OTPField length={4} />,
    defaultValue: '5678',
    otherValue: '1111',
    emptyValue: '',
    edit: async (screen) => {
      await userEvent.click(textbox(screen));
      await userEvent.keyboard('{ControlOrMeta>}a{/ControlOrMeta}1234');
    },
    edited: '1234',
    shows: shownText,
    focusTarget: textbox,
  },
  nativeText('PasswordField', () => <PasswordField />),
  {
    name: 'PromptInput',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <PromptInput aria-label="메시지" />,
    defaultValue: 'hello',
    otherValue: 'bye',
    emptyValue: '',
    edit: (screen) => userEvent.fill(textbox(screen), 'question'),
    edited: 'question',
    shows: shownText,
    focusTarget: textbox,
    open: {
      'rhf-controller': PROMPT_INPUT_IS_A_FORM,
      'rhf-focus-error': PROMPT_INPUT_IS_A_FORM,
    },
  },
  {
    name: 'RadioGroup',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <RadioGroup>
        {({ Item }) => (
          <>
            <Label>
              <Item value="a" />
              Alpha
            </Label>
            <Label>
              <Item value="b" />
              Beta
            </Label>
            <Label>
              <Item value="c" />
              Gamma
            </Label>
          </>
        )}
      </RadioGroup>
    ),
    defaultValue: 'a',
    otherValue: 'c',
    emptyValue: null,
    edit: (screen) => userEvent.click(screen.getByRole('radio', { name: 'Beta' })),
    edited: 'b',
    shows: (screen, value) =>
      showsChecked(screen.getByRole('radio', { name: LETTERS[String(value)] }), true),
    focusTarget: (screen, value) =>
      screen.getByRole('radio', { name: LETTERS[String(value ?? 'a')] }),
  },
  {
    name: 'Rating',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <Rating />,
    defaultValue: 3,
    otherValue: 2,
    emptyValue: 0,
    edit: (screen) => userEvent.click(screen.getByRole('radio', { name: /\b4점$/ })),
    edited: 4,
    shows: (screen, value) =>
      showsChecked(screen.getByRole('radio', { name: new RegExp(`\\b${String(value)}점$`) }), true),
    focusTarget: (screen, value) =>
      screen.getByRole('radio', { name: new RegExp(`\\b${String(value ?? 0)}점$`) }),
    rule: { validate: notEmpty },
  },
  {
    name: 'SegmentedControl',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <SegmentedControl>
        {({ Item }) => (
          <>
            <Item value="day">Day</Item>
            <Item value="week">Week</Item>
            <Item value="month">Month</Item>
          </>
        )}
      </SegmentedControl>
    ),
    defaultValue: 'day',
    otherValue: 'month',
    emptyValue: null,
    edit: (screen) => userEvent.click(screen.getByRole('radio', { name: 'Week' })),
    edited: 'week',
    shows: (screen, value) =>
      showsChecked(screen.getByRole('radio', { name: PERIODS[String(value)] }), true),
    focusTarget: (screen, value) =>
      screen.getByRole('radio', { name: PERIODS[String(value ?? 'day')] }),
  },
  {
    name: 'Select',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <Select>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
      </Select>
    ),
    defaultValue: 'apple',
    otherValue: 'cherry',
    emptyValue: null,
    edit: async (screen) => {
      await userEvent.click(combobox(screen));
      await userEvent.click(page.getByRole('option', { name: 'Banana' }));
    },
    edited: 'banana',
    shows: async (screen, value) => {
      await expect.element(combobox(screen)).toHaveTextContent(FRUITS[String(value)]);
    },
    focusTarget: combobox,
  },
  {
    name: 'Slider',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <Slider />,
    defaultValue: 20,
    otherValue: 70,
    emptyValue: 0,
    edit: async (screen) => {
      await userEvent.click(screen.getByRole('slider', { name: LABEL }));
      await userEvent.keyboard('{Home}{PageUp}');
    },
    edited: 10,
    shows: async (screen, value) => {
      await expect
        .element(screen.getByRole('slider', { name: LABEL }))
        .toHaveAttribute('aria-valuenow', String(value));
    },
    focusTarget: (screen) => screen.getByRole('slider', { name: LABEL }),
    rule: { validate: notEmpty },
  },
  {
    name: 'Switch',
    rhfMode: 'native',
    valueProp: 'checked',
    control: () => <Switch />,
    defaultValue: true,
    otherValue: true,
    emptyValue: false,
    edit: (screen) => userEvent.click(screen.getByRole('switch', { name: LABEL })),
    edited: false,
    shows: (screen, value) =>
      showsChecked(screen.getByRole('switch', { name: LABEL }), Boolean(value)),
    focusTarget: (screen) => screen.getByRole('switch', { name: LABEL }),
  },
  {
    name: 'TelField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <TelField />,
    defaultValue: '+821012345678',
    otherValue: '+821011112222',
    emptyValue: '',
    edit: async (screen) => {
      await userEvent.fill(textbox(screen), '01087654321');
      await userEvent.keyboard('{Tab}');
    },
    edited: '+821087654321',
    shows: async (screen, value) => {
      const digits = String(value).replace(/^\+82/, '0');
      await expect
        .poll(() => (textbox(screen).element() as HTMLInputElement).value.replace(/\D/g, ''))
        .toBe(digits);
    },
    focusTarget: textbox,
  },
  nativeText('TextArea', () => <TextArea />),
  nativeText('TextField', () => <TextField />),
  {
    name: 'TimeField',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <TimeField hourCycle="24h" />,
    defaultValue: new Time(9, 30),
    otherValue: new Time(14, 30),
    emptyValue: null,
    edit: async (screen) => {
      await userEvent.click(temporalTrigger(screen));
      await userEvent.click(hourOption(10));
      await userEvent.keyboard('{Escape}');
    },
    edited: new Time(10, 30),
    shows: async (screen, value) => {
      const time = value as Time;
      const shown = `${twoDigits(time.hour)}:${twoDigits(time.minute)}`;
      await expect.poll(() => hiddenValues(screen)).toEqual([shown]);
      await expect.element(temporalTrigger(screen)).toMatchTextContent(shown);
    },
    focusTarget: temporalTrigger,
    plain: asString,
  },
  {
    name: 'ToggleGroup',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => (
      <ToggleGroup>
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
        <Toggle value="right">Right</Toggle>
      </ToggleGroup>
    ),
    defaultValue: 'left',
    otherValue: 'right',
    emptyValue: null,
    edit: (screen) => userEvent.click(screen.getByRole('radio', { name: 'Center' })),
    edited: 'center',
    shows: (screen, value) =>
      showsChecked(screen.getByRole('radio', { name: ALIGNS[String(value)] }), true),
    focusTarget: (screen, value) =>
      screen.getByRole('radio', { name: ALIGNS[String(value ?? 'left')] }),
  },
  {
    name: 'DataTable',
    rhfMode: 'value',
    valueProp: 'value',
    control: () => <PeopleTable />,
    defaultValue: { grace: true },
    otherValue: { ken: true },
    emptyValue: {},
    edit: (screen) => userEvent.click(rowBox(screen, 'Ada')),
    edited: { grace: true, ada: true },
    shows: async (screen, value) => {
      for (const { id, name } of PEOPLE)
        await showsChecked(rowBox(screen, name), Boolean((value as Record<string, boolean>)[id]));
    },
    focusTarget: (screen) => rowBox(screen, 'Ada'),
    rule: { validate: notEmpty },
    open: {
      'rhf-controller': DATA_TABLE_HAS_NO_REF,
      'rhf-focus-error': DATA_TABLE_HAS_NO_REF,
    },
  },
];

export const plainOf = (spec: ControlSpec, value: unknown) =>
  spec.plain ? spec.plain(value) : value;
