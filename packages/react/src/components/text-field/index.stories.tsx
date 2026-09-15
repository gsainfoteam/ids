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
import { expect } from 'storybook/test';

import { Button } from '../button';
import { IconButton } from '../icon-button';
import { IconToggle } from '../icon-toggle';
import { Label } from '../label';

import { TextField } from '.';

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

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    placeholder: '검색어를 입력하세요',
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-8">
      <Section title="Bare">
        <TextField placeholder="검색어를 입력하세요" />
      </Section>

      <Section title="Size">
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <TextField key={size} size={size} placeholder={`${size} field`} />
          ))}
        </div>
      </Section>

      <Section title="Variant">
        <div className="flex flex-col gap-3">
          {variants.map((variant) => (
            <TextField key={variant} variant={variant} placeholder={`${variant} field`} />
          ))}
        </div>
      </Section>

      <Section title="Leading icon">
        <div className="flex flex-col gap-3">
          <TextField placeholder="Search...">
            <MagnifyingGlassIcon />
            <TextField.Input />
          </TextField>

          <TextField placeholder="Enter your email" type="email">
            <EnvelopeIcon />
            <TextField.Input />
          </TextField>
        </div>
      </Section>

      <Section title="Trailing icon button">
        <div className="flex flex-col gap-3">
          <CopyUrlField />

          <TextField placeholder="Enter file name">
            <TextField.Input />
            <IconButton
              variant="ghost"
              aria-label="더보기"
              icon={<DotsThreeIcon />}
              onClick={() => undefined}
            />
          </TextField>
        </div>
      </Section>

      <Section title="Leading + trailing">
        <div className="flex flex-col gap-3">
          <TextField placeholder="Search...">
            <MagnifyingGlassIcon />
            <TextField.Input />
            <span>12 results</span>
          </TextField>

          <TextField defaultValue="https://">
            <InfoIcon />
            <TextField.Input />
            <IconToggle
              variant="ghost"
              aria-label="즐겨찾기"
              icon={(state) => <StarIcon weight={state.pressed ? 'fill' : 'regular'} />}
            />
          </TextField>

          <TextField placeholder="Card number">
            <CreditCardIcon />
            <TextField.Input />
            <CheckIcon />
          </TextField>
        </div>
      </Section>

      <Section title="Multiple trailing">
        <TextField placeholder="Card number">
          <TextField.Input />
          <IconToggle
            variant="ghost"
            aria-label="즐겨찾기"
            icon={(state) => <StarIcon weight={state.pressed ? 'fill' : 'regular'} />}
          />
          <IconButton
            variant="ghost"
            aria-label="정보"
            icon={<InfoIcon />}
            onClick={() => undefined}
          />
        </TextField>
      </Section>

      <Section title="Text prefix / suffix">
        <div className="flex flex-col gap-3">
          <TextField defaultValue="0.00" inputMode="decimal">
            <span>$</span>
            <TextField.Input />
            <span>USD</span>
          </TextField>

          <TextField defaultValue="example.com">
            <span>https://</span>
            <TextField.Input />
            <span>.com</span>
          </TextField>

          <TextField placeholder="Enter your username">
            <TextField.Input />
            <span>@company.com</span>
          </TextField>
        </div>
      </Section>

      <Section title="Interactive trailing">
        <div className="flex flex-col gap-3">
          <TextField placeholder="Enter search query">
            <TextField.Input />
            <Button variant="ghost" onClick={() => undefined}>
              Search In...
              <CaretDownIcon />
            </Button>
          </TextField>

          <TextField placeholder="Search...">
            <MagnifyingGlassIcon />
            <TextField.Input />
            <kbd className="text-body-b3-regular rounded-md bg-(--ids-color-primary)/15 px-1.5 py-0.5 text-(--ids-color-on-muted)">
              ⌘K
            </kbd>
          </TextField>
        </div>
      </Section>

      <Section title="Filled">
        <div className="flex flex-col gap-3">
          <TextField variant="filled" placeholder="Search...">
            <MagnifyingGlassIcon />
            <TextField.Input />
            <span>12 results</span>
          </TextField>
          <TextField variant="filled" size="tiny" defaultValue="0.00">
            <span>$</span>
            <TextField.Input />
            <span>USD</span>
          </TextField>
        </div>
      </Section>

      <Section title="Underline">
        <div className="flex flex-col gap-3">
          <TextField variant="underline" placeholder="Enter your email">
            <EnvelopeIcon />
            <TextField.Input />
          </TextField>
          <TextField variant="underline" placeholder="Enter your username">
            <TextField.Input />
            <span>@company.com</span>
          </TextField>
        </div>
      </Section>

      <Section title="Disabled">
        <TextField disabled placeholder="비활성">
          <MagnifyingGlassIcon />
          <TextField.Input />
        </TextField>
      </Section>
    </div>
  ),
};

export const Clearable: Story = {
  render: () => <SearchWithClear />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '검색어' });
    await expect(input).toHaveValue('인포팀');

    await userEvent.click(canvas.getByRole('button', { name: '지우기' }));
    await expect(input).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: '지우기' })).not.toBeInTheDocument();

    await userEvent.type(input, '지스트');
    await expect(canvas.getByRole('button', { name: '지우기' })).toBeInTheDocument();
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex max-w-xs flex-col gap-2">
      <Label htmlFor="text-field-email">이메일</Label>
      <TextField id="text-field-email" type="email" placeholder="you@gm.gist.ac.kr">
        <EnvelopeIcon />
        <TextField.Input />
      </TextField>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '이메일' });
    await userEvent.click(canvas.getByText('이메일'));
    await expect(input).toHaveFocus();
  },
};

export const PointerFocus: Story = {
  render: () => (
    <TextField className="max-w-xs" aria-label="포커스 테스트" placeholder="아무 데나 누르세요">
      <MagnifyingGlassIcon />
      <TextField.Input />
    </TextField>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '포커스 테스트' });
    await userEvent.click(
      input.closest('[data-text-field]')!.querySelector('[data-text-field-adornment]')!,
    );
    await expect(input).toHaveFocus();
  },
};

function CopyUrlField() {
  const [copied, setCopied] = useState(false);
  const url = 'https://x.com/shadcn';

  return (
    <TextField defaultValue={url} readOnly>
      <TextField.Input />
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
    </TextField>
  );
}

function SearchWithClear() {
  const [value, setValue] = useState('인포팀');

  return (
    <TextField
      className="max-w-xs"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="검색어"
      aria-label="검색어"
    >
      <MagnifyingGlassIcon />
      <TextField.Input />
      {value !== '' && (
        <IconButton
          variant="ghost"
          aria-label="지우기"
          icon={<XIcon />}
          onClick={() => setValue('')}
        />
      )}
    </TextField>
  );
}
