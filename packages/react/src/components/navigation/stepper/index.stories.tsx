import { useState } from 'react';

import { CommandLineIcon, CreditCardIcon, TruckIcon, UserIcon } from '@heroicons/react/16/solid';
import { expect, fn, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { Avatar } from '../../data/avatar';
import { Card } from '../../data/card';
import { Spinner } from '../../feedback/spinner';

import { Stepper } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const orientations = ['horizontal', 'vertical'] as const;
const sizes = ['standard', 'tiny'] as const;
const modes = ['progress', 'record'] as const;

const meta = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
    size: { control: 'radio', options: sizes },
    linear: { control: 'boolean' },
    progress: { control: 'boolean' },
    disabled: { control: 'boolean' },
    defaultValue: { control: { type: 'number', min: 0, max: 3 } },
  },
  args: {
    defaultValue: 1,
    orientation: 'horizontal',
    size: 'standard',
    linear: true,
    onValueChange: fn(),
  },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <Stepper {...args}>
        <Stepper.Item>
          <Stepper.Title>계정</Stepper.Title>
          <Stepper.Description>이메일과 비밀번호</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>프로필</Stepper.Title>
          <Stepper.Description>이름과 사진</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>확인</Stepper.Title>
          <Stepper.Description>입력한 내용 검토</Stepper.Description>
        </Stepper.Item>
      </Stepper>
    </div>
  ),
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Orientation × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) => (
            <div className={orientation === 'horizontal' ? 'w-[28rem]' : 'w-56'}>
              <Stepper orientation={orientation} size={size} defaultValue={1}>
                <Stepper.Item>
                  <Stepper.Title>계정</Stepper.Title>
                  <Stepper.Description>이메일 인증</Stepper.Description>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>프로필</Stepper.Title>
                  <Stepper.Description>이름과 사진</Stepper.Description>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>확인</Stepper.Title>
                </Stepper.Item>
              </Stepper>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="States"
        description="앞 단계는 completed, 값의 단계는 current, 뒤 단계는 upcoming 입니다. error 와 disabled 는 단계마다 줍니다."
      >
        <Showcase.Row label="progress">
          <div className="w-[36rem]">
            <Stepper defaultValue={2}>
              <Stepper.Item>
                <Stepper.Title>completed</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>completed</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>current</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>upcoming</Stepper.Title>
              </Stepper.Item>
            </Stepper>
          </div>
        </Showcase.Row>
        <Showcase.Row label="error">
          <div className="w-[36rem]">
            <Stepper defaultValue={2}>
              <Stepper.Item>
                <Stepper.Title>계정</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item error>
                <Stepper.Title>결제</Stepper.Title>
                <Stepper.Description>카드가 거절되었습니다</Stepper.Description>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>배송</Stepper.Title>
              </Stepper.Item>
            </Stepper>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-[36rem]">
            <Stepper defaultValue={0} linear={false}>
              <Stepper.Item>
                <Stepper.Title>기본 정보</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item disabled>
                <Stepper.Title>추가 정보</Stepper.Title>
                <Stepper.Description>준비 중</Stepper.Description>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>확인</Stepper.Title>
              </Stepper.Item>
            </Stepper>
          </div>
        </Showcase.Row>
        <Showcase.Row label="all done">
          <div className="w-[36rem]">
            <Stepper value={3}>
              <Stepper.Item>
                <Stepper.Title>계정</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>프로필</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>확인</Stepper.Title>
              </Stepper.Item>
            </Stepper>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="Indicator 의 children 은 번호 대신 그릴 것입니다. 상태를 받는 함수도 됩니다."
      >
        <Showcase.Row label="icons">
          <div className="w-[36rem]">
            <Stepper value={1}>
              <Stepper.Item>
                <Stepper.Indicator>
                  <UserIcon />
                </Stepper.Indicator>
                <Stepper.Title>가입</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Indicator>
                  <CreditCardIcon />
                </Stepper.Indicator>
                <Stepper.Title>결제</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Indicator>
                  <TruckIcon />
                </Stepper.Indicator>
                <Stepper.Title>배송</Stepper.Title>
              </Stepper.Item>
            </Stepper>
          </div>
        </Showcase.Row>
        <Showcase.Row label="dots">
          <div className="w-72">
            <Stepper value={1} size="tiny">
              {[0, 1, 2, 3].map((step) => (
                <Stepper.Item key={step}>
                  <Stepper.Indicator className="size-2.5 ring-0 data-current:ring-0">
                    {null}
                  </Stepper.Indicator>
                  <Stepper.Title className="sr-only">{`${step + 1}단계`}</Stepper.Title>
                </Stepper.Item>
              ))}
            </Stepper>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Record × Size"
        description="progress={false} 는 현재 단계 없이 일어난 일을 늘어놓는 기록입니다. 표시하지 않은 기록은 점(neutral)이고, completed 와 error 는 진행에서처럼 그립니다. 연결선은 늘 중립색입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) => (
            <div className={orientation === 'horizontal' ? 'w-[28rem]' : 'w-56'}>
              <Stepper
                progress={false}
                orientation={orientation}
                size={size}
                aria-label="배포 기록"
              >
                <Stepper.Item completed>
                  <Stepper.Title>배포</Stepper.Title>
                  <Stepper.Description>v2.4.0</Stepper.Description>
                </Stepper.Item>
                <Stepper.Item error>
                  <Stepper.Title>테스트</Stepper.Title>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>빌드 시작</Stepper.Title>
                </Stepper.Item>
              </Stepper>
            </div>
          )}
        />
        <Showcase.Row label="avatars, icons">
          {sizes.map((size) => (
            <div key={size} className="w-64">
              <Stepper progress={false} orientation="vertical" size={size} aria-label="최근 활동">
                <Stepper.Item>
                  <Stepper.Indicator asChild>
                    <Avatar name="김지우" />
                  </Stepper.Indicator>
                  <Stepper.Title>김지우 님이 참여했습니다</Stepper.Title>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Indicator>
                    <CommandLineIcon />
                  </Stepper.Indicator>
                  <Stepper.Title>빌드를 시작했습니다</Stepper.Title>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>제목이 길어 줄이 넘어가도 점은 첫 줄에 맞춥니다</Stepper.Title>
                </Stepper.Item>
              </Stepper>
            </div>
          ))}
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Body × Size"
        description="Stepper.Body 는 제목과 설명 아래의 자유로운 내용입니다. 단계 버튼 밖에 그려져 링크와 버튼을 둘 수 있고, 제목 칸에 맞춰 들여 쓰며 연결선이 옆으로 이어집니다. 세로에서만 보입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={modes}
          render={(size, mode) =>
            mode === 'progress' ? (
              <div className="w-64">
                <Stepper orientation="vertical" size={size} defaultValue={1}>
                  <Stepper.Item>
                    <Stepper.Title>계정</Stepper.Title>
                    <Stepper.Description>이메일 인증</Stepper.Description>
                    <Stepper.Body>
                      <Button variant="outline" size="tiny">
                        인증 메일 다시 보내기
                      </Button>
                    </Stepper.Body>
                  </Stepper.Item>
                  <Stepper.Item>
                    <Stepper.Title>프로필</Stepper.Title>
                  </Stepper.Item>
                </Stepper>
              </div>
            ) : (
              <div className="w-64">
                <Stepper progress={false} orientation="vertical" size={size} aria-label="댓글">
                  <Stepper.Item>
                    <Stepper.Indicator asChild>
                      <Avatar name="박서준" />
                    </Stepper.Indicator>
                    <Stepper.Title>박서준 님의 댓글</Stepper.Title>
                    <Stepper.Description>
                      <time dateTime="2026-09-30T09:12">5분 전</time>
                    </Stepper.Description>
                    <Stepper.Body>
                      <Card variant="soft" size={size}>
                        다음 회의에서 같이 봐요.
                      </Card>
                    </Stepper.Body>
                  </Stepper.Item>
                  <Stepper.Item>
                    <Stepper.Title>이서연 님이 문서를 열었습니다</Stepper.Title>
                  </Stepper.Item>
                </Stepper>
              </div>
            )
          }
        />
      </Showcase.Section>
    </Showcase>
  ),
};

