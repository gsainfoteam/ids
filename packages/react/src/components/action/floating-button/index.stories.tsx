import { useState, type ComponentProps, type ReactNode } from 'react';

import {
  ArrowUpTrayIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { expect, fn, spyOn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';
import { Spinner } from '../../feedback/spinner';

import { FloatingButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline'] as const;
const colorSchemes = ['primary', 'neutral', 'danger', 'success', 'warning', 'info'] as const;
const sizes = ['standard', 'tiny'] as const;
const placements = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

// A transformed box becomes the containing block of the fixed buttons inside it, so a story can
// show a placement without covering the page.
function Frame({ children, dir, label }: { children: ReactNode; dir?: 'rtl'; label?: string }) {
  return (
    <div
      dir={dir}
      aria-label={label}
      data-frame=""
      className="rounded-standard relative h-64 w-full max-w-sm transform-[translateZ(0)] overflow-hidden border border-(--ids-color-border) bg-(--ids-color-muted)/40"
    >
      {children}
    </div>
  );
}

function ComposeIcon(props: ComponentProps<'svg'>) {
  return <PencilIcon {...props} />;
}
ComposeIcon.displayName = 'ComposeIcon';

const meta = {
  title: 'Action/FloatingButton',
  component: FloatingButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    colorScheme: { control: 'select', options: colorSchemes },
    size: { control: 'radio', options: sizes },
    placement: { control: 'select', options: placements },
    disabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
  },
  args: {
    'aria-label': '새 글 작성',
    children: <PlusIcon />,
    variant: 'solid',
    size: 'standard',
    placement: 'bottom-right',
    onClick: fn(),
  },
} satisfies Meta<typeof FloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const inFrame: NonNullable<Story['decorators']> = [
  (Story) => (
    <Frame>
      <Story />
    </Frame>
  ),
];

export const Playground: Story = { decorators: inFrame };

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Color scheme"
        description="떠 있는 버튼이라 모든 배경이 불투명합니다. soft도 뒤의 내용이 비치지 않습니다."
      >
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <FloatingButton
              className="static"
              colorScheme={colorScheme}
              variant={variant}
              aria-label={colorScheme}
            >
              <PlusIcon />
            </FloatingButton>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Shape × Size"
        description="아이콘만 있으면 원형, 보이는 글자가 있으면 모서리가 둥근 확장형입니다."
      >
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            <FloatingButton className="static" size={size} aria-label="새 글 작성">
              <PlusIcon />
            </FloatingButton>
            <FloatingButton className="static" size={size}>
              <PlusIcon />새 글 작성
            </FloatingButton>
            <FloatingButton className="static" size={size} variant="outline">
              <ChatBubbleLeftIcon />
              문의
            </FloatingButton>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled">
          <FloatingButton className="static" disabled aria-label="새 글 작성">
            <PlusIcon />
          </FloatingButton>
          <FloatingButton className="static" variant="soft" disabled>
            <PlusIcon />새 글 작성
          </FloatingButton>
        </Showcase.Row>
        <Showcase.Row label="loading">
          <FloatingButton className="static" disabled aria-busy aria-label="업로드 중">
            <Spinner decorative />
          </FloatingButton>
          <FloatingButton className="static" disabled aria-busy>
            <Spinner decorative />
            업로드 중
          </FloatingButton>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Placement">
        <Frame label="네 모서리">
          {placements.map((placement) => (
            <FloatingButton
              key={placement}
              placement={placement}
              size="tiny"
              aria-label={placement}
            >
              <PlusIcon />
            </FloatingButton>
          ))}
        </Frame>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Placement: Story = {
  render: () => (
    <Frame label="네 모서리">
      {placements.map((placement) => (
        <FloatingButton key={placement} placement={placement} size="tiny" aria-label={placement}>
          <PlusIcon />
        </FloatingButton>
      ))}
    </Frame>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'placement로 네 모서리 중 하나에 둡니다. 가장자리에서 24px에 기기의 safe area를 더한 만큼 떨어집니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const inset = (name: string) => getComputedStyle(canvas.getByRole('button', { name }));
    await expect([inset('top-left').top, inset('top-left').left]).toEqual(['24px', '24px']);
    await expect([inset('top-right').top, inset('top-right').right]).toEqual(['24px', '24px']);
    await expect([inset('bottom-left').bottom, inset('bottom-left').left]).toEqual([
      '24px',
      '24px',
    ]);
    await expect([inset('bottom-right').bottom, inset('bottom-right').right]).toEqual([
      '24px',
      '24px',
    ]);
  },
};

export const RightToLeft: Story = {
  render: () => (
    <Frame dir="rtl" label="오른쪽에서 왼쪽">
      <FloatingButton aria-label="작성">
        <PlusIcon />
      </FloatingButton>
    </Frame>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'left와 right는 읽는 방향을 따릅니다. 오른쪽에서 왼쪽으로 쓰는 화면에서 bottom-right는 왼쪽 아래, 곧 끝쪽에 놓입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const frame = canvasElement.querySelector<HTMLElement>('[data-frame]')!.getBoundingClientRect();
    const button = canvas.getByRole('button', { name: '작성' });
    await expect(getComputedStyle(button).left).toBe('24px');
    const box = button.getBoundingClientRect();
    await expect(box.left - frame.left).toBeLessThan(frame.right - box.right);
  },
};

export const Shape: Story = {
  decorators: inFrame,
  render: () => (
    <>
      <FloatingButton placement="bottom-left" aria-label="작성">
        <PlusIcon />
      </FloatingButton>
      <FloatingButton>
        <ArrowUpTrayIcon />
        업로드
      </FloatingButton>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '보이는 글자가 없으면 56px 원, 있으면 높이 56px에 모서리 10px인 확장형입니다. 확장형은 아이콘 쪽 여백이 조금 줄어듭니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const icon = canvas.getByRole('button', { name: '작성' });
    const extended = canvas.getByRole('button', { name: '업로드' });
    await expect(icon).toHaveAttribute('data-icon-only');
    await expect([icon.offsetWidth, icon.offsetHeight]).toEqual([56, 56]);
    await expect(getComputedStyle(icon).borderRadius).not.toBe('10px');
    await expect(extended).not.toHaveAttribute('data-icon-only');
    await expect(extended.offsetHeight).toBe(56);
    await expect(getComputedStyle(extended).borderTopLeftRadius).toBe('10px');
    await expect(getComputedStyle(extended).paddingInlineStart).toBe('16px');
  },
};

export const AutomaticLabel: Story = {
  decorators: inFrame,
  render: () => (
    <>
      <FloatingButton placement="bottom-left">
        <ComposeIcon />
      </FloatingButton>
      <FloatingButton>
        <PlusIcon />
      </FloatingButton>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '아이콘만 있고 aria-label이 없으면 아이콘에서 이름을 찾습니다(ComposeIcon → "Compose"). IconButton과 같은 규칙입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Compose' })).toBeVisible();
    // heroicons has no displayName; its function name survives only in development builds.
    if (isDevelopment) await expect(canvas.getByRole('button', { name: 'Plus' })).toBeVisible();
  },
};

