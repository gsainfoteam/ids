import * as pc from './error-page.stories';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  ...pc.default,
  title: 'Patterns/Mobile/ErrorPage',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'mobile2', isRotated: false } },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const NotFound: Story = { ...pc.NotFound };

export const ServerError: Story = { ...pc.ServerError };

export const Maintenance: Story = { ...pc.Maintenance };
