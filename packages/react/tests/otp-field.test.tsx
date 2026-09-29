import { createRef, useImperativeHandle, useState, type ReactNode, type Ref } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { z } from 'zod';

import { Field, OTPField } from '../src';
import { skipWithoutCdp } from './engines';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const field = () => page.getByRole('textbox', { name: 'Code' });
const input = () => field().element() as HTMLInputElement;
const selection = () => [input().selectionStart, input().selectionEnd];
const slots = () => [...document.querySelectorAll<HTMLElement>('[data-otp-slot]')];
const shown = () =>
  slots()
    .map((slot) => slot.textContent)
    .join('');
const active = () => slots().map((slot) => slot.hasAttribute('data-active'));

function tracked(props: Partial<OTPField.Props> = {}) {
  const changes: string[] = [];
  const completions: string[] = [];
  const node = (
    <OTPField
      length={6}
      aria-label="Code"
      {...props}
      onValueChange={(next) => changes.push(next)}
      onComplete={(next) => completions.push(next)}
    />
  );
  return { changes, completions, node };
}

async function copyToClipboard(text: string) {
  const scratch = page.getByRole('textbox', { name: 'Clipboard' });
  await userEvent.fill(scratch, text);
  await userEvent.keyboard('{ControlOrMeta>}a{/ControlOrMeta}');
  await userEvent.copy();
}

const pressSlot = (index: number) => userEvent.click(slots()[index]!, { force: true });

function autofillPastMaxLength(value: string, inserted: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input(), value);
  input().dispatchEvent(
    new InputEvent('input', { bubbles: true, data: inserted, inputType: 'insertText' }),
  );
}

test('SSR: one real input carries the name, label, description, validation and autofill hints', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field required invalid size="tiny">
          <Field.Label>Verification</Field.Label>
          <Field.Description>Enter six digits</Field.Description>
          <OTPField length={6} name="code" defaultValue="123456" />
          <Field.Error>Expired</Field.Error>
        </Field>
      </form>,
    ),
  );
  const inputs = doc.querySelectorAll('input');
  expect(inputs).toHaveLength(1);
  const [code] = inputs;
  expect(doc.querySelector('label')!.htmlFor).toBe(code!.id);
  expect(code!.getAttribute('autocomplete')).toBe('one-time-code');
  expect(code!.inputMode).toBe('numeric');
  expect(code!.maxLength).toBe(6);
  expect(code!.getAttribute('pattern')).toBe('.{6}');
  expect(code!.required).toBe(true);
  expect(code!.getAttribute('aria-invalid')).toBe('true');
  expect(code!.hasAttribute('aria-label')).toBe(false);
  const description = code!
    .getAttribute('aria-describedby')!
    .split(' ')
    .map((id) => doc.getElementById(id)!.textContent)
    .join(' ');
  expect(description).toBe('Enter six digits Expired');
  const visual = [...doc.querySelectorAll('[data-otp-slot]')];
  expect(visual).toHaveLength(6);
  expect(visual.every((slot) => slot.getAttribute('aria-hidden') === 'true')).toBe(true);
  expect(doc.querySelector<HTMLElement>('[data-otp-field]')!.dataset.size).toBe('tiny');
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([['code', '123456']]);
});

test('an unlabelled field gets a default accessible name; the HTML pattern only checks length', () => {
  const html = (props: Partial<OTPField.Props>) =>
    parse(renderToString(<OTPField length={4} {...props} />)).querySelector('input')!;
  expect(html({}).getAttribute('aria-label')).toBe('인증 코드');
  expect(html({ id: 'x' }).hasAttribute('aria-label')).toBe(false);
  expect(html({ pattern: 'alphanumeric' }).inputMode).toBe('text');
  expect(html({ pattern: /[a-c]/i }).getAttribute('pattern')).toBe('.{4}');
});

