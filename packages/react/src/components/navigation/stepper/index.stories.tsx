import { useState } from 'react';

import { CreditCardIcon, TruckIcon, UserIcon } from '@heroicons/react/16/solid';
import { expect, fn } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Stepper } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const orientations = ['horizontal', 'vertical'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
    size: { control: 'radio', options: sizes },
    linear: { control: 'boolean' },
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
