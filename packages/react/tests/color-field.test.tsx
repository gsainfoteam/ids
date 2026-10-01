import {
  createRef,
  Fragment,
  useImperativeHandle,
  useState,
  type ReactNode,
  type Ref,
} from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ColorField, ColorPicker, Field, type ColorFormat } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const trigger = () =>
  page.elementLocator(document.querySelector('[data-color-field] button[aria-haspopup]')!);
const dialog = () => page.getByRole('dialog');
const editor = () => page.getByRole('textbox', { name: '색상 값' });
const slider = (name: string) => page.getByRole('slider', { name });
const swatch = (name: string) => page.getByRole('radio', { name });
const clearButton = () => page.getByRole('button', { name: '색상 지우기' });
const triggerText = () => trigger().element().textContent;

const resetHandlersHaveRun = () => new Promise((resolve) => setTimeout(resolve));

function tracked(props: ColorField.Props = {}, children?: ReactNode) {
  const changes: string[] = [];
  const opens: boolean[] = [];
  const node = (
    <ColorField
      aria-label="Color"
      {...props}
      onValueChange={(value) => changes.push(value)}
      onOpenChange={(open) => opens.push(open)}
    >
      {children}
    </ColorField>
  );
  return { changes, opens, node };
}

test('SSR: the value is written in the field format, and the trigger reads label and value', () => {
  const cases: Array<[string, ColorFormat, boolean, string]> = [
    ['#f00', 'hex', true, '#FF0000FF'],
    ['rgba(255, 0, 0, 0.5)', 'hex', true, '#FF000080'],
    ['hsl(120, 100%, 50%)', 'rgb', false, 'rgb(0, 255, 0)'],
    ['#0000ff', 'hsl', false, 'hsl(240, 100%, 50%)'],
    ['red', 'hex', false, '#FF0000'],
    ['#FF0000', 'oklch', false, 'oklch(0.628 0.2577 29.23)'],
    ['#3B82F680', 'oklch', true, 'oklch(0.6231 0.188 259.81 / 0.5)'],
  ];
  for (const [value, format, alpha, expected] of cases) {
    const doc = parse(
      renderToString(
        <form>
          <Field required>
            <Field.Label>Color</Field.Label>
            <ColorField name="color" defaultValue={value} format={format} alpha={alpha} />
          </Field>
        </form>,
      ),
    );
    const button = doc.querySelector('button[aria-haspopup=dialog]')!;
    const label = doc.querySelector('label')!;
    const shown = doc.querySelector('[data-color-field] [id$=-value]')!;
    expect(button.id).toBe(label.htmlFor);
    expect(button.getAttribute('aria-labelledby')).toBe(`${label.id} ${shown.id}`);
    expect(shown.textContent).toBe(expected);
    expect(button.getAttribute('role')).toBe('combobox');
    expect(button.getAttribute('aria-required')).toBe('true');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(new FormData(doc.querySelector('form')!).get('color')).toBe(expected);
  }
  const doc = parse(
    renderToString(<ColorField aria-label="Brand" id="brand" size="tiny" variant="soft" />),
  );
  const root = doc.querySelector<HTMLElement>('[data-color-field]')!;
  expect(root.dataset.size).toBe('tiny');
  expect(root.dataset.variant).toBe('soft');
  expect(root.dataset.empty).toBe('');
  expect(
    doc.querySelector('button')!.getAttribute('aria-labelledby'),
    'an aria-label is kept and the value is read after it',
  ).toBe(`brand ${doc.querySelector('[id$=-value]')!.id}`);
  expect(doc.querySelector<HTMLElement>('[data-color-field-swatch]')!.dataset.empty).toBe('');
  expect(doc.querySelector('[id$=-value]')!.textContent).toBe('색상 선택');
  expect(doc.querySelector('[data-color-field-clear]'), 'nothing to clear').toBeNull();
});

test('click or ArrowDown opens a dialog on the first control; Escape closes it back to the trigger', async () => {
  const state = tracked({ defaultValue: '#3B82F6' });
  await render(state.node);
  await userEvent.click(trigger());
  await expect.element(dialog()).toHaveAttribute('aria-label', 'Color');
  await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
  await expect.element(trigger()).toHaveAttribute('aria-controls', dialog().element().id);
  await expect.element(slider('채도'), { message: 'focus starts on the area' }).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(dialog()).not.toBeInTheDocument();
  await expect.element(trigger()).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(dialog()).toBeVisible();
  await expect.element(slider('채도')).toHaveFocus();
  await userEvent.click(trigger());
  await expect.element(dialog(), { message: 'the trigger toggles' }).not.toBeInTheDocument();
  expect(state.opens).toEqual([true, false, true, false]);
  expect(state.changes).toEqual([]);
});

