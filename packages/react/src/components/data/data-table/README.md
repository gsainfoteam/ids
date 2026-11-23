# DataTable

정렬, 행 선택, 페이지, 열 너비 조절, 빈 상태와 로딩을 갖춘 데이터 표입니다. 로직은 [TanStack Table v9](https://tanstack.com/table)(`@tanstack/react-table`)이 맡고, 모양은 IDS `Table` 파트가 그립니다.

- **hook 하나, 표 하나.** `useDataTable()` 이 열, 데이터와 기능을 받아 TanStack 표를 만들고, `<DataTable table={table}>` 이 그 표를 그립니다.
- **기능은 객체를 줄 때만.** `sorting`, `selection`, `pagination`, `columnSizing` 은 객체를 주면 켜집니다. 정렬, 페이지, 열 너비의 상태는 객체 안의 `value` / `defaultValue` / `onValueChange` 입니다.
- **고른 행은 root 의 값.** 고른 행은 다른 입력처럼 `<DataTable value defaultValue onValueChange>` 입니다. 그래서 react-hook-form 과 TanStack Form 의 `Field` 가 따로 연결하지 않아도 묶습니다.
- **TanStack 그대로.** 열 정의와 상태 모양(`SortingState`, `RowSelectionState`, `PaginationState`)이 TanStack 과 같고, hook 이 돌려준 표에서 `getSelectedRowModel()`, `resetRowSelection()` 같은 TanStack 메서드를 바로 씁니다.
- **화면은 part.** `DataTable.Toolbar`, `.Content`, `.Pagination`, `.Caption`, `.Empty` 로 표 위아래 줄과 빈 상태를 고릅니다. 하나도 적지 않으면 기본 배치로 그립니다.
- **접근성.** 정렬 머리글은 ghost `Button` 이고 `th` 에 `aria-sort`, 선택은 이름 있는 체크박스, 너비 핸들은 키보드로 움직이는 `separator`, 로딩은 `aria-busy` 입니다.

```tsx
import { DataTable, useDataTable } from '@gsainfoteam/ids-react';

type Member = { id: string; name: string; email: string; score: number };

const column = DataTable.createColumnHelper<Member>();

const columns = column.columns([
  column.accessor('name', { header: '이름' }),
  column.accessor('email', { header: '이메일', enableSorting: false }),
  column.accessor('score', { header: '점수', meta: { align: 'end' } }),
]);

function Members({ members }: { members: Member[] }) {
  const table = useDataTable({
    columns,
    data: members,
    getRowId: (member) => member.id,
    sorting: {},
  });

  return <DataTable table={table} aria-label="멤버" />;
}
```

- `columns` 와 `data` 는 렌더마다 새로 만들지 않습니다. 모듈 위나 `useMemo`, 상태에 둡니다. 새 배열이 오면 TanStack 이 모든 행을 다시 계산합니다.
- `getRowId` 를 주면 선택 상태의 키가 행 번호 대신 그 id 가 됩니다. 정렬이나 페이지가 바뀌어도 선택이 행을 따라갑니다.
- hook 은 클라이언트 컴포넌트에서 부릅니다. 열 정의에 함수가 있으면 Server Component 에서 넘길 수 없습니다.

## useDataTable

```tsx
const table = useDataTable({
  columns,
  data,
  getRowId: (row) => row.id,
  getRowLabel: (row) => row.name,
  sorting: { multiple: true, defaultValue: [{ id: 'name', desc: false }] },
  selection: { multiple: true },
  pagination: { manual: true, rowCount, defaultValue: { pageIndex: 0, pageSize: 20 } },
  columnSizing: {},
});

<DataTable table={table} value={selected} onValueChange={setSelected} />;
```

| 옵션           | 켜면                                   | 객체 안                                                        |
| -------------- | -------------------------------------- | -------------------------------------------------------------- |
| `columns`, `data` | 필수. TanStack 과 같다              |                                                                |
| `getRowId`     | 행 id. 선택과 React key 에 쓴다        |                                                                |
| `getRowLabel`  | 행 체크박스 이름                       |                                                                |
| `sorting`      | 머리글을 눌러 정렬                     | `multiple`, `removable`, `manual`, 값 trio(`SortingState`)      |
| `selection`    | 맨 앞 체크박스 열, 고른 수             | `multiple`, `enabled(row)`. 값은 root 의 `value` trio          |
| `pagination`   | 아래 줄 페이지 이동(10행씩)            | `manual`, `rowCount`, 값 trio(`PaginationState`)                |
| `columnSizing` | 머리글 끝 너비 핸들                    | 값 trio(`ColumnSizingState`)                                    |

- 콜백은 TanStack 의 updater 가 아니라 새 값을 받습니다. `useState` 의 setter 를 그대로 넘겨도 됩니다.
- `value` 를 주면 제어, `defaultValue` 만 주면 비제어입니다. 제어일 때는 콜백에서 값을 다시 써야 화면이 바뀝니다.
- 고른 행만 root 에 두는 까닭: 폼에 들어가는 값은 고른 행뿐입니다. 폼 라이브러리의 `Field` 는 자식 요소에 `value` 와 `onValueChange` 를 넣어 묶는데, hook 안의 값에는 넣을 곳이 없습니다. 정렬, 페이지, 너비는 화면 상태라 hook 에 둡니다.
- 돌려받은 `table` 은 TanStack 표(`DataTable.Instance<Member>`)입니다. 표 바깥의 버튼에서 `table.getSelectedRowModel().rows` 를 읽거나 `table.resetRowSelection()` 을 부릅니다.

## Part

```tsx
<DataTable table={table} aria-label="멤버" />            // Content 와, 선택이나 페이지가 켜져 있으면 아래 Toolbar

<DataTable table={table} aria-label="멤버">
  <DataTable.Toolbar>                                     // 고른 수는 앞, 앱의 버튼은 줄 끝
    <Button variant="soft">내보내기</Button>
  </DataTable.Toolbar>
  <DataTable.Content />
  <DataTable.Pagination />
  <DataTable.Caption>3월 활동 점수</DataTable.Caption>
  <DataTable.Empty>아직 멤버가 없습니다.</DataTable.Empty>
</DataTable>
```

| Part                  | 그리는 것                                                                      |
| --------------------- | ------------------------------------------------------------------------------ |
| `DataTable.Toolbar`   | 표 위나 아래의 줄. 선택이 켜져 있으면 "{n}개 선택됨" 을 앞에 적고, children 은 자기 묶음에 넣어 줄 끝에 둔다 |
| `DataTable.Content`   | 표 카드(머리글, 행, 로딩 막)                                                   |
| `DataTable.Pagination`| 페이지 이동. Toolbar 안이면 줄 끝에, 바깥이면 자기 줄에                        |
| `DataTable.Caption`   | `Table.Caption`. 표 아래 `<caption>` 이고 표의 이름이 된다                      |
| `DataTable.Empty`     | 행이 없을 때의 칸 내용. 기본 "데이터가 없습니다."                              |

- `Toolbar`, `Content`, `Pagination` 은 적은 순서대로 그립니다. 하나라도 적으면 기본 배치는 그리지 않으니 `Content` 도 적습니다.
- `Caption` 과 `Empty` 는 어디에 적어도 표 안에 들어갑니다.
- 머리글은 늘 `sticky` 입니다. 부모가 높이를 정하면 행만 스크롤되고 머리글은 위에 남습니다.

## 크기

```tsx
<div className="h-96 max-w-2xl">          // 크기와 자리는 감싼 요소가 정한다
  <DataTable table={table} aria-label="멤버" />
</div>
```

- 너비: 부모의 너비를 채웁니다. 열이 넘치면 표 안에서 가로로 스크롤됩니다.
- 높이: 행 수만큼 자라되, 부모가 높이를 정하면(`h-96`, flex 나 grid 칸) 그 높이를 넘지 않습니다. 행이 넘치면 표 안에서 세로로 스크롤되고 Toolbar 는 줄어들지 않습니다.
- DataTable 과 Part 에는 `className`, `style` 을 주지 않습니다. 바깥 여백은 부모의 `gap` 으로 띄웁니다.
- Toolbar 에 넣는 버튼도 클래스 없이 둡니다. Toolbar 가 줄 끝에 모아 둡니다.

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

## 정렬

```tsx
useDataTable({ columns, data, sorting: {} });                                       // 켜기
useDataTable({ columns, data, sorting: { defaultValue: [{ id: 'score', desc: true }] } });
useDataTable({ columns, data, sorting: { value: sorting, onValueChange: setSorting } });
useDataTable({ columns, data, sorting: { multiple: false, removable: false } });   // 한 열만, 풀지 않음
```

| 입력                 | 동작                                                    |
| -------------------- | ------------------------------------------------------- |
| 머리글 버튼 누르기   | 한 방향 → 반대 방향 → 정렬 없음                         |
| `Enter` `Space`      | 머리글 버튼에서 누르기와 같다                           |
| `Shift` + 누르기     | 지금 정렬에 이 열을 덧붙인다(여러 열 정렬)              |

- `sorting` 을 주지 않으면 머리글은 글자이고 버튼이 없습니다.
- 글자 열은 오름차순, 숫자 열은 내림차순부터 시작합니다(TanStack 기본값). 열의 `sortDescFirst` 로 바꿉니다.
- 정렬된 열의 `th` 에만 `aria-sort="ascending"` / `"descending"` 이 붙습니다. APG 정렬 표 예제와 같습니다.
- 아이콘은 머리글 칸 끝에 붙습니다. 정렬 없음 `ChevronUpDown` 은 버튼에 올리거나 포커스할 때만 보이고, 오름차순 `ChevronUp` 과 내림차순 `ChevronDown` 은 `text-primary` 로 늘 보입니다. 모두 `aria-hidden` 입니다.
- `align: 'end'` 열은 글자가 끝에, 아이콘이 칸 앞에 옵니다.
- 서버가 정렬하면 `manual: true` 를 줍니다. DataTable 은 받은 순서를 그대로 그립니다.

## 행 선택

```tsx
useDataTable({ columns, data, getRowLabel: (member) => member.name, selection: {} });
useDataTable({ columns, data, selection: { enabled: (row) => row.original.active } }); // 고를 수 없는 행은 체크박스가 꺼진다
useDataTable({ columns, data, selection: { multiple: false } });                        // 하나만

<DataTable table={table} defaultValue={{ m2: true }} />                                   // 처음 고른 행
<DataTable table={table} value={selection} onValueChange={setSelection} />              // 제어

<Field name="invitees" controlMode="value">                                             // react-hook-form
  <Field.Label>초대할 멤버</Field.Label>
  <DataTable table={table} />
</Field>
```

- 켜면 맨 앞에 체크박스 열이 붙습니다. 이 열은 정렬하지 않고 너비를 조절하지 않습니다.
- 머리글 체크박스는 모든 행(모든 페이지)을 고르고 풉니다. 일부만 골랐으면 `indeterminate` 입니다.
- `Shift` 를 누른 채 체크박스를 누르면 마지막으로 누른 행부터 그 행까지 같은 값으로 바꿉니다.
- 체크박스 이름은 `getRowLabel` 이 있으면 "{label} 선택", 없으면 "{n}번째 행 선택" 입니다.
- 선택된 행은 `bg-primary-soft` 가 깔립니다.
- `DataTable.Toolbar` 의 "{n}개 선택됨" 이 `aria-live="polite"` 로 바뀐 수를 알립니다.
- 값은 `{ [rowId]: true }` 이고 root 의 `value` / `defaultValue` / `onValueChange` 가 가집니다. `table.getSelectedRowModel()` 과 `table.resetRowSelection()` 도 같은 값을 읽고 씁니다.
- 지운 행의 id 는 스스로 빠지지 않으니 데이터에서 행을 지울 때 선택에서도 뺍니다.

## 페이지

```tsx
useDataTable({ columns, data, pagination: {} });                                              // 10행씩
useDataTable({ columns, data, pagination: { defaultValue: { pageIndex: 0, pageSize: 20 } } });

useDataTable({                                                                                // 서버가 자른다
  columns,
  data: pageRows,
  pagination: { manual: true, rowCount: total, value: page, onValueChange: setPage },
});
```

- 켜면 아래 Toolbar 에 IDS `Pagination` 이 붙습니다. 첫 페이지(`Pagination.First`), 이전, "1 / 5 페이지", 다음, 마지막 페이지(`Pagination.Last`) 순서이고, 버튼은 ghost `IconButton` 입니다.
- 끝에 닿은 버튼은 `aria-disabled` 로 꺼지고 포커스를 잃지 않습니다(`focusableWhenDisabled`).
- 페이지 글자는 `aria-live="polite"` 라 바뀐 페이지를 읽습니다. 버튼 묶음은 이름 "페이지 탐색" 인 `<nav>` 입니다.
- 키보드는 Pagination 과 같습니다. 버튼에서 `←` `→` 는 이전, 다음 페이지, `Home` `End` 는 첫, 마지막 페이지입니다.
- 데이터나 정렬이 바뀌면 TanStack 이 첫 페이지로 돌아갑니다(`autoResetPageIndex`). `manual` 이면 돌아가지 않습니다.

## 열 너비

```tsx
useDataTable({ columns, data, columnSizing: {} });
useDataTable({ columns, data, columnSizing: { value: widths, onValueChange: setWidths } }); // 너비를 저장한다
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
- 핸들의 선은 쉴 때 투명하고, 올리거나 포커스하거나 끄는 동안 `text-neutral` 색(`bg-(--ids-color-text-neutral)`)입니다.

## 빈 상태와 로딩

```tsx
<DataTable table={table} />                                         // 행이 없으면 "데이터가 없습니다."
<DataTable table={table}>
  <DataTable.Empty>아직 멤버가 없습니다.</DataTable.Empty>          // 문구 바꾸기
</DataTable>
<DataTable table={table}>
  <DataTable.Empty><Empty>...</Empty></DataTable.Empty>             // Empty 컴포넌트를 그대로 넣는다
</DataTable>
<DataTable table={table} aria-busy={loading} />                     // Spinner
```

- 행이 없으면 모든 열을 가로지르는 한 칸짜리 행에 `DataTable.Empty` 를 그립니다.
- `aria-busy` 는 `<table>` 에 그대로 붙습니다. 행이 없으면 그 칸에, 있으면 표 위에 반투명 막과 Spinner 를 겹치고 표를 누를 수 없게 합니다.
- Spinner 는 나타나고 잠시 뒤 "불러오는 중" 을 한 번 알립니다.


## 모양

```tsx
<DataTable table={table} variant="outline" />   // 기본. 트레이 위의 카드, 열 사이 세로선
<DataTable table={table} variant="striped" />   // outline 에 짝수 행 bg-block 줄무늬
<DataTable table={table} variant="ghost" />     // 트레이와 세로선 없이 Table ghost 그대로
```

- `outline` 과 `striped` 의 바깥 `div` 는 `concentric-p-1 bg-neutral-soft` 트레이입니다. 표 카드는 `rounded-standard`(10px) 라 트레이 모서리는 14px 이 됩니다.
- 표 카드는 `bg-surface`, `border-neutral` 테두리와 `shadow-xs` 이고, 열 사이에 `border-neutral` 세로선이 들어갑니다.
- 머리글 행은 트레이(`bg-neutral-soft`, 4단계)와 카드(`bg-surface`, 2단계) 사이인 `bg-block`(3단계) 입니다. 트레이와 같은 색이면 다크 모드에서 머리글이 트레이에 묻힙니다.
- `striped` 의 줄무늬(`bg-block`)는 DataTable 이 직접 그립니다. 고른 행은 줄무늬 대신 `bg-primary-soft` 입니다.
- 행에 올리면 늘 글자색 state layer(`hover:state-hover`)가 깔립니다.
- Toolbar 는 트레이 안쪽의 줄입니다. 페이지 버튼과 정렬 버튼의 hover 와 press 는 글자색 state layer 라 트레이와 머리글 위에서도 따로 맞추지 않아도 보입니다.
- Toolbar 가 없으면(선택과 페이지가 모두 꺼짐) 트레이는 표 둘레 4px 테두리로만 보입니다.

머리글에 아이콘을 넣으려면 `header` 에 아이콘과 글자를 함께 줍니다. 머리글 내용은 `gap-1.5` 의 가로 줄로 감싸지고, 그 줄의 직계 자식 svg 는 16px 입니다. 선택 열의 Checkbox 안 svg 는 Checkbox 가 크기를 정합니다.

```tsx
column.accessor('name', {
  header: () => (
    <>
      <UserIcon />
      이름
    </>
  ),
  meta: { label: '이름' },   // 너비 핸들 이름에 쓴다
});
```

## 속성

| 속성                                                     | 기본 / 동작                                    |
| -------------------------------------------------------- | ---------------------------------------------- |
| `table`                                                  | 필수. `useDataTable()` 이 돌려준 표            |
| `variant`                                                | `outline`(기본) / `striped` / `ghost`          |
| `size`                                                   | `standard`(기본) / `tiny`                      |
| `value`, `defaultValue`, `onValueChange`                 | 고른 행(`RowSelectionState`). `selection` 을 켤 때 |
| `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-busy` | `<table>`                        |
| `children`                                               | Part                                           |

## 상태

표의 상태는 DOM 이 아니라 값으로 읽습니다. `data-*` 속성은 IDS 가 스타일에 쓰는 내부 표시라 약속하지 않습니다.

| 상태          | 읽는 곳                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| 정렬          | `useDataTable({ sorting: { value, onValueChange } })`, `table.state.sorting`, `column.getIsSorted()` |
| 고른 행       | root 의 `value` / `onValueChange`, `table.getSelectedRowModel()`, `row.getIsSelected()`  |
| 페이지        | `useDataTable({ pagination: { value, onValueChange } })`, `table.state.pagination`, `table.getPageCount()` |
| 열 너비       | `useDataTable({ columnSizing: { value, onValueChange } })`, `column.getSize()`, `column.getIsResizing()` |
| 로딩          | 앱이 넘기는 `aria-busy`                                                                  |
| 모양          | 앱이 넘기는 `variant`, `size`                                                            |

- 표 바깥의 버튼이나 글자는 위 값을 읽어 그립니다. 예: `{table.getSelectedRowModel().rows.length}명 내보내기`.

## 알아둘 것

- 필터, 열 숨기기, 열 고정, 행 펼치기, 가상화는 아직 없습니다. 필요하면 `Table` 파트로 TanStack 표를 직접 그립니다.
- 열 정의의 `footer` 는 그리지 않습니다.
- DataTable 은 체크, 고른 행의 색, 고른 수를 root 의 `value` 와 `defaultValue` 로 그려서 서버 HTML 에도 나옵니다. hook 의 표(`table.getSelectedRowModel()`, `row.getIsSelected()`)는 첫 렌더 뒤 layout effect 에서 같은 값을 받으니, 첫 렌더에 고른 행이 필요하면 root 에 넘긴 값을 읽습니다.
- 선택을 켠 `table` 은 DataTable 하나에만 줍니다. 두 root 가 같은 표의 선택을 나눠 가지지 못합니다.
