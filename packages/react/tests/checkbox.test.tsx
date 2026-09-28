import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Checkbox, Field } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const nativeInput = (checkbox: Locator) => checkbox.element() as HTMLInputElement;
const boxOf = (checkbox: Locator) => checkbox.element().closest<HTMLElement>('[data-checkbox]')!;

test('SSR: one native checkbox carries the form and ARIA props, the box carries the state', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field size="tiny" invalid required>
          <Field.Label>Terms</Field.Label>
          <Checkbox name="terms" value="yes" defaultChecked />
          <Field.Error>Required</Field.Error>
        </Field>
        <Checkbox aria-label="Mixed" defaultChecked="indeterminate" />
      </form>,
    ),
  );
  const [terms, mixed] = doc.querySelectorAll('input');
  expect(terms.type).toBe('checkbox');
  expect(terms.checked).toBe(true);
  expect(terms.required).toBe(true);
  expect(terms.getAttribute('aria-invalid')).toBe('true');
  expect(doc.querySelector('label')!.htmlFor).toBe(terms.id);
  expect(doc.getElementById(terms.getAttribute('aria-describedby')!)!.textContent).toBe('Required');
  const termsBox = terms.closest<HTMLElement>('[data-checkbox]')!;
  expect(termsBox.dataset.state).toBe('checked');
  expect(termsBox.dataset.size).toBe('tiny');
  expect(termsBox.hasAttribute('data-invalid')).toBe(true);
  expect(termsBox.hasAttribute('data-required')).toBe(true);
  expect(termsBox.querySelector('[data-state] svg'), 'a check glyph is drawn').not.toBeNull();
  expect(mixed.closest<HTMLElement>('[data-checkbox]')!.dataset.state).toBe('indeterminate');
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([['terms', 'yes']]);
});

test('uncontrolled: a click toggles, indeterminate turns checked, onCheckedChange gets booleans', async () => {
  const changes: boolean[] = [];
  const screen = await render(
    <Checkbox
      aria-label="Mixed"
      defaultChecked="indeterminate"
      onCheckedChange={(next) => changes.push(next)}
    />,
  );
  const mixed = screen.getByRole('checkbox', { name: 'Mixed' });
  await expect.element(mixed).toBePartiallyChecked();
  expect(nativeInput(mixed).checked).toBe(false);
  await userEvent.click(mixed);
  await expect.element(mixed).not.toBePartiallyChecked();
  await expect.element(mixed).toBeChecked();
  await expect.element(boxOf(mixed)).toHaveAttribute('data-state', 'checked');
  await userEvent.click(mixed);
  await expect.element(boxOf(mixed)).toHaveAttribute('data-state', 'unchecked');
  expect(changes).toEqual([true, false]);
});

test('controlled: a parent that keeps the mixed state keeps it after a click', async () => {
  const changes: boolean[] = [];
  const screen = await render(
    <Checkbox
      aria-label="Fixed"
      checked="indeterminate"
      onCheckedChange={(next) => changes.push(next)}
    />,
  );
  const fixed = screen.getByRole('checkbox', { name: 'Fixed' });
  await userEvent.click(fixed);
  expect(changes).toEqual([true]);
  await expect
    .element(fixed, { message: 'the flag the browser cleared is restored' })
    .toBePartiallyChecked();
  expect(nativeInput(fixed).checked).toBe(false);
  await expect.element(boxOf(fixed)).toHaveAttribute('data-state', 'indeterminate');
  let setChecked!: (next: Checkbox.Checked) => void;
  function Parent() {
    const [checked, set] = useState<Checkbox.Checked>(false);
    setChecked = set;
    return <Checkbox aria-label="Parent" checked={checked} onCheckedChange={set} />;
  }
  await screen.rerender(
    <div key="parent">
      <Parent />
    </div>,
  );
  const parent = screen.getByRole('checkbox', { name: 'Parent' });
  setChecked('indeterminate');
  await expect.element(parent).toBePartiallyChecked();
  await userEvent.click(parent);
  await expect.element(parent).not.toBePartiallyChecked();
  await expect.element(boxOf(parent)).toHaveAttribute('data-state', 'checked');
});

