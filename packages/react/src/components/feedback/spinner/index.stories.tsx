import { useState } from 'react';

import { CheckIcon } from '@heroicons/react/16/solid';
import { expect, waitFor, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Field } from '../../form/field';
import { TextField } from '../../form/text-field';

import { Spinner } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const variants = ['solid', 'soft', 'outline', 'ghost'] as const;

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: [undefined, ...sizes] },
    decorative: { control: 'radio', options: [undefined, true, false] },
    'aria-label': { control: 'text' },
  },
  args: {},
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

const width = (element: Element | null) => element?.getBoundingClientRect().width ?? 0;
const token = (name: string) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Size"
        description="size를 주지 않으면 주변 글자 크기를 따릅니다. standard와 tiny는 아이콘 토큰 크기입니다."
      >
        <Showcase.Row label="auto">
          <span className="text-body-b1-regular">
            <Spinner /> b1
          </span>
          <span className="text-body-b3-regular">
            <Spinner /> b3
          </span>
          <span className="text-caption-c1-regular">
            <Spinner /> c1
          </span>
        </Showcase.Row>
        <Showcase.Row label="standard">
          <Spinner size="standard" />
        </Showcase.Row>
        <Showcase.Row label="tiny">
          <Spinner size="tiny" />
        </Showcase.Row>
        <Showcase.Row label="className">
          <Spinner className="size-8" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Button × Size"
        description="컨트롤 안에서는 그 컨트롤의 아이콘 크기가 되고 글자색을 따릅니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Button size={size} variant={variant} disabled>
              <Spinner />
              저장 중
            </Button>
          )}
        />
        <Showcase.Row label="IconButton">
          {sizes.map((size) => (
            <IconButton
              key={size}
              size={size}
              variant="outline"
              disabled
              aria-label="저장 중"
              icon={<Spinner />}
            />
          ))}
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Color" description="색은 currentColor입니다.">
        <Showcase.Row label="on-surface">
          <Spinner size="standard" />
        </Showcase.Row>
        <Showcase.Row label="primary">
          <Spinner size="standard" className="text-(--ids-color-primary)" />
        </Showcase.Row>
        <Showcase.Row label="on-muted">
          <Spinner size="standard" className="text-(--ids-color-on-muted)" />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const FollowsControl: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button disabled>
        <Spinner data-testid="standard" />
        저장 중
      </Button>
      <Button size="tiny" disabled>
        <Spinner data-testid="tiny" />
        저장 중
      </Button>
      <IconButton size="tiny" aria-label="새로고침 중" icon={<Spinner data-testid="icon" />} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Button과 IconButton은 크기를 주지 않은 아이콘을 자기 아이콘 크기로 맞춥니다. Spinner도 그 규칙을 그대로 따릅니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(width(canvas.getByTestId('standard'))).toBeCloseTo(
      token('--ids-size-icon-standard'),
    );
    await expect(width(canvas.getByTestId('tiny'))).toBeCloseTo(token('--ids-size-icon-tiny'));
    await expect(width(canvas.getByTestId('icon'))).toBeCloseTo(token('--ids-size-icon-tiny'));
  },
};

export const FollowsField: Story = {
  render: () => (
    <Field size="tiny">
      <Field.Label>아이디</Field.Label>
      <TextField defaultValue="infoteam" />
      <Field.Hint>
        <span className="inline-flex items-center gap-1">
          <Spinner data-testid="hint" /> 사용할 수 있는지 확인하는 중
        </span>
      </Field.Hint>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Field 안에서는 Field의 size를 따릅니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const spinner = canvas.getByTestId('hint');
    await expect(spinner).toHaveAttribute('data-size', 'tiny');
    await expect(width(spinner)).toBeCloseTo(token('--ids-size-icon-tiny'));
  },
};

export const Announcement: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(false);

    return (
      <div className="flex flex-col items-start gap-4">
        <Button variant="outline" onClick={() => setLoading((value) => !value)}>
          {loading ? '멈추기' : '불러오기'}
        </Button>
        {loading ? (
          <div className="flex items-center gap-2 text-(--ids-color-on-muted)">
            <Spinner aria-label="댓글을 불러오는 중" />
          </div>
        ) : (
          <p className="flex items-center gap-2">
            <CheckIcon className="size-4" /> 준비됨
          </p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '혼자 놓인 Spinner는 나타나고 잠시 뒤 role="status"에 이름을 적어 스크린 리더가 한 번 읽게 합니다. 이름은 aria-label로 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '불러오기' }));
    const status = canvas.getByRole('status');
    await waitFor(() => expect(status).toHaveTextContent('댓글을 불러오는 중'));
  },
};

export const SilentInsideControls: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button disabled aria-busy="true">
        <Spinner />
        저장 중
      </Button>
      <IconButton disabled aria-busy="true" aria-label="동기화 중" icon={<Spinner />} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '버튼, 링크, 라벨처럼 내용이 이름이 되는 요소 안에서는 스스로 조용해져 이름에 섞이지 않습니다. 이때 상태는 버튼 글자와 aria-busy가 전합니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument());
    const button = canvas.getByRole('button', { name: '저장 중' });
    await expect(within(button).queryByText('불러오는 중')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '동기화 중' })).toBeInTheDocument();
  },
};

export const Decorative: Story = {
  render: () => (
    <p className="flex items-center gap-2">
      <Spinner decorative />
      파일을 올리는 중입니다
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story: '옆 문장이 이미 로딩을 설명하면 decorative로 접근성 트리에서 뺍니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};
