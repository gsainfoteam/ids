import { useState, type ComponentProps } from 'react';

import { FolderIcon, HomeIcon } from '@heroicons/react/16/solid';
import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Breadcrumb } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: sizes },
    maxItems: { control: { type: 'number', min: 1 } },
  },
  args: {
    size: 'standard',
  },
  render: (args) => (
    <Breadcrumb {...args}>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#products">상품</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#electronics">전자제품</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Page>노트북</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb>
  ),
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

function RouterLink({
  to,
  onNavigate,
  onClick,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { to: string; onNavigate: (to: string) => void }) {
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        onNavigate(to);
      }}
    />
  );
}

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Size"
        description="size는 글자 크기, 아이콘, 간격을 함께 바꿉니다. 현재 페이지는 한 단계 굵게 씁니다."
      >
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            <Breadcrumb size={size} aria-label={`${size} 경로`}>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#products">상품</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>노트북</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Separator"
        description="구분자는 기본이 chevron이고, separator로 글자나 아이콘을 줍니다. 스크린 리더는 읽지 않습니다."
      >
        <Showcase.Row label="chevron">
          <Breadcrumb aria-label="chevron 구분자">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>설정</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Showcase.Row>
        <Showcase.Row label="/">
          <Breadcrumb separator="/" aria-label="빗금 구분자">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>설정</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Showcase.Row>
        <Showcase.Row label="|">
          <Breadcrumb separator="|" aria-label="세로선 구분자">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>설정</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Composition"
        description="긴 경로는 가운데를 Ellipsis 메뉴로 접습니다. 아이콘은 링크 안에 글자와 함께 씁니다."
      >
        <Showcase.Row label="maxItems=3">
          <Breadcrumb maxItems={3} aria-label="접힌 경로">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#docs">문서</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#components">컴포넌트</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#navigation">내비게이션</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Showcase.Row>
        <Showcase.Row label="icons">
          <Breadcrumb aria-label="아이콘 경로">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">
                <HomeIcon aria-hidden="true" />홈
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#files">
                <FolderIcon aria-hidden="true" />
                파일
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>보고서.pdf</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl">
            <Breadcrumb aria-label="오른쪽에서 왼쪽 경로">
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#products">상품</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>노트북</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const RouterLinks: Story = {
  render: function Render() {
    const [path, setPath] = useState('/products/electronics');

    return (
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild>
              <RouterLink to="/" onNavigate={setPath}>
                홈
              </RouterLink>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild>
              <RouterLink to="/products" onNavigate={setPath}>
                상품
              </RouterLink>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>전자제품</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb>
        <p className="text-body-b3-regular">현재 경로: {path}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '라우터의 Link는 asChild로 감쌉니다. Breadcrumb.Link의 스타일과 속성이 Link가 그리는 <a>에 붙고, 이동은 라우터가 맡습니다. 여기서는 onNavigate로 흉내 낸 Link를 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const products = canvas.getByRole('link', { name: '상품' });
    await expect(products).toHaveAttribute('href', '/products');
    await expect(products).toHaveAttribute('data-breadcrumb-link');
    await userEvent.click(products);
    await waitFor(() => expect(canvas.getByText('현재 경로: /products')).toBeInTheDocument());
    await expect(canvas.getByText('전자제품')).toHaveAttribute('aria-current', 'page');
  },
};

export const MaxItems: Story = {
  render: () => (
    <Breadcrumb maxItems={3}>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#docs">문서</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#components">컴포넌트</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#navigation">내비게이션</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '항목이 maxItems보다 많으면 첫 항목과 마지막 maxItems - 1개만 남기고 가운데를 Ellipsis 메뉴로 접습니다. 메뉴는 Enter나 Space로 열고 화살표로 오갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole('link', { name: '문서' })).not.toBeInTheDocument();
    canvas.getByRole('button', { name: '숨은 경로 보기' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: '문서' })).toHaveFocus());
    await expect(canvas.getByRole('menuitem', { name: '문서' })).toHaveAttribute('href', '#docs');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: '컴포넌트' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: '숨은 경로 보기' })).toHaveFocus(),
    );
  },
};

export const Ellipsis: Story = {
  render: function Render() {
    const [path, setPath] = useState('/docs/components/navigation');

    return (
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild>
              <RouterLink to="/" onNavigate={setPath}>
                홈
              </RouterLink>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Ellipsis>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild>
                <RouterLink to="/docs" onNavigate={setPath}>
                  문서
                </RouterLink>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild>
                <RouterLink to="/docs/components" onNavigate={setPath}>
                  컴포넌트
                </RouterLink>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.Ellipsis>
          <Breadcrumb.Item>
            <Breadcrumb.Page>내비게이션</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb>
        <p className="text-body-b3-regular">현재 경로: {path}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumb.Ellipsis 안에 접을 항목을 직접 씁니다. 메뉴 안의 링크도 asChild로 감싼 라우터 Link이고, 고르면 메뉴가 닫힙니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '숨은 경로 보기' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: '컴포넌트' }));
    await waitFor(() =>
      expect(canvas.getByText('현재 경로: /docs/components')).toBeInTheDocument(),
    );
    await waitFor(() => expect(canvas.queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator>/</Breadcrumb.Separator>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#settings">설정</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator>·</Breadcrumb.Separator>
        <Breadcrumb.Item>
          <Breadcrumb.Page>알림</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumb.Separator를 하나라도 직접 쓰면 자동 구분자는 빠지고 쓴 자리에만 구분자가 섭니다. 모든 구분자를 같은 모양으로 바꿀 때는 Breadcrumb의 separator가 더 짧습니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const separators = canvasElement.querySelectorAll('[data-breadcrumb-separator]');
    await expect([...separators].map((separator) => separator.textContent)).toEqual(['/', '·']);
    separators.forEach((separator) => expect(separator).toHaveAttribute('aria-hidden', 'true'));
  },
};
