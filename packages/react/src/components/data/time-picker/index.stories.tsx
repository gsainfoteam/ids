import { useState } from 'react';

import { de } from 'date-fns/locale/de';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';

import { TimePicker } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const at = (hour: number, minute = 0, second = 0) => new Date(2026, 8, 15, hour, minute, second);
const sizes = ['standard', 'tiny'] as const;
const variants = ['grid', 'wheel'] as const;

const meta = {
  title: 'Data/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    precision: { control: 'radio', options: ['hour', 'minute', 'second'] },
    format: { control: 'radio', options: [undefined, '12h', '24h'] },
    step: { control: { type: 'number', min: 1, max: 60 } },
    locale: { control: 'radio', options: ['ko-KR', 'en-US'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    variant: 'grid',
    size: 'standard',
    precision: 'minute',
    step: 1,
    className: cn('w-72'),
    onValueChange: fn(),
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const column = (canvasElement: HTMLElement, unit: string) =>
  canvasElement.querySelector<HTMLElement>(`[data-time-column="${unit}"]`)!;
const option = (canvasElement: HTMLElement, unit: string, n: number) =>
  column(canvasElement, unit).querySelector<HTMLElement>(`[data-time-option="${n}"]`)!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <TimePicker
              variant={variant}
              size={size}
              format="24h"
              defaultValue={at(9, 30)}
              className="w-56"
              aria-label={`${variant} ${size}`}
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Hour cycle × Precision"
        description="시간제는 locale의 CLDR 시간제를 따르고 format으로 정합니다. 12시간제에는 오전/오후 컬럼이 locale이 쓰는 자리에 붙습니다."
      >
        <Showcase.Row label="24h minute">
          <TimePicker format="24h" defaultValue={at(14, 30)} className="w-56" aria-label="24시간" />
        </Showcase.Row>
        <Showcase.Row label="12h second">
          <TimePicker
            format="12h"
            precision="second"
            step={15}
            defaultValue={at(14, 30, 45)}
            className="w-80"
            aria-label="12시간 초"
          />
        </Showcase.Row>
        <Showcase.Row label="hour · en-US">
          <TimePicker
            precision="hour"
            locale="en-US"
            defaultValue={at(14)}
            className="w-44"
            aria-label="Hour only"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <TimePicker format="24h" className="w-56" aria-label="비어 있음" />
        </Showcase.Row>
        <Showcase.Row label="limits">
          <TimePicker
            format="24h"
            step={15}
            min={at(9, 30)}
            max={at(18)}
            defaultValue={at(9, 45)}
            className="w-56"
            aria-label="영업 시간"
          />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <TimePicker
            format="24h"
            readOnly
            defaultValue={at(9, 30)}
            className="w-56"
            aria-label="읽기 전용"
          />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <TimePicker
            format="24h"
            disabled
            defaultValue={at(9, 30)}
            className="w-56"
            aria-label="비활성"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Composition">
        <Showcase.Row label="header · separator">
          <TimePicker format="24h" defaultValue={at(9, 30)} className="w-56" aria-label="머리글">
            <TimePicker.Header />
            <TimePicker.Column unit="hour" />
            <TimePicker.Separator />
            <TimePicker.Column unit="minute" />
          </TimePicker>
        </Showcase.Row>
        <Showcase.Row label="period first">
          <TimePicker
            format="12h"
            defaultValue={at(21, 15)}
            className="w-64"
            aria-label="오전 오후 먼저"
          >
            <TimePicker.Period />
            <TimePicker.Column unit="hour" />
            <TimePicker.Column unit="minute" />
          </TimePicker>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  args: { format: '24h', step: 15, defaultValue: at(9, 15) },
  parameters: {
    docs: {
      description: {
        story:
          '컬럼마다 Tab으로 들어갑니다. 위아래 방향키와 Home/End, PageUp/PageDown은 옮기기만 하고 Enter나 Space로 고릅니다. 숫자를 치면 그 숫자로 가고, 좌우 방향키는 옆 컬럼으로 갑니다.',
      },
    },
  },
  play: async ({ canvasElement, args, userEvent }) => {
    const hour = column(canvasElement, 'hour');
    hour.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(option(canvasElement, 'hour', 10)).toHaveAttribute('data-active');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(10, 15));
    await userEvent.keyboard('14{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(14, 15));
    await userEvent.keyboard('{ArrowRight}');
    await expect(column(canvasElement, 'minute')).toHaveFocus();
    await userEvent.keyboard('{End} ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(14, 45));
  },
};

function ClearExample() {
  const [value, setValue] = useState<Date | null>(at(8, 30));
  return (
    <div className="flex w-56 flex-col gap-3">
      <TimePicker format="24h" value={value} onValueChange={setValue} />
      <output aria-label="값" className="text-body-b3-regular">
        {value ? `${value.getHours()}:${value.getMinutes()}` : 'null'}
      </output>
    </div>
  );
}

export const Clear: Story = {
  render: () => <ClearExample />,
  parameters: {
    docs: {
      description: {
        story:
          '값은 Date | null입니다. 컬럼에서 Delete나 Backspace를 누르면 null이 되고, 선택 표시가 사라집니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    column(canvasElement, 'minute').focus();
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.getByLabelText('값')).toHaveTextContent('null');
    await expect(canvasElement.querySelector('[aria-selected=true]')).toBeNull();
    await userEvent.click(option(canvasElement, 'minute', 45));
    await expect(canvas.getByLabelText('값')).toHaveTextContent('0:45');
  },
};

export const Limits: Story = {
  args: { format: '24h', step: 15, min: at(9, 30), max: at(10, 15), defaultValue: at(9, 45) },
  parameters: {
    docs: {
      description: {
        story:
          '날짜는 빼고 시각만 비교합니다. 범위 밖 옵션은 고를 수 없고, 시를 고르면 그 시간 안에서 가장 가까운 허용 시각으로 갑니다.',
      },
    },
  },
  play: async ({ canvasElement, args, userEvent }) => {
    await expect(option(canvasElement, 'hour', 8)).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(option(canvasElement, 'hour', 10));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(at(10, 15));
    await expect(option(canvasElement, 'minute', 30)).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Wheel: Story = {
  args: {
    variant: 'wheel',
    format: '12h',
    locale: 'en-US',
    defaultValue: at(14, 30),
    className: cn('w-64'),
  },
  parameters: {
    docs: {
      description: {
        story:
          '가운데로 스냅되는 스크롤 컬럼입니다. 스크롤이 멈추면 가운데 값이 선택됩니다. scrollend가 없는 브라우저에서도 마지막 스크롤 150ms 뒤에 확정합니다.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const minute = column(canvasElement, 'minute');
    const height = option(canvasElement, 'minute', 0).offsetHeight;
    minute.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 40 }));
    minute.scrollTop = 40 * height;
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith(at(14, 40)));
  },
};

export const Locale: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      <TimePicker defaultValue={at(14, 30)} className="w-64" aria-label="한국어" />
      <TimePicker
        format="24h"
        defaultValue={at(14, 30)}
        className="w-44"
        aria-label="한국어 24시간"
      />
      <TimePicker locale="en-US" defaultValue={at(14, 30)} className="w-64" aria-label="English" />
      <TimePicker locale={de} defaultValue={at(14, 30)} className="w-44" aria-label="Deutsch" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '시간제는 브라우저의 CLDR 데이터를, 오전/오후 이름은 date-fns locale을 따릅니다. 한국어와 미국 영어는 12시간제, 독일어는 24시간제이고 format으로 바꿀 수 있습니다. 한국어는 오전/오후 컬럼이 앞에 옵니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const korean = canvas.getByRole('group', { name: '한국어' });
    await expect(korean).toHaveAttribute('data-format', '12h');
    await expect(
      korean.querySelector('[data-time-column=period] [data-selected]'),
    ).toHaveTextContent('오후');
    await expect(korean.querySelector('[role=listbox]')).toHaveAttribute('aria-label', '오전/오후');
    const twentyFour = canvas.getByRole('group', { name: '한국어 24시간' });
    await expect(twentyFour.querySelector('[data-time-column=period]')).toBeNull();
    const english = canvas.getByRole('group', { name: 'English' });
    await expect(
      english.querySelector('[data-time-column=period] [data-selected]'),
    ).toHaveTextContent('PM');
    const german = canvas.getByRole('group', { name: 'Deutsch' });
    await expect(german.querySelector('[data-time-column=period]')).toBeNull();
  },
};

export const CustomOption: Story = {
  render: () => (
    <TimePicker
      format="24h"
      step={30}
      defaultValue={at(9, 30)}
      className="w-64"
      aria-label="회의 시간"
    >
      <TimePicker.Column unit="hour">{(option) => `${option.label}시`}</TimePicker.Column>
      <TimePicker.Column unit="minute">
        {(option) => (option.value === 0 ? '정각' : `${option.label}분`)}
      </TimePicker.Column>
    </TimePicker>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Column의 children은 옵션 상태를 받는 함수입니다. 옵션의 이름표만 바꾸고 선택과 키보드는 그대로 둡니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(option(canvasElement, 'minute', 0)).toHaveTextContent('정각');
    await expect(option(canvasElement, 'hour', 9)).toHaveTextContent('09시');
  },
};
