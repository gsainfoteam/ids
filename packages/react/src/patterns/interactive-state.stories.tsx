import type { ReactNode } from 'react';

import { InfoIcon } from '@phosphor-icons/react';

import { Button } from '../components/button';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../hooks/use-interactive';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * 인터랙션 state를 어디에 둘지.
 *
 * - **노드 로컬** — `variant={(s) => …}` / `children={(s) => …}` (컴포넌트 안)
 * - **sibling JS** — 부모가 `useInteractive`로 state를 들고 나눠 줌 (lift)
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
 * sibling이 JS로 같은 인터랙션에 반응해야 하면,
 * Button 내부에 Context를 심지 말고 부모가 `useInteractive`로 lift한다.
 */
export const LiftToParent: Story = {
  name: 'Lift (sibling)',
  render: function LiftExample() {
    const { state, handlers } = useInteractive<HTMLButtonElement>();

    return (
      <div className="flex max-w-md flex-col gap-6">
        <Section title="부모가 state 소유 → 버튼 + 힌트가 sibling">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={Button.Style({ variant: 'outline', size: 'standard' })}
              {...interactiveDataProps(state)}
              {...handlers}
            >
              Hover me
            </button>
            {state.hovered ? (
              <span className="flex items-center gap-1 text-sm text-(--ids-color-primary)">
                <InfoIcon className="size-4" weight="bold" />
                sibling hint
              </span>
            ) : (
              <span className="text-sm text-(--ids-color-on-muted)">…</span>
            )}
          </div>
        </Section>

        <Section title="현재 state">
          <StateDump state={state} />
        </Section>
      </div>
    );
  },
};