test('typed input is cleaned, complete fires once per transition to full', async () => {
  const state = tracked();
  await render(state.node);
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('12a3');
  await expect.element(field()).toHaveValue('123');
  expect(shown()).toBe('123');
  await userEvent.keyboard('456');
  expect(state.completions).toEqual(['123456']);
  await userEvent.keyboard('7');
  await expect.element(field()).toHaveValue('123457');
  expect(state.completions).toEqual(['123456']);
  await userEvent.keyboard('{Backspace}');
  await expect.element(field()).toHaveValue('12345');
  await userEvent.keyboard('8');
  expect(state.completions).toEqual(['123456', '123458']);
  expect(state.changes).toEqual([
    '1',
    '12',
    '123',
    '1234',
    '12345',
    '123456',
    '123457',
    '12345',
    '123458',
  ]);
});

test('full-width digits are folded, and an autofilled full code wins over what was typed', async () => {
  await render(tracked().node);
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('１２');
  await expect.element(field()).toHaveValue('12');
  autofillPastMaxLength('12987654', '987654');
  await expect.element(field()).toHaveValue('987654');
});

test('beforeinput rejects a disallowed character before it reaches the DOM', async () => {
  const screen = await render(tracked().node);
  const beforeInputs: Array<[string | null, boolean]> = [];
  screen.container.addEventListener('beforeinput', (event) =>
    beforeInputs.push([(event as InputEvent).data, event.defaultPrevented]),
  );
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('x');
  await expect.element(field()).toHaveValue('');
  await userEvent.keyboard('7');
  await expect.element(field()).toHaveValue('7');
  expect(beforeInputs).toEqual([
    ['x', true],
    ['7', false],
  ]);
});

test('paste: a full code replaces from anywhere, a partial one overwrites from the selection', async () => {
  const withClipboard = (node: ReactNode) => (
    <>
      <input aria-label="Clipboard" />
      {node}
    </>
  );
  const screen = await render(withClipboard(tracked({ defaultValue: '1234' }).node));
  const pastes: boolean[] = [];
  screen.container.addEventListener('paste', (event) => pastes.push(event.defaultPrevented));
  await copyToClipboard('98-76-54');
  await pressSlot(1);
  await expect.poll(selection).toEqual([1, 2]);
  await userEvent.paste();
  expect(pastes).toEqual([true]);
  await expect.element(field()).toHaveValue('987654');
  await copyToClipboard('11');
  await pressSlot(2);
  await expect.poll(selection).toEqual([2, 3]);
  await userEvent.paste();
  await expect.element(field()).toHaveValue('981154');
  await copyToClipboard('--');
  await userEvent.keyboard('{Tab}');
  await expect.element(field()).toHaveFocus();
  await userEvent.paste();
  await expect.element(field()).toHaveValue('981154');
  await screen.rerender(
    withClipboard(<div key="readonly">{tracked({ defaultValue: '12', readOnly: true }).node}</div>),
  );
  await copyToClipboard('999999');
  await pressSlot(0);
  await expect.element(field()).toHaveFocus();
  await userEvent.paste();
  await expect.element(field()).toHaveValue('12');
});

test('a collapsed caret over a character selects it, and that slot shows as active', async () => {
  await render(
    <>
      {tracked({ defaultValue: '1234' }).node}
      <button type="button">After</button>
    </>,
  );
  await userEvent.keyboard('{Tab}');
  await expect.element(field()).toHaveFocus();
  await expect.poll(selection, { message: 'focus goes to the next empty slot' }).toEqual([4, 4]);
  await expect.poll(active).toEqual([false, false, false, false, true, false]);
  expect(
    slots()[4]!.querySelector('[class*=caret]'),
    'an empty active slot draws the caret',
  ).not.toBeNull();
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
  await expect.poll(selection).toEqual([1, 2]);
  await expect.poll(active).toEqual([false, true, false, false, false, false]);
  await userEvent.keyboard('{ControlOrMeta>}a{/ControlOrMeta}');
  await expect
    .poll(active, { message: 'a range selection highlights every selected slot' })
    .toEqual([true, true, true, true, false, false]);
  await userEvent.keyboard('{Tab}');
  await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus();
  await expect.poll(active).toEqual([false, false, false, false, false, false]);
});

