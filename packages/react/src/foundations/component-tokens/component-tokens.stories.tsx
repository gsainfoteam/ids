import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { TextField } from '../../components/form/text-field';
import { IdsProvider } from '../../components/utility/ids-provider';
import {
  IDS_COMPONENT_COLORS,
  IDS_COMPONENT_SHADOWS,
  IDS_SHADOWS,
} from '../../tokens/component-tokens';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/ComponentTokens',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const modes = ['light', 'dark'] as const;

const colorTokens = Object.entries(IDS_COMPONENT_COLORS);

const shadowTokens = Object.entries(IDS_COMPONENT_SHADOWS);

const panel = cn('w-max concentric-p-4 inset-ring-1 inset-ring-neutral');

const columnLabel = cn('text-caption-c1-medium text-neutral');

const tokenRow = cn('grid items-center gap-x-4');
const tokenColumns = { gridTemplateColumns: '13rem 12rem 2rem' };

function ColorRow({ token, role }: { token: string; role: string }) {
  return (
    <div data-component-token={token} className={tokenRow} style={tokenColumns}>
      <code className="text-body-b3-regular font-mono">{token}</code>
      <code className="text-caption-c1-regular text-neutral font-mono">{role}</code>
      <span
        data-token-swatch=""
        className="rounded-indicator inset-ring-neutral size-7 inset-ring-1"
        style={{ background: `var(--ids-color-${token})` }}
      />
      <span data-role-swatch="" hidden style={{ background: `var(--ids-color-${role})` }} />
    </div>
  );
}

function ShadowRow({ token, step }: { token: string; step: string }) {
  return (
    <div data-component-shadow={token} className={tokenRow} style={tokenColumns}>
      <code className="text-body-b3-regular font-mono">{token}</code>
      <code className="text-caption-c1-regular text-neutral font-mono">
        shadow-{step} · {IDS_SHADOWS[step as keyof typeof IDS_SHADOWS]}
      </code>
      <span
        data-token-swatch=""
        className="rounded-indicator bg-surface size-7"
        style={{ boxShadow: `var(--ids-${token})` }}
      />
    </div>
  );
}

function TokenTable() {
  return (
    <div className="flex flex-col gap-4">
      {modes.map((mode) => (
        <IdsProvider.Scope key={mode} mode={mode} className={panel}>
          <div data-token-table={mode} className="flex flex-col gap-2">
            <div className={tokenRow} style={tokenColumns}>
              <span className={columnLabel}>{mode}</span>
              <span className={columnLabel}>role</span>
            </div>
            {colorTokens.map(([token, roles]) => (
              <ColorRow key={token} token={token} role={roles[mode]} />
            ))}
            {shadowTokens.map(([token, steps]) => (
              <ShadowRow key={token} token={token} step={steps[mode]} />
            ))}
          </div>
        </IdsProvider.Scope>
      ))}
    </div>
  );
}

export const Table: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Component tokens"
        description="컴포넌트 토큰은 모드마다 시맨틱 역할 하나를 가리킵니다. 이름은 {속성}-{그룹}[-{부분}][-{변형}] 이고, 컴포넌트 코드는 dark: 대신 이 토큰을 씁니다."
      >
        <TokenTable />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    for (const mode of modes) {
      const table = canvasElement.querySelector<HTMLElement>(`[data-token-table="${mode}"]`)!;
      const rows = [...table.querySelectorAll<HTMLElement>('[data-component-token]')];

      await expect(rows.map((row) => row.dataset.componentToken)).toEqual(
        Object.keys(IDS_COMPONENT_COLORS),
      );
      for (const row of rows)
        await expect(
          getComputedStyle(row.querySelector('[data-token-swatch]')!).backgroundColor,
        ).toBe(getComputedStyle(row.querySelector('[data-role-swatch]')!).backgroundColor);
    }
  },
};

export const Surfaces: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="panel 과 band"
        description="bg-surface 은 Card, Dialog, 팝업의 면입니다. 다크 모드에서는 페이지보다 한 단계 밝아 그림자 없이도 떠 보입니다. bg-block 는 면 안의 띠이고, outline 컨트롤은 두 면 어디서나 테두리나 바탕으로 구분됩니다."
      >
        <div className="flex flex-col gap-4">
          {modes.map((mode) => (
            <IdsProvider.Scope
              key={mode}
              mode={mode}
              className="concentric-p-4 flex flex-wrap gap-4"
            >
              <Card variant="outline" className="w-72">
                <Card.Header>
                  <Card.Title>{mode} · bg-surface</Card.Title>
                  <Card.Description>shadow-surface 은 라이트 모드에서만 그립니다.</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-3">
                  <TextField aria-label="이름" placeholder="이름" />
                  <Button variant="outline">outline</Button>
                </Card.Content>
              </Card>
            </IdsProvider.Scope>
          ))}
        </div>
      </Showcase.Section>
    </Showcase>
  ),
};
