import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, Radio } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const circleOf = (radio: Locator) => radio.element().closest<HTMLElement>('[data-radio]')!;

test('SSR: a native radio in a drawn circle, labelled by Field', () => {
  const doc = parse(
    renderToString(
      <Field size="tiny" invalid>
        <Field.Label>Express</Field.Label>
        <Radio name="shipping" value="express" defaultChecked />
      </Field>,
    ),
  );
  const input = doc.querySelector('input')!;
  expect(input.type).toBe('radio');
  expect(input.name).toBe('shipping');
  expect(input.checked).toBe(true);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(doc.querySelector('label')!.htmlFor).toBe(input.id);
  const circle = input.closest<HTMLElement>('[data-radio]')!;
  expect(circle.dataset.state).toBe('checked');
  expect(circle.dataset.size).toBe('tiny');
  expect(circle.hasAttribute('data-invalid')).toBe(true);
  expect(circle.querySelector<HTMLElement>('[aria-hidden=true]')!.dataset.state).toBe('checked');
  expect(
    input.classList.contains('rounded-[inherit]'),
    'the input takes the corners drawn on the circle, so a restyled shape answers everywhere',
  ).toBe(true);
});

test('uncontrolled radios sharing a name: choosing one un-marks its groupmate', async () => {
  const changes: string[] = [];
  const track = (value: string) => (next: boolean) => changes.push(`${value}:${next}`);
  const screen = await render(
    <form>
      <Radio name="ship" value="a" aria-label="A" defaultChecked onCheckedChange={track('a')} />
      <Radio name="ship" value="b" aria-label="B" onCheckedChange={track('b')} />
      <Radio name="other" value="c" aria-label="C" defaultChecked />
      <button type="reset">Reset</button>
    </form>,
  );
  const [a, b, c] = ['A', 'B', 'C'].map((name) => screen.getByRole('radio', { name }));
  await userEvent.click(b);
  await expect.element(circleOf(b)).toHaveAttribute('data-state', 'checked');
  await expect.element(circleOf(a)).toHaveAttribute('data-state', 'unchecked');
  await expect
    .element(circleOf(c), { message: 'another group is left alone' })
    .toHaveAttribute('data-state', 'checked');
  expect(changes).toEqual(['b:true', 'a:false']);
  const form = screen.container.querySelector('form')!;
  expect([...new FormData(form)]).toEqual([
    ['ship', 'b'],
    ['other', 'c'],
  ]);
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(circleOf(a)).toHaveAttribute('data-state', 'checked');
  await expect.element(circleOf(b)).toHaveAttribute('data-state', 'unchecked');
  expect(changes, 'a reset reports nothing').toEqual(['b:true', 'a:false']);
  await userEvent.click(b);
  await expect
    .element(circleOf(b), { message: 'the radio checked before the reset can be chosen again' })
    .toHaveAttribute('data-state', 'checked');
  await expect.element(circleOf(a)).toHaveAttribute('data-state', 'unchecked');
  expect(changes).toEqual(['b:true', 'a:false', 'b:true', 'a:false']);
});

test('controlled: the parent decides, and readOnly never selects', async () => {
  const changes: Array<boolean | string> = [];
  function Parent({ follow }: { follow: boolean }) {
    const [checked, setChecked] = useState(false);
    return (
      <Radio
        value="x"
        aria-label="X"
        checked={checked}
        onCheckedChange={(next) => {
          changes.push(next);
          if (follow) setChecked(next);
        }}
      />
    );
  }
  const screen = await render(<Parent follow={false} />);
  const x = screen.getByRole('radio', { name: 'X' });
  await userEvent.click(x);
  await expect.element(x).not.toBeChecked();
  await expect.element(circleOf(x)).toHaveAttribute('data-state', 'unchecked');
  await screen.rerender(
    <div key="follow">
      <Parent follow />
    </div>,
  );
  await userEvent.click(x);
  await expect.element(circleOf(x)).toHaveAttribute('data-state', 'checked');
  expect(changes).toEqual([true, true]);
  await screen.rerender(
    <div key="readonly">
      <Radio value="r" aria-label="R" readOnly onCheckedChange={() => changes.push('readonly')} />
    </div>,
  );
  const r = screen.getByRole('radio', { name: 'R' });
  await userEvent.click(r);
  await expect.element(r).not.toBeChecked();
  await expect.element(circleOf(r)).toHaveAttribute('data-state', 'unchecked');
  expect(changes).toEqual([true, true]);
});

test('react-hook-form register() on each radio: default, click and setValue show', async () => {
  let methods!: UseFormReturn<{ plan: string }>;
  function App() {
    methods = useForm<{ plan: string }>({ defaultValues: { plan: 'free' } });
    return (
      <div>
        <Radio {...methods.register('plan')} value="free" aria-label="Free" />
        <Radio {...methods.register('plan')} value="pro" aria-label="Pro" />
      </div>
    );
  }
  const screen = await render(<App />);
  const free = screen.getByRole('radio', { name: 'Free' });
  const pro = screen.getByRole('radio', { name: 'Pro' });
  await expect.element(circleOf(free)).toHaveAttribute('data-state', 'checked');
  await userEvent.click(pro);
  expect(methods.getValues('plan')).toBe('pro');
  await expect.element(circleOf(free)).toHaveAttribute('data-state', 'unchecked');
  methods.setValue('plan', 'free');
  await expect.element(circleOf(free)).toHaveAttribute('data-state', 'checked');
  await expect.element(circleOf(pro)).toHaveAttribute('data-state', 'unchecked');
});

test('Radio.Indicator: asChild, state functions and misuse', async () => {
  const screen = await render(
    <Radio value="star" aria-label="Star" className={(state) => (state.checked ? 'on' : 'off')}>
      <Radio.Indicator asChild>
        <svg data-star="" />
      </Radio.Indicator>
    </Radio>,
  );
  const radio = screen.getByRole('radio', { name: 'Star' });
  const star = circleOf(radio).querySelector<SVGElement>('[data-star]')!;
  expect(star.getAttribute('aria-hidden')).toBe('true');
  expect(star.getAttribute('data-state')).toBe('unchecked');
  await expect.element(circleOf(radio)).toHaveClass('off');
  await userEvent.click(radio);
  await expect.element(star).toHaveAttribute('data-state', 'checked');
  await expect.element(circleOf(radio)).toHaveClass('on');
  expect(() => renderToString(<Radio.Indicator />)).toThrow(/inside Radio/);
  expect(() => renderToString(<Radio checked defaultChecked onCheckedChange={() => {}} />)).toThrow(
    /not both/,
  );
});