test('focusing a full code selects the last character so typing replaces it', async () => {
  await render(tracked({ defaultValue: '123456' }).node);
  await userEvent.keyboard('{Tab}');
  await expect.poll(selection).toEqual([5, 6]);
  await userEvent.keyboard('7');
  await expect.element(field()).toHaveValue('123457');
});

function Controlled({ onValueChange }: { onValueChange: (value: string) => void }) {
  const [value, setValue] = useState('12');
  return (
    <>
      <OTPField
        length={6}
        value={value}
        aria-label="Code"
        onValueChange={(next) => {
          onValueChange(next);
          setValue(next);
        }}
      />
      <button type="button" onClick={() => setValue('3x4')}>
        Outside
      </button>
    </>
  );
}

test('controlled: the parent value is the source of truth', async () => {
  const changes: string[] = [];
  await render(<Controlled onValueChange={(next) => changes.push(next)} />);
  await expect.element(field()).toHaveValue('12');
  await userEvent.click(page.getByRole('button', { name: 'Outside' }));
  await expect.element(field(), { message: 'a controlled value is cleaned too' }).toHaveValue('34');
  expect(changes, 'a parent update is not echoed back as a change').toEqual([]);
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await userEvent.keyboard('5');
  expect(changes).toEqual(['345']);
});

test('a direct write to input.value (react-hook-form reset/setValue) reaches state', async () => {
  const state = tracked({ defaultValue: '123' });
  await render(state.node);
  input().value = '9x87';
  await expect.element(field()).toHaveValue('987');
  expect(shown()).toBe('987');
  expect(state.changes).toEqual(['987']);
});

test('composition shows the draft and commits the cleaned value when it ends', async (context) => {
  skipWithoutCdp(context);
  const state = tracked({ pattern: 'alphanumeric' });
  await render(state.node);
  await userEvent.keyboard('{Tab}');
  const ime = cdp();
  await ime.send('Input.imeSetComposition', { text: 'abㄱ', selectionStart: 3, selectionEnd: 3 });
  await expect.element(field()).toHaveValue('abㄱ');
  expect(shown()).toBe('abㄱ');
  expect(state.changes).toEqual([]);
  await ime.send('Input.insertText', { text: 'abㄱ' });
  await expect.element(field()).toHaveValue('ab');
  expect(state.changes).toEqual(['ab']);
});

test('native form reset restores the default, FormData holds one entry', async () => {
  const screen = await render(
    <form>
      <OTPField length={4} name="pin" defaultValue="12" aria-label="PIN" />
      <button type="reset">Reset</button>
    </form>,
  );
  const pin = page.getByRole('textbox', { name: 'PIN' });
  const form = screen.container.querySelector('form')!;
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('34');
  await expect.element(pin).toHaveValue('1234');
  expect([...new FormData(form)]).toEqual([['pin', '1234']]);
  await userEvent.click(page.getByRole('button', { name: 'Reset' }));
  await expect.element(pin).toHaveValue('12');
  expect([...new FormData(form)]).toEqual([['pin', '12']]);
});

test('mask and placeholder only change what the slots draw', async () => {
  const screen = await render(
    tracked({ length: 4, defaultValue: '12', mask: true, placeholder: 'abcd' }).node,
  );
  await expect.element(field()).toHaveValue('12');
  expect(shown(), 'the default mask is a drawn dot, not a character').toBe('cd');
  expect(screen.container.querySelectorAll('[data-otp-slot] span.rounded-full')).toHaveLength(2);
  await screen.rerender(
    <div key="star">{tracked({ length: 4, defaultValue: '12', mask: '*' }).node}</div>,
  );
  expect(shown()).toBe('**');
});

