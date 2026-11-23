import { expect, fn, waitFor, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { Card } from '../../data/card';

import { Questionnaire } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/Questionnaire',
  component: Questionnaire,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: sizes },
    advanceOnSelect: { control: 'boolean' },
  },
  args: {
    size: 'standard',
    advanceOnSelect: false,
    onComplete: fn(),
    children: (
      <>
        <Questionnaire.Question name="tone">
          어떤 말투로 쓸까요?
          <Questionnaire.Option value="formal">격식</Questionnaire.Option>
          <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
          <Questionnaire.Other />
        </Questionnaire.Question>
        <Questionnaire.Question name="topics" selectionMode="multiple" optional>
          무엇을 넣을까요?
          <Questionnaire.Option value="summary">요약</Questionnaire.Option>
          <Questionnaire.Option value="todo">할 일</Questionnaire.Option>
        </Questionnaire.Question>
      </>
    ),
  },
} satisfies Meta<typeof Questionnaire>;

export default meta;
type Story = StoryObj<typeof meta>;

const button = (canvasElement: HTMLElement, name: string) =>
  within(canvasElement).getByRole('button', { name });

const radio = (canvasElement: HTMLElement, name: string | RegExp) =>
  within(canvasElement).getByRole('radio', { name });

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
  render: () => (
    <div className="w-96">
      <Questionnaire>
        <Questionnaire.Question name="tone">
          어떤 말투로 쓸까요?
          <Questionnaire.Option value="formal">격식</Questionnaire.Option>
          <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
        </Questionnaire.Question>
        <Questionnaire.Question name="length">
          얼마나 길게 쓸까요?
          <Questionnaire.Option value="short">짧게</Questionnaire.Option>
          <Questionnaire.Option value="long">길게</Questionnaire.Option>
        </Questionnaire.Question>
      </Questionnaire>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Size">
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            <div className="w-96">
              <Questionnaire size={size} defaultValue={{ tone: 'casual' }}>
                <Questionnaire.Question name="tone">
                  어떤 말투로 쓸까요?
                  <Questionnaire.Description>나중에 바꿀 수 있어요.</Questionnaire.Description>
                  <Questionnaire.Option value="formal" description="보고서, 공지">
                    격식
                  </Questionnaire.Option>
                  <Questionnaire.Option value="casual" description="동아리 단톡방">
                    편하게
                  </Questionnaire.Option>
                  <Questionnaire.Other />
                </Questionnaire.Question>
                <Questionnaire.Question name="length">
                  얼마나 길게 쓸까요?
                  <Questionnaire.Option value="short">짧게</Questionnaire.Option>
                  <Questionnaire.Option value="long">길게</Questionnaire.Option>
                </Questionnaire.Question>
              </Questionnaire>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section title="Selection mode">
        <Showcase.Row label="single">
          <div className="w-96">
            <Questionnaire defaultValue={{ tone: 'formal' }}>
              <Questionnaire.Question name="tone">
                어떤 말투로 쓸까요?
                <Questionnaire.Option value="formal">격식</Questionnaire.Option>
                <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
        <Showcase.Row label="multiple, optional">
          <div className="w-96">
            <Questionnaire defaultValue={{ topics: ['summary', '회의 일정'] }}>
              <Questionnaire.Question name="topics" selectionMode="multiple" optional>
                무엇을 넣을까요?
                <Questionnaire.Option value="summary">요약</Questionnaire.Option>
                <Questionnaire.Option value="todo">할 일</Questionnaire.Option>
                <Questionnaire.Other />
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="unanswered">
          <div className="w-96">
            <Questionnaire>
              <Questionnaire.Question name="tone">
                어떤 말투로 쓸까요?
                <Questionnaire.Option value="formal">격식</Questionnaire.Option>
                <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled option">
          <div className="w-96">
            <Questionnaire defaultValue={{ seat: 'window' }}>
              <Questionnaire.Question name="seat">
                어느 자리로 할까요?
                <Questionnaire.Option value="window">창가</Questionnaire.Option>
                <Questionnaire.Option value="aisle" disabled description="남은 자리가 없어요">
                  통로
                </Questionnaire.Option>
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
        <Showcase.Row label="other filled">
          <div className="w-96">
            <Questionnaire defaultValue={{ tone: '반말로 짧게' }}>
              <Questionnaire.Question name="tone">
                어떤 말투로 쓸까요?
                <Questionnaire.Option value="formal">격식</Questionnaire.Option>
                <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
                <Questionnaire.Other />
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Variant">
        <Showcase.Row label="toggle, single">
          <div className="w-96">
            <Questionnaire defaultValue={{ tone: 'casual' }}>
              <Questionnaire.Question name="tone" variant="toggle" orientation="horizontal">
                어떤 말투로 쓸까요?
                <Questionnaire.Option value="formal">격식</Questionnaire.Option>
                <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
                <Questionnaire.Option value="cute">귀엽게</Questionnaire.Option>
                <Questionnaire.Other />
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
        <Showcase.Row label="toggle, multiple">
          <div className="w-96">
            <Questionnaire defaultValue={{ goods: ['sticker', 'badge'] }}>
              <Questionnaire.Question
                name="goods"
                selectionMode="multiple"
                variant="toggle"
                orientation="horizontal"
              >
                어떤 굿즈를 팔까요?
                <Questionnaire.Option value="sticker">스티커</Questionnaire.Option>
                <Questionnaire.Option value="keyring">키링</Questionnaire.Option>
                <Questionnaire.Option value="badge">뱃지</Questionnaire.Option>
                <Questionnaire.Option value="postcard" disabled>
                  엽서
                </Questionnaire.Option>
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Suggested prompts">
        <Showcase.Row label="toggle, advanceOnSelect">
          <div className="w-120">
            <Questionnaire advanceOnSelect size="tiny">
              <Questionnaire.Question name="prompt" variant="toggle" orientation="horizontal">
                무엇을 도와드릴까요?
                <Questionnaire.Option value="학식">오늘 학식</Questionnaire.Option>
                <Questionnaire.Option value="셔틀">셔틀 시간표</Questionnaire.Option>
                <Questionnaire.Option value="도서관">도서관 빈자리</Questionnaire.Option>
              </Questionnaire.Question>
            </Questionnaire>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const AskSeveralQuestionsInSteps: Story = {
  args: {
    children: (
      <>
        <Questionnaire.Question name="size">
          부스는 몇 칸을 쓸까요?
          <Questionnaire.Description>한 칸은 가로 3미터, 세로 2미터예요.</Questionnaire.Description>
          <Questionnaire.Option value="one" description="굿즈 판매만 해요">
            한 칸
          </Questionnaire.Option>
          <Questionnaire.Option value="two" description="판매와 체험을 함께 해요">
            두 칸
          </Questionnaire.Option>
        </Questionnaire.Question>
        <Questionnaire.Question name="people" optional>
          부스를 지킬 사람은 몇 명인가요?
          <Questionnaire.Option value="few">4명 이하</Questionnaire.Option>
          <Questionnaire.Option value="many">5명 이상</Questionnaire.Option>
        </Questionnaire.Question>
        <Questionnaire.Question name="goods" selectionMode="multiple">
          어떤 굿즈를 팔까요?
          <Questionnaire.Option value="sticker">스티커</Questionnaire.Option>
          <Questionnaire.Option value="keyring">키링</Questionnaire.Option>
          <Questionnaire.Other />
        </Questionnaire.Question>
        <Questionnaire.Submit>계획 세우기</Questionnaire.Submit>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '질문이 여럿이면 위에 Progress 가 붙고, 한 번에 한 질문만 보입니다. 답하지 않은 필수 질문에서는 다음 버튼이 꺼져 있고, optional 질문에는 건너뛰기가 붙습니다. 마지막 질문의 버튼 글자는 Questionnaire.Submit 의 children 으로 바꿉니다. 마지막 질문에서 보내면 onComplete 가 건너뛴 질문을 뺀 답을 받습니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const progress = within(canvasElement).getByRole('progressbar', { name: '질문 진행' });
    await expect(progress).toHaveAttribute('aria-valuetext', '질문 1 / 3');
    await expect(button(canvasElement, '다음')).toHaveAttribute('aria-disabled', 'true');
    await expect(within(canvasElement).queryByRole('button', { name: '이전' })).toBeNull();

    await userEvent.click(radio(canvasElement, /두 칸/));
    await userEvent.click(button(canvasElement, '다음'));
    await waitFor(() => expect(radio(canvasElement, /4명 이하/)).toHaveFocus());
    await expect(progress).toHaveAttribute('aria-valuetext', '질문 2 / 3');

    await userEvent.click(button(canvasElement, '건너뛰기'));
    await waitFor(() =>
      expect(within(canvasElement).getByRole('checkbox', { name: '스티커' })).toHaveFocus(),
    );

    await userEvent.click(button(canvasElement, '이전'));
    await userEvent.click(button(canvasElement, '이전'));
    await expect(radio(canvasElement, /두 칸/)).toBeChecked();
    await userEvent.click(button(canvasElement, '다음'));
    await userEvent.click(button(canvasElement, '다음'));

    await userEvent.click(within(canvasElement).getByRole('checkbox', { name: '스티커' }));
    await userEvent.type(within(canvasElement).getByRole('textbox', { name: '직접 입력' }), '엽서');
    await userEvent.click(button(canvasElement, '계획 세우기'));
    await expect(args.onComplete).toHaveBeenCalledOnce();
    await expect(args.onComplete).toHaveBeenCalledWith({
      size: 'two',
      goods: ['sticker', '엽서'],
    });
  },
};

export const LetPeopleWriteTheirOwnAnswer: Story = {
  args: {
    children: (
      <Questionnaire.Question name="tone">
        어떤 말투로 쓸까요?
        <Questionnaire.Option value="formal">격식</Questionnaire.Option>
        <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
        <Questionnaire.Other placeholder="예: 반말로 짧게" />
      </Questionnaire.Question>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Questionnaire.Other 는 보기에 없는 답을 적는 TextField 입니다. 하나만 고르는 질문에서는 적기 시작하면 고른 보기가 풀리고, 보기를 고르면 적은 글이 지워집니다. 적은 글은 질문의 name 으로 FormData 에도 들어갑니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const other = () => within(canvasElement).getByRole('textbox', { name: '직접 입력' });

    await userEvent.click(radio(canvasElement, '격식'));
    await userEvent.type(other(), '반말로');
    await expect(radio(canvasElement, '격식')).not.toBeChecked();
    await expect(other()).toHaveAttribute('name', 'tone');

    await userEvent.click(radio(canvasElement, '편하게'));
    await expect(other()).toHaveValue('');

    await userEvent.type(other(), '반말로 짧게{Enter}');
    await expect(args.onComplete).toHaveBeenCalledOnce();
    await expect(args.onComplete).toHaveBeenCalledWith({ tone: '반말로 짧게' });
  },
};

export const StartOverWithAFormReset: Story = {
  render: (args) => (
    <Questionnaire {...args} defaultValue={{ tone: 'formal' }}>
      <Questionnaire.Question name="tone">
        어떤 말투로 쓸까요?
        <Questionnaire.Option value="formal">격식</Questionnaire.Option>
        <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
        <Questionnaire.Other />
      </Questionnaire.Question>
      <Questionnaire.Question name="length">
        얼마나 길게 쓸까요?
        <Questionnaire.Option value="short">짧게</Questionnaire.Option>
        <Questionnaire.Option value="long">길게</Questionnaire.Option>
      </Questionnaire.Question>
      <Button type="reset" variant="outline">
        처음부터
      </Button>
    </Questionnaire>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'form 의 reset 은 답을 defaultValue 로 되돌리고 첫 질문으로 돌아갑니다. native 입력처럼 onComplete 는 불리지 않습니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.click(radio(canvasElement, '편하게'));
    await userEvent.click(button(canvasElement, '다음'));
    await userEvent.click(radio(canvasElement, '길게'));

    await userEvent.click(button(canvasElement, '처음부터'));
    await waitFor(() => expect(radio(canvasElement, '격식')).toBeChecked());
    await expect(within(canvasElement).getByText('어떤 말투로 쓸까요?')).toBeVisible();
    await expect(args.onComplete).not.toHaveBeenCalled();

    await userEvent.click(button(canvasElement, '다음'));
    await expect(radio(canvasElement, '길게')).not.toBeChecked();
  },
};

export const SuggestPromptsToStartAChat: Story = {
  render: (args) => (
    <div className="w-120">
      <Card>
        <Card.Header>
          <Card.Title>지스트 도우미</Card.Title>
          <Card.Description>학교생활에 대해 무엇이든 물어보세요.</Card.Description>
        </Card.Header>
        <Card.Content>
          <Questionnaire advanceOnSelect size="tiny" onComplete={args.onComplete}>
            <Questionnaire.Question name="prompt" variant="toggle" orientation="horizontal">
              이런 걸 물어볼 수 있어요
              <Questionnaire.Option value="오늘 학식 메뉴 알려 줘">오늘 학식</Questionnaire.Option>
              <Questionnaire.Option value="다음 셔틀은 언제 와?">셔틀 시간표</Questionnaire.Option>
              <Questionnaire.Option value="도서관 빈자리 있어?">도서관 빈자리</Questionnaire.Option>
            </Questionnaire.Question>
          </Questionnaire>
        </Card.Content>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '채팅 시작 화면의 추천 질문은 한 단계짜리 Questionnaire 입니다. variant="toggle" 이라 보기가 라디오 없는 Toggle 로 그려집니다. advanceOnSelect 면 하나만 고르는 질문은 보기를 누르는 순간 넘어가고, 질문이 하나뿐이라 바로 onComplete 가 불립니다. 화살표 키로 옮겨 다니는 동안은 넘어가지 않고 Space 나 Enter 로 고릅니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await expect(within(canvasElement).queryByRole('progressbar')).toBeNull();
    await expect(within(canvasElement).queryByRole('button')).toBeNull();

    await userEvent.click(radio(canvasElement, '셔틀 시간표'));
    await expect(args.onComplete).toHaveBeenLastCalledWith({ prompt: '다음 셔틀은 언제 와?' });

    await userEvent.keyboard('{ArrowRight}');
    await expect(radio(canvasElement, '도서관 빈자리')).toBeChecked();
    await expect(args.onComplete).toHaveBeenCalledOnce();

    await userEvent.keyboard(' ');
    await expect(args.onComplete).toHaveBeenLastCalledWith({ prompt: '도서관 빈자리 있어?' });
  },
};

export const Keyboard: Story = {
  tags: ['verification'],
  args: {
    children: (
      <>
        <Questionnaire.Question name="tone">
          어떤 말투로 쓸까요?
          <Questionnaire.Option value="formal">격식</Questionnaire.Option>
          <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
          <Questionnaire.Option value="cute">귀엽게</Questionnaire.Option>
        </Questionnaire.Question>
        <Questionnaire.Question name="topics" selectionMode="multiple">
          무엇을 넣을까요?
          <Questionnaire.Option value="summary">요약</Questionnaire.Option>
          <Questionnaire.Option value="todo">할 일</Questionnaire.Option>
        </Questionnaire.Question>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '보기는 native 라디오와 체크박스라 화살표 키로 고르고 Space 로 체크합니다. 고른 보기에서 Enter 를 누르면 다음 질문으로 가고, 넘어가면 포커스가 새 질문의 보기로 옮겨집니다.',
      },
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    await userEvent.keyboard('{Tab}');
    await expect(radio(canvasElement, '격식')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(within(canvasElement).getByText('어떤 말투로 쓸까요?')).toBeVisible();

    await userEvent.keyboard('{ArrowDown}');
    await expect(radio(canvasElement, '편하게')).toBeChecked();
    await userEvent.keyboard('{Enter}');

    const summary = () => within(canvasElement).getByRole('checkbox', { name: '요약' });
    await waitFor(() => expect(summary()).toHaveFocus());
    await userEvent.keyboard(' ');
    await expect(summary()).toBeChecked();
    await userEvent.keyboard('{Enter}');
    await expect(args.onComplete).toHaveBeenCalledOnce();
    await expect(args.onComplete).toHaveBeenCalledWith({
      tone: 'casual',
      topics: ['summary'],
    });
  },
};
