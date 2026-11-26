import { CommandLineIcon } from '@heroicons/react/16/solid';
import { expect, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Avatar } from '../avatar';
import { Card } from '../card';

import { Timeline } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const orientations = ['vertical', 'horizontal'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Data/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
    size: { control: 'radio', options: sizes },
  },
  args: {
    'aria-label': '배포 기록',
    orientation: 'vertical',
    size: 'standard',
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <Timeline {...args}>
        <Timeline.Item status="completed">
          <Timeline.Title>배포</Timeline.Title>
          <Timeline.Description>v2.4.0</Timeline.Description>
        </Timeline.Item>
        <Timeline.Item status="error">
          <Timeline.Title>테스트</Timeline.Title>
          <Timeline.Description>3개 실패</Timeline.Description>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Title>빌드 시작</Timeline.Title>
        </Timeline.Item>
      </Timeline>
    </div>
  ),
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <Timeline aria-label="최근 활동">
      <Timeline.Item>
        <Timeline.Title>김지우 님이 댓글을 남겼습니다</Timeline.Title>
        <Timeline.Description>5분 전</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title>박서준 님이 문서를 고쳤습니다</Timeline.Title>
        <Timeline.Description>40분 전</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title>이서연 님이 참여했습니다</Timeline.Title>
      </Timeline.Item>
    </Timeline>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Orientation × Size"
        description="Timeline 은 현재 항목 없이 일어난 일을 늘어놓습니다. 표시하지 않은 항목은 점(neutral)이고, 연결선은 늘 중립색입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) => (
            <div className={orientation === 'horizontal' ? 'w-[28rem]' : 'w-56'}>
              <Timeline orientation={orientation} size={size} aria-label="배포 기록">
                <Timeline.Item status="completed">
                  <Timeline.Title>배포</Timeline.Title>
                  <Timeline.Description>v2.4.0</Timeline.Description>
                </Timeline.Item>
                <Timeline.Item status="error">
                  <Timeline.Title>테스트</Timeline.Title>
                </Timeline.Item>
                <Timeline.Item>
                  <Timeline.Title>빌드 시작</Timeline.Title>
                </Timeline.Item>
              </Timeline>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Status"
        description="status 는 neutral(기본), completed, error 입니다."
      >
        <Showcase.Row label="status">
          <div className="w-56">
            <Timeline aria-label="상태">
              <Timeline.Item>
                <Timeline.Title>neutral</Timeline.Title>
              </Timeline.Item>
              <Timeline.Item status="completed">
                <Timeline.Title>completed</Timeline.Title>
              </Timeline.Item>
              <Timeline.Item status="error">
                <Timeline.Title>error</Timeline.Title>
              </Timeline.Item>
            </Timeline>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="Indicator 의 children 은 점 대신 그릴 것이고, asChild 로 Avatar 를 둡니다. Body 는 제목 아래의 자유로운 내용이며 세로에서만 보입니다."
      >
        <Showcase.Row label="avatars, icons">
          {sizes.map((size) => (
            <div key={size} className="w-64">
              <Timeline size={size} aria-label="최근 활동">
                <Timeline.Item>
                  <Timeline.Indicator asChild>
                    <Avatar name="김지우" />
                  </Timeline.Indicator>
                  <Timeline.Title>김지우 님이 참여했습니다</Timeline.Title>
                </Timeline.Item>
                <Timeline.Item>
                  <Timeline.Indicator>
                    <CommandLineIcon />
                  </Timeline.Indicator>
                  <Timeline.Title>빌드를 시작했습니다</Timeline.Title>
                </Timeline.Item>
                <Timeline.Item>
                  <Timeline.Title>제목이 길어 줄이 넘어가도 점은 첫 줄에 맞춥니다</Timeline.Title>
                </Timeline.Item>
              </Timeline>
            </div>
          ))}
        </Showcase.Row>
        <Showcase.Row label="body">
          {sizes.map((size) => (
            <div key={size} className="w-64">
              <Timeline size={size} aria-label="댓글">
                <Timeline.Item>
                  <Timeline.Indicator asChild>
                    <Avatar name="박서준" />
                  </Timeline.Indicator>
                  <Timeline.Title>박서준 님의 댓글</Timeline.Title>
                  <Timeline.Description>
                    <time dateTime="2026-09-30T09:12">5분 전</time>
                  </Timeline.Description>
                  <Timeline.Body>
                    <Card variant="soft" size={size}>
                      다음 회의에서 같이 봐요.
                    </Card>
                  </Timeline.Body>
                </Timeline.Item>
                <Timeline.Item>
                  <Timeline.Title>이서연 님이 문서를 열었습니다</Timeline.Title>
                </Timeline.Item>
              </Timeline>
            </div>
          ))}
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ListRecentActivity: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Timeline aria-label="최근 활동">
        <Timeline.Item>
          <Timeline.Indicator asChild>
            <Avatar name="김지우" />
          </Timeline.Indicator>
          <Timeline.Title>김지우 님이 댓글을 남겼습니다</Timeline.Title>
          <Timeline.Description>
            <time dateTime="2026-09-30T09:12">5분 전</time>
          </Timeline.Description>
          <Timeline.Body>
            <Card variant="soft">좋은 의견이네요! 다음 회의에서 같이 봐요.</Card>
          </Timeline.Body>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Indicator asChild>
            <Avatar name="박서준" />
          </Timeline.Indicator>
          <Timeline.Title>박서준 님이 문서를 고쳤습니다</Timeline.Title>
          <Timeline.Description>
            <time dateTime="2026-09-30T08:40">40분 전</time>
          </Timeline.Description>
          <Timeline.Body>
            <Card variant="outline" size="tiny">
              디자인 시스템 v2 개편안
            </Card>
          </Timeline.Body>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Title>이서연 님이 프로젝트에 참여했습니다</Timeline.Title>
          <Timeline.Description>
            <time dateTime="2026-09-29">어제</time>
          </Timeline.Description>
        </Timeline.Item>
      </Timeline>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '표시하지 않은 항목은 점으로 그리고 상태 문구를 읽지 않습니다. 아바타는 `Timeline.Indicator asChild` 로 표시 자리에 두고, 시각은 `Timeline.Description` 안의 `<time>` 으로 적습니다. `Timeline.Body` 는 카드와 링크를 담습니다. 목록 이름은 `aria-label` 로 줍니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list', { name: '최근 활동' });
    const items = within(list).getAllByRole('listitem');
    await expect(items).toHaveLength(3);
    for (const item of items) {
      await expect(item).toHaveAttribute('data-state', 'neutral');
      await expect(item).not.toHaveAttribute('aria-current');
    }
    await expect(list).not.toHaveTextContent(/완료|오류/);
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.queryAllByRole('img')).toHaveLength(0);
    await expect(canvas.getByText('40분 전')).toHaveAttribute('datetime', '2026-09-30T08:40');
  },
};

