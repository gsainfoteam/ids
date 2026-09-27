import { useState } from 'react';

import { PhoneIcon } from '@heroicons/react/24/outline';
import { expect, fn } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { TelField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/TelField',
  component: TelField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    format: { control: 'radio', options: ['auto', 'international', 'none'] },
    defaultCountry: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    'aria-label': '전화번호',
    name: 'tel',
    defaultCountry: 'KR',
    variant: 'outline',
    size: 'standard',
    className: cn('w-72'),
    onValueChange: fn(),
  },
} satisfies Meta<typeof TelField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <TelField
              size={size}
              variant={variant}
              defaultValue="+821012345678"
              aria-label={`${variant} ${size}`}
              className="w-60"
            >
              <TelField.CountrySelect />
              <TelField.Input />
            </TelField>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <TelField placeholder="010-0000-0000" aria-label="비어 있음" className="w-60" />
        </Showcase.Row>
        <Showcase.Row label="national">
          <TelField defaultValue="+821012345678" aria-label="국내 번호" className="w-60" />
        </Showcase.Row>
        <Showcase.Row label="other country">
          <TelField defaultValue="+12025550123" aria-label="해외 번호" className="w-60" />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <TelField defaultValue="010-1234" invalid aria-label="잘못됨" className="w-60" />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <TelField defaultValue="+821012345678" disabled aria-label="비활성" className="w-60">
            <TelField.CountrySelect />
            <TelField.Input />
          </TelField>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <TelField defaultValue="+821012345678" readOnly aria-label="읽기 전용" className="w-60" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Format"
        description="값은 언제나 E.164입니다. format은 화면에 보이는 모양만 정합니다."
      >
        <Showcase.Row label="auto">
          <TelField defaultValue="+821012345678" format="auto" aria-label="auto" className="w-60" />
        </Showcase.Row>
        <Showcase.Row label="international">
          <TelField
            defaultValue="+821012345678"
            format="international"
            aria-label="international"
            className="w-60"
          />
        </Showcase.Row>
        <Showcase.Row label="none">
          <TelField defaultValue="+821012345678" format="none" aria-label="none" className="w-60" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Composition">
        <Showcase.Row label="icon · Clear">
          <TelField defaultValue="+821012345678" aria-label="아이콘" className="w-72">
            <PhoneIcon />
            <TelField.Input />
            <TelField.Clear />
          </TelField>
        </Showcase.Row>
        <Showcase.Row label="country">
          <TelField defaultValue="+442079460958" aria-label="국가 선택" className="w-72">
            <TelField.CountrySelect />
            <TelField.Input />
            <TelField.Clear />
          </TelField>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function ValueExample() {
  const [value, setValue] = useState('');
  return (
    <div className="grid w-72 gap-3">
      <Field>
        <Field.Label>전화번호</Field.Label>
        <TelField value={value} onValueChange={setValue} name="tel" defaultCountry="KR">
          <TelField.CountrySelect />
          <TelField.Input />
        </TelField>
        <Field.Hint>국가와 번호를 입력하세요.</Field.Hint>
      </Field>
      <output aria-label="전화번호 값">{value}</output>
    </div>
  );
}

export const CountryAndValue: Story = {
  render: () => <ValueExample />,
  parameters: {
    docs: {
      description: {
        story:
          '화면에는 나라별 형식으로 보이고 값은 E.164로 나옵니다. 국가를 바꾸면 국가 번호만 바뀝니다. 국가는 이름, ISO 코드, 국가 번호로 찾습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '전화번호' });
    await userEvent.type(input, '01012345678');
    await expect(input).toHaveValue('010-1234-5678');
    await expect(canvas.getByLabelText('전화번호 값')).toHaveTextContent('+821012345678');
    await userEvent.click(canvas.getByRole('combobox', { name: '국가' }));
    await userEvent.type(canvas.getByRole('combobox', { name: '옵션 검색' }), '미국');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('전화번호 값')).toHaveTextContent('+11012345678');
    await expect(canvas.getByRole('combobox', { name: '국가' })).toHaveTextContent('US +1');
  },
};

export const InternationalInput: Story = {
  render: (args) => (
    <TelField {...args}>
      <TelField.CountrySelect />
      <TelField.Input />
    </TelField>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '국가 선택 옆에 +로 시작하는 번호를 넣으면 그 나라로 선택이 바뀌고, 입력에는 국내 형식만 남습니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '전화번호' });
    await userEvent.type(input, '+442079460958');
    await expect(canvas.getByRole('combobox', { name: '국가' })).toHaveTextContent('GB +44');
    await expect(input).toHaveValue('020 7946 0958');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('+442079460958');
  },
};

export const Paste: Story = {
  render: (args) => <TelField {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'tel: 링크, (0)이 끼어 있는 국제 번호, 00으로 시작하는 번호, 전각 숫자를 붙여 넣어도 번호로 읽습니다. 국제 번호는 입력돼 있던 내용을 대신합니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '전화번호' });
    await userEvent.type(input, '010');
    await userEvent.paste('tel:+82-10-1234-5678');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('+821012345678');
    await userEvent.paste('+44 (0)20 7946 0958');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('+442079460958');
  },
};

function ValidationExample() {
  const [sent, setSent] = useState('');
  return (
    <form
      className="flex w-72 flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(String(new FormData(event.currentTarget).get('tel')));
      }}
    >
      <Field>
        <Field.Label>연락처</Field.Label>
        <TelField name="tel" required />
        <Field.Error />
      </Field>
      <Button type="submit">보내기</Button>
      <output aria-label="보낸 값">{sent}</output>
    </form>
  );
}

export const Validation: Story = {
  render: () => <ValidationExample />,
  parameters: {
    docs: {
      description: {
        story:
          '덜 입력했거나 있을 수 없는 번호는 native 검증에 걸립니다. 폼이 제출을 막고 Field.Error가 이유를 보여 줍니다. 제출되는 값은 E.164입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '연락처' });
    await userEvent.type(input, '010123');
    await userEvent.click(canvas.getByRole('button', { name: '보내기' }));
    await expect(await canvas.findByText('올바른 전화번호를 입력하세요.')).toBeVisible();
    await userEvent.type(input, '45678');
    await expect(canvas.queryByText('올바른 전화번호를 입력하세요.')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: '보내기' }));
    await expect(canvas.getByLabelText('보낸 값')).toHaveTextContent('+821012345678');
  },
};
