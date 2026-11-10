import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { CodeBlock } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;

const BUTTON = `import { Button } from '@gsainfoteam/ids-react';

export function Save({ pending }: { pending: boolean }) {
  // 저장 중에는 누르지 못하게 한다
  return (
    <Button variant="solid" disabled={pending}>
      저장
    </Button>
  );
}`;

const INSTALL = 'pnpm add @gsainfoteam/ids-react @gsainfoteam/ids-css';

const LONG_LINE = `const query = new URLSearchParams({ page: '1', size: '20', sort: 'createdAt,desc', filter: 'status:open,owner:me' });`;

const SAMPLES = {
  bash: `# 의존성을 설치하고 개발 서버를 연다
pnpm install
pnpm --filter @gsainfoteam/ids-react storybook`,
  python: `def fibonacci(n: int) -> list[int]:
    numbers = [0, 1]
    while len(numbers) < n:
        numbers.append(numbers[-1] + numbers[-2])
    return numbers[:n]`,
  json: `{
  "name": "ids",
  "private": true,
  "packageManager": "pnpm@10.11.0"
}`,
  css: `.card {
  padding: 16px;
  border-radius: var(--ids-radius-container);
}`,
  diff: `- <Button variant="ghost">취소</Button>
+ <Button variant="outline">취소</Button>`,
} as const;

const RUST = `fn main() {
    let names = vec!["Alice", "Bob"];
    for name in &names {
        println!("Hello, {name}!");
    }
}`;

const FORM = `import { Button, Field, TextField } from '@gsainfoteam/ids-react';
import { useState } from 'react';

export function ProfileForm({ onSave }: { onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    try {
      await onSave(name);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={(event) => (event.preventDefault(), submit())}>
      <Field label="이름">
        <TextField value={name} onValueChange={setName} />
      </Field>
      <Button type="submit" disabled={pending}>
        저장
      </Button>
    </form>
  );
}`;

const codeOf = (canvasElement: HTMLElement) => canvasElement.querySelector('code')!;

