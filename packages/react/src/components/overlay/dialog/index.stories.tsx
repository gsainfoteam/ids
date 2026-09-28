import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { overlay } from '../../../internal/overlay';
import { Button } from '../../action/button';
import { TextField } from '../../form/text-field';

import { Dialog } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlay/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'radio', options: ['dialog', 'alertdialog'] },
    dismissible: { control: 'boolean' },
    hideClose: { control: 'boolean' },
  },
  args: {
    role: 'dialog',
    dismissible: true,
    hideClose: false,
    onOpenChange: fn(),
    onOpenChangeComplete: fn(),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Trigger asChild>
        <Button variant="outline">프로필 수정</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>프로필 수정</Dialog.Title>
          <Dialog.Description>바꾼 내용은 저장을 눌러야 반영됩니다.</Dialog.Description>
        </Dialog.Header>
        <TextField aria-label="이름" defaultValue="김지스트" />
        <Dialog.Footer>
          <Dialog.Close>취소</Dialog.Close>
          <Dialog.Close asChild>
            <Button>저장</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

const paragraphs = Array.from(
  { length: 12 },
  (_, index) =>
    `${index + 1}. 서비스를 쓰는 동안 만들어진 기록은 계정을 지울 때 함께 지워집니다. 백업이 필요하면 먼저 내려받아 두세요.`,
);

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Anatomy"
        description="Header 에 Title 과 Description, 아래에 Footer 를 둡니다. 모서리의 닫기 버튼은 hideClose 로 뺍니다."
      >
        <Showcase.Row label="기본">
          <Dialog>
            <Dialog.Trigger asChild>
              <Button variant="outline">기본</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>알림 설정</Dialog.Title>
                <Dialog.Description>새 댓글이 달리면 알려 드립니다.</Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close>닫기</Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Showcase.Row>
        <Showcase.Row label="hideClose">
          <Dialog hideClose>
            <Dialog.Trigger asChild>
              <Button variant="outline">닫기 버튼 없이</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>업데이트 완료</Dialog.Title>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button>확인</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Role"
        description="되돌릴 수 없는 결정은 alertdialog 로 묻고, dismissible={false} 로 버튼으로만 닫게 합니다."
      >
        <Showcase.Row label="alertdialog">
          <Dialog role="alertdialog" dismissible={false} hideClose>
            <Dialog.Trigger asChild>
              <Button variant="outline" colorScheme="danger">
                계정 삭제
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>계정을 삭제할까요?</Dialog.Title>
                <Dialog.Description>삭제한 계정은 되돌릴 수 없습니다.</Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close>취소</Dialog.Close>
                <Dialog.Close asChild>
                  <Button colorScheme="danger">삭제</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Size"
        description="크기 prop 은 없습니다. 기본은 max-w-sm(384px) 이고, 폭과 높이는 className 으로 바꿉니다. 화면보다 긴 본문은 대화상자 안에서 스크롤합니다."
      >
        <Showcase.Row label="className">
          <Dialog>
            <Dialog.Trigger asChild>
              <Button variant="outline">넓게</Button>
            </Dialog.Trigger>
            <Dialog.Content className="max-w-2xl">
              <Dialog.Header>
                <Dialog.Title>넓은 대화상자</Dialog.Title>
                <Dialog.Description>max-w-2xl 을 줬습니다.</Dialog.Description>
              </Dialog.Header>
            </Dialog.Content>
          </Dialog>
        </Showcase.Row>
        <Showcase.Row label="긴 본문">
          <Dialog>
            <Dialog.Trigger asChild>
              <Button variant="outline">약관 보기</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>이용 약관</Dialog.Title>
              </Dialog.Header>
              {paragraphs.map((text) => (
                <p key={text} className="text-body-b3-regular">
                  {text}
                </p>
              ))}
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button>동의</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const KeyboardAndFocus: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">이름 바꾸기</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>이름 바꾸기</Dialog.Title>
        </Dialog.Header>
        <TextField aria-label="새 이름" data-1p-ignore data-lpignore="true" />
        <Dialog.Footer>
          <Dialog.Close>취소</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '이름 바꾸기' }));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: '새 이름' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('button', { name: '이름 바꾸기' })).toHaveFocus());
  },
};

function ConfirmDemo() {
  const [result, setResult] = useState('아직 묻지 않음');
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={async () => {
          const confirmed = await overlay.open<boolean>(({ close }) => (
            <Dialog role="alertdialog">
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>변경 사항을 버릴까요?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Footer>
                  <Button variant="outline" onClick={() => close(false)}>
                    계속 편집
                  </Button>
                  <Button onClick={() => close(true)}>버리기</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog>
          ));
          setResult(confirmed === undefined ? '닫음' : confirmed ? '버림' : '계속 편집');
        }}
      >
        편집 취소
      </Button>
      <span className="text-body-b3-regular">결과: {result}</span>
    </div>
  );
}

export const OpenFromAnywhere: Story = {
  name: 'overlay.open',
  render: () => <ConfirmDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '편집 취소' }));
    await userEvent.click(await canvas.findByRole('button', { name: '버리기' }));
    await waitFor(() => expect(canvas.getByText('결과: 버림')).toBeInTheDocument());
  },
};

export const Nested: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">설정</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>설정</Dialog.Title>
          <Dialog.Description>
            안에서 연 대화상자가 위에 쌓이고, 아래 대화상자는 뒤로 물러납니다.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant="outline">비밀번호 변경</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>비밀번호 변경</Dialog.Title>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close>취소</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </Dialog.Content>
    </Dialog>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '설정' }));
    await userEvent.click(await canvas.findByRole('button', { name: '비밀번호 변경' }));
    await canvas.findByRole('dialog', { name: '비밀번호 변경' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('dialog', { name: '비밀번호 변경' })).not.toBeInTheDocument(),
    );
    expect(canvas.getByRole('dialog', { name: '설정' })).toBeInTheDocument();
  },
};
