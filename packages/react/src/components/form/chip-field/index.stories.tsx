import { useState } from 'react';

import { TagIcon } from '@heroicons/react/16/solid';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Field } from '../field';

import { ChipField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

// A Fragment, not a component: ChipField finds items only as direct children or inside Fragments.
const skills = (
  <>
    <ChipField.Group heading="프론트엔드">
      <ChipField.Item value="react">React</ChipField.Item>
      <ChipField.Item value="vue">Vue</ChipField.Item>
      <ChipField.Item value="svelte">Svelte</ChipField.Item>
    </ChipField.Group>
    <ChipField.Group heading="모바일">
      <ChipField.Item value="flutter">Flutter</ChipField.Item>
      <ChipField.Item value="swift">Swift</ChipField.Item>
      <ChipField.Item value="kotlin" disabled>
        Kotlin (준비 중)
      </ChipField.Item>
    </ChipField.Group>
  </>
);

const meta = {
  title: 'Form/ChipField',
  component: ChipField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    mobileVariant: { control: 'radio', options: ['popover', 'drawer'] },
    creatable: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    maxCount: { control: { type: 'number', min: 0 } },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '기술',
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
    onOpenChange: fn(),
    children: skills,
  },
  render: (args) => (
    <div className="w-80">
      <ChipField {...args} />
    </div>
  ),
} satisfies Meta<typeof ChipField>;

export default meta;
type Story = StoryObj<typeof meta>;