function UploadButton({ onUpload }: { onUpload: () => void }) {
  const [uploading, setUploading] = useState(false);
  return (
    <FloatingButton
      disabled={uploading}
      focusableWhenDisabled
      aria-busy={uploading}
      onClick={() => {
        onUpload();
        setUploading(true);
        setTimeout(() => setUploading(false), 800);
      }}
    >
      {uploading ? <Spinner decorative /> : <CheckIcon />}
      {uploading ? '업로드 중' : '업로드'}
    </FloatingButton>
  );
}

export const Loading: Story = {
  decorators: inFrame,
  render: (args) => <UploadButton onUpload={() => args.onClick?.(undefined as never)} />,
  parameters: {
    docs: {
      description: {
        story:
          'Button처럼 disabled와 Spinner로 로딩을 그립니다. 스피너는 아이콘 크기(24px)로 들어가고, focusableWhenDisabled로 포커스를 지킵니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: '업로드' });
    await userEvent.click(button);
    await expect(button).toHaveAccessibleName('업로드 중');
    await expect(button).toHaveFocus();
    await expect((button.firstElementChild as HTMLElement).getBoundingClientRect().width).toBe(24);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(button).toHaveAccessibleName('업로드'));
  },
};

export const DisabledLink: Story = {
  decorators: inFrame,
  render: () => (
    <FloatingButton asChild disabled>
      <a href="#compose">
        <PlusIcon />새 글 작성
      </a>
    </FloatingButton>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'asChild로 링크를 그릴 수 있습니다. 비활성 링크는 href와 탭 순서를 잃고 눌러도 이동하지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const action = canvas.getByRole('link', { name: '새 글 작성' });
    await expect(action).not.toHaveAttribute('href');
    await expect(action).toHaveAttribute('aria-disabled', 'true');
    await expect(action).toHaveAttribute('tabindex', '-1');
  },
};

function Crowded() {
  const [shown, setShown] = useState(false);
  return (
    <>
      <button type="button" className="m-4 underline" onClick={() => setShown(true)}>
        겹치는 버튼 보기
      </button>
      {shown && (
        <>
          <FloatingButton aria-label="작성">
            <PlusIcon />
          </FloatingButton>
          <FloatingButton aria-label="문의">
            <ChatBubbleLeftIcon />
          </FloatingButton>
        </>
      )}
    </>
  );
}

export const DevelopmentWarnings: Story = {
  decorators: inFrame,
  render: () => <Crowded />,
  parameters: {
    docs: {
      description: {
        story:
          '개발 모드에서는 같은 자리에 겹쳐 놓인 버튼과, 이름을 찾지 못한 아이콘 버튼을 콘솔에 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await userEvent.click(canvas.getByRole('button', { name: '겹치는 버튼 보기' }));
    await expect(canvas.getByRole('button', { name: '문의' })).toBeVisible();
    // A production build, the static Storybook included, strips the warnings.
    if (isDevelopment)
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('cover each other')),
      );
    warn.mockRestore();
  },
};
