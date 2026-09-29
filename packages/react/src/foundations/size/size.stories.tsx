import { PlusIcon } from '@heroicons/react/16/solid';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import tokens from '../../../../core/tokens/size.json';
import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { TextField } from '../../components/form/text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Size',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes = Object.entries(tokens.size).map(([name, { $value }]) => ({ name, value: $value }));
const sizeScale = ['standard', 'tiny'] as const;

function Measured({ name, value }: { name: string; value: string }) {
  const isIcon = name.startsWith('icon-');
  return (
    <div
      data-size-token={name}
      data-value={value}
      className="grid grid-cols-[9rem_4rem_1fr] items-center gap-4"
    >
      <code className="text-body-b3-regular font-mono">--ids-size-{name}</code>
      <code
        data-resolved=""
        className="text-caption-c1-regular font-mono text-(--ids-color-on-muted)"
      />
      <span
        data-box=""
        className="rounded-indicator bg-(--ids-color-primary)/15 inset-ring-1 inset-ring-(--ids-color-primary)/40"
        style={{
          height: `var(--ids-size-${name})`,
          width: isIcon ? `var(--ids-size-${name})` : '6rem',
        }}
      />
    </div>
  );
}

function readResolved(element: HTMLElement | null) {
  for (const row of element?.querySelectorAll<HTMLElement>('[data-size-token]') ?? []) {
    const output = row.querySelector('[data-resolved]');
    if (output)
      output.textContent = getComputedStyle(row)
        .getPropertyValue(`--ids-size-${row.dataset.sizeToken}`)
        .trim();
  }
}

export const Scale: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="토큰"
        description="size.json 의 값입니다. 컨트롤 높이와 그 안 아이콘 크기로, IdsSize 의 standard 와 tiny 두 단계뿐입니다."
      >
        <div ref={readResolved} className="flex flex-col gap-3">
          {sizes.map(({ name, value }) => (
            <Measured key={name} name={name} value={value} />
          ))}
        </div>
      </Showcase.Section>
      <Showcase.Section
        title="컨트롤"
        description="Button, IconButton, 필드는 같은 높이와 아이콘 크기를 씁니다. 한 줄에 섞어 두어도 높이가 맞습니다."
      >
        {sizeScale.map((size) => (
          <Showcase.Row key={size} label={size}>
            <Button size={size}>
              <PlusIcon />
              추가
            </Button>
            <IconButton size={size} variant="outline" icon={<PlusIcon />} aria-label="추가" />
            <TextField size={size} aria-label="이름" placeholder="이름" className="w-48" />
          </Showcase.Row>
        ))}
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('[data-size-token]')];

    await expect(rows).toHaveLength(Object.keys(tokens.size).length);
    for (const row of rows) {
      await expect(row.querySelector('[data-resolved]')?.textContent).toBe(row.dataset.value);
      await expect(getComputedStyle(row.querySelector('[data-box]')!).height).toBe(
        row.dataset.value,
      );
    }
  },
};
