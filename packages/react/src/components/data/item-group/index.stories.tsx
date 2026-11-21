import { BellIcon, DocumentIcon, MoonIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { IconButton } from '../../action/icon-button';
import { Switch } from '../../form/switch';
import { Avatar } from '../avatar';
import { Item } from '../item';

import { ItemGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['bordered', 'separated', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Data/ItemGroup',
  component: ItemGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    ordered: { control: 'boolean' },
  },
  args: { variant: 'bordered', size: 'standard', 'aria-label': '멤버' },
  render: (args) => (
    <ItemGroup {...args} className="w-80">
      {['김철수', '이영희', '박민수'].map((name) => (
        <Item key={name}>
          <Item.Media>
            <Avatar name={name} />
          </Item.Media>
          <Item.Content>
            <Item.Title>{name}</Item.Title>
          </Item.Content>
        </Item>
      ))}
    </ItemGroup>
  ),
} satisfies Meta<typeof ItemGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Separator"
        description="ghost 그룹 안의 Item.Separator 는 목록 항목으로 세지 않는 구분선입니다."
      >
        <Showcase.Row>
          <ItemGroup variant="ghost" className="w-80" aria-label="설정">
            <Item>
              <Item.Media>
                <BellIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>알림</Item.Title>
                <Item.Description>새 메시지 알림 받기</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Switch defaultChecked aria-label="알림" />
              </Item.Actions>
            </Item>
            <Item.Separator />
            <Item>
              <Item.Media>
                <MoonIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>다크 모드</Item.Title>
              </Item.Content>
              <Item.Actions>
                <Switch aria-label="다크 모드" />
              </Item.Actions>
            </Item>
          </ItemGroup>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Variant">
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <ItemGroup variant={variant} size="tiny" className="w-72" aria-label={variant}>
              {['보고서.pdf', '예산안.xlsx', '회의록.md'].map((file) => (
                <Item key={file}>
                  <Item.Media>
                    <DocumentIcon />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{file}</Item.Title>
                  </Item.Content>
                </Item>
              ))}
            </ItemGroup>
          </Showcase.Row>
        ))}
      </Showcase.Section>
    </Showcase>
  ),
};

export const Variant: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <ItemGroup variant="bordered" aria-label="멤버">
        {['김철수', '이영희', '박민수'].map((name) => (
          <Item key={name}>
            <Item.Media>
              <Avatar name={name} />
            </Item.Media>
            <Item.Content>
              <Item.Title>{name}</Item.Title>
            </Item.Content>
          </Item>
        ))}
      </ItemGroup>

      <ItemGroup variant="separated" aria-label="첨부 파일">
        {['보고서.pdf', '예산안.xlsx'].map((file) => (
          <Item key={file}>
            <Item.Media variant="soft">
              <DocumentIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>{file}</Item.Title>
            </Item.Content>
            <Item.Actions>
              <IconButton
                aria-label={`${file} 지우기`}
                variant="ghost"
                size="tiny"
                icon={<XMarkIcon />}
              />
            </Item.Actions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`bordered` 는 행 사이에 구분선을 긋고 행 모서리를 편다. `separated` 는 행마다 테두리 카드(`Item` 의 `outline`)로 8px 띄운다. 기본 `ghost` 는 구분선도 간격도 없다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const members = canvas.getByRole('list', { name: '멤버' });
    await expect(members).toHaveAttribute('data-variant', 'bordered');
    const files = canvas.getByRole('list', { name: '첨부 파일' });
    for (const row of files.querySelectorAll('[data-item]'))
      await expect(row).toHaveAttribute('data-variant', 'outline');
  },
};

export const Ordered: Story = {
  render: () => (
    <ItemGroup ordered variant="separated" className="w-80" aria-label="가입 절차">
      {['이메일 인증', '이름 정하기', '약관 동의'].map((step, index) => (
        <Item key={step}>
          <Item.Media variant="soft" aria-hidden>
            {index + 1}
          </Item.Media>
          <Item.Content>
            <Item.Title>{step}</Item.Title>
          </Item.Content>
        </Item>
      ))}
    </ItemGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`ordered` 는 `<ol>` 로 그려 스크린 리더가 순서를 읽는다. 번호는 그리지 않으니 보여야 하면 `Item.Media` 에 둔다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const steps = canvas.getByRole('list', { name: '가입 절차' });
    await expect(steps.tagName).toBe('OL');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};
