import { useState } from 'react';

import { SparklesIcon } from '@heroicons/react/16/solid';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Alert } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const schemes = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
const variants = ['solid', 'soft', 'outline', 'ghost'] as const;

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    colorScheme: { control: 'radio', options: schemes },
    variant: { control: 'radio', options: variants },
    open: { control: 'boolean' },
  },
  args: { colorScheme: 'info', variant: 'soft', onOpenChange: fn() },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-md">
      <Alert.Title>업데이트 가능</Alert.Title>
      <Alert.Description>v2.5.0이 출시되었습니다. 지금 설치하면 5분 걸립니다.</Alert.Description>
      <Alert.Actions>
        <Button size="tiny">설치</Button>
        <Button size="tiny" variant="ghost">
          나중에
        </Button>
      </Alert.Actions>
      <Alert.Close />
    </Alert>
  ),
};

const copy = {
  neutral: ['공지', '점검은 오전 2시에 끝납니다.'],
  info: ['업데이트 가능', 'v2.5.0이 출시되었습니다.'],
  success: ['저장 완료', '변경 사항이 저장되었습니다.'],
  warning: ['결제 정보 만료 임박', '5일 뒤 만료됩니다. 갱신해 주세요.'],
  danger: ['저장 실패', '네트워크 오류입니다. 다시 시도해 주세요.'],
} satisfies Record<Alert.ColorScheme, [string, string]>;

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Color scheme × Variant"
        description="variant는 강도, colorScheme은 의미입니다. 제목과 아이콘, 닫기 버튼만 의미 색을 쓰고 본문은 중립색입니다."
      >
        <Showcase.Matrix
          rows={schemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <Alert colorScheme={colorScheme} variant={variant} className="w-72">
              <Alert.Title>{copy[colorScheme][0]}</Alert.Title>
              <Alert.Description>{copy[colorScheme][1]}</Alert.Description>
              <Alert.Close />
            </Alert>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Anatomy" description="모든 파트는 생략할 수 있습니다.">
        <Showcase.Row label="title">
          <Alert colorScheme="success" className="w-80">
            <Alert.Title>저장했습니다</Alert.Title>
          </Alert>
        </Showcase.Row>
        <Showcase.Row label="description">
          <Alert className="w-80">
            <Alert.Description>본문만 있는 알림입니다.</Alert.Description>
          </Alert>
        </Showcase.Row>
        <Showcase.Row label="actions, close">
          <Alert colorScheme="warning" variant="outline" className="w-80">
            <Alert.Title>세션 만료 임박</Alert.Title>
            <Alert.Description>5분 뒤 자동으로 로그아웃됩니다.</Alert.Description>
            <Alert.Actions>
              <Button size="tiny" variant="outline">
                세션 연장
              </Button>
            </Alert.Actions>
            <Alert.Close />
          </Alert>
        </Showcase.Row>
        <Showcase.Row label="custom icon">
          <Alert colorScheme="neutral" variant="outline" className="w-80">
            <Alert.Icon>
              <SparklesIcon />
            </Alert.Icon>
            <Alert.Title>새 기능</Alert.Title>
            <Alert.Description>AI 어시스턴트가 추가되었습니다.</Alert.Description>
          </Alert>
        </Showcase.Row>
        <Showcase.Row label="no icon">
          <Alert colorScheme="info" className="w-80">
            <Alert.Icon hidden />
            <Alert.Title>아이콘 없이</Alert.Title>
          </Alert>
        </Showcase.Row>
        <Showcase.Row label="list">
          <Alert colorScheme="danger" variant="outline" className="w-80">
            <Alert.Title>다음 항목을 고쳐 주세요</Alert.Title>
            <Alert.Description>
              <ul>
                <li>이메일 형식이 올바르지 않습니다.</li>
                <li>비밀번호는 8자 이상이어야 합니다.</li>
              </ul>
            </Alert.Description>
          </Alert>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Roles: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Alert colorScheme="info">
        <Alert.Title>정보</Alert.Title>
      </Alert>
      <Alert colorScheme="danger">
        <Alert.Title>오류</Alert.Title>
      </Alert>
      <Alert colorScheme="warning" role="note">
        <Alert.Title>늘 떠 있는 안내</Alert.Title>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'warning과 danger는 읽던 것을 끊고 알리는 role="alert", 나머지는 기다렸다 알리는 role="status"입니다. 페이지에 늘 있는 안내라면 role을 직접 바꿉니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('정보');
    await expect(canvas.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    await expect(canvas.getByRole('alert')).toHaveTextContent('오류');
    await expect(canvas.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    const note = canvas.getByRole('note');
    await expect(note).not.toHaveAttribute('aria-live');
  },
};

export const Dismiss: Story = {
  render: () => (
    <div className="flex max-w-md flex-col items-start gap-3">
      <Alert colorScheme="warning" variant="outline">
        <Alert.Title>세션 만료 임박</Alert.Title>
        <Alert.Description>5분 뒤 자동으로 로그아웃됩니다.</Alert.Description>
        <Alert.Close />
      </Alert>
      <Button variant="outline">다음 버튼</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Alert.Close가 있으면 닫을 수 있습니다. 부모 상태 없이도 스스로 사라지고, 안에 있던 포커스는 다음 요소로 옮겨 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: '다음 버튼' })).toHaveFocus();
  },
};

export const EscapeCloses: Story = {
  render: () => (
    <Alert colorScheme="danger" className="max-w-md">
      <Alert.Title>저장 실패</Alert.Title>
      <Alert.Actions>
        <Button size="tiny">다시 시도</Button>
      </Alert.Actions>
      <Alert.Close />
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '포커스가 Alert 안에 있을 때 Escape로 닫습니다. 한글 조합 중에 누른 Escape는 조합만 취소합니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const retry = canvas.getByRole('button', { name: '다시 시도' });
    retry.focus();
    retry.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true }),
    );
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument());
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);

    return (
      <div className="flex max-w-md flex-col items-start gap-3">
        <Alert colorScheme="success" open={open} onOpenChange={setOpen}>
          <Alert.Title>업로드 완료</Alert.Title>
          <Alert.Close />
        </Alert>
        <Button variant="outline" onClick={() => setOpen(true)} disabled={open}>
          다시 보이기
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'open과 onOpenChange로 부모가 열림 상태를 가집니다. 닫힐 때는 짧게 사라지는 전환이 끝난 뒤에 빠집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: '다시 보이기' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('업로드 완료');
  },
};
