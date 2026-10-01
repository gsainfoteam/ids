import { useLayoutEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { cdp, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { z } from 'zod';

import { Field, PasswordField } from '../src';
import { skipWithoutCdp } from './engines';
import { Field as FormField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const resetSettles = () => new Promise((resolve) => setTimeout(resolve));
const SHOW = '비밀번호 표시';

function node(input: Locator) {
  return input.element() as HTMLInputElement;
}

function shellOf(input: Locator) {
  return node(input).closest<HTMLElement>('[data-password-field]')!;
}

function layoutOf(shell: HTMLElement) {
  return Array.from(shell.children, (el) =>
    el instanceof HTMLElement && 'passwordFieldAdornment' in el.dataset
      ? el.textContent
      : el.getAttribute('role') === 'status'
        ? 'CAPS'
        : el.tagName,
  );
}

async function keyWasPrevented(keys: string, key: string) {
  let prevented: boolean | undefined;
  const record = (event: KeyboardEvent) => {
    if (event.key === key) prevented = event.defaultPrevented;
  };
  window.addEventListener('keydown', record);
  await userEvent.keyboard(keys);
  window.removeEventListener('keydown', record);
  return prevented;
}

test('SSR native password, inferred/explicit autocomplete, Field label/ARIA and successful FormData', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field required invalid size="tiny">
          <Field.Label>Password</Field.Label>
          <PasswordField name="account.newPassword" defaultValue="sample secret" />
          <Field.Error>Check password</Field.Error>
        </Field>
      </form>,
    ),
  );
  const input = doc.querySelector('input')!;
  expect(input.type).toBe('password');
  expect(input.getAttribute('autocomplete')).toBe('new-password');
  expect(doc.querySelector<HTMLElement>('[data-password-field]')!.dataset.size).toBe('tiny');
  expect(input.required).toBe(true);
  expect(doc.querySelector('label')!.htmlFor).toBe(input.id);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(doc.getElementById(input.getAttribute('aria-describedby')!)!.textContent).toBe(
    'Check password',
  );
  const toggle = doc.querySelector('button')!;
  expect(toggle.getAttribute('aria-pressed')).toBe('false');
  expect(toggle.getAttribute('aria-controls')).toBe(input.id);
  expect(toggle.type).toBe('button');
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([
    ['account.newPassword', 'sample secret'],
  ]);
  for (const [props, expected] of [
    [{ name: 'password' }, 'current-password'],
    [{ name: 'new-password' }, 'new-password'],
    [{ name: 'new-password', autoComplete: 'off' }, 'off'],
    [{ name: 'confirmation', autoComplete: 'new-password' }, 'new-password'],
  ] as const) {
    const markup = parse(renderToString(<PasswordField {...props} />));
    expect(markup.querySelector('input')!.getAttribute('autocomplete')).toBe(expected);
  }
});

