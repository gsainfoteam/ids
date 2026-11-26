import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Questionnaire } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const radio = (name: string) => page.getByRole('radio', { name, exact: true });
const button = (name: string) => page.getByRole('button', { name, exact: true });

const twoQuestions = (props: Partial<Questionnaire.Props> = {}) => (
  <Questionnaire {...props}>
    <Questionnaire.Question name="tone" required>
      어떤 말투로 쓸까요?
      <Questionnaire.Description>나중에 바꿀 수 있어요.</Questionnaire.Description>
      <Questionnaire.Option value="formal">격식</Questionnaire.Option>
      <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
      <Questionnaire.Other aria-label="직접 입력" />
    </Questionnaire.Question>
    <Questionnaire.Question name="topics" selectionMode="multiple">
      무엇을 넣을까요?
      <Questionnaire.Option value="summary">요약</Questionnaire.Option>
      <Questionnaire.Option value="todo">할 일</Questionnaire.Option>
      <Questionnaire.Other aria-label="직접 입력" />
    </Questionnaire.Question>
    <Questionnaire.Skip>건너뛰기</Questionnaire.Skip>
    <Questionnaire.Submit>보내기</Questionnaire.Submit>
  </Questionnaire>
);

test('the server HTML holds every question, with only the first one shown', () => {
  const html = parse(renderToString(twoQuestions()));
  const form = html.querySelector('form')!;
  const [tone, topics] = html.querySelectorAll('fieldset');

  expect(form).toHaveAttribute('data-questionnaire');
  expect(tone).toHaveAttribute('role', 'radiogroup');
  expect(tone).not.toHaveAttribute('hidden');
  expect(topics).toHaveAttribute('hidden');
  expect(tone.querySelector('legend')).toHaveTextContent('어떤 말투로 쓸까요?');
  expect(tone.getAttribute('aria-labelledby')).toBe(tone.querySelector('legend')!.id);
  expect(tone.getAttribute('aria-describedby')).toBe(tone.querySelector('p')!.id);
  expect(html.querySelector('[role=progressbar]')).toHaveAttribute('aria-valuetext', '질문 1 / 2');
});

test('a question is named by its legend and described by its description', async () => {
  await render(twoQuestions());

  await expect
    .element(page.getByRole('radiogroup', { name: '어떤 말투로 쓸까요?' }))
    .toHaveAccessibleDescription('나중에 바꿀 수 있어요.');
  await expect.element(page.getByRole('group', { name: '질문 이동' })).toBeVisible();
});

test('the next button stays off until a required question is answered, and Enter waits too', async () => {
  await render(twoQuestions());

  await expect.element(button('다음')).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(page.getByRole('textbox', { name: '직접 입력' }));
  await userEvent.keyboard('{Enter}');
  await expect.element(radio('격식')).toBeVisible();

  await userEvent.keyboard('반말로');
  await expect.element(button('다음')).not.toHaveAttribute('aria-disabled');
});

test('FormData holds the answers of hidden questions and the typed answer under the question name', async () => {
  const screen = await render(twoQuestions());
  const form = screen.container.querySelector('form')!;

  await userEvent.click(radio('편하게'));
  await userEvent.click(button('다음'));
  await userEvent.click(page.getByRole('checkbox', { name: '요약' }));
  await userEvent.fill(page.getByRole('textbox', { name: '직접 입력' }), '회의 일정');

  const data = new FormData(form);
  expect(data.get('tone')).toBe('casual');
  expect(data.getAll('topics')).toEqual(['summary', '회의 일정']);
});

test('defaultValue puts listed values on the options and the rest in Other', async () => {
  const onComplete = vi.fn();
  await render(
    twoQuestions({ onComplete, defaultValue: { tone: '반말로', topics: ['todo', '메모'] } }),
  );

  await expect.element(radio('격식')).not.toBeChecked();
  await expect.element(page.getByRole('textbox', { name: '직접 입력' })).toHaveValue('반말로');
  await userEvent.click(button('다음'));
  await expect.element(page.getByRole('checkbox', { name: '할 일' })).toBeChecked();
  await expect.element(page.getByRole('textbox', { name: '직접 입력' })).toHaveValue('메모');

  await userEvent.click(button('보내기'));
  expect(onComplete).toHaveBeenCalledWith({ tone: '반말로', topics: ['todo', '메모'] });
});

test('skipping the last question that is not required completes and submits without its answer', async () => {
  const onComplete = vi.fn();
  const submitted: FormData[] = [];
  await render(
    twoQuestions({
      onComplete,
      onSubmit: (event) => submitted.push(new FormData(event.currentTarget)),
      defaultValue: { tone: 'formal', topics: ['todo'] },
    }),
  );

  await userEvent.click(button('다음'));
  await userEvent.click(button('건너뛰기'));

  expect(onComplete).toHaveBeenCalledOnce();
  expect(onComplete).toHaveBeenCalledWith({ tone: 'formal' });
  expect(submitted).toHaveLength(1);
  expect(submitted[0].get('tone')).toBe('formal');
  expect(submitted[0].getAll('topics')).toEqual([]);
});

