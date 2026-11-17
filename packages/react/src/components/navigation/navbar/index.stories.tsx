import { BellIcon, CubeTransparentIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { expect, waitFor, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Avatar } from '../../data/avatar';
import { Skeleton } from '../../feedback/skeleton';
import { ScrollArea } from '../../layout/scroll-area';

import { Navbar } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Navigation/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: { canvasPadding: false },
  argTypes: {
    value: { control: 'radio', options: ['/notices', '/groups', '/shuttle', '/cafeteria'] },
  },
  args: { value: '/notices', sticky: false, bordered: true },
  render: (args) => (
    <Navbar {...args}>
      <a href="#home" className="text-subtitle-s2-semibold flex items-center gap-2">
        <CubeTransparentIcon className="size-6" />
        GIST 인포팀
      </a>
      <Navbar.Nav>
        <Navbar.Item value="/notices" href="#notices">
          공지
        </Navbar.Item>
        <Navbar.Item value="/groups" href="#groups">
          그룹
        </Navbar.Item>
        <Navbar.Item value="/shuttle" href="#shuttle">
          셔틀
        </Navbar.Item>
        <Navbar.Item value="/cafeteria" href="#cafeteria">
          학식
        </Navbar.Item>
      </Navbar.Nav>
      <Button size="tiny">로그인</Button>
    </Navbar>
  ),
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase className="p-6">
      <Showcase.Section
        title="Start, Nav, End"
        description="Navbar.Nav 앞의 자식은 시작 칸, 뒤의 자식은 끝 칸에 놓입니다. 끝 칸은 오른쪽 끝에 붙습니다."
      >
        <Showcase.Row label="nav only">
          <Navbar value="/notices">
            <Navbar.Nav aria-label="nav only 메뉴">
              <Navbar.Item value="/notices" href="#notices">
                공지
              </Navbar.Item>
              <Navbar.Item value="/groups" href="#groups">
                그룹
              </Navbar.Item>
              <Navbar.Item value="/shuttle" href="#shuttle">
                셔틀
              </Navbar.Item>
            </Navbar.Nav>
          </Navbar>
        </Showcase.Row>
        <Showcase.Row label="start + nav">
          <Navbar value="/groups">
            <a href="#home" className="text-subtitle-s2-semibold flex items-center gap-2">
              <CubeTransparentIcon className="size-6" />
              GIST 인포팀
            </a>
            <Navbar.Nav aria-label="start + nav 메뉴">
              <Navbar.Item value="/notices" href="#notices">
                공지
              </Navbar.Item>
              <Navbar.Item value="/groups" href="#groups">
                그룹
              </Navbar.Item>
              <Navbar.Item value="/shuttle" href="#shuttle">
                셔틀
              </Navbar.Item>
            </Navbar.Nav>
          </Navbar>
        </Showcase.Row>
        <Showcase.Row label="start + nav + end">
          <Navbar value="/shuttle">
            <a href="#home" className="text-subtitle-s2-semibold flex items-center gap-2">
              <CubeTransparentIcon className="size-6" />
              GIST 인포팀
            </a>
            <Navbar.Nav aria-label="start + nav + end 메뉴">
              <Navbar.Item value="/notices" href="#notices">
                공지
              </Navbar.Item>
              <Navbar.Item value="/groups" href="#groups">
                그룹
              </Navbar.Item>
              <Navbar.Item value="/shuttle" href="#shuttle">
                셔틀
              </Navbar.Item>
            </Navbar.Nav>
            <IconButton
              size="tiny"
              variant="outline"
              aria-label="찾기"
              icon={<MagnifyingGlassIcon />}
            />
            <IconButton size="tiny" variant="outline" aria-label="알림" icon={<BellIcon />} />
            <Avatar name="김지수" size="tiny" />
          </Navbar>
        </Showcase.Row>
        <Showcase.Row label="no nav">
          <Navbar>
            <a href="#home" className="text-subtitle-s2-semibold flex items-center gap-2">
              <CubeTransparentIcon className="size-6" />
              GIST 인포팀
            </a>
          </Navbar>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="Bordered"
        description="기본은 아래에 선(Divider)을 긋습니다. 본문과 배경이 다르면 bordered={false} 로 선을 뺍니다."
      >
        <Showcase.Row label="true">
          <Navbar value="/notices">
            <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
            <Navbar.Nav aria-label="bordered 메뉴">
              <Navbar.Item value="/notices" href="#notices">
                공지
              </Navbar.Item>
              <Navbar.Item value="/groups" href="#groups">
                그룹
              </Navbar.Item>
            </Navbar.Nav>
            <Button size="tiny">로그인</Button>
          </Navbar>
        </Showcase.Row>
        <Showcase.Row label="false">
          <Navbar value="/notices" bordered={false}>
            <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
            <Navbar.Nav aria-label="borderless 메뉴">
              <Navbar.Item value="/notices" href="#notices">
                공지
              </Navbar.Item>
              <Navbar.Item value="/groups" href="#groups">
                그룹
              </Navbar.Item>
            </Navbar.Nav>
            <Button size="tiny">로그인</Button>
          </Navbar>
        </Showcase.Row>
      </Showcase.Section>
      <Showcase.Section
        title="Current page"
        description="Navbar 의 value 와 같은 value 의 Item 이 지금 페이지입니다. 링크에 aria-current='page' 가 붙고 진한 글자와 옅은 배경으로 바뀝니다."
      >
        <Showcase.Row label="none">
          <Navbar>
            <Navbar.Nav aria-label="current none 메뉴">
              <Navbar.Item value="/notices" href="#notices">
                공지
              </Navbar.Item>
              <Navbar.Item value="/groups" href="#groups">
                그룹
              </Navbar.Item>
              <Navbar.Item value="/shuttle" href="#shuttle">
                셔틀
              </Navbar.Item>
            </Navbar.Nav>
          </Navbar>
        </Showcase.Row>
        <Showcase.Row label="/groups">
          <Navbar value="/groups">
            <Navbar.Nav aria-label="current groups 메뉴">
              <Navbar.Item value="/notices" href="#notices">
                공지
              </Navbar.Item>
              <Navbar.Item value="/groups" href="#groups">
                그룹
              </Navbar.Item>
              <Navbar.Item value="/shuttle" href="#shuttle">
                셔틀
              </Navbar.Item>
            </Navbar.Nav>
          </Navbar>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const CurrentPage: Story = {
  args: { value: '/groups' },
  play: async ({ canvasElement }) => {
    const current = canvasElement.querySelectorAll('[aria-current="page"]');
    await expect(current).toHaveLength(1);
    await expect(current[0]).toHaveTextContent('그룹');
    await expect(current[0]).toHaveAttribute('href', '#groups');
  },
};

export const RouterLink: Story = {
  render: () => (
    <Navbar value="/groups">
      <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
      <Navbar.Nav>
        <Navbar.Item value="/notices" asChild>
          <a href="#notices" data-router-link="">
            공지
          </a>
        </Navbar.Item>
        <Navbar.Item value="/groups" asChild>
          <a href="#groups" data-router-link="">
            그룹
          </a>
        </Navbar.Item>
      </Navbar.Nav>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const links = canvasElement.querySelectorAll('nav [data-router-link]');
    await expect(links).toHaveLength(2);
    await expect(links[1]).toHaveAttribute('aria-current', 'page');
    await expect(links[1]).toHaveAttribute('data-link', '');
    await expect(links[0]).not.toHaveAttribute('aria-current');
  },
};

export const MobileMenu: Story = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  args: { value: '/shuttle' },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: '메뉴 열기' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);

    const drawer = await canvas.findByRole('dialog', { name: '주 메뉴' });
    const shuttle = within(drawer).getByRole('link', { name: '셔틀' });
    await expect(shuttle).toHaveAttribute('aria-current', 'page');
    await userEvent.click(within(drawer).getByRole('link', { name: '그룹' }));

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '메뉴 열기' })).toHaveAttribute(
        'aria-expanded',
        'false',
      ),
    );
  },
};

