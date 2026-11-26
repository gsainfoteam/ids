import { useState } from 'react';

import { CameraIcon, GlobeAltIcon } from '@heroicons/react/16/solid';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Showcase, holdTheNextCall } from '~story-kit';

import { Chip } from '../../data/chip';
import { Menu } from '../../overlay/menu';
import { Select } from '../select';

import { PromptInput, usePromptInput } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;
const statuses = ['idle', 'submitting', 'streaming'] as const;

const A_REPLY_TAKES = 1500;

const REPORT = new File(['중간 보고서'], '중간 보고서.pdf', {
  type: 'application/pdf',
  lastModified: 0,
});
const NOTES = new File(['회의 메모'], '회의 메모.txt', { type: 'text/plain', lastModified: 0 });

const SUGGESTIONS = ['오늘 학식', '셔틀 시간표', '도서관 빈자리'];

const meta = {
  title: 'Form/PromptInput',
  component: PromptInput,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    status: { control: 'radio', options: statuses },
    disabled: { control: 'boolean' },
  },
  args: {
    'aria-label': '메시지',
    variant: 'outline',
    size: 'standard',
    status: 'idle',
    disabled: false,
    onSend: fn(),
    onStop: fn(),
    onValueChange: fn(),
  },
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const textbox = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('textbox', { name: '메시지' });

const button = (canvasElement: HTMLElement, name: string) =>
  within(canvasElement).getByRole('button', { name });

const picker = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('input[type=file]')!;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Usage: Story = {
  render: function Render() {
    const [sent, setSent] = useState('');

    return (
      <div className="grid w-96 gap-3">
        <PromptInput aria-label="메시지" onSend={(message) => setSent(message.text)} />
        <output aria-label="보낸 메시지">{sent}</output>
      </div>
    );
  },
};

