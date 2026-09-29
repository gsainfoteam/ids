import { useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { ColorPicker } from '../../data/color-picker';
import { Field } from '../field';

import { ColorField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;
const palette = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'];

const meta = {
  title: 'Form/ColorField',
  component: ColorField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    format: { control: 'radio', options: ['hex', 'rgb', 'hsl', 'oklch'] },
    mobileVariant: { control: 'radio', options: ['popover', 'drawer'] },
    alpha: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '브랜드 색상',
    defaultValue: '#3B82F6',
    swatches: palette,
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
    onOpenChange: fn(),
  },
  render: (args) => (
    <div className="w-64">
      <ColorField {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Open" description="팝업 안은 ColorPicker 입니다.">
        <Showcase.Row label="default" className="h-104 items-start">
          <div className="w-64">
            <ColorField aria-label="열림" defaultValue="#8B5CF6" swatches={palette} defaultOpen />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-56">
              <ColorField
                size={size}
                variant={variant}
                defaultValue="#22C55E"
                aria-label={`${variant} ${size}`}
              />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <div className="w-64">
            <ColorField aria-label="비어 있음" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="alpha">
          <div className="w-64">
            <ColorField aria-label="투명도" alpha defaultValue="#F9731680" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="hsl">
          <div className="w-88">
            <ColorField aria-label="HSL" format="hsl" defaultValue="#EF4444" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="oklch">
          <div className="w-88">
            <ColorField aria-label="OKLCH" format="oklch" defaultValue="#22C55E" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <div className="w-64">
            <ColorField aria-label="잘못됨" defaultValue="not a color" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-64">
            <ColorField aria-label="비활성" disabled defaultValue="#3B82F6" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <div className="w-64">
            <ColorField aria-label="읽기 전용" readOnly defaultValue="#3B82F6" />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const PickAndClear: Story = {
  render: function Render() {
    const [value, setValue] = useState('#3B82F6');

    return (
      <div className="grid w-72 gap-3">
        <Field>
          <Field.Label>브랜드 색상</Field.Label>
          <ColorField value={value} onValueChange={setValue} alpha swatches={palette} />
          <Field.Hint>방향키로 채도와 밝기를 조절하세요.</Field.Hint>
        </Field>
        <output aria-label="색상 결과">{value}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '트리거를 누르거나 ↓ 를 누르면 팝업이 열리고 포커스가 영역으로 갑니다. 고른 색은 바로 반영되고, Esc 나 바깥을 누르면 닫히며 트리거로 포커스가 돌아옵니다. 지우기 버튼은 값을 비웁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: '브랜드 색상 #3B82F6FF' });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole('dialog', { name: '브랜드 색상' });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(canvas.getByRole('slider', { name: '채도' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('radio', { name: '#EF4444' }));
    await expect(canvas.getByLabelText('색상 결과')).toHaveTextContent('#EF4444FF');
    await expect(trigger).toHaveAccessibleName('브랜드 색상 #EF4444FF');
    canvas.getByRole('slider', { name: '채도' }).focus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByLabelText('색상 결과')).toHaveTextContent('#EFEFEFFF');
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: '색상 지우기' }));
    await expect(canvas.getByLabelText('색상 결과')).toBeEmptyDOMElement();
    await expect(trigger).toHaveTextContent('색상 선택');
  },
};

export const Composition: Story = {
  render: () => (
    <div className="grid w-64 gap-3">
      <ColorField aria-label="팔레트만" defaultValue="#22C55E" swatches={palette}>
        <ColorField.Content>
          <ColorPicker.Swatches />
        </ColorField.Content>
      </ColorField>
      <ColorField aria-label="간단히" defaultValue="#F97316">
        <ColorField.Content>
          <ColorPicker.HueSlider />
          <ColorPicker.Input />
        </ColorField.Content>
      </ColorField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'ColorField.Content 의 자식은 ColorPicker part 입니다. 팔레트만, 또는 색조와 입력만 두는 식으로 팝업을 줄일 수 있습니다. 팝업이 열리면 첫 컨트롤에 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: /^팔레트만/ }));
    await waitFor(() => expect(canvas.getByRole('radio', { name: '#22C55E' })).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('combobox', { name: /^팔레트만/ })).toHaveTextContent('#3B82F6');
  },
};

export const NativeForm: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    return (
      <form
        className="flex w-72 flex-col items-start gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get('color')));
        }}
      >
        <Field className="w-full">
          <Field.Label>테마 색</Field.Label>
          <ColorField name="color" required swatches={palette} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">제출</Button>
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
          'name 을 주면 형식에 맞춘 값 하나가 FormData 에 들어갑니다. required 인데 비어 있으면 브라우저가 제출을 막고 트리거로 포커스를 보냅니다. 팝업을 열었다 닫기만 하면 Field 는 채워지지도 바뀌지도 않은 상태로 남습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const field = () => canvas.getByRole('combobox', { name: /^테마 색/ }).closest('[data-field]');
    await userEvent.click(canvas.getByRole('combobox', { name: /^테마 색/ }));
    await userEvent.keyboard('{Escape}');
    await expect(field()).not.toHaveAttribute('data-filled');
    await expect(field()).not.toHaveAttribute('data-dirty');
    const trigger = canvas.getByRole('combobox', { name: /^테마 색/ });
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toBeEmptyDOMElement();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(await canvas.findByRole('radio', { name: '#22C55E' }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('#22C55E');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(trigger).toHaveAttribute('data-placeholder'));
  },
};

export const ReactHookForm: Story = {
  render: function Render() {
    const methods = useForm<{ color: string }>({ defaultValues: { color: '' } });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          className="flex w-72 flex-col items-start gap-4"
          noValidate
          onSubmit={methods.handleSubmit((data) => setResult(data.color))}
        >
          <FormField
            name="color"
            controlMode="value"
            registerOptions={{ required: '색을 고르세요.' }}
            className="w-full"
          >
            <FormField.Label>포인트 색</FormField.Label>
            <ColorField swatches={palette} />
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
        story: 'controlMode="value" 로 연결하면 onValueChange 가 field.onChange 로 이어집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(canvas.getByText('색을 고르세요.')).toBeVisible());
    const trigger = canvas.getByRole('combobox', { name: /^포인트 색/ });
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(await canvas.findByRole('radio', { name: '#8B5CF6' }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('#8B5CF6');
  },
};

export const Drawer: Story = {
  args: { mobileVariant: 'drawer' },
  parameters: {
    docs: {
      description: {
        story:
          '640px 보다 좁은 화면에서 mobileVariant="drawer" 는 제목과 닫기 버튼이 있는 모달 하단 시트로 엽니다.',
      },
    },
  },
};
