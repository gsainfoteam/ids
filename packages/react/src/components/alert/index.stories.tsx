import { useState, type ComponentProps, type ComponentType } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { expect, userEvent } from 'storybook/test';

import { Button } from '../button';

import { Alert } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const VARIANTS = ['info', 'success', 'warning', 'danger', 'neutral'] as const;

const VARIANT_ICONS: Record<
  (typeof VARIANTS)[number],
  ComponentType<ComponentProps<'svg'>> | null
> = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  danger: XCircleIcon,
  neutral: null,
};

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { variant: 'info' },
  argTypes: {
    variant: { control: 'radio', options: VARIANTS },
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
type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  render: (args) => (
    <Alert {...args}>
      <Alert.Title>업데이트 가능</Alert.Title>
      <Alert.Description>v2.5.0이 출시되었습니다.</Alert.Description>
    </Alert>
  ),
  play: async ({ canvas }) => {
    const alert = canvas.getByRole('status');
    await expect(alert).toHaveAttribute('aria-live', 'polite');
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => {
        const VariantIcon = VARIANT_ICONS[variant];
        return (
          <Alert key={variant} variant={variant}>
            {VariantIcon ? (
              <Alert.Icon>
                <VariantIcon />
              </Alert.Icon>
            ) : null}
            <Alert.Title>{variant}</Alert.Title>
            <Alert.Description>variant=&quot;{variant}&quot;</Alert.Description>
          </Alert>
        );
      })}
    </div>
  ),
};

export const AssertiveVariantsUseAlertRole: Story = {
  render: () => (
    <Alert variant="danger">
      <Alert.Title>저장 실패</Alert.Title>
      <Alert.Description>네트워크 오류. 다시 시도해주세요.</Alert.Description>
    </Alert>
  ),
  play: async ({ canvas }) => {
    const alert = canvas.getByRole('alert');
    await expect(alert).toHaveAttribute('aria-live', 'assertive');
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};

export const WithIcon: Story = {
  render: () => (
    <Alert variant="info">
      <Alert.Icon>
        <SparklesIcon />
      </Alert.Icon>
      <Alert.Title>새 기능 출시</Alert.Title>
      <Alert.Description>AI 어시스턴트가 추가되었습니다.</Alert.Description>
    </Alert>
  ),
  play: async ({ canvasElement, canvas }) => {
    await expect(canvas.getByRole('status').querySelector('[aria-hidden="true"]')).toContainElement(
      canvasElement.querySelector('svg'),
    );
  },
};

export const WithActions: Story = {
  render: () => (
    <Alert variant="warning">
      <Alert.Title>세션 만료 임박</Alert.Title>
      <Alert.Description>5분 뒤 자동 로그아웃됩니다.</Alert.Description>
      <Alert.Actions>
        <Button size="tiny">세션 연장</Button>
      </Alert.Actions>
    </Alert>
  ),
};

export const Dismissible: Story = {
  render: function Dismissible() {
    const [shown, setShown] = useState(true);

    return shown ? (
      <Alert variant="warning">
        <Alert.Title>세션 만료 임박</Alert.Title>
        <Alert.Description>5분 뒤 자동 로그아웃됩니다.</Alert.Description>
        <Alert.Close onClose={() => setShown(false)}>
          <XMarkIcon />
        </Alert.Close>
      </Alert>
    ) : (
      <p data-testid="closed">닫혔습니다.</p>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }));
    await expect(canvas.getByTestId('closed')).toBeInTheDocument();
  },
};

export const EscapeCloses: Story = {
  render: function EscapeCloses() {
    const [shown, setShown] = useState(true);

    return shown ? (
      <Alert variant="danger">
        <Alert.Title>저장 실패</Alert.Title>
        <Alert.Actions>
          <Button size="tiny">다시 시도</Button>
        </Alert.Actions>
        <Alert.Close onClose={() => setShown(false)}>
          <XMarkIcon />
        </Alert.Close>
      </Alert>
    ) : (
      <p data-testid="closed">닫혔습니다.</p>
    );
  },
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: '다시 시도' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByTestId('closed')).toBeInTheDocument();
  },
};

export const CustomClose: Story = {
  render: function CustomClose() {
    const [shown, setShown] = useState(true);

    return shown ? (
      <Alert variant="neutral">
        <Alert.Title>공지</Alert.Title>
        <Alert.Close aria-label="공지 닫기" onClose={() => setShown(false)}>
          <XMarkIcon />
        </Alert.Close>
      </Alert>
    ) : (
      <p data-testid="closed">닫혔습니다.</p>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '공지 닫기' }));
    await expect(canvas.getByTestId('closed')).toBeInTheDocument();
  },
};
