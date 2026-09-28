import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, Radio, RadioGroup } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const circleOf = (radio: Locator) => radio.element().closest<HTMLElement>('[data-radio]')!;

const plans = ['free', 'pro', 'team'];
const items = ({ Item }: RadioGroup.RenderProps) =>
  plans.map((plan) => <Item key={plan} value={plan} aria-label={plan} />);

async function keydownPrevented(keys: string, key: string) {
  const prevented: boolean[] = [];
  const observe = (event: KeyboardEvent) => {
    if (event.key === key) prevented.push(event.defaultPrevented);
  };
  window.addEventListener('keydown', observe);
  try {
    await userEvent.keyboard(keys);
  } finally {
    window.removeEventListener('keydown', observe);
  }
  return prevented;
}

test('SSR: a radiogroup root labelled by Field, radios sharing one name and the group settings', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field size="tiny" required invalid>
          <Field.Label>Plan</Field.Label>
          <Field.Description>Change it any time</Field.Description>
          <RadioGroup<string> name="plan" defaultValue="pro" orientation="horizontal">
            {items}
          </RadioGroup>
        </Field>
      </form>,
    ),
  );
  const root = doc.querySelector('[role=radiogroup]')!;
  const label = doc.querySelector('label')!;
  expect(label.htmlFor, 'the id stays on the group').toBe(root.id);
  expect(root.getAttribute('aria-labelledby')).toBe(label.id);
  expect(doc.getElementById(root.getAttribute('aria-describedby')!)!.textContent).toBe(
    'Change it any time',
  );
  expect(root.getAttribute('aria-orientation')).toBe('horizontal');
  expect(root.getAttribute('aria-required')).toBe('true');
  expect(root.getAttribute('aria-invalid')).toBe('true');
  const radios = [...doc.querySelectorAll<HTMLInputElement>('input[type=radio]')];
  expect(radios.map((input) => [input.name, input.required, input.checked])).toEqual([
    ['plan', true, false],
    ['plan', true, true],
    ['plan', true, false],
  ]);
  expect(
    radios.every((input) => input.closest<HTMLElement>('[data-radio]')!.dataset.size === 'tiny'),
  ).toBe(true);
  expect(radios.every((input) => input.closest('[data-radio]')!.hasAttribute('data-invalid'))).toBe(
    true,
  );
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([['plan', 'pro']]);
});

test('uncontrolled selection, controlled parent value, and no echo of outside changes', async () => {
  const changes: string[] = [];
  const screen = await render(
    <RadioGroup aria-label="Plan" onValueChange={(next) => changes.push(next)}>
      {items}
    </RadioGroup>,
  );
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  await expect
    .element(circleOf(radio('free')), { message: 'nothing is selected without a default' })
    .toHaveAttribute('data-state', 'unchecked');
  await userEvent.click(radio('team'));
  await expect.element(circleOf(radio('team'))).toHaveAttribute('data-state', 'checked');
  await userEvent.click(radio('pro'));
  await expect.element(circleOf(radio('team'))).toHaveAttribute('data-state', 'unchecked');
  expect(changes).toEqual(['team', 'pro']);
  let setValue!: (next: string) => void;
  function Parent() {
    const [value, set] = useState('free');
    setValue = set;
    return (
      <RadioGroup aria-label="Plan" value={value} onValueChange={(next) => changes.push(next)}>
        {items}
      </RadioGroup>
    );
  }
  await screen.rerender(
    <div key="parent">
      <Parent />
    </div>,
  );
  await userEvent.click(radio('pro'));
  await expect
    .element(radio('free'), { message: 'a parent that does not follow keeps its value' })
    .toBeChecked();
  await expect.element(circleOf(radio('pro'))).toHaveAttribute('data-state', 'unchecked');
  setValue('team');
  await expect.element(circleOf(radio('team'))).toHaveAttribute('data-state', 'checked');
  expect(changes).toEqual(['team', 'pro', 'pro']);
});

