import { useState } from 'react';

import { FaceFrownIcon, FaceSmileIcon, FireIcon, HeartIcon } from '@heroicons/react/24/solid';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Field } from '../field';

import { Rating } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const steps = [1, 0.5] as const;

const meta = {
  title: 'Form/Rating',
  component: Rating,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: sizes },
    step: { control: 'radio', options: steps },
    selectionMode: { control: 'radio', options: ['single', 'none'] },
    max: { control: { type: 'number', min: 1, max: 10 } },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    'aria-label': '만족도',
    defaultValue: 3,
    onValueChange: fn(),
    onHover: fn(),
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

const option = (canvasElement: HTMLElement, value: number) =>
  canvasElement.querySelector<HTMLButtonElement>(`[data-rating-value="${value}"]`)!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Size × Step">
        <Showcase.Matrix
          rows={sizes}
          columns={steps.map(String) as ['1', '0.5']}
          render={(size, step) => (
            <Rating
              size={size}
              step={Number(step) as 1 | 0.5}
              defaultValue={step === '1' ? 3 : 3.5}
              aria-label={`${size} ${step}`}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="display only">
          <Rating selectionMode="none" value={4.5} step={0.5} aria-label="평균 평점" />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <Rating invalid defaultValue={0} aria-label="오류" />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Rating disabled defaultValue={2} aria-label="비활성" />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <Rating readOnly defaultValue={4} aria-label="읽기 전용" />
        </Showcase.Row>
        <Showcase.Row label="max 10">
          <Rating max={10} size="tiny" defaultValue={7} aria-label="10점 만점" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Glyphs" description="모양은 Rating.Item으로 바꿉니다.">
        <Showcase.Row label="heart">
          <Rating
            defaultValue={3}
            aria-label="하트"
            className="[--rating-accent:var(--ids-color-danger)]"
          >
            <Rating.Item>
              <HeartIcon />
            </Rating.Item>
          </Rating>
        </Showcase.Row>
        <Showcase.Row label="circle">
          <Rating defaultValue={2} size="tiny" aria-label="점">
            <Rating.Item>
              <span className="block size-full scale-75 rounded-full bg-current" />
            </Rating.Item>
          </Rating>
        </Showcase.Row>
        <Showcase.Row label="per index">
          <Rating max={3} defaultValue={2} aria-label="난이도">
            <Rating.Item>
              <FireIcon />
            </Rating.Item>
            <Rating.Item index={0}>
              <FaceSmileIcon />
            </Rating.Item>
            <Rating.Item index={2}>
              <FaceFrownIcon />
            </Rating.Item>
          </Rating>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl">
            <Rating step={0.5} defaultValue={2.5} aria-label="오른쪽에서" />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const HalfSteps: Story = {
  render: () => (
    <Field>
      <Field.Label>만족도</Field.Label>
      <Rating step={0.5} defaultValue={2.5} />
      <Field.Hint>방향키로 반 점씩 고릅니다.</Field.Hint>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`step={0.5}` 면 별의 앞쪽 절반이 .5점, 뒤쪽 절반이 1점입니다. 방향키는 반 점씩, 숫자 키는 그 점수로, Home과 0은 0점으로 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '5점 만점에 3.5점' }));
    await expect(canvas.getByRole('radio', { name: '5점 만점에 3.5점' })).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '5점 만점에 4점' })).toHaveFocus();
    await userEvent.keyboard('2');
    await expect(canvas.getByRole('radio', { name: '5점 만점에 2점' })).toBeChecked();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('radio', { name: '5점 만점에 0점' })).toBeChecked();
  },
};

export const HoverPreview: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '마우스를 올리면 그 점수까지 미리 채우고 `onHover` 로 알립니다. 값은 눌러야 바뀝니다. 터치는 누르는 순간 고릅니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const root = canvasElement.querySelector('[data-rating]')!;
    await userEvent.hover(option(canvasElement, 5));
    await expect(args.onHover).toHaveBeenLastCalledWith(5);
    await expect(root.querySelectorAll('[data-state=full]')).toHaveLength(5);
    await expect(root).toHaveAttribute('data-previewing');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.unhover(root);
    await expect(args.onHover).toHaveBeenLastCalledWith(null);
    await expect(root.querySelectorAll('[data-state=full]')).toHaveLength(3);
  },
};

export const NativeForm: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    return (
      <form
        className="flex flex-col items-start gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
        }}
      >
        <Field required>
          <Field.Label>평점</Field.Label>
          <Rating name="score" />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">제출</Button>
          <Button type="reset" variant="outline">
            초기화
          </Button>
        </div>
        <output aria-label="제출 결과" className="text-body-b3-regular font-mono">
          {submitted}
        </output>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`name` 을 주면 hidden input으로 제출합니다. 0점은 고르지 않은 것이라 항목이 없고, `required` 면 브라우저가 "점수를 선택하세요." 로 제출을 막습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const validator = canvasElement.querySelector<HTMLInputElement>('[data-form-value-validator]')!;
    await expect(validator.validationMessage).toBe('점수를 선택하세요.');
    await userEvent.click(canvas.getByRole('radio', { name: '5점 만점에 4점' }));
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('[["score","4"]]');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: '5점 만점에 0점' })).toBeChecked(),
    );
  },
};

export const ReactHookForm: Story = {
  render: function Render() {
    const methods = useForm({ defaultValues: { score: 0 } });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          noValidate
          className="flex flex-col items-start gap-4"
          onSubmit={methods.handleSubmit((values) => setResult(`점수: ${values.score}`))}
        >
          <FormField
            name="score"
            controlMode="value"
            registerOptions={{ min: { value: 1, message: '점수를 고르세요.' } }}
          >
            <FormField.Label>만족도</FormField.Label>
            <Rating step={0.5} />
            <FormField.Error />
          </FormField>
          <Button type="submit">보내기</Button>
          <output aria-label="보낸 결과">{result}</output>
        </form>
      </FormProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`controlMode="value"` 로 숫자가 그대로 연결됩니다. 오류가 나면 선택된 항목(처음엔 0점)으로 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '보내기' }));
    await expect(await canvas.findByText('점수를 고르세요.')).toBeVisible();
    await expect(canvas.getByRole('radio', { name: '5점 만점에 0점' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('radio', { name: '5점 만점에 3.5점' }));
    await userEvent.click(canvas.getByRole('button', { name: '보내기' }));
    await expect(canvas.getByLabelText('보낸 결과')).toHaveTextContent('점수: 3.5');
  },
};

export const DisplayOnly: Story = {
  args: { selectionMode: 'none', value: 4.5, step: 0.5, 'aria-label': '평균 평점' },
  parameters: {
    docs: {
      description: {
        story:
          '`selectionMode="none"` 은 조작할 수 없는 그림입니다. 스크린 리더에는 "평균 평점: 5점 만점에 4.5점" 한 번으로 읽히고 Tab이 멈추지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('img')).toHaveAccessibleName('평균 평점: 5점 만점에 4.5점');
    await expect(canvasElement.querySelectorAll('button')).toHaveLength(0);
  },
};
