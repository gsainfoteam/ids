import type { ReactNode } from 'react';

import {
  BellIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

import { IconButton } from '.';

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

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
  },
  args: {
    'aria-label': '검색',
    variant: 'ghost',
    size: 'standard',
    icon: <MagnifyingGlassIcon />,
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <Section title="Variant × Size">
        {sizes.map((size) => (
          <Row key={size}>
            <span className="w-16 shrink-0 text-xs text-(--ids-color-on-muted)">{size}</span>
            {variants.map((variant) => (
              <IconButton
                key={variant}
                variant={variant}
                size={size}
                aria-label={`${variant} 검색`}
                icon={<MagnifyingGlassIcon />}
              />
            ))}
          </Row>
        ))}
      </Section>

      <Section title="Disabled">
        {sizes.map((size) => (
          <Row key={size}>
            <span className="w-16 shrink-0 text-xs text-(--ids-color-on-muted)">{size}</span>
            {variants.map((variant) => (
              <IconButton
                key={variant}
                variant={variant}
                size={size}
                disabled
                aria-label={`${variant} 비활성`}
                icon={<TrashIcon />}
              />
            ))}
          </Row>
        ))}
      </Section>

      <Section title="Loading">
        <Row>
          {variants.map((variant) => (
            <IconButton
              key={variant}
              variant={variant}
              disabled
              aria-label="로딩 중"
              icon={<ArrowPathIcon className="animate-spin" />}
            />
          ))}
        </Row>
      </Section>

      <Section title="Common actions">
        <Row>
          <IconButton variant="solid" aria-label="추가" icon={<PlusIcon />} />
          <IconButton variant="soft" aria-label="좋아요" icon={<HeartIcon />} />
          <IconButton variant="outline" aria-label="알림" icon={<BellIcon />} />
          <IconButton variant="ghost" aria-label="더보기" icon={<EllipsisHorizontalIcon />} />
          <IconButton variant="ghost" aria-label="닫기" icon={<XMarkIcon />} />
        </Row>
        <Row>
          <IconButton variant="solid" size="tiny" aria-label="추가" icon={<PlusIcon />} />
          <IconButton variant="soft" size="tiny" aria-label="좋아요" icon={<HeartIcon />} />
          <IconButton variant="outline" size="tiny" aria-label="알림" icon={<BellIcon />} />
          <IconButton
            variant="ghost"
            size="tiny"
            aria-label="더보기"
            icon={<EllipsisHorizontalIcon />}
          />
        </Row>
      </Section>

      <Section title="Interactive props">
        <Row>
          <IconButton
            aria-label="좋아요 토글"
            variant={(s) => (s.hovered ? 'soft' : 'ghost')}
            icon={(s) => (s.hovered ? <HeartIconSolid /> : <HeartIcon />)}
          />
          <IconButton
            aria-label={(s) => (s.active ? '삭제' : '추가')}
            variant={(s) => (s.active ? 'solid' : 'outline')}
            className="[&_svg]:transition-transform data-active:[&_svg]:rotate-45"
            icon={<PlusIcon />}
          />
        </Row>
      </Section>
    </div>
  ),
};