test('readOnly keeps the value, disabled turns every radio off, an item can opt out alone', async () => {
  const changes: string[] = [];
  const screen = await render(
    <RadioGroup<string>
      aria-label="Plan"
      readOnly
      defaultValue="free"
      onValueChange={(next) => changes.push(next)}
    >
      {items}
    </RadioGroup>,
  );
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  await expect
    .element(screen.getByRole('radiogroup', { name: 'Plan' }))
    .toHaveAttribute('aria-readonly', 'true');
  await userEvent.click(radio('pro'));
  await expect.element(radio('free')).toBeChecked();
  await expect.element(circleOf(radio('pro'))).toHaveAttribute('data-state', 'unchecked');
  expect(changes).toEqual([]);
  await screen.rerender(
    <div key="disabled">
      <RadioGroup aria-label="Plan" disabled>
        {items}
      </RadioGroup>
    </div>,
  );
  for (const plan of plans) await expect.element(radio(plan)).toHaveAttribute('disabled');
  await screen.rerender(
    <div key="item">
      <RadioGroup aria-label="Plan">
        {({ Item }) => [
          <Item key="free" value="free" aria-label="free" />,
          <Item key="pro" value="pro" aria-label="pro" disabled />,
        ]}
      </RadioGroup>
    </div>,
  );
  await expect.element(radio('free')).not.toHaveAttribute('disabled');
  await expect.element(radio('pro')).toHaveAttribute('disabled');
});

test('focus on the root goes to the checked radio, else the first enabled one', async () => {
  let root: HTMLDivElement | null = null;
  const screen = await render(
    <RadioGroup
      aria-label="Plan"
      ref={(node) => {
        root = node;
      }}
    >
      {({ Item }) => [
        <Item key="free" value="free" aria-label="free" disabled />,
        <Item key="pro" value="pro" aria-label="pro" />,
        <Item key="team" value="team" aria-label="team" />,
      ]}
    </RadioGroup>,
  );
  expect(root, 'ref is the stable root').toBe(
    screen.getByRole('radiogroup', { name: 'Plan' }).element(),
  );
  root!.focus();
  await expect.element(screen.getByRole('radio', { name: 'pro' })).toHaveFocus();
  await userEvent.click(screen.getByRole('radio', { name: 'team' }));
  root!.focus();
  await expect.element(screen.getByRole('radio', { name: 'team' })).toHaveFocus();
});

test('Home and End choose the first and last enabled radio; read-only only moves focus', async () => {
  const changes: string[] = [];
  const view = (props: Partial<RadioGroup.Props> = {}) => (
    <RadioGroup<string>
      aria-label="Plan"
      defaultValue="pro"
      onValueChange={(next) => changes.push(next)}
      {...props}
    >
      {({ Item }) => [
        <Item key="free" value="free" aria-label="free" disabled />,
        <Item key="pro" value="pro" aria-label="pro" />,
        <Item key="team" value="team" aria-label="team" />,
      ]}
    </RadioGroup>
  );
  const screen = await render(view());
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  radio('pro').element().focus();
  expect(await keydownPrevented('{End}', 'End'), 'the page does not scroll').toEqual([true]);
  await expect.element(radio('team')).toHaveFocus();
  await expect.element(circleOf(radio('team'))).toHaveAttribute('data-state', 'checked');
  await userEvent.keyboard('{Home}');
  await expect.element(radio('pro'), { message: 'a disabled radio is passed over' }).toHaveFocus();
  await expect.element(circleOf(radio('pro'))).toHaveAttribute('data-state', 'checked');
  expect(
    await keydownPrevented('{Shift>}{End}{/Shift}', 'End'),
    'a modified key is left alone',
  ).toEqual([false]);
  expect(changes).toEqual(['team', 'pro']);

  await screen.rerender(<div key="read-only">{view({ readOnly: true })}</div>);
  radio('pro').element().focus();
  await userEvent.keyboard('{End}');
  await expect.element(radio('team')).toHaveFocus();
  await expect
    .element(radio('pro'), { message: 'a read-only group only moves focus' })
    .toBeChecked();
  await screen.rerender(
    <div key="own">
      {view({ onKeyDown: (event) => event.key === 'End' && event.preventDefault() })}
    </div>,
  );
  radio('pro').element().focus();
  await userEvent.keyboard('{End}');
  await expect
    .element(radio('pro'), { message: "the root's own onKeyDown can keep the key" })
    .toBeChecked();
  expect(changes).toEqual(['team', 'pro']);
});

