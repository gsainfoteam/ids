import { useState } from 'react';

import {
  ChartBarIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Field as FormField } from '../../../react-hook-form';
import { Button } from '../../action/button';
import { Empty } from '../empty';

import { DataTable, useDataTable } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Member = { id: string; name: string; email: string; role: string; score: number };

type StoryArgs = Omit<DataTable.Props<Member>, 'table'>;

const variants = ['outline', 'striped', 'ghost'] as const;
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
const FEW_MEMBERS = MEMBERS.slice(0, 3);
const MANY_MEMBERS = members(42);
const NO_MEMBERS: Member[] = [];

const column = DataTable.createColumnHelper<Member>();

const columns = column.columns([
  column.accessor('name', { header: '이름' }),
  column.accessor('email', { header: '이메일', enableSorting: false }),
  column.accessor('role', { header: '역할' }),
  column.accessor('score', { header: '점수', meta: { align: 'end' } }),
]);

const iconColumns = column.columns([
  column.accessor('name', {
    header: () => (
      <>
        <UserIcon />
        이름
      </>
    ),
    meta: { label: '이름' },
  }),
  column.accessor('email', {
    header: () => (
      <>
        <EnvelopeIcon />
        이메일
      </>
    ),
    meta: { label: '이메일' },
    enableSorting: false,
  }),
  column.accessor('role', {
    header: () => (
      <>
        <ShieldCheckIcon />
        역할
      </>
    ),
    meta: { label: '역할' },
  }),
  column.accessor('score', {
    header: () => (
      <>
        <ChartBarIcon />
        점수
      </>
    ),
    meta: { label: '점수', align: 'end' },
  }),
]);

const rowId = (member: Member) => member.id;
const rowLabel = (member: Member) => member.name;

const byColumn =
  ([rule]: DataTable.SortingState) =>
  (a: Member, b: Member) => {
    if (!rule) return 0;
    const key = rule.id as keyof Member;
    const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
    return rule.desc ? -order : order;
  };

const meta = {
  title: 'Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    'aria-busy': { control: 'boolean' },
    value: { control: false },
    defaultValue: { control: false },
  },
  args: {
    'aria-label': '멤버',
    variant: 'outline',
    size: 'standard',
    'aria-busy': false,
  },
  render: function Render(args) {
    const table = useDataTable({
      data: MANY_MEMBERS,
      columns,
      getRowId: rowId,
      getRowLabel: rowLabel,
      sorting: {},
      selection: {},
      pagination: { defaultValue: { pageIndex: 0, pageSize: 5 } },
    });

    return <DataTable {...args} table={table} className="max-w-2xl" />;
  },
} satisfies Meta<typeof DataTable<Member>>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Playground: Story = {};

export const Usage: Story = {
  render: function Render() {
    const table = useDataTable({
      data: MEMBERS,
      columns,
      getRowId: (member) => member.id,
      sorting: {},
    });

    return <DataTable table={table} aria-label="멤버" className="max-w-2xl" />;
  },
};

