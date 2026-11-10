import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Card } from '../../data/card';

import { Link } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const colorSchemes = ['accent', 'neutral'] as const;
const underlines = ['always', 'hover'] as const;

const meta = {
  title: 'Typography/Link',
  component: Link,
  tags: ['autodocs'],
  argTypes: {
    colorScheme: { control: 'radio', options: colorSchemes },
    underline: { control: 'radio', options: underlines },
    target: { control: 'radio', options: [undefined, '_blank'] },
    asChild: { table: { disable: true } },
  },
  args: { children: '공지 모아 보기', href: '#notices' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Color scheme × Underline">
        <Showcase.Matrix
          rows={colorSchemes}
          columns={underlines}
          render={(colorScheme, underline) => (
            <Link href="#notices" colorScheme={colorScheme} underline={underline}>
              공지 모아 보기
            </Link>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="New tab"
        description="target이 _blank면 아이콘과 숨긴 안내가 붙습니다."
      >
        <Showcase.Row label="accent">
          <Link href="https://www.gist.ac.kr" target="_blank">
            GIST 누리집
          </Link>
        </Showcase.Row>
        <Showcase.Row label="neutral">
          <Link href="https://www.gist.ac.kr" target="_blank" colorScheme="neutral">
            GIST 누리집
          </Link>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Placement">
        <Showcase.Row label="running text">
          <p className="text-body-b2-regular max-w-md">
            수강 신청 일정은 <Link href="#calendar">학사 일정</Link>에서 확인하고, 바뀐 규정은{' '}
            <Link href="https://www.gist.ac.kr" target="_blank">
              학교 누리집
            </Link>
            에 올라와요.
          </p>
        </Showcase.Row>
        <Showcase.Row label="type scale">
          <div className="flex flex-col gap-2">
            <p className="text-headline-h4-bold">
              <Link href="#notices">공지 모아 보기</Link>
            </p>
            <p className="text-body-b3-regular">
              <Link href="#notices">공지 모아 보기</Link>
            </p>
            <p className="text-caption-c1-regular">
              <Link href="#notices">공지 모아 보기</Link>
            </p>
          </div>
        </Showcase.Row>
        <Showcase.Row label="muted text">
          <Card className="w-72">
            <Card.Header>
              <Card.Title>계정</Card.Title>
              <Card.Description>
                <Link href="#privacy" colorScheme="neutral">
                  개인정보 처리방침
                </Link>
                을 읽어 주세요.
              </Card.Description>
            </Card.Header>
          </Card>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const InRunningText: Story = {
  render: () => (
    <p className="text-body-b2-regular max-w-md">
      비밀번호를 잊었다면 <Link href="#forgot-password">비밀번호 찾기</Link>로 새로 정할 수 있어요.
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '글 속 링크는 기본값 그대로 accent 색에 밑줄을 긋습니다. 색을 구별하지 못해도 밑줄로 링크를 알아봅니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '비밀번호 찾기' });
    await expect(link).toHaveAttribute('href', '#forgot-password');
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
  },
};

export const NewTab: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link href="https://www.gist.ac.kr" target="_blank">
        GIST 누리집
      </Link>
      <Link href="https://www.gist.ac.kr" target="_blank" rel="noopener">
        rel을 직접 준 링크
      </Link>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'target이 _blank면 rel="noopener noreferrer"를 붙이고, 새 탭 아이콘과 스크린 리더용 "(새 탭에서 열림)"을 더합니다. rel을 주면 그대로 씁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /GIST 누리집/ });
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAccessibleName('GIST 누리집 (새 탭에서 열림)');
    await expect(link.querySelector('[data-link-new-tab]')).toHaveAttribute('aria-hidden', 'true');

    const own = canvas.getByRole('link', { name: /rel을 직접 준 링크/ });
    await expect(own).toHaveAttribute('rel', 'noopener');
  },
};

export const AsChild: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link asChild>
        <a href="#notices" className="font-semibold">
          공지 모아 보기
        </a>
      </Link>
      <Link asChild colorScheme="neutral">
        <a href="https://www.gist.ac.kr" target="_blank">
          GIST 누리집
        </a>
      </Link>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'asChild로 라우터 링크 같은 자식 요소에 Link의 모양을 입힙니다. 자식의 class와 target을 읽고, 새 탭 아이콘은 자식 안 끝에 붙습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const notices = canvas.getByRole('link', { name: '공지 모아 보기' });
    await expect(notices).toHaveAttribute('data-link');
    await expect(notices).toHaveClass('font-semibold');

    const external = canvas.getByRole('link', { name: /GIST 누리집/ });
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(external).toHaveAttribute('data-color-scheme', 'neutral');
    await expect(external.querySelector('[data-link-new-tab]')).not.toBeNull();
  },
};

export const LinkList: Story = {
  render: () => (
    <nav aria-label="바닥글">
      <ul className="text-body-b3-regular flex flex-col gap-2">
        <li>
          <Link href="#terms" colorScheme="neutral" underline="hover">
            이용약관
          </Link>
        </li>
        <li>
          <Link href="#privacy" colorScheme="neutral" underline="hover">
            개인정보 처리방침
          </Link>
        </li>
        <li>
          <Link href="#contact" colorScheme="neutral" underline="hover">
            문의하기
          </Link>
        </li>
      </ul>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '바닥글이나 표 칸처럼 링크가 모인 자리는 neutral과 hover로 둘레 글자색을 따르고, 가리키거나 키보드로 포커스하면 밑줄을 긋습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    for (const link of canvas.getAllByRole('link')) {
      await expect(link).toHaveAttribute('data-underline', 'hover');
      await expect(getComputedStyle(link).textDecorationLine).toBe('none');
    }
  },
};