test('native form: required, FormData, and reset back to defaultValue without a report', async () => {
  const changes: string[] = [];
  const screen = await render(
    <form>
      <RadioGroup<string>
        aria-label="Plan"
        name="plan"
        required
        defaultValue="free"
        onValueChange={(next) => changes.push(next)}
      >
        {items}
      </RadioGroup>
      <button type="reset">Reset</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  for (const plan of plans) await expect.element(radio(plan)).toHaveAttribute('required');
  await userEvent.click(radio('team'));
  expect([...new FormData(form)]).toEqual([['plan', 'team']]);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(circleOf(radio('free'))).toHaveAttribute('data-state', 'checked');
  await expect.element(radio('free')).toBeChecked();
  await expect.element(radio('team')).not.toBeChecked();
  await expect.poll(() => [...new FormData(form)]).toEqual([['plan', 'free']]);
  expect(changes).toEqual(['team']);
});

test('className and style take a function of the group state', async () => {
  const screen = await render(
    <RadioGroup
      aria-label="Plan"
      className={(state) => (state.value ? `picked-${state.value}` : 'empty')}
      style={(state) => ({ opacity: state.invalid ? 0.5 : 1 })}
      invalid
    >
      {items}
    </RadioGroup>,
  );
  const group = screen.getByRole('radiogroup', { name: 'Plan' });
  await expect.element(group).toHaveClass('empty');
  await expect.element(group).toHaveStyle({ opacity: '0.5' });
  await userEvent.click(screen.getByRole('radio', { name: 'pro' }));
  await expect.element(group).toHaveClass('picked-pro');
});

test('plain Radio children join the group; size and variant fan out to them', async () => {
  const changes: string[] = [];
  const screen = await render(
    <RadioGroup
      aria-label="Size"
      size="tiny"
      variant="soft"
      onValueChange={(next) => changes.push(next)}
    >
      <Radio value="s" aria-label="S" />
      <Radio value="m" aria-label="M" size="standard" />
    </RadioGroup>,
  );
  const small = screen.getByRole('radio', { name: 'S' });
  const medium = screen.getByRole('radio', { name: 'M' });
  await expect.element(circleOf(small)).toHaveAttribute('data-size', 'tiny');
  await expect.element(circleOf(small)).toHaveAttribute('data-variant', 'soft');
  await expect
    .element(circleOf(medium), { message: 'an explicit item size wins' })
    .toHaveAttribute('data-size', 'standard');
  expect((small.element() as HTMLInputElement).name).toBe(
    (medium.element() as HTMLInputElement).name,
  );
  await userEvent.click(medium);
  expect(changes).toEqual(['m']);
  expect(() =>
    renderToString(
      <RadioGroup aria-label="x">
        <Radio aria-label="no value" />
      </RadioGroup>,
    ),
  ).toThrow(/needs a `value`/);
});

test('react-hook-form controlMode="value": error focus, selection and reset', async () => {
  let methods!: UseFormReturn<{ plan: string }>;
  let submitted: { plan: string } | undefined;
  function App() {
    methods = useForm<{ plan: string }>({ defaultValues: { plan: '' } });
    return (
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={methods.handleSubmit((values) => {
            submitted = values;
          })}
        >
          <RHFField name="plan" controlMode="value" registerOptions={{ required: 'Pick one' }}>
            <RHFField.Label>Plan</RHFField.Label>
            <RadioGroup>{items}</RadioGroup>
            <RHFField.Error />
          </RHFField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  const submit = screen.getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  await expect.element(screen.getByText('Pick one')).toHaveAttribute('data-field-part', 'error');
  await expect
    .element(radio('free'), { message: 'the group hands focus to its first radio' })
    .toHaveFocus();
  await userEvent.click(radio('pro'));
  expect(methods.getValues('plan')).toBe('pro');
  await userEvent.click(submit);
  await expect.poll(() => submitted).toEqual({ plan: 'pro' });
  methods.reset({ plan: 'team' });
  await expect.element(circleOf(radio('team'))).toHaveAttribute('data-state', 'checked');
});
