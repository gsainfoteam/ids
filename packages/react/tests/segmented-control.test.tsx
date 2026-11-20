import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, IdsProvider, SegmentedControl } from '../src';
import { testTheme } from './theme';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const segmentOf = (radio: Locator) =>
  radio.element().closest<HTMLElement>('[data-segmented-control-item]')!;

const periods = ['day', 'week', 'month'];
const items = ({ Item }: SegmentedControl.RenderProps) =>
  periods.map((period) => (
    <Item key={period} value={period}>
      {period}
    </Item>
  ));

function colorOf(variable: string, root = document.querySelector('[data-mode]')!) {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${variable})`;
  root.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

function lengthOf(variable: string) {
  const probe = document.createElement('div');
  probe.style.height = `var(${variable})`;
  document.querySelector('[data-mode]')!.append(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

test('SSR: a radiogroup fieldset labelled by Field, one native radio per segment', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field size="tiny" required>
          <Field.Label>Period</Field.Label>
          <SegmentedControl<string> name="period" defaultValue="week">
            {items}
          </SegmentedControl>
        </Field>
      </form>,
    ),
  );
  const root = doc.querySelector('[role=radiogroup]')!;
  expect(root.tagName).toBe('FIELDSET');
  expect(root.getAttribute('aria-labelledby')).toBe(doc.querySelector('label')!.id);
  expect(root.getAttribute('aria-orientation')).toBe('horizontal');
  expect(root.getAttribute('data-size'), 'the size follows Field').toBe('tiny');
  const radios = [...doc.querySelectorAll<HTMLInputElement>('input[type=radio]')];
  expect(radios.map((input) => [input.name, input.required, input.checked])).toEqual([
    ['period', true, false],
    ['period', true, true],
    ['period', true, false],
  ]);
  expect(
    radios.map((input) => input.closest('label')?.getAttribute('data-state')),
    'each radio sits in its segment label',
  ).toEqual(['unchecked', 'checked', 'unchecked']);
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([['period', 'week']]);
});

test('a click anywhere on a segment selects it; a controlled parent decides the value', async () => {
  const changes: string[] = [];
  const screen = await render(
    <SegmentedControl aria-label="Period" onValueChange={(next) => changes.push(next)}>
      {items}
    </SegmentedControl>,
  );
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  await expect.element(segmentOf(radio('day'))).toHaveAttribute('data-state', 'unchecked');
  await userEvent.click(screen.getByText('month'));
  await expect.element(segmentOf(radio('month'))).toHaveAttribute('data-state', 'checked');
  await userEvent.click(radio('day'));
  await expect.element(segmentOf(radio('month'))).toHaveAttribute('data-state', 'unchecked');
  expect(changes).toEqual(['month', 'day']);

  let setValue!: (next: string) => void;
  function Parent() {
    const [value, set] = useState('day');
    setValue = set;
    return (
      <SegmentedControl
        aria-label="Period"
        value={value}
        onValueChange={(next) => changes.push(next)}
      >
        {items}
      </SegmentedControl>
    );
  }
  await screen.rerender(
    <div key="parent">
      <Parent />
    </div>,
  );
  await userEvent.click(radio('week'));
  await expect
    .element(radio('day'), { message: 'a parent that does not follow keeps its value' })
    .toBeChecked();
  setValue('month');
  await expect.element(segmentOf(radio('month'))).toHaveAttribute('data-state', 'checked');
  expect(changes).toEqual(['month', 'day', 'week']);
});

test('arrows move and select, Home and End reach the ends, disabled segments are skipped', async () => {
  const changes: string[] = [];
  const view = (props: Partial<SegmentedControl.Props> = {}) => (
    <SegmentedControl<string>
      aria-label="Period"
      defaultValue="week"
      onValueChange={(next) => changes.push(next)}
      {...props}
    >
      {({ Item }) => [
        <Item key="day" value="day" disabled>
          day
        </Item>,
        <Item key="week" value="week">
          week
        </Item>,
        <Item key="month" value="month">
          month
        </Item>,
      ]}
    </SegmentedControl>
  );
  const screen = await render(view());
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  radio('week').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(radio('month')).toHaveFocus();
  await expect.element(radio('month')).toBeChecked();
  await userEvent.keyboard('{Home}');
  await expect.element(radio('week'), { message: 'Home passes the disabled day' }).toHaveFocus();
  await expect.element(radio('week')).toBeChecked();
  await userEvent.keyboard('{End}');
  await expect.element(radio('month')).toBeChecked();
  expect(changes).toEqual(['month', 'week', 'month']);

  await screen.rerender(<div key="read-only">{view({ readOnly: true })}</div>);
  radio('week').element().focus();
  await userEvent.keyboard('{End}');
  await expect.element(radio('month')).toHaveFocus();
  await expect
    .element(radio('week'), { message: 'a read-only control only moves focus' })
    .toBeChecked();
  await userEvent.click(radio('month'));
  await expect.element(radio('week')).toBeChecked();
  expect(changes).toEqual(['month', 'week', 'month']);
});

test('native form: required, FormData, disabled and reset back to defaultValue', async () => {
  const changes: string[] = [];
  const screen = await render(
    <form>
      <SegmentedControl<string>
        aria-label="Period"
        name="period"
        required
        defaultValue="day"
        onValueChange={(next) => changes.push(next)}
      >
        {items}
      </SegmentedControl>
      <button type="reset">Reset</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  for (const period of periods) await expect.element(radio(period)).toHaveAttribute('required');
  await userEvent.click(radio('month'));
  expect([...new FormData(form)]).toEqual([['period', 'month']]);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(segmentOf(radio('day'))).toHaveAttribute('data-state', 'checked');
  await expect.poll(() => [...new FormData(form)]).toEqual([['period', 'day']]);
  expect(changes, 'reset is not reported').toEqual(['month']);

  await screen.rerender(
    <form key="disabled">
      <SegmentedControl<string> aria-label="Period" name="period" defaultValue="day" disabled>
        {items}
      </SegmentedControl>
    </form>,
  );
  for (const period of periods) await expect.element(radio(period)).toBeDisabled();
  await expect.element(segmentOf(radio('day'))).toHaveAttribute('data-disabled');
  expect([...new FormData(screen.container.querySelector('form')!)]).toEqual([]);
});

test('react-hook-form controlMode="value": error focus, selection and reset', async () => {
  let methods!: UseFormReturn<{ period: string }>;
  function App() {
    methods = useForm<{ period: string }>({ defaultValues: { period: '' } });
    return (
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(() => {})}>
          <RHFField name="period" controlMode="value" registerOptions={{ required: 'Pick one' }}>
            <RHFField.Label>Period</RHFField.Label>
            <SegmentedControl>{items}</SegmentedControl>
            <RHFField.Error />
          </RHFField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await expect.element(screen.getByText('Pick one')).toBeVisible();
  await expect.element(radio('day')).toHaveFocus();
  await userEvent.click(radio('week'));
  expect(methods.getValues('period')).toBe('week');
  methods.reset({ period: 'month' });
  await expect.element(segmentOf(radio('month'))).toHaveAttribute('data-state', 'checked');
});

test('light: the selected segment is a card on a neutral track as tall as a control', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <div>
        <SegmentedControl<string> aria-label="Period" defaultValue="week">
          {items}
        </SegmentedControl>
      </div>
    </IdsProvider>,
  );
  const radio = (value: string) => screen.getByRole('radio', { name: value });
  const track = screen.getByRole('radiogroup').element();
  const selected = segmentOf(radio('week'));
  const other = segmentOf(radio('day'));

  await expect
    .poll(() => getComputedStyle(track).backgroundColor)
    .toBe(colorOf('--ids-color-bg-neutral-subtle'));
  expect(getComputedStyle(selected).backgroundColor).toBe(
    colorOf('--ids-color-bg-segment'),
  );
  expect(getComputedStyle(selected).backgroundColor).toBe(
    colorOf('--ids-color-bg-neutral-subtlest'),
  );
  expect(getComputedStyle(selected).boxShadow).not.toBe('none');
  expect(getComputedStyle(selected).color).toBe(colorOf('--ids-color-text-neutral-bold'));
  expect(getComputedStyle(other).color).toBe(colorOf('--ids-color-text-neutral'));
  expect(getComputedStyle(other).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(track.getBoundingClientRect().height).toBeCloseTo(
    lengthOf('--ids-size-control-standard'),
    0,
  );
  expect(track.getBoundingClientRect().width).toBeLessThan(
    track.parentElement!.getBoundingClientRect().width,
  );

  const restingLayer = getComputedStyle(other).getPropertyValue('--ids-state-opacity');
  await userEvent.hover(other);
  await expect.element(other).toHaveAttribute('data-hovered');
  await expect
    .poll(() => getComputedStyle(other).getPropertyValue('--ids-state-opacity'))
    .not.toBe(restingLayer);
  expect(getComputedStyle(other).color, 'hover adds a layer, not a color').toBe(
    colorOf('--ids-color-text-neutral'),
  );
  await userEvent.unhover(other);
});

test('dark: the selected card sits one neutral step above the track', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme} mode="dark">
      <SegmentedControl<string> aria-label="Period" defaultValue="day">
        {items}
      </SegmentedControl>
    </IdsProvider>,
  );
  const root = document.querySelector('[data-mode="dark"]')!;
  const selected = segmentOf(screen.getByRole('radio', { name: 'day' }));
  await expect
    .poll(() => getComputedStyle(selected).backgroundColor)
    .toBe(colorOf('--ids-color-bg-neutral', root));
  expect(getComputedStyle(screen.getByRole('radiogroup').element()).backgroundColor).toBe(
    colorOf('--ids-color-bg-neutral-subtle', root),
  );
  expect(getComputedStyle(selected).color).toBe(colorOf('--ids-color-text-neutral-bold', root));
});

test('an unstretched control keeps its width and follows the parent alignment', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <div style={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SegmentedControl<string> aria-label="Period" defaultValue="day">
          {items}
        </SegmentedControl>
      </div>
    </IdsProvider>,
  );
  const track = screen.getByRole('radiogroup').element();
  const parent = track.parentElement!.getBoundingClientRect();
  const box = track.getBoundingClientRect();
  expect(box.width).toBeLessThan(parent.width);
  expect(box.left - parent.left, 'centred by the parent').toBeCloseTo(parent.right - box.right, 0);
});

test('stretch shares the width; keyboard focus rings the segment label', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <div style={{ width: 300 }}>
        <SegmentedControl<string> aria-label="Period" stretch defaultValue="day">
          {items}
        </SegmentedControl>
      </div>
    </IdsProvider>,
  );
  const track = screen.getByRole('radiogroup').element();
  expect(track.getBoundingClientRect().width).toBeCloseTo(300, 0);
  const widths = periods.map(
    (period) =>
      segmentOf(screen.getByRole('radio', { name: period })).getBoundingClientRect().width,
  );
  expect(widths[0]).toBeCloseTo(widths[2]!, 0);

  const segment = segmentOf(screen.getByRole('radio', { name: 'day' }));
  const resting = getComputedStyle(segment).boxShadow;
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('radio', { name: 'day' })).toHaveFocus();
  await expect.poll(() => getComputedStyle(segment).boxShadow).not.toBe(resting);
});

test('development warns about children that are not items; an item needs the control', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(
    <SegmentedControl aria-label="Sort" defaultValue="new">
      <SegmentedControl.Item value="new">New</SegmentedControl.Item>
      <span>Popular</span>
    </SegmentedControl>,
  );
  await expect.poll(() => warn.mock.calls.flat().join(' ')).toContain('only SegmentedControl.Item');
  warn.mockClear();
  await render(
    <SegmentedControl aria-label="Sort">
      <>
        <SegmentedControl.Item value="new">New</SegmentedControl.Item>
        {false}
      </>
    </SegmentedControl>,
  );
  expect(warn, 'fragments and empty slots are fine').not.toHaveBeenCalled();
  warn.mockRestore();
  expect(() => renderToString(<SegmentedControl.Item value="x">x</SegmentedControl.Item>)).toThrow(
    /inside SegmentedControl/,
  );
});
