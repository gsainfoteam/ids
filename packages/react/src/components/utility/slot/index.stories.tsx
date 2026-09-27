import { useRef, useState, type ComponentProps } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Alert } from '../../feedback/alert';

import { Slot } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Utility/Slot',
  component: Slot,
  tags: ['autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Slot>;

export default meta;
type Story = StoryObj<typeof meta>;

// The pattern every IDS part with `asChild` follows.
function Tag({
  asChild = false,
  className,
  ...props
}: ComponentProps<'span'> & { asChild?: boolean }) {
  const Root = asChild ? Slot : 'span';
  return (
    <Root
      {...props}
      data-tag=""
      className={cn(
        'text-caption-c1-medium inline-flex h-6 items-center rounded-full bg-(--ids-color-primary)/10 px-2.5 text-(--ids-color-primary)',
        className,
      )}
    />
  );
}

export const Playground: Story = {
  render: () => (
    <Slot className="rounded-standard bg-(--ids-color-primary) px-4 py-2 text-(--ids-color-on-primary)">
      <a href="#slot">Slot이 감싼 링크</a>
    </Slot>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Slot이 감싼 링크' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveClass('rounded-standard');
  },
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="asChild"
        description="같은 스타일과 동작을 유지한 채 그려지는 태그만 바꿉니다."
      >
        <Showcase.Row label="span (기본)">
          <Tag>새 글</Tag>
        </Showcase.Row>
        <Showcase.Row label="a">
          <Tag asChild>
            <a href="#tag">링크 태그</a>
          </Tag>
        </Showcase.Row>
        <Showcase.Row label="button">
          <Tag asChild>
            <button type="button">버튼 태그</button>
          </Tag>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="IDS 파트"
        description="asChild를 받는 IDS 파트는 모두 Slot을 씁니다."
      >
        <Showcase.Row label="Alert.Title">
          <Alert className="w-80">
            <Alert.Title asChild>
              <h3>h3로 그린 제목</h3>
            </Alert.Title>
          </Alert>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const MergesClassName: Story = {
  render: () => (
    <Slot className="px-2 text-(--ids-color-primary)">
      <span className="px-4 underline">양쪽 className이 합쳐진다</span>
    </Slot>
  ),
  parameters: {
    docs: {
      description: {
        story: 'className은 둘을 합치고, 같은 속성을 다투면 Slot 쪽이 이깁니다(px-2).',
      },
    },
  },
  play: async ({ canvas }) => {
    const span = canvas.getByText('양쪽 className이 합쳐진다');
    await expect(span).toHaveClass('underline');
    await expect(span).toHaveClass('text-(--ids-color-primary)');
    await expect(span).toHaveClass('px-2');
    await expect(span).not.toHaveClass('px-4');
  },
};

export const MergesStyle: Story = {
  render: () => (
    <Slot style={{ color: 'var(--ids-color-primary)' }}>
      <span style={{ color: 'red', fontWeight: 600 }}>style 합치기</span>
    </Slot>
  ),
  parameters: {
    docs: { description: { story: 'style은 얕게 합쳐지고 겹치는 속성은 Slot 쪽이 이깁니다.' } },
  },
  play: async ({ canvas }) => {
    const span = canvas.getByText('style 합치기');
    await expect(span.style.fontWeight).toBe('600');
    await expect(span.style.color).toBe('var(--ids-color-primary)');
  },
};

function HandlersExample() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2">
      <Slot onClick={() => setLog((prev) => [...prev, 'slot'])}>
        <button type="button" onClick={() => setLog((prev) => [...prev, 'child'])}>
          둘 다 실행
        </button>
      </Slot>
      <Slot onClick={() => setLog((prev) => [...prev, 'skipped'])}>
        <button type="button" onClick={(event) => event.preventDefault()}>
          Slot 핸들러 막기
        </button>
      </Slot>
      <output data-testid="log">{log.join(' ')}</output>
    </div>
  );
}

export const Handlers: Story = {
  render: () => <HandlersExample />,
  parameters: {
    docs: {
      description: {
        story:
          '이벤트 핸들러는 자식 것이 먼저, 그다음 Slot 것이 실행됩니다. 자식이 preventDefault를 부르면 Slot 핸들러는 건너뜁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '둘 다 실행' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Slot 핸들러 막기' }));
    await expect(canvas.getByTestId('log')).toHaveTextContent('child slot');
    await expect(canvas.getByTestId('log')).not.toHaveTextContent('skipped');
  },
};

export const PropsAndRefs: Story = {
  render: function PropsAndRefs() {
    const slotRef = useRef<HTMLElement>(null);
    const childRef = useRef<HTMLButtonElement>(null);
    const [same, setSame] = useState('');
    return (
      <div className="flex flex-col gap-2">
        <Slot ref={slotRef} aria-label="Slot이 지정한 이름">
          <button
            type="button"
            ref={childRef}
            aria-label="자식이 지정한 이름"
            onClick={() =>
              setSame(String(slotRef.current !== null && slotRef.current === childRef.current))
            }
          >
            prop 충돌
          </button>
        </Slot>
        <output data-testid="same">{same}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '그 밖의 prop은 Slot 쪽이 이깁니다. ref는 양쪽 모두 같은 요소를 가리킵니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Slot이 지정한 이름' });
    await userEvent.click(button);
    await expect(canvas.getByTestId('same')).toHaveTextContent('true');
  },
};