export const Gallery: Story = {
  render: function Render() {
    const looks = useDataTable({
      data: FEW_MEMBERS,
      columns,
      getRowId: rowId,
      sorting: { defaultValue: [{ id: 'score', desc: true }] },
    });
    const selected = useDataTable({
      data: MANY_MEMBERS,
      columns,
      getRowId: rowId,
      getRowLabel: rowLabel,
      sorting: {},
      selection: {},
      pagination: { defaultValue: { pageIndex: 0, pageSize: 4 } },
    });
    const striped = useDataTable({
      data: MANY_MEMBERS,
      columns,
      getRowId: rowId,
      getRowLabel: rowLabel,
      sorting: {},
      selection: {},
      pagination: { defaultValue: { pageIndex: 0, pageSize: 4 } },
    });
    const withIcons = useDataTable({
      data: MEMBERS.slice(0, 4),
      columns: iconColumns,
      getRowId: rowId,
      getRowLabel: rowLabel,
      sorting: { defaultValue: [{ id: 'name', desc: false }] },
      selection: {},
    });
    const captioned = useDataTable({ data: FEW_MEMBERS, columns, getRowId: rowId });
    const empty = useDataTable({ data: NO_MEMBERS, columns });
    const reloading = useDataTable({ data: FEW_MEMBERS, columns, getRowId: rowId });
    const resizable = useDataTable({
      data: FEW_MEMBERS,
      columns,
      getRowId: rowId,
      sorting: {},
      columnSizing: {},
    });

    return (
      <Showcase>
        <Showcase.Section title="Variant × Size">
          <Showcase.Matrix
            rows={sizes}
            columns={variants}
            render={(size, variant) => (
              <DataTable
                table={looks}
                variant={variant}
                size={size}
                aria-label={`${variant} ${size}`}
                className="w-[26rem]"
              />
            )}
          />
        </Showcase.Section>

        <Showcase.Section title="Selection · Pagination">
          <Showcase.Row label="selection">
            <DataTable
              table={selected}
              defaultValue={{ m2: true, m3: true }}
              aria-label="선택과 페이지"
              className="w-[34rem]"
            />
          </Showcase.Row>
          <Showcase.Row label="striped tiny">
            <DataTable
              table={striped}
              defaultValue={{ m2: true }}
              variant="striped"
              size="tiny"
              aria-label="줄무늬"
              className="w-[34rem]"
            />
          </Showcase.Row>
          <Showcase.Row label="column icons">
            <DataTable table={withIcons} aria-label="머리글 아이콘" className="w-[34rem]" />
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section title="Parts">
          <Showcase.Row label="caption">
            <DataTable table={captioned} aria-label="캡션" className="w-[26rem]">
              <DataTable.Caption>3월 활동 점수</DataTable.Caption>
            </DataTable>
          </Showcase.Row>
          <Showcase.Row label="empty">
            <DataTable table={empty} aria-label="빈 표" className="w-[26rem]" />
          </Showcase.Row>
          <Showcase.Row label="aria-busy">
            <DataTable
              table={empty}
              aria-busy
              aria-label="처음 불러오는 표"
              className="w-[26rem]"
            />
            <DataTable
              table={reloading}
              aria-busy
              aria-label="다시 불러오는 표"
              className="w-[26rem]"
            />
          </Showcase.Row>
          <Showcase.Row label="columnSizing">
            <DataTable table={resizable} aria-label="열 너비 조절" className="w-[30rem]" />
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const SortByAColumn: Story = {
  render: function Render() {
    const table = useDataTable({
      data: MEMBERS,
      columns,
      getRowId: (member) => member.id,
      sorting: {},
    });

    return <DataTable table={table} aria-label="멤버" className="max-w-2xl" />;
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useDataTable` 에 `sorting` 을 주면 정렬할 수 있는 열의 머리글이 버튼이 됩니다. 누를 때마다 방향이 바뀌고 세 번째에 정렬이 풀립니다. 글자 열은 오름차순, 숫자 열은 내림차순부터 시작합니다(열의 `sortDescFirst` 로 바꿉니다). 정렬된 열의 `th` 에 `aria-sort` 가 붙고, Shift 를 누른 채 누르면 여러 열로 정렬합니다. 열에 `enableSorting: false` 를 주면 버튼이 없습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const score = () => canvas.getByRole('columnheader', { name: '점수' });
    await expect(score()).not.toHaveAttribute('aria-sort');
    await expect(canvas.queryByRole('button', { name: '이메일' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: '점수' }));
    await expect(score()).toHaveAttribute('aria-sort', 'descending');
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

export const SelectRows: Story = {
  render: function Render() {
    const table = useDataTable({
      data: MEMBERS,
      columns,
      getRowId: (member) => member.id,
      getRowLabel: (member) => member.name,
      selection: {},
    });

    return <DataTable table={table} aria-label="멤버" className="max-w-2xl" />;
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useDataTable` 에 `selection` 을 주면 맨 앞에 체크박스 열을 붙이고, 표 아래 줄에 고른 수를 적습니다. 고른 행은 root 의 `value` / `defaultValue` / `onValueChange` 입니다. 머리글 체크박스는 모든 행을 고르고, 일부만 골랐으면 `indeterminate` 입니다. Shift 를 누른 채 누르면 마지막으로 누른 행부터 범위를 고릅니다. 체크박스 이름은 `getRowLabel` 로 정합니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const all = () => canvas.getByRole('checkbox', { name: '모든 행 선택' });

    await userEvent.click(canvas.getByRole('checkbox', { name: '이영희 선택' }));
    await expect(all()).toHaveProperty('indeterminate', true);
    await expect(canvas.getByRole('row', { name: /이영희/ })).toHaveAttribute('data-selected');
    await expect(canvas.getByText('1개 선택됨')).toBeVisible();

    await userEvent.click(all());
    await expect(all()).toBeChecked();
    await expect(canvas.getByText('8개 선택됨')).toBeVisible();

    await userEvent.click(all());
    await expect(all()).not.toBeChecked();
    await expect(canvas.getByText('0개 선택됨')).toBeVisible();
  },
};

export const ActOnTheSelectedRows: Story = {
  render: function Render() {
    const [data, setData] = useState(MEMBERS);
    const [selection, setSelection] = useState<DataTable.RowSelectionState>({});
    const table = useDataTable({
      data,
      columns,
      getRowId: (member) => member.id,
      getRowLabel: (member) => member.name,
      sorting: {},
      selection: {},
    });
    const chosen = table.getSelectedRowModel().rows.length;

    return (
      <DataTable
        table={table}
        value={selection}
        onValueChange={setSelection}
        aria-label="멤버"
        className="max-w-2xl"
      >
        <DataTable.Toolbar>
          <Button
            variant="soft"
            colorScheme="danger"
            size="tiny"
            disabled={chosen === 0}
            className="ms-auto"
            onClick={() => {
              setData(data.filter((member) => !selection[member.id]));
              setSelection({});
            }}
          >
            <TrashIcon />
            {chosen}명 내보내기
          </Button>
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`DataTable.Toolbar` 는 표 위나 아래의 줄입니다. 선택이 켜져 있으면 고른 수를 앞에 적고, 그 뒤에 children 을 둡니다. 고른 행은 root 의 `value` 와 `onValueChange` 로 앱이 가지고, `useDataTable` 이 돌려준 TanStack 표의 `getSelectedRowModel()` 로도 읽습니다. part 를 쓰면 그 순서대로 그리므로 `DataTable.Content` 도 적습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: '0명 내보내기' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('checkbox', { name: '김철수 선택' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: '이영희 선택' }));
    await userEvent.click(canvas.getByRole('button', { name: '2명 내보내기' }));

    await expect(canvas.getAllByRole('row')).toHaveLength(MEMBERS.length - 1);
    await expect(canvas.queryByRole('row', { name: /이영희/ })).toBeNull();
    await expect(canvas.getByText('0개 선택됨')).toBeVisible();
  },
};

export const ChooseRowsInAForm: Story = {
  render: function Render() {
    const [result, setResult] = useState('');
    const methods = useForm<{ invitees: DataTable.RowSelectionState }>({
      defaultValues: { invitees: { m2: true } },
    });
    const table = useDataTable({
      data: MEMBERS,
      columns,
      getRowId: (member) => member.id,
      getRowLabel: (member) => member.name,
      selection: {},
    });

    return (
      <FormProvider {...methods}>
        <form
          className="flex max-w-2xl flex-col gap-3"
          onSubmit={methods.handleSubmit((data) =>
            setResult(`초대: ${Object.keys(data.invitees).join(', ')}`),
          )}
        >
          <FormField name="invitees" controlMode="value">
            <FormField.Label>초대할 멤버</FormField.Label>
            <DataTable table={table} />
          </FormField>
          <div className="flex items-center gap-3">
            <Button type="submit">초대하기</Button>
            <output className="text-body-b3-regular">{result}</output>
          </div>
        </form>
      </FormProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '고른 행은 root 의 `value` / `onValueChange` 라 react-hook-form 의 `Field controlMode="value"` 가 다른 입력처럼 묶습니다. `useController` 를 따로 쓰지 않아도 되고, `reset()` 과 `defaultValues` 도 표에 그대로 보입니다. TanStack Form 의 `Field` 도 같습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('checkbox', { name: '이영희 선택' })).toBeChecked();

    await userEvent.click(canvas.getByRole('checkbox', { name: '박민수 선택' }));
    await userEvent.click(canvas.getByRole('button', { name: '초대하기' }));
    await expect(canvas.getByText('초대: m2, m3')).toBeVisible();
  },
};

export const PageThroughManyRows: Story = {
  render: function Render() {
    const table = useDataTable({
      data: MANY_MEMBERS,
      columns,
      getRowId: (member) => member.id,
      pagination: { defaultValue: { pageIndex: 0, pageSize: 5 } },
    });

    return <DataTable table={table} aria-label="멤버" className="max-w-2xl" />;
  },
  parameters: {
    docs: {
      description: {
        story:
          '`pagination` 은 표 아래 줄에 페이지 이동 버튼을 붙입니다(기본 10행씩). 바닥글은 IDS `Pagination` 에 `Pagination.First`, `Pagination.Last` 를 더해 짭니다. 끝에 닿은 버튼은 포커스를 잃지 않게 `aria-disabled` 로 꺼집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const pages = canvas.getByRole('navigation', { name: '페이지 탐색' });
    await expect(pages).toHaveTextContent('1 / 9 페이지');
    await expect(canvas.getByRole('button', { name: '이전 페이지' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await expect(canvas.getAllByRole('row')).toHaveLength(6);

    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(pages).toHaveTextContent('2 / 9 페이지');

    await userEvent.click(canvas.getByRole('button', { name: '마지막 페이지' }));
    await expect(pages).toHaveTextContent('9 / 9 페이지');
    await expect(canvas.getAllByRole('row')).toHaveLength(3);
    await expect(canvas.getByRole('button', { name: '마지막 페이지' })).toHaveFocus();
  },
};

export const ResizeColumns: Story = {
  render: function Render() {
    const table = useDataTable({
      data: MEMBERS,
      columns,
      getRowId: (member) => member.id,
      columnSizing: {},
    });

    return <DataTable table={table} aria-label="멤버" className="max-w-2xl" />;
  },
  parameters: {
    docs: {
      description: {
        story:
          '`columnSizing` 은 머리글 끝에 너비 핸들을 붙입니다. 끌거나, 포커스한 뒤 `←` `→`(Shift 로 크게), `Home` `End` 로 바꾸고, 두 번 누르거나 `Enter` 로 되돌립니다. 표는 `table-layout: fixed` 가 됩니다. 너비를 저장하려면 `columnSizing` 에 `value` 와 `onValueChange` 를 줍니다.',
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

export const DescribeTheTableWithACaption: Story = {
  render: function Render() {
    const table = useDataTable({ data: FEW_MEMBERS, columns, getRowId: (member) => member.id });

    return (
      <DataTable table={table} className="max-w-2xl">
        <DataTable.Caption>3월 활동 점수</DataTable.Caption>
      </DataTable>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`DataTable.Caption` 은 `<caption>` 으로 표 아래에 붙고 표의 접근성 이름이 됩니다. 그러면 `aria-label` 이 따로 없어도 됩니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: '3월 활동 점수' })).toBeVisible();
  },
};

export const ShowLoadingAndEmptyStates: Story = {
  render: function Render() {
    const [data, setData] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const table = useDataTable({ data, columns, getRowId: (member) => member.id });

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
        <DataTable table={table} aria-busy={loading} aria-label="멤버">
          <DataTable.Empty>
            <Empty variant="soft" size="tiny">
              <Empty.Media>
                <UserIcon />
              </Empty.Media>
              <Empty.Title>아직 멤버가 없습니다</Empty.Title>
              <Empty.Description>초대해서 시작하세요.</Empty.Description>
            </Empty>
          </DataTable.Empty>
        </DataTable>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '행이 없으면 `DataTable.Empty` 를 모든 열을 가로지르는 한 칸에 그립니다(기본 "데이터가 없습니다."). 글자나 `Empty` 컴포넌트를 children 으로 줍니다. `aria-busy` 를 주면 `<table>` 에 그대로 붙고, 행이 없으면 그 칸에, 있으면 표 위에 Spinner 를 겹칩니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('아직 멤버가 없습니다')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: '로딩 켜기' }));
    await expect(canvas.getByRole('table', { name: '멤버' })).toHaveAttribute('aria-busy', 'true');

    await userEvent.click(canvas.getByRole('button', { name: '불러오기' }));
    await expect(canvas.getAllByRole('row')).toHaveLength(MEMBERS.length + 1);
    await userEvent.click(canvas.getByRole('button', { name: '로딩 끄기' }));
    await expect(canvas.getByRole('table', { name: '멤버' })).not.toHaveAttribute('aria-busy');
  },
};

export const SortAndPageOnTheServer: Story = {
  render: function Render() {
    const [pagination, setPagination] = useState<DataTable.PaginationState>({
      pageIndex: 0,
      pageSize: 5,
    });
    const [sorting, setSorting] = useState<DataTable.SortingState>([]);

    const start = pagination.pageIndex * pagination.pageSize;
    const page = [...MANY_MEMBERS]
      .sort(byColumn(sorting))
      .slice(start, start + pagination.pageSize);

    const table = useDataTable({
      data: page,
      columns,
      getRowId: (member) => member.id,
      sorting: { manual: true, value: sorting, onValueChange: setSorting },
      pagination: {
        manual: true,
        rowCount: MANY_MEMBERS.length,
        value: pagination,
        onValueChange: setPagination,
      },
    });

    return <DataTable table={table} aria-label="서버 멤버" className="max-w-2xl" />;
  },
  parameters: {
    docs: {
      description: {
        story:
          '서버가 정렬하고 자르는 데이터는 `sorting` 과 `pagination` 에 `manual: true` 를, `pagination` 에 전체 개수 `rowCount` 를 줍니다. DataTable 은 받은 행을 그대로 그리고, 상태는 `value` / `onValueChange` 로 앱이 가집니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const pages = canvas.getByRole('navigation', { name: '페이지 탐색' });
    await expect(pages).toHaveTextContent('1 / 9 페이지');
    await userEvent.click(canvas.getByRole('button', { name: '다음 페이지' }));
    await expect(pages).toHaveTextContent('2 / 9 페이지');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('한가람');
  },
};