export const Gallery: Story = {
  render: function Render() {
    const withFiles = usePromptInput({ attachments: { defaultValue: [REPORT, NOTES] } });
    const withTools = usePromptInput({ tools: { defaultValue: ['search'] } });

    return (
      <Showcase>
        <Showcase.Section title="Variant × Size">
          <Showcase.Matrix
            rows={sizes}
            columns={variants}
            render={(size, variant) => (
              <div className="w-72">
                <PromptInput aria-label={`${variant} ${size}`} size={size} variant={variant}>
                  <PromptInput.Input />
                  <PromptInput.Attach />
                </PromptInput>
              </div>
            )}
          />
        </Showcase.Section>

        <Showcase.Section
          title="Status"
          description="보내는 동안에는 보내기 버튼이 멈추기 버튼이 됩니다. onStop 이 없으면 스피너를 보이고 눌리지 않습니다."
        >
          <Showcase.Row label="idle">
            <div className="w-72">
              <PromptInput aria-label="idle" defaultValue="오늘 학식 뭐야?">
                <PromptInput.Input />
              </PromptInput>
            </div>
          </Showcase.Row>
          <Showcase.Row label="submitting">
            <div className="w-72">
              <PromptInput aria-label="submitting" status="submitting">
                <PromptInput.Input />
              </PromptInput>
            </div>
          </Showcase.Row>
          <Showcase.Row label="streaming">
            <div className="w-72">
              <PromptInput aria-label="streaming" status="streaming" onStop={() => {}}>
                <PromptInput.Input />
              </PromptInput>
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section title="States">
          <Showcase.Row label="attachments">
            <div className="w-72">
              <PromptInput aria-label="첨부" promptInput={withFiles}>
                <PromptInput.Input />
                <PromptInput.Attach />
              </PromptInput>
            </div>
          </Showcase.Row>
          <Showcase.Row label="tools">
            <div className="w-72">
              <PromptInput aria-label="도구" promptInput={withTools}>
                <PromptInput.Input />
                <PromptInput.ActionMenu />
                <PromptInput.Tool value="search" icon={<GlobeAltIcon />}>
                  웹 검색
                </PromptInput.Tool>
              </PromptInput>
            </div>
          </Showcase.Row>
          <Showcase.Row label="disabled">
            <div className="w-72">
              <PromptInput aria-label="비활성" disabled defaultValue="보낼 수 없음">
                <PromptInput.Input />
                <PromptInput.Attach />
              </PromptInput>
            </div>
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const SendAMessage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'onSend 는 { text, files, tools } 를 받습니다. Enter 는 보내고 Shift+Enter 는 줄을 바꿉니다. 한글처럼 조합 중인 글자를 확정하는 Enter 는 보내지 않습니다. 보내면 입력이 비워지고, 비어 있으면 Enter 도 보내기 버튼도 보내지 않습니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(textbox(canvasElement));
    await userEvent.keyboard('{Enter}');
    await expect(args.onSend).not.toHaveBeenCalled();
    await expect(button(canvasElement, '보내기')).toHaveAttribute('aria-disabled', 'true');

    await userEvent.type(textbox(canvasElement), '학식 메뉴{Shift>}{Enter}{/Shift}저녁도');
    await expect(textbox(canvasElement)).toHaveValue('학식 메뉴\n저녁도');
    await expect(button(canvasElement, '보내기')).not.toHaveAttribute('aria-disabled');

    await userEvent.keyboard('{Enter}');
    await expect(args.onSend).toHaveBeenCalledOnce();
    await expect(args.onSend).toHaveBeenCalledWith({
      text: '학식 메뉴\n저녁도',
      files: [],
      tools: [],
    });
    await expect(textbox(canvasElement)).toHaveValue('');
    await expect(textbox(canvasElement)).toHaveFocus();
  },
};

export const AttachFiles: Story = {
  render: function Render(args) {
    const promptInput = usePromptInput({
      attachments: { accept: 'image/*,.pdf,.txt', maxCount: 3 },
    });

    return (
      <div className="w-96">
        <PromptInput {...args} promptInput={promptInput}>
          <PromptInput.Input placeholder="파일에 대해 물어보세요" />
          <PromptInput.Attach />
        </PromptInput>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'PromptInput.Attach 는 파일을 고르는 버튼입니다. 받을 파일은 usePromptInput 의 attachments(accept, maxSize, maxCount, onReject)로 정하고, 결과를 promptInput 으로 넘깁니다. 입력창에 파일을 끌어다 놓거나 붙여넣어도 첨부되고, 첨부한 파일은 위 바에 FileField 목록으로 보입니다. 글 없이 파일만 보내도 됩니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.upload(picker(canvasElement), [REPORT, NOTES]);
    const list = within(canvasElement).getByRole('list', { name: '첨부한 파일' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2);

    await userEvent.click(button(canvasElement, '회의 메모.txt 삭제'));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1);

    await userEvent.click(button(canvasElement, '보내기'));
    await expect(args.onSend).toHaveBeenCalledOnce();
    await expect(args.onSend).toHaveBeenCalledWith({ text: '', files: [REPORT], tools: [] });
    await expect(
      within(canvasElement).queryByRole('list', { name: '첨부한 파일' }),
    ).not.toBeInTheDocument();
  },
};

export const StopAStreamingReply: Story = {
  args: {
    onSend: fn(() => new Promise<void>((resolve) => setTimeout(resolve, A_REPLY_TAKES))),
  },
  render: function Render(args) {
    const [status, setStatus] = useState<PromptInput.Status>('idle');

    return (
      <div className="w-96">
        <PromptInput
          aria-label="메시지"
          status={status}
          onSend={async (message) => {
            setStatus('streaming');
            await args.onSend?.(message);
            setStatus('idle');
          }}
          onStop={() => {
            args.onStop?.();
            setStatus('idle');
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'status 는 앱이 정합니다. 답을 받는 동안 보내기 버튼은 멈추기 버튼이 되고, 입력창에는 다음 메시지를 미리 적어 둘 수 있습니다. 그동안 Enter 는 보내지 않습니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const finishReply = holdTheNextCall(args.onSend);

    await userEvent.type(textbox(canvasElement), '셔틀 언제 와?{Enter}');
    await expect(button(canvasElement, '멈추기')).toBeEnabled();
    await userEvent.type(textbox(canvasElement), '그다음은?{Enter}');
    await expect(args.onSend).toHaveBeenCalledOnce();
    await expect(textbox(canvasElement)).toHaveValue('그다음은?');

    finishReply();
    await waitFor(() => expect(button(canvasElement, '보내기')).toBeEnabled());

    const finishSecond = holdTheNextCall(args.onSend);
    await userEvent.click(button(canvasElement, '보내기'));
    await userEvent.click(button(canvasElement, '멈추기'));
    await expect(args.onStop).toHaveBeenCalledOnce();
    await expect(button(canvasElement, '보내기')).toHaveFocus();
    finishSecond();
  },
};

export const AddToolsToTheBar: Story = {
  render: (args) => (
    <div className="w-96">
      <PromptInput {...args}>
        <PromptInput.Input placeholder="학사 일정, 장학금, 셔틀버스… 무엇이든 물어보세요" />
        <PromptInput.ActionMenu>
          <PromptInput.AddAttachments />
          <Menu.Item>
            <CameraIcon />
            사진 찍기
          </Menu.Item>
        </PromptInput.ActionMenu>
        <PromptInput.Tool value="search" icon={<GlobeAltIcon />}>
          웹 검색
        </PromptInput.Tool>
        <div>
          <Select size="tiny" variant="soft" defaultValue="fast" aria-label="모델">
            <Select.Item value="fast">빠른 답</Select.Item>
            <Select.Item value="deep">깊은 생각</Select.Item>
          </Select>
        </div>
      </PromptInput>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'PromptInput.Tool 은 켜고 끄는 도구이고, 켠 도구의 value 는 onSend 의 tools 로 함께 옵니다. PromptInput.ActionMenu 는 + 버튼의 메뉴로, PromptInput.AddAttachments 가 파일 고르기를 엽니다. 모델 고르기처럼 그 밖의 도구는 앱이 IDS 컴포넌트로 넣습니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(button(canvasElement, '웹 검색'));
    await expect(button(canvasElement, '웹 검색')).toHaveAttribute('aria-pressed', 'true');

    await userEvent.type(textbox(canvasElement), '장학금 신청 기간{Enter}');
    await expect(args.onSend).toHaveBeenCalledOnce();
    await expect(args.onSend).toHaveBeenCalledWith({
      text: '장학금 신청 기간',
      files: [],
      tools: ['search'],
    });
  },
};

export const FillTheInputFromSuggestions: Story = {
  render: function Render(args) {
    const [draft, setDraft] = useState('');

    return (
      <div className="grid w-96 gap-3">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <Chip key={suggestion} onClick={() => setDraft(suggestion)}>
              {suggestion}
            </Chip>
          ))}
        </div>
        <PromptInput
          aria-label="메시지"
          value={draft}
          onValueChange={setDraft}
          onSend={args.onSend}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'value 와 onValueChange 로 입력을 제어합니다. 제어할 때도 보내면 onValueChange 로 빈 문자열을 알려 입력을 비웁니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(button(canvasElement, '셔틀 시간표'));
    await expect(textbox(canvasElement)).toHaveValue('셔틀 시간표');

    await userEvent.click(button(canvasElement, '보내기'));
    await expect(args.onSend).toHaveBeenCalledOnce();
    await expect(args.onSend).toHaveBeenCalledWith({ text: '셔틀 시간표', files: [], tools: [] });
    await expect(textbox(canvasElement)).toHaveValue('');
  },
};
