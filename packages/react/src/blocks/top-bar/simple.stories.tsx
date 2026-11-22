import { Bars3Icon, CubeTransparentIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Item } from '../../components/data/item';
import { Skeleton } from '../../components/feedback/skeleton';
import { Divider } from '../../components/layout/divider';
import { Drawer } from '../../components/overlay/drawer';
import { Link } from '../../components/typography/link';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/TopBar/Simple',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const MENU = [
  { href: '#notices', label: '공지' },
  { href: '#groups', label: '그룹' },
  { href: '#shuttle', label: '셔틀' },
  { href: '#cafeteria', label: '학식' },
];

const CURRENT = '#groups';

export const PC: Story = {
  render: () => (
    <div className="flex min-h-dvh flex-col break-keep">
      <header className="flex h-14 items-center gap-3 px-4 sm:gap-8 sm:px-6">
        <Drawer side="left">
          <Drawer.Trigger asChild>
            <IconButton
              variant="outline"
              size="tiny"
              aria-label="메뉴 열기"
              icon={<Bars3Icon />}
              className="sm:hidden"
            />
          </Drawer.Trigger>
          <Drawer.Content aria-label="주 메뉴" className="w-64">
            <nav aria-label="주 메뉴" className="pt-8">
              <ul className="flex flex-col gap-1">
                {MENU.map((item) => (
                  <li key={item.href}>
                    <Drawer.Close asChild>
                      <Item asChild interactive size="tiny" selected={item.href === CURRENT}>
                        <a
                          href={item.href}
                          aria-current={item.href === CURRENT ? 'page' : undefined}
                        >
                          <Item.Content>
                            <Item.Title>{item.label}</Item.Title>
                          </Item.Content>
                        </a>
                      </Item>
                    </Drawer.Close>
                  </li>
                ))}
              </ul>
            </nav>
          </Drawer.Content>
        </Drawer>

        <Link
          href="#home"
          colorScheme="neutral"
          underline="none"
          className="text-body-b2-semibold flex items-center gap-2"
        >
          <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
            <Avatar.Fallback>
              <CubeTransparentIcon />
            </Avatar.Fallback>
          </Avatar>
          GIST 인포팀
        </Link>

        <nav aria-label="주 메뉴" className="max-sm:hidden">
          <ul className="text-body-b3-medium flex items-center gap-6">
            {MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  colorScheme="neutral"
                  underline="none"
                  aria-current={item.href === CURRENT ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Button size="tiny" className="ms-auto">
          로그인
        </Button>
      </header>
      <Divider />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
        <h1 className="text-headline-h3-bold">그룹</h1>
        <Skeleton shape="text" lines={3} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="aspect-video" />
          <Skeleton className="aspect-video" />
          <Skeleton className="aspect-video" />
        </div>
      </main>
    </div>
  ),
};
