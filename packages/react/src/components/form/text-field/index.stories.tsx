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
    'aria-invalid': { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    placeholder: '검색어를 입력하세요',
    'aria-label': '검색어',
    onValueChange: fn(),
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Usage: Story = {
  render: () => (
    <div className="w-72">
      <Field>
        <Field.Label>이름</Field.Label>
        <TextField placeholder="홍길동" />
      </Field>
    </div>
  ),
};

export const Gallery: Story = {
  render: function Render() {
    const [copied, setCopied] = useState(false);

    return (
      <Showcase>
        <Showcase.Section title="Variant × Size">
          <Showcase.Matrix
            rows={sizes}
            columns={variants}
            render={(size, variant) => (
              <div className="w-56">
                <TextField
                  size={size}
                  variant={variant}
                  placeholder="이름"
                  aria-label={`${variant} ${size}`}
                />
              </div>
            )}
          />
        </Showcase.Section>

        <Showcase.Section title="States">
          <Showcase.Row label="empty">
            <div className="w-56">
              <TextField placeholder="이름" aria-label="비어 있음" />
            </div>
          </Showcase.Row>
          <Showcase.Row label="filled">
            <div className="w-56">
              <TextField defaultValue="인포팀" aria-label="채움" />
            </div>
          </Showcase.Row>
          <Showcase.Row label="invalid">
            <div className="w-56">
              <TextField defaultValue="인포팀!" aria-invalid aria-label="잘못됨" />
            </div>
            <div className="w-56">
              <TextField
                defaultValue="인포팀!"
                aria-invalid
                variant="soft"
                aria-label="잘못됨 soft"
              />
            </div>
          </Showcase.Row>
          <Showcase.Row label="disabled">
            <div className="w-56">
              <TextField defaultValue="인포팀" disabled aria-label="비활성" />
            </div>
          </Showcase.Row>
          <Showcase.Row label="readOnly">
            <div className="w-56">
              <TextField defaultValue="인포팀" readOnly aria-label="읽기 전용" />
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Composition"
          description="TextField.Input 앞의 자식은 앞쪽, 뒤의 자식은 뒤쪽에 놓입니다. 아이콘과 글자는 흐린 색이 되고, 버튼은 안쪽 크기로 줄어듭니다."
        >
          <Showcase.Row label="leading icon">
            <div className="w-72">
              <TextField placeholder="검색" aria-label="검색">
                <MagnifyingGlassIcon />
                <TextField.Input />
              </TextField>
            </div>
            <div className="w-56">
              <TextField size="tiny" placeholder="검색" aria-label="검색 tiny">
                <MagnifyingGlassIcon />
                <TextField.Input />
              </TextField>
            </div>
          </Showcase.Row>
          <Showcase.Row label="Clear">
            <div className="w-72">
              <TextField defaultValue="인포팀" aria-label="지우기 예시">
                <MagnifyingGlassIcon />
                <TextField.Input />
                <TextField.Clear />
              </TextField>
            </div>
            <div className="w-56">
              <TextField size="tiny" defaultValue="인포팀" aria-label="지우기 tiny">
                <TextField.Input />
                <TextField.Clear />
              </TextField>
            </div>
          </Showcase.Row>
          <Showcase.Row label="prefix · suffix">
            <div className="w-72">
              <TextField defaultValue="gistory" aria-label="주소">
                <span>https://</span>
                <TextField.Input />
                <span>.me</span>
              </TextField>
            </div>
            <div className="w-72">
              <TextField placeholder="아이디" aria-label="아이디">
                <TextField.Input />
                <span>@gm.gist.ac.kr</span>
              </TextField>
            </div>
          </Showcase.Row>
          <Showcase.Row label="buttons">
            <div className="w-72">
              <TextField defaultValue="https://gistory.me/ids" readOnly aria-label="공유 링크">
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
            </div>
            <div className="w-72">
              <TextField placeholder="북마크 이름" aria-label="북마크">
                <TextField.Input />
                <IconToggle
                  aria-label="즐겨찾기"
                  icon={(state) => (state.pressed ? <StarIconSolid /> : <StarIcon />)}
                />
              </TextField>
            </div>
          </Showcase.Row>
          <Showcase.Row label="text button">
            <div className="w-72">
              <TextField placeholder="검색어" aria-label="범위 검색">
                <TextField.Input />
                <Button variant="ghost">
                  전체
                  <ChevronDownIcon />
                </Button>
              </TextField>
            </div>
          </Showcase.Row>
          <Showcase.Row label="shortcut">
            <div className="w-72">
              <TextField placeholder="빠른 검색" aria-label="빠른 검색">
                <MagnifyingGlassIcon />
                <TextField.Input />
                <Kbd>⌘K</Kbd>
              </TextField>
            </div>
          </Showcase.Row>
          <Showcase.Row label="email">
            <div className="w-72">
              <TextField type="email" placeholder="name@example.com" aria-label="이메일">
                <EnvelopeIcon />
                <TextField.Input />
              </TextField>
            </div>
            <div className="w-72">
              <TextField variant="soft" placeholder="username" aria-label="사용자 이름">
                <AtSymbolIcon />
                <TextField.Input />
              </TextField>
            </div>
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const ClearTheValue: Story = {
  render: (args) => (
    <div className="w-72">
      <TextField {...args} defaultValue="인포팀">
        <MagnifyingGlassIcon />
        <TextField.Input />
        <TextField.Clear />
      </TextField>
    </div>
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

export const ShowAnErrorUnderTheField: Story = {
  render: () => (
    <div className="w-72">
      <Field invalid>
        <Field.Label>닉네임</Field.Label>
        <TextField defaultValue="a" />
        <Field.Error>2자 이상 입력하세요.</Field.Error>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Field나 invalid, aria-invalid로 입력이 잘못되면 danger 테두리와 포커스 링이 그려지고 입력에 aria-invalid가 붙습니다.',
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

export const ConnectReactHookForm: Story = {
  render: function Render() {
    const methods = useForm({ defaultValues: { query: '' } });
    const query = useWatch({ control: methods.control, name: 'query' });

    return (
      <FormProvider {...methods}>
        <form className="grid w-72 gap-3" onSubmit={(event) => event.preventDefault()}>
          <RhfField name="query">
            <RhfField.Label>검색어</RhfField.Label>
            <TextField>
              <MagnifyingGlassIcon />
              <TextField.Input />
              <TextField.Clear />
            </TextField>
          </RhfField>
          <Button
            type="button"
            variant="outline"
            onClick={() => methods.setValue('query', '인포팀')}
          >
            코드로 값 넣기
          </Button>
          <output aria-label="RHF 값">{JSON.stringify(query)}</output>
        </form>
      </FormProvider>
    );
  },
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

export const PointerFocusFromAnAdornment: Story = {
  tags: ['verification'],
  render: () => (
    <div className="w-72">
      <TextField aria-label="포커스 테스트" placeholder="아이콘을 눌러도 입력으로 갑니다">
        <MagnifyingGlassIcon />
        <TextField.Input />
      </TextField>
    </div>
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
