import { useState } from 'react';

import { ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline';
import { expect, userEvent } from 'storybook/test';

import { Chip } from '../chip';

import { Accordion } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const FAQS = [
  {
    id: 'shipping',
    question: '배송은 얼마나 걸리나요?',
    answer: '일반 배송 2-3일, 빠른 배송 1일.',
  },
  { id: 'returns', question: '반품이 가능한가요?', answer: '구매 후 14일 이내 반품 가능합니다.' },
  {
    id: 'payment',
    question: '어떤 결제 수단을 지원하나요?',
    answer: '카드, 계좌이체를 지원합니다.',
  },
];

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['bordered', 'separated', 'ghost'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Playground: Story = {
  args: { variant: 'bordered', size: 'standard' },
  render: ({ variant, size }) => (
    <Accordion variant={variant} size={size} type="single" collapsible defaultValue="shipping">
      {FAQS.map((faq) => (
        <Accordion.Item key={faq.id} value={faq.id}>
          <Accordion.Trigger>
            {faq.question}
            <Accordion.Indicator>
              <ChevronDownIcon />
            </Accordion.Indicator>
          </Accordion.Trigger>
          <Accordion.Content>{faq.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: /배송은/ });
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    const region = canvas.getByRole('region', { name: /배송은/ });
    await expect(region).toHaveAttribute('id', first.getAttribute('aria-controls'));
  },
};

export const SingleCollapses: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      {FAQS.map((faq) => (
        <Accordion.Item key={faq.id} value={faq.id}>
          <Accordion.Trigger>{faq.question}</Accordion.Trigger>
          <Accordion.Content>{faq.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: /배송은/ });
    const second = canvas.getByRole('button', { name: /반품이/ });

    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(second);
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(second).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'false');
  },
};

export const SingleNotCollapsible: Story = {
  render: () => (
    <Accordion type="single" collapsible={false} defaultValue="shipping">
      {FAQS.map((faq) => (
        <Accordion.Item key={faq.id} value={faq.id}>
          <Accordion.Trigger>{faq.question}</Accordion.Trigger>
          <Accordion.Content>{faq.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  ),
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: /배송은/ });
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Multiple: Story = {
  render: function Multiple() {
    const [opened, setOpened] = useState<string[]>(['general']);

    return (
      <div className="flex flex-col gap-2">
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
        <output data-testid="opened">{opened.join(',')}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '보안 설정' }));
    await expect(canvas.getByTestId('opened')).toHaveTextContent('general,security');
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['bordered', 'separated', 'ghost'] as const).map((variant) => (
        <Accordion key={variant} variant={variant} type="single" collapsible defaultValue="a">
          <Accordion.Item value="a">
            <Accordion.Trigger>
              {variant}
              <Accordion.Indicator>
                <ChevronDownIcon />
              </Accordion.Indicator>
            </Accordion.Trigger>
            <Accordion.Content>variant=&quot;{variant}&quot;</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="b">
            <Accordion.Trigger>
              두 번째 섹션
              <Accordion.Indicator>
                <ChevronDownIcon />
              </Accordion.Indicator>
            </Accordion.Trigger>
            <Accordion.Content>내용</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      ))}
    </div>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <Accordion.Item value="open">
        <Accordion.Trigger>열 수 있는 섹션</Accordion.Trigger>
        <Accordion.Content>내용</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="locked" disabled>
        <Accordion.Trigger>잠긴 섹션</Accordion.Trigger>
        <Accordion.Content>볼 수 없습니다.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '잠긴 섹션' })).toBeDisabled();
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      {FAQS.map((faq) => (
        <Accordion.Item key={faq.id} value={faq.id}>
          <Accordion.Trigger>{faq.question}</Accordion.Trigger>
          <Accordion.Content>{faq.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  ),
  play: async ({ canvas }) => {
    const [first, second, third] = FAQS.map((faq) =>
      canvas.getByRole('button', { name: faq.question }),
    );

    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(second).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect(third).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(first).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect(third).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(third).toHaveAttribute('aria-expanded', 'true');
  },
};

export const RichTrigger: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <Accordion.Item value="profile">
        <Accordion.Trigger>
          <UserIcon className="size-4" />
          프로필 설정
          <Chip size="tiny" colorScheme="primary">
            2
          </Chip>
          <Accordion.Indicator>
            <ChevronDownIcon />
          </Accordion.Indicator>
        </Accordion.Trigger>
        <Accordion.Content>이름과 프로필 사진을 바꿉니다.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};
