import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { page, userEvent, type LocatorSelectors } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, Rating } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const option = (score: number, within: LocatorSelectors = page) =>
  within.getByRole('radio', { name: `5점 만점에 ${score}점` });
const checkedOption = (within: LocatorSelectors = page) =>
  within.getByRole('radio', { checked: true });
const letACancelledResetRunIfItWould = () => new Promise((resolve) => setTimeout(resolve, 100));

test('half-step SSR: one tabbable option, the Field label and id stay on the group', () => {
  const doc = parse(
    renderToString(
      <Field invalid size="tiny">
        <Field.Label>평점</Field.Label>
        <Rating defaultValue={2.5} step={0.5} />
        <Field.Error>오류</Field.Error>
      </Field>,
    ),
  );
  const group = doc.querySelector<HTMLElement>('[role=radiogroup]')!;
  expect(doc.querySelectorAll('[role=radio]')).toHaveLength(11);
  expect(doc.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  const selected = doc.querySelector<HTMLElement>('[aria-checked=true]')!;
  expect(selected.dataset.ratingValue).toBe('2.5');
  expect(doc.querySelector('label')!.htmlFor, 'the id does not move').toBe(group.id);
  expect(group.getAttribute('aria-labelledby')).toBe(doc.querySelector('label')!.id);
  expect(selected.getAttribute('aria-invalid')).toBe('true');
  expect(doc.getElementById(selected.getAttribute('aria-describedby')!)!.textContent).toBe('오류');
  expect(group.dataset.size).toBe('tiny');
});

test('keyboard moves by half-step, clamps boundaries, clears and keeps focus', async () => {
  const values: number[] = [];
  const screen = await render(<Rating step={0.5} onValueChange={(v) => values.push(v)} />);
  option(0).element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '0.5');
  await expect.element(option(0.5)).toHaveFocus();
  await userEvent.keyboard('{End}');
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '5');
  await userEvent.keyboard('{Home}');
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '0');
  await userEvent.keyboard('3');
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '3');
  expect(values).toEqual([0.5, 5, 0, 3]);
  await screen.rerender(<Rating step={0.5} style={{ direction: 'rtl' }} />);
  option(3).element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '3.5');
});

test('hover previews, drawn translucent, without changing the value; half clicks commit once', async () => {
  const away = await render(<p>Away</p>);
  await userEvent.hover(away.getByText('Away'));
  const values: number[] = [];
  const previews: Array<number | null> = [];
  const screen = await render(
    <Rating
      defaultValue={1}
      step={0.5}
      onValueChange={(v) => values.push(v)}
      onHover={(v) => previews.push(v)}
    />,
  );
  const fills = () =>
    [...screen.container.querySelectorAll<HTMLElement>('[data-rating-item]')].map(
      (item) => item.dataset.state,
    );
  const firstFillOpacity = () =>
    getComputedStyle(
      screen.container.querySelector('[data-rating-item] > [aria-hidden] > :last-child')!,
    ).opacity;
  await userEvent.hover(option(2.5));
  await expect.poll(fills).toEqual(['full', 'full', 'half', 'empty', 'empty']);
  await expect.element(screen.getByRole('radiogroup')).toHaveAttribute('data-previewing');
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '1');
  await expect.poll(firstFillOpacity, { message: 'the preview is translucent' }).toBe('0.5');
  expect(values).toEqual([]);
  await userEvent.click(option(2.5));
  await userEvent.click(option(2.5));
  expect(values).toEqual([2.5]);
  expect(previews).toEqual([2.5, null]);
  await expect.poll(firstFillOpacity, { message: 'the chosen score is solid' }).toBe('1');
});

test('controlled changes respect the owner; outside updates do not echo', async () => {
  const values: number[] = [];
  let update!: (value: number) => void;
  function Demo() {
    const [value, set] = useState(2);
    update = set;
    return <Rating value={value} onValueChange={(v) => values.push(v)} />;
  }
  await render(<Demo />);
  await userEvent.click(option(4));
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '2');
  expect(values).toEqual([4]);
  update(3);
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '3');
  expect(values).toEqual([4]);
});

test('readOnly, disabled and display-only block changes; display-only reads as one image', async () => {
  const onValueChange = vi.fn();
  for (const blocked of [{ readOnly: true }, { disabled: true }]) {
    const screen = await render(<Rating {...blocked} value={2} onValueChange={onValueChange} />);
    await userEvent.click(option(4), { force: true });
    option(2).element().focus();
    await userEvent.keyboard('{End}');
    await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '2');
    await screen.unmount();
  }
  expect(onValueChange).not.toHaveBeenCalled();
  const screen = await render(<Rating selectionMode="none" value={3} aria-label="상품" />);
  expect(screen.container.querySelectorAll('button')).toHaveLength(0);
  await expect.element(screen.getByRole('img')).toHaveAccessibleName(/상품.*3점/);
  expect(screen.container.querySelector('input'), 'nothing to submit').toBeNull();
});

