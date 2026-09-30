import * as pc from './split.stories';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  ...pc.default,
  title: 'Blocks/Hero/Split',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'mobile2', isRotated: false } },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...pc.PC };