test('custom layout: groups, separators and slot render functions', async () => {
  const screen = await render(
    <OTPField length={4} defaultValue="1" aria-label="Code">
      <OTPField.Group>
        <OTPField.Slot index={0} />
        <OTPField.Slot index={1} />
      </OTPField.Group>
      <OTPField.Separator />
      <OTPField.Slot index={2} className={(s) => (s.isFilled ? 'filled' : 'empty')} />
      <OTPField.Slot index={3}>{(s) => `#${s.index}`}</OTPField.Slot>
    </OTPField>,
  );
  expect(screen.container.querySelectorAll('input')).toHaveLength(1);
  expect(slots()[0]!.hasAttribute('data-grouped')).toBe(true);
  expect(slots()[2]!.hasAttribute('data-grouped')).toBe(false);
  expect(slots()[2]!.className).toContain('empty');
  expect(slots()[3]!.textContent).toBe('#3');
  expect(screen.container.querySelector('[aria-hidden=true] svg')).not.toBeNull();
});

const codeSchema = z.object({ code: z.string().length(6, 'Enter six digits') });
type CodeValues = z.infer<typeof codeSchema>;

function RegisteredCode({
  form,
  onSubmit,
}: {
  form: Ref<UseFormReturn<CodeValues>>;
  onSubmit: (values: CodeValues) => void;
}) {
  const methods = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });
  useImperativeHandle(form, () => methods, [methods]);
  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(onSubmit)}>
        <RHFField name="code">
          <RHFField.Label>Code</RHFField.Label>
          <OTPField length={6} />
          <RHFField.Error />
        </RHFField>
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

test('react-hook-form register(): submit, error, and reset through the DOM value', async () => {
  const form = createRef<UseFormReturn<CodeValues>>();
  const submitted: CodeValues[] = [];
  const screen = await render(
    <RegisteredCode form={form} onSubmit={(values) => submitted.push(values)} />,
  );
  const error = () => screen.container.querySelector('[data-field-part=error]')?.textContent;
  const submit = page.getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  await expect.poll(error).toBe('Enter six digits');
  await userEvent.click(field());
  await userEvent.keyboard('12-3456');
  await expect.element(field()).toHaveValue('123456');
  expect(form.current!.getValues('code')).toBe('123456');
  await userEvent.click(submit);
  await expect.poll(() => submitted).toEqual([{ code: '123456' }]);
  form.current!.reset({ code: '654321' });
  await expect.element(field()).toHaveValue('654321');
  await expect.poll(shown).toBe('654321');
});

test('length is validated', () => {
  expect(() => renderToString(<OTPField length={0} />)).toThrow(/length/);
  expect(() => renderToString(<OTPField length={13} />)).toThrow(/length/);
  expect(() =>
    renderToString(
      <OTPField length={2}>
        <OTPField.Slot index={2} />
      </OTPField>,
    ),
  ).toThrow(/outside the code length/);
});

function ValueModeCode({ form }: { form: Ref<UseFormReturn<{ code: string }>> }) {
  const methods = useForm({ defaultValues: { code: '12' } });
  useImperativeHandle(form, () => methods, [methods]);
  return (
    <FormProvider {...methods}>
      <form>
        <RHFField name="code" controlMode="value">
          <RHFField.Label>Code</RHFField.Label>
          <OTPField length={6} />
        </RHFField>
      </form>
    </FormProvider>
  );
}

test('react-hook-form controlMode="value": the native change event carries the cleaned code', async () => {
  const form = createRef<UseFormReturn<{ code: string }>>();
  await render(<ValueModeCode form={form} />);
  await expect.element(field()).toHaveValue('12');
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('a3');
  await expect.element(field()).toHaveValue('123');
  expect(form.current!.getValues('code')).toBe('123');
  form.current!.setValue('code', '999999');
  await expect.poll(shown).toBe('999999');
});
