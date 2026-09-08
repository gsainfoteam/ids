import { expect } from 'storybook/test';

import { TextField } from '../text-field';

import { Label } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: '이름', htmlFor: 'label-name' },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Playground: Story = {
  render: (args) => (
    <div className="flex max-w-xs flex-col gap-2">
      <Label {...args} />
      <TextField id={args.htmlFor} name="name" placeholder="이름을 입력하세요" />
    </div>
  ),
  play: async ({ canvas, userEvent, args }) => {
    const label = canvas.getByText(String(args.children));
    const input = canvas.getByRole('textbox', { name: String(args.children) });
    await userEvent.click(label);
    await expect(input).toHaveFocus();
    await userEvent.type(input, '인포팀');
    await expect(input).toHaveValue('인포팀');
  },
};

export const WrappingControl: Story = {
  render: () => (
    <Label className="inline-flex items-center gap-2">
      <input type="checkbox" name="notifications" />
      알림 받기
    </Label>
  ),
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: '알림 받기' });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(canvas.getByText('알림 받기'));
    await expect(checkbox).toBeChecked();
  },
};

export const DisabledControl: Story = {
  render: () => (
    <div className="flex max-w-xs flex-col gap-2">
      <Label htmlFor="disabled-name" className="text-(--ids-color-on-muted)">
        수정할 수 없는 이름
      </Label>
      <TextField id="disabled-name" disabled defaultValue="인포팀" />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '수정할 수 없는 이름' });
    await userEvent.click(canvas.getByText('수정할 수 없는 이름'));
    await expect(input).toBeDisabled();
    await expect(input).not.toHaveFocus();
  },
};
