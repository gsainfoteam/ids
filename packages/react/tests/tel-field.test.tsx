import { useLayoutEffect, useState, type ReactElement } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { cdp, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, TelField } from '../src';
import { Field as FormField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const COUNTRY = '국가';

function node(input: Locator) {
  return input.element() as HTMLInputElement;
}

function shellOf(input: Locator) {
  return node(input).closest<HTMLElement>('[data-tel-field]')!;
}

function layoutOf(shell: HTMLElement) {
  return Array.from(shell.children, (el) =>
    el instanceof HTMLElement && 'telFieldAdornment' in el.dataset ? el.textContent : el.tagName,
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

async function copy(text: string) {
  const scratch = document.createElement('input');
  document.body.append(scratch);
  scratch.value = text;
  scratch.focus();
  scratch.select();
  await userEvent.copy();
  scratch.remove();
}

async function pasteWasPrevented(target: Locator, text: string) {
  await copy(text);
  node(target).focus();
  let prevented: boolean | undefined;
  const record = (event: ClipboardEvent) => {
    prevented = event.defaultPrevented;
  };
  window.addEventListener('paste', record);
  await userEvent.paste();
  window.removeEventListener('paste', record);
  return prevented;
}

test('SSR native input, Field label/ARIA and canonical FormData', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field invalid required>
          <Field.Label>Phone</Field.Label>
          <TelField
            name="phone"
            defaultCountry="KR"
            format="international"
            defaultValue="01012345678"
          />
        </Field>
      </form>,
    ),
  );
  const input = doc.querySelector<HTMLInputElement>('[type=tel]')!;
  expect(input.id).toBe(doc.querySelector('label')!.htmlFor);
  expect(input.autocomplete).toBe('tel');
  expect(input.inputMode).toBe('tel');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([['phone', '+821012345678']]);
});