const input = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('[data-chip-field-input]')!;
const chips = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('[data-chip-field-chip]')].map((chip) => chip.textContent);

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Open"
        description="고른 옵션에는 체크가 붙습니다. 찾는 옵션이 없으면 새 값을 만드는 행이 나옵니다."
      >
        <Showcase.Row label="creatable" className="h-72 items-start">
          <div className="w-80">
            <ChipField aria-label="열림" defaultValue={['react']} creatable defaultOpen>
              {skills}
            </ChipField>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-72">
              <ChipField
                size={size}
                variant={variant}
                defaultValue={['react', 'flutter']}
                aria-label={`${variant} ${size}`}
              >
                {skills}
              </ChipField>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <div className="w-80">
            <ChipField aria-label="비어 있음">{skills}</ChipField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="wrapping">
          <div className="w-80">
            <ChipField
              aria-label="여러 줄"
              defaultValue={['react', 'vue', 'svelte', 'flutter', 'swift']}
            >
              {skills}
            </ChipField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="adornments">
          <div className="w-80">
            <ChipField aria-label="꾸밈" defaultValue={['react']}>
              <TagIcon aria-hidden="true" />
              <ChipField.Input placeholder="태그 검색" />
              {skills}
            </ChipField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <div className="w-80">
            <ChipField aria-label="잘못됨" invalid>
              {skills}
            </ChipField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-80">
            <ChipField aria-label="비활성" disabled defaultValue={['react', 'vue']}>
              {skills}
            </ChipField>
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <div className="w-80">
            <ChipField aria-label="읽기 전용" readOnly defaultValue={['react', 'vue']}>
              {skills}
            </ChipField>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const KeyboardAndChips: Story = {
  args: { defaultValue: ['react', 'vue'] },
  parameters: {
    docs: {
      description: {
        story:
          '입력 맨 앞에서 ← 를 누르면 마지막 칩으로 갑니다. 칩 사이는 ← → 로 오가고, Backspace 와 Delete 는 칩을 지운 뒤 옆 칩으로 포커스를 옮깁니다. → 로 마지막 칩을 지나면 입력으로 돌아옵니다. Tab 은 칩을 거치지 않고 필드를 떠납니다.',
      },
    },
  },
  play: async ({ canvasElement, canvas, userEvent, args }) => {
    const field = input(canvasElement);
    await userEvent.click(field);
    await userEvent.keyboard('sv');
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible());
    await userEvent.keyboard('{Enter}');
    await expect(chips(canvasElement)).toEqual(['React', 'Vue', 'Svelte']);
    await expect(field).toHaveValue('');
    await userEvent.keyboard('{Escape}{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: 'Svelte 삭제' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: 'Vue 삭제' })).toHaveFocus();
    await userEvent.keyboard('{Backspace}');
    await expect(chips(canvasElement)).toEqual(['React', 'Svelte']);
    await expect(canvas.getByRole('button', { name: 'React 삭제' })).toHaveFocus();
    await userEvent.keyboard('{Delete}');
    await expect(canvas.getByRole('button', { name: 'Svelte 삭제' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(field).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['svelte']);
  },
};

export const Paste: Story = {
  args: { defaultValue: [] },
  parameters: {
    docs: {
      description: {
        story:
          '쉼표, 탭, 줄바꿈이 섞인 글을 붙여넣으면 옵션 이름마다 칩이 됩니다. 이미 있는 값은 건너뛰고, 칩으로 만들 수 없는 글자는 입력에 남겨 고칠 수 있게 합니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const field = input(canvasElement);
    await userEvent.click(field);
    await userEvent.paste('React, vue\nREACT, Elm');
    await expect(chips(canvasElement)).toEqual(['React', 'Vue']);
    await expect(field).toHaveValue('Elm');
  },
};

function CreatableExample() {
  const [emails, setEmails] = useState<string[]>([]);
  return (
    <div className="grid w-96 gap-3">
      <Field>
        <Field.Label>받는 사람</Field.Label>
        <ChipField
          value={emails}
          onValueChange={setEmails}
          creatable
          validate={(text) => /^[^\s@]+@[^\s@]+$/.test(text) || '이메일 주소가 아닙니다.'}
          placeholder="이메일 입력"
        />
        <Field.Hint>쉼표나 Enter 로 주소를 나눕니다.</Field.Hint>
      </Field>
      <output aria-label="받는 사람 목록">{emails.join(' ')}</output>
    </div>
  );
}

export const CreateAndValidate: Story = {
  render: () => <CreatableExample />,
  parameters: {
    docs: {
      description: {
        story:
          'creatable 이면 목록에 없는 값도 칩이 됩니다. validate 가 거부한 값은 만들기 행에 이유가 뜨고 추가되지 않습니다. 쉼표를 치면 지금까지 쓴 값을 칩으로 만듭니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: '받는 사람' });
    await userEvent.click(field);
    await userEvent.keyboard('kim');
    await waitFor(() =>
      expect(canvas.getByRole('option', { name: '이메일 주소가 아닙니다.' })).toHaveAttribute(
        'aria-disabled',
        'true',
      ),
    );
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('받는 사람 목록')).toBeEmptyDOMElement();
    await userEvent.keyboard('@gist.ac.kr,');
    await expect(canvas.getByLabelText('받는 사람 목록')).toHaveTextContent('kim@gist.ac.kr');
    await userEvent.keyboard('lee@gist.ac.kr{Enter}');
    await expect(canvas.getByLabelText('받는 사람 목록')).toHaveTextContent(
      'kim@gist.ac.kr lee@gist.ac.kr',
    );
  },
};

export const MaxCount: Story = {
  args: { maxCount: 2, defaultValue: ['react'] },
  parameters: {
    docs: {
      description: {
        story:
          'maxCount 에 닿으면 고르지 않은 옵션이 비활성이 되고 목록 위에 안내가 나옵니다. 고른 칩을 지우면 다시 고를 수 있습니다.',
      },
    },
  },
  play: async ({ canvasElement, canvas, userEvent }) => {
    await userEvent.click(input(canvasElement));
    await userEvent.click(canvas.getByRole('option', { name: 'Vue' }));
    await expect(await canvas.findByText('최대 2개까지 고를 수 있습니다.')).toBeVisible();
    await expect(canvas.getByRole('option', { name: 'Svelte' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

function NativeFormExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="flex w-80 flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(new FormData(event.currentTarget).getAll('skills')));
      }}
    >
      <Field className="w-full">
        <Field.Label>기술</Field.Label>
        <ChipField name="skills" required>
          {skills}
        </ChipField>
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
}

export const NativeForm: Story = {
  render: () => <NativeFormExample />,
  parameters: {
    docs: {
      description: {
        story:
          '칩마다 hidden input 하나가 FormData 에 들어갑니다. required 인데 칩이 없으면 브라우저가 제출을 막고 입력으로 포커스를 보냅니다. 입력 중인 검색어는 제출되지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: '기술' });
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toBeEmptyDOMElement();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('flu{Enter}swi{Enter}{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('["flutter","swift"]');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(field.closest('[data-chip-field]')).toHaveAttribute('data-empty'));
  },
};

function ReactHookFormExample() {
  const methods = useForm<{ tags: string[] }>({ defaultValues: { tags: [] } });
  const [result, setResult] = useState('');
  return (
    <FormProvider {...methods}>
      <form
        className="flex w-80 flex-col items-start gap-4"
        noValidate
        onSubmit={methods.handleSubmit((data) => setResult(data.tags.join(',')))}
      >
        <FormField
          name="tags"
          controlMode="value"
          registerOptions={{ validate: (tags) => tags.length > 0 || '하나 이상 고르세요.' }}
          className="w-full"
        >
          <FormField.Label>태그</FormField.Label>
          <ChipField>{skills}</ChipField>
          <FormField.Error />
        </FormField>
        <Button type="submit">저장</Button>
        <output aria-label="저장 결과">{result}</output>
      </form>
    </FormProvider>
  );
}

export const ReactHookForm: Story = {
  render: () => <ReactHookFormExample />,
  parameters: {
    docs: {
      description: {
        story: 'controlMode="value" 로 연결하면 onValueChange 가 field.onChange 로 이어집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(canvas.getByText('하나 이상 고르세요.')).toBeVisible());
    const field = canvas.getByRole('combobox', { name: '태그' });
    await expect(field).toHaveFocus();
    await userEvent.keyboard('vue{Enter}{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('vue');
  },
};

export const Drawer: Story = {
  args: { mobileVariant: 'drawer', defaultValue: ['react'] },
  parameters: {
    docs: {
      description: {
        story:
          '640px 보다 좁은 화면에서는 모달 하단 시트로 엽니다. 필드의 입력이 시트 뒤로 가려지므로 시트 위에 같은 검색어를 쓰는 검색창이 있고, 닫으면 필드의 입력으로 포커스가 돌아옵니다.',
      },
    },
  },
};
