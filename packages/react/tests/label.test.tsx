import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Checkbox, CheckboxGroup, Field, Label } from '../src';

const clickAwayFromTheSwitch = (label: Locator) =>
  userEvent.click(label, {
    position: { x: label.element().getBoundingClientRect().width - 2, y: 2 },
  });

test('SSR: a native label with an id, a required marker hidden from screen readers', () => {
  const element = new DOMParser()
    .parseFromString(
      renderToString(
        <Label htmlFor="name" required>
          Name
        </Label>,
      ),
      'text/html',
    )
    .querySelector('label')!;
  expect(element.htmlFor).toBe('name');
  expect(element.id).toBeTruthy();
  expect(element.hasAttribute('data-required')).toBe(true);
  const marker = element.querySelector('[data-label-required]')!;
  expect(marker.textContent).toBe('*');
  expect(marker.getAttribute('aria-hidden')).toBe('true');
  expect(element.className).toMatch(/text-body-b3-medium/);
});

test('the label mirrors its native control, and follows later changes', async () => {
  const screen = await render(
    <div>
      <Label htmlFor="nick">Nickname</Label>
      <input id="nick" required />
    </div>,
  );
  const label = screen.getByText(/^Nickname/);
  const input = screen.getByRole('textbox', { name: 'Nickname' });
  await expect.element(label).toHaveAttribute('data-required');
  expect(label.element().querySelector('[data-label-required]')).not.toBeNull();
  await expect.element(label).not.toHaveAttribute('data-disabled');
  (input.element() as HTMLInputElement).disabled = true;
  await expect.element(label).toHaveAttribute('data-disabled');
  await expect.element(input).not.toHaveAttribute('aria-labelledby');
});

test('explicit props win over the control', async () => {
  const screen = await render(
    <div>
      <Label htmlFor="x" required={false} disabled>
        X
      </Label>
      <input id="x" required />
    </div>,
  );
  const label = screen.getByText('X');
  await expect.element(label).toHaveAttribute('data-disabled');
  await expect.element(label).not.toHaveAttribute('data-required');
});

test('a label given both states does not observe its control', async () => {
  const observe = vi.spyOn(MutationObserver.prototype, 'observe');
  onTestFinished(() => observe.mockRestore());
  const screen = await render(
    <div>
      <Label htmlFor="y" required disabled={false}>
        Y
      </Label>
      <input id="y" disabled />
    </div>,
  );
  const label = screen.getByText(/^Y/);
  await expect.element(label).toHaveAttribute('data-required');
  await expect.element(label).not.toHaveAttribute('data-disabled');
  const input = screen.getByRole('textbox', { name: 'Y' }).element();
  expect(observe.mock.calls.map(([target]) => target)).not.toContain(input);
});

test('a role widget gets a name by reference and focus on click', async () => {
  const screen = await render(
    <div>
      <Label htmlFor="volume">Volume</Label>
      <span id="volume">
        <span role="slider" tabIndex={0} aria-valuenow={3} />
      </span>
    </div>,
  );
  const label = screen.getByText('Volume');
  const slider = screen.getByRole('slider', { name: 'Volume' });
  await expect.element(slider).toHaveAttribute('aria-labelledby', label.element().id);
  await userEvent.click(label);
  await expect.element(slider).toHaveFocus();
});

test('a checkbox-like widget toggles when its label is clicked, unless disabled', async () => {
  const clicks: string[] = [];
  const screen = await render(
    <Label>
      <span
        role="switch"
        tabIndex={0}
        aria-checked={false}
        className="size-4"
        onClick={() => clicks.push('switch')}
      />
      Dark mode
    </Label>,
  );
  await clickAwayFromTheSwitch(screen.getByText('Dark mode'));
  expect(clicks).toEqual(['switch']);
  await userEvent.click(screen.getByRole('switch'));
  expect(clicks, 'a click on the widget itself is not doubled').toEqual(['switch', 'switch']);

  await screen.rerender(
    <Label key="disabled">
      <span
        role="switch"
        tabIndex={0}
        aria-disabled
        className="size-4"
        onClick={() => clicks.push('disabled')}
      />
      Off
    </Label>,
  );
  const disabled = screen.getByText('Off');
  await expect.element(disabled).toHaveAttribute('data-disabled');
  await clickAwayFromTheSwitch(disabled);
  expect(clicks).not.toContain('disabled');
});

