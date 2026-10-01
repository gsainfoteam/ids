import { useState } from 'react';

import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid';
import { expect, fn, spyOn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';
import { Spinner } from '../../feedback/spinner';

import { Button } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline', 'ghost', 'glossy'] as const;
const colorSchemes = ['primary', 'neutral', 'danger', 'success', 'warning', 'info'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Action/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    colorScheme: { control: 'select', options: colorSchemes },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    focusableWhenDisabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
  },
  args: {
    children: '저장',
    variant: 'solid',
    colorScheme: 'primary',
    size: 'standard',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Color scheme"
        description="solid와 soft는 색을 띱니다. outline과 ghost는 primary와 neutral에서 무채색이고, 상태 색에서는 글자만 그 색을 띱니다."
      >
        <Showcase.Matrix
          rows={colorSchemes}
          columns={variants}
          render={(colorScheme, variant) => (
            <Button colorScheme={colorScheme} variant={variant}>
              {colorScheme}
            </Button>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Button size={size} variant={variant}>
              {variant}
            </Button>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Icons"
        description="아이콘이 붙은 쪽의 안쪽 여백이 줄어듭니다. 크기를 주지 않은 아이콘은 버튼 크기를 따릅니다."
      >
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            <Button size={size}>
              <PlusIcon />새 글
            </Button>
            <Button size={size} variant="soft">
              다음
              <ArrowRightIcon />
            </Button>
            <Button size={size} variant="outline">
              <ArrowUpTrayIcon />
              내보내기
              <ChevronDownIcon />
            </Button>
            <Button size={size} variant="ghost" colorScheme="danger">
              <TrashIcon />
              삭제
            </Button>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </Showcase.Row>
        <Showcase.Row label="loading">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} disabled aria-busy>
              <Spinner decorative />
              저장 중
            </Button>
          ))}
          <Button size="tiny" disabled aria-busy>
            <Spinner decorative />
            저장 중
          </Button>
        </Showcase.Row>
        <Showcase.Row label="asChild">
          <Button asChild>
            <a href="#gallery">링크</a>
          </Button>
          <Button asChild variant="outline" disabled>
            <a href="#gallery">비활성 링크</a>
          </Button>
        </Showcase.Row>
        <Showcase.Row label="full width" className="max-w-sm">
          <Button className="w-full">
            <CheckIcon />
            확인
          </Button>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

const A_SAVE_TAKES = 2000;

export const Loading: Story = {
  render: function Render(args) {
    const [saving, setSaving] = useState(false);

    return (
      <Button
        disabled={saving}
        focusableWhenDisabled
        aria-busy={saving}
        onClick={(event) => {
          args.onClick?.(event);
          setSaving(true);
          setTimeout(() => setSaving(false), A_SAVE_TAKES);
        }}
      >
        {saving && <Spinner decorative />}
        {saving ? '저장 중' : '저장'}
      </Button>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '로딩은 prop이 아니라 합성입니다. disabled와 Spinner를 넣고, focusableWhenDisabled를 켜면 누른 버튼이 로딩 중에도 포커스를 잃지 않습니다. 로딩 중에는 클릭도 Enter도 다시 저장하지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: '저장' });
    await userEvent.click(button);
    await expect(button).toHaveAccessibleName('저장 중');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).not.toBeDisabled();
    await expect(button).toHaveFocus();
    await userEvent.click(button);
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(button).toHaveAccessibleName('저장'), {
      timeout: A_SAVE_TAKES * 2,
    });
    await expect(button).not.toHaveAttribute('aria-disabled');
    await expect(button).toHaveFocus();
  },
};

export const AsLink: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button asChild>
        <a href="#docs">문서 보기</a>
      </Button>
      <Button asChild variant="outline" disabled>
        <a href="#docs">준비 중</a>
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'asChild는 자식 요소를 버튼 모양으로 그립니다. 링크는 링크로 남고, 비활성 링크는 href와 탭 순서를 잃어 이동하지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '문서 보기' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#docs');
    await expect(link).not.toHaveAttribute('type');
    const disabled = canvas.getByRole('link', { name: '준비 중' });
    await expect(disabled).not.toHaveAttribute('href');
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(disabled).toHaveAttribute('tabindex', '-1');
  },
};

