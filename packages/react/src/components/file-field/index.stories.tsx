import { useState } from 'react';

import { expect } from 'storybook/test';

import { Field } from '../field';

import { FileField } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Components/FileField',
  component: FileField,
  tags: ['autodocs'],
} satisfies Meta<typeof FileField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <form className="grid max-w-md gap-3">
      <Field>
        <Field.Label>첨부 파일</Field.Label>
        <FileField
          multiple
          value={files}
          onChange={setFiles}
          accept=".txt"
          maxSize={20}
          maxCount={2}
          name="attachments"
          variant="dropzone"
          data-testid="file-picker"
        />
        <Field.Hint>TXT 파일, 최대 2개, 파일당 20 bytes. 실제 업로드는 하지 않습니다.</Field.Hint>
      </Field>
      <output aria-label="파일 결과">{files.map((f) => f.name).join(', ')}</output>
    </form>
  );
}
export const SelectValidateAndRemove: Story = {
  render: () => <Example />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByTestId('file-picker') as HTMLInputElement;
    const a = new File(['hello'], 'a.txt', { type: 'text/plain' }),
      b = new File(['world'], 'b.txt', { type: 'text/plain' });
    await userEvent.upload(input, [a, b]);
    await expect(canvas.getByLabelText('파일 결과')).toHaveTextContent('a.txt, b.txt');
    const data = new FormData(input.form!);
    await expect(data.getAll('attachments').map((f) => (f as File).name)).toEqual([
      'a.txt',
      'b.txt',
    ]);
    await userEvent.upload(input, new File(['x'.repeat(21)], 'large.txt', { type: 'text/plain' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('파일 크기 제한');
    await userEvent.click(canvas.getByRole('button', { name: 'a.txt 삭제' }));
    await expect(canvas.getByLabelText('파일 결과')).toHaveTextContent('b.txt');
    await expect(
      new FormData(input.form!).getAll('attachments').map((f) => (f as File).name),
    ).toEqual(['b.txt']);
    await userEvent.click(canvas.getByRole('button', { name: '파일 모두 지우기' }));
    await expect(canvas.getByLabelText('파일 결과')).toBeEmptyDOMElement();
    await expect(canvas.getByRole('button', { name: '첨부 파일' })).toHaveFocus();
  },
};
export const Playground: Story = {
  args: { 'aria-label': '파일 선택', accept: 'image/*,.pdf', multiple: true, variant: 'dropzone' },
};
