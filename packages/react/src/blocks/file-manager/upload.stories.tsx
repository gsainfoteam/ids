import { type FormEvent } from 'react';

import { ArrowPathIcon, DocumentTextIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { FileField } from '../../components/form/file-field';
import { Select } from '../../components/form/select';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/FileManager/Upload',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const UPLOADS = [
  {
    id: 'u1',
    name: '굿즈 키링 시안.png',
    size: '3.1MB',
    icon: <PhotoIcon />,
    progress: 100,
    failed: false,
  },
  {
    id: 'u2',
    name: '부스 운영 매뉴얼.pdf',
    size: '8.4MB',
    icon: <DocumentTextIcon />,
    progress: 64,
    failed: false,
  },
  {
    id: 'u3',
    name: '축제 홍보 영상 원본.mov',
    size: '1.3GB',
    icon: <DocumentTextIcon />,
    progress: 0,
    failed: true,
  },
];

export const PC: Story = {
  render: () => (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
      <Card asChild className="w-full max-w-lg">
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            toast.success('자료실에 올렸어요');
          }}
        >
          <Card.Header>
            <Card.Title asChild>
              <h1>자료 올리기</h1>
            </Card.Title>
            <Card.Description>인포팀 › 2026 가을 폴더에 올려요.</Card.Description>
          </Card.Header>

          <Card.Content className="flex flex-col gap-5">
            <FileField
              aria-label="올릴 파일"
              name="files"
              appearance="dropzone"
              multiple
              maxSize={100 * 1024 * 1024}
            />

            <Item.Group variant="bordered" size="tiny" aria-label="올리는 파일">
              {UPLOADS.map((upload) => (
                <Item key={upload.id}>
                  <Item.Media variant="soft">{upload.icon}</Item.Media>
                  <Item.Content>
                    <Item.Title>{upload.name}</Item.Title>
                    <Item.Description>
                      {upload.failed
                        ? `${upload.size} · 한 파일에 100MB 까지 올릴 수 있어요`
                        : upload.progress === 100
                          ? `${upload.size} · 올림`
                          : `${upload.size} · ${upload.progress}%`}
                    </Item.Description>
                    {!upload.failed && upload.progress < 100 && (
                      <Progress value={upload.progress} aria-label={`${upload.name} 올리는 중`} />
                    )}
                  </Item.Content>
                  <Item.Actions>
                    {upload.failed ? (
                      <>
                        <Badge content="실패" variant="soft" colorScheme="danger" />
                        <IconButton
                          variant="outline"
                          size="tiny"
                          aria-label={`${upload.name} 다시 올리기`}
                          icon={<ArrowPathIcon />}
                        />
                      </>
                    ) : upload.progress === 100 ? (
                      <Badge content="완료" variant="soft" colorScheme="success" />
                    ) : (
                      <IconButton
                        variant="outline"
                        size="tiny"
                        aria-label={`${upload.name} 올리기 멈추기`}
                        icon={<XMarkIcon />}
                      />
                    )}
                  </Item.Actions>
                </Item>
              ))}
            </Item.Group>

            <Field>
              <Field.Label>볼 수 있는 사람</Field.Label>
              <Select name="visibility" defaultValue="team">
                <Select.Item value="team">인포팀 모두</Select.Item>
                <Select.Item value="leads">운영진만</Select.Item>
                <Select.Item value="me">나만</Select.Item>
              </Select>
            </Field>
          </Card.Content>

          <Card.Footer className="justify-end border-t">
            <Button variant="outline">취소</Button>
            <Button type="submit">올리기</Button>
          </Card.Footer>
        </form>
      </Card>
    </main>
  ),
};