test('readOnly and a prevented click leave the value alone and report nothing', async () => {
  const changes: boolean[] = [];
  const events: string[] = [];
  const screen = await render(
    <Checkbox
      aria-label="Locked"
      readOnly
      defaultChecked
      onCheckedChange={(next) => changes.push(next)}
      onChange={() => events.push('change')}
    />,
  );
  const locked = screen.getByRole('checkbox', { name: 'Locked' });
  await expect.element(locked).toHaveAttribute('aria-readonly', 'true');
  await expect
    .element(locked, { message: 'readonly is not valid on a checkbox' })
    .not.toHaveAttribute('readonly');
  await userEvent.click(locked);
  await expect.element(locked).toBeChecked();
  await expect.element(boxOf(locked)).toHaveAttribute('data-state', 'checked');
  await screen.rerender(
    <div key="veto">
      <Checkbox
        aria-label="Veto"
        onClick={(event) => event.preventDefault()}
        onCheckedChange={(next) => changes.push(next)}
      />
    </div>,
  );
  const veto = screen.getByRole('checkbox', { name: 'Veto' });
  await userEvent.click(veto);
  await expect.element(veto).not.toBeChecked();
  await expect.element(boxOf(veto)).toHaveAttribute('data-state', 'unchecked');
  expect(changes).toEqual([]);
  expect(events).toEqual([]);
});

test('a direct write to input.checked (react-hook-form setValue) reaches state', async () => {
  const changes: boolean[] = [];
  const screen = await render(
    <Checkbox aria-label="Agree" onCheckedChange={(next) => changes.push(next)} />,
  );
  const agree = screen.getByRole('checkbox', { name: 'Agree' });
  nativeInput(agree).checked = true;
  await expect.element(boxOf(agree)).toHaveAttribute('data-state', 'checked');
  expect(changes).toEqual([true]);
  await userEvent.click(agree);
  expect(changes, 'React’s own writes are not reported back').toEqual([true, false]);
});

