import { useState } from 'react';

import { Button } from './components/action/button';
import { ChipField } from './components/form/chip-field';
import { Select } from './components/form/select';
import { Menu } from './components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'ZZ/OptionLists', tags: ['!autodocs', '!test'] } satisfies Meta;
export default meta;

export const SelectOpen: StoryObj = {
  render: () => (
    <div className="flex h-80 w-60 items-start">
      <Select
        aria-label="과일"
        selectionMode="multiple"
        defaultValue={['apple', 'banana', 'grape']}
        defaultOpen
      >
        <Select.Group heading="과일">
          <Select.Item value="apple">사과</Select.Item>
          <Select.Item value="banana">바나나</Select.Item>
          <Select.Item value="cherry">체리</Select.Item>
          <Select.Item value="grape">포도</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group heading="채소">
          <Select.Item value="carrot">당근</Select.Item>
          <Select.Item value="kale" disabled>
            케일 (품절)
          </Select.Item>
        </Select.Group>
      </Select>
    </div>
  ),
};

export const ChipFieldOpen: StoryObj = {
  render: () => (
    <div className="flex h-80 w-72 items-start">
      <ChipField aria-label="기술" defaultValue={['react', 'svelte']} defaultOpen>
        <ChipField.Item value="react">React</ChipField.Item>
        <ChipField.Item value="vue">Vue</ChipField.Item>
        <ChipField.Item value="svelte">Svelte</ChipField.Item>
        <ChipField.Item value="flutter">Flutter</ChipField.Item>
      </ChipField>
    </div>
  ),
};

export const MenuOpen: StoryObj = {
  render: function Render() {
    const [grid, setGrid] = useState(true);
    const [ruler, setRuler] = useState(false);
    const [zoom, setZoom] = useState('100');

    return (
      <div className="flex h-80 w-60 items-start">
        <Menu defaultOpen>
          <Menu.Trigger asChild>
            <Button variant="outline">보기</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
              격자 표시
            </Menu.CheckboxItem>
            <Menu.CheckboxItem checked={ruler} onCheckedChange={setRuler}>
              눈금자 표시
            </Menu.CheckboxItem>
            <Menu.Separator />
            <Menu.RadioGroup value={zoom} onValueChange={setZoom}>
              <Menu.Label>확대</Menu.Label>
              <Menu.RadioItem value="75">75%</Menu.RadioItem>
              <Menu.RadioItem value="100">100%</Menu.RadioItem>
              <Menu.RadioItem value="150">150%</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Content>
        </Menu>
      </div>
    );
  },
};
