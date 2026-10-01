import { useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Field } from '../field';

import { Slider } from '.';

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const modes = ['single', 'range'] as const;

const meta = {
  title: 'Form/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    size: { control: 'radio', options: sizes },
    valueLabel: { control: 'radio', options: ['auto', 'always', 'never'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
  args: {
    'aria-label': '볼륨',
    defaultValue: 50,
    onValueChange: fn(),
    onValueCommit: fn(),
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof Slider>;

const narrowWithLabelRoom: Decorator = (Story) => (
  <div className="w-80 pt-8">
    <Story />
  </div>
);

const thumb = (canvasElement: HTMLElement, index = 0) =>
  canvasElement.querySelectorAll<HTMLElement>('[role=slider]')[index]!;
const valueOf = (element: HTMLElement) => Number(element.getAttribute('aria-valuenow'));

export const Playground: Story = { decorators: [narrowWithLabelRoom] };

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Size × Mode">
        <Showcase.Matrix
          rows={sizes}
          columns={modes}
          render={(size, mode) => (
            <div className="w-64">
              {mode === 'range' ? (
                <Slider
                  size={size}
                  selectionMode="range"
                  defaultValue={[20, 70]}
                  aria-label={`${size} range`}
                />
              ) : (
                <Slider size={size} defaultValue={40} aria-label={`${size} single`} />
              )}
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        {(
          [
            ['invalid', { invalid: true }],
            ['disabled', { disabled: true }],
            ['readOnly', { readOnly: true }],
          ] as const
        ).map(([label, props]) => (
          <Showcase.Row key={label} label={label}>
            <div className="w-64">
              <Slider {...props} defaultValue={60} aria-label={label} />
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="Marks and labels">
        <Showcase.Row label="marks">
          <div className="w-64">
            <Slider
              defaultValue={50}
              step={25}
              marks={[0, 25, 50, 75, 100]}
              formatLabel={(value) => `${value}%`}
              aria-label="단계"
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="step ticks">
          <div className="w-64">
            <Slider defaultValue={3} max={10} marks aria-label="눈금" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="always">
          <div className="w-64 pt-8">
            <Slider
              selectionMode="range"
              defaultValue={[30000, 70000]}
              max={100000}
              step={1000}
              valueLabel="always"
              formatLabel={(value) => `₩${value.toLocaleString()}`}
              aria-label="가격"
            />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Layout">
        <Showcase.Row label="vertical">
          <div className="flex h-48 gap-8">
            <Slider orientation="vertical" defaultValue={60} aria-label="세로" />
            <Slider
              orientation="vertical"
              selectionMode="range"
              defaultValue={[20, 80]}
              aria-label="세로 범위"
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl" className="w-64">
            <Slider defaultValue={30} aria-label="오른쪽에서" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="Field">
          <div className="w-64">
            <Field>
              <Field.Label>밝기</Field.Label>
              <Slider defaultValue={70} />
              <Field.Hint>화면 밝기</Field.Hint>
            </Field>
          </div>
        </Showcase.Row>
        <Showcase.Row label="custom track">
          <div className="w-64">
            <Slider
              defaultValue={200}
              max={360}
              aria-label="색상"
              formatLabel={(value) => `${value}°`}
            >
              <Slider.Track className="bg-[linear-gradient(to_right,red,yellow,lime,cyan,blue,magenta,red)]">
                <Slider.Thumb
                  style={(state) => ({ backgroundColor: `hsl(${state.thumbValue} 90% 55%)` })}
                />
              </Slider.Track>
            </Slider>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  decorators: [narrowWithLabelRoom],
  parameters: {
    docs: {
      description: {
        story:
          '화살표는 방향과 상관없이 한 칸, Shift와 PageUp·PageDown은 열 칸, Home·End는 끝으로 갑니다. 키를 누르고 있는 동안에는 `onValueChange` 만, 놓으면 `onValueCommit` 이 한 번 불립니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const handle = thumb(canvasElement);
    await userEvent.tab();
    await expect(handle).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowUp}');
    await expect(valueOf(handle)).toBe(52);
    await userEvent.keyboard('{PageDown}');
    await expect(valueOf(handle)).toBe(42);
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await expect(valueOf(handle)).toBe(32);
    await userEvent.keyboard('{End}');
    await expect(valueOf(handle)).toBe(100);
    await expect(args.onValueCommit).toHaveBeenLastCalledWith(100);
    await userEvent.keyboard('{Home}');
    await expect(args.onValueCommit).toHaveBeenLastCalledWith(0);
  },
};

export const Drag: Story = {
  decorators: [narrowWithLabelRoom],
  parameters: {
    docs: {
      description: {
        story:
          '트랙 어디를 눌러도 가까운 thumb이 오고 그대로 끌 수 있습니다. 끄는 동안 값 라벨이 보이고, 손을 떼면 `onValueCommit` 이 불립니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const track = canvasElement.querySelector<HTMLElement>('[data-slider] > [data-orientation]')!;
    const rect = track.getBoundingClientRect();
    const at = (ratio: number) => ({
      x: rect.left + 8 + ratio * (rect.width - 16),
      y: rect.top + rect.height / 2,
    });
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: track, coords: at(0.25) },
      { coords: at(0.75) },
    ]);
    const dragged = valueOf(thumb(canvasElement));
    const stepsLostToPixelRounding = 1;
    await expect(Math.abs(dragged - 75)).toBeLessThanOrEqual(stepsLostToPixelRounding);
    await expect(canvasElement.querySelector('[data-slider]')).toHaveAttribute('data-dragging');
    await expect(args.onValueCommit).not.toHaveBeenCalled();
    await userEvent.pointer({ keys: '[/MouseLeft]', coords: at(0.75) });
    await expect(args.onValueCommit).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommit).toHaveBeenCalledWith(dragged);
    await expect(thumb(canvasElement)).toHaveFocus();
  },
};

export const Range: Story = {
  decorators: [narrowWithLabelRoom],
  args: {
    selectionMode: 'range',
    defaultValue: [40, 60],
    step: 5,
    minStepsBetweenThumbs: 2,
    'aria-label': '가격 범위',
  },
  parameters: {
    docs: {
      description: {
        story:
          '두 thumb은 교차하지 않고 `minStepsBetweenThumbs` 칸만큼 떨어져 있습니다. 보조 기술도 같은 한계를 `aria-valuemin`, `aria-valuemax` 로 읽습니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const [start, end] = [thumb(canvasElement, 0), thumb(canvasElement, 1)];
    await expect(start).toHaveAttribute('aria-valuemax', '50');
    start.focus();
    await userEvent.keyboard('{End}');
    await expect(valueOf(start)).toBe(50);
    await expect(valueOf(end)).toBe(60);
    await expect(end).toHaveAttribute('aria-valuemin', '60');
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" className="w-80 pt-8">
        <Story />
      </div>
    ),
  ],
  args: { defaultValue: 20, 'aria-label': '오른쪽에서 왼쪽' },
  parameters: {
    docs: {
      description: {
        story: '`dir="rtl"` 안에서는 오른쪽이 최솟값이고 → 키가 값을 줄입니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const handle = thumb(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>('[data-slider]')!;
    await expect(
      root.getBoundingClientRect().right - handle.getBoundingClientRect().right,
    ).toBeLessThan(root.getBoundingClientRect().width / 2);
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(valueOf(handle)).toBe(19);
  },
};

export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div className="h-48">
        <Story />
      </div>
    ),
  ],
  args: { orientation: 'vertical', defaultValue: 60, 'aria-label': '세로' },
  play: async ({ canvasElement, userEvent }) => {
    const handle = thumb(canvasElement);
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    handle.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(valueOf(handle)).toBe(61);
  },
};

export const NativeForm: Story = {
  decorators: [narrowWithLabelRoom],
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    return (
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
        }}
      >
        <Field>
          <Field.Label>가격</Field.Label>
          <Slider name="price" selectionMode="range" defaultValue={[10, 90]} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">검색</Button>
          <Button type="reset" variant="outline">
            초기화
          </Button>
        </div>
        <output aria-label="제출 결과" className="text-body-b3-regular font-mono">
          {submitted}
        </output>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`name` 을 주면 thumb마다 hidden input이 하나씩 제출됩니다. 초기화는 `defaultValue` 로 되돌립니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    thumb(canvasElement, 1).focus();
    await userEvent.keyboard('{PageDown}');
    await userEvent.click(canvas.getByRole('button', { name: '검색' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent(
      '[["price","10"],["price","80"]]',
    );
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(valueOf(thumb(canvasElement, 1))).toBe(90));
  },
};

export const ReactHookForm: Story = {
  decorators: [narrowWithLabelRoom],
  render: function Render() {
    const methods = useForm({ defaultValues: { volume: 20 } });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={methods.handleSubmit((values) => setResult(`저장: ${values.volume}`))}
        >
          <FormField
            name="volume"
            controlMode="value"
            registerOptions={{ min: { value: 30, message: '30 이상으로 올리세요.' } }}
          >
            <FormField.Label>알림 볼륨</FormField.Label>
            <Slider />
            <FormField.Error />
          </FormField>
          <Button type="submit">저장</Button>
          <output aria-label="저장 결과">{result}</output>
        </form>
      </FormProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`controlMode="value"` 로 숫자가 그대로 연결됩니다. 오류가 나면 thumb으로 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(await canvas.findByText('30 이상으로 올리세요.')).toBeVisible();
    await expect(thumb(canvasElement)).toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('저장: 30');
  },
};

export const ValueLabel: Story = {
  decorators: [narrowWithLabelRoom],
  args: { valueLabel: 'auto', formatLabel: (value: number) => `${value}%` },
  parameters: {
    docs: {
      description: {
        story:
          '값 라벨은 끄는 동안과 키보드 포커스가 있을 때 보입니다. `always` 는 늘, `never` 는 그리지 않습니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const label = thumb(canvasElement).querySelector('[aria-hidden=true]')!;
    await expect(getComputedStyle(label).opacity).toBe('0');
    await userEvent.tab();
    await waitFor(() => expect(getComputedStyle(label).opacity).toBe('1'));
    await expect(label).toHaveTextContent('50%');
  },
};