test('an existing name is kept, and the reference is removed with the label', async () => {
  function Sliders({ shown }: { shown: boolean }) {
    return (
      <div>
        {shown && <Label htmlFor="a">A</Label>}
        <div id="a" role="slider" tabIndex={0} />
        <div id="b" role="slider" tabIndex={0} aria-label="Own" />
        <Label htmlFor="b">B</Label>
      </div>
    );
  }
  const screen = await render(<Sliders shown />);
  const a = screen.getByRole('slider', { name: 'A' });
  await expect.element(a).toHaveAttribute('aria-labelledby');
  const labelledElement = a.element();
  await expect
    .element(screen.getByRole('slider', { name: 'Own' }))
    .not.toHaveAttribute('aria-labelledby');
  await screen.rerender(<Sliders shown={false} />);
  expect(labelledElement.hasAttribute('aria-labelledby')).toBe(false);
});

test('className and style read the state', async () => {
  const screen = await render(
    <div>
      <Label
        htmlFor="r"
        className={(state) => (state.required ? 'is-required' : 'is-optional')}
        style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
      >
        R
      </Label>
      <input id="r" required />
    </div>,
  );
  const label = screen.getByText(/^R/);
  await expect.element(label).toHaveClass('is-required');
  expect(label.element().style.opacity).toBe('1');
});

test('invalid is set directly, not read from the control', async () => {
  const screen = await render(
    <div>
      <Label htmlFor="e" invalid className={(state) => (state.invalid ? 'is-invalid' : 'is-valid')}>
        E
      </Label>
      <Label htmlFor="f">F</Label>
      <input id="e" />
      <input id="f" aria-invalid />
    </div>,
  );
  const explicit = screen.getByText('E');
  const mirrored = screen.getByText('F');
  await expect.element(explicit).toHaveAttribute('data-invalid');
  await expect.element(explicit).toHaveClass('is-invalid');
  await expect.element(explicit).toHaveClass('data-invalid:text-(--ids-color-danger)');
  await expect.element(mirrored).not.toHaveAttribute('data-invalid');
});

test('asChild draws the label as its child element, with the id and handler it carries', async () => {
  const clicks: string[] = [];
  const screen = await render(
    <div>
      <Label asChild htmlFor="level" required>
        <span id="own" className="own" onClick={() => clicks.push('child')}>
          Level
        </span>
      </Label>
      <div id="level" role="slider" tabIndex={0} aria-valuenow={3} />
    </div>,
  );
  const span = screen.getByText(/^Level/);
  expect(span.element().tagName).toBe('SPAN');
  await expect.element(span).toHaveAttribute('data-label');
  await expect.element(span).toHaveAttribute('id', 'own');
  await expect.element(span).toHaveClass('own', 'text-body-b3-medium');
  expect(span.element().querySelector('[data-label-required]')!.textContent).toBe('*');
  const slider = screen.getByRole('slider', { name: 'Level' });
  await expect.element(slider).toHaveAttribute('aria-labelledby', 'own');
  await userEvent.click(span);
  expect(clicks).toEqual(['child']);
  await expect.element(slider).toHaveFocus();
  expect(() => renderToString(<Label asChild>Level</Label>)).toThrow(/Label asChild/);
});

test('inside a Field it still renders', () => {
  const html = renderToString(
    <Field>
      <Field.Label>Name</Field.Label>
      <input />
      <Field.Hint>
        <Label>x</Label>
      </Field.Hint>
    </Field>,
  );
  expect(html).toMatch(/data-label/);
});

test('inside a Field a label wrapping its own control stays quiet; one standing apart warns', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());
  const fieldLabelWarnings = () =>
    warn.mock.calls.filter(([message]) => String(message).includes('Field.Label'));
  const screen = await render(
    <Field>
      <Field.Label>Topics</Field.Label>
      <CheckboxGroup defaultValue={[]}>
        <Label>
          <Checkbox value="news" />
          News
        </Label>
      </CheckboxGroup>
    </Field>,
  );
  await expect.element(screen.getByRole('checkbox', { name: 'News' })).toBeInTheDocument();
  expect(fieldLabelWarnings()).toEqual([]);
  await screen.unmount();
  await render(
    <Field>
      <input id="name" />
      <Label htmlFor="name">Name</Label>
    </Field>,
  );
  expect(fieldLabelWarnings()).not.toHaveLength(0);
});