test('invalid structures fail clearly', () => {
  const cases: Array<[ReactElement, RegExp]> = [
    [
      <TelField>
        <TelField.Input />
        <TelField.Input />
      </TelField>,
      /at most one `<TelField.Input/,
    ],
    [
      <TelField>
        <TelField.CountrySelect />
        <TelField.CountrySelect />
      </TelField>,
      /at most one `<TelField.CountrySelect/,
    ],
    [<TelField.Input />, /must be used inside `<TelField>`/],
    [
      <TelField>
        <TelField.Input asChild>
          <textarea />
        </TelField.Input>
      </TelField>,
      /asChild>` requires/,
    ],
    [
      <TelField>
        <TelField.Input>text</TelField.Input>
      </TelField>,
      /takes no children/,
    ],
  ];
  for (const [invalid, message] of cases) expect(() => renderToString(invalid)).toThrow(message);
});

test('Input values win over root values, but root and Input handlers both run', async () => {
  const events: string[] = [];
  let last: string | undefined;
  const screen = await render(
    <TelField
      id="root-id"
      placeholder="root"
      onBlur={() => events.push('root')}
      onValueChange={(value) => {
        last = value;
      }}
    >
      <TelField.Input
        placeholder="input"
        onBlur={() => events.push('input')}
        onChange={() => events.push('input-change')}
      />
    </TelField>,
  );
  const input = screen.getByRole('textbox');
  await expect.element(input).toHaveAttribute('id', 'root-id');
  await expect.element(input).toHaveAttribute('placeholder', 'input');
  await expect.element(input).toHaveAttribute('data-tel-field-input');
  await userEvent.fill(input, '01012345678');
  expect(events).toEqual(['input-change']);
  await expect.element(input).toHaveValue('010-1234-5678');
  expect(last, 'the value is E.164 whatever the display').toBe('+821012345678');
  node(input).blur();
  expect(events).toEqual(['input-change', 'root', 'input']);
});

test('children without an Input become leading adornments before an auto-inserted Input', async () => {
  const screen = await render(
    <TelField aria-label="Phone">
      <TelField.CountrySelect />
      <span>Tel</span>
    </TelField>,
  );
  const input = screen.getByRole('textbox', { name: 'Phone' });
  const shell = shellOf(input);
  expect(layoutOf(shell)).toEqual(['DIV', 'Tel', 'INPUT']);
  expect(shell.firstElementChild!.matches('[data-select]')).toBe(true);
  const trigger = screen.getByRole('combobox', { name: COUNTRY }).element();
  expect(trigger.querySelector('[data-select-value]')!.textContent).toBe('KR +82');
  expect(trigger.lastElementChild!.getAttribute('aria-hidden'), 'the Select.Icon').toBe('true');
  await expect.element(input).toHaveAttribute('aria-label', 'Phone');
  await userEvent.fill(input, '01012345678');
  await expect.element(input).toHaveValue('010-1234-5678');
});

test('sentinel inside a Fragment splits leading and trailing adornments', async () => {
  const screen = await render(
    <TelField>
      <>
        <span>Lead</span>
        <TelField.Input />
        <span>Trail</span>
      </>
    </TelField>,
  );
  expect(layoutOf(shellOf(screen.getByRole('textbox')))).toEqual(['Lead', 'INPUT', 'Trail']);
});

test('asChild merges props and ref into the child input and keeps formatting', async () => {
  let seen: HTMLInputElement | null = null;
  const changes: string[] = [];
  const screen = await render(
    <TelField
      name="tel"
      onBlur={() => changes.push('root')}
      ref={(element: HTMLInputElement | null) => {
        seen = element;
      }}
    >
      <TelField.Input asChild>
        <input
          spellCheck={false}
          onChange={() => changes.push('child')}
          onBlur={() => changes.push('child-blur')}
        />
      </TelField.Input>
    </TelField>,
  );
  const input = screen.getByRole('textbox');
  expect(seen).toBe(input.element());
  await expect.element(input).toHaveAttribute('spellcheck', 'false');
  await expect.element(input).toHaveAttribute('data-tel-field-input');
  await userEvent.fill(input, '01012345678');
  await expect.element(input).toHaveValue('010-1234-5678');
  node(input).blur();
  expect(changes).toEqual(['child', 'child-blur', 'root']);
});

test('progressive formatting, separator deletion, caret, raw mode and IME', async () => {
  const changes: string[] = [];
  const report = (value: string) => {
    changes.push(value);
  };
  const screen = await render(<TelField onValueChange={report} />);
  const input = screen.getByRole('textbox');
  await userEvent.fill(input, '01012345678');
  await expect.element(input).toHaveValue('010-1234-5678');
  expect(changes.at(-1)).toBe('+821012345678');
  node(input).setSelectionRange(4, 4);
  await userEvent.keyboard('{Backspace}');
  expect(node(input).value).not.toBe('010-1234-5678');
  expect(node(input).selectionStart).toBeLessThan(node(input).value.length);

  await screen.rerender(<TelField format="none" onValueChange={report} />);
  await userEvent.fill(input, 'call me 123');
  await expect.element(input).toHaveValue('call me 123');
  await userEvent.fill(input, 'call m 123');
  await expect.element(input).toHaveValue('call m 123');

  await screen.rerender(<TelField onValueChange={report} />);
  node(input).focus();
  node(input).select();
  const before = changes.length;
  await cdp().send('Input.imeSetComposition', {
    text: '０１０１２３４５６７８',
    selectionStart: 11,
    selectionEnd: 11,
  });
  await expect.element(input).toHaveValue('０１０１２３４５６７８');
  expect(changes).toHaveLength(before);
  await cdp().send('Input.insertText', { text: '０１０１２３４５６７８' });
  await expect.poll(() => changes.at(-1)).toBe('+821012345678');
});

test('CountrySelect emits international values, searches country, disables and resets', async () => {
  let last: string | undefined;
  const view = (disabled = false) => (
    <form aria-label="Contact">
      <TelField
        name="tel"
        defaultCountry="KR"
        disabled={disabled}
        onValueChange={(value) => {
          last = value;
        }}
      >
        <TelField.CountrySelect />
        <TelField.Input />
      </TelField>
      <button type="reset">Reset</button>
    </form>
  );
  const screen = await render(view());
  const input = screen.getByRole('textbox');
  const country = screen.getByRole('combobox', { name: COUNTRY });
  await userEvent.fill(input, '01012345678');
  expect(last).toBe('+821012345678');
  await userEvent.click(country);
  const search = screen.getByRole('combobox', { name: '옵션 검색' });
  await userEvent.fill(search, 'US');
  await expect.element(search).toHaveValue('US');
  await userEvent.click(screen.getByRole('option').first());
  expect(last).toBe('+11012345678');
  await expect.element(country).toHaveTextContent('US +1');
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(input).toHaveValue('');
  await expect.element(country).toHaveTextContent('KR +82');
  await screen.rerender(view(true));
  await expect.element(input).toBeDisabled();
  await expect.element(country).toBeDisabled();
});

test('the country search draws its own focus ring, not the phone field around it', async () => {
  const screen = await render(
    <TelField defaultCountry="KR">
      <TelField.CountrySelect />
      <TelField.Input />
    </TelField>,
  );
  const shell = screen.container.querySelector<HTMLElement>('[data-tel-field]')!;
  const ringed = () => getComputedStyle(shell).boxShadow.includes('3px');
  await userEvent.click(screen.getByRole('textbox'));
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.poll(ringed, { message: 'the country trigger is part of the field' }).toBe(true);
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('combobox', { name: '옵션 검색' })).toHaveFocus();
  await expect.poll(ringed).toBe(false);
});

test('RHF controlled value, validation/focus, setValue/reset and disabled omission', async () => {
  type Values = { phone: string };
  const handle: { methods?: UseFormReturn<Values> } = {};
  let result: Partial<Values> | undefined;
  function App({ disabled = false }: { disabled?: boolean }) {
    const methods = useForm<Values>({ defaultValues: { phone: '' } });
    useLayoutEffect(() => {
      handle.methods = methods;
    }, [methods]);
    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit((values) => {
            result = values;
          })}
        >
          <FormField
            name="phone"
            controlMode="value"
            registerOptions={{ required: 'Required' }}
            disabled={disabled}
          >
            <FormField.Label>Phone</FormField.Label>
            <TelField format="international" />
            <FormField.Error />
          </FormField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const input = screen.getByRole('textbox', { name: 'Phone' });
  const submit = screen.getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  await expect.element(input).toHaveFocus();
  await userEvent.fill(input, '01012345678');
  await userEvent.click(submit);
  await expect.poll(() => result?.phone).toBe('+821012345678');
  handle.methods!.setValue('phone', '+12025550123');
  await expect.element(input).toHaveValue('+1 202 555 0123');
  handle.methods!.reset();
  await expect.element(input).toHaveValue('');
  await screen.rerender(<App disabled />);
  await userEvent.click(submit);
  await expect.poll(() => result?.phone).toBeUndefined();
});

test('the value is E.164 in and out; national values are read in the country', async () => {
  const changes: string[] = [];
  function App() {
    const [value, setValue] = useState('010-1234-5678');
    return (
      <form aria-label="Contact">
        <TelField
          name="phone"
          value={value}
          onValueChange={(next) => {
            changes.push(next);
            setValue(next);
          }}
        />
      </form>
    );
  }
  const screen = await render(<App />);
  const input = screen.getByRole('textbox');
  await expect.element(input).toHaveValue('010-1234-5678');
  await expect.element(screen.getByRole('form')).toHaveFormValues({ phone: '+821012345678' });
  expect(changes, 'reading a national value does not report a change').toEqual([]);
  await userEvent.fill(input, '+12025550123');
  expect(changes.at(-1)).toBe('+12025550123');
  await expect.element(input).toHaveValue('+1 202 555 0123');
});

test('a number typed with + beside a country select switches the country', async () => {
  let last: string | undefined;
  const screen = await render(
    <TelField
      defaultCountry="KR"
      onValueChange={(value) => {
        last = value;
      }}
    >
      <TelField.CountrySelect />
      <TelField.Input />
    </TelField>,
  );
  const input = screen.getByRole('textbox');
  await userEvent.fill(input, '+12025550123');
  expect(last).toBe('+12025550123');
  await expect.element(screen.getByRole('combobox', { name: COUNTRY })).toHaveTextContent('US +1');
  await expect
    .element(input, { message: 'the code lives in the select' })
    .toHaveValue('(202) 555-0123');
});

test('paste: tel: links, (0) trunk markers and 00 prefixes replace the entry', async () => {
  let last: string | undefined;
  const screen = await render(
    <TelField
      defaultCountry="KR"
      onValueChange={(value) => {
        last = value;
      }}
    />,
  );
  const input = screen.getByRole('textbox');
  await userEvent.fill(input, '010');
  expect(await pasteWasPrevented(input, 'tel:+82-10-1234-5678')).toBe(true);
  expect(last).toBe('+821012345678');
  await pasteWasPrevented(input, '+44 (0)20 7946 0958');
  expect(last).toBe('+442079460958');
  await pasteWasPrevented(input, '0044 20 7946 0958');
  expect(last).toBe('+442079460958');
  await userEvent.clear(input);
  expect(await pasteWasPrevented(input, '1234'), 'a partial number pastes where the caret is').toBe(
    false,
  );
});

test('an incomplete number fails native validation and Field.Error says so', async () => {
  const screen = await render(
    <form onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Field.Label>Phone</Field.Label>
        <TelField name="phone" />
        <Field.Error />
      </Field>
      <button type="submit">Submit</button>
    </form>,
  );
  const input = screen.getByRole('textbox', { name: 'Phone' });
  const error = () => screen.container.querySelector('[data-field-part=error]');
  expect(node(input).validity.valid, 'empty is left to required').toBe(true);
  await userEvent.fill(input, '010123');
  expect(node(input).validity.customError).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await expect.poll(() => error()?.textContent).toBe('올바른 전화번호를 입력하세요.');
  await userEvent.fill(input, '01012345678');
  expect(node(input).validity.valid).toBe(true);
  await expect.poll(error).toBeNull();
});

test('format="international" settles a complete number when the field is left', async () => {
  const screen = await render(<TelField format="international" defaultCountry="KR" />);
  const input = screen.getByRole('textbox');
  await userEvent.fill(input, '01012345678');
  await expect
    .element(input, { message: 'typing keeps the national grouping' })
    .toHaveValue('010-1234-5678');
  node(input).blur();
  await expect.element(input).toHaveValue('+82 10 1234 5678');
});

test('country names come from Intl in the given locale and are searchable', async () => {
  const screen = await render(
    <TelField locale="ko-KR">
      <TelField.CountrySelect />
      <TelField.Input />
    </TelField>,
  );
  const country = screen.getByRole('combobox', { name: COUNTRY });
  await expect.element(country).toHaveAttribute('aria-label', COUNTRY);
  await userEvent.click(country);
  const search = screen.getByRole('combobox', { name: '옵션 검색' });
  await expect.element(search).toHaveAttribute('placeholder', '국가 또는 국가 번호 검색');
  await userEvent.fill(search, '미국');
  await expect.element(search).toHaveValue('미국');
  const options = screen
    .getByRole('option')
    .elements()
    .map((option) => option.textContent);
  expect(options, options.join('|')).toContain('미국+1');
});

test('a Clear part and Escape empty the number', async () => {
  let last: string | undefined;
  const screen = await render(
    <TelField
      defaultValue="+821012345678"
      onValueChange={(value) => {
        last = value;
      }}
    >
      <TelField.Input />
      <TelField.Clear />
    </TelField>,
  );
  const input = screen.getByRole('textbox');
  expect(shellOf(input).hasAttribute('data-filled')).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: '지우기' }));
  expect(last).toBe('');
  await expect.element(input).toHaveValue('');
  await userEvent.fill(input, '01012345678');
  expect(await keyWasPrevented('{Escape}', 'Escape')).toBe(true);
  expect(last).toBe('');
  await expect.element(input).toHaveValue('');
});

test('a partial number is reported as far as it goes, and a shared calling code keeps the chosen country', async () => {
  let last: string | undefined;
  const screen = await render(
    <TelField
      defaultCountry="KR"
      onValueChange={(value) => {
        last = value;
      }}
    />,
  );
  const input = screen.getByRole('textbox');
  await userEvent.fill(input, '010123');
  await expect.element(input).toHaveValue('010-123');
  expect(last).toBe('+8210123');
  await screen.rerender(
    <TelField key="ca" defaultCountry="CA" defaultValue="+12025550123">
      <TelField.CountrySelect />
      <TelField.Input />
    </TelField>,
  );
  const country = screen.getByRole('combobox', { name: COUNTRY });
  await expect.element(country).toHaveTextContent('CA +1');
  await screen.rerender(
    <TelField key="kr" defaultCountry="KR" defaultValue="+12025550123">
      <TelField.CountrySelect />
      <TelField.Input />
    </TelField>,
  );
  await expect
    .element(country, { message: 'another code reads its country' })
    .toHaveTextContent('US +1');
  await expect.element(input).toHaveValue('(202) 555-0123');
});

test('without a country select a foreign number reads internationally, a national value nationally', async () => {
  const screen = await render(<TelField defaultCountry="KR" defaultValue="+12025550123" />);
  const input = screen.getByRole('textbox');
  await expect.element(input).toHaveValue('+1 202 555 0123');
  await screen.rerender(<TelField key="partial" defaultCountry="KR" defaultValue="010-1234" />);
  await expect
    .element(input, { message: 'an incomplete national value keeps its form' })
    .toHaveValue('010-1234');
  await screen.rerender(
    <TelField key="controlled" defaultCountry="KR" value="010-1234" onValueChange={() => {}} />,
  );
  await expect.element(input).toHaveValue('010-1234');
});