test('every change reaches onValueChange at once; a typed value waits for Enter', async () => {
  const state = tracked({
    defaultValue: '#FF0000',
    alpha: true,
    swatches: ['#00FF00', '#0000FF'],
  });
  await render(state.node);
  await userEvent.click(trigger());
  await userEvent.click(swatch('#00FF00'));
  expect(state.changes.at(-1)).toBe('#00FF00FF');
  await expect
    .element(dialog(), { message: 'choosing a swatch keeps the popup open' })
    .toBeVisible();
  slider('채도').element().focus();
  await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
  expect(state.changes.at(-1)).toBe('#00E600FF');
  slider('투명도').element().focus();
  await userEvent.keyboard('{Home}');
  expect(state.changes.at(-1)).toBe('#00E60000');
  await expect.poll(triggerText).toBe('#00E60000');
  const before = state.changes.length;
  await userEvent.fill(editor(), 'rgb(0, 0, 255)');
  expect(state.changes, 'a draft is not a value').toHaveLength(before);
  await userEvent.keyboard('{Enter}');
  expect(state.changes.at(-1)).toBe('#0000FFFF');
  await expect.element(editor()).toHaveValue('#0000FFFF');
  await userEvent.fill(editor(), 'nonsense');
  await expect.element(editor()).toHaveAttribute('aria-invalid', 'true');
  await userEvent.keyboard('{Escape}');
  await expect
    .element(dialog(), { message: 'the first Escape only drops the draft' })
    .toBeVisible();
  await expect.element(editor()).toHaveValue('#0000FFFF');
  await userEvent.keyboard('{Escape}');
  await expect.element(dialog()).not.toBeInTheDocument();
  await expect.element(trigger()).toHaveFocus();
});

test('Clear empties the value and focuses the trigger; it is hidden while read-only', async () => {
  const state = tracked({ defaultValue: '#FF0000', size: 'tiny' });
  const screen = await render(state.node);
  await expect.element(clearButton()).toHaveAttribute('data-variant', 'ghost');
  await expect
    .element(clearButton(), { message: 'a ghost IconButton of the field size' })
    .toHaveAttribute('data-size', 'tiny');
  await expect
    .element(clearButton(), { message: 'Clear stays in the Tab order' })
    .not.toHaveAttribute('tabindex');
  await userEvent.click(clearButton());
  expect(state.changes).toEqual(['']);
  await expect.element(trigger()).toHaveFocus();
  await expect.element(clearButton()).not.toBeInTheDocument();
  await expect.element(trigger()).toHaveAttribute('data-placeholder', '');
  await expect.poll(triggerText).toBe('색상 선택');
  await screen.rerender(
    <Fragment key="read-only">
      {tracked({ defaultValue: '#FF0000', readOnly: true }).node}
    </Fragment>,
  );
  await expect.poll(triggerText).toBe('#FF0000');
  await expect.element(clearButton()).not.toBeInTheDocument();
  await screen.rerender(
    <Fragment key="disabled">{tracked({ defaultValue: '#FF0000', disabled: true }).node}</Fragment>,
  );
  await expect.element(clearButton()).toHaveAttribute('disabled');
  const own = vi.fn();
  const custom = tracked(
    { defaultValue: '#FF0000' },
    <ColorField.Clear asChild onClick={own}>
      <button className="mine" />
    </ColorField.Clear>,
  );
  await screen.rerender(<Fragment key="custom">{custom.node}</Fragment>);
  await expect
    .element(clearButton(), { message: 'asChild draws the given button' })
    .toHaveClass('mine');
  await userEvent.click(clearButton());
  expect(own, "the part's own onClick runs as well").toHaveBeenCalledOnce();
  expect(custom.changes).toEqual(['']);
});

test('an unreadable value is shown as it is and marks the field invalid', async () => {
  const screen = await render(<ColorField aria-label="Color" defaultValue="nonsense" />);
  await expect.poll(triggerText).toBe('nonsense');
  await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
  expect(screen.container.querySelector<HTMLElement>('[data-color-field]')!.dataset.invalid).toBe(
    '',
  );
  expect(
    screen.container.querySelector<HTMLElement>('[data-color-field-swatch]')!.dataset.empty,
  ).toBe('');
  await screen.rerender(<ColorField key="b" aria-label="Color" defaultValue="#FF0000" invalid />);
  await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
  await screen.rerender(
    <ColorField key="c" aria-label="Color" defaultValue="nonsense" aria-invalid={false} />,
  );
  await expect
    .element(trigger(), { message: 'an explicit aria-invalid wins' })
    .toHaveAttribute('aria-invalid', 'false');
});