test('form reset: uncontrolled returns to defaultChecked, controlled keeps its parent value', async () => {
  const changes: boolean[] = [];
  const screen = await render(
    <form>
      <Checkbox
        aria-label="News"
        name="news"
        defaultChecked="indeterminate"
        onCheckedChange={(next) => changes.push(next)}
      />
      <Checkbox aria-label="Held" name="held" checked onCheckedChange={() => {}} />
      <button type="reset">Reset</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const news = screen.getByRole('checkbox', { name: 'News' });
  const held = screen.getByRole('checkbox', { name: 'Held' });
  await userEvent.click(news);
  expect([...new FormData(form)]).toEqual([
    ['news', 'on'],
    ['held', 'on'],
  ]);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(boxOf(news)).toHaveAttribute('data-state', 'indeterminate');
  await expect.element(news).toBePartiallyChecked();
  expect(nativeInput(news).checked).toBe(false);
  await expect
    .element(held, { message: 'the controlled box is written back to its value' })
    .toBeChecked();
  await expect.poll(() => [...new FormData(form)]).toEqual([['held', 'on']]);
  expect(changes, 'a reset is not an edit, like a native checkbox').toEqual([true]);
});

test('react-hook-form register(): error, click, setValue and reset all show on the box', async () => {
  let methods!: UseFormReturn<{ terms: boolean }>;
  function App() {
    methods = useForm<{ terms: boolean }>({ defaultValues: { terms: false } });
    return (
      <FormProvider {...methods}>
        <RHFField name="terms" registerOptions={{ required: 'Agree first' }}>
          <RHFField.Label>Terms</RHFField.Label>
          <Checkbox />
          <RHFField.Error />
        </RHFField>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const terms = screen.getByRole('checkbox', { name: 'Terms' });
  await methods.trigger('terms', { shouldFocus: true });
  await expect.element(screen.getByText('Agree first')).toHaveAttribute('data-field-part', 'error');
  await expect.element(terms).toHaveFocus();
  await expect.element(boxOf(terms)).toHaveAttribute('data-invalid');
  await userEvent.click(terms);
  expect(methods.getValues('terms')).toBe(true);
  methods.setValue('terms', false);
  await expect.element(boxOf(terms)).toHaveAttribute('data-state', 'unchecked');
  methods.reset({ terms: true });
  await expect.element(boxOf(terms)).toHaveAttribute('data-state', 'checked');
  await expect.element(terms).toBeChecked();
});

test('react-hook-form register(): a true default written while mounting shows at once', async () => {
  let methods!: UseFormReturn<{ news: boolean }>;
  function App() {
    methods = useForm<{ news: boolean }>({ defaultValues: { news: true } });
    const [, rerender] = useState(0);
    return (
      <FormProvider {...methods}>
        <RHFField name="news">
          <RHFField.Label>News</RHFField.Label>
          <Checkbox />
        </RHFField>
        <button type="button" onClick={() => rerender((count) => count + 1)}>
          Rerender
        </button>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const news = screen.getByRole('checkbox', { name: 'News' });
  expect(boxOf(news)).toHaveAttribute('data-state', 'checked');
  expect(nativeInput(news).checked).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Rerender' }));
  expect(nativeInput(news).checked, 'a later render does not paint the stale state over it').toBe(
    true,
  );
  await userEvent.click(news);
  expect(methods.getValues('news')).toBe(false);
});

test('react-hook-form controlMode="checked" binds onCheckedChange', async () => {
  let methods!: UseFormReturn<{ alerts: boolean }>;
  function App() {
    methods = useForm<{ alerts: boolean }>({ defaultValues: { alerts: true } });
    return (
      <FormProvider {...methods}>
        <RHFField name="alerts" controlMode="checked">
          <RHFField.Label>Alerts</RHFField.Label>
          <Checkbox />
        </RHFField>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const alerts = screen.getByRole('checkbox', { name: 'Alerts' });
  await expect.element(boxOf(alerts)).toHaveAttribute('data-state', 'checked');
  await userEvent.click(alerts);
  expect(methods.getValues('alerts')).toBe(false);
  await expect.element(boxOf(alerts)).toHaveAttribute('data-state', 'unchecked');
});

test('Indicator: default glyphs, asChild, state functions and misuse', async () => {
  const screen = await render(
    <div>
      <Checkbox aria-label="Default" defaultChecked="indeterminate" />
      <Checkbox
        aria-label="Custom"
        defaultChecked
        className={(state) => (state.checked ? 'is-on' : 'is-off')}
        style={(state) => ({ opacity: state.checked ? 1 : 0.5 })}
      >
        <Checkbox.Indicator asChild>
          <svg data-heart="" />
        </Checkbox.Indicator>
      </Checkbox>
      <Checkbox aria-label="Function">
        <Checkbox.Indicator>{(state) => (state.checked ? 'on' : 'off')}</Checkbox.Indicator>
      </Checkbox>
    </div>,
  );
  const [plain, custom, fn] = ['Default', 'Custom', 'Function'].map((name) =>
    screen.getByRole('checkbox', { name }),
  );
  const glyph = boxOf(plain).querySelector<HTMLElement>('[aria-hidden=true]')!;
  expect(glyph.dataset.state).toBe('indeterminate');
  expect(glyph.querySelector('svg')).not.toBeNull();
  const heart = boxOf(custom).querySelector<SVGElement>('[data-heart]')!;
  expect(heart.getAttribute('aria-hidden')).toBe('true');
  expect(heart.getAttribute('data-state')).toBe('checked');
  await expect.element(boxOf(custom)).toHaveClass('is-on');
  await expect.element(boxOf(custom)).toHaveStyle({ opacity: '1' });
  await userEvent.click(custom);
  await expect.element(heart).toHaveAttribute('data-state', 'unchecked');
  await expect.element(boxOf(custom)).toHaveClass('is-off');
  await expect.element(boxOf(fn)).toHaveTextContent('off');
  await userEvent.click(fn);
  await expect.element(boxOf(fn)).toHaveTextContent('on');
  expect(() => renderToString(<Checkbox.Indicator />)).toThrow(/inside Checkbox/);
  expect(() =>
    renderToString(<Checkbox checked defaultChecked={false} onCheckedChange={() => {}} />),
  ).toThrow(/not both/);
});
