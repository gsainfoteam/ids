import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { DataTable } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Member = { id: string; name: string; email: string; role: string; score: number };

const variants = ['outline', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const NAMES = ['김철수', '이영희', '박민수', '최지은', '정우성', '한가람', '오세훈', '서지우'];
const ROLES = ['관리자', '멤버', '게스트'];

const members = (count: number): Member[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m${index + 1}`,
    name: `${NAMES[index % NAMES.length]}${index >= NAMES.length ? ` ${Math.floor(index / NAMES.length) + 1}` : ''}`,
    email: `user${index + 1}@example.com`,
    role: ROLES[index % ROLES.length],
    score: (index * 37 + 11) % 100,
  }));

const MEMBERS = members(8);
const MANY_MEMBERS = members(42);
const NO_MEMBERS: Member[] = [];

const column = DataTable.createColumnHelper<Member>();

const columns = column.columns([
  column.accessor('name', { header: '이름' }),
  column.accessor('email', { header: '이메일', enableSorting: false }),
  column.accessor('role', { header: '역할' }),
  column.accessor('score', { header: '점수', meta: { align: 'end' } }),
]);

const rowId = (member: Member) => member.id;
const rowLabel = (member: Member) => member.name;

const meta = {
  title: 'Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    striped: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    highlightOnHover: { control: 'boolean' },
    enableSorting: { control: 'boolean' },
    enableRowSelection: { control: 'boolean' },
    enablePagination: { control: 'boolean' },
    enableColumnResizing: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    columns,
    data: MEMBERS,
    getRowId: rowId,
    getRowLabel: rowLabel,
    'aria-label': '멤버',
    variant: 'outline',
    size: 'standard',
  },
  render: (args) => <DataTable {...args} className="max-w-2xl" />,
} satisfies Meta<typeof DataTable<Member>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <DataTable
              columns={columns}
              data={MEMBERS.slice(0, 3)}
              getRowId={rowId}
              getRowLabel={rowLabel}
              variant={variant}
              size={size}
              defaultSorting={[{ id: 'score', desc: true }]}
              aria-label={`${variant} ${size}`}
              className="w-[26rem]"
            />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Selection · Pagination">
        <Showcase.Row>
          <DataTable
            columns={columns}
            data={MANY_MEMBERS}
            getRowId={rowId}
            getRowLabel={rowLabel}
            enableRowSelection
            defaultRowSelection={{ m2: true, m3: true }}
            enablePagination
            defaultPagination={{ pageIndex: 0, pageSize: 4 }}
            striped
            aria-label="선택과 페이지"
            className="w-[30rem]"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty">
          <DataTable columns={columns} data={NO_MEMBERS} aria-label="빈 표" className="w-[26rem]" />
        </Showcase.Row>
        <Showcase.Row label="loading">
          <DataTable
            columns={columns}
            data={NO_MEMBERS}
            loading
            aria-label="처음 불러오는 표"
            className="w-[26rem]"
          />
          <DataTable
            columns={columns}
            data={MEMBERS.slice(0, 3)}
            getRowId={rowId}
            loading
            aria-label="다시 불러오는 표"
            className="w-[26rem]"
          />
        </Showcase.Row>
        <Showcase.Row label="resizable">
          <DataTable
            columns={columns}
            data={MEMBERS.slice(0, 3)}
            getRowId={rowId}
            enableColumnResizing
            aria-label="열 너비 조절"
            className="w-[30rem]"
          />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Sorting: Story = {
  args: { onSortingChange: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '정렬할 수 있는 열의 머리글은 버튼입니다. 누를 때마다 정렬 방향이 바뀌고 세 번째에 정렬이 풀립니다. 글자 열은 오름차순, 숫자 열은 내림차순부터 시작합니다(TanStack 기본값, 열의 `sortDescFirst` 로 바꿉니다). 정렬된 열의 `th` 에 `aria-sort` 가 붙습니다. Shift 를 누른 채 누르면 여러 열로 정렬합니다. 열에 `enableSorting: false` 를 주면 버튼이 없습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const score = () => canvas.getByRole('columnheader', { name: '점수' });
    await expect(score()).not.toHaveAttribute('aria-sort');
    await expect(canvas.queryByRole('button', { name: '이메일' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: '점수' }));
    await expect(score()).toHaveAttribute('aria-sort', 'descending');
    await expect(args.onSortingChange).toHaveBeenLastCalledWith([{ id: 'score', desc: true }]);
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent(/96$/);

    await userEvent.click(canvas.getByRole('button', { name: '점수' }));
    await expect(score()).toHaveAttribute('aria-sort', 'ascending');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent(/11$/);

    await userEvent.click(canvas.getByRole('button', { name: '이름' }));
    await expect(canvas.getByRole('columnheader', { name: '이름' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await expect(score()).not.toHaveAttribute('aria-sort');
  },
};

export const RowSelection: Story = {
  args: { enableRowSelection: true, onRowSelectionChange: fn() },
  parameters: {
    docs: {
      description: {
        story:
          '`enableRowSelection` 은 맨 앞에 체크박스 열을 붙입니다. 머리글 체크박스는 모든 행을 고르고, 일부만 골랐으면 `indeterminate` 입니다. Shift 를 누른 채 누르면 마지막으로 누른 행부터 범위를 고릅니다. 체크박스 이름은 `getRowLabel` 로 정합니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const all = () => canvas.getByRole('checkbox', { name: '모든 행 선택' });

    await userEvent.click(canvas.getByRole('checkbox', { name: '이영희 선택' }));
    await expect(args.onRowSelectionChange).toHaveBeenLastCalledWith({ m2: true });
    await expect(all()).toHaveProperty('indeterminate', true);
    await expect(canvas.getByRole('row', { name: /이영희/ })).toHaveAttribute('data-selected');
    await expect(canvas.getByText('1개 선택됨')).toBeVisible();

    await userEvent.click(all());
    await expect(all()).toBeChecked();
    await expect(canvas.getByText('8개 선택됨')).toBeVisible();

    await userEvent.click(all());
    await expect(all()).not.toBeChecked();
    await expect(args.onRowSelectionChange).toHaveBeenLastCalledWith({});
  },
};

export const Pagination: Story = {
  args: {
    data: MANY_MEMBERS,
    enablePagination: true,
    defaultPagination: { pageIndex: 0, pageSize: 5 },
    onPaginationChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          '`enablePagination` 은 아래에 페이지 이동 버튼을 붙입니다. 끝에 닿은 버튼은 포커스를 잃지 않게 `aria-disabled` 로 꺼집니다. 이 바닥글은 Pagination 컴포넌트가 나오면 그것으로 바꿀 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const pages = canvas.getByRole('navigation', { name: '페이지 이동' });
    await expect(pages).toHaveTextContent('1 / 9 페이지');
    await expect(canvas.getByRole('button', { name: '이전 페이지' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await expect(canvas.getAllByRole('row')).toHaveLength(6);

    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(args.onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 5 });
    await expect(pages).toHaveTextContent('2 / 9 페이지');

    await userEvent.click(canvas.getByRole('button', { name: '마지막 페이지' }));
    await expect(pages).toHaveTextContent('9 / 9 페이지');
    await expect(canvas.getAllByRole('row')).toHaveLength(3);
    await expect(canvas.getByRole('button', { name: '마지막 페이지' })).toHaveFocus();
  },
};

export const ColumnResizing: Story = {
  args: { enableColumnResizing: true },
  parameters: {
    docs: {
      description: {
        story:
          '`enableColumnResizing` 은 머리글 끝에 너비 핸들을 붙입니다. 끌거나, 포커스한 뒤 `←` `→`(Shift 로 크게), `Home` `End` 로 바꾸고, 두 번 누르거나 `Enter` 로 되돌립니다. 표는 `table-layout: fixed` 가 됩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const handle = canvas.getByRole('separator', { name: '이름 열 너비' });
    const before = Number(handle.getAttribute('aria-valuenow'));
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(canvas.getByRole('separator', { name: '이름 열 너비' })).toHaveAttribute(
        'aria-valuenow',
        String(before + 16),
      ),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('separator', { name: '이름 열 너비' })).toHaveAttribute(
        'aria-valuenow',
        String(before),
      ),
    );
  },
};

export const LoadingAndEmpty: Story = {
  render: function Render() {
    const [data, setData] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);

    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setData(MEMBERS)}>
            불러오기
          </Button>
          <Button variant="outline" onClick={() => setLoading((value) => !value)}>
            {loading ? '로딩 끄기' : '로딩 켜기'}
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={data}
          getRowId={rowId}
          loading={loading}
          empty="아직 멤버가 없습니다. 초대해서 시작하세요."
          aria-label="멤버"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '행이 없으면 `empty` 를 한 칸짜리 행에 보여 줍니다(기본 "데이터가 없습니다."). `loading` 이면 표에 `aria-busy` 가 붙고, 행이 없으면 그 칸에, 있으면 표 위에 Spinner 를 겹칩니다. Empty 컴포넌트가 나오면 `empty` 에 그대로 넣을 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('아직 멤버가 없습니다. 초대해서 시작하세요.')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: '로딩 켜기' }));
    await expect(canvas.getByRole('table', { name: '멤버' })).toHaveAttribute('aria-busy', 'true');

    await userEvent.click(canvas.getByRole('button', { name: '불러오기' }));
    await expect(canvas.getAllByRole('row')).toHaveLength(MEMBERS.length + 1);
    await userEvent.click(canvas.getByRole('button', { name: '로딩 끄기' }));
    await expect(canvas.getByRole('table', { name: '멤버' })).not.toHaveAttribute('aria-busy');
  },
};

export const ServerSide: Story = {
  render: function Render() {
    const [pagination, setPagination] = useState<DataTable.Pagination>({
      pageIndex: 0,
      pageSize: 5,
    });
    const [sorting, setSorting] = useState<DataTable.Sorting>([]);

    const sorted = [...MANY_MEMBERS].sort((a, b) => {
      const [rule] = sorting;
      if (!rule) return 0;
      const key = rule.id as keyof Member;
      const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
      return rule.desc ? -order : order;
    });
    const start = pagination.pageIndex * pagination.pageSize;

    return (
      <DataTable
        columns={columns}
        data={sorted.slice(start, start + pagination.pageSize)}
        getRowId={rowId}
        manualSorting
        sorting={sorting}
        onSortingChange={setSorting}
        enablePagination
        manualPagination
        rowCount={MANY_MEMBERS.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        aria-label="서버 멤버"
        className="max-w-2xl"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '서버가 정렬하고 자르는 데이터는 `manualSorting`, `manualPagination` 과 전체 개수 `rowCount` 를 줍니다. DataTable 은 받은 행을 그대로 그리고, 상태는 `sorting` / `pagination` 과 그 콜백으로 앱이 가집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const pages = canvas.getByRole('navigation', { name: '페이지 이동' });
    await expect(pages).toHaveTextContent('1 / 9 페이지');
    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(pages).toHaveTextContent('2 / 9 페이지');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('한가람');
  },
};
