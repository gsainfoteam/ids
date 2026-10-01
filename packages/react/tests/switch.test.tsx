import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, Switch } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const trackOf = (control: Locator) => control.element().closest<HTMLElement>('[data-switch]')!;
const thumbOf = (control: Locator) =>
  trackOf(control).querySelector<HTMLElement>('[aria-hidden=true]')!;

test('SSR: a native checkbox with role="switch", labelled by Field, className on the track', () => {
  const doc = parse(
    renderToString(
      <Field size="tiny" variant="horizontal">
        <Field.Label>Dark mode</Field.Label>
        <Switch name="dark" defaultChecked className="my-track" />
        <Field.Description>Applies at once</Field.Description>
      </Field>,
    ),
  );
  const control = doc.querySelector('input')!;
  expect(control.type).toBe('checkbox');
  expect(control.getAttribute('role')).toBe('switch');
  expect(control.checked).toBe(true);
  expect(doc.querySelector('label')!.htmlFor).toBe(control.id);
  expect(doc.getElementById(control.getAttribute('aria-describedby')!)!.textContent).toBe(
    'Applies at once',
  );
  const root = doc.querySelector<HTMLElement>('[data-switch]')!;
  expect(root.className).toContain('my-track');
  expect(control.className).not.toContain('my-track');
  expect(root.dataset.state).toBe('checked');
  expect(root.dataset.size).toBe('tiny');
  expect(root.querySelector<HTMLElement>('[aria-hidden=true]')!.dataset.state).toBe('checked');
});

test('a click toggles and reports; readOnly and invalid are exposed', async () => {
  const changes: boolean[] = [];
  const screen = await render(
    <Switch aria-label="Alerts" onCheckedChange={(next) => changes.push(next)} />,
  );
  const alerts = screen.getByRole('switch', { name: 'Alerts' });
  await userEvent.click(alerts);
  await expect.element(trackOf(alerts)).toHaveAttribute('data-state', 'checked');
  await expect.element(thumbOf(alerts)).toHaveAttribute('data-state', 'checked');
  await userEvent.click(alerts);
  expect(changes).toEqual([true, false]);
  await screen.rerender(
    <div key="locked">
      <Switch
        aria-label="Locked"
        readOnly
        invalid
        defaultChecked
        onCheckedChange={(next) => changes.push(next)}
      />
    </div>,
  );
  const locked = screen.getByRole('switch', { name: 'Locked' });
  await userEvent.click(locked);
  await expect.element(locked).toBeChecked();
  await expect.element(locked).toHaveAttribute('aria-readonly', 'true');
  await expect.element(locked).toHaveAttribute('aria-invalid', 'true');
  await expect.element(trackOf(locked)).toHaveAttribute('data-invalid');
  expect(changes).toEqual([true, false]);
});

test('native form: name/value submit only when on, reset returns to defaultChecked silently', async () => {
  const changes: boolean[] = [];
  const screen = await render(
    <form>
      <Switch
        aria-label="Autosave"
        name="autosave"
        value="yes"
        defaultChecked
        onCheckedChange={(next) => changes.push(next)}
      />
      <button type="reset">Reset</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const autosave = screen.getByRole('switch', { name: 'Autosave' });
  expect([...new FormData(form)]).toEqual([['autosave', 'yes']]);
  await userEvent.click(autosave);
  expect([...new FormData(form)]).toEqual([]);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(trackOf(autosave)).toHaveAttribute('data-state', 'checked');
  await expect.element(autosave).toBeChecked();
  expect(changes).toEqual([false]);
});

test('Switch.Thumb: asChild, state functions, and use outside Switch', async () => {
  const screen = await render(
    <Switch aria-label="Theme" style={(state) => ({ opacity: state.checked ? 1 : 0.8 })}>
      <Switch.Thumb asChild className={(state) => (state.checked ? 'moon' : 'sun')}>
        <i data-glyph="" />
      </Switch.Thumb>
    </Switch>,
  );
  const theme = screen.getByRole('switch', { name: 'Theme' });
  const glyph = trackOf(theme).querySelector<HTMLElement>('[data-glyph]')!;
  expect(glyph.getAttribute('aria-hidden')).toBe('true');
  await expect.element(glyph).toHaveClass('sun');
  await expect.element(trackOf(theme)).toHaveStyle({ opacity: '0.8' });
  await userEvent.click(theme);
  await expect.element(glyph).toHaveClass('moon');
  await expect.element(glyph).toHaveAttribute('data-state', 'checked');
  await expect.element(trackOf(theme)).toHaveStyle({ opacity: '1' });
  expect(() => renderToString(<Switch.Thumb />)).toThrow(/inside Switch/);
});

test.each(['native', 'checked'] as const)(
  'react-hook-form: register() and controlMode="checked" both drive the thumb (controlMode: %s)',
  async (controlMode) => {
    let methods!: UseFormReturn<{ autoSave: boolean }>;
    function App() {
      methods = useForm<{ autoSave: boolean }>({ defaultValues: { autoSave: true } });
      return (
        <FormProvider {...methods}>
          <RHFField name="autoSave" controlMode={controlMode}>
            <RHFField.Label>Autosave</RHFField.Label>
            <Switch />
          </RHFField>
        </FormProvider>
      );
    }
    const screen = await render(<App />);
    const autosave = screen.getByRole('switch', { name: 'Autosave' });
    expect(thumbOf(autosave), 'the default shows at once').toHaveAttribute('data-state', 'checked');
    await userEvent.click(autosave);
    expect(methods.getValues('autoSave')).toBe(false);
    methods.setValue('autoSave', true);
    await expect.element(thumbOf(autosave)).toHaveAttribute('data-state', 'checked');
  },
);

test('react-hook-form register(): reset() after the user toggled shows on the thumb', async () => {
  let methods!: UseFormReturn<{ autoSave: boolean }>;
  function App() {
    methods = useForm<{ autoSave: boolean }>({ defaultValues: { autoSave: true } });
    return (
      <FormProvider {...methods}>
        <RHFField name="autoSave">
          <RHFField.Label>Autosave</RHFField.Label>
          <Switch />
        </RHFField>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const autosave = screen.getByRole('switch', { name: 'Autosave' });
  await userEvent.click(autosave);
  await methods.handleSubmit(() => {})();
  await userEvent.click(autosave);
  await expect.element(thumbOf(autosave)).toHaveAttribute('data-state', 'checked');
  methods.reset({ autoSave: false });
  await expect.element(autosave).not.toBeChecked();
  await expect.element(thumbOf(autosave)).toHaveAttribute('data-state', 'unchecked');
});
