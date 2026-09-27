import { useState } from 'react';

import { MinusIcon, PlusIcon } from '@heroicons/react/16/solid';
import { UserIcon } from '@heroicons/react/24/outline';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { Chip } from '../chip';

import { Accordion } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const FAQS = [
  {
    id: 'shipping',
    question: '배송은 얼마나 걸리나요?',
    answer: '일반 배송 2~3일, 빠른 배송 1일.',
  },
  {
    id: 'returns',
    question: '반품이 가능한가요?',
    answer: '구매 후 14일 안에 반품할 수 있습니다.',
  },
  {
    id: 'payment',
    question: '어떤 결제 수단을 지원하나요?',
    answer: '카드와 계좌 이체를 지원합니다.',
  },
];

function Faqs() {
  return FAQS.map((faq) => (
    <Accordion.Item key={faq.id} value={faq.id}>
      <Accordion.Trigger>{faq.question}</Accordion.Trigger>
      <Accordion.Content>{faq.answer}</Accordion.Content>
    </Accordion.Item>
  ));
}

const meta = {
  title: 'Data/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'radio', options: ['single', 'multiple'] },
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    collapsible: { control: 'boolean' },
    disabled: { control: 'boolean' },
    headingLevel: { control: { type: 'number', min: 1, max: 6 } },
  },
  args: {
    type: 'single',
    collapsible: true,
    variant: 'outline',
    size: 'standard',
    defaultValue: 'shipping',
    onValueChange: fn(),
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <Accordion {...args}>
        <Faqs />
      </Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-64">
              <Accordion type="single" variant={variant} size={size} defaultValue="a">
                <Accordion.Item value="a">
                  <Accordion.Trigger>열린 섹션</Accordion.Trigger>
                  <Accordion.Content>
                    {variant} · {size}
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="b">
                  <Accordion.Trigger>닫힌 섹션</Accordion.Trigger>
                  <Accordion.Content>내용</Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled item">
          <div className="w-72">
            <Accordion type="single">
              <Accordion.Item value="open">
                <Accordion.Trigger>열 수 있는 섹션</Accordion.Trigger>
                <Accordion.Content>내용</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="locked" disabled>
                <Accordion.Trigger>잠긴 섹션</Accordion.Trigger>
                <Accordion.Content>볼 수 없습니다.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled root">
          <div className="w-72">
            <Accordion type="multiple" disabled defaultValue={['a']}>
              <Accordion.Item value="a">
                <Accordion.Trigger>전체 비활성</Accordion.Trigger>
                <Accordion.Content>열린 채로 고정됩니다.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="b">
                <Accordion.Trigger>두 번째</Accordion.Trigger>
                <Accordion.Content>내용</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Showcase.Row>
        <Showcase.Row label="not collapsible">
          <div className="w-72">
            <Accordion type="single" collapsible={false} defaultValue="a">
              <Accordion.Item value="a">
                <Accordion.Trigger>항상 하나는 열림</Accordion.Trigger>
                <Accordion.Content>다시 눌러도 닫히지 않습니다.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="b">
                <Accordion.Trigger>두 번째</Accordion.Trigger>
                <Accordion.Content>내용</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="Trigger 안의 순서가 곧 배치입니다. Indicator를 앞에 두면 앞에, 생략하면 끝에 chevron이 붙습니다."
      >
        <Showcase.Row label="rich trigger">
          <div className="w-72">
            <Accordion type="single" defaultValue="profile">
              <Accordion.Item value="profile">
                <Accordion.Trigger>
                  <UserIcon className="size-4 self-center" />
                  프로필 설정
                  <Chip size="tiny" colorScheme="primary">
                    2
                  </Chip>
                </Accordion.Trigger>
                <Accordion.Content>이름과 프로필 사진을 바꿉니다.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Showcase.Row>
        <Showcase.Row label="leading indicator">
          <div className="w-72">
            <Accordion type="multiple" variant="ghost" defaultValue={['src']}>
              <Accordion.Item value="src">
                <Accordion.Trigger>
                  <Accordion.Indicator className="-rotate-90 data-open:rotate-0" />
                  src
                </Accordion.Trigger>
                <Accordion.Content>components, hooks, utils</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="tests">
                <Accordion.Trigger>
                  <Accordion.Indicator className="-rotate-90 data-open:rotate-0" />
                  tests
                </Accordion.Trigger>
                <Accordion.Content>accordion.test.mjs</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Showcase.Row>
        <Showcase.Row label="plus / minus">
          <div className="w-72">
            <PlusMinus />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function PlusMinus() {
  return (
    <Accordion type="single" variant="soft" defaultValue="a">
      {['a', 'b'].map((value) => (
        <Accordion.Item key={value} value={value}>
          <Accordion.Trigger>
            {value === 'a' ? '회원 혜택' : '포인트 적립'}
            <Accordion.Indicator className="rotate-0! transition-none">
              {(state) => (state.open ? <MinusIcon /> : <PlusIcon />)}
            </Accordion.Indicator>
          </Accordion.Trigger>
          <Accordion.Content>Indicator의 children은 상태를 받는 함수도 됩니다.</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export const Single: Story = {
  args: { defaultValue: undefined },
  parameters: {
    docs: {
      description: {
        story:
          '한 번에 하나만 열립니다. 다른 섹션을 열면 열려 있던 섹션이 닫히고, 열린 섹션을 다시 누르면 닫힙니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const first = canvas.getByRole('button', { name: /배송은/ });
    const second = canvas.getByRole('button', { name: /반품이/ });
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('shipping');
    await userEvent.click(second);
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
  },
};

export const NotCollapsible: Story = {
  args: { collapsible: false },
  parameters: {
    docs: {
      description: {
        story:
          '`collapsible={false}` 면 항상 하나가 열려 있습니다. 열린 섹션의 헤더는 `aria-disabled` 로 알리지만 포커스는 받아서 화살표 키로 지나갈 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole('button', { name: /배송은/ });
    await expect(first).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: /반품이/ }));
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(first).not.toHaveAttribute('aria-disabled');
  },
};

function MultipleExample() {
  const [opened, setOpened] = useState<string[]>(['general']);
  return (
    <div className="flex flex-col gap-4">
      <Accordion type="multiple" value={opened} onValueChange={setOpened}>
        <Accordion.Item value="general">
          <Accordion.Trigger>일반 설정</Accordion.Trigger>
          <Accordion.Content>언어와 시간대를 바꿉니다.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="notifications">
          <Accordion.Trigger>알림 설정</Accordion.Trigger>
          <Accordion.Content>메일과 푸시 알림을 켜고 끕니다.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="security">
          <Accordion.Trigger>보안 설정</Accordion.Trigger>
          <Accordion.Content>비밀번호와 2단계 인증을 관리합니다.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <div className="flex gap-2">
        <Button size="tiny" variant="outline" onClick={() => setOpened([])}>
          모두 닫기
        </Button>
        <Button
          size="tiny"
          variant="outline"
          onClick={() => setOpened(['general', 'notifications', 'security'])}
        >
          모두 열기
        </Button>
      </div>
      <output aria-label="열린 섹션" className="text-body-b3-regular font-mono">
        {JSON.stringify(opened)}
      </output>
    </div>
  );
}

export const Multiple: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <MultipleExample />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`type="multiple"` 은 여러 섹션을 함께 엽니다. 값은 배열이고, 제어 모드에서 바깥 버튼으로 한꺼번에 열고 닫을 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const output = canvas.getByLabelText('열린 섹션');
    await userEvent.click(canvas.getByRole('button', { name: /보안 설정/ }));
    await expect(output).toHaveTextContent('["general","security"]');
    await userEvent.click(canvas.getByRole('button', { name: '모두 닫기' }));
    await expect(canvas.getByRole('button', { name: /일반 설정/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await userEvent.click(canvas.getByRole('button', { name: '모두 열기' }));
    await expect(output).toHaveTextContent('["general","notifications","security"]');
  },
};

export const Keyboard: Story = {
  args: { defaultValue: undefined },
  render: (args) => (
    <div className="w-full max-w-md">
      <Accordion {...args}>
        <Faqs />
        <Accordion.Item value="closed" disabled>
          <Accordion.Trigger>준비 중인 질문</Accordion.Trigger>
          <Accordion.Content>비활성</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '헤더 사이를 ↑ ↓ 로 오가고 끝에서 반대쪽으로 넘어갑니다. Home 과 End 는 처음과 마지막 헤더로 갑니다. 비활성 헤더는 건너뜁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const [first, second, third] = FAQS.map((faq) =>
      canvas.getByRole('button', { name: faq.question }),
    );
    first!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(second).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(third).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(third).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  },
};

export const FindInPage: Story = {
  args: { defaultValue: undefined },
  parameters: {
    docs: {
      description: {
        story:
          '닫힌 내용은 `hidden="until-found"` 로 숨어 있어 브라우저의 페이지 내 찾기(⌘F)가 찾아냅니다. 찾으면 그 섹션이 저절로 열립니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const returns = () => canvas.getByRole('button', { name: /반품이/ });
    const panel = () =>
      canvasElement.querySelector<HTMLElement>(
        `#${CSS.escape(returns().getAttribute('aria-controls')!)}`,
      )!;
    await waitFor(() => expect(panel()).toHaveAttribute('hidden', 'until-found'));
    panel().dispatchEvent(new Event('beforematch', { bubbles: true }));
    await waitFor(() => expect(returns()).toHaveAttribute('aria-expanded', 'true'));
    await expect(panel()).not.toHaveAttribute('hidden');
  },
};

export const CustomIndicator: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <PlusMinus />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Indicator를 넣으면 기본 chevron 대신 그것을 씁니다. children, className, style은 섹션 상태를 받는 함수가 될 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const second = canvas.getByRole('button', { name: /포인트 적립/ });
    await expect(second.querySelectorAll('svg')).toHaveLength(1);
    await userEvent.click(second);
    await expect(second).toHaveAttribute('data-open');
  },
};
