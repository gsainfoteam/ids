import { useState } from 'react';

import { Bars3Icon, CalendarDaysIcon, Squares2X2Icon } from '@heroicons/react/20/solid';
import { expect, fn, spyOn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { isDevelopment } from '../../../utils/dev';
import { Button } from '../../action/button';
import { Field } from '../field';

import { SegmentedControl } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Period = 'day' | 'week' | 'month';

const periods: Array<{ value: Period; label: string }> = [
  { value: 'day', label: '일' },
  { value: 'week', label: '주' },
  { value: 'month', label: '월' },
];

const sizes = ['standard', 'tiny'] as const;
const orientations = ['horizontal', 'vertical'] as const;

const meta = {
  title: 'Form/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    'aria-label': '기간',
    defaultValue: 'week',
    orientation: 'horizontal',
    onValueChange: fn(),
    children: ({ Item }) =>
      periods.map((period) => (
        <Item key={period.value} value={period.value}>
          {period.label}
        </Item>
      )),
  },
} satisfies Meta<typeof SegmentedControl<Period>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <SegmentedControl defaultValue="week" aria-label="기간">
      <SegmentedControl.Item value="day">일</SegmentedControl.Item>
      <SegmentedControl.Item value="week">주</SegmentedControl.Item>
      <SegmentedControl.Item value="month">월</SegmentedControl.Item>
    </SegmentedControl>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Orientation × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={orientations}
          render={(size, orientation) => (
            <SegmentedControl<Period>
              size={size}
              orientation={orientation}
              defaultValue="week"
              aria-label={`${orientation} ${size}`}
            >
              {({ Item }) =>
                periods.map((period) => (
                  <Item key={period.value} value={period.value}>
                    {period.label}
                  </Item>
                ))
              }
            </SegmentedControl>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Content" description="트랙은 칸 내용 폭만큼만 차지합니다.">
        <Showcase.Row label="icon + text">
          <SegmentedControl defaultValue="list" aria-label="보기">
            <SegmentedControl.Item value="list">
              <Bars3Icon />
              목록
            </SegmentedControl.Item>
            <SegmentedControl.Item value="grid">
              <Squares2X2Icon />
              격자
            </SegmentedControl.Item>
            <SegmentedControl.Item value="calendar">
              <CalendarDaysIcon />
              달력
            </SegmentedControl.Item>
          </SegmentedControl>
        </Showcase.Row>
        <Showcase.Row label="icon only">
          <SegmentedControl defaultValue="grid" aria-label="보기">
            <SegmentedControl.Item value="list" aria-label="목록">
              <Bars3Icon />
            </SegmentedControl.Item>
            <SegmentedControl.Item value="grid" aria-label="격자">
              <Squares2X2Icon />
            </SegmentedControl.Item>
            <SegmentedControl.Item value="calendar" aria-label="달력">
              <CalendarDaysIcon />
            </SegmentedControl.Item>
          </SegmentedControl>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="nothing selected">
          <SegmentedControl<Period> aria-label="선택 없음">
            {({ Item }) =>
              periods.map((period) => (
                <Item key={period.value} value={period.value}>
                  {period.label}
                </Item>
              ))
            }
          </SegmentedControl>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <SegmentedControl<Period> disabled defaultValue="week" aria-label="비활성">
            {({ Item }) =>
              periods.map((period) => (
                <Item key={period.value} value={period.value}>
                  {period.label}
                </Item>
              ))
            }
          </SegmentedControl>
        </Showcase.Row>
        <Showcase.Row label="disabled item">
          <SegmentedControl<Period> defaultValue="day" aria-label="일부 비활성">
            {({ Item }) =>
              periods.map((period) => (
                <Item key={period.value} value={period.value} disabled={period.value === 'month'}>
                  {period.label}
                </Item>
              ))
            }
          </SegmentedControl>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <SegmentedControl<Period> readOnly defaultValue="week" aria-label="읽기 전용">
            {({ Item }) =>
              periods.map((period) => (
                <Item key={period.value} value={period.value}>
                  {period.label}
                </Item>
              ))
            }
          </SegmentedControl>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <SegmentedControl<Period> invalid aria-label="오류">
            {({ Item }) =>
              periods.map((period) => (
                <Item key={period.value} value={period.value}>
                  {period.label}
                </Item>
              ))
            }
          </SegmentedControl>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Composition">
        <Showcase.Row label="Field">
          <Field>
            <Field.Label>기간</Field.Label>
            <Field.Description>차트가 묶는 단위입니다.</Field.Description>
            <SegmentedControl<Period> defaultValue="week">
              {({ Item }) =>
                periods.map((period) => (
                  <Item key={period.value} value={period.value}>
                    {period.label}
                  </Item>
                ))
              }
            </SegmentedControl>
          </Field>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const SwitchTheViewFromState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`value` 와 `onValueChange` 로 제어합니다. 한 번 고르면 선택을 비울 수 없고, `onValueChange` 는 사용자가 고를 때만 불립니다.',
      },
    },
  },
  render: function Render() {
    const [view, setView] = useState('list');

    return (
      <div className="flex flex-col items-start gap-3">
        <SegmentedControl value={view} onValueChange={setView} aria-label="보기">
          <SegmentedControl.Item value="list">
            <Bars3Icon />
            목록
          </SegmentedControl.Item>
          <SegmentedControl.Item value="grid">
            <Squares2X2Icon />
            격자
          </SegmentedControl.Item>
        </SegmentedControl>
        <p className="text-body-b3-regular">지금 보기: {view}</p>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '격자' }));
    await expect(canvas.getByText('지금 보기: grid')).toBeVisible();
  },
};

export const SubmitTheChoiceWithAForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`name` 을 주면 고른 값이 FormData 에 들어갑니다. `required` 면 고르기 전까지 제출되지 않고, reset 은 `defaultValue` 로 되돌립니다.',
      },
    },
  },
  render: function Render() {
    const [submitted, setSubmitted] = useState('');

    return (
      <form
        className="flex flex-col items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get('period')));
        }}
      >
        <Field required>
          <Field.Label>기간</Field.Label>
          <SegmentedControl<Period> name="period" defaultValue="week">
            {({ Item }) =>
              periods.map((period) => (
                <Item key={period.value} value={period.value}>
                  {period.label}
                </Item>
              ))
            }
          </SegmentedControl>
        </Field>
        <div className="flex gap-2">
          <Button type="submit">저장</Button>
          <Button type="reset" variant="outline">
            초기화
          </Button>
        </div>
        {submitted && <p className="text-body-b3-regular">보낸 값: {submitted}</p>}
      </form>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '월' }));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByText('보낸 값: month')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await expect(canvas.getByRole('radio', { name: '주' })).toBeChecked();
  },
};

export const Keyboard: Story = {
  tags: ['verification'],
  parameters: {
    docs: {
      description: {
        story:
          '항목마다 같은 `name` 의 native 라디오라서 Tab 은 선택된 항목에 멈추고, 화살표 키는 옮기면서 바로 고릅니다. Home 과 End 는 처음과 끝 항목을 고르고, 비활성 항목은 건너뜁니다.',
      },
    },
  },
  render: (args) => (
    <SegmentedControl<Period> aria-label="기간" onValueChange={args.onValueChange}>
      {({ Item }) =>
        periods.map((period) => (
          <Item key={period.value} value={period.value} disabled={period.value === 'week'}>
            {period.label}
          </Item>
        ))
      }
    </SegmentedControl>
  ),
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: '일' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: '월' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: '월' })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('month');
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('radio', { name: '일' })).toBeChecked();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('radio', { name: '월' })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('month');
  },
};

export const DevelopmentWarnings: Story = {
  tags: ['verification'],
  render: function Render() {
    const [shown, setShown] = useState(false);

    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="outline" onClick={() => setShown(true)}>
          잘못 쓴 예 보기
        </Button>
        {shown && (
          <SegmentedControl aria-label="정렬" defaultValue="new">
            <SegmentedControl.Item value="new">최신</SegmentedControl.Item>
            <span>인기</span>
          </SegmentedControl>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '개발 모드에서는 `SegmentedControl.Item` 이 아닌 자식을 콘솔에 알립니다. 칸의 글자나 아이콘은 Item 의 children 으로 넣습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await userEvent.click(canvas.getByRole('button', { name: '잘못 쓴 예 보기' }));
    await expect(canvas.getByRole('radiogroup')).toBeVisible();
    if (isDevelopment)
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('only SegmentedControl.Item')),
      );
    warn.mockRestore();
  },
};
