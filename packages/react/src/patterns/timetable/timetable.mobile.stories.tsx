import * as pc from './timetable.stories';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  ...pc.default,
  title: 'Patterns/Mobile/Timetable',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'mobile2', isRotated: false } },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { ...pc.Default };
