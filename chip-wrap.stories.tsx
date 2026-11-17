import { ChipField } from './components/form/chip-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'ZZ/ChipWrap', tags: ['!autodocs', '!test'] } satisfies Meta;
export default meta;

const items = ['react', 'vue', 'svelte', 'angular', 'solid', 'flutter', 'swift', 'kotlin', 'typescript'];
const many = items.slice(0, 7);

export const Wrap: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      {(['outline', 'soft', 'ghost'] as const).map((variant) =>
        (['standard', 'tiny'] as const).map((size) => (
          <div key={variant + size} className="flex items-start gap-4">
            <span className="w-28 text-caption-c1-regular">{variant} {size}</span>
            <div className="w-64">
              <ChipField aria-label={variant + size} variant={variant} size={size} defaultValue={many} placeholder="항목 추가">
                {items.map((v) => <ChipField.Item key={v} value={v}>{v}</ChipField.Item>)}
              </ChipField>
            </div>
            <div className="w-64">
              <ChipField aria-label={variant + size + 'x'} variant={variant} size={size} defaultValue={items.slice(0, 3)} placeholder="항목 추가">
                {items.map((v) => <ChipField.Item key={v} value={v}>{v}</ChipField.Item>)}
              </ChipField>
            </div>
            <div className="w-48">
              <ChipField aria-label={variant + size + 'e'} variant={variant} size={size} placeholder="항목 추가">
                {items.map((v) => <ChipField.Item key={v} value={v}>{v}</ChipField.Item>)}
              </ChipField>
            </div>
          </div>
        )),
      )}
    </div>
  ),
};
