import { useState, type ReactNode } from 'react';

import {
  CaretDownIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  DotsThreeIcon,
  EnvelopeIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XIcon,
} from '@phosphor-icons/react';

import { Button } from '../button';
import { IconButton } from '../icon-button';
import { IconToggle } from '../icon-toggle';
import { TextField } from '../text-field';

import { TextFieldGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'filled', 'underline'] as const;
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

const meta: Meta<typeof TextFieldGroup> = {
  title: 'Components/TextFieldGroup',
  component: TextFieldGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
  },
};

export default meta;
type Story = StoryObj<typeof TextFieldGroup>;

export const Playground: Story = {
  render: (args) => (
    <TextFieldGroup {...args}>
      <TextField placeholder="검색어를 입력하세요" />
    </TextFieldGroup>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-8">
      <Section title="Bare">
        <TextFieldGroup>
          <TextField placeholder="검색어를 입력하세요" />
        </TextFieldGroup>
      </Section>

      <Section title="Leading icon">
        <div className="flex flex-col gap-3">
          <TextFieldGroup>
            <TextFieldGroup.Adornment>
              <MagnifyingGlassIcon />
            </TextFieldGroup.Adornment>
            <TextField placeholder="Search..." />
          </TextFieldGroup>

          <TextFieldGroup>
            <TextFieldGroup.Adornment>
              <EnvelopeIcon />
            </TextFieldGroup.Adornment>
            <TextField placeholder="Enter your email" type="email" />
          </TextFieldGroup>
        </div>
      </Section>

      <Section title="Trailing icon (IconButton in Adornment)">
        <div className="flex flex-col gap-3">
          <CopyUrlField />

          <TextFieldGroup>
            <TextField placeholder="Enter file name" />
            <TextFieldGroup.Adornment>
              <IconButton
                variant="ghost"
                aria-label="더보기"
                icon={<DotsThreeIcon />}
                onClick={() => undefined}
              />
            </TextFieldGroup.Adornment>
          </TextFieldGroup>
        </div>
      </Section>

      <Section title="Leading + trailing">
        <div className="flex flex-col gap-3">
          <TextFieldGroup>
            <TextFieldGroup.Adornment>
              <MagnifyingGlassIcon />
            </TextFieldGroup.Adornment>
            <TextField placeholder="Search..." />
            <TextFieldGroup.Adornment>12 results</TextFieldGroup.Adornment>
          </TextFieldGroup>

          <TextFieldGroup>
            <TextFieldGroup.Adornment>
              <InfoIcon />
            </TextFieldGroup.Adornment>
            <TextField defaultValue="https://" />
            <TextFieldGroup.Adornment>
              <IconToggle
                variant="ghost"
                aria-label="즐겨찾기"
                icon={(state) => <StarIcon weight={state.pressed ? 'fill' : 'regular'} />}
              />
            </TextFieldGroup.Adornment>
          </TextFieldGroup>

          <TextFieldGroup>
            <TextFieldGroup.Adornment>
              <CreditCardIcon />
            </TextFieldGroup.Adornment>
            <TextField placeholder="Card number" />
            <TextFieldGroup.Adornment>
              <CheckIcon />
            </TextFieldGroup.Adornment>
          </TextFieldGroup>
        </div>
      </Section>

      <Section title="Multiple trailing">
        <TextFieldGroup>
          <TextField placeholder="Card number" />
          <TextFieldGroup.Adornment>
            <IconToggle
              variant="ghost"
              aria-label="즐겨찾기"
              icon={(state) => <StarIcon weight={state.pressed ? 'fill' : 'regular'} />}
            />
          </TextFieldGroup.Adornment>
          <TextFieldGroup.Adornment>
            <IconButton
              variant="ghost"
              aria-label="정보"
              icon={<InfoIcon />}
              onClick={() => undefined}
            />
          </TextFieldGroup.Adornment>
        </TextFieldGroup>
      </Section>

      <Section title="Text prefix / suffix">
        <div className="flex flex-col gap-3">
          <TextFieldGroup>
            <TextFieldGroup.Adornment>$</TextFieldGroup.Adornment>
            <TextField defaultValue="0.00" inputMode="decimal" />
            <TextFieldGroup.Adornment>USD</TextFieldGroup.Adornment>
          </TextFieldGroup>

          <TextFieldGroup>
            <TextFieldGroup.Adornment>https://</TextFieldGroup.Adornment>
            <TextField defaultValue="example.com" />
            <TextFieldGroup.Adornment>.com</TextFieldGroup.Adornment>
          </TextFieldGroup>

          <TextFieldGroup>
            <TextField placeholder="Enter your username" />
            <TextFieldGroup.Adornment>@company.com</TextFieldGroup.Adornment>
          </TextFieldGroup>
        </div>
      </Section>

      <Section title="Interactive trailing">
        <div className="flex flex-col gap-3">
          <TextFieldGroup>
            <TextField placeholder="Enter search query" />
            <TextFieldGroup.Adornment>
              <Button variant="ghost" onClick={() => undefined}>
                Search In...
                <CaretDownIcon />
              </Button>
            </TextFieldGroup.Adornment>
          </TextFieldGroup>

          <TextFieldGroup>
            <TextFieldGroup.Adornment>
              <MagnifyingGlassIcon />
            </TextFieldGroup.Adornment>
            <TextField placeholder="Search..." />
            <TextFieldGroup.Adornment>
              <kbd className="text-body-b3-regular rounded-md bg-(--ids-color-primary)/15 px-1.5 py-0.5 text-(--ids-color-on-muted)">
                ⌘K
              </kbd>
            </TextFieldGroup.Adornment>
          </TextFieldGroup>

          {/* Adornment 밖 — 진짜 버튼 표면 유지 */}
          <TextFieldGroup>
            <TextField placeholder="Type to search..." />
            <Button variant="soft" size="tiny">
              Search
            </Button>
          </TextFieldGroup>
        </div>
      </Section>

      <Section title="Trailing clear (controlled)">
        <SearchWithClear />
      </Section>

      <Section title="Filled">
        <div className="flex flex-col gap-3">
          <TextFieldGroup variant="filled">
            <TextFieldGroup.Adornment>
              <MagnifyingGlassIcon />
            </TextFieldGroup.Adornment>
            <TextField placeholder="Search..." />
            <TextFieldGroup.Adornment>12 results</TextFieldGroup.Adornment>
          </TextFieldGroup>
          <TextFieldGroup variant="filled" size="tiny">
            <TextFieldGroup.Adornment>$</TextFieldGroup.Adornment>
            <TextField defaultValue="0.00" />
            <TextFieldGroup.Adornment>USD</TextFieldGroup.Adornment>
          </TextFieldGroup>
        </div>
      </Section>

      <Section title="Underline">
        <div className="flex flex-col gap-3">
          <TextFieldGroup variant="underline">
            <TextFieldGroup.Adornment>
              <EnvelopeIcon />
            </TextFieldGroup.Adornment>
            <TextField placeholder="Enter your email" />
          </TextFieldGroup>
          <TextFieldGroup variant="underline">
            <TextField placeholder="Enter your username" />
            <TextFieldGroup.Adornment>@company.com</TextFieldGroup.Adornment>
          </TextFieldGroup>
        </div>
      </Section>

      <Section title="Disabled">
        <TextFieldGroup disabled>
          <TextFieldGroup.Adornment>
            <MagnifyingGlassIcon />
          </TextFieldGroup.Adornment>
          <TextField placeholder="비활성" />
        </TextFieldGroup>
      </Section>
    </div>
  ),
};

function CopyUrlField() {
  const [copied, setCopied] = useState(false);
  const url = 'https://x.com/shadcn';

  return (
    <TextFieldGroup>
      <TextField defaultValue={url} readOnly />
      <TextFieldGroup.Adornment>
        <IconButton
          variant="ghost"
          aria-label={copied ? '복사됨' : '복사'}
          icon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={() => {
            void navigator.clipboard?.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        />
      </TextFieldGroup.Adornment>
    </TextFieldGroup>
  );
}

function SearchWithClear() {
  const [value, setValue] = useState('인포팀');

  return (
    <TextFieldGroup>
      <TextFieldGroup.Adornment>
        <MagnifyingGlassIcon />
      </TextFieldGroup.Adornment>
      <TextField value={value} onChange={(e) => setValue(e.target.value)} placeholder="검색어" />
      {value ? (
        <TextFieldGroup.Adornment>
          <IconButton
            variant="ghost"
            aria-label="지우기"
            icon={<XIcon />}
            onClick={() => setValue('')}
          />
        </TextFieldGroup.Adornment>
      ) : null}
    </TextFieldGroup>
  );
}
