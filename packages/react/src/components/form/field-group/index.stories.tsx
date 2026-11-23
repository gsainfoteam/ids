import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field } from '../field';
import { TextArea } from '../text-area';
import { TextField } from '../text-field';

import { FieldGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const orientations = ['vertical', 'horizontal'] as const;

const meta = {
  title: 'Form/FieldGroup',
  component: FieldGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: orientations },
  },
  args: { orientation: 'horizontal' },
  render: (args) => (
    <div className="w-96">
      <FieldGroup {...args}>
        <Field>
          <Field.Label>이름</Field.Label>
          <TextField defaultValue="김지수" />
        </Field>
        <Field>
          <Field.Label>GIST 메일</Field.Label>
          <TextField defaultValue="jisu@gm.gist.ac.kr" readOnly />
        </Field>
      </FieldGroup>
    </div>
  ),
} satisfies Meta<typeof FieldGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="w-96">
      <FieldGroup>
        <Field>
          <Field.Label>이름</Field.Label>
          <TextField defaultValue="김지수" />
        </Field>
        <Field>
          <Field.Label>GIST 메일</Field.Label>
          <TextField defaultValue="jisu@gm.gist.ac.kr" readOnly />
        </Field>
      </FieldGroup>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Orientation"
        description="vertical 은 Field 를 쌓고, horizontal 은 라벨 열 하나를 모든 Field 가 나눠 씁니다."
      >
        {orientations.map((orientation) => (
          <Showcase.Row key={orientation} label={orientation}>
            <div className="w-96">
              <FieldGroup orientation={orientation}>
                <Field>
                  <Field.Label>이름</Field.Label>
                  <TextField defaultValue="김지수" />
                </Field>
                <Field>
                  <Field.Label>GIST 메일</Field.Label>
                  <TextField defaultValue="jisu@gm.gist.ac.kr" readOnly />
                  <Field.Description>학교 메일로 알림을 받습니다.</Field.Description>
                </Field>
              </FieldGroup>
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Mixed"
        description="가로 그룹 안의 세로 Field 는 두 열을 다 차지합니다."
      >
        <Showcase.Row label="vertical inside horizontal">
          <div className="w-96">
            <FieldGroup orientation="horizontal">
              <Field>
                <Field.Label>이름</Field.Label>
                <TextField defaultValue="김지수" />
              </Field>
              <Field orientation="vertical">
                <Field.Label>자기소개</Field.Label>
                <TextArea defaultValue="인포팀에서 프론트엔드를 맡고 있습니다." />
              </Field>
            </FieldGroup>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const LineUpInputsBesideTheirLabels: Story = {
  render: () => (
    <div className="w-96">
      <FieldGroup orientation="horizontal">
        <Field>
          <Field.Label>이름</Field.Label>
          <TextField defaultValue="김지수" />
        </Field>
        <Field>
          <Field.Label>GIST 메일</Field.Label>
          <TextField defaultValue="jisu@gm.gist.ac.kr" readOnly />
        </Field>
        <Field>
          <Field.Label>학번</Field.Label>
          <TextField defaultValue="20250001" />
        </Field>
      </FieldGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`FieldGroup orientation="horizontal"` 안의 Field 는 라벨 열 하나를 나눠 씁니다. 라벨 길이가 달라도 입력칸이 같은 자리에서 시작합니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const starts = canvas
      .getAllByRole('textbox')
      .map((input) => Math.round(input.getBoundingClientRect().left));
    await expect(new Set(starts).size).toBe(1);
  },
};
