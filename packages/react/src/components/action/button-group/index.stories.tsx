import { useState } from 'react';

import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  DocumentDuplicateIcon,
  MinusIcon,
  PlusIcon,
  ScissorsIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import { expect, spyOn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';
import { TextField } from '../../form/text-field';
import { Button } from '../button';
import { IconButton } from '../icon-button';

import { ButtonGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline', 'ghost', 'glossy'] as const;
const sizes = ['standard', 'tiny'] as const;
const orientations = ['horizontal', 'vertical'] as const;
const layouts = ['attached', 'spaced', 'tray'] as const;

const meta = {
  title: 'Action/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
    size: { control: 'radio', options: sizes },
    variant: { control: 'radio', options: variants },
    layout: { control: 'radio', options: layouts },
  },
  args: {
    'aria-label': '보관함 동작',
    orientation: 'horizontal',
    size: 'standard',
    variant: 'outline',
    layout: 'attached',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>보관</Button>
      <Button>신고</Button>
      <Button>미루기</Button>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant"
        description="그룹의 variant와 size는 안의 버튼이 따릅니다. 버튼에 직접 준 값이 이깁니다."
      >
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <ButtonGroup variant={variant} aria-label={`${variant} 그룹`}>
              <Button>보관</Button>
              <Button>신고</Button>
              <Button>미루기</Button>
            </ButtonGroup>
            <ButtonGroup variant={variant} aria-label="저장">
              <Button>저장</Button>
              <ButtonGroup.Separator />
              <IconButton icon={<ChevronDownIcon />} aria-label="저장 옵션" />
            </ButtonGroup>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Layout"
        description="attached 는 버튼을 이어 붙이고, spaced 는 띄웁니다. tray 는 테두리 막대 안에 버튼을 띄우고, 구분선을 짧게 긋고, 안의 버튼을 배경 없이 그립니다."
      >
        <Showcase.Matrix
          rows={layouts}
          columns={orientations}
          render={(layout, orientation) =>
            orientation === 'horizontal' ? (
              <ButtonGroup
                layout={layout}
                variant={layout === 'tray' ? undefined : 'outline'}
                aria-label={`${layout} 사진 넘기기`}
              >
                <IconButton icon={<ChevronLeftIcon />} aria-label="이전 사진" />
                <Button className="tabular-nums">3 / 12</Button>
                <IconButton icon={<ChevronRightIcon />} aria-label="다음 사진" />
                <ButtonGroup.Separator />
                <IconButton icon={<XMarkIcon />} aria-label="닫기" />
              </ButtonGroup>
            ) : (
              <ButtonGroup
                layout={layout}
                orientation="vertical"
                variant={layout === 'tray' ? undefined : 'outline'}
                aria-label={`${layout} 지도 확대`}
              >
                <IconButton icon={<PlusIcon />} aria-label="확대" />
                <IconButton icon={<MinusIcon />} aria-label="축소" />
                <ButtonGroup.Separator />
                <IconButton icon={<XMarkIcon />} aria-label="닫기" />
              </ButtonGroup>
            )
          }
        />
        <Showcase.Row label="tray, tiny">
          <ButtonGroup layout="tray" size="tiny" aria-label="작은 사진 넘기기">
            <IconButton icon={<ChevronLeftIcon />} aria-label="이전 사진" />
            <IconButton icon={<ChevronRightIcon />} aria-label="다음 사진" />
            <ButtonGroup.Separator />
            <IconButton icon={<XMarkIcon />} aria-label="닫기" />
          </ButtonGroup>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Size × Orientation">
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) =>
            orientation === 'horizontal' ? (
              <ButtonGroup size={size} variant="outline" aria-label={`${size} 확대`}>
                <IconButton icon={<MinusIcon />} aria-label="줄이기" />
                <Button>100%</Button>
                <IconButton icon={<PlusIcon />} aria-label="늘리기" />
              </ButtonGroup>
            ) : (
              <ButtonGroup
                size={size}
                orientation="vertical"
                variant="outline"
                aria-label={`${size} 정렬`}
              >
                <Button>위</Button>
                <Button>가운데</Button>
                <Button>아래</Button>
              </ButtonGroup>
            )
          }
        />
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="그룹 안의 그룹은 간격을 두고 떨어지고, 각 그룹은 붙은 채로 남습니다. TextField 도 outline 컨트롤처럼 테두리를 이어 붙입니다."
      >
        <Showcase.Row label="nested">
          <ButtonGroup variant="outline" aria-label="편집">
            <ButtonGroup aria-label="클립보드">
              <IconButton icon={<ScissorsIcon />} aria-label="잘라내기" />
              <IconButton icon={<DocumentDuplicateIcon />} aria-label="복사" />
              <IconButton icon={<ClipboardIcon />} aria-label="붙여넣기" />
            </ButtonGroup>
            <ButtonGroup aria-label="기록">
              <IconButton icon={<ArrowUturnLeftIcon />} aria-label="실행 취소" />
              <IconButton icon={<ArrowUturnRightIcon />} aria-label="다시 실행" />
            </ButtonGroup>
          </ButtonGroup>
        </Showcase.Row>
        <Showcase.Row label="text + field">
          <ButtonGroup aria-label="주소">
            <TextField aria-label="도메인" placeholder="example.com" className="w-64">
              <span>https://</span>
            </TextField>
            <Button variant="outline">이동</Button>
          </ButtonGroup>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl">
            <ButtonGroup variant="outline" aria-label="오른쪽에서 왼쪽">
              <Button>첫째</Button>
              <Button>둘째</Button>
              <Button>셋째</Button>
            </ButtonGroup>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <ButtonGroup variant="outline" aria-label="일부 비활성">
            <Button>보관</Button>
            <Button disabled>신고</Button>
            <Button>미루기</Button>
          </ButtonGroup>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

const radii = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  return [
    style.borderStartStartRadius,
    style.borderStartEndRadius,
    style.borderEndEndRadius,
    style.borderEndStartRadius,
  ];
};

