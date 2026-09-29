import { useState } from 'react';

import { CheckCircleIcon } from '@heroicons/react/16/solid';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { Select } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const fruits = [
  ['apple', '사과'],
  ['banana', '바나나'],
  ['cherry', '체리'],
  ['grape', '포도'],
  ['mango', '망고'],
] as const;

const meta = {
  title: 'Form/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    mobileVariant: { control: 'radio', options: ['popover', 'drawer'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    'aria-label': '과일',
    placeholder: '과일 선택',
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
    onOpenChange: fn(),
    children: fruits.map(([value, label]) => (
      <Select.Item key={value} value={value}>
        {label}
      </Select.Item>
    )),
  },
  render: (args) => (
    <div className="w-64">
      <Select {...args} />
    </div>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLButtonElement>('[data-select] [role=combobox]')!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Open"
        description="선택한 옵션에는 체크가 붙고, 키보드나 마우스로 가리킨 옵션은 muted 배경이 됩니다."
      >
        <Showcase.Row label="groups" className="h-64 items-start">
          <div className="w-56">
            <Select aria-label="음식" defaultValue="kimchi" defaultOpen>
              <Select.Group heading="한식">
                <Select.Item value="bibimbap">비빔밥</Select.Item>
                <Select.Item value="kimchi">김치찌개</Select.Item>
              </Select.Group>
              <Select.Separator />
              <Select.Group heading="양식">
                <Select.Item value="pasta">파스타</Select.Item>
                <Select.Item value="risotto" disabled>
                  리소토 (품절)
                </Select.Item>
              </Select.Group>
            </Select>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-56">
              <Select
                size={size}
                variant={variant}
                defaultValue="cherry"
                aria-label={`${variant} ${size}`}
              >
                {fruits.map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="placeholder">
          <div className="w-56">
            <Select aria-label="비어 있음" placeholder="과일 선택">
              {fruits.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
          </div>
        </Showcase.Row>
        <Showcase.Row label="multiple">
          <div className="w-56">
            <Select
              selectionMode="multiple"
              defaultValue={['apple', 'cherry', 'grape', 'mango']}
              aria-label="여럿"
            >
              {fruits.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
          </div>
        </Showcase.Row>
        <Showcase.Row label="clearable">
          <div className="w-56">
            <Select defaultValue="banana" aria-label="지우기">
              <Select.Clear />
              {fruits.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
          </div>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <div className="w-56">
            <Select invalid aria-label="잘못됨">
              {fruits.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-56">
            <Select disabled defaultValue="apple" aria-label="비활성">
              {fruits.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <div className="w-56">
            <Select readOnly defaultValue="apple" aria-label="읽기 전용">
              {fruits.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  args: {
    children: (
      <>
        <Select.Item value="apple">사과</Select.Item>
        <Select.Item value="banana" disabled>
          바나나
        </Select.Item>
        <Select.Item value="cherry">체리</Select.Item>
        <Select.Item value="grape">포도</Select.Item>
        <Select.Item value="mango">망고</Select.Item>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '포커스는 트리거에 남고 aria-activedescendant 가 옵션을 가리킵니다. ↑↓ Home End PageUp PageDown 으로 움직이고, 글자를 치면 그 글자로 시작하는 옵션으로 갑니다. 같은 글자를 반복하면 그 글자의 옵션을 차례로 돕니다. 비활성 옵션은 건너뜁니다.',
      },
    },
  },
  play: async ({ canvasElement, canvas, userEvent, args }) => {
    const button = trigger(canvasElement);
    button.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
    await expect(button).toHaveFocus();
    const active = () => document.getElementById(button.getAttribute('aria-activedescendant')!);
    await expect(active()).toHaveTextContent('사과');
    await userEvent.keyboard('{ArrowDown}');
    await expect(active()).toHaveTextContent('체리');
    await userEvent.keyboard('{End}');
    await expect(active()).toHaveTextContent('망고');
    await userEvent.keyboard('{ArrowUp}');
    await expect(active()).toHaveTextContent('포도');
    await userEvent.keyboard('{Home}');
    await expect(active()).toHaveTextContent('사과');
    await userEvent.keyboard('망');
    await expect(active()).toHaveTextContent('망고');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('mango');
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(button).toHaveFocus();
    await expect(button).toHaveTextContent('망고');
  },
};

export const SearchAndMultiple: Story = {
  render: function Render() {
    const [value, setValue] = useState<string[]>([]);

    return (
      <div className="grid w-72 gap-3">
        <Field>
          <Field.Label>관심 분야</Field.Label>
          <Select selectionMode="multiple" value={value} onValueChange={setValue}>
            <Select.SearchField placeholder="분야 검색" />
            <Select.Group heading="개발">
              <Select.Item value="react">React</Select.Item>
              <Select.Item value="flutter" searchValue="Flutter Dart">
                Flutter
              </Select.Item>
              <Select.Item value="rust" disabled>
                Rust
              </Select.Item>
            </Select.Group>
            <Select.Separator />
            <Select.Item value="design">Design</Select.Item>
            <Select.Empty>결과 없음</Select.Empty>
          </Select>
          <Field.Hint>여러 개를 고를 수 있습니다.</Field.Hint>
        </Field>
        <output aria-label="선택 값">{value.join(',')}</output>
        <button type="button">다음</button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '여러 개를 고를 때는 팝업이 열린 채로 토글되고, 값은 목록 순서로 정렬됩니다. searchValue 로 라벨에 없는 검색어(Dart)도 찾을 수 있고, 검색이 비면 결과 없음이 스크린 리더에 읽힙니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('combobox', { name: '관심 분야' });
    await userEvent.click(button);
    const search = canvas.getByRole('combobox', { name: '옵션 검색' });
    await expect(search).toHaveFocus();
    await userEvent.type(search, 'dart');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('선택 값')).toHaveTextContent('flutter');
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    await waitFor(() => expect(canvas.getByText('결과 없음')).toBeVisible());
    await userEvent.clear(search);
    await userEvent.type(search, 'React');
    await userEvent.keyboard('{Enter}{Escape}');
    await expect(button).toHaveFocus();
    await expect(canvas.getByLabelText('선택 값')).toHaveTextContent('react,flutter');
    await expect(button).toHaveTextContent('React, Flutter');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '다음' })).toHaveFocus();
  },
};

export const Clearable: Story = {
  args: {
    defaultValue: 'cherry',
    children: [
      <Select.Clear key="clear" />,
      ...fruits.map(([value, label]) => (
        <Select.Item key={value} value={value}>
          {label}
        </Select.Item>
      )),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Select.Clear 를 넣으면 값이 있을 때 지우기 버튼이 나타나 null 로 되돌립니다. 지운 뒤 포커스는 트리거로 갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '선택 지우기' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
    await expect(trigger(canvasElement)).toHaveFocus();
    await expect(trigger(canvasElement)).toHaveTextContent('과일 선택');
    await expect(canvas.queryByRole('button', { name: '선택 지우기' })).toBeNull();
  },
};

const countries = Array.from({ length: 40 }, (_, index) => `도시 ${index + 1}`);

export const LongList: Story = {
  args: {
    defaultValue: '도시 32',
    children: countries.map((city) => (
      <Select.Item key={city} value={city}>
        {city}
      </Select.Item>
    )),
  },
  parameters: {
    docs: {
      description: {
        story:
          '열면 선택한 옵션이 목록 가운데로 스크롤됩니다. 이후 키보드 이동은 필요한 만큼만 스크롤하고, 문서는 스크롤하지 않습니다. 아래 공간이 모자라면 위로 뒤집혀 열리고, 화면 안에서 높이가 줄어듭니다.',
      },
    },
  },
  play: async ({ canvasElement, canvas, userEvent }) => {
    await userEvent.click(trigger(canvasElement));
    const option = canvas.getByRole('option', { name: '도시 32' });
    const popup = option.closest<HTMLElement>('[data-field-popup]')!;
    await waitFor(() => {
      const box = popup.getBoundingClientRect(),
        rect = option.getBoundingClientRect();
      expect(rect.top).toBeGreaterThanOrEqual(box.top);
      expect(rect.bottom).toBeLessThanOrEqual(box.bottom);
    });
    await expect(option).toHaveAttribute('data-highlighted');
    await userEvent.keyboard('{PageDown}');
    await expect(canvas.getByRole('option', { name: '도시 40' })).toHaveAttribute(
      'data-highlighted',
    );
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
          const data = new FormData(event.currentTarget);
          setSubmitted(JSON.stringify({ fruit: data.get('fruit'), tags: data.getAll('tags') }));
        }}
      >
        <Field className="w-full">
          <Field.Label>과일</Field.Label>
          <Select name="fruit" required>
            {fruits.map(([value, label]) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select>
        </Field>
        <Field className="w-full">
          <Field.Label>태그</Field.Label>
          <Select name="tags" selectionMode="multiple" defaultValue={['apple']}>
            {fruits.map(([value, label]) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select>
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
          'name 을 주면 값마다 hidden input 이 FormData 에 들어갑니다. required 는 브라우저 검증으로 막히고, 검증 메시지는 필드에 붙으며 포커스는 트리거로 갑니다. 초기화 버튼은 defaultValue 로 되돌립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const fruit = canvas.getByRole('combobox', { name: '과일' });
    const form = fruit.closest('form')!;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toBeEmptyDOMElement();
    await waitFor(() => expect(fruit).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent(
      '{"fruit":"banana","tags":["apple"]}',
    );
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(fruit).toHaveTextContent('선택하세요'));
    await expect(form.checkValidity()).toBe(false);
  },
};

export const ReactHookForm: Story = {
  render: function Render() {
    const methods = useForm<{ fruit: string | null }>({ defaultValues: { fruit: null } });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          className="flex w-72 flex-col items-start gap-4"
          noValidate
          onSubmit={methods.handleSubmit((data) => setResult(`저장: ${data.fruit}`))}
        >
          <FormField
            name="fruit"
            controlMode="value"
            registerOptions={{ required: '과일을 고르세요.' }}
            className="w-full"
          >
            <FormField.Label>과일</FormField.Label>
            <Select>
              {fruits.map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select>
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
          'controlMode="value" 로 연결하면 onValueChange 가 field.onChange 로 이어집니다. 오류가 나면 트리거로 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(canvas.getByText('과일을 고르세요.')).toBeVisible());
    const fruit = canvas.getByRole('combobox', { name: '과일' });
    await expect(fruit).toHaveFocus();
    await userEvent.click(fruit);
    await userEvent.click(canvas.getByRole('option', { name: '망고' }));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('저장: mango');
  },
};

export const ControlledOpen: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex w-72 flex-col items-start gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          바깥에서 열기
        </Button>
        <div className="w-full">
          <Select aria-label="과일" open={open} onOpenChange={setOpen}>
            {fruits.map(([value, label]) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select>
        </div>
        <output aria-label="열림 상태">{open ? '열림' : '닫힘'}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'open 과 onOpenChange 로 열림 상태를 바깥에서 제어합니다. Escape 로 닫아도 알려 줍니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '바깥에서 열기' }));
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
    await expect(canvas.getByLabelText('열림 상태')).toHaveTextContent('열림');
    canvas.getByRole('combobox', { name: '과일' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('열림 상태')).toHaveTextContent('닫힘');
  },
};

const statuses = [
  ['todo', '할 일', cn('bg-(--ids-color-on-muted)')],
  ['doing', '진행 중', cn('bg-(--ids-color-info)')],
  ['done', '완료', cn('bg-(--ids-color-success)')],
] as const;

export const CustomItems: Story = {
  args: {
    defaultValue: 'doing',
    children: statuses.map(([value, label, dot]) => (
      <Select.Item
        key={value}
        value={value}
        label={label}
        className={(state) => (state.selected ? 'font-medium' : undefined)}
      >
        <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', dot)} />
        {label}
        <Select.ItemIndicator className="text-(--ids-color-success)">
          <CheckCircleIcon />
        </Select.ItemIndicator>
      </Select.Item>
    )),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Item 의 className 과 children 은 { selected, highlighted, disabled } 상태를 받는 함수도 됩니다. ItemIndicator 를 직접 두면 기본 체크 대신 그것을 그립니다. label 은 트리거에 보일 글자입니다.',
      },
    },
  },
  play: async ({ canvasElement, canvas, userEvent }) => {
    await userEvent.click(trigger(canvasElement));
    const doing = canvas.getByRole('option', { name: '진행 중' });
    await expect(doing).toHaveAttribute('aria-selected', 'true');
    await expect(doing.querySelectorAll('[data-select-item-indicator]')).toHaveLength(1);
    await expect(trigger(canvasElement)).toHaveTextContent('진행 중');
  },
};

export const Drawer: Story = {
  args: {
    mobileVariant: 'drawer',
    children: (
      <>
        <Select.Item value="apple">사과</Select.Item>
        <Select.Item value="banana" disabled>
          바나나
        </Select.Item>
        <Select.Item value="cherry">체리</Select.Item>
        <Select.Item value="grape">포도</Select.Item>
        <Select.Item value="mango">망고</Select.Item>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '640px 보다 좁은 화면에서 mobileVariant="drawer" 는 모달 하단 시트로 엽니다. 배경이 어두워지고 클릭을 받지 않으며, 포커스는 시트 안에 머물고, 페이지 스크롤이 잠깁니다. 넓은 화면에서는 팝오버와 같습니다.',
      },
    },
  },
};
