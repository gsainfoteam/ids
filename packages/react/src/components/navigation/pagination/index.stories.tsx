import { useState } from 'react';

import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/16/solid';
import { expect, fn } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Pagination } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['solid', 'soft', 'outline', 'ghost', 'glossy'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    pageCount: { control: { type: 'number', min: 0 } },
    defaultPage: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0 } },
    boundaryCount: { control: { type: 'number', min: 0 } },
    size: { control: 'radio', options: sizes },
    variant: { control: 'radio', options: variants },
    disabled: { control: 'boolean' },
  },
  args: {
    pageCount: 20,
    defaultPage: 7,
    siblingCount: 1,
    boundaryCount: 1,
    size: 'standard',
    variant: 'solid',
    disabled: false,
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Variant × Size"
        description="variant 는 현재 페이지에만 입힙니다. 다른 페이지와 이전, 다음은 ghost 입니다."
      >
        <Showcase.Matrix
          rows={variants}
          columns={sizes}
          render={(variant, size) => (
            <Pagination defaultPage={3} pageCount={5} variant={variant} size={size} />
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Range"
        description="페이지가 칸보다 많으면 먼 쪽을 생략합니다. 칸 수는 boundaryCount × 2 + siblingCount × 2 + 3 으로 늘 같아서 페이지를 옮겨도 폭이 흔들리지 않습니다."
      >
        <Showcase.Row label="all fit">
          <Pagination defaultPage={4} pageCount={7} />
        </Showcase.Row>
        <Showcase.Row label="start">
          <Pagination defaultPage={2} pageCount={20} />
        </Showcase.Row>
        <Showcase.Row label="middle">
          <Pagination defaultPage={10} pageCount={20} />
        </Showcase.Row>
        <Showcase.Row label="end">
          <Pagination defaultPage={19} pageCount={20} />
        </Showcase.Row>
        <Showcase.Row label="siblingCount 2">
          <Pagination defaultPage={10} pageCount={20} siblingCount={2} />
        </Showcase.Row>
        <Showcase.Row label="boundaryCount 2">
          <Pagination defaultPage={10} pageCount={20} boundaryCount={2} />
        </Showcase.Row>
        <Showcase.Row label="boundaryCount 0">
          <Pagination defaultPage={10} pageCount={20} boundaryCount={0} />
        </Showcase.Row>
        <Showcase.Row label="large pages">
          <Pagination defaultPage={1204} pageCount={1250} />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="first page">
          <Pagination defaultPage={1} pageCount={5} />
        </Showcase.Row>
        <Showcase.Row label="last page">
          <Pagination defaultPage={5} pageCount={5} />
        </Showcase.Row>
        <Showcase.Row label="one page">
          <Pagination defaultPage={1} pageCount={1} />
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Pagination defaultPage={3} pageCount={5} disabled />
        </Showcase.Row>
        <Showcase.Row label="links">
          <Pagination defaultPage={3} pageCount={5} getHref={(page) => `#page-${page}`} />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [page, setPage] = useState(1);
    return (
      <div className="flex flex-col items-start gap-3">
        <Pagination page={page} pageCount={12} onPageChange={setPage} />
        <p className="text-body-b3-regular text-(--ids-color-on-muted)">12페이지 중 {page}페이지</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`page` 와 `onPageChange` 로 제어합니다. 목록을 불러오는 쿼리의 페이지 상태를 그대로 넘기면 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(canvas.getByText('12페이지 중 2페이지')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '12페이지' }));
    await expect(canvas.getByText('12페이지 중 12페이지')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
  },
};

export const Keyboard: Story = {
  args: { defaultPage: 5, pageCount: 10 },
  parameters: {
    docs: {
      description: {
        story:
          '버튼마다 Tab 이 멈춥니다. 안에 포커스가 있을 때 `←` `→` 는 이전과 다음 페이지로, `Home` `End` 는 첫 페이지와 마지막 페이지로 옮깁니다. 페이지 번호에서 누르면 포커스가 새 현재 페이지를 따라가고, 이전과 다음에서 누르면 그 버튼에 남습니다. 오른쪽에서 왼쪽으로 쓰는 화면에서는 `←` 와 `→` 가 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '5페이지' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(6);
    await expect(canvas.getByRole('button', { name: '6페이지' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: '10페이지' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('button', { name: '1페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

export const Links: Story = {
  render: () => <Pagination defaultPage={3} pageCount={10} getHref={(page) => `#page-${page}`} />,
  parameters: {
    docs: {
      description: {
        story:
          '`getHref` 를 주면 페이지마다 `<a href>` 를 그립니다. 서버가 그린 HTML 에도 주소가 있어 새 탭으로 열거나 검색 엔진이 따라갈 수 있습니다. 끝에 닿은 이전, 다음은 `href` 를 떼고 `aria-disabled` 가 됩니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: '3페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('link', { name: '4페이지' })).toHaveAttribute('href', '#page-4');
    await expect(canvas.getByRole('link', { name: '다음 페이지' })).toHaveAttribute(
      'href',
      '#page-4',
    );
  },
};

export const RouterLink: Story = {
  render: function Render() {
    const [page, setPage] = useState(4);
    return (
      <Pagination page={page} pageCount={10} onPageChange={setPage}>
        <Pagination.List>
          {(entry) => {
            if (entry.type === 'ellipsis') return <Pagination.Ellipsis />;
            const link = <a href={`#posts?page=${entry.page}`} />;
            if (entry.type === 'previous')
              return <Pagination.Previous asChild>{link}</Pagination.Previous>;
            if (entry.type === 'next') return <Pagination.Next asChild>{link}</Pagination.Next>;
            return (
              <Pagination.Link page={entry.page} asChild>
                {link}
              </Pagination.Link>
            );
          }}
        </Pagination.List>
      </Pagination>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '라우터의 `Link` 는 `asChild` 로 감쌉니다. `Pagination.List` 에 함수를 넘기면 이전, 페이지, 생략, 다음을 차례로 받으니, 받은 `entry.page` 로 주소를 만들어 Next.js 나 TanStack Router 의 `Link` 를 돌려주면 됩니다. 이 예시는 `<a>` 로 대신합니다. 비워 둔 자식에는 페이지 번호와 화살표를 채워 줍니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const four = canvas.getByRole('link', { name: '4페이지' });
    await expect(four).toHaveTextContent('4');
    await expect(four).toHaveAttribute('href', '#posts?page=4');
    await userEvent.click(canvas.getByRole('link', { name: '다음 페이지' }));
    await expect(canvas.getByRole('link', { name: '5페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

export const Composition: Story = {
  render: () => (
    <Pagination defaultPage={2} pageCount={3} variant="outline">
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous icon={<ArrowLongLeftIcon aria-hidden="true" />} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={1} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={2} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={3} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next icon={<ArrowLongRightIcon aria-hidden="true" />} />
        </Pagination.Item>
      </Pagination.List>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '자식을 직접 쓰면 원하는 파트만 원하는 순서로 놓습니다. 이 경우 생략은 계산하지 않습니다. `Pagination.Previous`, `Pagination.Next` 의 `icon` 으로 화살표를 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(canvas.getByRole('button', { name: '3페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
  },
};