export const Joined: Story = {
  render: () => (
    <ButtonGroup variant="outline" aria-label="보관함 동작">
      <Button>보관</Button>
      <Button>신고</Button>
      <Button>미루기</Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '바깥 모서리만 둥글고 맞닿는 테두리는 한 줄로 겹칩니다. 포커스한 버튼은 앞으로 나와 링과 테두리가 가려지지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const [first, middle, last] = canvas.getAllByRole('button');
    await expect(radii(first!)).toEqual(['10px', '0px', '0px', '10px']);
    await expect(radii(middle!)).toEqual(['0px', '0px', '0px', '0px']);
    await expect(radii(last!)).toEqual(['0px', '10px', '10px', '0px']);
    await expect(middle!.getBoundingClientRect().left - first!.getBoundingClientRect().right).toBe(
      -1,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expect(middle).toHaveFocus();
    await expect(getComputedStyle(middle!).zIndex).toBe('30');
    await expect(canvas.getByRole('group')).toHaveAccessibleName('보관함 동작');
  },
};

export const SizeAndVariant: Story = {
  render: () => (
    <ButtonGroup size="tiny" variant="outline" aria-label="확대">
      <IconButton icon={<MinusIcon />} aria-label="줄이기" />
      <Button>100%</Button>
      <Button variant="solid" size="standard">
        맞춤
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'size와 variant는 Context로 안의 버튼에 내려갑니다. 버튼에 직접 준 값이 그룹 값보다 앞섭니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const minus = canvas.getByRole('button', { name: '줄이기' });
    await expect(minus).toHaveAttribute('data-size', 'tiny');
    await expect(minus).toHaveAttribute('data-variant', 'outline');
    await expect(canvas.getByRole('button', { name: '100%' })).toHaveAttribute(
      'data-variant',
      'outline',
    );
    const own = canvas.getByRole('button', { name: '맞춤' });
    await expect(own).toHaveAttribute('data-size', 'standard');
    await expect(own).toHaveAttribute('data-variant', 'solid');
  },
};

export const Separator: Story = {
  render: () => (
    <ButtonGroup variant="solid" aria-label="저장">
      <Button>저장</Button>
      <ButtonGroup.Separator />
      <IconButton icon={<ChevronDownIcon />} aria-label="저장 옵션" />
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Separator는 채운 버튼 사이에 선을 긋습니다. outline은 테두리가 이미 있어 없어도 됩니다. 스크린 리더에는 구분선으로 읽힙니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    const save = canvas.getByRole('button', { name: '저장' });
    const more = canvas.getByRole('button', { name: '저장 옵션' });
    await expect(separator.getBoundingClientRect().width).toBe(1);
    await expect(more.getBoundingClientRect().left - save.getBoundingClientRect().right).toBe(-1);
  },
};

export const Tray: Story = {
  render: () => (
    <ButtonGroup layout="tray" aria-label="사진 보기">
      <IconButton icon={<ChevronLeftIcon />} aria-label="이전 사진" />
      <IconButton icon={<ChevronRightIcon />} aria-label="다음 사진" />
      <ButtonGroup.Separator />
      <IconButton icon={<XMarkIcon />} aria-label="닫기" />
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'tray 는 테두리 막대 안에 버튼을 4px씩 띄워 둡니다. 버튼은 제 모서리를 지키고, 구분선은 버튼보다 짧게 가운데에 섭니다. 막대 모서리는 버튼 모서리에 안쪽 여백을 더한 값입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('group');
    const prev = canvas.getByRole('button', { name: '이전 사진' });
    const next = canvas.getByRole('button', { name: '다음 사진' });
    const line = canvas.getByRole('separator');
    await expect(prev).toHaveAttribute('data-variant', 'ghost');
    await expect(radii(prev)).toEqual(['10px', '10px', '10px', '10px']);
    await expect(getComputedStyle(bar).borderTopLeftRadius).toBe('14px');
    await expect(next.getBoundingClientRect().left - prev.getBoundingClientRect().right).toBe(4);
    const lineBox = line.getBoundingClientRect();
    const buttonBox = next.getBoundingClientRect();
    await expect(lineBox.height).toBe(20);
    await expect(lineBox.top + lineBox.height / 2).toBeCloseTo(
      buttonBox.top + buttonBox.height / 2,
    );
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <ButtonGroup variant="outline" aria-label="오른쪽에서 왼쪽">
        <Button>첫째</Button>
        <Button>둘째</Button>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '모서리는 논리 속성으로 깎여서 오른쪽에서 왼쪽으로 쓰는 화면에서도 바깥쪽이 둥급니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const first = canvas.getByRole('button', { name: '첫째' });
    await expect(getComputedStyle(first).borderTopRightRadius).toBe('10px');
    await expect(getComputedStyle(first).borderTopLeftRadius).toBe('0px');
  },
};

export const DevelopmentWarnings: Story = {
  render: function Render() {
    const [shown, setShown] = useState(false);

    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="outline" onClick={() => setShown(true)}>
          이름 없는 그룹 보기
        </Button>
        {shown && (
          <ButtonGroup variant="outline">
            <Button>가</Button>
            <Button>나</Button>
          </ButtonGroup>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '개발 모드에서는 aria-label도 aria-labelledby도 없는 바깥 그룹을 콘솔에 알립니다. 이름이 없으면 스크린 리더는 "그룹" 이라고만 읽습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await userEvent.click(canvas.getByRole('button', { name: '이름 없는 그룹 보기' }));
    await expect(canvas.getByRole('group')).toBeVisible();
    if (isDevelopment)
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('ButtonGroup: add aria-label')),
      );
    warn.mockRestore();
  },
};
