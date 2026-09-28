import { useEffect, useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { Toggle } from '../../action/toggle';
import { ToggleGroup } from '../../action/toggle-group';

import { Toaster, toast, type ToastOptions } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Feedback/Toast',
  component: Toaster,
  tags: ['autodocs'],
  beforeEach: () => {
    toast.dismissAll();
    return () => toast.dismissAll();
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
    max: { control: { type: 'number', min: 1, max: 10 } },
    gap: { control: { type: 'number', min: 0, max: 32 } },
    offset: { control: { type: 'number', min: 0, max: 64 } },
    expand: { control: 'boolean' },
  },
  args: {
    placement: 'bottom-right',
    max: 3,
    gap: 14,
    offset: 24,
    expand: false,
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('저장했습니다', { description: '바꾼 내용이 모두 반영됐습니다.' })
        }
      >
        알림 띄우기
      </Button>
      <Toaster {...args} />
    </>
  ),
};

type Sample = { key: string; label: string; show: (options: ToastOptions) => void };

const kinds: readonly Sample[] = [
  { key: 'neutral', label: 'toast', show: (options) => toast('새 댓글이 달렸습니다', options) },
  { key: 'info', label: 'info', show: (options) => toast.info('점검이 예정돼 있습니다', options) },
  { key: 'success', label: 'success', show: (options) => toast.success('저장했습니다', options) },
  {
    key: 'warning',
    label: 'warning',
    show: (options) => toast.warning('저장 공간이 거의 찼습니다', options),
  },
  { key: 'danger', label: 'error', show: (options) => toast.error('보내지 못했습니다', options) },
  { key: 'loading', label: 'loading', show: (options) => toast.loading('올리는 중', options) },
];

const contents = ['message', 'description', 'action'] as const;

function optionsFor(content: (typeof contents)[number], id?: string): ToastOptions {
  if (content === 'description') return { id, description: '자세한 내용은 설정에서 확인하세요.' };
  if (content === 'action')
    return { id, action: { label: '되돌리기', onClick: () => toast('되돌렸습니다') } };
  return { id };
}

function GalleryStack() {
  useEffect(() => {
    kinds.forEach((kind, index) =>
      kind.show({
        ...optionsFor(contents[index % contents.length]!, `gallery-${kind.key}`),
        duration: Infinity,
      }),
    );
    return () => {
      for (const kind of kinds) toast.dismiss(`gallery-${kind.key}`);
    };
  }, []);
  return <Toaster expand max={kinds.length} />;
}

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Color scheme × Content"
        description="의미는 Alert 와 같은 색과 아이콘을 씁니다. warning 과 error 는 role=alert 로 바로 알리고, 나머지는 role=status 로 기다렸다 알립니다. 오른쪽 아래에 한 벌이 펼쳐져 있습니다."
      >
        <Showcase.Matrix
          rows={kinds.map((kind) => kind.label)}
          columns={contents}
          render={(label, content) => (
            <Button
              size="tiny"
              variant="outline"
              onClick={() => kinds.find((kind) => kind.label === label)!.show(optionsFor(content))}
            >
              {content}
            </Button>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="Stack"
        description="새 알림이 앞에 오고, 뒤의 알림은 5% 씩 작아진 채 가장자리만 보입니다. 올려 두거나 포커스하면 펼쳐지고 시간이 멈춥니다. expand 는 늘 펼쳐 둡니다."
      >
        <Showcase.Row label="expand">
          <GalleryStack />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getAllByRole('alert')).toHaveLength(2));
    expect(canvas.getAllByRole('status')).toHaveLength(4);
  },
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ToastPromise: Story = {
  name: 'Promise',
  render: () => (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(
            wait(400).then(() => 'report.pdf'),
            {
              loading: '올리는 중',
              success: (name) => `${name} 을 올렸습니다`,
              error: '올리지 못했습니다',
            },
          )
        }
      >
        파일 올리기
      </Button>
      <Toaster />
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '파일 올리기' }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('올리는 중'));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('report.pdf 을 올렸습니다'),
    );
  },
};

export const UpdateById: Story = {
  render: () => (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => toast.loading('내보내는 중', { id: 'export' })}>
          내보내기 시작
        </Button>
        <Button variant="outline" onClick={() => toast.success('내보냈습니다', { id: 'export' })}>
          완료
        </Button>
      </div>
      <Toaster />
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '내보내기 시작' }));
    const loading = await canvas.findByRole('status');
    await waitFor(() => expect(loading).toHaveTextContent('내보내는 중'));
    await userEvent.click(canvas.getByRole('button', { name: '완료' }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('내보냈습니다'));
    expect(canvas.getByRole('status')).toBe(loading);
  },
};

export const Action: Story = {
  render: function Render() {
    const [restored, setRestored] = useState(0);
    return (
      <>
        <p className="text-body-b3-regular">되돌린 횟수 {restored}</p>
        <Button
          variant="outline"
          colorScheme="danger"
          onClick={() =>
            toast('메일을 지웠습니다', {
              duration: Infinity,
              action: { label: '되돌리기', onClick: () => setRestored((count) => count + 1) },
            })
          }
        >
          메일 지우기
        </Button>
        <Toaster />
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '메일 지우기' }));
    await userEvent.click(await canvas.findByRole('button', { name: '되돌리기' }));
    await waitFor(() => expect(canvas.getByText('되돌린 횟수 1')).toBeInTheDocument());
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument());
  },
};

const placements = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const satisfies readonly Toaster.Placement[];

export const Placement: Story = {
  render: function Render() {
    const [placement, setPlacement] = useState<Toaster.Placement>('bottom-right');
    return (
      <>
        <ToggleGroup<Toaster.Placement>
          aria-label="위치"
          required
          value={placement}
          onValueChange={(next) => next && setPlacement(next)}
        >
          {placements.map((value) => (
            <Toggle key={value} value={value}>
              {value}
            </Toggle>
          ))}
        </ToggleGroup>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => toast.info(`${placement} 에 떴습니다`)}
        >
          알림 띄우기
        </Button>
        <Toaster placement={placement} />
      </>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'top-center' }));
    await userEvent.click(canvas.getByRole('button', { name: '알림 띄우기' }));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('top-center 에 떴습니다'),
    );
    const region = canvasElement.querySelector<HTMLElement>('[data-toaster-region]')!;
    expect(region.dataset.placement).toBe('top-center');
    const view = canvasElement.ownerDocument.defaultView!;
    const box = region.getBoundingClientRect();
    expect(box.top).toBeLessThan(view.innerHeight / 2);
  },
};