test('Rating.Item: one template for every star, indexed items for their own, all inert', async () => {
  const screen = await render(
    <Rating max={3} defaultValue={2} aria-label="Glyphs">
      <Rating.Item>
        <i data-glyph="fire" />
      </Rating.Item>
      <Rating.Item index={1} className={(state) => `item-${state.fill}`}>
        {(state) => <i data-glyph={`face-${state.itemValue}`} />}
      </Rating.Item>
    </Rating>,
  );
  const items = [...screen.container.querySelectorAll<HTMLElement>('[data-rating-item]')];
  expect(
    items.map((item) => item.querySelector<HTMLElement>('[data-glyph]')!.dataset.glyph),
  ).toEqual(['fire', 'face-2', 'fire']);
  expect(screen.container.querySelector('[inert] [data-glyph]')).not.toBeNull();
  await expect.element(items[1]!).toHaveClass('item-full');
  expect(() =>
    renderToString(
      <Rating>
        <Rating.Item>a</Rating.Item>
        <Rating.Item>b</Rating.Item>
      </Rating>,
    ),
  ).toThrow(/one Rating.Item without an index/);
  expect(() =>
    renderToString(
      <Rating>
        <span />
      </Rating>,
    ),
  ).toThrow(/Rating.Item elements/);
});

test('form: a hidden input only with a name and a score, required, reset without a report', async () => {
  const values: number[] = [];
  const screen = await render(
    <form>
      <Rating name="score" defaultValue={2} onValueChange={(v) => values.push(v)} />
      <Rating aria-label="Nameless" defaultValue={4} />
      <button type="reset">Reset</button>
    </form>,
  );
  const form = () => screen.container.querySelector('form')!;
  const score = screen.getByRole('radiogroup', { name: '평점' });
  const reset = screen.getByRole('button', { name: 'Reset' });
  await userEvent.click(option(4, score));
  expect([...new FormData(form())]).toEqual([['score', '4']]);
  await userEvent.click(reset);
  await expect.element(checkedOption(score)).toHaveAttribute('data-rating-value', '2');
  expect(values).toEqual([4]);
  option(0, score).element().focus();
  await userEvent.keyboard('0');
  await expect
    .poll(() => [...new FormData(form())], { message: 'no rating, no entry' })
    .toEqual([]);
  form().addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await userEvent.click(option(3, score));
  await userEvent.click(reset);
  await letACancelledResetRunIfItWould();
  await expect
    .element(checkedOption(score), { message: 'a cancelled reset changes nothing' })
    .toHaveAttribute('data-rating-value', '3');
  await screen.rerender(
    <form key="required">
      <Rating name="score" required />
    </form>,
  );
  const validator = () =>
    screen.container.querySelector<HTMLInputElement>('[data-form-value-validator]')!;
  expect(validator().validationMessage).toBe('점수를 선택하세요.');
  await userEvent.click(option(1));
  expect(validator().checkValidity()).toBe(true);
  await screen.rerender(
    <form key="disabled">
      <Rating name="score" disabled defaultValue={3} />
    </form>,
  );
  expect(new FormData(form()).has('score')).toBe(false);
});

test('ref and focus stay on the group, which hands focus to the checked option', async () => {
  let root: HTMLDivElement | null = null;
  const screen = await render(
    <Rating
      defaultValue={3}
      ref={(node) => {
        root = node;
      }}
      id="rating"
    />,
  );
  const group = screen.getByRole('radiogroup');
  expect(root).toBe(group.element());
  await expect.element(group).toHaveAttribute('id', 'rating');
  await userEvent.click(option(4));
  await expect
    .element(group, { message: 'the id does not follow the checked option' })
    .toHaveAttribute('id', 'rating');
  root!.focus();
  await expect.element(option(4)).toHaveFocus();
});

test('RHF stores numbers, focuses the checked option on error, marks blur, and resets', async () => {
  let methods!: UseFormReturn<{ score: number }>;
  function Form() {
    methods = useForm<{ score: number }>({ defaultValues: { score: 0 }, mode: 'onBlur' });
    return (
      <FormProvider {...methods}>
        <RHFField
          name="score"
          controlMode="value"
          registerOptions={{ min: { value: 1, message: '평점을 선택하세요' } }}
        >
          <RHFField.Label>만족도</RHFField.Label>
          <Rating step={0.5} />
          <RHFField.Error />
        </RHFField>
      </FormProvider>
    );
  }
  await render(<Form />);
  await userEvent.click(option(3.5));
  expect(methods.getValues('score')).toBe(3.5);
  methods.setError('score', { message: '오류' }, { shouldFocus: true });
  await expect.element(option(3.5)).toHaveFocus();
  (document.activeElement as HTMLElement).blur();
  await expect.poll(() => methods.getFieldState('score').isTouched).toBe(true);
  methods.reset();
  await expect.element(checkedOption()).toHaveAttribute('data-rating-value', '0');
  const onValid = vi.fn();
  await methods.handleSubmit(onValid)();
  expect(onValid).not.toHaveBeenCalled();
  await expect.element(option(0)).toHaveFocus();
});
