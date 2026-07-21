import { useState, type ReactNode } from 'react';

import { BellIcon, HeartIcon, ListIcon, SquaresFourIcon, StarIcon } from '@phosphor-icons/react';

import { IconToggle } from '.';

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

const meta: Meta<typeof IconToggle> = {
  title: 'Components/IconToggle',
  component: IconToggle,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
    pressed: { control: 'boolean' },
  },
  args: {
    'aria-label': '즐겨찾기',
    variant: 'ghost',
    size: 'standard',
    icon: <StarIcon weight="bold" />,
  },
};

export default meta;
type Story = StoryObj<typeof IconToggle>;

export const Playground: Story = {
  args: { defaultPressed: false },
};

export const Gallery: Story = {
  render: () => {
    const [liked, setLiked] = useState(false);
    const [layout, setLayout] = useState<'list' | 'grid'>('list');

    return (
      <div className="flex max-w-3xl flex-col gap-8">
        <Section title="Variant × Size">
          {sizes.map((size) => (
            <Row key={size}>
              <span className="w-16 shrink-0 text-xs text-(--ids-color-on-muted)">{size}</span>
              {variants.map((variant) => (
                <IconToggle
                  key={variant}
                  variant={variant}
                  size={size}
                  aria-label={`${variant} 토글`}
                  icon={<StarIcon weight="bold" />}
                />
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Pressed on">
          <Row>
            {variants.map((variant) => (
              <IconToggle
                key={variant}
                variant={variant}
                defaultPressed
                aria-label={`${variant} on`}
                icon={<StarIcon weight="fill" />}
              />
            ))}
          </Row>
        </Section>

        <Section title="Controlled">
          <Row>
            <IconToggle
              aria-label="좋아요"
              pressed={liked}
              onPressedChange={setLiked}
              variant={(s) => (s.pressed ? 'soft' : 'ghost')}
              icon={(s) => <HeartIcon weight={s.pressed ? 'fill' : 'bold'} />}
            />
            <IconToggle
              aria-label="알림"
              defaultPressed
              variant="outline"
              icon={<BellIcon weight="bold" />}
            />
          </Row>
        </Section>

        <Section title="Layout switch">
          <Row>
            <IconToggle
              aria-label="리스트"
              pressed={layout === 'list'}
              onPressedChange={(on) => on && setLayout('list')}
              icon={<ListIcon weight="bold" />}
            />
            <IconToggle
              aria-label="그리드"
              pressed={layout === 'grid'}
              onPressedChange={(on) => on && setLayout('grid')}
              icon={<SquaresFourIcon weight="bold" />}
            />
          </Row>
          <p className="text-xs text-(--ids-color-on-muted)">layout: {layout}</p>
        </Section>

        <Section title="Disabled">
          <Row>
            <IconToggle disabled aria-label="off" icon={<StarIcon weight="bold" />} />
            <IconToggle disabled defaultPressed aria-label="on" icon={<StarIcon weight="fill" />} />
          </Row>
        </Section>
      </div>
    );
  },
};
