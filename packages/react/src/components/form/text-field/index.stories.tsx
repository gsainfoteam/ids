import { useState } from 'react';

import {
  AtSymbolIcon,
  CheckIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { expect, fn } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as RhfField } from '../../../react-hook-form';
import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { IconToggle } from '../../action/icon-toggle';
import { Kbd } from '../../typography/kbd';
import { Field } from '../field';

import { TextField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    placeholder: '검색어를 입력하세요',
    'aria-label': '검색어',
    className: cn('w-72'),
    onValueChange: fn(),
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function CopyField() {
  const [copied, setCopied] = useState(false);
  return (
    <TextField
      defaultValue="https://gistory.me/ids"
      readOnly
      aria-label="공유 링크"
      className="w-72"
    >
      <TextField.Input />
      <IconButton
        aria-label={copied ? '복사됨' : '복사'}
        icon={copied ? <CheckIcon /> : <DocumentDuplicateIcon />}
        onClick={() => {
          void navigator.clipboard?.writeText('https://gistory.me/ids');
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      />
    </TextField>
  );
}

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <TextField
              size={size}
              variant={variant}
              placeholder="이름"
              aria-label={`${variant} ${size}`}
              className="w-56"
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <TextField placeholder="이름" aria-label="비어 있음" className="w-56" />
        </Showcase.Row>
        <Showcase.Row label="filled">
          <TextField defaultValue="인포팀" aria-label="채움" className="w-56" />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <TextField defaultValue="인포팀!" invalid aria-label="잘못됨" className="w-56" />
          <TextField
            defaultValue="인포팀!"
            invalid
            variant="soft"
            aria-label="잘못됨 soft"
            className="w-56"
          />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <TextField defaultValue="인포팀" disabled aria-label="비활성" className="w-56" />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <TextField defaultValue="인포팀" readOnly aria-label="읽기 전용" className="w-56" />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="TextField.Input 앞의 자식은 앞쪽, 뒤의 자식은 뒤쪽에 놓입니다. 아이콘과 글자는 흐린 색이 되고, 버튼은 안쪽 크기로 줄어듭니다."
      >
        <Showcase.Row label="leading icon">
          <TextField placeholder="검색" aria-label="검색" className="w-72">
            <MagnifyingGlassIcon />
            <TextField.Input />
          </TextField>
          <TextField size="tiny" placeholder="검색" aria-label="검색 tiny" className="w-56">
            <MagnifyingGlassIcon />
            <TextField.Input />
          </TextField>
        </Showcase.Row>
        <Showcase.Row label="Clear">
          <TextField defaultValue="인포팀" aria-label="지우기 예시" className="w-72">
            <MagnifyingGlassIcon />
            <TextField.Input />
            <TextField.Clear />
          </TextField>
          <TextField size="tiny" defaultValue="인포팀" aria-label="지우기 tiny" className="w-56">
            <TextField.Input />
            <TextField.Clear />
          </TextField>
        </Showcase.Row>
        <Showcase.Row label="prefix · suffix">
          <TextField defaultValue="gistory" aria-label="주소" className="w-72">
            <span>https://</span>
            <TextField.Input />
            <span>.me</span>
          </TextField>
          <TextField placeholder="아이디" aria-label="아이디" className="w-72">
            <TextField.Input />
            <span>@gm.gist.ac.kr</span>
          </TextField>
        </Showcase.Row>
        <Showcase.Row label="buttons">
          <CopyField />
          <TextField placeholder="북마크 이름" aria-label="북마크" className="w-72">
            <TextField.Input />
            <IconToggle
              aria-label="즐겨찾기"
              icon={(state) => (state.pressed ? <StarIconSolid /> : <StarIcon />)}
            />
          </TextField>
        </Showcase.Row>
        <Showcase.Row label="text button">
          <TextField placeholder="검색어" aria-label="범위 검색" className="w-72">
            <TextField.Input />
            <Button variant="ghost">
              전체
              <ChevronDownIcon />
            </Button>
          </TextField>
        </Showcase.Row>
        <Showcase.Row label="shortcut">
          <TextField placeholder="빠른 검색" aria-label="빠른 검색" className="w-72">
            <MagnifyingGlassIcon />
            <TextField.Input />
            <Kbd>⌘K</Kbd>
          </TextField>
        </Showcase.Row>
        <Showcase.Row label="email">
          <TextField
            type="email"
            placeholder="name@example.com"
            aria-label="이메일"
            className="w-72"
          >
            <EnvelopeIcon />
            <TextField.Input />
          </TextField>
          <TextField
            variant="soft"
            placeholder="username"
            aria-label="사용자 이름"
            className="w-72"
          >
            <AtSymbolIcon />
            <TextField.Input />
          </TextField>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Clearable: Story = {
  render: (args) => (
    <TextField {...args} defaultValue="인포팀">
      <MagnifyingGlassIcon />
      <TextField.Input />
      <TextField.Clear />
    </TextField>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TextField.Clear는 값이 있을 때만 보입니다. 누르면 실제 입력 이벤트로 비우고 포커스를 입력에 돌려줍니다. Clear가 있으면 Escape도 입력을 비웁니다.',
      },
    },
  },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '검색어' });
    await userEvent.click(canvas.getByRole('button', { name: '지우기' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('');
    await expect(canvas.queryByRole('button', { name: '지우기' })).toBeNull();
    await userEvent.type(input, '지스트');
    await expect(canvas.getByRole('button', { name: '지우기' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
  },
};

export const InvalidState: Story = {
  render: () => (
    <Field invalid className="w-72">
      <Field.Label>닉네임</Field.Label>
      <TextField defaultValue="a" />
      <Field.Error>2자 이상 입력하세요.</Field.Error>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Field나 invalid, aria-invalid로 입력이 잘못되면 테두리 컨테이너에 data-invalid가 붙어 danger 테두리와 포커스 링이 그려집니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('textbox', { name: '닉네임' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvasElement.querySelector('[data-text-field]')).toHaveAttribute('data-invalid');
    await expect(input).toHaveAttribute('data-field-input');
  },
};

function RhfExample() {
  const methods = useForm({ defaultValues: { query: '' } });
  const query = useWatch({ control: methods.control, name: 'query' });
  return (
    <FormProvider {...methods}>
      <form className="flex w-72 flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
        <RhfField name="query">
          <RhfField.Label>검색어</RhfField.Label>
          <TextField>
            <MagnifyingGlassIcon />
            <TextField.Input />
            <TextField.Clear />
          </TextField>
        </RhfField>
        <Button type="button" variant="outline" onClick={() => methods.setValue('query', '인포팀')}>
          코드로 값 넣기
        </Button>
        <output aria-label="RHF 값">{JSON.stringify(query)}</output>
      </form>
    </FormProvider>
  );
}

export const ReactHookForm: Story = {
  render: () => <RhfExample />,
  parameters: {
    docs: {
      description: {
        story:
          'register()로 연결해도 Clear가 RHF 값을 비웁니다. setValue처럼 이벤트 없이 바뀐 값도 따라가서 Clear가 나타납니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '검색어' });
    await userEvent.click(canvas.getByRole('button', { name: '코드로 값 넣기' }));
    await expect(input).toHaveValue('인포팀');
    await expect(await canvas.findByRole('button', { name: '지우기' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '지우기' }));
    await expect(canvas.getByLabelText('RHF 값')).toHaveTextContent('""');
    await expect(input).toHaveFocus();
  },
};

export const PointerFocus: Story = {
  render: () => (
    <TextField
      aria-label="포커스 테스트"
      placeholder="아이콘을 눌러도 입력으로 갑니다"
      className="w-72"
    >
      <MagnifyingGlassIcon />
      <TextField.Input />
    </TextField>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '아이콘이나 여백을 눌러도 입력에 포커스가 갑니다. 버튼과 링크는 자기 동작을 그대로 합니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '포커스 테스트' });
    await userEvent.click(canvasElement.querySelector('[data-text-field-adornment]')!);
    await expect(input).toHaveFocus();
  },
};