export const Linear: Story = {
  args: { defaultValue: 0 },
  parameters: {
    docs: {
      description: {
        story:
          '기본은 `linear` 입니다. 지난 단계와 바로 다음 단계만 누를 수 있고, 그보다 뒤의 단계는 `disabled` 버튼입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const step = (name: RegExp) => canvas.getByRole('button', { name });
    await expect(step(/계정/)).toHaveAttribute('aria-current', 'step');
    await expect(step(/확인/)).toBeDisabled();
    await userEvent.click(step(/프로필/));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(1);
    await expect(step(/프로필/)).toHaveAttribute('aria-current', 'step');
    await expect(step(/확인/)).toBeEnabled();
    await expect(step(/계정/)).toHaveAccessibleName('계정 완료');
    await userEvent.click(step(/계정/));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(0);
  },
};

export const NonLinear: Story = {
  args: { defaultValue: 0, linear: false },
  parameters: {
    docs: {
      description: {
        story: '`linear={false}` 면 어느 단계든 바로 누를 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /확인/ }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(2);
    await expect(canvas.getByRole('button', { name: /확인/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  },
};

export const Keyboard: Story = {
  args: { linear: false },
  parameters: {
    docs: {
      description: {
        story:
          '단계 목록은 Tab 한 칸이고, 현재 단계에서 멈춥니다. 방향키로 단계 사이를 오가고 `Home` `End` 로 끝까지 갑니다. `Enter` 나 `Space` 가 그 단계로 옮깁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const step = (name: RegExp) => canvas.getByRole('button', { name });
    await expect(step(/프로필/)).toHaveAttribute('tabindex', '0');
    await expect(step(/계정/)).toHaveAttribute('tabindex', '-1');
    step(/프로필/).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(step(/확인/)).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(step(/계정/)).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(step(/확인/)).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(step(/확인/)).toHaveAttribute('aria-current', 'step');
  },
};

export const Wizard: Story = {
  render: function Render() {
    const [step, setStep] = useState(0);

    return (
      <div className="w-full max-w-md">
        <Stepper orientation="vertical" value={step} onValueChange={setStep}>
          <Stepper.Item>
            <Stepper.Title>계정</Stepper.Title>
            <Stepper.Description>이메일 인증</Stepper.Description>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>프로필</Stepper.Title>
            <Stepper.Description>이름과 사진</Stepper.Description>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>확인</Stepper.Title>
          </Stepper.Item>

          <Stepper.Content value={0}>이메일로 받은 링크를 누르세요.</Stepper.Content>
          <Stepper.Content value={1}>이름과 프로필 사진을 정합니다.</Stepper.Content>
          <Stepper.Content value={2}>입력한 내용을 검토합니다.</Stepper.Content>
          <Stepper.Content value={3}>가입이 끝났습니다.</Stepper.Content>
        </Stepper>
        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((current) => current - 1)}
          >
            이전
          </Button>
          <Button disabled={step === 3} onClick={() => setStep((current) => current + 1)}>
            다음
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`Stepper.Content` 는 값이 같은 단계일 때만 보입니다. 숨은 패널도 DOM 에 남아 입력 상태를 지킵니다. 값이 단계 수와 같으면 모든 단계가 completed 이고, 그 값의 Content 가 끝난 화면이 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('이메일로 받은 링크를 누르세요.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '다음' }));
    await expect(canvas.getByText('이름과 프로필 사진을 정합니다.')).toBeVisible();
    await expect(canvas.getByText('이메일로 받은 링크를 누르세요.')).not.toBeVisible();
    await expect(canvas.getByRole('button', { name: /프로필/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  },
};

export const DisplayOnly: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Stepper value={1} aria-label="주문 진행">
        <Stepper.Item>
          <Stepper.Title>주문</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>배송 중</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>도착</Stepper.Title>
        </Stepper.Item>
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`value` 만 주고 `onValueChange` 를 주지 않으면 진행을 보여주기만 합니다. 버튼이 없고, 현재 단계의 `li` 에 `aria-current="step"` 이 붙습니다. Server Component 에서 그대로 쓸 수 있습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    const list = canvas.getByRole('list', { name: '주문 진행' });
    const items = canvas.getAllByRole('listitem');
    await expect(list).toBeInTheDocument();
    await expect(items[1]).toHaveAttribute('aria-current', 'step');
    await expect(items[0]).toHaveTextContent('주문완료');
  },
};

export const ErrorStep: Story = {
  render: (args) => (
    <div className="w-full max-w-2xl">
      <Stepper defaultValue={1} onValueChange={args.onValueChange}>
        <Stepper.Item>
          <Stepper.Title>계정</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item error>
          <Stepper.Title>결제</Stepper.Title>
          <Stepper.Description>카드가 거절되었습니다</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>배송</Stepper.Title>
        </Stepper.Item>
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`error` 인 단계는 표시가 danger 색으로 바뀌고, 스크린 리더는 제목 뒤에 "오류" 를 읽습니다. 설명은 `aria-describedby` 로 이어집니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const payment = canvas.getByRole('button', { name: /결제/ });
    await expect(payment).toHaveAccessibleName('결제 오류');
    await expect(payment).toHaveAccessibleDescription('카드가 거절되었습니다');
    await expect(payment).toHaveAttribute('aria-current', 'step');
    await expect(payment).toHaveAttribute('data-state', 'error');
  },
};

export const ActivityLog: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Stepper progress={false} orientation="vertical" aria-label="최근 활동">
        <Stepper.Item>
          <Stepper.Indicator asChild>
            <Avatar name="김지우" />
          </Stepper.Indicator>
          <Stepper.Title>김지우 님이 댓글을 남겼습니다</Stepper.Title>
          <Stepper.Description>
            <time dateTime="2026-09-30T09:12">5분 전</time>
          </Stepper.Description>
          <Stepper.Body>
            <Card variant="soft">좋은 의견이네요! 다음 회의에서 같이 봐요.</Card>
          </Stepper.Body>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Indicator asChild>
            <Avatar name="박서준" />
          </Stepper.Indicator>
          <Stepper.Title>박서준 님이 문서를 고쳤습니다</Stepper.Title>
          <Stepper.Description>
            <time dateTime="2026-09-30T08:40">40분 전</time>
          </Stepper.Description>
          <Stepper.Body>
            <a
              href="#design-system-v2"
              className="text-(--ids-color-accent) underline underline-offset-4"
            >
              디자인 시스템 v2 개편안
            </a>
          </Stepper.Body>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>이서연 님이 프로젝트에 참여했습니다</Stepper.Title>
          <Stepper.Description>
            <time dateTime="2026-09-29">어제</time>
          </Stepper.Description>
        </Stepper.Item>
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`progress={false}` 는 현재 단계가 없는 기록입니다. 표시하지 않은 기록은 점으로 그리고 상태 문구를 읽지 않습니다. 아바타는 `Stepper.Indicator asChild` 로 표시 자리에 두고, 시각은 `Stepper.Description` 안의 `<time>` 으로 적습니다. `Stepper.Body` 는 단계 버튼 밖이라 카드와 링크를 담습니다. 목록 이름은 `aria-label` 로 줍니다.',
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

    const link = canvas.getByRole('link', { name: '디자인 시스템 v2 개편안' });
    await expect(link.closest('[data-stepper-body]')).not.toBeNull();
    await expect(link.closest('[data-stepper-trigger]')).toBeNull();
    await expect(canvas.getByText('40분 전')).toHaveAttribute('datetime', '2026-09-30T08:40');
  },
};

export const DeployLog: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Stepper value={2} orientation="vertical" size="tiny" aria-label="배포">
        <Stepper.Item>
          <Stepper.Title>빌드</Stepper.Title>
          <Stepper.Description>1분 12초</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item error>
          <Stepper.Title>테스트</Stepper.Title>
          <Stepper.Description>3개 실패</Stepper.Description>
          <Stepper.Body>
            <a
              href="#test-report"
              className="text-(--ids-color-accent) underline underline-offset-4"
            >
              실패한 테스트 보기
            </a>
          </Stepper.Body>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Indicator>
            <Spinner decorative />
          </Stepper.Indicator>
          <Stepper.Title>재시도 중</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>배포</Stepper.Title>
        </Stepper.Item>
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`value` 만 준 표시 전용 Stepper 로 파이프라인을 그립니다. 실패한 단계는 `error`, 도는 단계는 `Stepper.Indicator` 에 `Spinner decorative` 를 둡니다. 현재 단계의 `li` 가 `aria-current="step"` 이라 따로 알리지 않아도 됩니다. `Stepper.Body` 는 진행에서도 쓰고, 안의 링크는 단계와 따로 Tab 이 멈춥니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole('listitem');
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(items[0]).toHaveTextContent(/완료/);
    await expect(items[1]).toHaveAttribute('data-state', 'error');
    await expect(items[1]).toHaveTextContent(/오류/);
    await expect(items[2]).toHaveAttribute('aria-current', 'step');
    await expect(items[3]).toHaveAttribute('data-state', 'upcoming');

    const running = items[2]!.querySelector('[data-stepper-indicator]')!;
    await expect(running).toHaveAttribute('aria-hidden', 'true');
    await expect(running.querySelector('[data-spinner]')).not.toBeNull();
    await expect(within(items[2]!).queryByRole('status')).toBeNull();

    const report = canvas.getByRole('link', { name: '실패한 테스트 보기' });
    await expect(report.closest('[data-stepper-trigger]')).toBeNull();
  },
};

export const OrderStatus: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Stepper value={2} orientation="vertical" aria-label="주문 진행">
        <Stepper.Item>
          <Stepper.Title>주문 접수</Stepper.Title>
          <Stepper.Description>
            <time dateTime="2026-09-28T14:05">9월 28일 오후 2:05</time>
          </Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>결제</Stepper.Title>
          <Stepper.Description>
            <time dateTime="2026-09-28T14:06">9월 28일 오후 2:06</time>
          </Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>배송 준비 중</Stepper.Title>
          <Stepper.Description>
            <time dateTime="2026-09-29">9월 29일</time>
          </Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>배송 출발</Stepper.Title>
          <Stepper.Description>예정</Stepper.Description>
        </Stepper.Item>
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '세로 표시 전용 Stepper 는 주문과 배송처럼 정해진 순서의 진행을 시각과 함께 보여 줍니다. 시각은 `Stepper.Description` 안에 `<time dateTime>` 으로 두어, 기계가 읽는 값과 사람이 읽는 글을 함께 적습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list', { name: '주문 진행' });
    const items = within(list).getAllByRole('listitem');
    await expect(items[0]).toHaveTextContent(/완료/);
    await expect(items[1]).toHaveTextContent(/완료/);
    await expect(items[2]).toHaveAttribute('aria-current', 'step');
    await expect(items[3]).toHaveAttribute('data-state', 'upcoming');

    const paid = canvas.getByText('9월 28일 오후 2:06');
    await expect(paid.tagName).toBe('TIME');
    await expect(paid).toHaveAttribute('datetime', '2026-09-28T14:06');
  },
};