test('an outside value is shown in the field format without calling onValueChange', async () => {
  const state = tracked({ value: '#3b82f6', format: 'rgb' });
  await render(state.node);
  await expect.poll(triggerText).toBe('rgb(59, 130, 246)');
  await userEvent.click(trigger());
  await expect.element(editor()).toHaveValue('rgb(59, 130, 246)');
  expect(state.changes).toEqual([]);
});

test('required is enforced natively, empty is not submitted, reset restores the default', async () => {
  const submitted = vi.fn();
  const onValueChange = vi.fn();
  const screen = await render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <ColorField
        aria-label="Color"
        name="color"
        required
        swatches={['#00FF00']}
        onValueChange={onValueChange}
      />
      <button type="submit">Submit</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const validator = screen.container.querySelector<HTMLInputElement>(
    '[data-form-value-validator]',
  )!;
  expect([...new FormData(form)], 'an empty value is not submitted').toEqual([]);
  expect(form.checkValidity()).toBe(false);
  expect(validator.validity.valueMissing).toBe(true);
  await userEvent.click(page.getByRole('button', { name: 'Submit' }));
  expect(submitted).not.toHaveBeenCalled();
  await expect.element(trigger(), { message: 'focus moves on to the trigger' }).toHaveFocus();
  await userEvent.click(trigger());
  await userEvent.click(swatch('#00FF00'));
  expect(form.checkValidity()).toBe(true);
  expect([...new FormData(form)]).toEqual([['color', '#00FF00']]);
  form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
  form.reset();
  await resetHandlersHaveRun();
  expect([...new FormData(form)], 'a prevented reset').toEqual([['color', '#00FF00']]);
  form.reset();
  await expect.poll(() => [...new FormData(form)]).toEqual([]);
  await expect.element(dialog(), { message: 'reset closes the popup' }).not.toBeInTheDocument();
  expect(onValueChange, 'a reset reports no change').toHaveBeenCalledExactlyOnceWith('#00FF00');
});

test('disabled is not submitted and never opens; read-only is submitted, not validated or opened', async () => {
  const view = (props: ColorField.Props) => (
    <form>
      <ColorField
        aria-label="Color"
        name="color"
        required
        defaultValue="#FF0000"
        defaultOpen
        {...props}
      />
    </form>
  );
  const form = () => document.querySelector('form')!;
  const screen = await render(<Fragment key="disabled">{view({ disabled: true })}</Fragment>);
  await expect.element(trigger()).toHaveAttribute('disabled');
  await expect.element(dialog()).not.toBeInTheDocument();
  expect([...new FormData(form())]).toEqual([]);
  await screen.rerender(
    <Fragment key="read-only-empty">{view({ readOnly: true, defaultValue: '' })}</Fragment>,
  );
  await expect.element(dialog()).not.toBeInTheDocument();
  await userEvent.click(trigger(), { force: true });
  await expect.element(trigger()).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(dialog()).not.toBeInTheDocument();
  await expect.element(trigger()).toHaveAttribute('aria-readonly', 'true');
  expect(form().checkValidity(), 'read-only is not validated').toBe(true);
  await screen.rerender(<Fragment key="read-only">{view({ readOnly: true })}</Fragment>);
  expect([...new FormData(form())]).toEqual([['color', '#FF0000']]);
});

function ControlledOpen() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <p>Outside</p>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <ColorField aria-label="Color" open={open} onOpenChange={setOpen} />
    </div>
  );
}

test('open, defaultOpen and onOpenChange; outside press and focus leaving close a popover', async () => {
  await render(<ControlledOpen />);
  await expect.element(dialog(), { message: 'starts open' }).toBeVisible();
  await userEvent.click(page.getByText('Outside'));
  await expect.element(dialog()).not.toBeInTheDocument();
  await userEvent.click(page.getByRole('button', { name: 'Open' }));
  await expect.element(dialog()).toBeVisible();
  await expect.element(slider('채도')).toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{Tab}{/Shift}');
  await expect.element(page.getByRole('button', { name: 'Open' })).toHaveFocus();
  await expect
    .element(dialog(), { message: 'focus leaving the popover closes it' })
    .not.toBeInTheDocument();
});