export const CustomMenuTrigger: Story = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: () => (
    <Navbar value="/notices">
      <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
      <Navbar.Nav>
        <Navbar.Item value="/notices" href="#notices">
          공지
        </Navbar.Item>
        <Navbar.Item value="/groups" href="#groups">
          그룹
        </Navbar.Item>
      </Navbar.Nav>
      <Button size="tiny">로그인</Button>
      <Navbar.MenuTrigger variant="soft" />
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-navbar-menu-trigger]');
    await expect(triggers).toHaveLength(1);
    await expect(triggers[0]?.previousElementSibling).toHaveTextContent('로그인');
  },
};

export const Sticky: Story = {
  render: () => (
    <ScrollArea className="h-96">
      <Navbar value="/notices" sticky>
        <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
        <Navbar.Nav>
          <Navbar.Item value="/notices" href="#notices">
            공지
          </Navbar.Item>
          <Navbar.Item value="/groups" href="#groups">
            그룹
          </Navbar.Item>
        </Navbar.Nav>
      </Navbar>
      <main className="flex flex-col gap-4 p-6">
        <Skeleton shape="text" lines={4} />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </main>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector<HTMLElement>('[data-navbar]');
    await expect(header).toHaveAttribute('data-sticky', '');
    await expect(getComputedStyle(header!).position).toBe('sticky');
  },
};