export const ShowDeployHistory: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Timeline size="tiny" aria-label="배포 기록">
        <Timeline.Item status="completed">
          <Timeline.Title>v2.4.1 배포</Timeline.Title>
          <Timeline.Description>
            <time dateTime="2026-09-30T10:20">오전 10:20</time>
          </Timeline.Description>
        </Timeline.Item>
        <Timeline.Item status="error">
          <Timeline.Title>v2.4.0 배포 실패</Timeline.Title>
          <Timeline.Description>테스트 3개 실패</Timeline.Description>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Title>main 에 3개 커밋</Timeline.Title>
          <Timeline.Description>
            <time dateTime="2026-09-30T09:05">오전 9:05</time>
          </Timeline.Description>
        </Timeline.Item>
      </Timeline>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`status="completed"` 와 `status="error"` 는 끝난 일과 실패한 일을 표시하고, 스크린 리더는 제목 뒤에 "완료", "오류" 를 읽습니다. status 가 없는 항목은 점입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole('listitem');
    await expect(items[0]).toHaveAttribute('data-state', 'completed');
    await expect(items[0]).toHaveTextContent(/완료/);
    await expect(items[1]).toHaveAttribute('data-state', 'error');
    await expect(items[1]).toHaveTextContent(/오류/);
    await expect(items[2]).toHaveAttribute('data-state', 'neutral');
  },
};