test('onBlur waits until focus leaves both the trigger and the popup', async () => {
  const onBlur = vi.fn();
  const screen = await render(
    <div>
      <Field>
        <Field.Label>Brand</Field.Label>
        <ColorField defaultValue="#FF0000" onBlur={onBlur} />
      </Field>
      <button type="button">After</button>
    </div>,
  );
  await userEvent.keyboard('{Tab}');
  await expect.element(trigger()).toHaveFocus();
  await userEvent.click(trigger());
  await expect.element(slider('채도')).toHaveFocus();
  await expect
    .element(dialog())
    .toHaveAttribute('aria-labelledby', screen.container.querySelector('label')!.id);
  expect(onBlur, 'moving into the popup is not a blur').not.toHaveBeenCalled();
  editor().element().focus();
  expect(onBlur).not.toHaveBeenCalled();
  page.getByRole('button', { name: 'After' }).element().focus();
  expect(onBlur).toHaveBeenCalledOnce();
});

test('a surrounding Field follows the value once the popup closes', async () => {
  const screen = await render(
    <Field>
      <Field.Label>Brand</Field.Label>
      <ColorField name="color" swatches={['#FF0000']} />
    </Field>,
  );
  const flags = () => {
    const field = screen.container.querySelector('[data-field]')!;
    return [field.hasAttribute('data-filled'), field.hasAttribute('data-dirty')];
  };
  expect(flags()).toEqual([false, false]);
  await userEvent.click(trigger());
  await expect.element(dialog()).toBeVisible();
  expect(flags(), "the popup's own controls are not the field's value").toEqual([false, false]);
  await userEvent.keyboard('{Escape}');
  await expect.element(dialog()).not.toBeInTheDocument();
  expect(flags(), 'opening and closing the popup changes nothing').toEqual([false, false]);
  await userEvent.click(trigger());
  await userEvent.click(swatch('#FF0000'));
  await userEvent.keyboard('{Escape}');
  await expect.poll(flags).toEqual([true, true]);
  await userEvent.click(clearButton());
  await expect.poll(flags, { message: 'cleared back to where it started' }).toEqual([false, false]);
});

test('Content holds ColorPicker parts, and focus goes to the first one given', async () => {
  const swatchesOnly = (
    <ColorField.Content>
      <ColorPicker.Swatches />
    </ColorField.Content>
  );
  const state = tracked(
    { defaultValue: '#0000FF', swatches: ['#FF0000', '#0000FF'] },
    swatchesOnly,
  );
  const screen = await render(state.node);
  await userEvent.click(trigger());
  await expect.element(dialog()).toBeVisible();
  expect(document.querySelector('[data-color-picker-area]')).toBeNull();
  await expect.element(editor()).not.toBeInTheDocument();
  await expect
    .element(swatch('#0000FF'), { message: 'the chosen swatch takes focus' })
    .toHaveFocus();
  await userEvent.keyboard('{Home}');
  expect(state.changes, 'Home chooses the first color').toEqual(['#FF0000']);
  await screen.rerender(
    <Fragment key="unlisted">
      {tracked({ defaultValue: '#123456', swatches: ['#FF0000', '#0000FF'] }, swatchesOnly).node}
    </Fragment>,
  );
  await userEvent.click(trigger());
  await expect
    .element(swatch('#FF0000'), { message: 'with no chosen swatch, the first' })
    .toHaveFocus();
  await screen.rerender(
    <Fragment key="hue">
      {
        tracked(
          { defaultValue: '#FF0000', alpha: true },
          <ColorField.Content>
            <ColorPicker.HueSlider />
            <ColorPicker.Input />
          </ColorField.Content>,
        ).node
      }
    </Fragment>,
  );
  trigger().element().focus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(slider('색조')).toHaveFocus();
  expect(document.querySelector('[data-color-picker-alpha]')).toBeNull();
  await expect.element(editor()).toBeInTheDocument();
});

test('parts: a custom trigger, and Clear must sit beside the trigger', async () => {
  const screen = await render(
    <ColorField aria-label="Color" defaultValue="#00FF00">
      <ColorField.Trigger className="custom">
        <ColorField.Value />
      </ColorField.Trigger>
    </ColorField>,
  );
  await expect.element(trigger()).toHaveClass('custom');
  expect(screen.container.querySelector('[data-color-field-swatch]')).toBeNull();
  await expect.poll(triggerText).toBe('#00FF00');
  await expect
    .element(clearButton(), { message: 'Clear is still added beside it' })
    .toBeInTheDocument();
  expect(() =>
    renderToString(
      <ColorField aria-label="Color" defaultValue="#00FF00">
        <ColorField.Trigger>
          <ColorField.Value />
          <ColorField.Clear />
        </ColorField.Trigger>
      </ColorField>,
    ),
  ).toThrow(/sibling of Trigger/);
  expect(() =>
    renderToString(
      <ColorField aria-label="Color">
        <ColorField.Content />
        <ColorField.Content />
      </ColorField>,
    ),
  ).toThrow(/one Trigger, Content and Clear/);
});

