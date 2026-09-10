import { useState } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Badge } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const COLOR_SCHEMES = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { variant: 'soft', colorScheme: 'neutral', size: 'standard', children: 'Beta' },
  argTypes: {
    variant: { control: 'radio', options: ['solid', 'soft', 'outline'] },
    colorScheme: { control: 'select', options: COLOR_SCHEMES },
    size: { control: 'radio', options: ['standard', 'tiny'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    const badge = canvas.getByText('Beta');
    // 인터랙션 prop이 없으면 정적 라벨이다.
    await expect(badge).not.toHaveAttribute('role');
    await expect(badge).not.toHaveAttribute('tabindex');
  },
};

export const ColorSchemes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['solid', 'soft', 'outline'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          {COLOR_SCHEMES.map((colorScheme) => (
            <Badge key={colorScheme} variant={variant} colorScheme={colorScheme}>
              {colorScheme}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="standard">standard</Badge>
      <Badge size="tiny">tiny</Badge>
    </div>
  ),
};

export const WithIconAndLabel: Story = {
  render: () => (
    <Badge colorScheme="success">
      <Badge.Icon aria-hidden>✓</Badge.Icon>
      <Badge.Label>Done</Badge.Label>
    </Badge>
  ),
};

/** 다른 element 모서리에 붙일 때는 부모가 relative, Badge가 absolute다. */
export const AttachedCount: Story = {
  render: () => (
    <div className="relative inline-block p-2">
      <span aria-hidden className="text-2xl">
        🔔
      </span>
      <Badge
        colorScheme="danger"
        variant="solid"
        size="tiny"
        className="absolute top-0 right-0"
        aria-label="읽지 않은 알림 3개"
      >
        3
      </Badge>
    </div>
  ),
};

export const Clickable: Story = {
  render: function Clickable() {
    const [clicks, setClicks] = useState(0);

    return (
      <div className="flex items-center gap-2">
        <Badge onClick={() => setClicks((prev) => prev + 1)}>Filter</Badge>
        <output data-testid="clicks">{clicks}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByRole('button', { name: 'Filter' });
    await expect(badge).toHaveAttribute('tabindex', '0');
    // 토글이 아니면 aria-pressed를 달지 않는다.
    await expect(badge).not.toHaveAttribute('aria-pressed');

    await userEvent.click(badge);
    await expect(canvas.getByTestId('clicks')).toHaveTextContent('1');

    badge.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('clicks')).toHaveTextContent('2');
  },
};

export const Toggle: Story = {
  render: function Toggle() {
    const [following, setFollowing] = useState(false);

    return (
      <Badge colorScheme="primary" selected={following} onSelectedChange={setFollowing}>
        {following ? 'Following' : 'Follow'}
      </Badge>
    );
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByRole('button', { name: 'Follow' });
    await expect(badge).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(badge);
    const selected = canvas.getByRole('button', { name: 'Following' });
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await expect(selected).toHaveAttribute('data-selected');
  },
};

export const Removable: Story = {
  render: function Removable() {
    const [tags, setTags] = useState(['frontend', 'react', 'design']);

    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag}>
            <Badge.Label>{tag}</Badge.Label>
            <Badge.Close
              aria-label={`${tag} 삭제`}
              onClose={() => setTags((prev) => prev.filter((t) => t !== tag))}
            />
          </Badge>
        ))}
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'react 삭제' }));
    await expect(canvas.queryByText('react')).not.toBeInTheDocument();
    await expect(canvas.getByText('frontend')).toBeInTheDocument();
  },
};

/** Close는 부모 Badge의 토글까지 같이 터뜨리지 않는다. */
export const CloseDoesNotToggle: Story = {
  render: function CloseDoesNotToggle() {
    const [selected, setSelected] = useState(false);
    const [closed, setClosed] = useState(0);

    return (
      <div className="flex items-center gap-2">
        <Badge colorScheme="primary" selected={selected} onSelectedChange={setSelected}>
          <Badge.Label>태그</Badge.Label>
          <Badge.Close aria-label="태그 삭제" onClose={() => setClosed((prev) => prev + 1)} />
        </Badge>
        <output data-testid="state">
          {String(selected)} / {closed}
        </output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '태그 삭제' }));
    await expect(canvas.getByTestId('state')).toHaveTextContent('false / 1');
  },
};
