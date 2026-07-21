import type { ReactNode } from 'react';

import { TextField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'filled', 'underline'] as const;
const sizes = ['standard', 'tiny'] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-(--ids-color-on-muted) uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    placeholder: '검색어를 입력하세요',
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-8">
      <Section title="Bare">
        <TextField placeholder="검색어를 입력하세요" />
      </Section>

      <Section title="Size">
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <TextField key={size} size={size} placeholder={`${size} field`} />
          ))}
        </div>
      </Section>

      <Section title="Variant">
        <div className="flex flex-col gap-3">
          {variants.map((variant) => (
            <TextField key={variant} variant={variant} placeholder={`${variant} field`} />
          ))}
        </div>
      </Section>

      <Section title="Disabled">
        <TextField disabled placeholder="비활성" />
      </Section>
    </div>
  ),
};
