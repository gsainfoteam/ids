import type { ReactNode } from 'react';

import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EllipsisHorizontalIcon,
  DocumentCheckIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../button';
import { IconButton } from '../icon-button';

import { ButtonGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;
const orientations = ['horizontal', 'vertical'] as const;

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
  return <div className="flex flex-wrap items-center gap-4">{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <span className="w-20 shrink-0 text-xs text-(--ids-color-on-muted)">{children}</span>;
}

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    size: { control: 'radio', options: [...sizes] },
  },
  args: {
    orientation: 'horizontal',
    size: 'standard',
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Playground: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">취소</Button>
      <Button variant="solid">확인</Button>
    </ButtonGroup>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-10">
      <Section title="Variant × Size">
        <div className="flex flex-col gap-4">
          {sizes.map((size) => (
            <Row key={size}>
              <Label>{size}</Label>
              {variants.map((variant) => (
                <ButtonGroup key={variant} size={size}>
                  <Button variant={variant}>Archive</Button>
                  <Button variant={variant}>Report</Button>
                  <Button variant={variant}>Snooze</Button>
                </ButtonGroup>
              ))}
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Separator splits segments">
        <div className="flex flex-col gap-4">
          {variants.map((variant) => (
            <Row key={variant}>
              <Label>{variant}</Label>
              <ButtonGroup>
                <IconButton aria-label="뒤로" variant={variant} icon={<ArrowLeftIcon />} />
                <ButtonGroup.Separator />
                <Button variant={variant}>Archive</Button>
                <Button variant={variant}>Report</Button>
                <ButtonGroup.Separator />
                <Button variant={variant}>Snooze</Button>
                <IconButton
                  aria-label="더보기"
                  variant={variant}
                  icon={<EllipsisHorizontalIcon />}
                />
              </ButtonGroup>
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Orientation">
        <div className="flex items-start gap-8">
          {orientations.map((orientation) => (
            <div key={orientation} className="flex flex-col gap-2">
              <Label>{orientation}</Label>
              <ButtonGroup orientation={orientation}>
                <Button variant="outline">
                  <ArrowLeftIcon className="size-5" />
                  이전
                </Button>
                <Button variant="outline">
                  다음
                  <ArrowRightIcon className="size-5" />
                </Button>
                <ButtonGroup.Separator />
                <Button variant="outline">완료</Button>
              </ButtonGroup>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Icon only / Mixed">
        <div className="flex flex-col gap-4">
          <Row>
            <Label>icon only</Label>
            {variants.map((variant) => (
              <ButtonGroup key={variant}>
                <IconButton aria-label="이전" variant={variant} icon={<ArrowLeftIcon />} />
                <IconButton aria-label="검색" variant={variant} icon={<MagnifyingGlassIcon />} />
                <IconButton aria-label="다음" variant={variant} icon={<ArrowRightIcon />} />
              </ButtonGroup>
            ))}
          </Row>
          <Row>
            <Label>mixed</Label>
            <ButtonGroup>
              <Button variant="outline">
                <DocumentCheckIcon className="size-5" />
                저장
              </Button>
              <Button variant="outline">
                <PaperAirplaneIcon className="size-5" />
                전송
              </Button>
              <ButtonGroup.Separator />
              <IconButton aria-label="삭제" variant="outline" icon={<TrashIcon />} />
            </ButtonGroup>
          </Row>
        </div>
      </Section>

      <Section title="Disabled">
        <Row>
          <Label>all</Label>
          <ButtonGroup>
            <Button variant="outline" disabled>
              Archive
            </Button>
            <Button variant="outline" disabled>
              Report
            </Button>
            <ButtonGroup.Separator />
            <IconButton
              aria-label="더보기"
              variant="outline"
              disabled
              icon={<EllipsisHorizontalIcon />}
            />
          </ButtonGroup>
        </Row>
        <Row>
          <Label>partial</Label>
          <ButtonGroup>
            <Button variant="outline">
              <ArchiveBoxIcon className="size-5" />
              Archive
            </Button>
            <Button variant="outline" disabled>
              Report
            </Button>
            <Button variant="outline">Snooze</Button>
          </ButtonGroup>
        </Row>
      </Section>
    </div>
  ),
};
