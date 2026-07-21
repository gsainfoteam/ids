import type { ReactNode } from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CheckIcon,
  CircleNotchIcon,
  DownloadSimpleIcon,
  FloppyDiskIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import { compact } from 'es-toolkit';

import { Button } from '.';

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

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
  },
  args: {
    children: '바로가기',
    variant: 'solid',
    size: 'standard',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Gallery: Story = {
  name: 'Gallery',
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <Section title="Variant × Size">
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <Row key={size}>
              <span className="w-16 shrink-0 text-xs text-(--ids-color-on-muted)">{size}</span>
              {variants.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Disabled">
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <Row key={size}>
              <span className="w-16 shrink-0 text-xs text-(--ids-color-on-muted)">{size}</span>
              {variants.map((variant) => (
                <Button key={variant} variant={variant} size={size} disabled>
                  {variant}
                </Button>
              ))}
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Loading">
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <Row key={size}>
              <span className="w-16 shrink-0 text-xs text-(--ids-color-on-muted)">{size}</span>
              {variants.map((variant) => (
                <Button key={variant} variant={variant} size={size} disabled>
                  <CircleNotchIcon
                    className={size === 'tiny' ? 'size-4 animate-spin' : 'size-5 animate-spin'}
                    weight="bold"
                  />
                  로딩
                </Button>
              ))}
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Icons">
        <Row>
          <Button>
            <PlusIcon className="size-5" weight="bold" />
            추가
          </Button>
          <Button variant="soft">
            보내기
            <PaperPlaneTiltIcon className="size-5" weight="bold" />
          </Button>
          <Button variant="outline">
            <MagnifyingGlassIcon className="size-5" weight="bold" />
            검색
            <ArrowRightIcon className="size-5" weight="bold" />
          </Button>
          <Button variant="ghost">
            더보기
            <CaretDownIcon className="size-5" weight="bold" />
          </Button>
        </Row>
        <Row>
          <Button size="tiny">
            <DownloadSimpleIcon className="size-4" weight="bold" />
            다운로드
          </Button>
          <Button variant="soft" size="tiny">
            <FloppyDiskIcon className="size-4" weight="bold" />
            저장
          </Button>
          <Button variant="outline" size="tiny">
            <CheckIcon className="size-4" weight="bold" />
            완료
          </Button>
          <Button variant="ghost" size="tiny">
            <TrashIcon className="size-4" weight="bold" />
            삭제
          </Button>
        </Row>
        <Row>
          <Button aria-label="추가">
            <PlusIcon className="size-5" weight="bold" />
          </Button>
          <Button variant="soft" aria-label="닫기">
            <XIcon className="size-5" weight="bold" />
          </Button>
          <Button variant="outline" size="tiny" aria-label="검색">
            <MagnifyingGlassIcon className="size-4" weight="bold" />
          </Button>
          <Button variant="ghost" size="tiny" aria-label="삭제">
            <TrashIcon className="size-4" weight="bold" />
          </Button>
        </Row>
      </Section>

      <Section title="Width & layout">
        <div className="flex max-w-sm flex-col gap-2">
          <Button className="w-full">전체 너비 확인</Button>
          <Button variant="outline" className="w-full justify-between">
            <MagnifyingGlassIcon className="size-5" weight="bold" />
            필터
            <CaretDownIcon className="size-5" weight="bold" />
          </Button>
          <Row>
            <Button variant="ghost" className="flex-1">
              <ArrowLeftIcon className="size-5" weight="bold" />
              이전
            </Button>
            <Button className="flex-1">
              다음
              <ArrowRightIcon className="size-5" weight="bold" />
            </Button>
          </Row>
        </div>
      </Section>

      <Section title="Composition">
        <Row>
          <Button variant="ghost">취소</Button>
          <Button variant="soft">임시저장</Button>
          <Button>
            <CheckIcon className="size-5" weight="bold" />
            게시
          </Button>
        </Row>
        <Row>
          <Button variant="outline" size="tiny">
            거절
          </Button>
          <Button size="tiny">수락</Button>
        </Row>
        <Row>
          <Button variant="ghost" size="tiny">
            <XIcon className="size-4" weight="bold" />
            닫기
          </Button>
          <Button variant="soft" size="tiny" disabled>
            <CircleNotchIcon className="size-4 animate-spin" weight="bold" />
            업로드 중
          </Button>
          <Button size="tiny">
            <PaperPlaneTiltIcon className="size-4" weight="bold" />
            전송
          </Button>
        </Row>
      </Section>

      <Section title="Interactive props">
        <Row>
          <Button
            variant={(s) => (s.hovered ? 'solid' : 'outline')}
            title={(s) => (s.hovered ? 'hovered → solid' : 'idle → outline')}
          >
            {(s) => (s.hovered ? '호버됨' : '호버해 보세요')}
          </Button>
          <Button
            variant="soft"
            size={(s) => (s.active ? 'tiny' : 'standard')}
            style={(s) => (s.active ? { letterSpacing: '0.08em' } : undefined)}
          >
            {(s) => (s.active ? 'pressed' : '눌러 보세요')}
          </Button>
          <Button
            variant="ghost"
            className={(s) =>
              s.focusVisible ? 'ring-2 ring-(--ids-color-primary) ring-offset-2' : undefined
            }
          >
            {(s) => (s.focusVisible ? 'focus-visible' : 'Tab으로 포커스')}
          </Button>
        </Row>
        <Row>
          <Button
            variant={(s) => (s.active ? 'solid' : s.hovered ? 'soft' : 'outline')}
            size="tiny"
          >
            {(s) =>
              compact([s.hovered && 'hovered', s.active && 'active', s.focused && 'focused']).join(
                ' · ',
              ) || 'idle'
            }
          </Button>
          <Button
            variant="outline"
            size="tiny"
            className="min-w-36 justify-between"
            children={(s) => (
              <>
                <MagnifyingGlassIcon className="size-4" weight="bold" />
                <span className="font-mono text-[10px]">{s.hovered ? 'hot' : 'cold'}</span>
                <ArrowRightIcon
                  className={`size-4 transition-transform ${s.hovered ? 'translate-x-0.5' : ''}`}
                  weight="bold"
                />
              </>
            )}
          />
        </Row>
      </Section>
    </div>
  ),
};
