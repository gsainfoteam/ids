import { useState } from 'react';

import { HeartIcon } from '@heroicons/react/16/solid';
import { expect, userEvent } from 'storybook/test';

import { Label } from '../label';

import { Checkbox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { variant: 'outline', size: 'standard' },
  argTypes: {
    variant: { control: 'radio', options: ['outline', 'filled'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    indeterminate: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  render: (args) => (
    <Label className="inline-flex items-center gap-2">
      <Checkbox {...args} />
      약관에 동의합니다
    </Label>
  ),
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox', { name: '약관에 동의합니다' });
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(box).toBeChecked();
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label className="inline-flex items-center gap-2">
        <Checkbox />
        미체크
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Checkbox defaultChecked />
        체크
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Checkbox indeterminate />
        일부 선택
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Checkbox invalid />
        오류
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Checkbox disabled defaultChecked />
        잠김
      </Label>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: '일부 선택' })).toBePartiallyChecked();
    await expect(canvas.getByRole('checkbox', { name: '오류' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(canvas.getByRole('checkbox', { name: '잠김' })).toBeDisabled();
  },
};

export const VariantsAndSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(['outline', 'filled'] as const).map((variant) =>
        (['standard', 'tiny'] as const).map((size) => (
          <Checkbox
            key={`${variant}-${size}`}
            variant={variant}
            size={size}
            defaultChecked
            aria-label={`${variant} ${size}`}
          />
        )),
      )}
    </div>
  ),
};

export const CustomIndicator: Story = {
  render: () => (
    <Label className="inline-flex items-center gap-2">
      <Checkbox defaultChecked>
        <Checkbox.Indicator>
          <HeartIcon />
        </Checkbox.Indicator>
      </Checkbox>
      좋아요
    </Label>
  ),
};

export const ParentChild: Story = {
  render: function ParentChild() {
    const [checked, setChecked] = useState([true, false, false]);
    const all = checked.every(Boolean);
    const some = checked.some(Boolean);

    return (
      <div className="flex flex-col gap-2">
        <Label className="inline-flex items-center gap-2">
          <Checkbox
            checked={all}
            indeterminate={some && !all}
            onChange={(next) => setChecked(checked.map(() => next))}
          />
          전체 선택
        </Label>
        <div className="flex flex-col gap-2 pl-6">
          {['JavaScript', 'TypeScript', 'Rust'].map((name, index) => (
            <Label key={name} className="inline-flex items-center gap-2">
              <Checkbox
                checked={checked[index]}
                onChange={(next) =>
                  setChecked(checked.map((value, i) => (i === index ? next : value)))
                }
              />
              {name}
            </Label>
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const parent = canvas.getByRole('checkbox', { name: '전체 선택' });
    await expect(parent).toBePartiallyChecked();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'TypeScript' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Rust' }));
    await expect(parent).toBeChecked();
    await expect(parent).not.toBePartiallyChecked();
  },
};

export const Keyboard: Story = {
  render: () => (
    <Label className="inline-flex items-center gap-2">
      <Checkbox />
      Space로 토글
    </Label>
  ),
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox');
    box.focus();
    await userEvent.keyboard(' ');
    await expect(box).toBeChecked();
  },
};
