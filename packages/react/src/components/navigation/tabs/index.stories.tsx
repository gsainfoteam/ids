import { useState } from 'react';

import { BellIcon, Cog6ToothIcon, UserIcon } from '@heroicons/react/16/solid';
import { expect, fn, spyOn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';
import { Button } from '../../action/button';
import { TextField } from '../../form/text-field';

import { Tabs } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const appearances = ['underline', 'pill', 'enclosed'] as const;
const variants = ['ghost', 'outline', 'soft', 'solid', 'glossy'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    appearance: { control: 'radio', options: appearances },
    variant: { control: 'radio', options: variants, if: { arg: 'appearance', eq: 'pill' } },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    activationMode: { control: 'radio', options: ['automatic', 'manual'] },
    size: { control: 'radio', options: sizes },
    loop: { control: 'boolean' },
  },
  args: {
    defaultValue: 'overview',
    appearance: 'underline',
    orientation: 'horizontal',
    activationMode: 'automatic',
    size: 'standard',
    loop: true,
    onValueChange: fn(),
  },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="상품 정보">
        <Tabs.Trigger value="overview">개요</Tabs.Trigger>
        <Tabs.Trigger value="reviews">리뷰</Tabs.Trigger>
        <Tabs.Trigger value="qna">Q&A</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">가볍고 오래 가는 무선 키보드입니다.</Tabs.Content>
      <Tabs.Content value="reviews">리뷰 128개, 평균 4.6점.</Tabs.Content>
      <Tabs.Content value="qna">질문 12개에 모두 답했습니다.</Tabs.Content>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = () => document.querySelectorAll<HTMLElement>('[role="tab"]');

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Appearance × Size"
        description="underline 은 고른 탭 아래에 선을, pill 은 고른 탭을 채우고, enclosed 는 고른 탭을 내용 쪽으로 열린 상자로 그립니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={appearances}
          render={(size, appearance) => (
            <Tabs defaultValue="overview" appearance={appearance} size={size}>
              <Tabs.List aria-label="상품 정보">
                <Tabs.Trigger value="overview">개요</Tabs.Trigger>
                <Tabs.Trigger value="reviews">리뷰</Tabs.Trigger>
                <Tabs.Trigger value="qna">Q&A</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="overview">개요 내용</Tabs.Content>
              <Tabs.Content value="reviews">리뷰 내용</Tabs.Content>
              <Tabs.Content value="qna">Q&A 내용</Tabs.Content>
            </Tabs>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Pill variant"
        description="pill 의 variant 는 고른 탭의 채움 강도입니다. 고르지 않은 탭은 모두 투명합니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Tabs defaultValue="day" appearance="pill" variant={variant} size={size}>
              <Tabs.List aria-label="기간">
                <Tabs.Trigger value="day">일</Tabs.Trigger>
                <Tabs.Trigger value="week">주</Tabs.Trigger>
                <Tabs.Trigger value="month">월</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="day">오늘</Tabs.Content>
              <Tabs.Content value="week">이번 주</Tabs.Content>
              <Tabs.Content value="month">이번 달</Tabs.Content>
            </Tabs>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Vertical">
        <Showcase.Row label="underline">
          <Tabs defaultValue="profile" orientation="vertical">
            <Tabs.List aria-label="설정">
              <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
              <Tabs.Trigger value="alerts">알림</Tabs.Trigger>
              <Tabs.Trigger value="account">계정</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile">이름과 사진</Tabs.Content>
            <Tabs.Content value="alerts">알림 받을 곳</Tabs.Content>
            <Tabs.Content value="account">비밀번호와 탈퇴</Tabs.Content>
          </Tabs>
        </Showcase.Row>
        <Showcase.Row label="pill">
          <Tabs defaultValue="profile" orientation="vertical" appearance="pill">
            <Tabs.List aria-label="설정">
              <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
              <Tabs.Trigger value="alerts">알림</Tabs.Trigger>
              <Tabs.Trigger value="account">계정</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile">이름과 사진</Tabs.Content>
            <Tabs.Content value="alerts">알림 받을 곳</Tabs.Content>
            <Tabs.Content value="account">비밀번호와 탈퇴</Tabs.Content>
          </Tabs>
        </Showcase.Row>
        <Showcase.Row label="enclosed">
          <Tabs defaultValue="profile" orientation="vertical" appearance="enclosed">
            <Tabs.List aria-label="설정">
              <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
              <Tabs.Trigger value="alerts">알림</Tabs.Trigger>
              <Tabs.Trigger value="account">계정</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile">이름과 사진</Tabs.Content>
            <Tabs.Content value="alerts">알림 받을 곳</Tabs.Content>
            <Tabs.Content value="account">비밀번호와 탈퇴</Tabs.Content>
          </Tabs>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled trigger">
          <Tabs defaultValue="profile">
            <Tabs.List aria-label="설정">
              <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
              <Tabs.Trigger value="alerts" disabled>
                알림
              </Tabs.Trigger>
              <Tabs.Trigger value="account">계정</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile">이름과 사진</Tabs.Content>
            <Tabs.Content value="alerts">알림 받을 곳</Tabs.Content>
            <Tabs.Content value="account">비밀번호와 탈퇴</Tabs.Content>
          </Tabs>
        </Showcase.Row>
        <Showcase.Row label="icons">
          <Tabs defaultValue="profile" appearance="pill">
            <Tabs.List aria-label="설정">
              <Tabs.Trigger value="profile">
                <UserIcon />
                프로필
              </Tabs.Trigger>
              <Tabs.Trigger value="alerts">
                <BellIcon />
                알림
              </Tabs.Trigger>
              <Tabs.Trigger value="account">
                <Cog6ToothIcon />
                계정
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile">이름과 사진</Tabs.Content>
            <Tabs.Content value="alerts">알림 받을 곳</Tabs.Content>
            <Tabs.Content value="account">비밀번호와 탈퇴</Tabs.Content>
          </Tabs>
        </Showcase.Row>
        <Showcase.Row label="full width" className="w-full max-w-md">
          <Tabs defaultValue="new" className="w-full">
            <Tabs.List aria-label="정렬" className="w-full">
              <Tabs.Trigger value="new" className="flex-1">
                최신
              </Tabs.Trigger>
              <Tabs.Trigger value="popular" className="flex-1">
                인기
              </Tabs.Trigger>
              <Tabs.Trigger value="comments" className="flex-1">
                댓글 많은
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="new">최신 글</Tabs.Content>
            <Tabs.Content value="popular">인기 글</Tabs.Content>
            <Tabs.Content value="comments">댓글 많은 글</Tabs.Content>
          </Tabs>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  render: (args) => (
    <Tabs defaultValue="overview" onValueChange={args.onValueChange}>
      <Tabs.List aria-label="상품 정보">
        <Tabs.Trigger value="overview">개요</Tabs.Trigger>
        <Tabs.Trigger value="specs" disabled>
          사양
        </Tabs.Trigger>
        <Tabs.Trigger value="reviews">리뷰</Tabs.Trigger>
        <Tabs.Trigger value="qna">Q&A</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">가볍고 오래 가는 무선 키보드입니다.</Tabs.Content>
      <Tabs.Content value="specs">무게 450g</Tabs.Content>
      <Tabs.Content value="reviews">리뷰 128개, 평균 4.6점.</Tabs.Content>
      <Tabs.Content value="qna">질문 12개에 모두 답했습니다.</Tabs.Content>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '탭 목록 전체가 Tab 한 칸이고 고른 탭에 멈춥니다. 화살표가 포커스와 선택을 함께 옮기고, 비활성 탭은 건너뛰며, 끝에서 처음으로 돌아갑니다. Tab 을 한 번 더 누르면 내용으로 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('tablist')).toHaveAccessibleName('상품 정보');
    await userEvent.tab();
    await expect(canvas.getByRole('tab', { name: '개요' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: '리뷰' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: '리뷰' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith('reviews');
    await expect(canvas.getByRole('tabpanel')).toHaveAccessibleName('리뷰');
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Q&A' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: '개요' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Q&A' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: '개요' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      '가볍고 오래 가는 무선 키보드입니다.',
    );
  },
};

export const ManualActivation: Story = {
  render: (args) => (
    <Tabs defaultValue="inbox" activationMode="manual" onValueChange={args.onValueChange}>
      <Tabs.List aria-label="메일함">
        <Tabs.Trigger value="inbox">받은 편지</Tabs.Trigger>
        <Tabs.Trigger value="sent">보낸 편지</Tabs.Trigger>
        <Tabs.Trigger value="spam">스팸</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="inbox">새 메일 3통</Tabs.Content>
      <Tabs.Content value="sent">보낸 메일 12통</Tabs.Content>
      <Tabs.Content value="spam">스팸 없음</Tabs.Content>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`activationMode="manual"` 이면 화살표는 포커스만 옮기고 Enter 나 Space 가 탭을 고릅니다. 내용을 그리는 데 오래 걸릴 때 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: '보낸 편지' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: '보낸 편지' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('tab', { name: '보낸 편지' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('보낸 메일 12통');
    await userEvent.keyboard('{ArrowRight} ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('spam');
  },
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="profile" orientation="vertical" appearance="pill">
      <Tabs.List aria-label="설정">
        <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
        <Tabs.Trigger value="alerts">알림</Tabs.Trigger>
        <Tabs.Trigger value="account">계정</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="profile">이름과 사진을 바꿉니다.</Tabs.Content>
      <Tabs.Content value="alerts">알림을 받을 곳을 고릅니다.</Tabs.Content>
      <Tabs.Content value="account">비밀번호를 바꾸거나 탈퇴합니다.</Tabs.Content>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '세로 탭은 목록이 앞에, 내용이 옆에 놓이고 위아래 화살표로 옮깁니다. 좌우 화살표는 가로채지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: '프로필' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('tab', { name: '알림' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('알림을 받을 곳을 고릅니다.');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(canvas.getByRole('tab', { name: '계정' })).toHaveFocus();
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Tabs defaultValue="one">
        <Tabs.List aria-label="단계">
          <Tabs.Trigger value="one">하나</Tabs.Trigger>
          <Tabs.Trigger value="two">둘</Tabs.Trigger>
          <Tabs.Trigger value="three">셋</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">첫째</Tabs.Content>
        <Tabs.Content value="two">둘째</Tabs.Content>
        <Tabs.Content value="three">셋째</Tabs.Content>
      </Tabs>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '오른쪽에서 왼쪽으로 쓰는 화면에서는 왼쪽 화살표가 다음 탭으로 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: '둘' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: '하나' })).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [tab, setTab] = useState<'profile' | 'alerts'>('profile');

    return (
      <div className="flex flex-col items-start gap-3">
        <Tabs value={tab} onValueChange={setTab} appearance="pill" variant="outline">
          <Tabs.List aria-label="설정">
            <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
            <Tabs.Trigger value="alerts">알림</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="profile">이름과 사진</Tabs.Content>
          <Tabs.Content value="alerts">알림 받을 곳</Tabs.Content>
        </Tabs>
        <Button variant="outline" onClick={() => setTab('alerts')}>
          알림 설정으로
        </Button>
        <output aria-label="탭 값">{tab}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`value` 와 `onValueChange` 로 바깥에서 탭을 바꿉니다. `useState` 의 타입이 탭 값의 타입이 되어, 없는 값을 주면 컴파일 오류입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '알림 설정으로' }));
    await expect(canvas.getByRole('tab', { name: '알림' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(canvas.getByRole('tab', { name: '프로필' }));
    await expect(canvas.getByLabelText('탭 값')).toHaveTextContent('profile');
  },
};

export const ForceMount: Story = {
  render: () => (
    <Tabs defaultValue="write" appearance="enclosed">
      <Tabs.List aria-label="댓글">
        <Tabs.Trigger value="write">쓰기</Tabs.Trigger>
        <Tabs.Trigger value="preview">미리보기</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="write" forceMount className="p-1">
        <TextField
          aria-label="댓글"
          placeholder="댓글을 남겨 주세요"
          data-1p-ignore
          data-lpignore="true"
        />
      </Tabs.Content>
      <Tabs.Content value="preview" forceMount>
        미리보기에 들어갈 글은 페이지 안 찾기로도 찾을 수 있습니다.
      </Tabs.Content>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '고르지 않은 내용은 기본으로 그리지 않습니다. `forceMount` 를 주면 숨긴 채 남겨서 입력한 값과 스크롤이 그대로 있고, 브라우저의 페이지 안 찾기가 숨은 글을 찾으면 그 탭을 엽니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: '댓글' }), '좋아요');
    await userEvent.click(canvas.getByRole('tab', { name: '미리보기' }));
    await expect(canvas.getByRole('textbox', { name: '댓글', hidden: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: '쓰기' }));
    await expect(canvas.getByRole('textbox', { name: '댓글' })).toHaveValue('좋아요');
  },
};

export const TypedParts: Story = {
  render: function Render() {
    const [section, setSection] = useState<'docs' | 'api'>('docs');

    return (
      <Tabs value={section} onValueChange={setSection} appearance="pill">
        {({ List, Trigger, Content }) => (
          <>
            <List aria-label="문서">
              <Trigger value="docs">문서</Trigger>
              <Trigger value="api">API</Trigger>
            </List>
            <Content value="docs">시작하기와 가이드</Content>
            <Content value="api">모든 컴포넌트의 속성</Content>
          </>
        )}
      </Tabs>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'children 을 함수로 쓰면 탭 값의 타입으로 좁힌 `List`, `Trigger`, `Content` 를 받습니다. 없는 `value` 는 컴파일 오류입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'API' }));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('모든 컴포넌트의 속성');
    await expect(tabs()).toHaveLength(2);
  },
};

export const DevelopmentWarnings: Story = {
  render: function Render() {
    const [shown, setShown] = useState(false);

    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="outline" onClick={() => setShown(true)}>
          잘못 쓴 예 보기
        </Button>
        {shown && (
          <Tabs defaultValue="missing">
            <Tabs.List aria-label="잘못 쓴 탭">
              <Tabs.Trigger value="a">A</Tabs.Trigger>
              <Tabs.Trigger value="b">B</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="a">A 내용</Tabs.Content>
            <Tabs.Content value="c">C 내용</Tabs.Content>
          </Tabs>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '개발 모드에서는 내용이 없는 탭, 탭이 없는 내용, 어느 탭과도 맞지 않는 값을 콘솔에 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await userEvent.click(canvas.getByRole('button', { name: '잘못 쓴 예 보기' }));
    await expect(canvas.getByRole('tablist')).toBeVisible();
    if (isDevelopment)
      await waitFor(() => {
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Tabs.Trigger value="b"'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Tabs.Content value="c"'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('value="missing"'));
      });
    warn.mockRestore();
  },
};