test('with advance="select" a pick moves on, an arrow key only moves the choice', async () => {
  const onComplete = vi.fn();
  await render(
    <Questionnaire advance="select" onComplete={onComplete}>
      <Questionnaire.Question name="size" required>
        몇 칸을 쓸까요?
        <Questionnaire.Option value="one">한 칸</Questionnaire.Option>
        <Questionnaire.Option value="two">두 칸</Questionnaire.Option>
      </Questionnaire.Question>
      <Questionnaire.Question name="people" required>
        몇 명인가요?
        <Questionnaire.Option value="few">4명 이하</Questionnaire.Option>
        <Questionnaire.Option value="many">5명 이상</Questionnaire.Option>
      </Questionnaire.Question>
    </Questionnaire>,
  );

  await expect.element(button('다음')).not.toBeInTheDocument();
  await userEvent.click(radio('두 칸'));
  await expect.element(radio('4명 이하')).toHaveFocus();

  await userEvent.keyboard('{ArrowDown}');
  await expect.element(radio('5명 이상')).toBeChecked();
  expect(onComplete).not.toHaveBeenCalled();

  await userEvent.keyboard('{Enter}');
  expect(onComplete).toHaveBeenCalledWith({ size: 'two', people: 'many' });
});

test('toggle options draw no radio, join FormData and move on with advance="select"', async () => {
  const onComplete = vi.fn();
  const screen = await render(
    <Questionnaire advance="select" onComplete={onComplete}>
      <Questionnaire.Question name="size" variant="toggle" orientation="horizontal" required>
        몇 칸을 쓸까요?
        <Questionnaire.Option value="one">한 칸</Questionnaire.Option>
        <Questionnaire.Option value="two">두 칸</Questionnaire.Option>
      </Questionnaire.Question>
      <Questionnaire.Question name="people" variant="toggle" orientation="horizontal" required>
        몇 명인가요?
        <Questionnaire.Option value="few">4명 이하</Questionnaire.Option>
        <Questionnaire.Option value="many">5명 이상</Questionnaire.Option>
      </Questionnaire.Question>
    </Questionnaire>,
  );
  const form = screen.container.querySelector('form')!;

  expect(form.querySelector('input[type=radio]')).toBeNull();
  await expect
    .element(page.getByRole('radiogroup', { name: '몇 칸을 쓸까요?' }))
    .toBeInTheDocument();

  await userEvent.click(radio('두 칸'));
  await expect.element(radio('4명 이하')).toHaveFocus();
  expect(new FormData(form).get('size')).toBe('two');

  await userEvent.keyboard('{ArrowRight}');
  await expect.element(radio('5명 이상')).toBeChecked();
  expect(onComplete).not.toHaveBeenCalled();

  await userEvent.keyboard('{Enter}');
  expect(onComplete).toHaveBeenCalledWith({ size: 'two', people: 'many' });
});

test('a single question shows no progress bar', async () => {
  await render(
    <Questionnaire>
      <Questionnaire.Question name="tone" required>
        어떤 말투로 쓸까요?
        <Questionnaire.Option value="formal">격식</Questionnaire.Option>
      </Questionnaire.Question>
      <Questionnaire.Submit>보내기</Questionnaire.Submit>
    </Questionnaire>,
  );

  await expect.element(page.getByRole('progressbar')).not.toBeInTheDocument();
  await expect.element(button('보내기')).toBeInTheDocument();
});

test('without app text next, submit and previous are icons, and skip is left out', async () => {
  await render(
    <Questionnaire>
      <Questionnaire.Question name="tone" required>
        어떤 말투로 쓸까요?
        <Questionnaire.Option value="formal">격식</Questionnaire.Option>
      </Questionnaire.Question>
      <Questionnaire.Question name="length">
        얼마나 길게 쓸까요?
        <Questionnaire.Option value="short">짧게</Questionnaire.Option>
      </Questionnaire.Question>
    </Questionnaire>,
  );

  const navigation = page.getByRole('group', { name: '질문 이동' });
  await expect.element(button('다음')).toHaveTextContent('');
  await userEvent.click(radio('격식'));
  await userEvent.click(button('다음'));
  await expect.element(button('이전')).toHaveTextContent('');
  await expect.element(button('다음')).toHaveAttribute('type', 'submit');
  expect(navigation.getByRole('button').elements()).toHaveLength(2);
});

test('a function child of Questionnaire.Submit names the next and the last button', async () => {
  const onComplete = vi.fn();
  await render(
    <Questionnaire onComplete={onComplete}>
      <Questionnaire.Submit className="submit">
        {({ last }) => (last ? '계획 세우기' : '계속')}
      </Questionnaire.Submit>
      <Questionnaire.Question name="tone" required>
        어떤 말투로 쓸까요?
        <Questionnaire.Option value="formal">격식</Questionnaire.Option>
      </Questionnaire.Question>
      <Questionnaire.Question name="length" required>
        얼마나 길게 쓸까요?
        <Questionnaire.Option value="short">짧게</Questionnaire.Option>
      </Questionnaire.Question>
    </Questionnaire>,
  );

  const navigation = page.getByRole('group', { name: '질문 이동' });
  await expect.element(navigation.getByRole('button', { name: '계속' })).toHaveClass('submit');
  await userEvent.click(radio('격식'));
  await userEvent.click(button('계속'));
  await userEvent.click(radio('짧게'));
  await expect.element(navigation.getByRole('button', { name: '계획 세우기' })).toBeVisible();
  await userEvent.click(button('계획 세우기'));
  expect(onComplete).toHaveBeenCalledWith({ tone: 'formal', length: 'short' });
});
