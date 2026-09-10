import { useState } from 'react';

import { expect, userEvent } from 'storybook/test';

import { Label } from '../label';

import { CheckboxGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Skill = 'js' | 'ts' | 'py' | 'rs';

const SKILLS: Array<{ value: Skill; label: string }> = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'rs', label: 'Rust' },
];

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['vertical', 'horizontal', 'grid'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

export const Playground: Story = {
  args: { variant: 'vertical', size: 'standard' },
  render: function Playground({ variant, size, disabled }) {
    const [skills, setSkills] = useState<readonly Skill[]>(['ts']);

    return (
      <CheckboxGroup<Skill>
        variant={variant}
        size={size}
        disabled={disabled}
        value={skills}
        onChange={setSkills}
        aria-label="관심 기술"
      >
        {({ Item }) =>
          SKILLS.map((skill) => (
            <Label key={skill.value} className="inline-flex items-center gap-2">
              <Item value={skill.value} />
              {skill.label}
            </Label>
          ))
        }
      </CheckboxGroup>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: '관심 기술' })).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox', { name: 'TypeScript' })).toBeChecked();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Rust' }));
    await expect(canvas.getByRole('checkbox', { name: 'Rust' })).toBeChecked();
  },
};

export const SelectAll: Story = {
  render: function SelectAll() {
    const [skills, setSkills] = useState<readonly Skill[]>(['js']);

    return (
      <CheckboxGroup<Skill> value={skills} onChange={setSkills} aria-label="관심 기술">
        {({ All, Item }) => (
          <>
            <Label className="inline-flex items-center gap-2">
              <All />
              전체 선택
            </Label>
            <div className="flex flex-col gap-2 pl-6">
              {SKILLS.map((skill) => (
                <Label key={skill.value} className="inline-flex items-center gap-2">
                  <Item value={skill.value} />
                  {skill.label}
                </Label>
              ))}
            </div>
          </>
        )}
      </CheckboxGroup>
    );
  },
  play: async ({ canvas }) => {
    const all = canvas.getByRole('checkbox', { name: '전체 선택' });
    await expect(all).toBePartiallyChecked();

    await userEvent.click(all);
    await expect(canvas.getByRole('checkbox', { name: 'Rust' })).toBeChecked();
    await expect(all).toBeChecked();

    await userEvent.click(all);
    await expect(canvas.getByRole('checkbox', { name: 'JavaScript' })).not.toBeChecked();
  },
};

export const Horizontal: Story = {
  render: function Horizontal() {
    type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
    const [days, setDays] = useState<readonly Day[]>(['mon']);
    const labels: Array<[Day, string]> = [
      ['mon', '월'],
      ['tue', '화'],
      ['wed', '수'],
      ['thu', '목'],
      ['fri', '금'],
    ];

    return (
      <CheckboxGroup<Day>
        variant="horizontal"
        value={days}
        onChange={setDays}
        aria-label="요일 선택"
      >
        {({ Item }) =>
          labels.map(([value, label]) => (
            <Label key={value} className="inline-flex items-center gap-2">
              <Item value={value} />
              {label}
            </Label>
          ))
        }
      </CheckboxGroup>
    );
  },
};

export const Grid: Story = {
  render: function Grid() {
    const [skills, setSkills] = useState<readonly Skill[]>([]);

    return (
      <div className="w-96">
        <CheckboxGroup<Skill>
          variant="grid"
          columns={2}
          value={skills}
          onChange={setSkills}
          aria-label="관심 기술"
        >
          {({ Item }) =>
            SKILLS.map((skill) => (
              <Label key={skill.value} className="inline-flex items-center gap-2">
                <Item value={skill.value} />
                {skill.label}
              </Label>
            ))
          }
        </CheckboxGroup>
      </div>
    );
  },
};

export const DisabledItem: Story = {
  render: function DisabledItem() {
    const [skills, setSkills] = useState<readonly Skill[]>(['js']);

    return (
      <CheckboxGroup<Skill> value={skills} onChange={setSkills} aria-label="관심 기술">
        {({ Item }) => (
          <>
            <Label className="inline-flex items-center gap-2">
              <Item value="js" />
              JavaScript
            </Label>
            <Label className="inline-flex items-center gap-2">
              <Item value="rs" disabled />
              Rust (준비 중)
            </Label>
          </>
        )}
      </CheckboxGroup>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Rust (준비 중)' })).toBeDisabled();
  },
};
