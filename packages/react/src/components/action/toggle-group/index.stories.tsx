import { useState } from 'react';

import {
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@heroicons/react/16/solid';
import { expect, fn, spyOn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';
import { Button } from '../button';
import { IconToggle } from '../icon-toggle';
import { Toggle } from '../toggle';

import { ToggleGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['ghost', 'outline', 'soft', 'solid', 'glossy'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Action/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: { control: 'radio', options: ['single', 'multiple'] },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    size: { control: 'radio', options: sizes },
    variant: { control: 'radio', options: variants },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    loop: { control: 'boolean' },
  },
  args: {
    'aria-label': '정렬',
    selectionMode: 'single',
    orientation: 'horizontal',
    size: 'standard',
    variant: 'outline',
    loop: true,
    onValueChange: fn(),
  },
  render: (args) => (
    <ToggleGroup key={args.selectionMode} {...args}>
      <Toggle value="left">왼쪽</Toggle>
      <Toggle value="center">가운데</Toggle>
      <Toggle value="right">오른쪽</Toggle>
    </ToggleGroup>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Alignment(props: Partial<ToggleGroup.SingleProps>) {
  return (
    <ToggleGroup aria-label="정렬" defaultValue="center" {...props}>
      <IconToggle value="left" icon={<Bars3BottomLeftIcon />} aria-label="왼쪽 정렬" />
      <IconToggle value="center" icon={<Bars3Icon />} aria-label="가운데 정렬" />
      <IconToggle value="right" icon={<Bars3BottomRightIcon />} aria-label="오른쪽 정렬" />
    </ToggleGroup>
  );
}

function Formatting(props: Partial<ToggleGroup.MultipleProps>) {
  return (
    <ToggleGroup selectionMode="multiple" aria-label="서식" defaultValue={['bold']} {...props}>
      <IconToggle value="bold" icon={<BoldIcon />} aria-label="굵게" />
      <IconToggle value="italic" icon={<ItalicIcon />} aria-label="기울임" />
      <IconToggle value="underline" icon={<UnderlineIcon />} aria-label="밑줄" />
      <ToggleGroup.Separator />
      <IconToggle value="strike" icon={<StrikethroughIcon />} aria-label="취소선" />
    </ToggleGroup>
  );
}

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Size"
        description="그룹의 variant와 size를 안의 토글이 따릅니다. 한 개만 고르는 그룹은 라디오, 여러 개 고르는 그룹은 툴바입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => <Alignment size={size} variant={variant} />}
        />
      </Showcase.Section>

      <Showcase.Section title="Selection">
        <Showcase.Row label="single">
          <ToggleGroup aria-label="기간" variant="outline" defaultValue="week">
            <Toggle value="day">일</Toggle>
            <Toggle value="week">주</Toggle>
            <Toggle value="month">월</Toggle>
          </ToggleGroup>
          <Alignment variant="soft" />
        </Showcase.Row>
        <Showcase.Row label="multiple">
          <Formatting variant="outline" />
          <Formatting />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Layout">
        <Showcase.Row label="vertical">
          <ToggleGroup
            aria-label="보기"
            orientation="vertical"
            variant="outline"
            defaultValue="list"
          >
            <Toggle value="list">목록</Toggle>
            <Toggle value="grid">격자</Toggle>
            <Toggle value="board">보드</Toggle>
          </ToggleGroup>
        </Showcase.Row>
        <Showcase.Row label="full width" className="max-w-md">
          <ToggleGroup
            aria-label="정렬 기준"
            variant="outline"
            defaultValue="new"
            className="w-full"
          >
            <Toggle value="new">최신</Toggle>
            <Toggle value="popular">인기</Toggle>
            <Toggle value="comments">댓글 많은</Toggle>
          </ToggleGroup>
        </Showcase.Row>
        <Showcase.Row label="attached=false">
          <ToggleGroup
            aria-label="태그"
            selectionMode="multiple"
            attached={false}
            variant="outline"
            defaultValue={['react']}
          >
            <Toggle value="react">React</Toggle>
            <Toggle value="flutter">Flutter</Toggle>
            <Toggle value="design">디자인</Toggle>
          </ToggleGroup>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="disabled group">
          <Alignment variant="outline" disabled />
        </Showcase.Row>
        <Showcase.Row label="disabled item">
          <ToggleGroup aria-label="기간" variant="outline" defaultValue="day">
            <Toggle value="day">일</Toggle>
            <Toggle value="week" disabled>
              주
            </Toggle>
            <Toggle value="month">월</Toggle>
          </ToggleGroup>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const RadioKeyboard: Story = {
  render: (args) => (
    <ToggleGroup
      aria-label="기간"
      variant="outline"
      defaultValue="week"
      onValueChange={args.onValueChange}
    >
      <Toggle value="day">일</Toggle>
      <Toggle value="week">주</Toggle>
      <Toggle value="month" disabled>
        월
      </Toggle>
      <Toggle value="year">연</Toggle>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '하나만 고르는 그룹은 라디오 그룹입니다. Tab은 선택된 항목에 멈추고, 화살표가 포커스와 선택을 함께 옮깁니다. 비활성 항목은 건너뛰고 끝에서 처음으로 돌아갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const [day, week, , year] = canvas.getAllByRole('radio');
    await expect(canvas.getByRole('radiogroup')).toHaveAccessibleName('기간');
    await expect(week).toHaveAttribute('tabindex', '0');
    await expect(day).toHaveAttribute('tabindex', '-1');
    await userEvent.tab();
    await expect(week).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(year).toHaveFocus();
    await expect(year).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('year');
    await userEvent.keyboard('{ArrowDown}');
    await expect(day).toHaveFocus();
    await expect(day).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    await expect(year).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(year).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
  },
};

export const ToolbarKeyboard: Story = {
  render: () => <Formatting variant="outline" />,
  parameters: {
    docs: {
      description: {
        story:
          '여러 개 고르는 그룹은 툴바입니다. 화살표는 포커스만 옮기고 Space와 Enter가 켜고 끕니다. 다시 들어오면 마지막에 있던 항목으로 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const bold = canvas.getByRole('button', { name: '굵게' });
    const italic = canvas.getByRole('button', { name: '기울임' });
    await expect(canvas.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal');
    await userEvent.tab();
    await expect(bold).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(italic).toHaveFocus();
    await expect(italic).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard(' ');
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect(italic).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: '취소선' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole('button', { name: '취소선' })).toHaveFocus();
  },
};

export const Vertical: Story = {
  render: () => (
    <ToggleGroup
      aria-label="패널"
      selectionMode="multiple"
      orientation="vertical"
      variant="outline"
      defaultValue={['files']}
    >
      <Toggle value="files">파일</Toggle>
      <Toggle value="search">검색</Toggle>
      <Toggle value="history">기록</Toggle>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '세로 그룹은 위아래 화살표로 옮기고, 토글은 가장 넓은 토글에 맞춰 같은 너비가 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const [files, search, history] = canvas.getAllByRole('button');
    for (const item of [files, search, history])
      await expect(item!.getBoundingClientRect().height).toBe(36);
    await expect(files!.getBoundingClientRect().width).toBe(history!.getBoundingClientRect().width);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(files).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(search).toHaveFocus();
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Alignment variant="outline" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '오른쪽에서 왼쪽으로 쓰는 화면에서는 왼쪽 화살표가 다음 항목으로 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: '가운데 정렬' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('radio', { name: '오른쪽 정렬' })).toHaveFocus();
  },
};

function FormExample() {
  const [result, setResult] = useState('');
  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(JSON.stringify({ size: data.get('size'), toppings: data.getAll('toppings') }));
      }}
    >
      <ToggleGroup aria-label="크기" name="size" required variant="outline">
        <Toggle value="s">S</Toggle>
        <Toggle value="m">M</Toggle>
        <Toggle value="l">L</Toggle>
      </ToggleGroup>
      <ToggleGroup
        aria-label="토핑"
        name="toppings"
        selectionMode="multiple"
        variant="outline"
        defaultValue={['cheese']}
      >
        <Toggle value="cheese">치즈</Toggle>
        <Toggle value="olive">올리브</Toggle>
        <Toggle value="onion">양파</Toggle>
      </ToggleGroup>
      <div className="flex gap-2">
        <Button type="submit">주문</Button>
        <Button type="reset" variant="outline">
          초기화
        </Button>
      </div>
      <output aria-label="주문 결과" className="text-body-b3-regular font-mono">
        {result}
      </output>
    </form>
  );
}

export const NativeForm: Story = {
  render: () => <FormExample />,
  parameters: {
    docs: {
      description: {
        story:
          'name을 주면 눌린 값마다 FormData 항목이 하나씩 생깁니다. required면 고르기 전까지 브라우저가 제출을 막고, 한 번 고른 뒤에는 선택을 풀 수 없습니다. 폼을 초기화하면 defaultValue로 돌아갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const submit = canvas.getByRole('button', { name: '주문' });
    const result = canvas.getByLabelText('주문 결과');
    await userEvent.click(submit);
    await expect(result).toHaveTextContent('');
    await expect(canvas.getByRole('radio', { name: 'S' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('radio', { name: 'M' }));
    await userEvent.click(canvas.getByRole('radio', { name: 'M' }));
    await expect(canvas.getByRole('radio', { name: 'M' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(canvas.getByRole('button', { name: '양파' }));
    await userEvent.click(canvas.getByRole('button', { name: '올리브' }));
    await userEvent.click(submit);
    await expect(result).toHaveTextContent('{"size":"m","toppings":["cheese","olive","onion"]}');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'M' })).toHaveAttribute('aria-checked', 'false'),
    );
    await expect(canvas.getByRole('button', { name: '양파' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

function ControlledExample() {
  const [view, setView] = useState<'list' | 'grid' | null>('list');
  return (
    <div className="flex items-center gap-3">
      <ToggleGroup aria-label="보기" variant="outline" value={view} onValueChange={setView}>
        <Toggle value="list">목록</Toggle>
        <Toggle value="grid">격자</Toggle>
      </ToggleGroup>
      <Button variant="ghost" onClick={() => setView(null)}>
        선택 해제
      </Button>
      <output aria-label="보기 값">{String(view)}</output>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: {
    docs: {
      description: {
        story:
          '한 개를 고르는 그룹의 값은 문자열이고, 아무것도 고르지 않은 상태는 null입니다. value에 null을 넘기면 제어 상태로 선택을 비웁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '격자' }));
    await expect(canvas.getByLabelText('보기 값')).toHaveTextContent('grid');
    await userEvent.click(canvas.getByRole('button', { name: '선택 해제' }));
    await expect(canvas.getByLabelText('보기 값')).toHaveTextContent('null');
    await expect(canvas.getByRole('radio', { name: '격자' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  },
};

function Misuse() {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="outline" onClick={() => setShown(true)}>
        잘못 쓴 예 보기
      </Button>
      {shown && (
        <ToggleGroup aria-label="정렬" defaultValue="justify">
          <Toggle value="left">왼쪽</Toggle>
          <Toggle value="right">오른쪽</Toggle>
        </ToggleGroup>
      )}
    </div>
  );
}

export const DevelopmentWarnings: Story = {
  render: () => <Misuse />,
  parameters: {
    docs: {
      description: {
        story:
          '개발 모드에서는 어느 토글과도 맞지 않는 값, 모드와 맞지 않는 값 모양, 이름 없는 그룹을 콘솔에 알립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await userEvent.click(canvas.getByRole('button', { name: '잘못 쓴 예 보기' }));
    await expect(canvas.getByRole('radiogroup')).toBeVisible();
    if (isDevelopment)
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('no toggle has the value "justify"'),
        ),
      );
    warn.mockRestore();
  },
};
