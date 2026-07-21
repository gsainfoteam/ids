import { useState, type ReactNode } from 'react';

import {
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
} from '@phosphor-icons/react';

import { IconToggle } from '../icon-toggle';
import { Toggle } from '../toggle';

import { ToggleGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-(--ids-color-on-muted) uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <span className="w-20 shrink-0 text-xs text-(--ids-color-on-muted)">{children}</span>;
}

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'radio', options: ['single', 'multiple'] },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    disabled: { control: 'boolean' },
  },
  args: {
    type: 'single',
    orientation: 'horizontal',
    size: 'standard',
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Playground: Story = {
  render: ({ type = 'single', orientation, size, disabled, className }) => {
    const toggles = (
      <>
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
        <Toggle value="right">Right</Toggle>
      </>
    );

    if (type === 'multiple') {
      return (
        <ToggleGroup
          key="multiple"
          type="multiple"
          orientation={orientation}
          size={size}
          disabled={disabled}
          className={className}
          defaultValue={['center']}
        >
          {toggles}
        </ToggleGroup>
      );
    }

    return (
      <ToggleGroup
        key="single"
        type="single"
        orientation={orientation}
        size={size}
        disabled={disabled}
        className={className}
        defaultValue="center"
      >
        {toggles}
      </ToggleGroup>
    );
  },
  args: {
    type: 'single',
    orientation: 'horizontal',
    size: 'standard',
  },
};

export const Gallery: Story = {
  render: () => {
    const [align, setAlign] = useState('left');
    const [marks, setMarks] = useState(() => new Set(['bold']));

    return (
      <div className="flex max-w-5xl flex-col gap-10">
        <Section title="Variant × Size">
          <div className="flex flex-col gap-4">
            {sizes.map((size) => (
              <Row key={size}>
                <Label>{size}</Label>
                {variants.map((variant) => (
                  <ToggleGroup key={variant} type="single" size={size} defaultValue="center">
                    <IconToggle
                      value="left"
                      aria-label={`${variant} 왼쪽`}
                      variant={variant}
                      icon={<TextAlignLeftIcon weight="bold" />}
                    />
                    <Toggle value="center" variant={variant}>
                      Center
                    </Toggle>
                    <IconToggle
                      value="right"
                      aria-label={`${variant} 오른쪽`}
                      variant={variant}
                      icon={<TextAlignRightIcon weight="bold" />}
                    />
                  </ToggleGroup>
                ))}
              </Row>
            ))}
          </div>
        </Section>

        <Section title="Separator splits segments">
          <div className="flex flex-col gap-4">
            {variants.map((variant) => (
              <Row key={variant}>
                <Label>{variant}</Label>
                <ToggleGroup type="multiple" defaultValue={new Set(['bold'])}>
                  <IconToggle
                    value="bold"
                    aria-label={`${variant} 굵게`}
                    variant={variant}
                    icon={<TextBIcon weight="bold" />}
                  />
                  <IconToggle
                    value="italic"
                    aria-label={`${variant} 기울임`}
                    variant={variant}
                    icon={<TextItalicIcon weight="bold" />}
                  />
                  <ToggleGroup.Separator />
                  <Toggle value="quote" variant={variant}>
                    Quote
                  </Toggle>
                  <IconToggle
                    value="underline"
                    aria-label={`${variant} 밑줄`}
                    variant={variant}
                    icon={<TextUnderlineIcon weight="bold" />}
                  />
                </ToggleGroup>
              </Row>
            ))}
          </div>
        </Section>

        <Section title="Single (radio)">
          <ToggleGroup type="single" value={align} onValueChange={setAlign}>
            <IconToggle
              value="left"
              aria-label="왼쪽 정렬"
              icon={<TextAlignLeftIcon weight="bold" />}
            />
            <IconToggle
              value="center"
              aria-label="가운데 정렬"
              icon={<TextAlignCenterIcon weight="bold" />}
            />
            <IconToggle
              value="right"
              aria-label="오른쪽 정렬"
              icon={<TextAlignRightIcon weight="bold" />}
            />
          </ToggleGroup>
          <p className="font-mono text-xs text-(--ids-color-on-muted)">
            align: {align || '(none)'}
          </p>
        </Section>

        <Section title="Multiple (bold + italic)">
          <ToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
            <IconToggle value="bold" aria-label="굵게" icon={<TextBIcon weight="bold" />} />
            <IconToggle
              value="italic"
              aria-label="기울임"
              icon={<TextItalicIcon weight="bold" />}
            />
            <ToggleGroup.Separator />
            <IconToggle
              value="underline"
              aria-label="밑줄"
              icon={<TextUnderlineIcon weight="bold" />}
            />
          </ToggleGroup>
          <p className="font-mono text-xs text-(--ids-color-on-muted)">
            marks: {JSON.stringify([...marks])}
          </p>
        </Section>

        <Section title="Text toggles + Separator">
          <ToggleGroup type="single" size="tiny" defaultValue="day">
            <Toggle value="day">일</Toggle>
            <Toggle value="week">주</Toggle>
            <ToggleGroup.Separator />
            <Toggle value="month">월</Toggle>
          </ToggleGroup>
        </Section>

        <Section title="Vertical">
          <ToggleGroup type="single" orientation="vertical" defaultValue="a">
            <Toggle value="a">A</Toggle>
            <ToggleGroup.Separator />
            <Toggle value="b">B</Toggle>
            <Toggle value="c">C</Toggle>
          </ToggleGroup>
        </Section>

        <Section title="Disabled">
          <ToggleGroup type="multiple" defaultValue={new Set(['bold'])} disabled>
            <IconToggle value="bold" aria-label="굵게" icon={<TextBIcon weight="bold" />} />
            <IconToggle
              value="italic"
              aria-label="기울임"
              icon={<TextItalicIcon weight="bold" />}
            />
          </ToggleGroup>
        </Section>
      </div>
    );
  },
};
