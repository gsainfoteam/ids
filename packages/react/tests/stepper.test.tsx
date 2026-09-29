import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Stepper } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const step = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}`) });

function steps(names = ['Account', 'Profile', 'Review'], marks: Stepper.Item.Props[] = []) {
  return names.map((name, index) => (
    <Stepper.Item key={name} {...marks[index]}>
      <Stepper.Title>{name}</Stepper.Title>
      <Stepper.Description>{`${name} details`}</Stepper.Description>
    </Stepper.Item>
  ));
}

test('SSR: an ordered list of step buttons, the current one marked with aria-current', () => {
  const doc = parse(renderToString(<Stepper defaultValue={1}>{steps()}</Stepper>));
  const list = doc.querySelector('ol')!;
  const items = Array.from(list.children);

  expect(list.getAttribute('aria-label')).toBe('진행 단계');
  expect(items.map((item) => item.tagName)).toEqual(['LI', 'LI', 'LI']);
  expect(items.map((item) => item.getAttribute('data-state'))).toEqual([
    'completed',
    'current',
    'upcoming',
  ]);

  const buttons = Array.from(doc.querySelectorAll<HTMLButtonElement>('li > button'));
  expect(buttons.map((button) => button.getAttribute('aria-current'))).toEqual([
    null,
    'step',
    null,
  ]);
  expect(buttons[0]!.getAttribute('aria-labelledby')!.split(' ')).toHaveLength(2);
  expect(doc.getElementById(buttons[1]!.getAttribute('aria-describedby')!)!.textContent).toBe(
    'Profile details',
  );
  expect(buttons[0]!.querySelector('[data-stepper-indicator] svg'), 'a check').not.toBeNull();
  expect(buttons[1]!.querySelector('[data-stepper-indicator]')!.textContent).toBe('2');
  expect(doc.querySelectorAll('[data-stepper-separator]')).toHaveLength(2);
});

test('SSR: a value without onValueChange only shows progress, with no buttons', () => {
  const doc = parse(renderToString(<Stepper value={2}>{steps()}</Stepper>));

  expect(doc.querySelectorAll('button')).toHaveLength(0);
  expect(doc.querySelector('li[aria-current="step"]')!.textContent).toContain('Review');
  expect(doc.querySelector('li')!.textContent).toContain('완료');
});

test('linear: only the steps behind and the next one can be pressed', async () => {
  const onValueChange = vi.fn();
  await render(<Stepper onValueChange={onValueChange}>{steps()}</Stepper>);

  await expect.element(step('Review')).toBeDisabled();
  await userEvent.click(step('Profile'));
  expect(onValueChange).toHaveBeenLastCalledWith(1);
  await expect.element(step('Review')).toBeEnabled();
  await expect.element(step('Profile')).toHaveAttribute('aria-current', 'step');
  await userEvent.click(step('Account'));
  expect(onValueChange).toHaveBeenLastCalledWith(0);
  await expect.element(step('Review')).toBeDisabled();
});

test('linear: a step marked completed can be reached even when it lies ahead', async () => {
  await render(<Stepper>{steps(undefined, [{}, {}, { completed: true }])}</Stepper>);

  await expect.element(step('Review')).toBeEnabled();
  await expect.element(step('Review')).toHaveAccessibleName('Review 완료');
  await expect.element(step('Review')).not.toHaveAttribute('data-unreachable');
});

test('non-linear: any step can be pressed, disabled ones cannot', async () => {
  const onValueChange = vi.fn();
  await render(
    <Stepper linear={false} onValueChange={onValueChange}>
      {steps(['A', 'B', 'C', 'D'], [{}, { disabled: true }])}
    </Stepper>,
  );

  await userEvent.click(step('D'));
  expect(onValueChange).toHaveBeenLastCalledWith(3);
  await expect.element(step('B')).toBeDisabled();
  await expect.element(step('B')).toHaveAttribute('data-disabled');
  await expect.element(step('D')).toHaveAttribute('aria-current', 'step');
});

test('a disabled root disables every step', async () => {
  await render(
    <Stepper disabled linear={false}>
      {steps()}
    </Stepper>,
  );

  for (const name of ['Account', 'Profile', 'Review'])
    await expect.element(step(name)).toBeDisabled();
});

test('keyboard: one Tab stop on the current step, arrows, Home and End move between steps', async () => {
  await render(
    <>
      <button type="button">before</button>
      <Stepper linear={false} defaultValue={1}>
        {steps(['A', 'B', 'C', 'D'], [{}, {}, { disabled: true }])}
      </Stepper>
      <button type="button">after</button>
    </>,
  );

  page.getByRole('button', { name: 'before' }).element().focus();
  await userEvent.keyboard('{Tab}');
  await expect.element(step('B')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(step('D')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(step('D')).toHaveFocus();
  await userEvent.keyboard('{Home}');
  await expect.element(step('A')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(step('B')).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(step('D')).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(page.getByRole('button', { name: 'after' })).toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(step('B')).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await userEvent.keyboard('{Enter}');
  await expect.element(step('A')).toHaveAttribute('aria-current', 'step');
  await userEvent.keyboard('{ArrowRight}');
  await userEvent.keyboard(' ');
  await expect.element(step('B')).toHaveAttribute('aria-current', 'step');
});

test('right-to-left swaps the left and right arrows', async () => {
  await render(
    <div dir="rtl">
      <Stepper linear={false}>{steps()}</Stepper>
    </div>,
  );

  step('Account').element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(step('Profile')).toHaveFocus();
});

test('an error step keeps aria-current and reads its state after the title', async () => {
  await render(<Stepper defaultValue={1}>{steps(undefined, [{}, { error: true }])}</Stepper>);

  const profile = step('Profile');
  await expect.element(profile).toHaveAccessibleName('Profile 오류');
  await expect.element(profile).toHaveAccessibleDescription('Profile details');
  await expect.element(profile).toHaveAttribute('aria-current', 'step');
  await expect.element(profile).toHaveAttribute('data-state', 'error');
  expect(profile.element().querySelector('svg')).not.toBeNull();
});

test('Content shows only the panel of the current step and keeps the others mounted', async () => {
  await render(
    <Stepper defaultValue={0}>
      {steps()}
      <Stepper.Content value={0}>
        <input aria-label="Email" />
      </Stepper.Content>
      <Stepper.Content value={1}>Profile form</Stepper.Content>
    </Stepper>,
  );

  await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'a@b.c');
  await userEvent.click(step('Profile'));
  await expect.element(page.getByText('Profile form')).toBeVisible();
  await expect.element(page.getByLabelText('Email')).not.toBeVisible();
  await userEvent.click(step('Account'));
  await expect.element(page.getByRole('textbox', { name: 'Email' })).toHaveValue('a@b.c');
});

test('explicit parts replace the defaults, and part children take the step state', async () => {
  await render(
    <Stepper defaultValue={1}>
      <Stepper.Item>
        <Stepper.Trigger>
          <Stepper.Title>First</Stepper.Title>
          <Stepper.Indicator>
            {(state) => (state.status === 'completed' ? '✓' : 'x')}
          </Stepper.Indicator>
        </Stepper.Trigger>
        <Stepper.Separator className="custom-separator" />
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>{(state) => `Second ${state.status}`}</Stepper.Title>
      </Stepper.Item>
    </Stepper>,
  );

  const first = step('First').element();
  expect(first.querySelectorAll('[data-stepper-indicator]')).toHaveLength(1);
  expect(first.querySelector('[data-stepper-indicator]')!.textContent).toBe('✓');
  expect(document.querySelectorAll('[data-stepper-separator]')).toHaveLength(1);
  expect(document.querySelector('.custom-separator')).not.toBeNull();
  await expect.element(step('Second current')).toHaveAttribute('aria-current', 'step');
});

test('development warnings: a value past the steps and a child that is not a part', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(
    <Stepper value={5}>
      {steps()}
      <div>stray</div>
    </Stepper>,
  );

  expect(warn).toHaveBeenCalledWith(expect.stringContaining('value=5 is outside the 3 steps'));
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('only Stepper.Item and Stepper.Content'),
  );
});
