import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Item } from '../../data/item';
import { Field } from '../field';

import { FileDropzone } from '.';

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
  title: 'Form/FileDropzone',
  component: FileDropzone,
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
    placeholder: '파일을 끌어다 놓거나 눌러서 고르세요',
    variant: 'outline',
    size: 'standard',
    onValueChange: fn(),
    onReject: fn(),
  },
  render: (args) => (
    <div className="w-80">
      <FileDropzone {...args} />
    </div>
  ),
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <Field className="w-80">
      <Field.Label>첨부 파일</Field.Label>
      <FileDropzone placeholder="파일을 끌어다 놓거나 눌러서 고르세요" />
    </Field>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Size"
        description="FileDropzone.Limits 에 쓴 허용 형식과 크기 제한은 영역 안에 미리 보입니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-64">
              <FileDropzone
                size={size}
                variant={variant}
                multiple
                accept="image/*,.pdf"
                maxSize={5 * 1024 * 1024}
                maxCount={3}
                placeholder="파일을 끌어다 놓으세요"
                aria-label={`${variant} ${size}`}
              >
                <FileDropzone.Limits>이미지, PDF · 파일당 최대 5 MB · 최대 3개</FileDropzone.Limits>
              </FileDropzone>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="list" className="items-start">
          <div className="w-80">
            <FileDropzone
              aria-label="여럿"
              multiple
              defaultValue={[photo('cover.svg', '#22c55e'), pdf()]}
            />
          </div>
        </Showcase.Row>
        <Showcase.Row label="single" className="items-start">
          <div className="w-80">
            <FileDropzone aria-label="하나" defaultValue={photo()} accept="image/*" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <div className="w-80">
            <FileDropzone aria-label="잘못됨" placeholder="파일을 끌어다 놓으세요" invalid />
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-80">
            <FileDropzone aria-label="비활성" placeholder="파일을 끌어다 놓으세요" disabled />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly" className="items-start">
          <div className="w-80">
            <FileDropzone aria-label="읽기 전용" readOnly multiple defaultValue={[pdf()]} />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const LimitTypeSizeAndCount: Story = {
  args: {
    'aria-label': undefined,
    multiple: true,
    accept: '.pdf,image/*',
    maxSize: 1024,
    maxCount: 2,
  },
  render: (args) => (
    <Field className="w-96">
      <Field.Label>증빙 자료</Field.Label>
      <FileDropzone {...args}>
        <FileDropzone.Limits>
          {({ maxSize, maxCount }) =>
            `PDF, 이미지 · 파일당 최대 ${(maxSize ?? 0) / 1024} KB · 최대 ${maxCount}개`
          }
        </FileDropzone.Limits>
        <FileDropzone.Rejection>
          {({ file, reason }) =>
            `${file.name}: ${
              reason === 'type'
                ? 'PDF 나 이미지만 올릴 수 있습니다.'
                : reason === 'size'
                  ? '1 KB보다 큽니다.'
                  : '최대 2개까지 고를 수 있습니다.'
            }`
          }
        </FileDropzone.Rejection>
      </FileDropzone>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'FileDropzone.Limits 의 자식 함수는 { accept, maxSize, maxCount } 를 받아 고르기 전에 규칙을 영역 안에 적고, 그 글은 트리거의 aria-describedby 로 읽힙니다. 규칙에 걸린 파일은 빼고 나머지만 받으며, FileDropzone.Rejection 의 자식 함수가 거부된 파일마다 { file, reason } 을 받아 이유를 적습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const trigger = canvas.getByRole('button', { name: '증빙 자료' });
    await expect(trigger).toHaveAccessibleDescription(/1 KB/);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type=file]')!;
    await userEvent.upload(input, [pdf('small.pdf', 512), pdf('large.pdf', 4096)]);
    await expect(args.onValueChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'small.pdf' }),
    ]);
    await expect(canvas.getByRole('alert')).toHaveTextContent('large.pdf');
  },
};

export const PasteOrDropFiles: Story = {
  args: { multiple: true, accept: 'image/*' },
  parameters: {
    docs: {
      description: {
        story:
          '영역에 포커스를 두고 붙여넣으면 클립보드의 파일(스크린샷 등)이 들어갑니다. 파일을 끌어 올리면 영역 색이 바뀌고, 놓으면 받습니다. 글자나 링크를 끌어 오는 것은 무시합니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const trigger = canvas.getByRole('button', { name: '첨부 파일' });
    trigger.focus();
    const clipboard = new DataTransfer();
    clipboard.items.add(photo('screenshot.svg'));
    await userEvent.paste(clipboard);
    await expect(args.onValueChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'screenshot.svg' }),
    ]);
    const root = canvasElement.querySelector('[data-file-dropzone]')!;
    const dragged = new DataTransfer();
    dragged.items.add(photo('dropped.svg', '#8b5cf6'));
    root.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: dragged }));
    await waitFor(() => expect(trigger).toHaveAttribute('data-dragging'));
    root.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dragged }),
    );
    await waitFor(() => expect(trigger).not.toHaveAttribute('data-dragging'));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};

export const DrawYourOwnFileList: Story = {
  args: { multiple: true, defaultValue: [photo('a.svg'), pdf('b.pdf')] },
  render: (args) => (
    <div className="w-80">
      <FileDropzone {...args}>
        <FileDropzone.Trigger />
        <FileDropzone.List>
          {(files) =>
            files.map((file) => (
              <FileDropzone.Item key={`${file.name}:${file.lastModified}`} file={file}>
                {({ index }) => (
                  <>
                    <FileDropzone.Preview file={file} />
                    <Item.Content>
                      <Item.Title truncate>
                        {index + 1}. {file.name}
                      </Item.Title>
                    </Item.Content>
                    <Item.Actions>
                      <FileDropzone.Remove file={file} />
                    </Item.Actions>
                  </>
                )}
              </FileDropzone.Item>
            ))
          }
        </FileDropzone.List>
      </FileDropzone>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'FileDropzone 의 part 는 FileField 와 같습니다. Trigger 를 하나 두고, List 와 Item 으로 목록을 바꿉니다. List 의 children 은 지금 파일 목록을, Item 의 children 은 { file, index } 를 받는 함수도 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const rows = canvas.getAllByRole('listitem');
    await expect(rows.map((row) => row.textContent)).toEqual(['1. a.svg', '2. b.pdf']);
    await userEvent.click(canvas.getByRole('button', { name: 'a.svg 삭제' }));
    await expect(canvas.getAllByRole('listitem').map((row) => row.textContent)).toEqual([
      '1. b.pdf',
    ]);
  },
};
