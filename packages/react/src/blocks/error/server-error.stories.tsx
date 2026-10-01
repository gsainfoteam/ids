import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Empty } from '../../components/data/empty';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { TextField } from '../../components/form/text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Error/ServerError',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const ERROR_ID = '7F3A-21C9';

export const PC: Story = {
  render: () => (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Empty variant="soft">
          <Empty.Media>
            <ExclamationTriangleIcon />
          </Empty.Media>
          <Empty.Title asChild>
            <h1>잠시 문제가 생겼어요</h1>
          </Empty.Title>
          <Empty.Description>
            서버가 요청을 처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요. 계속되면{' '}
            <a href="#status">서비스 상태</a>를 확인해 주세요.
          </Empty.Description>
          <Empty.Actions>
            <Button onClick={() => window.location.reload()}>
              <ArrowPathIcon />
              다시 시도
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:team@gistory.me">인포팀에 알리기</a>
            </Button>
          </Empty.Actions>
        </Empty>

        <Field>
          <Field.Label>오류 번호</Field.Label>
          <TextField readOnly defaultValue={ERROR_ID}>
            <TextField.Input />
            <IconButton
              variant="outline"
              aria-label="오류 번호 복사"
              icon={<DocumentDuplicateIcon />}
              onClick={() => toast.success('오류 번호를 복사했어요')}
            />
          </TextField>
          <Field.Hint>문의할 때 이 번호를 함께 보내 주시면 빨리 찾을 수 있어요.</Field.Hint>
        </Field>
      </div>
    </main>
  ),
};
