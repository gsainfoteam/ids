import { useState, type ReactNode } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { overlay } from '../../../internal/overlay';
import { cn } from '../../../utils';
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
  },
  args: {
    role: 'dialog',
    dismissible: true,
    onOpenChange: fn(),
    onOpenChangeComplete: fn(),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentWidths = {
  sm: undefined,
  lg: cn('max-w-lg'),
  '2xl': cn('max-w-2xl'),
};

const contentPlacements = {
  center: undefined,
  top: cn('mt-16 mb-auto'),
};

const bodies = {
  form: <TextField aria-label="이름" defaultValue="김지스트" />,
  shortText: <p className="text-body-b3-regular">바꾼 내용은 저장을 눌러야 반영됩니다.</p>,
  longText: Array.from({ length: 12 }, (_, index) => (
    <p key={index} className="text-body-b3-regular">
      {`${index + 1}. 서비스를 쓰는 동안 만들어진 기록은 계정을 지울 때 함께 지워집니다. 백업이 필요하면 먼저 내려받아 두세요.`}
    </p>
  )),
  none: undefined,
};

const footers = {
  cancelAndSave: (
    <Dialog.Footer>
      <Dialog.Close>취소</Dialog.Close>
      <Dialog.Close asChild>
        <Button>저장</Button>
      </Dialog.Close>
    </Dialog.Footer>
  ),
  cancelAndDelete: (
    <Dialog.Footer>
      <Dialog.Close>취소</Dialog.Close>
      <Dialog.Close asChild>
        <Button colorScheme="danger">삭제</Button>
      </Dialog.Close>
    </Dialog.Footer>
  ),
  closeOnly: (
    <Dialog.Footer>
      <Dialog.Close>닫기</Dialog.Close>
    </Dialog.Footer>
  ),
  none: undefined,
};

type DialogPlaygroundArgs = Dialog.Props & {
  triggerLabel?: string;
  contentWidth?: string;
  contentPlacement?: string;
  titleText?: string;
  descriptionText?: string;
  body?: ReactNode;
  closeButton?: boolean;
  footer?: ReactNode;
};

export const Playground: StoryObj<DialogPlaygroundArgs> = {
  args: {
    defaultOpen: false,
    triggerLabel: '프로필 수정',
    contentWidth: 'sm',
    contentPlacement: 'center',
    titleText: '프로필 수정',
    descriptionText: '바꾼 내용은 저장을 눌러야 반영됩니다.',
    body: 'form',
    closeButton: false,
    footer: 'cancelAndSave',
  },
  argTypes: {
    role: { table: { category: 'Dialog' } },
    dismissible: { table: { category: 'Dialog' } },
    defaultOpen: {
      control: 'boolean',
      description: '처음부터 열어 둡니다. 바꾼 뒤 툴바의 Remount 로 다시 그려야 반영됩니다.',
      table: { category: 'Dialog' },
    },
    triggerLabel: {
      control: 'text',
      description: 'Dialog.Trigger 로 감싼 Button 의 글자.',
      table: { category: 'Dialog.Trigger' },
    },
    contentWidth: {
      control: 'inline-radio',
      options: Object.keys(contentWidths),
      mapping: contentWidths,
      description: 'Dialog.Content 의 className 으로 폭을 바꿉니다. 기본은 max-w-sm 입니다.',
      table: { category: 'Dialog.Content' },
    },
    contentPlacement: {
      control: 'inline-radio',
      options: Object.keys(contentPlacements),
      mapping: contentPlacements,
      description: 'Dialog.Content 의 className 으로 위쪽에 붙입니다.',
      table: { category: 'Dialog.Content' },
    },
    body: {
      control: 'select',
      options: Object.keys(bodies),
      mapping: bodies,
      description: 'Header 와 Footer 사이의 본문. 긴 본문은 대화상자 안에서 스크롤합니다.',
      table: { category: 'Dialog.Content' },
    },
    titleText: {
      control: 'text',
      description: '비우면 Dialog.Title 을 두지 않고 Content 에 aria-label 을 붙입니다.',
      table: { category: 'Dialog.Title' },
    },
    descriptionText: {
      control: 'text',
      description: '비우면 Dialog.Description 을 두지 않습니다.',
      table: { category: 'Dialog.Description' },
    },
    closeButton: {
      control: 'boolean',
      description:
        '<Dialog.Close /> 를 Content 에 직접 써서 모서리에 X 를 둡니다. Content 에 Dialog.Close 가 하나도 없으면 켜지 않아도 X 를 그립니다.',
      table: { category: 'Dialog.Close' },
    },
    footer: {
      control: 'select',
      options: Object.keys(footers),
      mapping: footers,
      description: '바닥 띠에 둘 Dialog.Footer 와 그 안의 버튼.',
      table: { category: 'Dialog.Footer' },
    },
    onOpenChange: { table: { category: 'Events' } },
    onOpenChangeComplete: { table: { category: 'Events' } },
  },
  parameters: {
    controls: { exclude: ['open', 'children'] },
  },
  render: ({
    triggerLabel,
    contentWidth,
    contentPlacement,
    titleText,
    descriptionText,
    body,
    closeButton,
    footer,
    ...args
  }) => (
    <Dialog {...args}>
      <Dialog.Trigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </Dialog.Trigger>
      <Dialog.Content
        className={cn(contentWidth, contentPlacement) || undefined}
        aria-label={titleText ? undefined : triggerLabel}
      >
        {(titleText || descriptionText) && (
          <Dialog.Header>
            {titleText && <Dialog.Title>{titleText}</Dialog.Title>}
            {descriptionText && <Dialog.Description>{descriptionText}</Dialog.Description>}
          </Dialog.Header>
        )}
        {closeButton && <Dialog.Close />}
        {body}
        {footer}
      </Dialog.Content>
    </Dialog>
  ),
};

export const Usage: Story = {
  render: () => (
    <Dialog>
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
        description="Header 에 Title 과 Description, 아래에 Footer 를 둡니다. Footer 는 위쪽 선과 옅은 배경을 깐 띠로 바닥에 붙습니다. Content 안에 Dialog.Close 가 없을 때만 모서리에 닫기 버튼(X)을 그립니다."
      >
        <Showcase.Row label="X">
          <Dialog>
            <Dialog.Trigger asChild>
              <Button variant="outline">기본</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>알림 설정</Dialog.Title>
                <Dialog.Description>새 댓글이 달리면 알려 드립니다.</Dialog.Description>
              </Dialog.Header>
            </Dialog.Content>
          </Dialog>
        </Showcase.Row>
        <Showcase.Row label="X, Footer">
          <Dialog>
            <Dialog.Trigger asChild>
              <Button variant="outline">X 와 Footer</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Close />
              <Dialog.Header>
                <Dialog.Title>알림 설정</Dialog.Title>
                <Dialog.Description>새 댓글이 달리면 알려 드립니다.</Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close>취소</Dialog.Close>
                <Dialog.Close asChild>
                  <Button>저장</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Showcase.Row>
        <Showcase.Row label="Footer">
          <Dialog>
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
          <Dialog role="alertdialog" dismissible={false}>
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
        description="크기 prop 은 없습니다. 기본은 max-w-sm(384px) 이고, 폭과 높이는 className 으로 바꿉니다. 화면보다 긴 본문은 대화상자 안에서 스크롤하고, Footer 띠는 바닥에 남습니다."
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

export const OpenFromAnywhere: Story = {
  name: 'overlay.open',
  render: function Render() {
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
  },
  parameters: {
    docs: {
      description: {
        story:
          'overlay.open 은 트리거 없이 어디서든 대화상자를 열고, close 에 넘긴 값으로 끝나는 Promise 를 돌려줍니다. Escape 나 바깥 클릭으로 닫으면 undefined 입니다.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Dialog.Content 안에 Dialog 를 또 두면 위에 쌓입니다. Escape 는 맨 위 대화상자만 닫고, 아래 대화상자는 그대로 남습니다.',
      },
    },
  },
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

export const KeepTheCornerCloseBesideFooterButtons: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">공지 쓰기</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Header>
          <Dialog.Title>공지 쓰기</Dialog.Title>
          <Dialog.Description>저장하면 모든 구성원에게 알림이 갑니다.</Dialog.Description>
        </Dialog.Header>
        <TextField aria-label="제목" data-1p-ignore data-lpignore="true" />
        <Dialog.Footer>
          <Dialog.Close>취소</Dialog.Close>
          <Dialog.Close asChild>
            <Button>저장</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Dialog.Content 는 그 안에 Dialog.Close 가 하나도 없을 때만 모서리에 닫기 버튼(X)을 그립니다. Footer 에 취소나 확인을 Dialog.Close 로 두면 X 는 빠집니다. 둘 다 두려면 자식 없는 <Dialog.Close /> 를 Content 에 직접 씁니다. 그 버튼이 모서리의 X 가 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '공지 쓰기' }));
    const dialog = await canvas.findByRole('dialog', { name: '공지 쓰기' });
    await expect(canvas.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '취소' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const KeyboardAndFocus: Story = {
  tags: ['verification'],
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
