# DataTable

정렬, 행 선택, 페이지, 열 너비 조절, 빈 상태와 로딩을 갖춘 데이터 표입니다. 로직은 [TanStack Table v9](https://tanstack.com/table)(`@tanstack/react-table`)이 맡고, 모양은 IDS `Table` 파트가 그립니다.

- **TanStack 그대로.** `columns` 와 `data` 를 받고, 열 정의, 상태 모양(`SortingState`, `RowSelectionState`, `PaginationState`), 옵션 이름(`enableSorting`, `manualPagination`, `getRowId`)이 TanStack 과 같습니다.
- **기능은 켜는 것만.** 정렬은 기본으로 켜져 있고, 선택(`enableRowSelection`), 페이지(`enablePagination`), 열 너비(`enableColumnResizing`)는 켤 때만 붙습니다.
- **접근성.** 정렬 머리글은 버튼이고 `th` 에 `aria-sort`, 선택은 이름 있는 체크박스, 너비 핸들은 키보드로 움직이는 `separator`, 로딩은 `aria-busy` 입니다.
- **Table 의 모양.** `variant`, `size`, `striped`, `highlightOnHover`, `stickyHeader` 는 `Table` 과 같습니다.

```tsx
import { DataTable } from '@gsainfoteam/ids-react';

type Member = { id: string; name: string; email: string; score: number };

const column = DataTable.createColumnHelper<Member>();

const columns = column.columns([
  column.accessor('name', { header: '이름' }),
  column.accessor('email', { header: '이메일', enableSorting: false }),
  column.accessor('score', { header: '점수', meta: { align: 'end' } }),
]);

<DataTable
  columns={columns}
  data={members}
  getRowId={(member) => member.id}
  aria-label="멤버"
/>;
```

- `columns` 와 `data` 는 렌더마다 새로 만들지 않습니다. 모듈 위나 `useMemo`, 상태에 둡니다. 새 배열이 오면 TanStack 이 모든 행을 다시 계산합니다.
- `getRowId` 를 주면 선택 상태의 키가 행 번호 대신 그 id 가 됩니다. 정렬이나 페이지가 바뀌어도 선택이 행을 따라갑니다.

## 열 정의

```tsx
const column = DataTable.createColumnHelper<Member>();   // TanStack 의 createColumnHelper<DataTable.Features, Member>()

column.accessor('score', {
  header: '점수',                         // 글자 또는 ({ column }) => ReactNode
  cell: ({ getValue }) => `${getValue()}점`,
  meta: { align: 'end', label: '점수' },   // IDS 가 읽는 meta
  enableSorting: false,                   // 이 열은 정렬하지 않는다
  sortDescFirst: false,                   // 처음 누를 때 오름차순
  size: 120, minSize: 80, maxSize: 240,   // 열 너비 조절에서 쓰는 px
});

column.display({ id: 'actions', header: '', cell: ({ row }) => <Menu>...</Menu> });
```

| `meta`  | 뜻                                                                             |
| ------- | ------------------------------------------------------------------------------ |
| `align` | 머리글과 셀의 정렬. `start`(기본) / `center` / `end`                            |
| `label` | 머리글이 글자가 아닐 때 너비 핸들 이름("{label} 열 너비")에 쓰는 열 이름        |

- `cell`, `header` 에 함수를 주면 컴포넌트로 그립니다. 안에서 훅을 써도 됩니다.
- 타입은 `DataTable.ColumnDef<Member>`, `DataTable.Features` 로 가져옵니다.
- 열 정의에 함수가 있으면 Server Component 에서 넘길 수 없습니다. 열 정의와 DataTable 은 클라이언트 컴포넌트에 둡니다.

## 정렬

```tsx
<DataTable columns={columns} data={data} />                             // 기본. 모든 열 정렬 가능
<DataTable defaultSorting={[{ id: 'score', desc: true }]} />            // 처음 정렬
<DataTable sorting={sorting} onSortingChange={setSorting} />            // 제어
<DataTable enableSorting={false} />                                     // 끄기
<DataTable enableMultiSort={false} enableSortingRemoval={false} />      // TanStack 옵션 그대로
```

| 입력                 | 동작                                                    |
| -------------------- | ------------------------------------------------------- |
| 머리글 버튼 누르기   | 한 방향 → 반대 방향 → 정렬 없음                         |
| `Enter` `Space`      | 머리글 버튼에서 누르기와 같다                           |
| `Shift` + 누르기     | 지금 정렬에 이 열을 덧붙인다(여러 열 정렬)              |

- 글자 열은 오름차순, 숫자 열은 내림차순부터 시작합니다(TanStack 기본값). 열의 `sortDescFirst` 로 바꿉니다.
- 정렬된 열의 `th` 에만 `aria-sort="ascending"` / `"descending"` 이 붙습니다. APG 정렬 표 예제와 같습니다.
- 아이콘은 정렬 없음 `ChevronUpDown`, 오름차순 `ArrowUp`, 내림차순 `ArrowDown` 이고 `aria-hidden` 입니다.
- 서버가 정렬하면 `manualSorting` 을 줍니다. DataTable 은 받은 순서를 그대로 그립니다.

## 행 선택

```tsx
<DataTable enableRowSelection getRowLabel={(member) => member.name} />
<DataTable enableRowSelection={(row) => row.original.active} />         // 고를 수 없는 행은 체크박스가 꺼진다
<DataTable rowSelection={selection} onRowSelectionChange={setSelection} />
<DataTable enableRowSelection enableMultiRowSelection={false} />        // 하나만
```

- 켜면 맨 앞에 체크박스 열이 붙습니다. 이 열은 정렬하지 않고 너비를 조절하지 않습니다.
- 머리글 체크박스는 모든 행(모든 페이지)을 고르고 풉니다. 일부만 골랐으면 `indeterminate` 입니다.
- `Shift` 를 누른 채 체크박스를 누르면 마지막으로 누른 행부터 그 행까지 같은 값으로 바꿉니다.
- 체크박스 이름은 `getRowLabel` 이 있으면 "{label} 선택", 없으면 "{n}번째 행 선택" 입니다.
- 선택된 행은 `Table.Row selected` 로 `muted-hover` 가 깔리고 `data-selected` 가 붙습니다.
- 표 아래 "{n}개 선택됨" 이 `aria-live="polite"` 로 바뀐 수를 알립니다.
- 값은 `{ [rowId]: true }` 입니다. 지운 행의 id 는 스스로 빠지지 않으니 데이터에서 행을 지울 때 선택에서도 뺍니다.

## 페이지

```tsx
<DataTable enablePagination />                                            // 10행씩
<DataTable enablePagination defaultPagination={{ pageIndex: 0, pageSize: 20 }} />
<DataTable enablePagination pagination={page} onPaginationChange={setPage} />

<DataTable                                                                // 서버가 자른다
  data={pageRows}
  enablePagination
  manualPagination
  rowCount={total}
  pagination={page}
  onPaginationChange={setPage}
/>
```

- 켜면 표 아래에 첫 페이지, 이전, "1 / 5 페이지", 다음, 마지막 페이지 버튼이 붙습니다. 버튼은 ghost `IconButton` 입니다.
- 끝에 닿은 버튼은 `aria-disabled` 로 꺼지고 포커스를 잃지 않습니다(`focusableWhenDisabled`).
- 페이지 글자는 `aria-live="polite"` 라 바뀐 페이지를 읽습니다. 버튼 묶음은 이름 "페이지 이동" 인 `<nav>` 입니다.
- 데이터나 정렬이 바뀌면 TanStack 이 첫 페이지로 돌아갑니다(`autoResetPageIndex`). `manualPagination` 이면 돌아가지 않습니다.
- 이 바닥글은 임시입니다. Pagination 컴포넌트가 나오면 그것으로 바꿀 수 있고, 그때도 `pagination` 과 `onPaginationChange` 는 그대로입니다.

## 열 너비

```tsx
<DataTable enableColumnResizing />
```

| 입력                     | 동작                                  |
| ------------------------ | ------------------------------------- |
| 핸들 끌기(마우스, 터치)  | 끄는 동안 너비가 바뀐다               |
| `←` `→`                  | 16px 줄이고 늘린다(RTL 이면 뒤집힌다) |
| `Shift` + `←` `→`        | 64px                                  |
| `Home` `End`             | 최소, 최대 너비                       |
| `Enter`, 두 번 누르기    | 처음 너비로                           |

- 머리글 끝의 핸들은 `role="separator"` + `aria-orientation="vertical"`, 이름은 "{열} 열 너비", 값은 `aria-valuenow` `aria-valuemin` `aria-valuemax`(px)입니다. Tab 으로 갑니다.
- 기본 너비는 150px, 최소 48px, 최대 960px 입니다. 열의 `size`, `minSize`, `maxSize` 로 바꿉니다.
- 켜면 표가 `layout="fixed"` 가 되고 `<colgroup>` 이 열 너비를 정합니다. 열 합이 상자보다 좁으면 남는 폭을 나눠 채우고, 넓으면 가로로 스크롤합니다.
- 끄는 동안 핸들에 `data-resizing` 이 붙고 선이 `handle-active` 가 됩니다.

## 빈 상태와 로딩

```tsx
<DataTable data={[]} />                                   // "데이터가 없습니다."
<DataTable data={[]} empty="아직 멤버가 없습니다." />      // 문구 바꾸기
<DataTable data={[]} empty={<Empty>...</Empty>} />        // Empty 컴포넌트가 나오면 그대로 넣는다
<DataTable loading />                                     // aria-busy, Spinner
```

- 행이 없으면 모든 열을 가로지르는 한 칸짜리 행에 `empty` 를 그립니다.
- `loading` 이면 `<table>` 에 `aria-busy="true"` 가 붙습니다. 행이 없으면 그 칸에, 있으면 표 위에 반투명 막과 Spinner 를 겹치고 표를 누를 수 없게 합니다.
- Spinner 는 나타나고 잠시 뒤 "불러오는 중" 을 한 번 알립니다.

## 속성

| 속성                                               | 기본 / 동작                                         |
| -------------------------------------------------- | --------------------------------------------------- |
| `columns`, `data`                                  | 필수. TanStack 과 같다                              |
| `getRowId`                                         | 행 id. 선택과 React key 에 쓴다                     |
| `getRowLabel`                                      | 행 체크박스 이름                                    |
| `variant`, `size`, `striped`, `highlightOnHover`, `stickyHeader` | `Table` 과 같다                       |
| `caption`                                          | `Table.Caption`                                     |
| `id`, `aria-label`, `aria-labelledby`, `aria-describedby` | `<table>`                                    |
| `enableSorting`, `enableMultiSort`, `enableSortingRemoval`, `manualSorting` | 정렬(기본 켜짐)            |
| `sorting`, `defaultSorting`, `onSortingChange`     | 정렬 상태                                           |
| `enableRowSelection`, `enableMultiRowSelection`    | 선택(기본 꺼짐)                                     |
| `rowSelection`, `defaultRowSelection`, `onRowSelectionChange` | 선택 상태                                |
| `enablePagination`, `manualPagination`, `rowCount` | 페이지(기본 꺼짐)                                   |
| `pagination`, `defaultPagination`, `onPaginationChange` | 페이지 상태(기본 `{ pageIndex: 0, pageSize: 10 }`) |
| `enableColumnResizing`                             | 열 너비(기본 꺼짐)                                  |
| `loading`, `empty`                                 | 로딩과 빈 상태                                      |
| `className`, `style`                               | 표와 바닥글을 감싼 바깥 `div`                       |

- 콜백은 TanStack 의 updater 가 아니라 새 값을 받습니다. `useState` 의 setter 를 그대로 넘겨도 됩니다.
- 값(`sorting` 등)을 주면 제어, `default*` 만 주면 비제어입니다. 제어일 때는 콜백에서 값을 다시 써야 화면이 바뀝니다.

## data 속성

| 속성                                   | 붙는 곳           |
| -------------------------------------- | ----------------- |
| `data-data-table`, `data-loading`      | 바깥 `div`        |
| `data-sorted`                          | 정렬된 열의 `th`  |
| `data-data-table-sort`                 | 정렬 버튼         |
| `data-data-table-resizer`, `data-resizing` | 너비 핸들     |
| `data-data-table-message`              | 빈 상태, 로딩 칸  |
| `data-data-table-loading`              | 로딩 막           |
| `data-data-table-footer`, `-summary`, `-page` | 바닥글     |

- 표 자체의 속성(`data-table`, `data-selected` 등)은 `Table` README 에 있습니다.

## 알아둘 것

- 필터, 열 숨기기, 열 고정, 행 펼치기, 가상화는 아직 없습니다. 필요하면 `Table` 파트로 TanStack 표를 직접 그립니다.
- 열 정의의 `footer` 는 그리지 않습니다.
