import { useState } from 'react';

import { Checkbox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <label className="text-label flex items-center gap-2">
        <Checkbox checked={checked} onChange={setChecked} aria-label="정원이 가득 찬 팟 숨기기" />
        정원이 가득 찬 팟 숨기기
      </label>
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox defaultChecked aria-label="checked" />
      <Checkbox indeterminate aria-label="mixed" />
      <Checkbox disabled defaultChecked aria-label="disabled" />
      <Checkbox invalid aria-label="invalid" />
    </div>
  ),
};
