import { expect } from 'storybook/test';

import { Field } from '../field';

import { Rating } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = { title: 'Components/Rating', component: Rating, tags: ['autodocs'] } satisfies Meta<
  typeof Rating
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const HalfSteps: Story = {
  render: () => (
    <Field>
      <Field.Label>만족도</Field.Label>
      <Rating step={0.5} defaultValue={2.5} />
      <Field.Hint>방향키로 반 점씩 선택하세요.</Field.Hint>
    </Field>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '5점 만점에 3.5점' }));
    await expect(canvas.getByRole('radio', { name: '5점 만점에 3.5점' })).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '5점 만점에 4점' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('radio', { name: '5점 만점에 0점' })).toBeChecked();
  },
};
export const Variants: Story = {
  render: () => (
    <div className="grid gap-6">
      <Rating variant="heart" defaultValue={3} aria-label="하트" />
      <Rating variant="circle" size="tiny" defaultValue={2} aria-label="원" />
      <Rating value={4.5} step={0.5} selectionMode="none" aria-label="평균" />
      <Rating disabled value={2} aria-label="비활성" />
      <Rating readOnly value={3} aria-label="읽기 전용" />
    </div>
  ),
};
