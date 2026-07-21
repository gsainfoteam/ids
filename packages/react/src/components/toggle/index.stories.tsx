import { useState, type ReactNode } from 'react';

import { CheckIcon, StarIcon } from '@phosphor-icons/react';

import { Toggle } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
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

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
    pressed: { control: 'boolean' },
  },
  args: {
    children: '필터',
    variant: 'outline',
    size: 'standard',
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {
  args: { defaultPressed: false },
};

export const Gallery: Story = {
  render: () => {
    const [filters, setFilters] = useState({ hot: true, new: false, free: false });

    return (
      <div className="flex max-w-3xl flex-col gap-8">
        <Section title="Variant × Size (defaultPressed=false)">
          {sizes.map((size) => (
            <Row key={size}>
              <span className="w-16 shrink-0 text-xs text-(--ids-color-on-muted)">{size}</span>
              {variants.map((variant) => (
                <Toggle key={variant} variant={variant} size={size} defaultPressed={false}>
                  {variant}
                </Toggle>
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Pressed on">
          <Row>
            {variants.map((variant) => (
              <Toggle key={variant} variant={variant} defaultPressed>
                {variant}
              </Toggle>
            ))}
          </Row>
        </Section>

        <Section title="With icons">
          <Row>
            <Toggle defaultPressed>
              <CheckIcon className="size-5" weight="bold" />
              선택됨
            </Toggle>
            <Toggle variant="soft" defaultPressed={false}>
              <StarIcon className="size-5" weight="bold" />
              즐겨찾기
            </Toggle>
            <Toggle variant="ghost" size="tiny" defaultPressed>
              ON
            </Toggle>
          </Row>
        </Section>

        <Section title="Controlled group">
          <Row>
            {(
              [
                ['hot', '인기'],
                ['new', '최신'],
                ['free', '무료'],
              ] as const
            ).map(([key, label]) => (
              <Toggle
                key={key}
                pressed={filters[key]}
                onPressedChange={(next) => setFilters((f) => ({ ...f, [key]: next }))}
              >
                {label}
              </Toggle>
            ))}
          </Row>
          <p className="font-mono text-xs text-(--ids-color-on-muted)">{JSON.stringify(filters)}</p>
        </Section>

        <Section title="Disabled">
          <Row>
            <Toggle disabled>Off</Toggle>
            <Toggle disabled defaultPressed>
              On
            </Toggle>
          </Row>
        </Section>

        <Section title="Interactive props">
          <Row>
            <Toggle
              variant={(s) => (s.pressed ? 'solid' : 'outline')}
              children={(s) => (s.pressed ? '켜짐' : '꺼짐')}
            />
          </Row>
        </Section>
      </div>
    );
  },
};
