import { Showcase } from '~story-kit';

import { Button } from '../../components/action/button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Radius',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const surface = 'bg-(--ids-color-muted)/60 inset-ring-1 inset-ring-(--ids-color-border)';

function Measured({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${className} size-16 bg-(--ids-color-primary)/15 inset-ring-1 inset-ring-(--ids-color-primary)/40`}
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
        description="컨트롤은 크기와 상관없이 standard(12px)를 씁니다. 24px 미만 표시 요소만 indicator를 씁니다."
      >
        <Showcase.Row>
          <Measured className="rounded-standard" label="standard · 12px" />
          <Measured className="rounded-indicator" label="indicator · 4px" />
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
        description="concentric-p-* 컨테이너의 모서리는 안쪽 모서리 + 패딩입니다. 중첩되면 안쪽 컨테이너의 패딩까지 더해집니다."
      >
        <Showcase.Row label="1단계">
          <div className={`concentric-p-2 ${surface}`}>
            <Button>p-2 · 20px</Button>
          </div>
          <div className={`concentric-p-4 ${surface}`}>
            <Button>p-4 · 28px</Button>
          </div>
          <div className={`concentric-p-6 ${surface}`}>
            <Button>p-6 · 36px</Button>
          </div>
        </Showcase.Row>
        <Showcase.Row label="2단계">
          <div className={`concentric-p-4 ${surface}`}>
            <div className={`concentric-p-2 ${surface}`}>
              <Button>12 → 20 → 36px</Button>
            </div>
          </div>
        </Showcase.Row>
        <Showcase.Row label="3단계">
          <div className={`concentric-p-4 ${surface}`}>
            <div className={`concentric-p-4 ${surface}`}>
              <div className={`concentric-p-2 ${surface}`}>
                <Button>12 → 20 → 36 → 52px</Button>
              </div>
            </div>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};
