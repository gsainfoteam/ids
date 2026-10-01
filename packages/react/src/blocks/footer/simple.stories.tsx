import { Skeleton } from '../../components/feedback/skeleton';
import { Divider } from '../../components/layout/divider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Footer/Simple',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const LINKS = ['이용 약관', '개인정보 처리방침', '문의'];

export const PC: Story = {
  render: () => (
    <div className="flex min-h-dvh flex-col break-keep">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton shape="text" lines={3} />
      </main>

      <Divider />
      <footer className="text-body-b3-regular mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
        <p>© 2026 GIST 인포팀</p>
        <nav aria-label="바닥글">
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {LINKS.map((link, index) => (
              <li key={link} className="flex items-center gap-2">
                {index > 0 && <Divider orientation="vertical" className="h-3" />}
                <a href={`#${link}`}>{link}</a>
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  ),
};
