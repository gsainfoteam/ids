import {
  ArrowUturnLeftIcon,
  CheckIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  SparklesIcon,
} from '@heroicons/react/16/solid';
import { expect, userEvent } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Accordion } from '../../data/accordion';

import { Marker } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['default', 'underline', 'separator'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Feedback/Marker',
  component: Marker,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    pending: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { variant: 'default', size: 'standard', pending: false, children: '파일 4개를 읽었어요' },
} satisfies Meta<typeof Marker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-80">
      <Marker {...args} />
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-56">
              <Marker variant={variant} size={size}>
                {variant !== 'separator' && <GlobeAltIcon />}
                {variant === 'separator' ? '오늘' : '웹 검색 3건'}
              </Marker>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Pending"
        description="아이콘 자리에 Spinner가 서고 글자가 반짝입니다. 움직임 줄이기 설정이면 멈춥니다."
      >
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <div className="w-72">
              <Marker variant={variant} pending>
                {variant === 'separator' ? '대화를 정리하는 중' : '생각하는 중'}
              </Marker>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="Content">
        <Showcase.Row label="icon">
          <div className="w-72">
            <Marker>
              <CheckIcon />
              테스트 12개를 통과했어요
            </Marker>
          </div>
        </Showcase.Row>
        <Showcase.Row label="date">
          <div className="w-72">
            <Marker variant="separator">
              <time dateTime="2026-10-27">10월 27일</time>
            </Marker>
          </div>
        </Showcase.Row>
        <Showcase.Row label="link in text">
          <div className="w-72">
            <Marker>
              <DocumentTextIcon />
              <span>
                <a href="#notes">구현 메모</a>를 열었어요
              </span>
            </Marker>
          </div>
        </Showcase.Row>
        <Showcase.Row label="long">
          <div className="w-56">
            <Marker variant="separator" size="tiny">
              대화가 길어져 앞부분을 요약해 두었어요
            </Marker>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="asChild" description="줄 전체가 링크나 버튼이 됩니다.">
        <Showcase.Row label="a">
          <div className="w-72">
            <Marker asChild>
              <a href="#pull-request">풀 리퀘스트 보기</a>
            </Marker>
          </div>
        </Showcase.Row>
        <Showcase.Row label="button">
          <div className="w-72">
            <Marker asChild>
              <button type="button">
                <ArrowUturnLeftIcon />이 변경 되돌리기
              </button>
            </Marker>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Pending: Story = {
  render: () => (
    <div className="w-72">
      <Marker pending>생각하는 중</Marker>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '진행 중인 줄은 `role="status"` 라서 글자가 바뀌면 스크린 리더가 읽습니다. Spinner는 장식이라 따로 읽히지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const status = canvas.getByRole('status');
    await expect(status.tagName).toBe('P');
    await expect(status).toHaveTextContent('생각하는 중');
    await expect(status).toHaveAttribute('data-pending');
    await expect(status.querySelector('.shimmer')).toHaveTextContent('생각하는 중');
    await expect(canvasElement.querySelectorAll('[role="status"]')).toHaveLength(1);
    await expect(status.querySelector('[data-spinner]')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Separator: Story = {
  render: () => (
    <div className="w-80">
      <Marker variant="separator">
        <time dateTime="2026-10-27">10월 27일</time>
      </Marker>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '구분선 모양의 줄입니다. 양쪽 선은 장식인 Divider라 스크린 리더는 "10월 27일" 문단만 읽습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
    const marker = canvasElement.querySelector<HTMLElement>('[data-marker]')!;
    await expect(marker.tagName).toBe('P');
    await expect(marker).toHaveTextContent('10월 27일');
    const lines = marker.querySelectorAll<HTMLElement>('[data-divider]');
    await expect(lines).toHaveLength(2);
    for (const line of lines) await expect(line).toHaveAttribute('aria-hidden', 'true');
    await expect(marker.querySelector('time')).toHaveAttribute('datetime', '2026-10-27');
  },
};

export const AsLink: Story = {
  render: () => (
    <div className="w-72">
      <Marker asChild>
        <a href="#pull-request">
          <SparklesIcon />풀 리퀘스트 보기
        </a>
      </Marker>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '`asChild` 면 자식 요소가 줄이 됩니다. 링크는 밑줄이 붙고 Tab으로 갑니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '풀 리퀘스트 보기' });
    await expect(link).toHaveAttribute('data-marker');
    await expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.tab();
    await expect(canvas.getByRole('link')).toHaveFocus();
  },
};

export const InAccordion: Story = {
  render: () => (
    <div className="w-96">
      <Accordion type="multiple">
        <Accordion.Item value="reasoning">
          <Accordion.Header asChild>
            <h3>
              <Accordion.Trigger>
                <Marker asChild>
                  <span>
                    <SparklesIcon />
                    12초 동안 생각했어요
                  </span>
                </Marker>
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content>
            성적표에서 들은 과목 31개를 찾고, 학사 요람의 전공 필수와 견줬어요.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="search">
          <Accordion.Header asChild>
            <h3>
              <Accordion.Trigger>
                <Marker asChild>
                  <span>
                    <GlobeAltIcon />웹 검색 3건
                  </span>
                </Marker>
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content>2026 학사 요람, 2학기 개설 과목, 수강신청 안내.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Marker는 접지 않습니다. 접히는 추론과 도구 호출 줄은 `Accordion.Trigger` 안에 `Marker asChild` 로 `span` 을 넣어 만듭니다. 버튼 안에는 문단을 둘 수 없기 때문입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: '12초 동안 생각했어요' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger.querySelector('p')).toBeNull();
    await userEvent.click(trigger);
    await expect(canvas.getByRole('button', { name: '12초 동안 생각했어요' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByRole('region', { name: '12초 동안 생각했어요' })).toBeVisible();
  },
};