test('drawer on a small screen: modal dialog with a title and a close button', async () => {
  try {
    await page.viewport(390, 844);
    const state = tracked({ defaultValue: '#FF0000', mobileVariant: 'drawer' });
    const screen = await render(state.node);
    await userEvent.click(trigger());
    await expect.element(dialog()).toHaveAttribute('data-presentation', 'drawer');
    await expect.element(dialog()).toHaveAttribute('aria-modal', 'true');
    await expect.element(dialog()).toHaveTextContent('색상 선택');
    await expect.element(slider('채도')).toHaveFocus();
    expect(document.body.hasAttribute('data-scroll-locked'), 'the page scroll is locked').toBe(
      true,
    );
    await userEvent.click(page.getByRole('button', { name: '닫기' }));
    await expect.element(dialog()).not.toBeInTheDocument();
    await expect.element(trigger(), { message: 'the close button returns focus' }).toHaveFocus();
    expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
    await userEvent.click(trigger());
    await expect.element(dialog()).toBeVisible();
    const aboveTheSheet = { x: 8, y: 8 };
    await userEvent.click(document.querySelector('[data-field-popup-backdrop]')!, {
      position: aboveTheSheet,
    });
    await expect.element(dialog()).not.toBeInTheDocument();
    await expect
      .element(trigger(), { message: 'a click on the backdrop returns focus' })
      .toHaveFocus();
    await page.viewport(1024, 768);
    await screen.rerender(
      <Fragment key="wide">
        {tracked({ defaultValue: '#FF0000', mobileVariant: 'drawer' }).node}
      </Fragment>,
    );
    await userEvent.click(trigger());
    await expect.element(dialog()).toHaveAttribute('data-presentation', 'popover');
    await expect
      .element(page.getByRole('button', { name: '닫기' }), { message: 'no header in a popover' })
      .not.toBeInTheDocument();
  } finally {
    await page.viewport(414, 896);
  }
});

function RHFColor({
  form,
  disabled = false,
  onSubmit,
}: {
  form: Ref<UseFormReturn<{ color: string }>>;
  disabled?: boolean;
  onSubmit: (values: { color: string }) => void;
}) {
  const methods = useForm({ defaultValues: { color: '' } });
  useImperativeHandle(form, () => methods, [methods]);
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <RHFField
          name="color"
          controlMode="value"
          registerOptions={{ required: 'Required' }}
          disabled={disabled}
        >
          <RHFField.Label>Color</RHFField.Label>
          <ColorField swatches={['#FF0000']} />
          <RHFField.Error />
        </RHFField>
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

test('react-hook-form value mode: validation focuses the trigger, selection, reset and outside values', async () => {
  const form = createRef<UseFormReturn<{ color: string }>>();
  const results: Array<{ color: string }> = [];
  const onSubmit = (values: { color: string }) => {
    results.push(values);
  };
  const screen = await render(<RHFColor form={form} onSubmit={onSubmit} />);
  const submit = page.getByRole('button', { name: 'Submit' });
  const error = () => screen.container.querySelector('[data-field-part=error]')?.textContent;
  await userEvent.click(submit);
  await expect.element(trigger()).toHaveFocus();
  await expect.poll(error).toBe('Required');
  await userEvent.click(trigger());
  await userEvent.click(swatch('#FF0000'));
  expect(form.current!.getValues('color')).toBe('#FF0000');
  await userEvent.keyboard('{Escape}');
  await userEvent.click(submit);
  await expect.poll(() => results).toEqual([{ color: '#FF0000' }]);
  form.current!.reset();
  await expect.poll(triggerText).toBe('색상 선택');
  form.current!.setValue('color', '#0000FF');
  await expect.poll(triggerText).toBe('#0000FF');
  await screen.rerender(<RHFColor form={form} disabled onSubmit={onSubmit} />);
  await userEvent.click(submit);
  await expect.poll(() => results).toHaveLength(2);
  expect(results.at(-1)!.color).toBeUndefined();
});
