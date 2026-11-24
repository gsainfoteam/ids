import { useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Item } from '../../data/item';
import { Field } from '../field';

import { FileField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const pdf = (name = 'report.pdf', bytes = 184_320) =>
  new File([new Uint8Array(bytes)], name, { type: 'application/pdf', lastModified: 1 });
const photo = (name = 'photo.svg', fill = '#f97316') =>
  new File(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${fill}"/><circle cx="20" cy="16" r="7" fill="#fff" opacity=".8"/></svg>`,
    ],
    name,
    { type: 'image/svg+xml', lastModified: 1 },
  );

const meta = {
  title: 'Form/FileField',
  component: FileField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    multiple: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    'aria-label': '첨부 파일',
    placeholder: '파일 선택',
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
    onReject: fn(),
  },
  render: (args) => (
    <div className="w-80">
      <FileField {...args} />
    </div>
  ),
} satisfies Meta<typeof FileField>;

export default meta;
type Story = StoryObj<typeof meta>;

const picker = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('input[type=file]')!;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>이력서</Field.Label>
        <FileField accept=".pdf" placeholder="PDF 파일 선택" />
      </Field>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Field · Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-64">
              <FileField
                size={size}
                variant={variant}
                defaultValue={pdf()}
                aria-label={`${variant} ${size}`}
              />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <div className="w-80">
            <FileField aria-label="비어 있음" placeholder="파일 선택" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="image">
          <div className="w-80">
            <FileField aria-label="사진" defaultValue={photo()} accept="image/*" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="multiple" className="items-start">
          <div className="w-80">
            <FileField
              aria-label="여럿"
              multiple
              defaultValue={[
                photo('cover.svg', '#3b82f6'),
                pdf('report.pdf'),
                pdf('부록 - 2026 상반기 예산 집행 결과 (최종 수정본).pdf', 2_400_000),
              ]}
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="multiple · tiny" className="items-start">
          <div className="w-80">
            <FileField
              aria-label="여럿 tiny"
              size="tiny"
              multiple
              defaultValue={[photo('cover.svg', '#a855f7'), pdf('report.pdf')]}
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <div className="w-80">
            <FileField aria-label="잘못됨" placeholder="파일 선택" invalid />
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-80">
            <FileField aria-label="비활성" disabled defaultValue={pdf()} />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly" className="items-start">
          <div className="w-80">
            <FileField aria-label="읽기 전용" readOnly multiple defaultValue={[pdf()]} />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const AcceptSeveralFilesWithLimits: Story = {
  render: function Render() {
    const [files, setFiles] = useState<File[]>([]);

    return (
      <form className="grid w-96 gap-3">
        <Field>
          <Field.Label>첨부 파일</Field.Label>
          <FileField
            multiple
            value={files}
            onValueChange={setFiles}
            accept=".txt"
            maxSize={20}
            maxCount={2}
            name="attachments"
            placeholder="텍스트 파일 선택"
            data-testid="file-picker"
          >
            <FileField.Limits>
              {({ maxSize, maxCount }) => `TXT · 파일당 최대 ${maxSize} B · 최대 ${maxCount}개`}
            </FileField.Limits>
            <FileField.Rejection>
              {({ file, reason }) =>
                `${file.name}: ${
                  reason === 'type'
                    ? '텍스트 파일만 올릴 수 있습니다.'
                    : reason === 'size'
                      ? '20 B보다 큽니다.'
                      : '최대 2개까지 고를 수 있습니다.'
                }`
              }
            </FileField.Rejection>
          </FileField>
          <Field.Hint>실제 업로드는 하지 않습니다.</Field.Hint>
        </Field>
        <output aria-label="파일 결과">{files.map((file) => file.name).join(', ')}</output>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '여러 파일은 목록에 쌓이고, 같은 파일은 다시 넣지 않습니다. accept, maxSize, maxCount 에 걸린 파일은 빼고 나머지만 받습니다. FileField.Limits 의 자식 함수는 { accept, maxSize, maxCount } 를 받아 규칙을 적고, FileField.Rejection 의 자식 함수는 거부된 파일마다 { file, reason } 을 받아 이유를 적습니다. 목록에서 지우면 포커스가 다음 파일로 갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = picker(canvasElement);
    const a = new File(['hello'], 'a.txt', { type: 'text/plain' }),
      b = new File(['world'], 'b.txt', { type: 'text/plain' });
    await userEvent.upload(input, [a, b]);
    await expect(canvas.getByLabelText('파일 결과')).toHaveTextContent('a.txt, b.txt');
    await expect(
      new FormData(input.form!).getAll('attachments').map((file) => (file as File).name),
    ).toEqual(['a.txt', 'b.txt']);
    await userEvent.upload(input, new File(['x'.repeat(21)], 'large.txt', { type: 'text/plain' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('large.txt: 20 B보다 큽니다.');
    await userEvent.click(canvas.getByRole('button', { name: 'a.txt 삭제' }));
    await expect(canvas.getByLabelText('파일 결과')).toHaveTextContent('b.txt');
    await expect(canvas.getByRole('button', { name: 'b.txt 삭제' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByLabelText('파일 결과')).toBeEmptyDOMElement();
    await expect(canvas.getByRole('button', { name: '첨부 파일' })).toHaveFocus();
  },
};

export const SubmitWithANativeForm: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    return (
      <form
        className="grid w-80 gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const file = new FormData(event.currentTarget).get('resume');
          setSubmitted(file instanceof File ? file.name : String(file));
        }}
      >
        <Field>
          <Field.Label>이력서</Field.Label>
          <FileField name="resume" accept=".pdf" required />
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
          'name 을 주면 지금 고른 File 이 그대로 FormData 에 들어갑니다. required 인데 비어 있으면 브라우저가 제출을 막고 트리거로 포커스를 보냅니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: '이력서' });
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toBeEmptyDOMElement();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.upload(picker(canvasElement), pdf('resume.pdf'));
    await userEvent.click(canvas.getByRole('button', { name: '제출' }));
    await expect(canvas.getByLabelText('제출 결과')).toHaveTextContent('resume.pdf');
    await userEvent.click(canvas.getByRole('button', { name: '초기화' }));
    await waitFor(() => expect(trigger).toHaveAttribute('data-placeholder'));
  },
};

export const ValidateWithReactHookForm: Story = {
  render: function Render() {
    const methods = useForm<{ resume: File | null }>({ defaultValues: { resume: null } });
    const [result, setResult] = useState('');

    return (
      <FormProvider {...methods}>
        <form
          className="grid w-80 gap-4"
          noValidate
          onSubmit={methods.handleSubmit((data) => setResult(data.resume?.name ?? ''))}
        >
          <FormField
            name="resume"
            controlMode="value"
            registerOptions={{ required: '파일을 첨부하세요.' }}
          >
            <FormField.Label>이력서</FormField.Label>
            <FileField accept=".pdf" />
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
        story: 'controlMode="value" 로 연결하면 File 이 그대로 field.onChange 로 갑니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(canvas.getByText('파일을 첨부하세요.')).toBeVisible());
    await expect(canvas.getByRole('button', { name: '이력서' })).toHaveFocus();
    await userEvent.upload(picker(canvasElement), pdf('cv.pdf'));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByLabelText('저장 결과')).toHaveTextContent('cv.pdf');
  },
};

export const ListEachFileYourWay: Story = {
  render: () => (
    <div className="w-80">
      <FileField aria-label="첨부 파일" multiple defaultValue={[photo('a.svg'), pdf('b.pdf')]}>
        <FileField.Trigger />
        <FileField.List>
          {(files) =>
            files.map((file) => (
              <FileField.Item key={`${file.name}:${file.lastModified}`} file={file}>
                {({ index }) => (
                  <>
                    <FileField.Preview file={file} />
                    <Item.Content>
                      <Item.Title truncate>
                        {index + 1}. {file.name}
                      </Item.Title>
                    </Item.Content>
                    <Item.Actions>
                      <FileField.Remove file={file} />
                    </Item.Actions>
                  </>
                )}
              </FileField.Item>
            ))
          }
        </FileField.List>
      </FileField>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Trigger, List, Item, Preview, Remove 를 직접 두어 목록을 바꿀 수 있습니다. List 의 children 은 지금 파일 목록을, Item 의 children 은 { file, index } 를 받는 함수도 됩니다. FileField.Item 은 Item 이라 Item.Content, Item.Title, Item.Actions 를 그대로 씁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const rows = canvas.getAllByRole('listitem');
    await expect(rows.map((row) => row.textContent)).toEqual(['1. a.svg', '2. b.pdf']);
    await expect(rows[0].querySelector('[data-item-media] img')).not.toBeNull();
    await expect(canvas.getByRole('button', { name: 'b.pdf 삭제' })).toHaveAttribute(
      'data-variant',
      'ghost',
    );
  },
};