const meta = {
  title: 'Data/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    language: { control: 'text' },
    title: { control: 'text' },
    lineNumbers: { control: 'boolean' },
    wrap: { control: 'boolean' },
    highlight: { control: 'object' },
    collapsedLines: { control: 'number' },
    children: { control: 'text' },
  },
  args: {
    language: 'tsx',
    title: 'save.tsx',
    variant: 'outline',
    lineNumbers: false,
    wrap: false,
    children: BUTTON,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant"
        description="outline 은 테두리 있는 표면, soft 는 옅은 바탕입니다. 둘 다 표면 위 글자 대비 4.5:1 을 넘습니다."
      >
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <CodeBlock variant={variant} language="tsx" title="save.tsx" className="w-full">
              {BUTTON}
            </CodeBlock>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Line numbers × Highlight"
        description="줄 번호는 CSS counter 라 글자가 아닙니다. 강조한 줄은 바탕과 왼쪽 막대로 보입니다."
      >
        {variants.map((variant) => (
          <Showcase.Row key={variant} label={variant}>
            <CodeBlock
              variant={variant}
              language="tsx"
              title="save.tsx"
              lineNumbers
              highlight={[4, 6]}
              className="w-full"
            >
              {BUTTON}
            </CodeBlock>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Caption"
        description="title 과 language 가 figcaption 이 됩니다. 둘 다 없으면 복사 버튼만 코드 위에 뜹니다."
      >
        <Showcase.Row label="title + language">
          <CodeBlock language="bash" title="터미널" className="w-full">
            {INSTALL}
          </CodeBlock>
        </Showcase.Row>
        <Showcase.Row label="language">
          <CodeBlock language="bash" className="w-full">
            {INSTALL}
          </CodeBlock>
        </Showcase.Row>
        <Showcase.Row label="none">
          <CodeBlock className="w-full">{INSTALL}</CodeBlock>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Overflow"
        description="긴 줄은 가로로 스크롤합니다. wrap 이면 줄을 바꿉니다."
      >
        <CodeBlock language="ts" title="scroll" lineNumbers>
          {LONG_LINE}
        </CodeBlock>
        <CodeBlock language="ts" title="wrap" lineNumbers wrap>
          {LONG_LINE}
        </CodeBlock>
      </Showcase.Section>

      <Showcase.Section
        title="Collapse"
        description="collapsedLines 보다 긴 코드는 그만큼만 보이고 아래가 흐려집니다. 버튼으로 펼치고 접습니다."
      >
        <Showcase.Row label="collapsed">
          <CodeBlock
            language="tsx"
            title="profile-form.tsx"
            lineNumbers
            collapsedLines={8}
            className="w-full"
          >
            {FORM}
          </CodeBlock>
        </Showcase.Row>
        <Showcase.Row label="expanded">
          <CodeBlock
            language="tsx"
            title="profile-form.tsx"
            lineNumbers
            collapsedLines={8}
            defaultExpanded
            className="w-full"
          >
            {FORM}
          </CodeBlock>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Language"
        description="기본으로 담긴 언어는 서버 HTML 에서 이미 강조됩니다."
      >
        <Showcase.Row label="bash">
          <CodeBlock language="bash" className="w-full">
            {SAMPLES.bash}
          </CodeBlock>
        </Showcase.Row>
        <Showcase.Row label="python">
          <CodeBlock language="python" className="w-full">
            {SAMPLES.python}
          </CodeBlock>
        </Showcase.Row>
        <Showcase.Row label="json">
          <CodeBlock language="json" className="w-full">
            {SAMPLES.json}
          </CodeBlock>
        </Showcase.Row>
        <Showcase.Row label="css">
          <CodeBlock language="css" className="w-full">
            {SAMPLES.css}
          </CodeBlock>
        </Showcase.Row>
        <Showcase.Row label="diff">
          <CodeBlock language="diff" className="w-full">
            {SAMPLES.diff}
          </CodeBlock>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Copy: Story = {
  render: () => (
    <CodeBlock language="bash" title="설치">
      {INSTALL}
    </CodeBlock>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '복사 버튼은 코드를 그대로 클립보드에 넣고, 잠깐 체크로 바뀌며 스크린 리더에 알립니다. 줄 번호는 들어가지 않습니다. Clipboard API 가 없는 곳에서는 보이지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const copied: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void copied.push(text) },
    });
    await userEvent.click(await canvas.findByRole('button', { name: '코드 복사' }));
    await waitFor(() => expect(copied).toEqual([INSTALL]));
    await expect(canvas.getByRole('status')).toHaveTextContent('복사했습니다');
    await expect(canvas.getByRole('button', { name: '복사했습니다' })).toHaveAttribute(
      'data-copied',
    );
  },
};

export const CustomCopyLabel: Story = {
  render: () => (
    <CodeBlock language="bash">
      {INSTALL}
      <CodeBlock.Copy aria-label="명령어 복사" />
    </CodeBlock>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`CodeBlock.Copy` 는 기본 버튼을 바꿀 때만 둡니다. 이름은 복사한 뒤에도 그대로입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    });
    await expect(await canvas.findByRole('button', { name: '명령어 복사' })).toBeVisible();
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
  },
};

export const LineNumbers: Story = {
  render: () => (
    <CodeBlock language="tsx" title="save.tsx" lineNumbers>
      {BUTTON}
    </CodeBlock>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '줄 번호는 `::before` 의 CSS counter 입니다. 글자를 골라 복사해도, 스크린 리더로 읽어도 번호가 섞이지 않습니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const code = codeOf(canvasElement);
    await expect(code.textContent).toBe(BUTTON);
    const firstLine = code.querySelector('[data-line="1"]')!;
    await expect(getComputedStyle(firstLine, '::before').content).toMatch(/^counter\(line\)/);
  },
};

export const HighlightLines: Story = {
  render: () => (
    <CodeBlock language="tsx" title="save.tsx" lineNumbers highlight={[4, 6]}>
      {BUTTON}
    </CodeBlock>
  ),
  parameters: {
    docs: {
      description: { story: '`highlight` 는 1부터 세는 줄 번호입니다.' },
    },
  },
  play: async ({ canvasElement }) => {
    const highlighted = [...canvasElement.querySelectorAll('[data-highlighted]')].map((line) =>
      line.getAttribute('data-line'),
    );
    await expect(highlighted).toEqual(['4', '6']);
  },
};

