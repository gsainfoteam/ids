import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../components/action/button';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Radius',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const surface = cn('bg-(--ids-color-muted)/60 inset-ring-1 inset-ring-(--ids-color-border)');

function Measured({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          className,
          'size-16 bg-(--ids-color-primary)/15 inset-ring-1 inset-ring-(--ids-color-primary)/40',
        )}
      />
      <span className="text-caption-c1-medium text-(--ids-color-on-muted)">{label}</span>
    </div>
  );
}

export const Scale: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Scale"
        description="컨트롤은 크기와 상관없이 standard(10px)를 씁니다. 24px 미만 표시 요소만 indicator를 씁니다. container(16px)는 여백이 있는 상자가 커질 수 있는 최대값입니다."
      >
        <Showcase.Row>
          <Measured className="rounded-standard" label="standard · 10px" />
          <Measured className="rounded-indicator" label="indicator · 4px" />
          <Measured className="rounded-container" label="container · 16px" />
          <Measured className="rounded-full" label="full" />
        </Showcase.Row>
        <Showcase.Row label="standard">
          <Button>저장</Button>
          <Button variant="outline">취소</Button>
        </Showcase.Row>
        <Showcase.Row label="tiny">
          <Button size="tiny">저장</Button>
          <Button size="tiny" variant="outline">
            취소
          </Button>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Concentric: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="패딩만큼 커지는 모서리"
        description="concentric-p-* 컨테이너의 모서리는 안쪽 모서리 + 패딩이라, 얇은 여백 안에 컨트롤이 붙으면 두 곡선이 같은 중심을 가집니다."
      >
        <Showcase.Row label="동심원">
          <div data-radius="14" className={cn('concentric-p-1', surface)}>
            <Button>p-1 · 14px</Button>
          </div>
          <div data-radius="16" className={cn('concentric-p-1.5', surface)}>
            <Button>p-1.5 · 16px</Button>
          </div>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="container 에서 멈춤"
        description="여백이 크거나 상자가 겹쳐도 모서리는 container(16px)를 넘지 않습니다. 모서리에 글자나 빈 곳이 오는 Card, Dialog, Toast 가 과하게 둥글어지지 않습니다."
      >
        <Showcase.Row label="여백">
          <div data-radius="16" className={cn('concentric-p-2', surface)}>
            <Button>p-2 · 16px</Button>
          </div>
          <div data-radius="16" className={cn('concentric-p-4', surface)}>
            <Button>p-4 · 16px</Button>
          </div>
          <div data-radius="16" className={cn('concentric-p-6', surface)}>
            <Button>p-6 · 16px</Button>
          </div>
        </Showcase.Row>
        <Showcase.Row label="중첩">
          <div data-radius="16" className={cn('concentric-p-4', surface)}>
            <div data-radius="14" className={cn('concentric-p-1', surface)}>
              <Button>10 → 14 → 16px</Button>
            </div>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    for (const box of canvasElement.querySelectorAll<HTMLElement>('[data-radius]'))
      await expect(getComputedStyle(box).borderTopLeftRadius).toBe(`${box.dataset.radius}px`);
  },
};
