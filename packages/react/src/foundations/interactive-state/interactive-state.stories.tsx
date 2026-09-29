import { useState } from 'react';

import { InformationCircleIcon } from '@heroicons/react/16/solid';
import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../components/action/button';
import { INTERACTIVE_STATE_DEFAULTS, type InteractiveState } from '../../hooks/use-interactive';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/InteractiveState',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function StateDump({ state }: { state: InteractiveState }) {
  return (
    <pre
      data-testid="state"
      className="rounded-standard text-caption-c1-regular bg-(--ids-color-muted) px-3 py-2 font-mono text-(--ids-color-on-muted)"
    >
      {JSON.stringify(state, null, 2)}
    </pre>
  );
}

export const NodeLocal: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="컴포넌트 안에서"
        description="variant, className, children에 (state) => 값을 넘기면 그 컴포넌트와 자손만 상태에 반응합니다. DOM에는 data-hovered, data-active, data-focus-visible이 붙어 CSS만으로도 꾸밀 수 있습니다."
      >
        <Showcase.Row label="함수 prop">
          <Button variant={(state) => (state.hovered ? 'solid' : 'outline')}>
            {(state) => (state.hovered ? '올라왔어요' : '올려 보세요')}
          </Button>
        </Showcase.Row>
        <Showcase.Row label="data-* 스타일">
          <Button variant="outline" className="data-hovered:inset-ring-(--ids-color-primary)">
            data-hovered로 테두리
          </Button>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: '올려 보세요' });
    await userEvent.hover(button);
    await waitFor(() => expect(button).toHaveTextContent('올라왔어요'));
    await expect(button).toHaveAttribute('data-hovered');
    await userEvent.unhover(button);
    await waitFor(() => expect(button).toHaveTextContent('올려 보세요'));
  },
};

export const Mirror: Story = {
  render: function Render() {
    const [interaction, setInteraction] = useState<InteractiveState>(INTERACTIVE_STATE_DEFAULTS);

    return (
      <Showcase>
        <Showcase.Section
          title="형제에게 알리기"
          description="옆 요소가 스크립트로 반응해야 하면 onInteractionChange로 상태의 사본을 받습니다. 상태의 주인은 여전히 Button입니다."
        >
          <Showcase.Row label="mirror">
            <Button variant="outline" onInteractionChange={setInteraction}>
              올려 보세요
            </Button>
            {interaction.hovered ? (
              <span className="text-body-b3-regular flex items-center gap-1 text-(--ids-color-accent)">
                <InformationCircleIcon className="size-4" />
                형제가 반응합니다
              </span>
            ) : (
              <span className="text-body-b3-regular text-(--ids-color-on-muted)">대기 중</span>
            )}
          </Showcase.Row>
          <Showcase.Row label="사본">
            <StateDump state={interaction} />
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button', { name: '올려 보세요' }));
    await waitFor(() => expect(canvas.getByText('형제가 반응합니다')).toBeInTheDocument());
    await expect(canvas.getByTestId('state')).toHaveTextContent('"hovered": true');
  },
};
