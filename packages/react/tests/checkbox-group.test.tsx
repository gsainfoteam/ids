import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Checkbox, CheckboxGroup, Field } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const boxOf = (checkbox: Locator) => checkbox.element().closest<HTMLElement>('[data-checkbox]')!;

const skills = ['js', 'ts', 'py'];
const items = ({ Item }: CheckboxGroup.RenderProps) =>
  skills.map((skill) => <Item key={skill} value={skill} aria-label={skill} />);

test('SSR: a labelled group of native checkboxes sharing one name', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field required size="tiny">
          <Field.Label>Skills</Field.Label>
          <CheckboxGroup<string> name="skills" defaultValue={['js', 'py']} orientation="horizontal">
            {items}
          </CheckboxGroup>
        </Field>
      </form>,
    ),
  );
  const group = doc.querySelector<HTMLElement>('[role=group]')!;
  const label = doc.querySelector('label')!;
  expect(label.htmlFor).toBe(group.id);
  expect(group.getAttribute('aria-labelledby')).toBe(label.id);
  expect(group.hasAttribute('aria-required'), 'a group takes no aria-required').toBe(false);
  expect(group.dataset.orientation).toBe('horizontal');
  const boxes = [...doc.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
  expect(
    boxes.map((input) => [input.name, input.checked, input.required]),
    'required means at least one, so no single checkbox is required',
  ).toEqual([
    ['skills', true, false],
    ['skills', false, false],
    ['skills', true, false],
  ]);
  expect(
    boxes.every((input) => input.closest<HTMLElement>('[data-checkbox]')!.dataset.size === 'tiny'),
  ).toBe(true);
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([
    ['skills', 'js'],
    ['skills', 'py'],
  ]);
});

test('select-all follows the enabled items, skips disabled ones and lists what it controls', async () => {
  const changes: string[][] = [];
  const screen = await render(
    <CheckboxGroup<string>
      aria-label="Skills"
      defaultValue={['js', 'rs']}
      onValueChange={(next) => changes.push(next)}
    >
      {({ All, Item }) => [
        <All key="all" aria-label="All" />,
        ...skills.map((skill) => <Item key={skill} value={skill} aria-label={skill} />),
        <Item key="rs" value="rs" aria-label="rs" disabled />,
      ]}
    </CheckboxGroup>,
  );
  const all = screen.getByRole('checkbox', { name: 'All' });
  const box = (value: string) => screen.getByRole('checkbox', { name: value });
  await expect.element(all).toBePartiallyChecked();
  expect(all.element().getAttribute('aria-controls')!.split(' ')).toEqual(
    skills.map((skill) => box(skill).element().id),
  );
  await userEvent.click(all);
  await expect.element(all).toBeChecked();
  expect(changes.at(-1)).toEqual(['js', 'rs', 'ts', 'py']);
  await userEvent.click(all);
  await expect.element(all).not.toBeChecked();
  await expect.element(all).not.toBePartiallyChecked();
  expect(changes.at(-1), 'the disabled item keeps its value').toEqual(['rs']);
  await userEvent.click(box('ts'));
  await expect.element(all).toBePartiallyChecked();
});

test('value: uncontrolled appends in click order, controlled follows the parent, readOnly holds', async () => {
  const changes: string[][] = [];
  const screen = await render(
    <CheckboxGroup aria-label="Skills" onValueChange={(next) => changes.push(next)}>
      {items}
    </CheckboxGroup>,
  );
  const box = (value: string) => screen.getByRole('checkbox', { name: value });
  await userEvent.click(box('py'));
  await userEvent.click(box('js'));
  await userEvent.click(box('py'));
  expect(changes).toEqual([['py'], ['py', 'js'], ['js']]);
  let setValue!: (next: string[]) => void;
  function Parent() {
    const [value, set] = useState(['ts']);
    setValue = set;
    return (
      <CheckboxGroup aria-label="Skills" value={value} onValueChange={() => {}}>
        {items}
      </CheckboxGroup>
    );
  }
  await screen.rerender(
    <div key="parent">
      <Parent />
    </div>,
  );
  await userEvent.click(box('js'));
  await expect
    .element(box('js'), { message: 'a parent that does not follow keeps its value' })
    .not.toBeChecked();
  setValue(['js']);
  await expect.element(box('js')).toBeChecked();
  await expect.element(box('ts')).not.toBeChecked();
  await screen.rerender(
    <div key="readonly">
      <CheckboxGroup<string> aria-label="Skills" readOnly defaultValue={['ts']}>
        {items}
      </CheckboxGroup>
    </div>,
  );
  await userEvent.click(box('js'));
  await expect.element(box('js')).not.toBeChecked();
  await expect.element(box('js')).toHaveAttribute('aria-readonly', 'true');
});