export const HorizontalScroll: Story = {
  render: () => (
    <div className="w-80">
      <CodeBlock language="ts">{LONG_LINE}</CodeBlock>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '긴 줄은 ScrollArea 로 가로 스크롤합니다. 넘치면 `<pre>` 가 Tab 멈춤을 받아 화살표로 스크롤합니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const pre = () => canvasElement.querySelector('pre')!;
    await waitFor(() => expect(pre()).toHaveAttribute('tabindex', '0'));
    pre().focus();
    await expect(pre()).toHaveFocus();
  },
};

export const Wrap: Story = {
  render: () => (
    <div className="w-80">
      <CodeBlock language="ts" lineNumbers wrap>
        {LONG_LINE}
      </CodeBlock>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '`wrap` 이면 긴 줄을 바꿔 씁니다. 바뀐 줄은 줄 번호 뒤에서 이어집니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const pre = canvasElement.querySelector('pre')!;
    await expect(pre.scrollWidth).toBe(pre.clientWidth);
    const line = pre.querySelector('[data-line="1"]')!;
    await expect(line.getBoundingClientRect().height).toBeGreaterThan(
      parseFloat(getComputedStyle(line).lineHeight) * 1.5,
    );
  },
};

export const Collapse: Story = {
  render: () => (
    <CodeBlock language="tsx" title="profile-form.tsx" lineNumbers collapsedLines={8}>
      {FORM}
    </CodeBlock>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`collapsedLines` 보다 긴 코드는 앞의 그 줄 수만 보이고, 아래의 버튼으로 펼치고 접습니다. 접혀 있어도 복사 버튼은 코드 전체를 복사합니다.',
      },
    },
  },
  play: async ({ canvasElement, canvas, userEvent }) => {
    const pre = () => canvasElement.querySelector('pre')!;
    const hidden = FORM.split('\n').length - 8;
    const expand = canvas.getByRole('button', { name: `${hidden}줄 더 보기` });
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    await expect(expand).toHaveAttribute('aria-controls', pre().id);
    await expect(pre().scrollHeight).toBeGreaterThan(pre().clientHeight);

    await userEvent.click(expand);
    const collapse = canvas.getByRole('button', { name: '접기' });
    await expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await expect(pre().scrollHeight).toBe(pre().clientHeight);

    await userEvent.click(collapse);
    await expect(canvas.getByRole('button', { name: `${hidden}줄 더 보기` })).toHaveFocus();
  },
};

export const Tokens: Story = {
  render: () => <CodeBlock language="tsx">{`const answer = 42; // 답`}</CodeBlock>,
  parameters: {
    docs: {
      description: {
        story:
          '강조한 조각은 `data-token` 을 받고, 색은 IDS 토큰입니다. keyword 는 테마의 accent, 문자열은 success, 숫자는 warning 입니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const tokenOf = (text: string) =>
      [...canvasElement.querySelectorAll('[data-token]')].find(
        (element) => element.textContent === text,
      );
    await expect(tokenOf('const')).toHaveAttribute('data-token', 'keyword');
    await expect(tokenOf('42')).toHaveAttribute('data-token', 'number');
    await expect(tokenOf('// 답')).toHaveAttribute('data-token', 'comment');
  },
};

export const MoreLanguages: Story = {
  render: () => (
    <CodeBlock language="rust" title="main.rs">
      {RUST}
    </CodeBlock>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'C, C++, C#, Dart, Dockerfile, Go, GraphQL, INI, Java, Kotlin, Lua, Makefile, Objective-C, PHP, Ruby, Rust, SCSS, Swift, TOML 은 처음 쓸 때 따로 불러옵니다. 그때까지, 그리고 서버 HTML 에서는 강조 없이 보입니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        [...canvasElement.querySelectorAll('[data-token="keyword"]')].map((t) => t.textContent),
      ).toContain('fn'),
    );
    await expect(codeOf(canvasElement).textContent).toBe(RUST);
  },
};

export const PlainText: Story = {
  render: () => <CodeBlock>{'로그를 그대로 보입니다.\n  들여쓰기도 그대로입니다.'}</CodeBlock>,
  parameters: {
    docs: {
      description: {
        story:
          '`language` 를 주지 않거나 모르는 언어면 강조 없이 보입니다. 앞뒤 빈 줄 하나는 지웁니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-token]')).toBeNull();
    await expect(canvasElement.querySelector('figcaption')).toBeNull();
  },
};
