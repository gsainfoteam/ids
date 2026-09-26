import { useState } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Label } from '../label';

import { RadioGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Plan = 'free' | 'pro' | 'team';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['vertical', 'horizontal'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {
  args: { variant: 'vertical', size: 'standard' },
  render: function Playground({ variant, size, disabled }) {
    const [plan, setPlan] = useState<Plan>('free');

    return (
      <RadioGroup<Plan>
        variant={variant}
        size={size}
        disabled={disabled}
        value={plan}
        onChange={setPlan}
        aria-label="구독 플랜"
      >
        {({ Item }) => (
          <>
            <Label className="inline-flex items-center gap-2">
              <Item value="free" />
              무료
            </Label>
            <Label className="inline-flex items-center gap-2">
              <Item value="pro" />
              Pro
            </Label>
            <Label className="inline-flex items-center gap-2">
              <Item value="team" />
              Team
            </Label>
          </>
        )}
      </RadioGroup>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radiogroup', { name: '구독 플랜' })).toBeInTheDocument();
    await expect(canvas.getByRole('radio', { name: '무료' })).toBeChecked();

    await userEvent.click(canvas.getByRole('radio', { name: 'Pro' }));
    await expect(canvas.getByRole('radio', { name: 'Pro' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: '무료' })).not.toBeChecked();
  },
};

export const Horizontal: Story = {
  render: function Horizontal() {
    const [size, setSize] = useState('m');

    return (
      <RadioGroup variant="horizontal" value={size} onChange={setSize} aria-label="사이즈">
        {({ Item }) =>
          ['s', 'm', 'l', 'xl'].map((option) => (
            <Label key={option} className="inline-flex items-center gap-2">
              <Item value={option} />
              {option.toUpperCase()}
            </Label>
          ))
        }
      </RadioGroup>
    );
  },
};

/** 화살표 키로 항목을 옮기면 곧바로 선택된다. 같은 name을 공유하는 native radio의 기본 동작이다. */
export const Keyboard: Story = {
  render: function Keyboard() {
    const [plan, setPlan] = useState<Plan>('free');

    return (
      <RadioGroup<Plan> value={plan} onChange={setPlan} aria-label="플랜">
        {({ Item }) => (
          <>
            <Label className="inline-flex items-center gap-2">
              <Item value="free" />
              무료
            </Label>
            <Label className="inline-flex items-center gap-2">
              <Item value="pro" />
              Pro
            </Label>
            <Label className="inline-flex items-center gap-2">
              <Item value="team" />
              Team
            </Label>
          </>
        )}
      </RadioGroup>
    );
  },
  play: async ({ canvas }) => {
    canvas.getByRole('radio', { name: '무료' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Pro' })).toBeChecked();
  },
};

export const DisabledItem: Story = {
  render: function DisabledItem() {
    const [plan, setPlan] = useState<Plan>('free');

    return (
      <RadioGroup<Plan> value={plan} onChange={setPlan} aria-label="플랜">
        {({ Item }) => (
          <>
            <Label className="inline-flex items-center gap-2">
              <Item value="free" />
              무료
            </Label>
            <Label className="inline-flex items-center gap-2">
              <Item value="pro" />
              Pro
            </Label>
            <Label className="inline-flex items-center gap-2">
              <Item value="team" disabled />
              Team (문의)
            </Label>
          </>
        )}
      </RadioGroup>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Team (문의)' })).toBeDisabled();
  },
};

export const RichOptions: Story = {
  render: function RichOptions() {
    const [plan, setPlan] = useState<Plan>('pro');
    const options = [
      { value: 'free', label: '무료', desc: '개인 사용' },
      { value: 'pro', label: 'Pro', desc: '소규모 팀' },
      { value: 'team', label: 'Team', desc: '대규모 조직' },
    ] as const;

    return (
      <RadioGroup<Plan> value={plan} onChange={setPlan} aria-label="플랜">
        {({ Item }) =>
          options.map((option) => (
            <Label key={option.value} className="inline-flex items-start gap-2">
              <Item value={option.value} />
              <span className="flex flex-col">
                <span className="text-body-b3-medium">{option.label}</span>
                <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                  {option.desc}
                </span>
              </span>
            </Label>
          ))
        }
      </RadioGroup>
    );
  },
};