test('required means at least one, with its own message, and reset restores the default', async () => {
  const changes: string[][] = [];
  const screen = await render(
    <form>
      <CheckboxGroup<string>
        aria-label="Skills"
        name="skills"
        required
        defaultValue={['ts']}
        onValueChange={(next) => changes.push(next)}
      >
        {items}
      </CheckboxGroup>
      <button type="reset">Reset</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const validator = () =>
    screen.container.querySelector<HTMLInputElement>('[data-form-value-validator]');
  const ts = screen.getByRole('checkbox', { name: 'ts' });
  expect(validator()!.checkValidity()).toBe(true);
  await userEvent.click(ts);
  expect(validator()!.checkValidity()).toBe(false);
  expect(validator()!.validationMessage).toBe('하나 이상 선택하세요.');
  expect(form.checkValidity()).toBe(false);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(boxOf(ts)).toHaveAttribute('data-state', 'checked');
  await expect.element(ts).toBeChecked();
  await expect.poll(() => [...new FormData(form)]).toEqual([['skills', 'ts']]);
  expect(changes, 'a reset is not reported').toEqual([[]]);
  await screen.rerender(
    <div key="custom">
      <CheckboxGroup aria-label="Skills" required requiredMessage="Pick one">
        {items}
      </CheckboxGroup>
    </div>,
  );
  expect(validator()!.validationMessage).toBe('Pick one');
  await screen.rerender(
    <div key="readonly">
      <CheckboxGroup aria-label="Skills" required readOnly>
        {items}
      </CheckboxGroup>
    </div>,
  );
  expect(validator(), 'a read-only group is not validated').toBeNull();
});

test('focus on the root goes to the first checked box, else the first enabled one', async () => {
  let root: HTMLDivElement | null = null;
  const screen = await render(
    <CheckboxGroup
      aria-label="Skills"
      ref={(node) => {
        root = node;
      }}
    >
      {({ Item }) => [
        <Item key="js" value="js" aria-label="js" disabled />,
        <Item key="ts" value="ts" aria-label="ts" />,
        <Item key="py" value="py" aria-label="py" />,
      ]}
    </CheckboxGroup>,
  );
  root!.focus();
  await expect.element(screen.getByRole('checkbox', { name: 'ts' })).toHaveFocus();
  await userEvent.click(screen.getByRole('checkbox', { name: 'py' }));
  root!.focus();
  await expect.element(screen.getByRole('checkbox', { name: 'py' })).toHaveFocus();
});

test('plain Checkbox children and CheckboxGroup.All join the group', async () => {
  const changes: string[][] = [];
  const screen = await render(
    <CheckboxGroup aria-label="Alerts" size="tiny" onValueChange={(next) => changes.push(next)}>
      <CheckboxGroup.All aria-label="All" />
      <Checkbox value="mail" aria-label="mail" />
      <Checkbox value="push" aria-label="push" />
      <Checkbox aria-label="unrelated" />
    </CheckboxGroup>,
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'All' }));
  expect(changes).toEqual([['mail', 'push']]);
  await expect
    .element(boxOf(screen.getByRole('checkbox', { name: 'mail' })))
    .toHaveAttribute('data-size', 'tiny');
  await expect
    .element(screen.getByRole('checkbox', { name: 'unrelated' }), {
      message: 'a checkbox without a value is not an option',
    })
    .not.toBeChecked();
  expect(() =>
    renderToString(
      <CheckboxGroup aria-label="x">
        <Checkbox value="a" checked />
      </CheckboxGroup>,
    ),
  ).toThrow(/checked by the group/);
});

test('react-hook-form controlMode="value": array value, error focus, reset', async () => {
  let methods!: UseFormReturn<{ skills: string[] }>;
  let submitted: { skills: string[] } | undefined;
  function App() {
    methods = useForm<{ skills: string[] }>({ defaultValues: { skills: [] } });
    return (
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={methods.handleSubmit((values) => {
            submitted = values;
          })}
        >
          <RHFField
            name="skills"
            controlMode="value"
            registerOptions={{ validate: (value) => value.length > 0 || 'Pick one' }}
          >
            <RHFField.Label>Skills</RHFField.Label>
            <CheckboxGroup>{items}</CheckboxGroup>
            <RHFField.Error />
          </RHFField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const box = (value: string) => screen.getByRole('checkbox', { name: value });
  const submit = screen.getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  await expect.element(screen.getByText('Pick one')).toHaveAttribute('data-field-part', 'error');
  await expect.element(box('js')).toHaveFocus();
  await userEvent.click(box('py'));
  await userEvent.click(box('js'));
  expect(methods.getValues('skills'), 'bubbling checkbox events are ignored').toEqual(['py', 'js']);
  await userEvent.click(submit);
  await expect.poll(() => submitted).toEqual({ skills: ['py', 'js'] });
  methods.reset({ skills: ['ts'] });
  await expect.element(box('ts')).toBeChecked();
  await expect.element(box('py')).not.toBeChecked();
});
