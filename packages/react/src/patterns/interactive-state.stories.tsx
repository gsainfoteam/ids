import { useState, type ReactNode } from 'react';

import { InfoIcon } from '@phosphor-icons/react';

import { Button } from '../components/button';
import {
  INTERACTIVE_STATE_DEFAULTS,
  type InteractiveState,
} from '../hooks/use-interactive';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * 인터랙션 state를 어디에 둘지.
 *
 * - **노드 로컬** — `variant={(s) => …}` / `children={(s) => …}` (컴포넌트 안)
 * - **sibling JS** — `onInteractionChange`로 부모가 mirror (소유권은 컴포넌트)
 * - **sibling 스타일만** — Tailwind `group` / `peer` + `data-*` (이 스토리 범위 밖)
 */
const meta: Meta = {
  title: 'Patterns/Interactive state',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-(--ids-color-on-muted) uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function StateDump({ state }: { state: InteractiveState }) {
  return (
    <pre className="rounded-lg bg-(--ids-color-muted) px-3 py-2 font-mono text-xs text-(--ids-color-on-muted)">
      {JSON.stringify(state, null, 2)}
    </pre>
  );
}

/** 컴포넌트 prop만 state에 묶는다. sibling은 이 state를 모른다. */
export const NodeLocal: Story = {
  name: 'Node-local (InteractiveValue)',
  render: () => (
    <Section title="Button 안에서만 state 사용">
      <Button variant={(s) => (s.hovered ? 'solid' : 'outline')}>
        {(s) => (s.hovered ? 'Hovered' : 'Idle')}
      </Button>
    </Section>
  ),
};

/**
 * sibling이 JS로 같은 인터랙션에 반응해야 하면
 * `onInteractionChange`로 부모가 mirror한다. (Style + 훅 조립 불필요)
 */
export const MirrorToParent: Story = {
  name: 'Mirror (sibling)',
  render: function MirrorExample() {
    const [interaction, setInteraction] = useState<InteractiveState>(INTERACTIVE_STATE_DEFAULTS);

    return (
      <div className="flex max-w-md flex-col gap-6">
        <Section title="Button 소유 → onInteractionChange로 sibling">
          <div className="flex items-center gap-3">
            <Button variant="outline" onInteractionChange={setInteraction}>
              Hover me
            </Button>
            {interaction.hovered ? (
              <span className="flex items-center gap-1 text-sm text-(--ids-color-primary)">
                <InfoIcon className="size-4" weight="bold" />
                sibling hint
              </span>
            ) : (
              <span className="text-sm text-(--ids-color-on-muted)">…</span>
            )}
          </div>
        </Section>

        <Section title="mirror된 state">
          <StateDump state={interaction} />
        </Section>
      </div>
    );
  },
};
