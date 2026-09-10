import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, waitFor } from 'storybook/test';
import { z } from 'zod';

import { Field as FormField } from '../../react-hook-form';
import { Button } from '../button';
import { Field } from '../field';

import { TextArea } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  args: {
    'aria-label': '내용',
    placeholder: '내용을 입력하세요',
    variant: 'outline',
    size: 'standard',
  },
} satisfies Meta<typeof TextArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Variants: Story = {
  render: () => (
    <div className="grid w-80 gap-4">
      {(['outline', 'filled', 'unstyled'] as const).map((variant) => (
        <Field key={variant}>
          <Field.Label>{variant}</Field.Label>
          <TextArea variant={variant} placeholder={variant} />
        </Field>
      ))}
      <TextArea aria-label="Disabled" disabled defaultValue="비활성화" />
      <TextArea aria-label="Read only" readOnly defaultValue="읽기 전용" />
      <Field invalid size="tiny">
        <Field.Label>오류</Field.Label>
        <TextArea />
        <Field.Error>내용을 확인하세요.</Field.Error>
      </Field>
    </div>
  ),
};

function GrowingExample() {
  const [value, setValue] = useState('');
  return (
    <div className="w-80">
      <Field>
        <Field.Label>메모</Field.Label>
        <TextArea
          autoResize
          minRows={2}
          maxRows={4}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setValue('첫째\n둘째\n셋째\n넷째\n다섯째\n여섯째')}
            >
              긴 내용
            </Button>
            <Button type="button" onClick={() => setValue('')}>
              비우기
            </Button>
          </div>
          <TextArea.Input />
          <output aria-label="글자 수">{value.length}자</output>
        </TextArea>
        <Field.Hint>2–4줄 자동 높이</Field.Hint>
      </Field>
    </div>
  );
}
export const AutoResize: Story = {
  render: () => <GrowingExample />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '메모' });
    const initial = input.getBoundingClientRect().height;
    await userEvent.click(canvas.getByText('메모', { selector: 'label' }));
    await expect(input).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: '긴 내용' }));
    await expect(input).toHaveValue('첫째\n둘째\n셋째\n넷째\n다섯째\n여섯째');
    await expect(input.getBoundingClientRect().height).toBeGreaterThan(initial);
    await expect(getComputedStyle(input).overflowY).toBe('auto');
    await expect(getComputedStyle(input).resize).toBe('none');
    const css = getComputedStyle(input);
    const max =
      4 * parseFloat(css.lineHeight) + parseFloat(css.paddingTop) + parseFloat(css.paddingBottom);
    await expect(input.getBoundingClientRect().height).toBeCloseTo(max, 0);
    await userEvent.click(canvas.getByRole('button', { name: '비우기' }));
    await expect(input.getBoundingClientRect().height).toBeCloseTo(initial, 0);
    await userEvent.type(input, '한글 메모');
    await expect(canvas.getByLabelText('글자 수')).toHaveTextContent('5자');
  },
};

const schema = z.object({
  description: z
    .string()
    .trim()
    .min(10, '10자 이상 작성하세요.')
    .max(200, '200자 이내로 작성하세요.'),
});
function FormExample() {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: { description: '' } });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        className="grid w-80 gap-3"
        noValidate
        onSubmit={methods.handleSubmit((values) => setResult(values.description))}
      >
        <FormField name="description" required>
          <FormField.Label>소개</FormField.Label>
          <TextArea autoResize minRows={2} maxRows={5} />
          <FormField.Hint>10–200자</FormField.Hint>
          <FormField.Error />
        </FormField>
        <Button type="submit">제출</Button>
        <Button
          type="button"
          onClick={() => {
            methods.reset();
            setResult('');
          }}
        >
          초기화
        </Button>
        <output aria-label="제출 내용">{result}</output>
      </form>
    </FormProvider>
  );
}
export const ZodForm: Story = {
  render: () => <FormExample />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '소개' });
    const initial = input.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(await canvas.findByText('10자 이상 작성하세요.')).toBeVisible();
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription('10자 이상 작성하세요.');
    await userEvent.type(
      input,
      '첫 번째 소개입니다.{enter}두 번째 줄입니다.{enter}세 번째 줄입니다.{enter}네 번째 줄입니다.',
    );
    await expect(input.getBoundingClientRect().height).toBeGreaterThan(initial);
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 내용')).toHaveTextContent('첫 번째 소개입니다.');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await expect(input).toHaveValue('');
    await waitFor(() => expect(input.getBoundingClientRect().height).toBeCloseTo(initial, 0));
    await expect(canvas.getByLabelText('제출 내용')).toBeEmptyDOMElement();
  },
};