export const ColorScheme: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">취소</Button>
      <Button colorScheme="danger">삭제</Button>
      <span data-probe className="hidden text-(--ids-color-danger) ring-(--ids-color-danger)/40" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'colorScheme은 variant와 따로 움직입니다. 되돌릴 수 없는 동작은 danger로 칠하고, 옆의 보조 동작은 outline으로 조용히 둡니다. 포커스 링도 그 색을 따릅니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const probe = getComputedStyle(canvasElement.querySelector<HTMLElement>('[data-probe]')!);
    const danger = canvas.getByRole('button', { name: '삭제' });
    await expect(getComputedStyle(danger).backgroundColor).toBe(probe.color);
    await userEvent.tab();
    await userEvent.tab();
    await expect(danger).toHaveFocus();
    await expect(getComputedStyle(danger).getPropertyValue('--tw-ring-color')).toBe(
      probe.getPropertyValue('--tw-ring-color'),
    );
  },
};

export const FormSubmit: Story = {
  render: function Render() {
    const [result, setResult] = useState('');

    return (
      <form
        className="flex flex-col items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(String(new FormData(event.currentTarget).get('title')));
        }}
      >
        <input name="title" defaultValue="회의록" aria-label="제목" className="sr-only" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setResult('미리보기')}>
            미리보기
          </Button>
          <Button type="submit">제출</Button>
        </div>
        <output aria-label="결과">{result}</output>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'type을 생략하면 button이라 폼 안에 두어도 제출하지 않습니다. 제출 버튼에만 type="submit"을 적습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '미리보기' }));
    await expect(canvas.getByLabelText('결과')).toHaveTextContent('미리보기');
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('결과')).toHaveTextContent('회의록');
  },
};

export const StateProps: Story = {
  render: () => (
    <Button
      variant={(state) => (state.hovered ? 'solid' : 'outline')}
      className={(state) => (state.active ? 'scale-95' : undefined)}
    >
      {(state) => (state.focusVisible ? '키보드 포커스' : state.hovered ? '올려 둠' : '기본')}
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'className, style, children과 대부분의 prop은 상태를 받는 함수도 됩니다. 같은 상태가 data-hovered, data-active, data-focus-visible, data-disabled로 DOM에도 붙습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button');
    await userEvent.hover(button);
    await expect(button).toHaveTextContent('올려 둠');
    await expect(button).toHaveAttribute('data-hovered');
    await expect(button).toHaveAttribute('data-variant', 'solid');
    await userEvent.unhover(button);
    await userEvent.tab();
    await expect(button).toHaveTextContent('키보드 포커스');
    await expect(button).toHaveAttribute('data-focus-visible');
  },
};

export const DevelopmentWarnings: Story = {
  render: function Render() {
    const [shown, setShown] = useState(false);

    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="outline" onClick={() => setShown(true)}>
          잘못 쓴 예 보기
        </Button>
        {shown && (
          <div className="flex gap-2">
            <Button aria-label="추가">
              <PlusIcon />
            </Button>
            <Button asChild variant="soft">
              <span>
                바깥
                <Button size="tiny">안쪽</Button>
              </span>
            </Button>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '개발 빌드에서는 잘못 쓴 버튼을 콘솔에 알립니다. 아이콘만 든 Button은 IconButton을 권하고, 버튼 안의 버튼은 ButtonGroup을 권합니다. 버튼 안의 버튼은 일부러 보여 주는 잘못된 예라 이 스토리만 axe 의 nested-interactive 검사를 끕니다.',
      },
    },
    a11y: { options: { rules: { 'nested-interactive': { enabled: false } } } },
  },
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await userEvent.click(canvas.getByRole('button', { name: '잘못 쓴 예 보기' }));
    if (isDevelopment) {
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('shows only an icon')),
      );
      await expect(warn).toHaveBeenCalledWith(expect.stringContaining('cannot sit inside Button'));
    }
    warn.mockRestore();
  },
};