test('pointer visibility preserves DOM/value/selection/focus without onChange or submit; keyboard keeps button focus', async () => {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  const screen = await render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <PasswordField
        aria-label="Password"
        name="password"
        defaultValue="abcDEF123"
        onChange={onChange}
      />
    </form>,
  );
  const input = screen.getByLabelText('Password');
  const toggle = screen.getByRole('button', { name: SHOW });
  const original = node(input);
  original.focus();
  original.setSelectionRange(2, 6, 'backward');
  await userEvent.click(toggle);
  expect(node(input)).toBe(original);
  await expect.element(input).toHaveAttribute('type', 'text');
  await expect.element(input).toHaveValue('abcDEF123');
  await expect.element(input).toHaveFocus();
  expect([original.selectionStart, original.selectionEnd, original.selectionDirection]).toEqual([
    2,
    6,
    'backward',
  ]);
  await expect
    .element(toggle, { message: 'a toggle keeps one name' })
    .toHaveAttribute('aria-label', SHOW);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
  await userEvent.keyboard('{Tab}');
  await expect.element(toggle).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect.element(input).toHaveAttribute('type', 'password');
  await expect.element(toggle).toHaveFocus();
  expect(onChange).not.toHaveBeenCalled();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('the toggle is a ghost IconToggle that only swaps its glyph when pressed', async () => {
  const screen = await render(<PasswordField aria-label="Password" name="password" />);
  const toggle = screen.getByRole('button', { name: SHOW });
  await expect.element(toggle).toHaveAttribute('data-variant', 'ghost');
  await expect.element(toggle).not.toHaveAttribute('data-pressed');
  await userEvent.click(toggle);
  await expect.element(toggle).toHaveAttribute('data-pressed');
  await expect.element(toggle).toHaveClass('data-pressed:bg-transparent');
  expect(
    Array.from(toggle.element().classList).some((name) => name.startsWith('data-pressed:bg-(')),
    'the pressed fill is dropped',
  ).toBe(false);
  await userEvent.unhover(toggle);
  await expect
    .poll(() => getComputedStyle(toggle.element()).backgroundColor)
    .toBe('rgba(0, 0, 0, 0)');
});

test('controlled input forwards native changes, external values, composition and readonly visibility', async (context) => {
  skipWithoutCdp(context);
  const events: string[] = [];
  const external = { set: (_value: string) => {} };
  function App() {
    const [value, setValue] = useState('');
    useLayoutEffect(() => {
      external.set = setValue;
    }, []);
    return (
      <PasswordField
        aria-label="Password"
        name="password"
        value={value}
        onChange={(event) => {
          events.push(event.target.value);
          setValue(event.target.value);
        }}
        onCompositionStart={() => events.push('start')}
        onCompositionEnd={() => events.push('end')}
      />
    );
  }
  const screen = await render(<App />);
  const input = screen.getByLabelText('Password');
  const toggle = screen.getByRole('button', { name: SHOW });
  await userEvent.fill(input, '日本語 abc');
  await userEvent.click(toggle);
  await expect.element(input).toHaveValue('日本語 abc');
  external.set('external');
  await expect.element(input).toHaveValue('external');
  node(input).focus();
  await cdp().send('Input.imeSetComposition', { text: 'か', selectionStart: 1, selectionEnd: 1 });
  await cdp().send('Input.insertText', { text: 'か' });
  await expect.element(input).toHaveValue('externalか');
  expect(events).toEqual(['日本語 abc', 'start', 'externalか', 'end']);

  await screen.rerender(
    <PasswordField aria-label="Password" name="password" readOnly defaultValue="read-only" />,
  );
  await expect.element(input).toHaveAttribute('readonly');
  await expect.element(toggle).toBeEnabled();
  await userEvent.click(toggle);
  await expect.element(input).toHaveAttribute('type', 'text');
});

test('disabled/invalid overrides and hidden auto toggle while explicit composition remains available', async () => {
  const screen = await render(
    <Field disabled invalid={false}>
      <Field.Label>Password</Field.Label>
      <PasswordField name="password" invalid defaultValue="secret" />
    </Field>,
  );
  const input = screen.getByLabelText('Password');
  const toggle = screen.getByRole('button', { name: SHOW });
  await expect.element(input).toBeDisabled();
  await expect.element(toggle).toBeDisabled();
  await expect.element(input).toHaveAttribute('aria-invalid', 'false');
  await userEvent.click(toggle, { force: true });
  await expect.element(input).toHaveAttribute('type', 'password');

  await screen.rerender(
    <PasswordField aria-label="Password" name="password" hideVisibilityToggle />,
  );
  await expect.element(toggle).not.toBeInTheDocument();
  await screen.rerender(
    <PasswordField aria-label="Password" name="password" hideVisibilityToggle>
      <>
        <PasswordField.Input />
        <PasswordField.VisibilityToggle />
      </>
    </PasswordField>,
  );
  expect(screen.getByRole('button').elements()).toHaveLength(1);
});

test('sentinel/asChild event/ref composition, explicit toggle and preventDefault override', async () => {
  const events: string[] = [];
  let seen: HTMLInputElement | null = null;
  let cleanups = 0;
  const screen = await render(
    <PasswordField
      aria-label="Password"
      name="password"
      ref={(element: HTMLInputElement | null) => {
        seen = element;
        return () => {
          cleanups++;
        };
      }}
      onFocus={() => events.push('root')}
    >
      <span>Lock</span>
      <PasswordField.Input asChild onFocus={() => events.push('sentinel')}>
        <input onFocus={() => events.push('child')} autoComplete="new-password" />
      </PasswordField.Input>
      <PasswordField.VisibilityToggle asChild>
        <button>Show</button>
      </PasswordField.VisibilityToggle>
    </PasswordField>,
  );
  const input = screen.getByLabelText('Password');
  expect(seen).toBe(input.element());
  await expect.element(input).toHaveAttribute('autocomplete', 'new-password');
  expect(screen.getByRole('button').elements()).toHaveLength(1);
  node(input).focus();
  expect(events).toEqual(['child', 'root', 'sentinel']);
  await userEvent.click(screen.getByRole('button', { name: 'Show' }));
  await expect.element(input).toHaveAttribute('type', 'text');
  await screen.unmount();
  expect(cleanups).toBeGreaterThan(0);

  const next = await render(
    <PasswordField aria-label="Password" name="password">
      <PasswordField.Input />
      <PasswordField.VisibilityToggle onClick={(event) => event.preventDefault()} />
    </PasswordField>,
  );
  await userEvent.click(next.getByRole('button', { name: SHOW }));
  await expect.element(next.getByLabelText('Password')).toHaveAttribute('type', 'password');
});

test('native reset restores uncontrolled value and masks it; canceled reset preserves both', async () => {
  const screen = await render(
    <form aria-label="Account">
      <PasswordField aria-label="Password" name="password" defaultValue="initial" />
      <button type="reset">Reset</button>
    </form>,
  );
  const input = screen.getByLabelText('Password');
  const reset = screen.getByRole('button', { name: 'Reset' });
  await userEvent.fill(input, 'edited');
  await userEvent.click(screen.getByRole('button', { name: SHOW }));
  screen
    .getByRole('form')
    .element()
    .addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await userEvent.click(reset);
  await resetSettles();
  await expect.element(input).toHaveValue('edited');
  await expect.element(input).toHaveAttribute('type', 'text');
  await userEvent.click(reset);
  await expect.element(input).toHaveValue('initial');
  await expect.element(input).toHaveAttribute('type', 'password');
});

test('RHF native + Zod matching: error focus, input retained on toggle, submit, reset and disabled omission', async () => {
  const schema = z
    .object({ password: z.string().min(8, 'Too short'), confirmation: z.string() })
    .refine((values) => values.password === values.confirmation, {
      path: ['confirmation'],
      message: 'Mismatch',
    });
  type Values = z.infer<typeof schema>;
  const handle: { methods?: UseFormReturn<Values> } = {};
  let result: Partial<Values> | undefined;
  function App({ disabled = false }: { disabled?: boolean }) {
    const methods = useForm<Values>({
      resolver: zodResolver(schema),
      defaultValues: { password: '', confirmation: '' },
    });
    useLayoutEffect(() => {
      handle.methods = methods;
    }, [methods]);
    return (
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={methods.handleSubmit((values) => {
            result = values;
          })}
        >
          {(['password', 'confirmation'] as const).map((name) => (
            <FormField key={name} name={name} disabled={disabled}>
              <FormField.Label>{name}</FormField.Label>
              <PasswordField autoComplete="new-password" />
              <FormField.Error />
            </FormField>
          ))}
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const password = screen.getByLabelText('password');
  const confirmation = screen.getByLabelText('confirmation');
  const passwordToggle = screen.getByRole('button', { name: SHOW }).first();
  const submit = screen.getByRole('button', { name: 'Submit' });
  const methods = () => handle.methods!;
  await userEvent.click(submit);
  await expect.element(password).toHaveFocus();
  await expect
    .poll(() => screen.container.querySelector('[data-field-part=error]')?.textContent)
    .toBe('Too short');
  await userEvent.fill(password, 'test-secret');
  await userEvent.click(passwordToggle);
  await expect.element(password).toHaveAttribute('type', 'text');
  expect(methods().getValues('password')).toBe('test-secret');
  methods().setValue('confirmation', 'different');
  await userEvent.click(submit);
  await expect.element(confirmation).toHaveFocus();
  expect(result).toBeUndefined();
  methods().setValue('confirmation', 'test-secret');
  await userEvent.click(submit);
  await expect.poll(() => result).toEqual({ password: 'test-secret', confirmation: 'test-secret' });
  methods().reset();
  await expect.element(password).toHaveValue('');
  await expect.element(confirmation).toHaveValue('');
  methods().reset({ password: 'test-secret', confirmation: 'test-secret' });
  await screen.rerender(<App disabled />);
  await expect.element(password).toBeDisabled();
  await expect.element(passwordToggle).toBeDisabled();
  await userEvent.click(submit);
  await expect.poll(() => result?.password).toBeUndefined();
});

test('Input values win over root values, but root and Input handlers both run', async () => {
  const changes: string[] = [];
  const screen = await render(
    <PasswordField
      aria-label="Password"
      id="root-id"
      name="root"
      onChange={() => changes.push('root')}
    >
      <PasswordField.Input name="new-password" onChange={() => changes.push('input')} />
    </PasswordField>,
  );
  const input = screen.getByLabelText('Password');
  await expect.element(input).toHaveAttribute('id', 'root-id');
  await expect.element(input).toHaveAttribute('name', 'new-password');
  await expect.element(input).toHaveAttribute('autocomplete', 'new-password');
  await expect
    .element(screen.getByRole('button', { name: SHOW }))
    .toHaveAttribute('aria-controls', 'root-id');
  await userEvent.fill(input, 'a');
  expect(changes).toEqual(['root', 'input']);
});

test('children without an Input become leading adornments before an inserted Input', async () => {
  const screen = await render(
    <PasswordField aria-label="Password" name="password">
      <span>Lock</span>
    </PasswordField>,
  );
  const input = screen.getByLabelText('Password');
  expect(layoutOf(shellOf(input))).toEqual(['Lock', 'INPUT', 'CAPS', 'BUTTON']);
  await expect.element(input).toHaveAttribute('type', 'password');
});

test('sentinel inside a Fragment splits leading and trailing; the toggle stays unwrapped', async () => {
  const screen = await render(
    <PasswordField aria-label="Password" name="password">
      <>
        <span>Lead</span>
        <PasswordField.Input />
        <PasswordField.VisibilityToggle />
        <span>Trail</span>
      </>
    </PasswordField>,
  );
  const input = screen.getByLabelText('Password');
  expect(layoutOf(shellOf(input))).toEqual(['Lead', 'INPUT', 'BUTTON', 'Trail', 'CAPS']);
  await userEvent.click(screen.getByRole('button', { name: SHOW }));
  await expect.element(input).toHaveAttribute('type', 'text');
});

test('asChild merges root and Input props and ref into the child input, keeping the internal type', async () => {
  let seen: HTMLInputElement | null = null;
  const changes: string[] = [];
  const screen = await render(
    <PasswordField
      aria-label="Password"
      name="password"
      onChange={() => changes.push('root')}
      ref={(element: HTMLInputElement | null) => {
        seen = element;
      }}
    >
      <PasswordField.Input asChild placeholder="input">
        <input type="email" placeholder="child" onChange={() => changes.push('child')} />
      </PasswordField.Input>
    </PasswordField>,
  );
  const input = screen.getByLabelText('Password');
  expect(seen).toBe(input.element());
  await expect.element(input).toHaveAttribute('name', 'password');
  await expect.element(input).toHaveAttribute('placeholder', 'input');
  await expect.element(input).toHaveAttribute('type', 'password');
  await expect.element(input).toHaveAttribute('data-password-field-input');
  await userEvent.fill(input, 'a');
  expect(changes).toEqual(['child', 'root']);
});

test('invalid structures fail clearly', () => {
  for (const invalid of [
    <PasswordField name="password">
      <PasswordField.Input />
      <PasswordField.Input />
    </PasswordField>,
    <PasswordField name="password">
      <PasswordField.Input />
      <PasswordField.VisibilityToggle />
      <PasswordField.VisibilityToggle />
    </PasswordField>,
    <PasswordField name="password">
      <PasswordField.Input asChild>
        <textarea />
      </PasswordField.Input>
    </PasswordField>,
    <PasswordField name="password">
      <PasswordField.Input>text</PasswordField.Input>
    </PasswordField>,
  ])
    expect(() => renderToString(invalid)).toThrow(/\[IDS\] `<PasswordField/);
  expect(() => renderToString(<PasswordField.Input />)).toThrow(
    /\[IDS\] `<PasswordField.Input>` must be used inside `<PasswordField>`/,
  );
});

test('the Caps Lock indicator follows the modifier state while the input has focus', async () => {
  let capsLockOn = false;
  const modifierState = vi
    .spyOn(KeyboardEvent.prototype, 'getModifierState')
    .mockImplementation((key) => key === 'CapsLock' && capsLockOn);
  try {
    const screen = await render(<PasswordField aria-label="Password" name="password" />);
    const input = screen.getByLabelText('Password');
    const indicator = screen.getByTitle('Caps Lock이 켜져 있습니다.');
    const status = screen.getByRole('status');
    await expect.element(indicator).not.toBeInTheDocument();
    await expect
      .element(status, { message: 'the live region is mounted before it has anything to say' })
      .toBeEmptyDOMElement();
    node(input).focus();
    capsLockOn = true;
    await userEvent.keyboard('a');
    await expect.element(indicator).toBeInTheDocument();
    await expect.element(indicator).toHaveAttribute('aria-hidden', 'true');
    await expect.element(status).toHaveTextContent('Caps Lock이 켜져 있습니다.');
    capsLockOn = false;
    await userEvent.keyboard('{CapsLock}');
    await expect.element(indicator).not.toBeInTheDocument();
    await expect.element(status).toBeEmptyDOMElement();
    capsLockOn = true;
    await userEvent.keyboard('a');
    await expect.element(indicator).toBeInTheDocument();
    node(input).blur();
    await expect
      .element(indicator, { message: 'leaving the field hides it' })
      .not.toBeInTheDocument();

    await screen.rerender(
      <PasswordField key="hidden" aria-label="Password" name="password" hideCapsLock />,
    );
    await expect.element(status).not.toBeInTheDocument();
    await screen.rerender(
      <PasswordField key="explicit" aria-label="Password" name="password">
        <PasswordField.CapsLock label="Caps on" />
        <PasswordField.Input />
      </PasswordField>,
    );
    node(input).focus();
    await userEvent.keyboard('a');
    const explicit = screen.getByTitle('Caps on');
    await expect.element(explicit).toBeInTheDocument();
    expect(shellOf(input).children[0], 'an explicit part keeps its place').toBe(explicit.element());
  } finally {
    modifierState.mockRestore();
  }
});

test('visibility can be controlled, and a submit masks the password again', async () => {
  const changes: boolean[] = [];
  function Controlled() {
    const [visible, setVisible] = useState(true);
    return (
      <PasswordField
        aria-label="Password"
        name="password"
        visible={visible}
        onVisibleChange={(next) => {
          changes.push(next);
          setVisible(next);
        }}
      />
    );
  }
  const screen = await render(<Controlled />);
  const input = screen.getByLabelText('Password');
  await expect.element(input).toHaveAttribute('type', 'text');
  expect(shellOf(input).hasAttribute('data-visible')).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: SHOW }));
  expect(changes).toEqual([false]);
  await expect.element(input).toHaveAttribute('type', 'password');

  let submittedType: string | undefined;
  await screen.rerender(
    <form
      key="form"
      onSubmit={(event) => {
        event.preventDefault();
        submittedType = (event.currentTarget.elements.namedItem('password') as HTMLInputElement)
          .type;
      }}
    >
      <PasswordField aria-label="Password" name="password" defaultVisible />
    </form>,
  );
  await expect.element(input).toHaveAttribute('type', 'text');
  node(input).focus();
  await userEvent.keyboard('{Enter}');
  expect(submittedType, 'the input is a password field when the form is sent').toBe('password');
  await expect.element(input).toHaveAttribute('type', 'password');
});

test('onValueChange, the shell state and a Clear part with Escape', async () => {
  const values: string[] = [];
  const screen = await render(
    <PasswordField
      aria-label="Password"
      name="password"
      invalid
      onValueChange={(value) => values.push(value)}
    >
      <PasswordField.Input />
      <PasswordField.Clear />
    </PasswordField>,
  );
  const input = screen.getByLabelText('Password');
  expect(shellOf(input).hasAttribute('data-invalid')).toBe(true);
  await expect.element(input).toHaveAttribute('data-field-input');
  await userEvent.fill(input, 'secret');
  await expect.element(shellOf(input)).toHaveAttribute('data-filled');
  expect(await keyWasPrevented('{Escape}', 'Escape')).toBe(true);
  await expect.element(input).toHaveValue('');
  expect(values).toEqual(['secret', '']);
});

test('typing hints default off, and the toggle icon can follow the state', async () => {
  const screen = await render(
    <PasswordField aria-label="Password" name="password">
      <PasswordField.Input />
      <PasswordField.VisibilityToggle>
        {(state) => <svg data-icon={state.visible ? 'open' : 'closed'} />}
      </PasswordField.VisibilityToggle>
    </PasswordField>,
  );
  const input = screen.getByLabelText('Password');
  await expect.element(input).toHaveAttribute('spellcheck', 'false');
  await expect.element(input).toHaveAttribute('autocapitalize', 'none');
  await expect.element(input).toHaveAttribute('autocorrect', 'off');
  const icon = () => screen.container.querySelector<SVGElement>('[data-icon]')!;
  expect(icon().dataset.icon).toBe('closed');
  await userEvent.click(screen.getByRole('button', { name: SHOW }));
  expect(icon().dataset.icon).toBe('open');
});
